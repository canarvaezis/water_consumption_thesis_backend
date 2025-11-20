/**
 * Modelo de Sesión de Consumo para Firestore
 * 
 * Estructura del documento:
 * {
 *   consumptionSessionId: string (auto-generado)
 *   userId: string
 *   householdId: string
 *   formType: string ('manual' | 'automatic')
 *   consumptionDate: Timestamp
 *   totalEstimatedLiters: number
 *   createdAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';

const COLLECTION_NAME = 'consumptionSessions';

export class ConsumptionSessionModel {
  /**
   * Crear una nueva sesión de consumo
   */
  static async create(sessionData) {
    const sessionRef = db.collection(COLLECTION_NAME).doc();
    const session = {
      consumptionSessionId: sessionRef.id,
      userId: sessionData.userId,
      householdId: sessionData.householdId,
      formType: sessionData.formType,
      consumptionDate: sessionData.consumptionDate || new Date(),
      totalEstimatedLiters: sessionData.totalEstimatedLiters || 0,
      createdAt: new Date(),
    };
    
    await sessionRef.set(session);
    return { id: sessionRef.id, ...session };
  }

  /**
   * Obtener sesión por ID
   */
  static async findById(sessionId) {
    const sessionDoc = await db.collection(COLLECTION_NAME).doc(sessionId).get();
    
    if (!sessionDoc.exists) {
      return null;
    }
    
    return { id: sessionDoc.id, ...sessionDoc.data() };
  }

  /**
   * Obtener sesiones por usuario
   */
  static async findByUserId(userId, limit = 50) {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Obtener sesiones por hogar
   */
  static async findByHouseholdId(householdId, limit = 50) {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('householdId', '==', householdId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Obtener sesiones por rango de fechas
   */
  static async findByDateRange(userId, startDate, endDate) {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('userId', '==', userId)
      .where('consumptionDate', '>=', startDate)
      .where('consumptionDate', '<=', endDate)
      .orderBy('consumptionDate', 'asc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Actualizar sesión
   */
  static async update(sessionId, updateData) {
    const sessionRef = db.collection(COLLECTION_NAME).doc(sessionId);
    await sessionRef.set({
      ...updateData,
      updatedAt: new Date(),
    }, { merge: true });
    
    return await this.findById(sessionId);
  }

  /**
   * Eliminar sesión
   */
  static async delete(sessionId) {
    await db.collection(COLLECTION_NAME).doc(sessionId).delete();
    return true;
  }
}

