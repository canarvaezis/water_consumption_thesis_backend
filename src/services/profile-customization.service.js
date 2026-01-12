/**
 * Servicio de Personalización de Perfil
 * 
 * Lógica de negocio para gestionar la personalización del avatar del usuario
 * Nuevo sistema: color de piel, forma de cara, ojos, nariz, boca, orejas, pelo y alias
 */

import { StoreItemModel } from '../models/store-item.model.js';
import { InventoryModel } from '../models/inventory.model.js';
import { UserModel } from '../models/user.model.js';
import { UserCustomizationModel } from '../models/user-customization.model.js';
import { PointsService } from './points.service.js';

// Categorías válidas de personalización (snake_case para API)
export const CUSTOMIZATION_CATEGORIES = {
  SKIN_COLOR: 'skin_color',
  FACE_SHAPE: 'face_shape',
  EYES: 'eyes',
  NOSE: 'nose',
  MOUTH: 'mouth',
  EARS: 'ears',
  HAIR: 'hair',
  ALIAS: 'alias',
};

// Mapeo de categorías snake_case a camelCase (para el modelo de DB)
const CATEGORY_TO_DB_FIELD = {
  'skin_color': 'skinColor',
  'face_shape': 'faceShape',
  'eyes': 'eyes',
  'nose': 'nose',
  'mouth': 'mouth',
  'ears': 'ears',
  'hair': 'hair',
  'alias': 'alias',
};

/**
 * Convertir categoría de snake_case a camelCase para el modelo de DB
 */
const categoryToDbField = (category) => {
  return CATEGORY_TO_DB_FIELD[category] || category;
};

export class ProfileCustomizationService {
  /**
   * Obtener items disponibles por categoría
   * @param {string} userId - ID del usuario
   * @param {string} category - Categoría de personalización
   */
  static async getItemsByCategory(userId, category) {
    // Validar categoría
    if (!Object.values(CUSTOMIZATION_CATEGORIES).includes(category)) {
      throw new Error(`Categoría inválida: ${category}`);
    }

    // Obtener items de la categoría
    const items = await StoreItemModel.findByCategory(category, { activeOnly: true });

    // Obtener inventario del usuario
    const inventory = await InventoryModel.getInventoryByUserId(userId);
    const ownedItemIds = new Set(inventory.map(item => item.storeItemId));

    // Obtener personalización actual
    const customization = await UserCustomizationModel.findByUserId(userId);
    // Convertir categoría snake_case a camelCase para buscar en DB
    const dbField = categoryToDbField(category);
    const activeItemId = customization ? customization[dbField] : null;

    return items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      assetUrl: item.assetUrl || item.asset_url,
      svgContent: item.svgContent || null,
      colorValue: item.colorValue || null,
      price: item.price || 0,
      default: item.default || false,
      category: item.category,
      owned: item.default || false || ownedItemIds.has(item.id),
      active: activeItemId === item.id, // Si está activo actualmente
    }));
  }

  /**
   * Obtener todas las categorías de personalización con sus items
   */
  static async getAllCustomizationItems(userId) {
    const categories = {};
    
    for (const [key, category] of Object.entries(CUSTOMIZATION_CATEGORIES)) {
      categories[category] = await this.getItemsByCategory(userId, category);
    }

    return categories;
  }

  /**
   * Aplicar un item de personalización
   * @param {string} userId - ID del usuario
   * @param {string} category - Categoría de personalización
   * @param {string} storeItemId - ID del item a aplicar
   */
  static async applyItem(userId, category, storeItemId) {
    // Validar categoría
    if (!Object.values(CUSTOMIZATION_CATEGORIES).includes(category)) {
      throw new Error(`Categoría inválida: ${category}`);
    }

    // Verificar que el item existe
    const item = await StoreItemModel.findById(storeItemId);
    if (!item) {
      throw new Error('Item no encontrado');
    }

    // Verificar que el item pertenece a la categoría
    if (item.category !== category) {
      throw new Error(`El item no pertenece a la categoría ${category}`);
    }

    // Verificar que el item está activo
    if (!item.active) {
      throw new Error('Este item no está disponible');
    }

    // Verificar que el usuario tiene el item o es un item por defecto
    if (!item.default) {
      const hasItem = await InventoryModel.hasItem(userId, storeItemId);
      if (!hasItem) {
        throw new Error('No tienes este item en tu inventario');
      }
    }

    // Convertir categoría de snake_case a camelCase para el modelo de DB
    const dbField = categoryToDbField(category);
    
    // Aplicar el item a la personalización
    const customization = await UserCustomizationModel.updatePart(userId, dbField, storeItemId);

    // Si es la primera vez que se configura un alias, otorgar puntos
    if (category === CUSTOMIZATION_CATEGORIES.ALIAS) {
      const user = await UserModel.findById(userId);
      if (!user.nickname) {
        // Es la primera vez que se configura un alias
        await PointsService.awardNicknameSetPoints(userId);
        // Actualizar también el nickname en el usuario
        await UserModel.update(userId, { nickname: item.name });
      } else {
        // Solo actualizar el nickname
        await UserModel.update(userId, { nickname: item.name });
      }
    }

    return {
      customization,
      item: {
        id: item.id,
        name: item.name,
        category: item.category,
        assetUrl: item.assetUrl || item.asset_url,
        svgContent: item.svgContent || null,
        colorValue: item.colorValue || null,
      },
    };
  }

  /**
   * Obtener personalización actual del usuario
   */
  static async getCurrentCustomization(userId) {
    const customization = await UserCustomizationModel.findByUserId(userId);
    
    if (!customization) {
      // Retornar personalización vacía en formato snake_case (API)
      return {
        skin_color: null,
        face_shape: null,
        eyes: null,
        nose: null,
        mouth: null,
        ears: null,
        hair: null,
        alias: null,
      };
    }

    // Enriquecer con detalles de los items activos
    const activeItems = {};
    
    // Mapeo inverso: camelCase (DB) -> snake_case (API)
    const DB_FIELD_TO_CATEGORY = {
      'skinColor': 'skin_color',
      'faceShape': 'face_shape',
      'eyes': 'eyes',
      'nose': 'nose',
      'mouth': 'mouth',
      'ears': 'ears',
      'hair': 'hair',
      'alias': 'alias',
    };
    
    // Obtener inventario para verificar owned
    const inventory = await InventoryModel.getInventoryByUserId(userId);
    const ownedItemIds = new Set(inventory.map(item => item.storeItemId));
    
    for (const [dbField, category] of Object.entries(DB_FIELD_TO_CATEGORY)) {
      const itemId = customization[dbField];
      if (itemId) {
        const item = await StoreItemModel.findById(itemId);
        if (item) {
          activeItems[category] = {
            id: item.id,
            name: item.name,
            assetUrl: item.assetUrl || item.asset_url,
            svgContent: item.svgContent || null,
            colorValue: item.colorValue || null,
            category: item.category,
            default: item.default || false,
            owned: item.default || false || ownedItemIds.has(item.id),
          };
        }
      } else {
        activeItems[category] = null;
      }
    }

    // Convertir campos de DB (camelCase) a formato API (snake_case)
    return {
      skin_color: customization.skinColor || null,
      face_shape: customization.faceShape || null,
      eyes: customization.eyes || null,
      nose: customization.nose || null,
      mouth: customization.mouth || null,
      ears: customization.ears || null,
      hair: customization.hair || null,
      alias: customization.alias || null,
      activeItems,
    };
  }

  /**
   * Aplicar múltiples items de personalización a la vez
   * @param {string} userId - ID del usuario
   * @param {object} items - Objeto con categorías en snake_case: { skin_color: "itemId", face_shape: "itemId", ... }
   */
  static async applyMultipleItems(userId, items) {
    // Convertir categorías de snake_case a camelCase para el modelo de DB
    const dbItems = {};
    for (const [category, itemId] of Object.entries(items)) {
      const dbField = categoryToDbField(category);
      dbItems[dbField] = itemId;
    }
    
    const customization = await UserCustomizationModel.upsert(userId, dbItems);

    // Actualizar alias en UserModel si se proporciona
    if (items.alias) {
      const aliasItem = await StoreItemModel.findById(items.alias);
      if (aliasItem) {
        await UserModel.update(userId, { nickname: aliasItem.name });
      }
    }

    return customization;
  }

  /**
   * Obtener inventario del usuario filtrado por categoría
   */
  static async getInventoryByCategory(userId, category) {
    const inventory = await InventoryModel.getInventoryByUserId(userId);
    
    // Obtener detalles de los items
    const items = await Promise.all(
      inventory.map(async (invItem) => {
        const item = await StoreItemModel.findById(invItem.storeItemId);
        if (!item || item.category !== category) return null;
        
        return {
          inventoryId: invItem.id,
          storeItemId: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          assetUrl: item.assetUrl || item.asset_url,
          svgContent: item.svgContent || null,
          colorValue: item.colorValue || null,
          price: item.price || 0,
          purchasedAt: invItem.purchasedAt,
        };
      })
    );

    return items.filter(item => item !== null);
  }

  /**
   * Obtener nicknames disponibles (método de compatibilidad)
   * @param {string} userId - ID del usuario
   */
  static async getAvailableNicknames(userId) {
    return await this.getItemsByCategory(userId, CUSTOMIZATION_CATEGORIES.ALIAS);
  }

  /**
   * Obtener avatares disponibles (método de compatibilidad - deprecated)
   * @param {string} userId - ID del usuario
   */
  static async getAvailableAvatars(userId) {
    // Retornar todas las categorías de personalización
    return await this.getAllCustomizationItems(userId);
  }

  /**
   * Aplicar nickname (método de compatibilidad)
   * @param {string} userId - ID del usuario
   * @param {string} storeItemId - ID del item de nickname
   */
  static async applyNickname(userId, storeItemId) {
    const result = await this.applyItem(userId, CUSTOMIZATION_CATEGORIES.ALIAS, storeItemId);
    
    // Obtener usuario actualizado
    const user = await UserModel.findById(userId);
    
    return {
      user,
      nickname: result.item,
    };
  }

  /**
   * Aplicar avatar (método de compatibilidad - deprecated)
   * @param {string} userId - ID del usuario
   * @param {string} storeItemId - ID del item de avatar
   */
  static async applyAvatar(userId, storeItemId) {
    // Este método está deprecated, pero mantenemos compatibilidad
    // Intentar aplicar como face_shape por defecto
    try {
      const result = await this.applyItem(userId, CUSTOMIZATION_CATEGORIES.FACE_SHAPE, storeItemId);
      const user = await UserModel.findById(userId);
      return {
        user,
        avatar: result.item,
      };
    } catch (error) {
      // Si falla, puede ser que el item no sea de face_shape
      throw new Error('No se pudo aplicar el avatar. Asegúrate de que el item sea válido.');
    }
  }

  /**
   * Obtener inventario del usuario (método de compatibilidad)
   * @param {string} userId - ID del usuario
   */
  static async getUserInventory(userId) {
    const inventory = await InventoryModel.getInventoryByUserId(userId);
    
    // Obtener detalles de los items
    const items = await Promise.all(
      inventory.map(async (invItem) => {
        const item = await StoreItemModel.findById(invItem.storeItemId);
        if (!item) return null;
        
        return {
          inventoryId: invItem.id,
          storeItemId: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          assetUrl: item.assetUrl || item.asset_url,
          svgContent: item.svgContent || null,
          colorValue: item.colorValue || null,
          price: item.price || 0,
          purchasedAt: invItem.purchasedAt,
        };
      })
    );

    return items.filter(item => item !== null);
  }
}
