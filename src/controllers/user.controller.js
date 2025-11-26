/**
 * Controlador de Usuario
 */

import { UserService } from '../services/user.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export class UserController {
  /**
   * Actualizar perfil del usuario
   */
  static updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const updateData = req.body;

    const updatedProfile = await UserService.updateProfile(userId, updateData);

    res.json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: updatedProfile,
    });
  });

  /**
   * Cambiar contraseña
   */
  static changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { newPassword } = req.body;

    if (!newPassword) {
      throw new BadRequestError('newPassword es requerido');
    }

    const result = await UserService.changePassword(userId, newPassword);

    res.json({
      success: true,
      message: result.message,
    });
  });

  /**
   * Eliminar cuenta
   */
  static deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user.uid;

    try {
      const result = await UserService.deleteAccount(userId);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error.message === 'Usuario no encontrado') {
        throw new NotFoundError(error.message);
      }
      throw error;
    }
  });

  /**
   * Obtener actividad reciente del usuario
   */
  static getUserActivity = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { limit, startDate, endDate } = req.query;

    const options = {
      limit: limit ? parseInt(limit) : 20,
      startDate: startDate || null,
      endDate: endDate || null,
    };

    const activities = await UserService.getUserActivity(userId, options);

    res.json({
      success: true,
      data: {
        activities,
        count: activities.length,
      },
    });
  });

  /**
   * Obtener configuración del usuario
   */
  static getUserSettings = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    
    try {
      const settings = await UserService.getUserSettings(userId);
      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      if (error.message === 'Usuario no encontrado') {
        throw new NotFoundError(error.message);
      }
      throw error;
    }
  });

  /**
   * Actualizar configuración del usuario
   */
  static updateUserSettings = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const settings = req.body;

    const updatedSettings = await UserService.updateUserSettings(userId, settings);

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      data: updatedSettings,
    });
  });
}
