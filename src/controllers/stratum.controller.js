/**
 * Controlador de Estrato
 */

import { StratumService } from '../services/stratum.service.js';

export class StratumController {
  /**
   * Obtener estrato actual del usuario
   */
  static async getUserStratum(req, res) {
    try {
      const userId = req.user.uid;
      const stratum = await StratumService.getUserStratum(userId);

      res.json({
        success: true,
        data: stratum,
      });
    } catch (error) {
      console.error('Error al obtener estrato:', error);
      const statusCode = error.message === 'Usuario no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener estrato',
      });
    }
  }

  /**
   * Actualizar estrato del usuario
   */
  static async updateStratum(req, res) {
    try {
      const userId = req.user.uid;
      const { stratum } = req.body;

      if (stratum === undefined || stratum === null) {
        return res.status(400).json({
          success: false,
          message: 'stratum es requerido',
        });
      }

      const result = await StratumService.updateStratum(userId, stratum);

      res.json({
        success: true,
        message: result.changed 
          ? 'Estrato actualizado exitosamente' 
          : result.message,
        data: result,
      });
    } catch (error) {
      console.error('Error al actualizar estrato:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al actualizar estrato',
      });
    }
  }

  /**
   * Obtener historial de cambios de estrato
   */
  static async getStratumHistory(req, res) {
    try {
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
    } catch (error) {
      console.error('Error al obtener historial de estrato:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener historial de estrato',
      });
    }
  }

  /**
   * Obtener tarifas por estrato
   */
  static async getStratumRates(req, res) {
    try {
      const { stratum } = req.query;
      const stratumNumber = stratum ? parseInt(stratum) : null;

      const rates = await StratumService.getStratumRates(stratumNumber);

      res.json({
        success: true,
        data: rates,
      });
    } catch (error) {
      console.error('Error al obtener tarifas:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener tarifas',
      });
    }
  }
}

