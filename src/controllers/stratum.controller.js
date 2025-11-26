/**
 * Controlador de Estrato
 */

import { StratumService } from '../services/stratum.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export class StratumController {
  /**
   * Obtener estrato actual del usuario
   */
  static getUserStratum = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    
    try {
      const stratum = await StratumService.getUserStratum(userId);
      res.json({
        success: true,
        data: stratum,
      });
    } catch (error) {
      if (error.message === 'Usuario no encontrado') {
        throw new NotFoundError(error.message);
      }
      throw error;
    }
  });

  /**
   * Actualizar estrato del usuario
   */
  static updateStratum = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { stratum } = req.body;

    if (stratum === undefined || stratum === null) {
      throw new BadRequestError('stratum es requerido');
    }

    const result = await StratumService.updateStratum(userId, stratum);

    res.json({
      success: true,
      message: result.changed 
        ? 'Estrato actualizado exitosamente' 
        : result.message,
      data: result,
    });
  });

  /**
   * Obtener historial de cambios de estrato
   */
  static getStratumHistory = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { limit } = req.query;

    const options = {
      limit: limit ? parseInt(limit) : 50,
    };

    const result = await StratumService.getStratumHistory(userId, options);

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Obtener tarifas por estrato
   */
  static getStratumRates = asyncHandler(async (req, res) => {
    const { stratum } = req.query;
    const stratumNumber = stratum ? parseInt(stratum) : null;

    const rates = await StratumService.getStratumRates(stratumNumber);

    res.json({
      success: true,
      data: rates,
    });
  });
}
