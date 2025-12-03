/**
 * Modelo de Transacciones de Billetera para Firestore
 * 
 * Se almacena como subcolección en users/{uid}/transactions
 * 
 * Estructura del documento:
 * {
 *   transactionId: string (auto-generado)
 *   walletId: string (siempre "main" para referencia)
 *   type: string ("purchase" | "reward" | "admin_add" | "refund")
 *   amount: number (puntos, positivo para ingresos, negativo para gastos)
 *   description: string
 *   storeItemId: string (opcional, para compras)
 *   referenceId: string (opcional, ID de referencia como achievementId, etc.)
 *   createdAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

export class WalletTransactionModel {
  /**
   * Crear una nueva transacción
   * @param {string} uid - UID del usuario
   * @param {string} walletId - ID de la billetera (para referencia, normalmente "main")
   * @param {object} transactionData - Datos de la transacción
   */
  static async create(uid, walletId, transactionData) {
    const transactionRef = db
      .collection('users')
      .doc(uid)
      .collection('transactions')
      .doc();
    
    const transaction = {
      transactionId: transactionRef.id,
      walletId: walletId || 'main', // Mantener para referencia
      type: transactionData.type, // "purchase" | "reward" | "admin_add" | "refund"
      amount: transactionData.amount, // Positivo para ingresos, negativo para gastos
      description: transactionData.description || '',
      storeItemId: transactionData.storeItemId || null,
      referenceId: transactionData.referenceId || null,
      createdAt: Timestamp.now(),
    };
    
    await transactionRef.set(transaction);
    return { id: transactionRef.id, ...transaction };
  }

  /**
   * Obtener todas las transacciones del usuario
   * @param {string} uid - UID del usuario
   * @param {object} options - Opciones de consulta
   */
  static async getTransactions(uid, options = {}) {
    const { limit = 50, startAfter = null, type = null } = options;
    
    let query = db
      .collection('users')
      .doc(uid)
      .collection('transactions')
      .orderBy('createdAt', 'desc');
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    if (startAfter) {
      query = query.startAfter(startAfter);
    }
    
    query = query.limit(limit);
    
    const snapshot = await query.get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      };
    });
  }

  /**
   * Obtener transacción por ID
   */
  static async findById(uid, transactionId) {
    const transactionDoc = await db
      .collection('users')
      .doc(uid)
      .collection('transactions')
      .doc(transactionId)
      .get();
    
    if (!transactionDoc.exists) {
      return null;
    }
    
    const data = transactionDoc.data();
    return {
      id: transactionDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
    };
  }

  /**
   * Obtener resumen de transacciones
   */
  static async getTransactionSummary(uid, startDate = null, endDate = null) {
    let query = db
      .collection('users')
      .doc(uid)
      .collection('transactions');
    
    if (startDate) {
      query = query.where('createdAt', '>=', Timestamp.fromDate(new Date(startDate)));
    }
    
    if (endDate) {
      query = query.where('createdAt', '<=', Timestamp.fromDate(new Date(endDate)));
    }
    
    const snapshot = await query.get();
    
    let totalEarned = 0;
    let totalSpent = 0;
    const transactionsByType = {};
    
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const amount = data.amount || 0;
      
      if (amount > 0) {
        totalEarned += amount;
      } else {
        totalSpent += Math.abs(amount);
      }
      
      const type = data.type || 'unknown';
      transactionsByType[type] = (transactionsByType[type] || 0) + 1;
    });
    
    return {
      totalEarned,
      totalSpent,
      netAmount: totalEarned - totalSpent,
      transactionCount: snapshot.size,
      transactionsByType,
    };
  }
}

