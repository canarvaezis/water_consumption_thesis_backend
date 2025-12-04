/**
 * Modelo de Item de Tienda para Firestore
 * 
 * Estructura del documento:
 * {
 *   storeItemId: string (auto-generado)
 *   category: string ("skin_color" | "face_shape" | "eyes" | "nose" | "mouth" | "ears" | "hair" | "alias")
 *   name: string
 *   description: string
 *   price: number (puntos, 0 si es gratis)
 *   assetUrl: string (URL del asset en Firebase Storage)
 *   default: boolean (si es item por defecto/gratis)
 *   active: boolean (si el item está disponible, true por defecto)
 *   featured: boolean (si es item destacado, false por defecto)
 *   createdAt: Timestamp
 *   updatedAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

const COLLECTION_NAME = 'Store_item';

export class StoreItemModel {
  /**
   * Crear un nuevo item de tienda
   */
  static async create(itemData) {
    const itemRef = db.collection(COLLECTION_NAME).doc();
    const item = {
      storeItemId: itemRef.id,
      storeCategoryId: itemData.storeCategoryId || null,
      category: itemData.category, // Requerido: "skin_color" | "face_shape" | "eyes" | "nose" | "mouth" | "ears" | "hair" | "alias"
      name: itemData.name,
      description: itemData.description || null,
      price: itemData.price || 0,
      assetUrl: itemData.assetUrl || null,
      default: itemData.default || false,
      active: itemData.active !== undefined ? itemData.active : true,
      featured: itemData.featured || false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await itemRef.set(item);
    return { id: itemRef.id, ...item };
  }

  /**
   * Obtener item por ID
   */
  static async findById(itemId) {
    const itemDoc = await db.collection(COLLECTION_NAME).doc(itemId).get();
    
    if (!itemDoc.exists) {
      return null;
    }
    
    return { id: itemDoc.id, ...itemDoc.data() };
  }

  /**
   * Obtener items por categoría
   * Categorías válidas: "skin_color" | "face_shape" | "eyes" | "nose" | "mouth" | "ears" | "hair" | "alias"
   */
  static async findByCategory(category, options = {}) {
    const { activeOnly = true, includeInactive = false } = options;
    
    let query = db
      .collection(COLLECTION_NAME)
      .where('category', '==', category);
    
    // Filtrar solo activos si se solicita
    if (activeOnly && !includeInactive) {
      query = query.where('active', '==', true);
      // Ordenar por precio y nombre (requiere índice compuesto: category, active, price, name)
      query = query.orderBy('price', 'asc').orderBy('name', 'asc');
    } else {
      // Solo ordenar por precio
      query = query.orderBy('price', 'asc');
    }
    
    const snapshot = await query.get();
    let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Si no se pudo ordenar por nombre en la query, ordenar en memoria
    if (!activeOnly || includeInactive) {
      items.sort((a, b) => {
        if (a.price !== b.price) {
          return (a.price || 0) - (b.price || 0);
        }
        return (a.name || '').localeCompare(b.name || '');
      });
    }
    
    return items;
  }

  /**
   * Obtener items por categoría antigua (storeCategoryId) - compatibilidad
   */
  static async findByCategoryId(categoryId) {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('storeCategoryId', '==', categoryId)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Obtener todos los items
   */
  static async findAll(options = {}) {
    const { activeOnly = true, limit = null, category = null } = options;
    
    let query = db.collection(COLLECTION_NAME);
    
    // Aplicar filtros
    if (category) {
      query = query.where('category', '==', category);
      if (activeOnly) {
        query = query.where('active', '==', true);
      }
      // Ordenar por precio y nombre (requiere índice compuesto)
      query = query.orderBy('price', 'asc').orderBy('name', 'asc');
    } else if (activeOnly) {
      // Solo filtrar por activo, ordenar por categoría y precio
      query = query.where('active', '==', true);
      query = query.orderBy('category', 'asc').orderBy('price', 'asc');
    } else {
      // Sin filtros, solo ordenar por categoría
      query = query.orderBy('category', 'asc');
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const snapshot = await query.get();
    let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Si hay múltiples filtros o necesitamos ordenar por nombre, hacerlo en memoria
    if (category && activeOnly) {
      // Ya está ordenado por precio y nombre
    } else if (!category) {
      // Ordenar en memoria por precio y nombre dentro de cada categoría
      items.sort((a, b) => {
        if (a.category !== b.category) {
          return a.category.localeCompare(b.category);
        }
        if (a.price !== b.price) {
          return (a.price || 0) - (b.price || 0);
        }
        return (a.name || '').localeCompare(b.name || '');
      });
    }
    
    return items;
  }

  /**
   * Actualizar item
   */
  static async update(itemId, updateData) {
    const itemRef = db.collection(COLLECTION_NAME).doc(itemId);
    await itemRef.update({
      ...updateData,
      updatedAt: Timestamp.now(),
    });
    
    return await this.findById(itemId);
  }

  /**
   * Eliminar item
   */
  static async delete(itemId) {
    await db.collection(COLLECTION_NAME).doc(itemId).delete();
    return true;
  }
}

