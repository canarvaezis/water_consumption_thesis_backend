/**
 * Modelo de Inventario para Firestore
 * 
 * Se almacena como subcolección en users/{uid}/wallet/{walletId}/inventory
 * 
 * Estructura del documento:
 * {
 *   inventoryId: string (auto-generado)
 *   walletId: string
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
   * @param {string} walletId - ID de la billetera
   * @param {string} storeItemId - ID del item de la tienda
   */
  static async addItem(uid, walletId, storeItemId) {
    const inventoryRef = db
      .collection('users')
      .doc(uid)
      .collection('wallet')
      .doc(walletId)
      .collection('inventory')
      .doc();
    
    const inventoryItem = {
      inventoryId: inventoryRef.id,
      walletId,
      storeItemId,
      purchasedAt: Timestamp.now(),
    };
    
    await inventoryRef.set(inventoryItem);
    return { id: inventoryRef.id, ...inventoryItem };
  }

  /**
   * Obtener inventario de una billetera
   * @param {string} uid - UID del usuario
   * @param {string} walletId - ID de la billetera
   */
  static async getInventoryByWalletId(uid, walletId) {
    const snapshot = await db
      .collection('users')
      .doc(uid)
      .collection('wallet')
      .doc(walletId)
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
   * Verificar si un item está en el inventario
   * @param {string} uid - UID del usuario
   * @param {string} walletId - ID de la billetera
   * @param {string} storeItemId - ID del item de la tienda
   */
  static async hasItem(uid, walletId, storeItemId) {
    const snapshot = await db
      .collection('users')
      .doc(uid)
      .collection('wallet')
      .doc(walletId)
      .collection('inventory')
      .where('storeItemId', '==', storeItemId)
      .limit(1)
      .get();
    
    return !snapshot.empty;
  }

  /**
   * Eliminar item del inventario
   * @param {string} uid - UID del usuario
   * @param {string} walletId - ID de la billetera
   * @param {string} inventoryId - ID del item del inventario
   */
  static async removeItem(uid, walletId, inventoryId) {
    await db
      .collection('users')
      .doc(uid)
      .collection('wallet')
      .doc(walletId)
      .collection('inventory')
      .doc(inventoryId)
      .delete();
    
    return true;
  }
}

