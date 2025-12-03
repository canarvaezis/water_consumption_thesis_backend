/**
 * Servicio de Estadísticas del Usuario
 * 
 * Proporciona estadísticas calculadas del usuario:
 * - Promedio diario del usuario
 * - Promedio mensual del usuario
 * - Litros y costos del día actual
 * - Litros y costos del mes actual
 * - Consumo en día específico
 */

import { ConsumptionSessionModel } from '../models/consumption-session.model.js';
import { UserModel } from '../models/user.model.js';
import { calculateWaterCost } from '../utils/water-calculations.utils.js';

export class UserStatisticsService {
  /**
   * Obtener estadísticas del día actual
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Estadísticas del día actual
   */
  static async getTodayStatistics(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const session = await ConsumptionSessionModel.findByUserAndDate(userId, today);
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    const liters = session?.totalEstimatedLiters || 0;
    let cost = 0;
    
    if (liters > 0) {
      if (user.stratum === null || user.stratum === undefined) {
        throw new Error('El estrato del usuario no está configurado. Por favor, configure su estrato antes de ver estadísticas.');
      }
      cost = calculateWaterCost(liters, user.stratum);
    }
    
    return {
      date: today.toISOString().split('T')[0],
      liters: Math.round(liters * 100) / 100,
      cost: Math.round(cost * 100) / 100,
      hasConsumption: liters > 0,
    };
  }

  /**
   * Obtener estadísticas del mes actual
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Estadísticas del mes actual
   */
  static async getCurrentMonthStatistics(userId) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const sessions = await ConsumptionSessionModel.findByDateRange(userId, startOfMonth, endOfMonth);
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    const totalLiters = sessions.reduce((sum, s) => sum + (s.totalEstimatedLiters || 0), 0);
    let totalCost = 0;
    let averageDailyLiters = 0;
    let averageDailyCost = 0;
    
    if (totalLiters > 0) {
      if (user.stratum === null || user.stratum === undefined) {
        throw new Error('El estrato del usuario no está configurado. Por favor, configure su estrato antes de ver estadísticas.');
      }
      totalCost = calculateWaterCost(totalLiters, user.stratum);
      
      // Calcular promedio diario del mes
      const currentDay = now.getDate();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysWithData = currentDay > 0 ? currentDay : 1;
      
      averageDailyLiters = totalLiters / daysWithData;
      averageDailyCost = totalCost / daysWithData;
    }
    
    return {
      month: now.getMonth() + 1,
      monthName: now.toLocaleString('es-ES', { month: 'long' }),
      year: now.getFullYear(),
      totalLiters: Math.round(totalLiters * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      averageDailyLiters: Math.round(averageDailyLiters * 100) / 100,
      averageDailyCost: Math.round(averageDailyCost * 100) / 100,
      daysWithConsumption: sessions.length,
      currentDay: now.getDate(),
      daysInMonth: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
    };
  }

  /**
   * Obtener promedio diario general del usuario (basado en todos sus registros)
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Promedio diario del usuario
   */
  static async getAverageDailyConsumption(userId) {
    // Obtener todas las sesiones del usuario
    const allSessions = await ConsumptionSessionModel.findByUserId(userId, 1000); // Límite alto para obtener todas
    
    if (allSessions.length === 0) {
      return {
        averageDailyLiters: 0,
        averageDailyCost: 0,
        totalSessions: 0,
        totalLiters: 0,
        totalCost: 0,
      };
    }
    
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    const totalLiters = allSessions.reduce((sum, s) => sum + (s.totalEstimatedLiters || 0), 0);
    let totalCost = 0;
    
    if (totalLiters > 0) {
      if (user.stratum === null || user.stratum === undefined) {
        throw new Error('El estrato del usuario no está configurado. Por favor, configure su estrato antes de ver estadísticas.');
      }
      totalCost = calculateWaterCost(totalLiters, user.stratum);
    }
    
    const averageDailyLiters = totalLiters / allSessions.length;
    const averageDailyCost = totalCost / allSessions.length;
    
    return {
      averageDailyLiters: Math.round(averageDailyLiters * 100) / 100,
      averageDailyCost: Math.round(averageDailyCost * 100) / 100,
      totalSessions: allSessions.length,
      totalLiters: Math.round(totalLiters * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
    };
  }

  /**
   * Obtener promedio mensual del usuario (basado en todos los meses con registros)
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Promedio mensual del usuario
   */
  static async getAverageMonthlyConsumption(userId) {
    // Obtener todas las sesiones del usuario
    const allSessions = await ConsumptionSessionModel.findByUserId(userId, 1000);
    
    if (allSessions.length === 0) {
      return {
        averageMonthlyLiters: 0,
        averageMonthlyCost: 0,
        totalMonths: 0,
        monthlyData: [],
      };
    }
    
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    // Agrupar sesiones por mes
    const monthlyData = {};
    
    for (const session of allSessions) {
      const sessionDate = session.consumptionDate?.toDate 
        ? session.consumptionDate.toDate() 
        : new Date(session.consumptionDate);
      
      const monthKey = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          year: sessionDate.getFullYear(),
          month: sessionDate.getMonth() + 1,
          monthName: sessionDate.toLocaleString('es-ES', { month: 'long' }),
          totalLiters: 0,
          sessionCount: 0,
        };
      }
      
      monthlyData[monthKey].totalLiters += session.totalEstimatedLiters || 0;
      monthlyData[monthKey].sessionCount += 1;
    }
    
    // Calcular costos y promedios
    const monthlyStats = [];
    let totalMonthlyLiters = 0;
    let totalMonthlyCost = 0;
    
    for (const monthKey of Object.keys(monthlyData)) {
      const monthInfo = monthlyData[monthKey];
      let monthCost = 0;
      
      if (monthInfo.totalLiters > 0) {
        if (user.stratum === null || user.stratum === undefined) {
          throw new Error('El estrato del usuario no está configurado. Por favor, configure su estrato antes de ver estadísticas.');
        }
        monthCost = calculateWaterCost(monthInfo.totalLiters, user.stratum);
      }
      
      monthlyStats.push({
        ...monthInfo,
        totalLiters: Math.round(monthInfo.totalLiters * 100) / 100,
        totalCost: Math.round(monthCost * 100) / 100,
        averageDailyLiters: Math.round((monthInfo.totalLiters / monthInfo.sessionCount) * 100) / 100,
      });
      
      totalMonthlyLiters += monthInfo.totalLiters;
      totalMonthlyCost += monthCost;
    }
    
    // Ordenar por fecha (más reciente primero)
    monthlyStats.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
    
    const totalMonths = monthlyStats.length;
    const averageMonthlyLiters = totalMonths > 0 ? totalMonthlyLiters / totalMonths : 0;
    const averageMonthlyCost = totalMonths > 0 ? totalMonthlyCost / totalMonths : 0;
    
    return {
      averageMonthlyLiters: Math.round(averageMonthlyLiters * 100) / 100,
      averageMonthlyCost: Math.round(averageMonthlyCost * 100) / 100,
      totalMonths,
      totalLiters: Math.round(totalMonthlyLiters * 100) / 100,
      totalCost: Math.round(totalMonthlyCost * 100) / 100,
      monthlyData: monthlyStats,
    };
  }

  /**
   * Obtener consumo en un día específico
   * @param {string} userId - ID del usuario
   * @param {Date|string} date - Fecha específica
   * @returns {Promise<Object>} Consumo del día específico
   */
  static async getDayConsumption(userId, date) {
    const targetDate = date instanceof Date ? date : new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const session = await ConsumptionSessionModel.findByUserAndDate(userId, targetDate);
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    const liters = session?.totalEstimatedLiters || 0;
    let cost = 0;
    
    if (liters > 0) {
      if (user.stratum === null || user.stratum === undefined) {
        throw new Error('El estrato del usuario no está configurado. Por favor, configure su estrato antes de ver estadísticas.');
      }
      cost = calculateWaterCost(liters, user.stratum);
    }
    
    return {
      date: targetDate.toISOString().split('T')[0],
      liters: Math.round(liters * 100) / 100,
      cost: Math.round(cost * 100) / 100,
      hasConsumption: liters > 0,
      sessionId: session?.id || null,
    };
  }

  /**
   * Obtener todas las estadísticas del usuario en un solo endpoint
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Todas las estadísticas del usuario
   */
  static async getAllUserStatistics(userId) {
    const [
      todayStats,
      monthStats,
      averageDaily,
      averageMonthly,
    ] = await Promise.all([
      this.getTodayStatistics(userId).catch(() => ({ date: null, liters: 0, cost: 0, hasConsumption: false })),
      this.getCurrentMonthStatistics(userId).catch(() => ({ 
        month: null, 
        monthName: null, 
        year: null, 
        totalLiters: 0, 
        totalCost: 0, 
        averageDailyLiters: 0, 
        averageDailyCost: 0,
        daysWithConsumption: 0,
        currentDay: 0,
        daysInMonth: 0,
      })),
      this.getAverageDailyConsumption(userId).catch(() => ({ 
        averageDailyLiters: 0, 
        averageDailyCost: 0, 
        totalSessions: 0, 
        totalLiters: 0, 
        totalCost: 0,
      })),
      this.getAverageMonthlyConsumption(userId).catch(() => ({ 
        averageMonthlyLiters: 0, 
        averageMonthlyCost: 0, 
        totalMonths: 0,
        totalLiters: 0,
        totalCost: 0,
        monthlyData: [],
      })),
    ]);
    
    return {
      today: todayStats,
      currentMonth: monthStats,
      averageDaily,
      averageMonthly,
    };
  }
}

