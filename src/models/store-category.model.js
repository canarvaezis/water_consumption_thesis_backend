/**
 * Modelo de Categoría de Tienda para Firestore
 * 
 * Estructura del documento:
 * {
 *   storeCategoryId: string (auto-generado)
 *   name: string
 *   description: string (opcional)
 *   createdAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

const COLLECTION_NAME = 'storeCategories';

export class StoreCategoryModel {
  /**
   * Crear una nueva categoría
   */
  static async create(categoryData) {
    const categoryRef = db.collection(COLLECTION_NAME).doc();
    const category = {
      storeCategoryId: categoryRef.id,
      name: categoryData.name,
      description: categoryData.description || null,
      createdAt: Timestamp.now(),
    };
    
    await categoryRef.set(category);
    return { id: categoryRef.id, ...category };
  }

  /**
   * Obtener categoría por ID
   */
  static async findById(categoryId) {
    const categoryDoc = await db.collection(COLLECTION_NAME).doc(categoryId).get();
    
    if (!categoryDoc.exists) {
      return null;
    }
    
    return { id: categoryDoc.id, ...categoryDoc.data() };
  }

  /**
   * Obtener todas las categorías
   */
  static async findAll() {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Actualizar categoría
   */
  static async update(categoryId, updateData) {
    const categoryRef = db.collection(COLLECTION_NAME).doc(categoryId);
    await categoryRef.set({
      ...updateData,
      updatedAt: Timestamp.now(),
    }, { merge: true });
    
    return await this.findById(categoryId);
  }

  /**
   * Eliminar categoría
   */
  static async delete(categoryId) {
    await db.collection(COLLECTION_NAME).doc(categoryId).delete();
    return true;
  }
}

