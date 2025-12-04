/**
 * Servicio de Push Notifications (Firebase Cloud Messaging)
 * 
 * Envía notificaciones push a los usuarios sin guardarlas en la base de datos
 */

import admin from '../config/firebase.js';
import { FCMTokenModel } from '../models/fcm-token.model.js';
import logger from '../utils/logger.js';

export class PushNotificationService {
  /**
   * Enviar notificación push a un usuario
   * @param {string} userId - ID del usuario
   * @param {object} notification - Objeto con title y body
   * @param {object} data - Datos adicionales (opcional)
   * @returns {Promise<Object>} - Resultado del envío
   */
  static async sendToUser(userId, notification, data = {}) {
    try {
      // Obtener todos los tokens FCM del usuario
      const tokens = await FCMTokenModel.getTokensByUserId(userId);
      
      if (tokens.length === 0) {
        logger.debug(`Usuario ${userId} no tiene tokens FCM registrados`);
        return { success: false, message: 'Usuario no tiene tokens FCM registrados' };
      }

      // Preparar mensaje FCM
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          ...data,
          // Convertir objetos a strings para FCM
          ...Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
              key,
              typeof value === 'object' ? JSON.stringify(value) : String(value),
            ])
          ),
        },
        // Enviar a múltiples tokens usando multicast
        tokens: tokens.map(t => t.token),
      };

      // Enviar notificación
      const response = await admin.messaging().sendEachForMulticast(message);

      // Procesar respuestas y eliminar tokens inválidos
      const invalidTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const token = tokens[idx];
          logger.warn(`Token inválido para usuario ${userId}:`, {
            error: resp.error?.code,
            tokenId: token.id,
          });
          
          // Eliminar tokens inválidos
          if (
            resp.error?.code === 'messaging/invalid-registration-token' ||
            resp.error?.code === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(token.id);
          }
        }
      });

      // Eliminar tokens inválidos
      if (invalidTokens.length > 0) {
        await Promise.all(
          invalidTokens.map(tokenId => FCMTokenModel.deleteToken(userId, tokenId))
        );
        logger.info(`Eliminados ${invalidTokens.length} tokens inválidos para usuario ${userId}`);
      }

      const successCount = response.successCount;
      const failureCount = response.failureCount;

      logger.info(`Notificación enviada a usuario ${userId}`, {
        successCount,
        failureCount,
        totalTokens: tokens.length,
      });

      return {
        success: successCount > 0,
        successCount,
        failureCount,
        totalTokens: tokens.length,
      };
    } catch (error) {
      logger.error(`Error enviando notificación push a usuario ${userId}:`, {
        error: error.message,
        stack: error.stack,
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Enviar notificación push a múltiples usuarios
   * @param {Array<string>} userIds - IDs de usuarios
   * @param {object} notification - Objeto con title y body
   * @param {object} data - Datos adicionales (opcional)
   * @returns {Promise<Object>} - Resultado del envío
   */
  static async sendToMultipleUsers(userIds, notification, data = {}) {
    const results = await Promise.allSettled(
      userIds.map(userId => this.sendToUser(userId, notification, data))
    );

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    return {
      total: userIds.length,
      successful,
      failed,
      results: results.map((r, idx) => ({
        userId: userIds[idx],
        ...(r.status === 'fulfilled' ? r.value : { success: false, error: r.reason?.message }),
      })),
    };
  }

  /**
   * Registrar token FCM de un usuario
   * @param {string} userId - ID del usuario
   * @param {string} token - Token FCM
   * @param {object} deviceInfo - Información del dispositivo (opcional)
   * @returns {Promise<Object>} - Token registrado
   */
  static async registerToken(userId, token, deviceInfo = {}) {
    try {
      const savedToken = await FCMTokenModel.upsertToken(userId, token, deviceInfo);
      logger.info(`Token FCM registrado para usuario ${userId}`);
      return savedToken;
    } catch (error) {
      logger.error(`Error registrando token FCM para usuario ${userId}:`, {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Eliminar token FCM de un usuario
   * @param {string} userId - ID del usuario
   * @param {string} token - Token FCM
   * @returns {Promise<boolean>}
   */
  static async unregisterToken(userId, token) {
    try {
      await FCMTokenModel.deleteTokenByValue(userId, token);
      logger.info(`Token FCM eliminado para usuario ${userId}`);
      return true;
    } catch (error) {
      logger.error(`Error eliminando token FCM para usuario ${userId}:`, {
        error: error.message,
      });
      throw error;
    }
  }
}

