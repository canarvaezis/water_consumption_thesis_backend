/**
 * Servicio de Alertas y Recordatorios
 * 
 * Gestiona las notificaciones push para diferentes eventos:
 * - Recordatorios de consumo
 * - Alertas de metas
 * - Felicitaciones por logros
 * - Recordatorios de familia
 */

import { PushNotificationService } from './push-notification.service.js';
import { ConsumptionService } from './consumption.service.js';
import { GoalsService } from './goals.service.js';
import { UserMetricsModel } from '../models/user-metrics.model.js';
import { ConsumptionSessionModel } from '../models/consumption-session.model.js';
import { UserModel } from '../models/user.model.js';
import logger from '../utils/logger.js';

export class NotificationAlertsService {
  /**
   * Enviar recordatorio de consumo (si no se ha registrado hoy)
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object|null>} - Resultado del envío o null si ya registró
   */
  static async sendConsumptionReminder(userId) {
    try {
      // Verificar si ya registró consumo hoy
      const todaySession = await ConsumptionService.getTodaySessionWithDetails(userId);
      
      if (todaySession && todaySession.details && todaySession.details.length > 0) {
        // Ya registró consumo, no enviar recordatorio
        return null;
      }

      // Enviar notificación
      return await PushNotificationService.sendToUser(
        userId,
        {
          title: '💧 Recordatorio de consumo',
          body: 'No has registrado consumo hoy. ¡Recuerda hacerlo!',
        },
        {
          type: 'consumption_reminder',
          action: 'register_consumption',
        }
      );
    } catch (error) {
      logger.error(`Error enviando recordatorio de consumo a usuario ${userId}:`, {
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Enviar alerta de meta diaria cerca de excederse (80%+)
   * @param {string} userId - ID del usuario
   * @param {Object} dailyData - Datos de progreso diario (opcional, para evitar recursión)
   * @returns {Promise<Object|null>} - Resultado del envío o null si no aplica
   */
  static async sendDailyGoalWarning(userId, dailyData = null) {
    try {
      // Si no se pasan datos, calcularlos (pero esto puede causar recursión si se llama desde getGoalsProgress)
      let progress;
      if (dailyData) {
        progress = { daily: dailyData };
      } else {
        progress = await GoalsService.getGoalsProgress(userId);
      }
      
      if (!progress.daily.goal || progress.daily.percentage < 80) {
        return null; // No aplica
      }

      if (progress.daily.achieved === false) {
        // Ya excedió, no enviar esta alerta
        return null;
      }

      const remaining = progress.daily.remaining || 0;

      return await PushNotificationService.sendToUser(
        userId,
        {
          title: '⚠️ Meta diaria cerca',
          body: `Estás cerca de exceder tu meta diaria. Te quedan ${remaining.toFixed(1)} litros.`,
        },
        {
          type: 'goal_warning',
          goalType: 'daily',
          percentage: progress.daily.percentage,
          remaining,
        }
      );
    } catch (error) {
      logger.error(`Error enviando alerta de meta diaria a usuario ${userId}:`, {
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Enviar alerta de meta diaria excedida
   * @param {string} userId - ID del usuario
   * @param {Object} dailyData - Datos de progreso diario (opcional, para evitar recursión)
   * @returns {Promise<Object|null>} - Resultado del envío o null si no aplica
   */
  static async sendDailyGoalExceeded(userId, dailyData = null) {
    try {
      // Si no se pasan datos, calcularlos (pero esto puede causar recursión si se llama desde getGoalsProgress)
      let progress;
      if (dailyData) {
        progress = { daily: dailyData };
      } else {
        progress = await GoalsService.getGoalsProgress(userId);
      }
      
      if (!progress.daily.goal || progress.daily.achieved !== false) {
        return null; // No aplica
      }

      const excess = progress.daily.consumption - progress.daily.goal;

      return await PushNotificationService.sendToUser(
        userId,
        {
          title: '⚠️ Meta diaria excedida',
          body: `Has excedido tu meta diaria por ${excess.toFixed(1)} litros. Intenta reducir mañana.`,
        },
        {
          type: 'goal_exceeded',
          goalType: 'daily',
          excess,
        }
      );
    } catch (error) {
      logger.error(`Error enviando alerta de meta diaria excedida a usuario ${userId}:`, {
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Enviar alerta de meta mensual cerca de excederse (90%+)
   * @param {string} userId - ID del usuario
   * @param {Object} monthlyData - Datos de progreso mensual (opcional, para evitar recursión)
   * @returns {Promise<Object|null>} - Resultado del envío o null si no aplica
   */
  static async sendMonthlyGoalWarning(userId, monthlyData = null) {
    try {
      // Si no se pasan datos, calcularlos (pero esto puede causar recursión si se llama desde getGoalsProgress)
      let progress;
      if (monthlyData) {
        progress = { monthly: monthlyData };
      } else {
        progress = await GoalsService.getGoalsProgress(userId);
      }
      
      if (!progress.monthly.goal || progress.monthly.percentage < 90) {
        return null; // No aplica
      }

      if (progress.monthly.achieved === false) {
        // Ya excedió, no enviar esta alerta
        return null;
      }

      const remaining = progress.monthly.remaining || 0;
      const daysRemaining = progress.monthly.daysRemaining || 0;

      return await PushNotificationService.sendToUser(
        userId,
        {
          title: '⚠️ Meta mensual cerca',
          body: `Estás cerca de exceder tu meta mensual. Te quedan ${remaining.toFixed(1)} litros y ${daysRemaining} días.`,
        },
        {
          type: 'goal_warning',
          goalType: 'monthly',
          percentage: progress.monthly.percentage,
          remaining,
          daysRemaining,
        }
      );
    } catch (error) {
      logger.error(`Error enviando alerta de meta mensual a usuario ${userId}:`, {
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Enviar felicitación por cumplir meta diaria
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object|null>} - Resultado del envío o null si no aplica
   */
  static async sendDailyGoalAchieved(userId) {
    try {
      const progress = await GoalsService.getGoalsProgress(userId);
      
      if (!progress.daily.goal || !progress.daily.achieved) {
        return null; // No aplica
      }

      // Solo enviar al final del día (después de las 22:00)
      const now = new Date();
      if (now.getHours() < 22) {
        return null;
      }

      return await PushNotificationService.sendToUser(
        userId,
        {
          title: '🎉 ¡Meta diaria cumplida!',
          body: `¡Felicitaciones! Cumpliste tu meta diaria. Ganaste 20 puntos.`,
        },
        {
          type: 'goal_achieved',
          goalType: 'daily',
          points: 20,
        }
      );
    } catch (error) {
      logger.error(`Error enviando felicitación de meta diaria a usuario ${userId}:`, {
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Enviar felicitación por cumplir meta mensual
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object|null>} - Resultado del envío o null si no aplica
   */
  static async sendMonthlyGoalAchieved(userId) {
    try {
      const progress = await GoalsService.getGoalsProgress(userId);
      
      if (!progress.monthly.goal || !progress.monthly.achieved) {
        return null; // No aplica
      }

      // Solo enviar el último día del mes
      const now = new Date();
      const daysRemaining = progress.monthly.daysRemaining || 0;
      if (daysRemaining > 0) {
        return null;
      }

      return await PushNotificationService.sendToUser(
        userId,
        {
          title: '🎉 ¡Meta mensual cumplida!',
          body: `¡Felicitaciones! Cumpliste tu meta mensual. Ganaste 100 puntos.`,
        },
        {
          type: 'goal_achieved',
          goalType: 'monthly',
          points: 100,
        }
      );
    } catch (error) {
      logger.error(`Error enviando felicitación de meta mensual a usuario ${userId}:`, {
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Enviar felicitación por hito de racha alcanzado
   * @param {string} userId - ID del usuario
   * @param {number} streakDays - Días de racha alcanzados
   * @param {number} points - Puntos ganados
   * @returns {Promise<Object|null>} - Resultado del envío
   */
  static async sendStreakMilestone(userId, streakDays, points) {
    try {
      let message = '';
      if (streakDays === 10) {
        message = `¡Increíble! Llevas 10 días consecutivos. Ganaste ${points} puntos.`;
      } else if (streakDays === 20) {
        message = `¡Excelente! Llevas 20 días consecutivos. Ganaste ${points} puntos.`;
      } else if (streakDays === 100) {
        message = `¡Increíble logro! Llevas 100 días consecutivos. Ganaste ${points} puntos.`;
      } else {
        message = `¡Felicidades! Llevas ${streakDays} días consecutivos. Ganaste ${points} puntos.`;
      }

      return await PushNotificationService.sendToUser(
        userId,
        {
          title: '🔥 ¡Racha alcanzada!',
          body: message,
        },
        {
          type: 'streak_milestone',
          streakDays,
          points,
        }
      );
    } catch (error) {
      logger.error(`Error enviando felicitación de racha a usuario ${userId}:`, {
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Enviar notificación de nuevo miembro en familia
   * @param {string} userId - ID del usuario a notificar
   * @param {string} memberName - Nombre del nuevo miembro
   * @returns {Promise<Object|null>} - Resultado del envío
   */
  static async sendFamilyMemberJoined(userId, memberName) {
    try {
      return await PushNotificationService.sendToUser(
        userId,
        {
          title: '👨‍👩‍👧‍👦 Nuevo miembro',
          body: `${memberName} se unió a tu familia.`,
        },
        {
          type: 'family_member_joined',
          memberName,
        }
      );
    } catch (error) {
      logger.error(`Error enviando notificación de nuevo miembro a usuario ${userId}:`, {
        error: error.message,
      });
      return null;
    }
  }

  /**
   * Enviar notificación de miembro alcanzó meta
   * @param {string} userId - ID del usuario a notificar
   * @param {string} memberName - Nombre del miembro
   * @param {string} goalType - 'daily' o 'monthly'
   * @returns {Promise<Object|null>} - Resultado del envío
   */
  static async sendFamilyMemberGoalAchieved(userId, memberName, goalType = 'daily') {
    try {
      const goalText = goalType === 'daily' ? 'meta diaria' : 'meta mensual';
      
      return await PushNotificationService.sendToUser(
        userId,
        {
          title: '🎉 ¡Miembro alcanzó meta!',
          body: `${memberName} cumplió su ${goalText}. ¡Felicítalo!`,
        },
        {
          type: 'family_member_goal',
          memberName,
          goalType,
        }
      );
    } catch (error) {
      logger.error(`Error enviando notificación de meta de miembro a usuario ${userId}:`, {
        error: error.message,
      });
      return null;
    }
  }
}

