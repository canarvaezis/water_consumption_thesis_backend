/**
 * Modelo de Inventario para Firestore
 * 
 * Se almacena como subcolección en users/{uid}/inventory
 * 
 * Estructura del documento:
 * {
 *   inventoryId: string (auto-generado)
 *   walletId: string (siempre "main" para referencia)
 *   storeItemId: string
 *   purchasedAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

export class InventoryModel {
  /**
   * Agregar item al inventario
   * @param {string} uid - UID del usuario
   * @param {string} walletId - ID de la billetera (para referencia, normalmente "main")
   * @param {string} storeItemId - ID del item de la tienda
   */
  static async addItem(uid, walletId, storeItemId) {
    const inventoryRef = db
      .collection('users')
      .doc(uid)
      .collection('inventory')
      .doc();
    
    const inventoryItem = {
      inventoryId: inventoryRef.id,
      walletId: walletId || 'main', // Mantener para referencia
      storeItemId,
      purchasedAt: Timestamp.now(),
    };
    
    await inventoryRef.set(inventoryItem);
    return { id: inventoryRef.id, ...inventoryItem };
  }

  /**
   * Obtener inventario del usuario
   * @param {string} uid - UID del usuario
   */
  static async getInventoryByUserId(uid) {
    const snapshot = await db
      .collection('users')
      .doc(uid)
      .collection('inventory')
      .orderBy('purchasedAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data(),
      purchasedAt: doc.data().purchasedAt?.toDate 
        ? doc.data().purchasedAt.toDate() 
        : doc.data().purchasedAt,
    }));
  }

  /**
   * Obtener inventario de una billetera (método legacy, mantiene compatibilidad)
   * @deprecated Usar getInventoryByUserId en su lugar
   */
  static async getInventoryByWalletId(uid, walletId) {
    return this.getInventoryByUserId(uid);
  }

  /**
   * Verificar si un item está en el inventario
   * @param {string} uid - UID del usuario
   * @param {string} storeItemId - ID del item de la tienda
   */
  static async hasItem(uid, storeItemId) {
    const snapshot = await db
      .collection('users')
      .doc(uid)
      .collection('inventory')
      .where('storeItemId', '==', storeItemId)
      .limit(1)
      .get();
    
    return !snapshot.empty;
  }

  /**
   * Eliminar item del inventario
   * @param {string} uid - UID del usuario
   * @param {string} inventoryId - ID del item del inventario
   */
  static async removeItem(uid, inventoryId) {
    await db
      .collection('users')
      .doc(uid)
      .collection('inventory')
      .doc(inventoryId)
      .delete();
    
    return true;
  }
}

