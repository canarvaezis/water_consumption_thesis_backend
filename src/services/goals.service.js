/**
 * Servicio de Metas de Consumo
 * 
 * Lógica de negocio para gestionar metas diarias y mensuales de consumo de agua
 */

import { UserModel } from '../models/user.model.js';
import { ConsumptionService } from './consumption.service.js';
import { PointsService } from './points.service.js';
import { NotificationAlertsService } from './notification-alerts.service.js';

export class GoalsService {
  /**
   * Obtener metas del usuario
   */
  static async getUserGoals(userId) {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    return {
      dailyGoal: user.dailyGoal || null,
      monthlyGoal: user.monthlyGoal || null,
    };
  }

  /**
   * Actualizar metas del usuario
   */
  static async updateUserGoals(userId, { dailyGoal, monthlyGoal }) {
    const updateData = {};
    
    // Validar y agregar dailyGoal si se proporciona
    if (dailyGoal !== undefined) {
      if (dailyGoal !== null && (typeof dailyGoal !== 'number' || dailyGoal < 0)) {
        throw new Error('La meta diaria debe ser un número positivo o null');
      }
      updateData.dailyGoal = dailyGoal;
    }
    
    // Validar y agregar monthlyGoal si se proporciona
    if (monthlyGoal !== undefined) {
      if (monthlyGoal !== null && (typeof monthlyGoal !== 'number' || monthlyGoal < 0)) {
        throw new Error('La meta mensual debe ser un número positivo o null');
      }
      updateData.monthlyGoal = monthlyGoal;
    }
    
    if (Object.keys(updateData).length === 0) {
      throw new Error('Debe proporcionar al menos una meta para actualizar');
    }
    
    // Obtener usuario actual para verificar si es primera vez
    const currentUser = await UserModel.findById(userId);
    
    const updatedUser = await UserModel.update(userId, updateData);
    
    // Verificar si es la primera vez que se establecen las metas
    if (dailyGoal !== undefined && currentUser.dailyGoal === null && dailyGoal !== null) {
      // Otorgar puntos por establecer meta diaria (solo una vez)
      await PointsService.awardDailyGoalSetPoints(userId);
    }
    
    if (monthlyGoal !== undefined && currentUser.monthlyGoal === null && monthlyGoal !== null) {
      // Otorgar puntos por establecer meta mensual (solo una vez)
      await PointsService.awardMonthlyGoalSetPoints(userId);
    }
    
    return {
      dailyGoal: updatedUser.dailyGoal || null,
      monthlyGoal: updatedUser.monthlyGoal || null,
    };
  }

  /**
   * Obtener progreso de metas del usuario
   * Retorna el consumo actual vs las metas establecidas
   */
  static async getGoalsProgress(userId) {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    const goals = {
      dailyGoal: user.dailyGoal || null,
      monthlyGoal: user.monthlyGoal || null,
    };
    
    // Obtener consumo del día actual
    const todaySession = await ConsumptionService.getTodaySessionWithDetails(userId);
    const dailyConsumption = todaySession?.totalEstimatedLiters || 0;
    
    // Calcular consumo mensual (mes actual)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const monthlyHistory = await ConsumptionService.getConsumptionHistory(userId, {
      startDate: startOfMonth,
      endDate: endOfMonth,
      limit: 1000, // Obtener todas las sesiones del mes
    });
    
    // Sumar consumo mensual (monthlyHistory tiene estructura { sessions: [...], statistics: {...} })
    const monthlyConsumption = monthlyHistory.sessions?.reduce((total, session) => {
      return total + (session.totalEstimatedLiters || 0);
    }, 0) || 0;
    
    // Calcular porcentajes de progreso (redondeado a 1 decimal)
    const dailyProgress = goals.dailyGoal 
      ? Math.min(Math.round((dailyConsumption / goals.dailyGoal) * 100 * 10) / 10, 100)
      : null;
    
    const monthlyProgress = goals.monthlyGoal
      ? Math.min(Math.round((monthlyConsumption / goals.monthlyGoal) * 100 * 10) / 10, 100)
      : null;
    
    // Calcular días restantes del mes
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const daysRemaining = daysInMonth - currentDay;
    
    // Calcular consumo promedio diario del mes
    const averageDailyConsumption = currentDay > 0 
      ? monthlyConsumption / currentDay 
      : 0;
    
    // Proyección mensual basada en el promedio actual
    const projectedMonthlyConsumption = averageDailyConsumption * daysInMonth;
    
    // Verificar y otorgar puntos por cumplir metas
    const dailyAchieved = goals.dailyGoal 
      ? dailyConsumption <= goals.dailyGoal
      : null;
    const monthlyAchieved = goals.monthlyGoal
      ? monthlyConsumption <= goals.monthlyGoal
      : null;
    
    // Ejecutar notificaciones en paralelo sin bloquear la respuesta
    // (No esperamos estas operaciones para no retrasar la respuesta al frontend)
    Promise.all([
      // Verificar si es el final del día (después de las 23:00) para otorgar puntos diarios
      (async () => {
        try {
          const currentHour = now.getHours();
          if (dailyAchieved && currentHour >= 23) {
            const today = new Date(now);
            today.setHours(0, 0, 0, 0);
            await PointsService.awardDailyGoalPoints(userId, today);
            await NotificationAlertsService.sendDailyGoalAchieved(userId);
          }
        } catch (error) {
          console.error('Error al otorgar puntos diarios:', error);
        }
      })(),
      // Verificar si es el último día del mes para otorgar puntos mensuales
      (async () => {
        try {
          if (monthlyAchieved && daysRemaining === 0) {
            await PointsService.awardMonthlyGoalPoints(userId, now.getFullYear(), now.getMonth() + 1);
            await NotificationAlertsService.sendMonthlyGoalAchieved(userId);
          }
        } catch (error) {
          console.error('Error al otorgar puntos mensuales:', error);
        }
      })(),
      // Enviar alertas de metas (si aplica) - PASAR DATOS PARA EVITAR RECURSIÓN
      (async () => {
        try {
          const dailyData = {
            goal: goals.dailyGoal,
            consumption: dailyConsumption,
            percentage: dailyProgress,
            remaining: goals.dailyGoal 
              ? Math.max(0, goals.dailyGoal - dailyConsumption)
              : null,
            achieved: dailyAchieved,
          };
          await NotificationAlertsService.sendDailyGoalWarning(userId, dailyData);
        } catch (error) {
          console.error('Error al enviar advertencia de meta diaria:', error);
        }
      })(),
      (async () => {
        try {
          const dailyData = {
            goal: goals.dailyGoal,
            consumption: dailyConsumption,
            percentage: dailyProgress,
            remaining: goals.dailyGoal 
              ? Math.max(0, goals.dailyGoal - dailyConsumption)
              : null,
            achieved: dailyAchieved,
          };
          await NotificationAlertsService.sendDailyGoalExceeded(userId, dailyData);
        } catch (error) {
          console.error('Error al enviar notificación de meta diaria excedida:', error);
        }
      })(),
      (async () => {
        try {
          const monthlyData = {
            goal: goals.monthlyGoal,
            consumption: monthlyConsumption,
            percentage: monthlyProgress,
            remaining: goals.monthlyGoal
              ? Math.max(0, goals.monthlyGoal - monthlyConsumption)
              : null,
            achieved: monthlyAchieved,
            daysRemaining,
          };
          await NotificationAlertsService.sendMonthlyGoalWarning(userId, monthlyData);
        } catch (error) {
          console.error('Error al enviar advertencia de meta mensual:', error);
        }
      })(),
    ]).catch(error => {
      console.error('Error en notificaciones de metas:', error);
    });
    
    return {
      goals,
      daily: {
        consumption: Math.round(dailyConsumption * 10) / 10,
        goal: goals.dailyGoal,
        percentage: dailyProgress !== null ? Math.round(dailyProgress * 10) / 10 : null,
        remaining: goals.dailyGoal 
          ? Math.round(Math.max(0, goals.dailyGoal - dailyConsumption) * 10) / 10
          : null,
        achieved: dailyAchieved,
      },
      monthly: {
        consumption: Math.round(monthlyConsumption * 10) / 10,
        goal: goals.monthlyGoal,
        percentage: monthlyProgress !== null ? Math.round(monthlyProgress * 10) / 10 : null,
        remaining: goals.monthlyGoal
          ? Math.round(Math.max(0, goals.monthlyGoal - monthlyConsumption) * 10) / 10
          : null,
        achieved: monthlyAchieved,
        averageDailyConsumption: Math.round(averageDailyConsumption * 10) / 10,
        projectedMonthlyConsumption: Math.round(projectedMonthlyConsumption * 10) / 10,
        daysRemaining,
      },
    };
  }
}

