/**
 * Modelo de Item de Tienda
 * 
 * Ahora lee de configuración estática (src/config/store-items.js) en lugar de Firestore.
 * Las definiciones de items están en código, pero el inventario y personalizaciones
 * siguen en Firestore.
 * 
 * Estructura del item:
 * {
 *   id: string (ID único del item)
 *   category: string ("skin_color" | "face_shape" | "eyes" | "nose" | "mouth" | "ears" | "hair" | "alias")
 *   name: string
 *   description: string (opcional)
 *   price: number (puntos, 0 si es gratis)
 *   assetUrl: string (URL del asset en Firebase Storage)
 *   default: boolean (si es item por defecto/gratis)
 *   active: boolean (si el item está disponible, true por defecto)
 *   featured: boolean (si es item destacado, false por defecto)
 *   storeItemId: string (alias de id para compatibilidad)
 * }
 */

import { getAllItems, getItemsByCategory, getItemById, VALID_CATEGORIES } from '../config/store-items.js';

/**
 * Mapeo de categorías en inglés a sus nombres en español
 */
const CATEGORY_NAME_MAP = {
  face_shape: 'Forma de Cara',
  eyes: 'Ojos',
  nose: 'Nariz',
  mouth: 'Boca',
  ears: 'Orejas',
  hair: 'Pelo',
  skin_color: 'Color de Piel',
  alias: 'Alias',
};

export class StoreItemModel {
  /**
   * Obtener item por ID
   * @param {string} itemId - ID del item
   * @returns {object|null} Item encontrado o null
   */
  static async findById(itemId) {
    const item = getItemById(itemId);
    if (!item) {
      return null;
    }
    
    // Agregar campos de compatibilidad
    const categoryName = CATEGORY_NAME_MAP[item.category] || item.category;
    
    return {
      id: item.id,
      storeItemId: item.id,
      categoryId: categoryName,
      storeCategoryId: categoryName,
      category: item.category,
      name: item.name,
      description: item.description || null,
      price: item.price || 0,
      assetUrl: item.assetUrl || null,
      asset_url: item.assetUrl || null, // Compatibilidad con código antiguo
      svgContent: item.svgContent || null, // SVG embebido para items que lo requieren
      colorValue: item.colorValue || null, // Para colores de piel (hex/RGB)
      default: item.default || false,
      active: item.active !== undefined ? item.active : true,
      featured: item.featured || false,
      createdAt: null, // Ya no se usa timestamp
      updatedAt: null, // Ya no se usa timestamp
    };
  }

  /**
   * Obtener items por categoría
   * Categorías válidas: "skin_color" | "face_shape" | "eyes" | "nose" | "mouth" | "ears" | "hair" | "alias"
   * @param {string} category - Categoría del item
   * @param {object} options - Opciones de filtrado
   * @param {boolean} options.activeOnly - Solo items activos (default: true)
   * @returns {array} Array de items
   */
  static async findByCategory(category, options = {}) {
    const { activeOnly = true } = options;
    
    if (!VALID_CATEGORIES.includes(category)) {
      return [];
    }
    
    let items = getItemsByCategory(category);
    
    // Filtrar solo activos si se solicita
    if (activeOnly) {
      items = items.filter(item => item.active !== false);
    }
    
    // Ordenar por precio y nombre
    items.sort((a, b) => {
      if (a.price !== b.price) {
        return (a.price || 0) - (b.price || 0);
      }
      return (a.name || '').localeCompare(b.name || '');
    });
    
    // Agregar campos de compatibilidad
    const categoryName = CATEGORY_NAME_MAP[category] || category;
    
    return items.map(item => ({
      id: item.id,
      storeItemId: item.id,
      categoryId: categoryName,
      storeCategoryId: categoryName,
      category: category,
      name: item.name,
      description: item.description || null,
      price: item.price || 0,
      assetUrl: item.assetUrl || null,
      asset_url: item.assetUrl || null, // Compatibilidad
      svgContent: item.svgContent || null, // SVG embebido para items que lo requieren
      colorValue: item.colorValue || null, // Para colores de piel (hex/RGB)
      default: item.default || false,
      active: item.active !== undefined ? item.active : true,
      featured: item.featured || false,
      createdAt: null,
      updatedAt: null,
    }));
  }

  /**
   * Obtener items por categoría antigua (storeCategoryId) - compatibilidad
   * @deprecated Usar findByCategory con el nombre de categoría directamente
   */
  static async findByCategoryId(categoryId) {
    // Intentar buscar por nombre de categoría si categoryId es un nombre válido
    if (VALID_CATEGORIES.includes(categoryId)) {
      return await this.findByCategory(categoryId);
    }
    return [];
  }

  /**
   * Obtener todos los items
   * @param {object} options - Opciones de filtrado
   * @param {boolean} options.activeOnly - Solo items activos (default: true)
   * @param {number} options.limit - Límite de resultados
   * @param {string} options.category - Filtrar por categoría
   * @returns {array} Array de items
   */
  static async findAll(options = {}) {
    const { activeOnly = true, limit = null, category = null } = options;
    
    let items = getAllItems();
    
    // Filtrar por categoría si se especifica
    if (category) {
      items = items.filter(item => item.category === category);
    }
    
    // Filtrar solo activos si se solicita
    if (activeOnly) {
      items = items.filter(item => item.active !== false);
    }
    
    // Ordenar por categoría, precio y nombre
    items.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      if (a.price !== b.price) {
        return (a.price || 0) - (b.price || 0);
      }
      return (a.name || '').localeCompare(b.name || '');
    });
    
    // Aplicar límite si se especifica
    if (limit && limit > 0) {
      items = items.slice(0, limit);
    }
    
    // Agregar campos de compatibilidad
    return items.map(item => {
      const categoryName = CATEGORY_NAME_MAP[item.category] || item.category;
      
      return {
        id: item.id,
        storeItemId: item.id,
        categoryId: categoryName,
        storeCategoryId: categoryName,
        category: item.category,
        name: item.name,
        description: item.description || null,
        price: item.price || 0,
        assetUrl: item.assetUrl || null,
        asset_url: item.assetUrl || null, // Compatibilidad
        svgContent: item.svgContent || null, // SVG embebido para items que lo requieren
        colorValue: item.colorValue || null, // Para colores de piel (hex/RGB)
        default: item.default || false,
        active: item.active !== undefined ? item.active : true,
        featured: item.featured || false,
        createdAt: null,
        updatedAt: null,
      };
    });
  }

  /**
   * Crear un nuevo item de tienda
   * @deprecated Los items ahora se definen en src/config/store-items.js
   * Esta función se mantiene solo para compatibilidad pero no hace nada
   */
  static async create(itemData) {
    throw new Error('Los items de tienda ahora se definen en src/config/store-items.js. No se pueden crear dinámicamente.');
  }

  /**
   * Actualizar item
   * @deprecated Los items ahora se definen en src/config/store-items.js
   * Esta función se mantiene solo para compatibilidad pero no hace nada
   */
  static async update(itemId, updateData) {
    throw new Error('Los items de tienda ahora se definen en src/config/store-items.js. Edita el archivo de configuración para actualizar items.');
  }

  /**
   * Eliminar item
   * @deprecated Los items ahora se definen en src/config/store-items.js
   * Esta función se mantiene solo para compatibilidad pero no hace nada
   */
  static async delete(itemId) {
    throw new Error('Los items de tienda ahora se definen en src/config/store-items.js. Edita el archivo de configuración para eliminar items.');
  }
}

