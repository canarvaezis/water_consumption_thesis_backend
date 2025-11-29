/**
 * Modelo de Detalle de Consumo de Usuario para Firestore
 * 
 * Se almacena como subcolección en consumptionSessions/{sessionId}/details
 * 
 * Estructura del documento:
 * {
 *   userConsumptionDetailId: string (auto-generado)
 *   consumptionSessionId: string
 *   consumptionItemId: string (ID de la actividad, ej: "baño", "lavado de manos")
 *   faucetTypeId: string (ID del tipo de grifo utilizado)
 *   durationMinutes: number (duración de la actividad en minutos)
 *   calculatedLiters: number (litros calculados: durationMinutes × litersPerMinute del grifo)
 *   createdAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

export class UserConsumptionDetailModel {
  /**
   * Agregar detalle a una sesión de consumo
   */
  static async addDetail(sessionId, detailData) {
    const detailRef = db
      .collection('consumptionSessions')
      .doc(sessionId)
      .collection('details')
      .doc();
    
    const detail = {
      userConsumptionDetailId: detailRef.id,
      consumptionSessionId: sessionId,
      consumptionItemId: detailData.consumptionItemId,
      faucetTypeId: detailData.faucetTypeId,
      durationMinutes: detailData.durationMinutes,
      calculatedLiters: detailData.calculatedLiters,
      createdAt: Timestamp.now(),
    };
    
    await detailRef.set(detail);
    return { id: detailRef.id, ...detail };
  }

  /**
   * Obtener detalles de una sesión
   */
  static async getDetailsBySessionId(sessionId) {
    const snapshot = await db
      .collection('consumptionSessions')
      .doc(sessionId)
      .collection('details')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Actualizar detalle
   */
  static async update(sessionId, detailId, updateData) {
    const detailRef = db
      .collection('consumptionSessions')
      .doc(sessionId)
      .collection('details')
      .doc(detailId);
    
    await detailRef.set({
      ...updateData,
      updatedAt: Timestamp.now(),
    }, { merge: true });
    
    const updatedDoc = await detailRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }

  /**
   * Eliminar detalle
   */
  static async delete(sessionId, detailId) {
    await db
      .collection('consumptionSessions')
      .doc(sessionId)
      .collection('details')
      .doc(detailId)
      .delete();
    
    return true;
  }
}

