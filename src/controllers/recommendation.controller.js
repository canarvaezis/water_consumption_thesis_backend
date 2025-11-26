/**
 * Controlador de Recomendaciones
 */

import { RecommendationService } from '../services/recommendation.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { NotFoundError } from '../utils/errors.js';

export class RecommendationController {
  /**
   * Obtener recomendaciones del usuario
   */
  static getUserRecommendations = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { type, unseenOnly, limit } = req.query;

    const options = {
      type: type || null,
      unseenOnly: unseenOnly || false,
      limit: limit || 50,
    };

    const recommendations = await RecommendationService.getUserRecommendations(userId, options);

    res.json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length,
      },
    });
  });

  /**
   * Obtener recomendación específica
   */
  static getRecommendationById = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { recommendationId } = req.params;
    
    try {
      const recommendation = await RecommendationService.getRecommendationById(userId, recommendationId);
      res.json({
        success: true,
        data: recommendation,
      });
    } catch (error) {
      if (error.message === 'Recomendación no encontrada') {
        throw new NotFoundError(error.message);
      }
      throw error;
    }
  });

  /**
   * Marcar recomendación como leída
   */
  static markAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { recommendationId } = req.params;
    
    try {
      const result = await RecommendationService.markAsRead(userId, recommendationId);
      res.json({
        success: true,
        message: 'Recomendación marcada como leída',
        data: result,
      });
    } catch (error) {
      if (error.message === 'Recomendación no encontrada') {
        throw new NotFoundError(error.message);
      }
      throw error;
    }
  });

  /**
   * Eliminar recomendación
   */
  static deleteRecommendation = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { recommendationId } = req.params;
    
    try {
      const result = await RecommendationService.deleteRecommendation(userId, recommendationId);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      if (error.message === 'Recomendación no encontrada') {
        throw new NotFoundError(error.message);
      }
      throw error;
    }
  });

  /**
   * Obtener recomendaciones no leídas
   */
  static getUnreadRecommendations = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { limit } = req.query;
    const result = await RecommendationService.getUnreadRecommendations(userId, limit || 50);

    res.json({
      success: true,
      data: result,
    });
  });

  /**
   * Generar recomendaciones (admin/testing)
   */
  static generateRecommendations = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const result = await RecommendationService.generateRecommendations(userId);

    res.json({
      success: true,
      message: `Generación completada. ${result.generated} recomendación(es) creada(s)`,
      data: result,
    });
  });
}
