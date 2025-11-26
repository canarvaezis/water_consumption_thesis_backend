/**
 * Controlador de Setup Items
 */

import { SetupService } from '../services/setup.service.js';

export class SetupController {
  /**
   * Obtener items de configuración del usuario
   */
  static async getUserSetupItems(req, res) {
    try {
      const userId = req.user.uid;
      const result = await SetupService.getUserSetupItems(userId);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error al obtener items de configuración:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener items de configuración',
      });
    }
  }

  /**
   * Agregar o actualizar item de configuración
   */
  static async upsertSetupItem(req, res) {
    try {
      const userId = req.user.uid;
      const { consumptionItemId, hasItem } = req.body;

      if (!consumptionItemId) {
        return res.status(400).json({
          success: false,
          message: 'consumptionItemId es requerido',
        });
      }

      if (hasItem === undefined || hasItem === null) {
        return res.status(400).json({
          success: false,
          message: 'hasItem es requerido',
        });
      }

      const result = await SetupService.upsertSetupItem(userId, {
        consumptionItemId,
        hasItem,
      });

      res.json({
        success: true,
        message: 'Item de configuración guardado exitosamente',
        data: result,
      });
    } catch (error) {
      console.error('Error al guardar item de configuración:', error);
      const statusCode = error.message === 'Item de consumo no encontrado' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al guardar item de configuración',
      });
    }
  }

  /**
   * Actualizar item de configuración por ID
   */
  static async updateSetupItem(req, res) {
    try {
      const userId = req.user.uid;
      const { itemId } = req.params;
      const { hasItem } = req.body;

      if (hasItem === undefined || hasItem === null) {
        return res.status(400).json({
          success: false,
          message: 'hasItem es requerido',
        });
      }

      const result = await SetupService.updateSetupItem(userId, itemId, {
        hasItem,
      });

      res.json({
        success: true,
        message: 'Item de configuración actualizado exitosamente',
        data: result,
      });
    } catch (error) {
      console.error('Error al actualizar item de configuración:', error);
      const statusCode = error.message === 'Item de configuración no encontrado' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al actualizar item de configuración',
      });
    }
  }

  /**
   * Eliminar item de configuración
   */
  static async deleteSetupItem(req, res) {
    try {
      const userId = req.user.uid;
      const { itemId } = req.params;

      const result = await SetupService.deleteSetupItem(userId, itemId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Error al eliminar item de configuración:', error);
      const statusCode = error.message === 'Item de configuración no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al eliminar item de configuración',
      });
    }
  }
}

