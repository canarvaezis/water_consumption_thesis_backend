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

// Categorías válidas de personalización
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
    const activeItemId = customization ? customization[category] : null;

    return items.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      assetUrl: item.assetUrl || item.asset_url,
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

    // Aplicar el item a la personalización
    const customization = await UserCustomizationModel.updatePart(userId, category, storeItemId);

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
        assetUrl: item.assetUrl,
      },
    };
  }

  /**
   * Obtener personalización actual del usuario
   */
  static async getCurrentCustomization(userId) {
    const customization = await UserCustomizationModel.findByUserId(userId);
    
    if (!customization) {
      // Retornar personalización vacía
      return {
        skinColor: null,
        faceShape: null,
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
    
    for (const [key, category] of Object.entries(CUSTOMIZATION_CATEGORIES)) {
      const itemId = customization[category];
      if (itemId) {
        const item = await StoreItemModel.findById(itemId);
        if (item) {
          activeItems[category] = {
            id: item.id,
            name: item.name,
            assetUrl: item.assetUrl || item.asset_url,
            category: item.category,
          };
        }
      } else {
        activeItems[category] = null;
      }
    }

    return {
      ...customization,
      activeItems,
    };
  }

  /**
   * Aplicar múltiples items de personalización a la vez
   */
  static async applyMultipleItems(userId, items) {
    // items es un objeto: { skinColor: "itemId", eyes: "itemId", ... }
    const customization = await UserCustomizationModel.upsert(userId, items);

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
          price: item.price || 0,
          purchasedAt: invItem.purchasedAt,
        };
      })
    );

    return items.filter(item => item !== null);
  }
}
