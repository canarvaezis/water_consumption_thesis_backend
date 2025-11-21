/**
 * Modelo de Billetera para Firestore
 * 
 * Estructura: Subcolección de users
 * users/{uid}/wallet/{walletId}
 * 
 * El userId está implícito en la ruta (uid del documento padre)
 * El walletId es el ID del documento en la subcolección
 * 
 * Estructura del documento:
 * {
 *   balance: number (puntos/monedas)
 *   createdAt: Timestamp
 *   updatedAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';

const SUBCOLLECTION_NAME = 'wallet';

export class WalletModel {
  /**
   * Crear una nueva billetera para un usuario (como subcolección)
   */
  static async create(uid, initialBalance = 0) {
    const walletRef = db.collection('users').doc(uid).collection(SUBCOLLECTION_NAME).doc();
    const wallet = {
      balance: initialBalance,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await walletRef.set(wallet);
    return { id: walletRef.id, ...wallet };
  }

  /**
   * Obtener billetera por UID del usuario
   * Retorna la primera billetera del usuario (normalmente solo hay una)
   */
  static async findByUserId(uid) {
    const snapshot = await db
      .collection('users')
      .doc(uid)
      .collection(SUBCOLLECTION_NAME)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Obtener billetera por ID (requiere uid)
   */
  static async findById(uid, walletId) {
    const walletDoc = await db
      .collection('users')
      .doc(uid)
      .collection(SUBCOLLECTION_NAME)
      .doc(walletId)
      .get();
    
    if (!walletDoc.exists) {
      return null;
    }
    
    return { id: walletDoc.id, ...walletDoc.data() };
  }

  /**
   * Actualizar balance de la billetera
   */
  static async updateBalance(uid, walletId, newBalance) {
    const walletRef = db
      .collection('users')
      .doc(uid)
      .collection(SUBCOLLECTION_NAME)
      .doc(walletId);
    
    await walletRef.update({
      balance: newBalance,
      updatedAt: new Date(),
    });
    
    return await this.findById(uid, walletId);
  }

  /**
   * Agregar puntos a la billetera
   */
  static async addPoints(uid, walletId, points) {
    const wallet = await this.findById(uid, walletId);
    if (!wallet) {
      throw new Error('Billetera no encontrada');
    }
    
    const newBalance = wallet.balance + points;
    return await this.updateBalance(uid, walletId, newBalance);
  }

  /**
   * Descontar puntos de la billetera
   */
  static async subtractPoints(uid, walletId, points) {
    const wallet = await this.findById(uid, walletId);
    if (!wallet) {
      throw new Error('Billetera no encontrada');
    }
    
    if (wallet.balance < points) {
      throw new Error('Saldo insuficiente');
    }
    
    const newBalance = wallet.balance - points;
    return await this.updateBalance(uid, walletId, newBalance);
  }
}

