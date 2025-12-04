/**
 * Controlador de Push Notifications
 */

import { PushNotificationService } from '../services/push-notification.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';

export class PushNotificationController {
  /**
   * Registrar token FCM de un dispositivo
   */
  static registerToken = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { token, deviceInfo } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token FCM es requerido',
      });
    }

    const savedToken = await PushNotificationService.registerToken(
      userId,
      token,
      deviceInfo || {}
    );

    res.json({
      success: true,
      message: 'Token FCM registrado exitosamente',
      data: savedToken,
    });
  });

  /**
   * Eliminar token FCM de un dispositivo
   */
  static unregisterToken = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token FCM es requerido',
      });
    }

    await PushNotificationService.unregisterToken(userId, token);

    res.json({
      success: true,
      message: 'Token FCM eliminado exitosamente',
    });
  });
}

