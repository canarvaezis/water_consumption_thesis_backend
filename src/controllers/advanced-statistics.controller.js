/**
 * Controlador de Estadísticas Avanzadas
 */

import { AdvancedStatisticsService } from '../services/advanced-statistics.service.js';

export class AdvancedStatisticsController {
  /**
   * Comparar consumo entre períodos
   */
  static async comparePeriods(req, res) {
    try {
      const userId = req.user.uid;
      const { period1, period2, type } = req.query;

      if (!period1 || !period2) {
        return res.status(400).json({
          success: false,
          message: 'period1 y period2 son requeridos',
        });
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
    } catch (error) {
      console.error('Error al comparar períodos:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al comparar períodos',
      });
    }
  }

  /**
   * Obtener tendencias de consumo
   */
  static async getTrends(req, res) {
    try {
      const userId = req.user.uid;
      const { period, metric } = req.query;

      if (!period) {
        return res.status(400).json({
          success: false,
          message: 'period es requerido',
        });
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
    } catch (error) {
      console.error('Error al obtener tendencias:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener tendencias',
      });
    }
  }

  /**
   * Predecir consumo futuro
   */
  static async getPredictions(req, res) {
    try {
      const userId = req.user.uid;
      const { days, basedOn } = req.query;

      const daysNum = days ? parseInt(days) : 7;
      if (isNaN(daysNum) || daysNum < 1 || daysNum > 90) {
        return res.status(400).json({
          success: false,
          message: 'days debe ser un número entre 1 y 90',
        });
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
    } catch (error) {
      console.error('Error al obtener predicciones:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener predicciones',
      });
    }
  }

  /**
   * Exportar datos de consumo
   */
  static async exportData(req, res) {
    try {
      const userId = req.user.uid;
      const { format, startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'startDate y endDate son requeridos',
        });
      }

      const exportFormat = format || 'csv';
      if (exportFormat !== 'csv' && exportFormat !== 'json') {
        return res.status(400).json({
          success: false,
          message: 'format debe ser "csv" o "json"',
        });
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
    } catch (error) {
      console.error('Error al exportar datos:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al exportar datos',
      });
    }
  }
}

