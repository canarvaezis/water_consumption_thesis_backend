/**
 * Servicio de Estadísticas Globales
 * 
 * Proporciona estadísticas agregadas de consumo de agua:
 * - Promedio de consumo de todos los usuarios
 * - Promedio de consumo mensual por usuario
 */

import { ConsumptionSessionModel } from '../models/consumption-session.model.js';
import { UserModel } from '../models/user.model.js';
import { Timestamp } from 'firebase-admin/firestore';

export class GlobalStatisticsService {
  /**
   * Obtener promedio de consumo de todos los usuarios
   * @param {Date|string} startDate - Fecha de inicio (opcional)
   * @param {Date|string} endDate - Fecha de fin (opcional)
   * @returns {Promise<Object>} Estadísticas globales
   */
  static async getGlobalAverageConsumption(startDate = null, endDate = null) {
    // Si no se especifican fechas, usar el último mes
    let start, end;
    
    if (startDate && endDate) {
      start = startDate instanceof Date ? startDate : new Date(startDate);
      end = endDate instanceof Date ? endDate : new Date(endDate);
    } else {
      // Por defecto: último mes
      end = new Date();
      end.setHours(23, 59, 59, 999);
      start = new Date(end);
      start.setMonth(start.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
    }

    // Normalizar fechas
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Obtener todas las sesiones en el rango de fechas
    const allSessions = await ConsumptionSessionModel.findAllByDateRange(start, end);

    if (allSessions.length === 0) {
      return {
        averageLitersPerUser: 0,
        averageLitersPerDay: 0,
        totalUsers: 0,
        totalSessions: 0,
        totalLiters: 0,
        period: {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
        },
      };
    }

    // Obtener todos los usuarios
    const allUsers = await UserModel.findAll();
    const totalUsers = allUsers.length;

    // Calcular totales
    const totalLiters = allSessions.reduce((sum, session) => {
      return sum + (session.totalEstimatedLiters || 0);
    }, 0);

    // Agrupar por usuario
    const consumptionByUser = {};
    allSessions.forEach(session => {
      const userId = session.userId;
      if (!consumptionByUser[userId]) {
        consumptionByUser[userId] = {
          totalLiters: 0,
          sessionCount: 0,
        };
      }
      consumptionByUser[userId].totalLiters += session.totalEstimatedLiters || 0;
      consumptionByUser[userId].sessionCount += 1;
    });

    // Calcular promedios
    const usersWithConsumption = Object.keys(consumptionByUser).length;
    const averageLitersPerUser = usersWithConsumption > 0 
      ? totalLiters / usersWithConsumption 
      : 0;

    // Calcular días en el período
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const averageLitersPerDay = daysDiff > 0 ? totalLiters / daysDiff : 0;

    return {
      averageLitersPerUser: Math.round(averageLitersPerUser * 100) / 100,
      averageLitersPerDay: Math.round(averageLitersPerDay * 100) / 100,
      totalUsers,
      usersWithConsumption,
      totalSessions: allSessions.length,
      totalLiters: Math.round(totalLiters * 100) / 100,
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        days: daysDiff,
      },
    };
  }

  /**
   * Obtener promedio de consumo mensual de cada usuario
   * @param {number} year - Año (opcional, por defecto año actual)
   * @returns {Promise<Array>} Array de usuarios con sus promedios mensuales
   */
  static async getMonthlyAveragePerUser(year = null) {
    const currentYear = year || new Date().getFullYear();
    
    // Obtener todos los usuarios
    const allUsers = await UserModel.findAll();

    if (allUsers.length === 0) {
      return [];
    }

    // Obtener estadísticas mensuales para cada usuario
    const monthlyAverages = await Promise.all(
      allUsers.map(async (user) => {
        try {
          // Obtener sesiones agrupadas por mes
          const sessionsByMonth = await ConsumptionSessionModel.findByUserIdGroupedByMonth(
            user.uid,
            currentYear
          );

          // Calcular promedio mensual para cada mes
          const monthlyData = [];
          const monthlyTotals = {};

          // Inicializar todos los meses del año
          for (let month = 0; month < 12; month++) {
            const monthKey = `${currentYear}-${String(month + 1).padStart(2, '0')}`;
            monthlyTotals[monthKey] = {
              totalLiters: 0,
              sessionCount: 0,
              days: new Date(currentYear, month + 1, 0).getDate(), // Días en el mes
            };
          }

          // Procesar sesiones agrupadas por mes
          Object.keys(sessionsByMonth).forEach(monthKey => {
            const sessions = sessionsByMonth[monthKey];
            const totalLiters = sessions.reduce((sum, session) => {
              return sum + (session.totalEstimatedLiters || 0);
            }, 0);

            const [yearStr, monthStr] = monthKey.split('-');
            const yearNum = parseInt(yearStr);
            const monthNum = parseInt(monthStr);
            
            monthlyTotals[monthKey] = {
              totalLiters,
              sessionCount: sessions.length,
              days: new Date(yearNum, monthNum, 0).getDate(), // Último día del mes anterior = días del mes actual
            };
          });

          // Calcular promedios mensuales
          Object.keys(monthlyTotals).forEach(monthKey => {
            const monthData = monthlyTotals[monthKey];
            const [yearStr, monthStr] = monthKey.split('-');
            const monthNumber = parseInt(monthStr);

            // Calcular promedio diario del mes
            const averagePerDay = monthData.days > 0 
              ? monthData.totalLiters / monthData.days 
              : 0;

            monthlyData.push({
              month: monthNumber,
              monthName: new Date(currentYear, monthNumber - 1, 1).toLocaleString('es-ES', { month: 'long' }),
              year: parseInt(yearStr),
              totalLiters: Math.round(monthData.totalLiters * 100) / 100,
              averagePerDay: Math.round(averagePerDay * 100) / 100,
              sessionCount: monthData.sessionCount,
              daysInMonth: monthData.days,
            });
          });

          // Ordenar por mes
          monthlyData.sort((a, b) => a.month - b.month);

          // Calcular promedio general del año
          const totalYearLiters = monthlyData.reduce((sum, m) => sum + m.totalLiters, 0);
          const totalDays = monthlyData.reduce((sum, m) => sum + m.daysInMonth, 0);
          const averageYear = totalDays > 0 ? totalYearLiters / totalDays : 0;

          return {
            userId: user.uid,
            userName: user.name || 'Usuario',
            userEmail: user.email || '',
            year: currentYear,
            monthlyAverages: monthlyData,
            yearlyAverage: Math.round(averageYear * 100) / 100,
            yearlyTotal: Math.round(totalYearLiters * 100) / 100,
          };
        } catch (error) {
          // Si hay error obteniendo datos del usuario, devolver estructura vacía
          console.error(`Error obteniendo estadísticas para usuario ${user.uid}:`, error);
          return {
            userId: user.uid,
            userName: user.name || 'Usuario',
            userEmail: user.email || '',
            year: currentYear,
            monthlyAverages: [],
            yearlyAverage: 0,
            yearlyTotal: 0,
            error: error.message,
          };
        }
      })
    );

    return monthlyAverages;
  }
}

