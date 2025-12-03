/**
 * Modelo de Billetera para Firestore
 * 
 * Estructura: Subcolección de users
 * users/{uid}/wallet/{walletId}
 * 
 * El userId está implícito en la ruta (uid del documento padre)
 * El walletId es siempre "main" (ID fijo, un solo wallet por usuario)
 * 
 * Estructura del documento:
 * {
 *   balance: number (puntos/monedas)
 *   createdAt: Timestamp
 *   updatedAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

const SUBCOLLECTION_NAME = 'wallet';
const DEFAULT_DOCUMENT_ID = 'main';

export class WalletModel {
  /**
   * Crear una nueva billetera para un usuario (como subcolección)
   */
  static async create(uid, initialBalance = 0) {
    const walletRef = db.collection('users').doc(uid).collection(SUBCOLLECTION_NAME).doc(DEFAULT_DOCUMENT_ID);
    const wallet = {
      balance: initialBalance,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await walletRef.set(wallet);
    return { id: walletRef.id, ...wallet };
  }

  /**
   * Obtener billetera por UID del usuario
   * Retorna la billetera del usuario (documento "main")
   */
  static async findByUserId(uid) {
    const walletDoc = await db
      .collection('users')
      .doc(uid)
      .collection(SUBCOLLECTION_NAME)
      .doc(DEFAULT_DOCUMENT_ID)
      .get();
    
    if (!walletDoc.exists) {
      return null;
    }
    
    return { id: walletDoc.id, ...walletDoc.data() };
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
      updatedAt: Timestamp.now(),
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

