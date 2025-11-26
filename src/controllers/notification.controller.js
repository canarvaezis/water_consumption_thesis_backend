/**
 * Controlador de Notificaciones
 */

import { NotificationService } from '../services/notification.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { NotFoundError } from '../utils/errors.js';

export class NotificationController {
  /**
   * Obtener notificaciones del usuario
   */
  static getUserNotifications = asyncHandler(async (req, res) => {
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
  });

  /**
   * Obtener notificaciones no leídas
   */
  static getUnreadNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { limit } = req.query;

    const result = await NotificationService.getUnreadNotifications(userId, limit);

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Marcar notificación como leída
   */
  static markNotificationAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { notificationId } = req.params;

    try {
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
      if (error.message === 'Notificación no encontrada') {
        throw new NotFoundError(error.message);
      }
      throw error;
    }
  });

  /**
   * Marcar todas las notificaciones como leídas
   */
  static markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.uid;

    const result = await NotificationService.markAllNotificationsAsRead(userId);

    res.json({
      success: true,
      message: result.message,
      data: { count: result.count },
    });
  });

  /**
   * Eliminar notificación
   */
  static deleteNotification = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { notificationId } = req.params;

    try {
      const result = await NotificationService.deleteNotification(userId, notificationId);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error.message === 'Notificación no encontrada') {
        throw new NotFoundError(error.message);
      }
      throw error;
    }
  });
}
