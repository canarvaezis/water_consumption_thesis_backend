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
import { Timestamp } from 'firebase-admin/firestore';

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
      consumptionDate: sessionData.consumptionDate 
        ? (sessionData.consumptionDate instanceof Date 
          ? Timestamp.fromDate(sessionData.consumptionDate) 
          : sessionData.consumptionDate)
        : Timestamp.now(),
      totalEstimatedLiters: sessionData.totalEstimatedLiters || 0,
      createdAt: Timestamp.now(),
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
   * Obtener sesión del día actual por usuario
   */
  static async findByUserAndDate(userId, date) {
    // Normalizar fecha a inicio del día
    const dateObj = date instanceof Date ? date : new Date(date);
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Convertir a Timestamps de Firestore para la consulta
    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);
    
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('userId', '==', userId)
      .where('consumptionDate', '>=', startTimestamp)
      .where('consumptionDate', '<=', endTimestamp)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Obtener sesiones por rango de fechas
   */
  static async findByDateRange(userId, startDate, endDate) {
    // Convertir fechas a Timestamps si son Date objects
    const start = startDate instanceof Date 
      ? Timestamp.fromDate(startDate) 
      : (startDate instanceof Timestamp ? startDate : Timestamp.fromDate(new Date(startDate)));
    const end = endDate instanceof Date 
      ? Timestamp.fromDate(endDate) 
      : (endDate instanceof Timestamp ? endDate : Timestamp.fromDate(new Date(endDate)));
    
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('userId', '==', userId)
      .where('consumptionDate', '>=', start)
      .where('consumptionDate', '<=', end)
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
      updatedAt: Timestamp.now(),
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

