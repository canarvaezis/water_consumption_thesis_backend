/**
 * Modelo de Métricas de Usuario para Firestore
 * 
 * Estructura: Subcolección de users
 * users/{uid}/metrics/{metricsId}
 * 
 * El userId está implícito en la ruta (uid del documento padre)
 * El metricsId es el ID del documento en la subcolección (normalmente "main")
 * 
 * Estructura del documento:
 * {
 *   consumptionStreak: number (número de días consecutivos con registro, 0 por defecto)
 *   lastConsumptionDate: Timestamp (última fecha en la que se registró consumo, null por defecto)
 *   streakLastUpdated: Timestamp (última vez que se actualizó la racha, null por defecto)
 *   createdAt: Timestamp
 *   updatedAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

const SUBCOLLECTION_NAME = 'metrics';
const DEFAULT_DOCUMENT_ID = 'main';

export class UserMetricsModel {
  /**
   * Crear métricas iniciales para un usuario (como subcolección)
   */
  static async create(uid, metricsData = {}) {
    const metricsRef = db
      .collection('users')
      .doc(uid)
      .collection(SUBCOLLECTION_NAME)
      .doc(DEFAULT_DOCUMENT_ID);
    
    const metrics = {
      consumptionStreak: metricsData.consumptionStreak !== undefined ? metricsData.consumptionStreak : 0,
      lastConsumptionDate: metricsData.lastConsumptionDate !== undefined ? metricsData.lastConsumptionDate : null,
      streakLastUpdated: metricsData.streakLastUpdated !== undefined ? metricsData.streakLastUpdated : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await metricsRef.set(metrics);
    return { id: metricsRef.id, ...metrics };
  }

  /**
   * Obtener métricas por UID del usuario
   * Retorna las métricas del usuario (documento "main")
   */
  static async findByUserId(uid) {
    const metricsDoc = await db
      .collection('users')
      .doc(uid)
      .collection(SUBCOLLECTION_NAME)
      .doc(DEFAULT_DOCUMENT_ID)
      .get();
    
    if (!metricsDoc.exists) {
      return null;
    }
    
    return { id: metricsDoc.id, ...metricsDoc.data() };
  }

  /**
   * Obtener métricas por ID (requiere uid)
   */
  static async findById(uid, metricsId) {
    const metricsDoc = await db
      .collection('users')
      .doc(uid)
      .collection(SUBCOLLECTION_NAME)
      .doc(metricsId)
      .get();
    
    if (!metricsDoc.exists) {
      return null;
    }
    
    return { id: metricsDoc.id, ...metricsDoc.data() };
  }

  /**
   * Actualizar métricas del usuario
   */
  static async update(uid, updateData) {
    const metricsRef = db
      .collection('users')
      .doc(uid)
      .collection(SUBCOLLECTION_NAME)
      .doc(DEFAULT_DOCUMENT_ID);
    
    await metricsRef.update({
      ...updateData,
      updatedAt: Timestamp.now(),
    });
    
    return await this.findByUserId(uid);
  }

  /**
   * Crear o actualizar métricas (upsert)
   * Si no existen, las crea; si existen, las actualiza
   */
  static async upsert(uid, metricsData) {
    const metricsRef = db
      .collection('users')
      .doc(uid)
      .collection(SUBCOLLECTION_NAME)
      .doc(DEFAULT_DOCUMENT_ID);
    
    const existing = await this.findByUserId(uid);
    
    if (existing) {
      // Actualizar
      return await this.update(uid, metricsData);
    } else {
      // Crear
      return await this.create(uid, metricsData);
    }
  }

  /**
   * Eliminar métricas del usuario
   */
  static async delete(uid) {
    await db
      .collection('users')
      .doc(uid)
      .collection(SUBCOLLECTION_NAME)
      .doc(DEFAULT_DOCUMENT_ID)
      .delete();
    
    return true;
  }
}

