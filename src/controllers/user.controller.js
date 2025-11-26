/**
 * Controlador de Usuario
 */

import { UserService } from '../services/user.service.js';

export class UserController {
  /**
   * Actualizar perfil del usuario
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user.uid;
      const updateData = req.body;

      const updatedProfile = await UserService.updateProfile(userId, updateData);

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: updatedProfile,
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar perfil',
      });
    }
  }

  /**
   * Cambiar contraseña
   */
  static async changePassword(req, res) {
    try {
      const userId = req.user.uid;
      const { newPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: 'newPassword es requerido',
        });
      }

      const result = await UserService.changePassword(userId, newPassword);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al cambiar contraseña',
      });
    }
  }

  /**
   * Eliminar cuenta
   */
  static async deleteAccount(req, res) {
    try {
      const userId = req.user.uid;

      const result = await UserService.deleteAccount(userId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al eliminar cuenta',
      });
    }
  }

  /**
   * Obtener actividad reciente del usuario
   */
  static async getUserActivity(req, res) {
    try {
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
    } catch (error) {
      console.error('Error al obtener actividad:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener actividad',
      });
    }
  }

  /**
   * Obtener configuración del usuario
   */
  static async getUserSettings(req, res) {
    try {
      const userId = req.user.uid;
      const settings = await UserService.getUserSettings(userId);

      res.json({
        success: true,
        data: settings,
      });
    } catch (error) {
      console.error('Error al obtener configuración:', error);
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener configuración',
      });
    }
  }

  /**
   * Actualizar configuración del usuario
   */
  static async updateUserSettings(req, res) {
    try {
      const userId = req.user.uid;
      const settings = req.body;

      const updatedSettings = await UserService.updateUserSettings(userId, settings);

      res.json({
        success: true,
        message: 'Configuración actualizada exitosamente',
        data: updatedSettings,
      });
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar configuración',
      });
    }
  }
}

