/**
 * Modelo de Inventario para Firestore
 * 
 * Se almacena como subcolección en wallets/{walletId}/inventory
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
   */
  static async addItem(walletId, storeItemId) {
    const inventoryRef = db
      .collection('wallets')
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
   */
  static async getInventoryByWalletId(walletId) {
    const snapshot = await db
      .collection('wallets')
      .doc(walletId)
      .collection('inventory')
      .orderBy('purchasedAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Verificar si un item está en el inventario
   */
  static async hasItem(walletId, storeItemId) {
    const snapshot = await db
      .collection('wallets')
      .doc(walletId)
      .collection('inventory')
      .where('storeItemId', '==', storeItemId)
      .limit(1)
      .get();
    
    return !snapshot.empty;
  }

  /**
   * Eliminar item del inventario
   */
  static async removeItem(walletId, inventoryId) {
    await db
      .collection('wallets')
      .doc(walletId)
      .collection('inventory')
      .doc(inventoryId)
      .delete();
    
    return true;
  }
}

