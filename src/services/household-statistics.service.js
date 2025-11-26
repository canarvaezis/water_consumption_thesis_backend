/**
 * Servicio de Estadísticas Familiares
 * 
 * Calcula estadísticas de consumo para toda la familia
 */

import { UserHouseholdModel } from '../models/user-household.model.js';
import { ConsumptionSessionModel } from '../models/consumption-session.model.js';
import { UserConsumptionDetailModel } from '../models/user-consumption-detail.model.js';
import { UserModel } from '../models/user.model.js';
import { calculateWaterCost } from '../utils/water-calculations.utils.js';
import { Timestamp } from 'firebase-admin/firestore';

export class HouseholdStatisticsService {
  /**
   * Obtener consumo total de la familia para una fecha específica
   */
  static async getHouseholdDailyConsumption(householdId, date) {
    // Obtener todos los miembros de la familia
    const members = await UserHouseholdModel.getUsersByHouseholdId(householdId);
    
    if (members.length === 0) {
      return {
        date,
        totalLiters: 0,
        totalCost: 0,
        memberCount: 0,
        members: [],
      };
    }

    // Convertir fecha a Date si es string
    const targetDate = date instanceof Date ? date : new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Obtener sesiones de todos los miembros para esa fecha
    const memberSessions = await Promise.all(
      members.map(async (member) => {
        const session = await ConsumptionSessionModel.findByUserAndDate(
          member.userId,
          targetDate
        );
        
        if (!session) {
          return {
            userId: member.userId,
            liters: 0,
            cost: 0,
            details: [],
          };
        }

        // Obtener detalles de la sesión
        const details = await UserConsumptionDetailModel.findBySessionId(session.id);
        
        // Calcular costo basado en el estrato del usuario
        const user = await UserModel.findByUid(member.userId);
        const cost = calculateWaterCost(session.totalEstimatedLiters, user?.stratum || 3);

        return {
          userId: member.userId,
          userName: user?.name || 'Usuario desconocido',
          liters: session.totalEstimatedLiters || 0,
          cost: cost,
          details: details.map(d => ({
            itemName: d.itemName,
            liters: d.estimatedLiters,
            timesPerDay: d.timesPerDay,
          })),
        };
      })
    );

    // Calcular totales
    const totalLiters = memberSessions.reduce((sum, m) => sum + m.liters, 0);
    const totalCost = memberSessions.reduce((sum, m) => sum + m.cost, 0);

    return {
      date: targetDate,
      totalLiters,
      totalCost,
      memberCount: members.length,
      members: memberSessions,
    };
  }

  /**
   * Obtener consumo de la familia en un rango de fechas
   */
  static async getHouseholdConsumptionHistory(householdId, startDate, endDate) {
    // Obtener todos los miembros
    const members = await UserHouseholdModel.getUsersByHouseholdId(householdId);
    
    if (members.length === 0) {
      return [];
    }

    // Convertir fechas
    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    // Obtener todas las sesiones de todos los miembros en el rango
    const allSessions = await Promise.all(
      members.map(async (member) => {
        const sessions = await ConsumptionSessionModel.findByDateRange(
          member.userId,
          start,
          end
        );
        return sessions.map(s => ({ ...s, userId: member.userId }));
      })
    );

    // Agrupar por fecha
    const sessionsByDate = {};
    
    allSessions.flat().forEach(session => {
      const sessionDate = session.consumptionDate?.toDate?.() || new Date(session.consumptionDate);
      const dateKey = sessionDate.toISOString().split('T')[0];
      
      if (!sessionsByDate[dateKey]) {
        sessionsByDate[dateKey] = [];
      }
      
      sessionsByDate[dateKey].push(session);
    });

    // Calcular totales por fecha
    const history = await Promise.all(
      Object.entries(sessionsByDate).map(async ([dateKey, sessions]) => {
        const date = new Date(dateKey);
        let totalLiters = 0;
        let totalCost = 0;

        for (const session of sessions) {
          totalLiters += session.totalEstimatedLiters || 0;
          
          const user = await UserModel.findByUid(session.userId);
          const cost = calculateWaterCost(
            session.totalEstimatedLiters || 0,
            user?.stratum || 3
          );
          totalCost += cost;
        }

        return {
          date,
          totalLiters,
          totalCost,
          memberCount: new Set(sessions.map(s => s.userId)).size,
        };
      })
    );

    // Ordenar por fecha
    history.sort((a, b) => new Date(a.date) - new Date(b.date));

    return history;
  }

  /**
   * Obtener estadísticas generales de la familia
   */
  static async getHouseholdStatistics(householdId, period = 'month') {
    // Obtener todos los miembros
    const members = await UserHouseholdModel.getUsersByHouseholdId(householdId);
    
    if (members.length === 0) {
      return {
        totalMembers: 0,
        totalLiters: 0,
        totalCost: 0,
        averageLitersPerMember: 0,
        averageCostPerMember: 0,
        topConsumers: [],
        consumptionByCategory: {},
        period,
      };
    }

    // Calcular fechas según el período
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    startDate.setHours(0, 0, 0, 0);

    // Obtener todas las sesiones en el período
    const allSessions = await Promise.all(
      members.map(async (member) => {
        const sessions = await ConsumptionSessionModel.findByDateRange(
          member.userId,
          startDate,
          endDate
        );
        return sessions.map(s => ({ ...s, userId: member.userId }));
      })
    );

    const sessions = allSessions.flat();

    // Calcular totales
    let totalLiters = 0;
    let totalCost = 0;
    const consumptionByUser = {};
    const consumptionByCategory = {};

    for (const session of sessions) {
      totalLiters += session.totalEstimatedLiters || 0;
      
      const user = await UserModel.findByUid(session.userId);
      const cost = calculateWaterCost(
        session.totalEstimatedLiters || 0,
        user?.stratum || 3
      );
      totalCost += cost;

      // Acumular por usuario
      if (!consumptionByUser[session.userId]) {
        consumptionByUser[session.userId] = {
          userId: session.userId,
          liters: 0,
          cost: 0,
        };
      }
      consumptionByUser[session.userId].liters += session.totalEstimatedLiters || 0;
      consumptionByUser[session.userId].cost += cost;

      // Obtener detalles para categorías
      const details = await UserConsumptionDetailModel.findBySessionId(session.id);
      details.forEach(detail => {
        const category = detail.categoryName || 'Sin categoría';
        if (!consumptionByCategory[category]) {
          consumptionByCategory[category] = 0;
        }
        consumptionByCategory[category] += detail.estimatedLiters || 0;
      });
    }

    // Obtener información de usuarios para top consumers
    const topConsumers = await Promise.all(
      Object.entries(consumptionByUser)
        .sort((a, b) => b[1].liters - a[1].liters)
        .slice(0, 5)
        .map(async ([userId, data]) => {
          const user = await UserModel.findByUid(userId);
          return {
            userId,
            userName: user?.name || 'Usuario desconocido',
            avatarUrl: user?.avatarUrl || null,
            liters: data.liters,
            cost: data.cost,
          };
        })
    );

    return {
      totalMembers: members.length,
      totalLiters,
      totalCost,
      averageLitersPerMember: totalLiters / members.length,
      averageCostPerMember: totalCost / members.length,
      topConsumers,
      consumptionByCategory,
      period,
      startDate,
      endDate,
    };
  }

  /**
   * Obtener consumo por miembro en un período
   */
  static async getConsumptionByMember(householdId, startDate, endDate) {
    const members = await UserHouseholdModel.getUsersByHouseholdId(householdId);
    
    if (members.length === 0) {
      return [];
    }

    const start = startDate instanceof Date ? startDate : new Date(startDate);
    const end = endDate instanceof Date ? endDate : new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const memberStats = await Promise.all(
      members.map(async (member) => {
        const sessions = await ConsumptionSessionModel.findByDateRange(
          member.userId,
          start,
          end
        );

        let totalLiters = 0;
        let sessionCount = 0;

        for (const session of sessions) {
          totalLiters += session.totalEstimatedLiters || 0;
          sessionCount++;
        }

        const user = await UserModel.findByUid(member.userId);
        const cost = calculateWaterCost(totalLiters, user?.stratum || 3);

        return {
          userId: member.userId,
          userName: user?.name || 'Usuario desconocido',
          avatarUrl: user?.avatarUrl || null,
          nickname: user?.nickname || null,
          role: member.role,
          totalLiters,
          totalCost: cost,
          sessionCount,
          averageLitersPerDay: sessionCount > 0 ? totalLiters / sessionCount : 0,
        };
      })
    );

    // Ordenar por consumo descendente
    memberStats.sort((a, b) => b.totalLiters - a.totalLiters);

    return memberStats;
  }
}

