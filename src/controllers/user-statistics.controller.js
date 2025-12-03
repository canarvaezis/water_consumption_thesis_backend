/**
 * Controlador de Estadísticas del Usuario
 */

import { UserStatisticsService } from '../services/user-statistics.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';

export class UserStatisticsController {
  /**
   * Obtener estadísticas del día actual
   * GET /api/user-statistics/today
   */
  static getTodayStatistics = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const statistics = await UserStatisticsService.getTodayStatistics(userId);
    
    res.json({
      success: true,
      data: statistics,
    });
  });

  /**
   * Obtener estadísticas del mes actual
   * GET /api/user-statistics/current-month
   */
  static getCurrentMonthStatistics = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const statistics = await UserStatisticsService.getCurrentMonthStatistics(userId);
    
    res.json({
      success: true,
      data: statistics,
    });
  });

  /**
   * Obtener promedio diario del usuario
   * GET /api/user-statistics/average-daily
   */
  static getAverageDaily = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const statistics = await UserStatisticsService.getAverageDailyConsumption(userId);
    
    res.json({
      success: true,
      data: statistics,
    });
  });

  /**
   * Obtener promedio mensual del usuario
   * GET /api/user-statistics/average-monthly
   */
  static getAverageMonthly = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const statistics = await UserStatisticsService.getAverageMonthlyConsumption(userId);
    
    res.json({
      success: true,
      data: statistics,
    });
  });

  /**
   * Obtener consumo en un día específico
   * GET /api/user-statistics/day/:date
   */
  static getDayConsumption = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { date } = req.params;
    
    const consumption = await UserStatisticsService.getDayConsumption(userId, date);
    
    res.json({
      success: true,
      data: consumption,
    });
  });

  /**
   * Obtener todas las estadísticas del usuario
   * GET /api/user-statistics/all
   */
  static getAllStatistics = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const statistics = await UserStatisticsService.getAllUserStatistics(userId);
    
    res.json({
      success: true,
      data: statistics,
    });
  });
}

