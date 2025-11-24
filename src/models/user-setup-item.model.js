/**
 * Modelo de Item de Configuración de Usuario para Firestore
 * 
 * Se almacena como subcolección en users/{userId}/setupItems
 * 
 * Estructura del documento:
 * {
 *   userSetupItemId: string (auto-generado)
 *   userId: string
 *   consumptionItemId: string
 *   hasItem: boolean
 *   createdAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

export class UserSetupItemModel {
  /**
   * Crear o actualizar item de configuración
   */
  static async upsert(userId, setupItemData) {
    // Verificar si ya existe
    const existing = await this.getByItemId(userId, setupItemData.consumptionItemId);
    
    if (existing) {
      // Actualizar
      const setupItemRef = db
        .collection('users')
        .doc(userId)
        .collection('setupItems')
        .doc(existing.id);
      
      await setupItemRef.update({
        hasItem: setupItemData.hasItem,
        updatedAt: Timestamp.now(),
      });
      
      const updatedDoc = await setupItemRef.get();
      return { id: updatedDoc.id, ...updatedDoc.data() };
    } else {
      // Crear nuevo
      const setupItemRef = db
        .collection('users')
        .doc(userId)
        .collection('setupItems')
        .doc();
      
      const setupItem = {
        userSetupItemId: setupItemRef.id,
        userId,
        consumptionItemId: setupItemData.consumptionItemId,
        hasItem: setupItemData.hasItem,
        createdAt: Timestamp.now(),
      };
      
      await setupItemRef.set(setupItem);
      return { id: setupItemRef.id, ...setupItem };
    }
  }

  /**
   * Obtener todos los items de configuración de un usuario
   */
  static async getSetupItemsByUserId(userId) {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('setupItems')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Obtener item de configuración específico
   */
  static async getByItemId(userId, consumptionItemId) {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('setupItems')
      .where('consumptionItemId', '==', consumptionItemId)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Eliminar item de configuración
   */
  static async delete(userId, setupItemId) {
    await db
      .collection('users')
      .doc(userId)
      .collection('setupItems')
      .doc(setupItemId)
      .delete();
    
    return true;
  }
}

