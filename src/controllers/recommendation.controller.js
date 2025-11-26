/**
 * Controlador de Recomendaciones
 */

import { RecommendationService } from '../services/recommendation.service.js';

export class RecommendationController {
  /**
   * Obtener recomendaciones del usuario
   */
  static async getUserRecommendations(req, res) {
    try {
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
    } catch (error) {
      console.error('Error al obtener recomendaciones:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener recomendaciones',
      });
    }
  }

  /**
   * Obtener recomendación específica
   */
  static async getRecommendationById(req, res) {
    try {
      const userId = req.user.uid;
      const { recommendationId } = req.params;
      const recommendation = await RecommendationService.getRecommendationById(userId, recommendationId);

      res.json({
        success: true,
        data: recommendation,
      });
    } catch (error) {
      console.error('Error al obtener recomendación:', error);
      const statusCode = error.message === 'Recomendación no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener recomendación',
      });
    }
  }

  /**
   * Marcar recomendación como leída
   */
  static async markAsRead(req, res) {
    try {
      const userId = req.user.uid;
      const { recommendationId } = req.params;
      const result = await RecommendationService.markAsRead(userId, recommendationId);

      res.json({
        success: true,
        message: 'Recomendación marcada como leída',
        data: result,
      });
    } catch (error) {
      console.error('Error al marcar recomendación como leída:', error);
      const statusCode = error.message === 'Recomendación no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al marcar recomendación como leída',
      });
    }
  }

  /**
   * Eliminar recomendación
   */
  static async deleteRecommendation(req, res) {
    try {
      const userId = req.user.uid;
      const { recommendationId } = req.params;
      const result = await RecommendationService.deleteRecommendation(userId, recommendationId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Error al eliminar recomendación:', error);
      const statusCode = error.message === 'Recomendación no encontrada' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al eliminar recomendación',
      });
    }
  }

  /**
   * Obtener recomendaciones no leídas
   */
  static async getUnreadRecommendations(req, res) {
    try {
      const userId = req.user.uid;
      const { limit } = req.query;
      const result = await RecommendationService.getUnreadRecommendations(userId, limit || 50);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error al obtener recomendaciones no leídas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener recomendaciones no leídas',
      });
    }
  }

  /**
   * Generar recomendaciones (admin/testing)
   */
  static async generateRecommendations(req, res) {
    try {
      const userId = req.user.uid;
      const result = await RecommendationService.generateRecommendations(userId);

      res.json({
        success: true,
        message: `Generación completada. ${result.generated} recomendación(es) creada(s)`,
        data: result,
      });
    } catch (error) {
      console.error('Error al generar recomendaciones:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al generar recomendaciones',
      });
    }
  }
}

