/**
 * Modelo de Item de Consumo para Firestore
 * 
 * Estructura del documento:
 * {
 *   consumptionItemId: string (auto-generado)
 *   consumptionCategoryId: string
 *   name: string
 *   description: string
 *   averageLitersPerUse: number (opcional)
 *   createdAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';

const COLLECTION_NAME = 'consumptionItems';

export class ConsumptionItemModel {
  /**
   * Crear un nuevo item de consumo
   */
  static async create(itemData) {
    const itemRef = db.collection(COLLECTION_NAME).doc();
    const item = {
      consumptionItemId: itemRef.id,
      consumptionCategoryId: itemData.consumptionCategoryId,
      name: itemData.name,
      description: itemData.description,
      averageLitersPerUse: itemData.averageLitersPerUse || null,
      createdAt: new Date(),
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
   */
  static async findByCategory(categoryId) {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('consumptionCategoryId', '==', categoryId)
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
      updatedAt: new Date(),
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

