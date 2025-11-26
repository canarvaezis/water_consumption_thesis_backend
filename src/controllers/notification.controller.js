/**
 * Controlador de Notificaciones
 */

import { NotificationService } from '../services/notification.service.js';

export class NotificationController {
  /**
   * Obtener notificaciones del usuario
   */
  static async getUserNotifications(req, res) {
    try {
      const userId = req.user.uid;
      const { unreadOnly, limit, type } = req.query;

      const result = await NotificationService.getUserNotifications(userId, {
        unreadOnly,
        limit,
        type,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener notificaciones',
      });
    }
  }

  /**
   * Obtener notificaciones no leídas
   */
  static async getUnreadNotifications(req, res) {
    try {
      const userId = req.user.uid;
      const { limit } = req.query;

      const result = await NotificationService.getUnreadNotifications(userId, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error al obtener notificaciones no leídas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener notificaciones no leídas',
      });
    }
  }

  /**
   * Marcar notificación como leída
   */
  static async markNotificationAsRead(req, res) {
    try {
      const userId = req.user.uid;
      const { notificationId } = req.params;

      const notification = await NotificationService.markNotificationAsRead(
        userId,
        notificationId
      );

      res.json({
        success: true,
        message: 'Notificación marcada como leída',
        data: notification,
      });
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      const statusCode = error.message === 'Notificación no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al marcar notificación como leída',
      });
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  static async markAllNotificationsAsRead(req, res) {
    try {
      const userId = req.user.uid;

      const result = await NotificationService.markAllNotificationsAsRead(userId);

      res.json({
        success: true,
        message: result.message,
        data: { count: result.count },
      });
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al marcar todas las notificaciones como leídas',
      });
    }
  }

  /**
   * Eliminar notificación
   */
  static async deleteNotification(req, res) {
    try {
      const userId = req.user.uid;
      const { notificationId } = req.params;

      const result = await NotificationService.deleteNotification(userId, notificationId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      const statusCode = error.message === 'Notificación no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al eliminar notificación',
      });
    }
  }
}

