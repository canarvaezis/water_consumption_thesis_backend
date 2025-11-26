/**
 * Controlador de Logros
 */

import { AchievementService } from '../services/achievement.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { NotFoundError } from '../utils/errors.js';

export class AchievementController {
  /**
   * Obtener todos los logros disponibles
   */
  static getAllAchievements = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const achievements = await AchievementService.getAllAchievements(userId);

    res.json({
      success: true,
      data: {
        achievements,
      },
    });
  });

  /**
   * Obtener logro por ID
   */
  static getAchievementById = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { achievementId } = req.params;
    
    try {
      const achievement = await AchievementService.getAchievementById(userId, achievementId);
      res.json({
        success: true,
        data: achievement,
      });
    } catch (error) {
      if (error.message === 'Logro no encontrado') {
        throw new NotFoundError(error.message);
      }
      throw error;
    }
  });

  /**
   * Obtener logros por categoría
   */
  static getAchievementsByCategory = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { category } = req.params;
    const achievements = await AchievementService.getAchievementsByCategory(userId, category);

    res.json({
      success: true,
      data: {
        achievements,
      },
    });
  });

  /**
   * Obtener logros desbloqueados por el usuario
   */
  static getUserAchievements = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const achievements = await AchievementService.getUserAchievements(userId);

    res.json({
      success: true,
      data: {
        achievements,
        count: achievements.length,
      },
    });
  });

  /**
   * Obtener progreso de logros
   */
  static getAchievementsProgress = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const progress = await AchievementService.getAchievementsProgress(userId);

    res.json({
      success: true,
      data: progress,
    });
  });

  /**
   * Reclamar recompensa de logro
   */
  static claimAchievementReward = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { achievementId } = req.params;
    
    try {
      const result = await AchievementService.claimAchievementReward(userId, achievementId);
      res.json({
        success: true,
        message: 'Recompensa reclamada exitosamente',
        data: result,
      });
    } catch (error) {
      if (
        error.message === 'Logro no encontrado' ||
        error.message === 'No has desbloqueado este logro'
      ) {
        throw new NotFoundError(error.message);
      }
      throw error;
    }
  });

  /**
   * Evaluar logros (forzar evaluación)
   */
  static evaluateAchievements = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const result = await AchievementService.evaluateAchievements(userId);

    res.json({
      success: true,
      message: `Evaluación completada. ${result.newlyUnlocked} logro(s) desbloqueado(s)`,
      data: result,
    });
  });
}
