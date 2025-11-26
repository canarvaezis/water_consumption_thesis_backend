/**
 * Controlador de Logros
 */

import { AchievementService } from '../services/achievement.service.js';

export class AchievementController {
  /**
   * Obtener todos los logros disponibles
   */
  static async getAllAchievements(req, res) {
    try {
      const userId = req.user.uid;
      const achievements = await AchievementService.getAllAchievements(userId);

      res.json({
        success: true,
        data: {
          achievements,
        },
      });
    } catch (error) {
      console.error('Error al obtener logros:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener logros',
      });
    }
  }

  /**
   * Obtener logro por ID
   */
  static async getAchievementById(req, res) {
    try {
      const userId = req.user.uid;
      const { achievementId } = req.params;
      const achievement = await AchievementService.getAchievementById(userId, achievementId);

      res.json({
        success: true,
        data: achievement,
      });
    } catch (error) {
      console.error('Error al obtener logro:', error);
      const statusCode = error.message === 'Logro no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener logro',
      });
    }
  }

  /**
   * Obtener logros por categoría
   */
  static async getAchievementsByCategory(req, res) {
    try {
      const userId = req.user.uid;
      const { category } = req.params;
      const achievements = await AchievementService.getAchievementsByCategory(userId, category);

      res.json({
        success: true,
        data: {
          achievements,
        },
      });
    } catch (error) {
      console.error('Error al obtener logros por categoría:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener logros por categoría',
      });
    }
  }

  /**
   * Obtener logros desbloqueados por el usuario
   */
  static async getUserAchievements(req, res) {
    try {
      const userId = req.user.uid;
      const achievements = await AchievementService.getUserAchievements(userId);

      res.json({
        success: true,
        data: {
          achievements,
          count: achievements.length,
        },
      });
    } catch (error) {
      console.error('Error al obtener logros del usuario:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener logros del usuario',
      });
    }
  }

  /**
   * Obtener progreso de logros
   */
  static async getAchievementsProgress(req, res) {
    try {
      const userId = req.user.uid;
      const progress = await AchievementService.getAchievementsProgress(userId);

      res.json({
        success: true,
        data: progress,
      });
    } catch (error) {
      console.error('Error al obtener progreso de logros:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener progreso de logros',
      });
    }
  }

  /**
   * Reclamar recompensa de logro
   */
  static async claimAchievementReward(req, res) {
    try {
      const userId = req.user.uid;
      const { achievementId } = req.params;
      const result = await AchievementService.claimAchievementReward(userId, achievementId);

      res.json({
        success: true,
        message: 'Recompensa reclamada exitosamente',
        data: result,
      });
    } catch (error) {
      console.error('Error al reclamar recompensa:', error);
      const statusCode = error.message === 'Logro no encontrado' || 
                        error.message === 'No has desbloqueado este logro' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al reclamar recompensa',
      });
    }
  }

  /**
   * Evaluar logros (forzar evaluación)
   */
  static async evaluateAchievements(req, res) {
    try {
      const userId = req.user.uid;
      const result = await AchievementService.evaluateAchievements(userId);

      res.json({
        success: true,
        message: `Evaluación completada. ${result.newlyUnlocked} logro(s) desbloqueado(s)`,
        data: result,
      });
    } catch (error) {
      console.error('Error al evaluar logros:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al evaluar logros',
      });
    }
  }
}

