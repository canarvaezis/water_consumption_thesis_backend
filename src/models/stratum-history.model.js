/**
 * Modelo de Historial de Estrato para Firestore
 * 
 * Se almacena como subcolección en users/{userId}/stratumHistory
 * 
 * Estructura del documento:
 * {
 *   stratumHistoryId: string (auto-generado)
 *   userId: string
 *   previousStratum: number (1-6)
 *   newStratum: number (1-6)
 *   changedAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

export class StratumHistoryModel {
  /**
   * Crear un nuevo registro en el historial
   */
  static async create(userId, previousStratum, newStratum) {
    const historyRef = db
      .collection('users')
      .doc(userId)
      .collection('stratumHistory')
      .doc();
    
    const history = {
      stratumHistoryId: historyRef.id,
      userId,
      previousStratum,
      newStratum,
      changedAt: Timestamp.now(),
    };
    
    await historyRef.set(history);
    return { id: historyRef.id, ...history };
  }

  /**
   * Obtener historial de cambios de estrato de un usuario
   */
  static async getHistoryByUserId(userId, options = {}) {
    const { limit = 50 } = options;
    
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('stratumHistory')
      .orderBy('changedAt', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        changedAt: data.changedAt?.toDate ? data.changedAt.toDate() : data.changedAt,
      };
    });
  }

  /**
   * Obtener el último cambio de estrato
   */
  static async getLastChange(userId) {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('stratumHistory')
      .orderBy('changedAt', 'desc')
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      changedAt: data.changedAt?.toDate ? data.changedAt.toDate() : data.changedAt,
    };
  }
}

