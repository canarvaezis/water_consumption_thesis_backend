/**
 * Servicio de Recomendaciones
 * 
 * Lógica de negocio para gestión de recomendaciones
 */

import { UserRecommendationModel } from '../models/user-recommendation.model.js';
import { ConsumptionSessionModel } from '../models/consumption-session.model.js';
import { UserModel } from '../models/user.model.js';
import { GoalsService } from './goals.service.js';

export class RecommendationService {
  /**
   * Obtener recomendaciones del usuario
   */
  static async getUserRecommendations(userId, options = {}) {
    const { type, unseenOnly, limit } = options;
    
    const recommendations = await UserRecommendationModel.getRecommendationsByUserId(userId, {
      type,
      unseenOnly: unseenOnly === 'true' || unseenOnly === true,
      limit: limit ? parseInt(limit) : 50,
    });

    return recommendations.map(rec => ({
      id: rec.id,
      userRecommendationId: rec.userRecommendationId || rec.id,
      title: rec.title,
      description: rec.description,
      type: rec.type,
      seen: rec.seen || false,
      createdAt: rec.createdAt?.toDate ? rec.createdAt.toDate() : rec.createdAt,
    }));
  }

  /**
   * Obtener recomendación específica
   */
  static async getRecommendationById(userId, recommendationId) {
    const recommendation = await UserRecommendationModel.findById(userId, recommendationId);
    
    if (!recommendation) {
      throw new Error('Recomendación no encontrada');
    }

    return {
      id: recommendation.id,
      userRecommendationId: recommendation.userRecommendationId || recommendation.id,
      title: recommendation.title,
      description: recommendation.description,
      type: recommendation.type,
      seen: recommendation.seen || false,
      createdAt: recommendation.createdAt?.toDate ? recommendation.createdAt.toDate() : recommendation.createdAt,
    };
  }

  /**
   * Marcar recomendación como leída
   */
  static async markAsRead(userId, recommendationId) {
    // Verificar que la recomendación existe
    const recommendation = await UserRecommendationModel.findById(userId, recommendationId);
    if (!recommendation) {
      throw new Error('Recomendación no encontrada');
    }

    await UserRecommendationModel.markAsSeen(userId, recommendationId);
    
    return {
      id: recommendationId,
      seen: true,
    };
  }

  /**
   * Eliminar recomendación
   */
  static async deleteRecommendation(userId, recommendationId) {
    // Verificar que la recomendación existe
    const recommendation = await UserRecommendationModel.findById(userId, recommendationId);
    if (!recommendation) {
      throw new Error('Recomendación no encontrada');
    }

    await UserRecommendationModel.delete(userId, recommendationId);
    
    return {
      message: 'Recomendación eliminada exitosamente',
    };
  }

  /**
   * Obtener recomendaciones no leídas
   */
  static async getUnreadRecommendations(userId, limit = 50) {
    const recommendations = await UserRecommendationModel.getRecommendationsByUserId(userId, {
      unseenOnly: true,
      limit: parseInt(limit),
    });

    return {
      recommendations: recommendations.map(rec => ({
        id: rec.id,
        userRecommendationId: rec.userRecommendationId || rec.id,
        title: rec.title,
        description: rec.description,
        type: rec.type,
        seen: false,
        createdAt: rec.createdAt?.toDate ? rec.createdAt.toDate() : rec.createdAt,
      })),
      count: recommendations.length,
    };
  }

  /**
   * Generar recomendaciones automáticamente basadas en el consumo del usuario
   */
  static async generateRecommendations(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const recommendations = [];

    // Obtener estadísticas del usuario
    const sessions = await ConsumptionSessionModel.findByUserId(userId, 30); // Últimos 30 días
    const totalConsumption = sessions.reduce((sum, s) => sum + (s.totalEstimatedLiters || 0), 0);
    const averageDaily = totalConsumption / Math.max(sessions.length, 1);

    // Obtener progreso de metas
    const goalsProgress = await GoalsService.getGoalsProgress(userId);

    // Recomendación 1: Consumo alto diario
    if (averageDaily > 150) {
      const existing = await this.checkExistingRecommendation(userId, 'Consumo diario alto');
      if (!existing) {
        recommendations.push({
          title: 'Consumo diario alto',
          description: `Tu consumo promedio diario es de ${averageDaily.toFixed(1)} litros. Considera reducir actividades que consumen mucha agua.`,
          type: 'alert',
        });
      }
    }

    // Recomendación 2: Meta diaria excedida
    if (goalsProgress.daily?.goal && goalsProgress.daily.consumption > goalsProgress.daily.goal) {
      const existing = await this.checkExistingRecommendation(userId, 'Meta diaria excedida');
      if (!existing) {
        const excess = goalsProgress.daily.consumption - goalsProgress.daily.goal;
        recommendations.push({
          title: 'Meta diaria excedida',
          description: `Has excedido tu meta diaria por ${excess.toFixed(1)} litros. Intenta reducir el consumo mañana.`,
          type: 'alert',
        });
      }
    }

    // Recomendación 3: Buen ahorro
    if (goalsProgress.daily?.goal && goalsProgress.daily.consumption < goalsProgress.daily.goal * 0.8) {
      const existing = await this.checkExistingRecommendation(userId, 'Excelente ahorro');
      if (!existing) {
        recommendations.push({
          title: 'Excelente ahorro',
          description: `¡Felicitaciones! Estás ahorrando agua. Has consumido ${(goalsProgress.daily.goal - goalsProgress.daily.consumption).toFixed(1)} litros menos que tu meta.`,
          type: 'saving',
        });
      }
    }

    // Recomendación 4: Consumo bajo (si no hay meta)
    if (!goalsProgress.daily?.goal && averageDaily < 50) {
      const existing = await this.checkExistingRecommendation(userId, 'Consumo eficiente');
      if (!existing) {
        recommendations.push({
          title: 'Consumo eficiente',
          description: `Tu consumo promedio es de ${averageDaily.toFixed(1)} litros por día. ¡Sigue así!`,
          type: 'saving',
        });
      }
    }

    // Recomendación 5: Tip general de ahorro
    if (averageDaily > 100) {
      const existing = await this.checkExistingRecommendation(userId, 'Consejo de ahorro');
      if (!existing) {
        recommendations.push({
          title: 'Consejo de ahorro',
          description: 'Cierra el grifo mientras te cepillas los dientes o te enjabonas. Esto puede ahorrar hasta 10 litros por día.',
          type: 'tip',
        });
      }
    }

    // Crear recomendaciones
    const created = [];
    for (const rec of recommendations) {
      const newRec = await UserRecommendationModel.create(userId, rec);
      created.push({
        id: newRec.id,
        title: newRec.title,
        type: newRec.type,
      });
    }

    return {
      generated: created.length,
      recommendations: created,
    };
  }

  /**
   * Verificar si ya existe una recomendación similar (para evitar duplicados)
   */
  static async checkExistingRecommendation(userId, title) {
    const recommendations = await UserRecommendationModel.getRecommendationsByUserId(userId, {
      limit: 10,
    });

    // Buscar recomendaciones con el mismo título en las últimas 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return recommendations.some(rec => {
      const createdAt = rec.createdAt?.toDate ? rec.createdAt.toDate() : new Date(rec.createdAt);
      return rec.title === title && createdAt > sevenDaysAgo;
    });
  }
}

