/**
 * Controlador de Metas de Consumo
 * 
 * Maneja las peticiones HTTP relacionadas con metas diarias y mensuales
 */

import { GoalsService } from '../services/goals.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';

export class GoalsController {
  /**
   * Obtener metas del usuario
   * GET /api/goals
   */
  static getGoals = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    
    const goals = await GoalsService.getUserGoals(userId);
    
    res.json({
      success: true,
      data: goals,
    });
  });

  /**
   * Actualizar metas del usuario
   * PUT /api/goals
   */
  static updateGoals = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { dailyGoal, monthlyGoal } = req.body;
    
    const updatedGoals = await GoalsService.updateUserGoals(userId, {
      dailyGoal,
      monthlyGoal,
    });
    
    res.json({
      success: true,
      message: 'Metas actualizadas exitosamente',
      data: updatedGoals,
    });
  });

  /**
   * Obtener progreso de metas del usuario
   * GET /api/goals/progress
   */
  static getProgress = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    
    const progress = await GoalsService.getGoalsProgress(userId);
    
    res.json({
      success: true,
      data: progress,
    });
  });
}

