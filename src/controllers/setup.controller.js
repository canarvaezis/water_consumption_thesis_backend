/**
 * Controlador de Setup Items
 */

import { SetupService } from '../services/setup.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export class SetupController {
  /**
   * Obtener items de configuración del usuario
   */
  static getUserSetupItems = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const result = await SetupService.getUserSetupItems(userId);

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Agregar o actualizar item de configuración
   */
  static upsertSetupItem = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { consumptionItemId, hasItem } = req.body;

    if (!consumptionItemId) {
      throw new BadRequestError('consumptionItemId es requerido');
    }

    if (hasItem === undefined || hasItem === null) {
      throw new BadRequestError('hasItem es requerido');
    }

    try {
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
      if (error.message === 'Item de consumo no encontrado') {
        throw new NotFoundError(error.message);
      }
      throw error;
    }
  });

  /**
   * Actualizar item de configuración por ID
   */
  static updateSetupItem = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { itemId } = req.params;
    const { hasItem } = req.body;

    if (hasItem === undefined || hasItem === null) {
      throw new BadRequestError('hasItem es requerido');
    }

    try {
      const result = await SetupService.updateSetupItem(userId, itemId, {
        hasItem,
      });
      res.json({
        success: true,
        message: 'Item de configuración actualizado exitosamente',
        data: result,
      });
    } catch (error) {
      if (error.message === 'Item de configuración no encontrado') {
        throw new NotFoundError(error.message);
      }
      throw error;
    }
  });

  /**
   * Eliminar item de configuración
   */
  static deleteSetupItem = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { itemId } = req.params;

    try {
      const result = await SetupService.deleteSetupItem(userId, itemId);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error.message === 'Item de configuración no encontrado') {
        throw new NotFoundError(error.message);
      }
      throw error;
    }
  });
}
