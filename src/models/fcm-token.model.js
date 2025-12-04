/**
 * Modelo de Tokens FCM (Firebase Cloud Messaging) para Firestore
 *
 * Estructura: Subcolección de users
 * users/{uid}/fcmTokens/{tokenId}
 *
 * El userId está implícito en la ruta (uid del documento padre)
 * El tokenId es el ID del documento (normalmente el token mismo o un hash)
 *
 * Estructura del documento:
 * {
 *   token: string (token FCM del dispositivo)
 *   deviceInfo: object (opcional, información del dispositivo)
 *   platform: string (opcional, 'android' | 'ios' | 'web')
 *   createdAt: Timestamp
 *   updatedAt: Timestamp
 *   lastUsedAt: Timestamp (última vez que se usó el token)
 * }
 */

import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

const SUBCOLLECTION_NAME = 'fcmTokens';

export class FCMTokenModel {
  /**
   * Guardar o actualizar token FCM de un usuario
   * @param {string} userId - ID del usuario
   * @param {string} token - Token FCM
   * @param {object} deviceInfo - Información del dispositivo (opcional)
   * @returns {Promise<Object>} - Token guardado
   */
  static async upsertToken(userId, token, deviceInfo = {}) {
    // Usar el token como ID del documento (o un hash si es muy largo)
    const tokenId = token.length > 500 ? this.hashToken(token) : token;
    
    const tokenRef = db
      .collection('users')
      .doc(userId)
      .collection(SUBCOLLECTION_NAME)
      .doc(tokenId);

    const existing = await tokenRef.get();
    const now = Timestamp.now();

    const tokenData = {
      token,
      deviceInfo: deviceInfo || {},
      platform: deviceInfo.platform || 'web',
      updatedAt: now,
      lastUsedAt: now,
    };

    if (!existing.exists) {
      tokenData.createdAt = now;
    }

    await tokenRef.set(tokenData, { merge: true });
    return { id: tokenId, ...tokenData };
  }

  /**
   * Obtener todos los tokens FCM de un usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Array>} - Lista de tokens
   */
  static async getTokensByUserId(userId) {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection(SUBCOLLECTION_NAME)
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  /**
   * Eliminar un token FCM
   * @param {string} userId - ID del usuario
   * @param {string} tokenId - ID del token
   * @returns {Promise<boolean>}
   */
  static async deleteToken(userId, tokenId) {
    await db
      .collection('users')
      .doc(userId)
      .collection(SUBCOLLECTION_NAME)
      .doc(tokenId)
      .delete();

    return true;
  }

  /**
   * Eliminar token por valor del token
   * @param {string} userId - ID del usuario
   * @param {string} token - Token FCM
   * @returns {Promise<boolean>}
   */
  static async deleteTokenByValue(userId, token) {
    const tokenId = token.length > 500 ? this.hashToken(token) : token;
    return await this.deleteToken(userId, tokenId);
  }

  /**
   * Hash simple para tokens largos (no criptográfico, solo para IDs)
   * @param {string} token - Token a hashear
   * @returns {string} - Hash del token
   */
  static hashToken(token) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32 bits
    }
    return Math.abs(hash).toString(36);
  }
}

