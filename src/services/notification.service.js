/**
 * Servicio de Notificaciones
 * 
 * Lógica de negocio para gestión de notificaciones
 */

import { NotificationModel } from '../models/notification.model.js';

export class NotificationService {
  /**
   * Obtener notificaciones del usuario
   */
  static async getUserNotifications(userId, options = {}) {
    const { unreadOnly, limit, type } = options;
    
    const notifications = await NotificationModel.getNotificationsByUserId(userId, {
      unreadOnly: unreadOnly === 'true' || unreadOnly === true,
      limit: limit ? parseInt(limit) : 50,
      type: type || null,
    });

    // Contar no leídas
    const unreadCount = await NotificationModel.countUnread(userId);

    return {
      notifications,
      count: notifications.length,
      unreadCount,
    };
  }

  /**
   * Obtener notificaciones no leídas
   */
  static async getUnreadNotifications(userId, limit = 50) {
    const notifications = await NotificationModel.getUnreadNotifications(
      userId,
      limit ? parseInt(limit) : 50
    );

    return {
      notifications,
      count: notifications.length,
    };
  }

  /**
   * Marcar notificación como leída
   */
  static async markNotificationAsRead(userId, notificationId) {
    const notification = await NotificationModel.markAsRead(userId, notificationId);
    return notification;
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  static async markAllNotificationsAsRead(userId) {
    const result = await NotificationModel.markAllAsRead(userId);
    return {
      message: `${result.count} notificaciones marcadas como leídas`,
      count: result.count,
    };
  }

  /**
   * Eliminar notificación
   */
  static async deleteNotification(userId, notificationId) {
    // Verificar que la notificación existe y pertenece al usuario
    const notification = await NotificationModel.getById(userId, notificationId);
    
    if (!notification) {
      throw new Error('Notificación no encontrada');
    }

    await NotificationModel.delete(userId, notificationId);
    return { success: true, message: 'Notificación eliminada exitosamente' };
  }

  /**
   * Crear notificación (útil para otros servicios)
   */
  static async createNotification(userId, notificationData) {
    const notification = await NotificationModel.create(userId, notificationData);
    return notification;
  }
}

