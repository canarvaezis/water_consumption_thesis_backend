/**
 * Controlador de Estadísticas Avanzadas
 */

import { AdvancedStatisticsService } from '../services/advanced-statistics.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { BadRequestError } from '../utils/errors.js';

export class AdvancedStatisticsController {
  /**
   * Comparar consumo entre períodos
   */
  static comparePeriods = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { period1, period2, type } = req.query;

    if (!period1 || !period2) {
      throw new BadRequestError('period1 y period2 son requeridos');
    }

    const result = await AdvancedStatisticsService.comparePeriods(
      userId,
      period1,
      period2,
      type || 'daily'
    );

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Obtener tendencias de consumo
   */
  static getTrends = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { period, metric } = req.query;

    if (!period) {
      throw new BadRequestError('period es requerido');
    }

    const result = await AdvancedStatisticsService.getConsumptionTrends(
      userId,
      period,
      metric || 'liters'
    );

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Predecir consumo futuro
   */
  static getPredictions = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { days, basedOn } = req.query;

    const daysNum = days ? parseInt(days) : 7;
    if (isNaN(daysNum) || daysNum < 1 || daysNum > 90) {
      throw new BadRequestError('days debe ser un número entre 1 y 90');
    }

    const result = await AdvancedStatisticsService.predictConsumption(
      userId,
      daysNum,
      basedOn || 'lastWeek'
    );

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Exportar datos de consumo
   */
  static exportData = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { format, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      throw new BadRequestError('startDate y endDate son requeridos');
    }

    const exportFormat = format || 'csv';
    if (exportFormat !== 'csv' && exportFormat !== 'json') {
      throw new BadRequestError('format debe ser "csv" o "json"');
    }

    const result = await AdvancedStatisticsService.exportConsumptionData(
      userId,
      startDate,
      endDate,
      exportFormat
    );

    if (exportFormat === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="consumption_${startDate}_${endDate}.csv"`);
      res.send(result);
    } else {
      res.json({
        success: true,
        data: result,
      });
    }
  });
}
