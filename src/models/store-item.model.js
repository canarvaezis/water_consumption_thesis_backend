/**
 * Modelo de Item de Tienda para Firestore
 * 
 * Estructura del documento:
 * {
 *   storeItemId: string (auto-generado)
 *   category: string ("avatar" | "nickname")
 *   name: string
 *   description: string
 *   price: number (puntos)
 *   asset_url: string (URL del asset en Firebase Storage)
 *   default: boolean (si es item por defecto/gratis)
 *   createdAt: Timestamp
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
      storeCategoryId: itemData.storeCategoryId,
      name: itemData.name,
      description: itemData.description,
      price: itemData.price,
      assetUrl: itemData.assetUrl,
      createdAt: Timestamp.now(),
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
   * Obtener items por categoría (category: "avatar" | "nickname")
   */
  static async findByCategory(category) {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('category', '==', category)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
  static async findAll() {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Actualizar item
   */
  static async update(itemId, updateData) {
    const itemRef = db.collection(COLLECTION_NAME).doc(itemId);
    await itemRef.set({
      ...updateData,
      updatedAt: Timestamp.now(),
    }, { merge: true });
    
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

