/**
 * Controlador de Estadísticas Globales
 * 
 * Maneja las peticiones HTTP relacionadas con estadísticas globales de consumo
 */

import { GlobalStatisticsService } from '../services/global-statistics.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';

export class GlobalStatisticsController {
  /**
   * Obtener promedio de consumo de todos los usuarios
   * GET /api/statistics/global/average
   */
  static getGlobalAverage = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const statistics = await GlobalStatisticsService.getGlobalAverageConsumption(
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    res.json({
      success: true,
      data: statistics,
    });
  });

  /**
   * Obtener promedio de consumo mensual de cada usuario
   * GET /api/statistics/global/monthly-per-user
   */
  static getMonthlyAveragePerUser = asyncHandler(async (req, res) => {
    const { year } = req.query;
    const yearNumber = year ? parseInt(year) : null;

    if (yearNumber && (isNaN(yearNumber) || yearNumber < 2000 || yearNumber > 2100)) {
      return res.status(400).json({
        success: false,
        message: 'El año debe ser un número válido entre 2000 y 2100',
      });
    }

    const monthlyAverages = await GlobalStatisticsService.getMonthlyAveragePerUser(yearNumber);

    res.json({
      success: true,
      data: monthlyAverages,
      count: monthlyAverages.length,
    });
  });
}

