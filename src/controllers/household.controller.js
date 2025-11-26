/**
 * Controlador de Hogar/Familia
 * 
 * Maneja las peticiones HTTP relacionadas con familias
 */

import { HouseholdService } from '../services/household.service.js';
import { HouseholdStatisticsService } from '../services/household-statistics.service.js';

export class HouseholdController {
  /**
   * Crear una nueva familia
   * POST /api/household
   */
  static async createHousehold(req, res) {
    try {
      const userId = req.user.uid;
      const { householdName, memberLimit } = req.body;

      const household = await HouseholdService.createHousehold(userId, {
        householdName,
        memberLimit: memberLimit || null,
      });

      res.status(201).json({
        success: true,
        data: household,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Unirse a una familia usando código de invitación
   * POST /api/household/join
   */
  static async joinHousehold(req, res) {
    try {
      const userId = req.user.uid;
      const { inviteCode } = req.body;

      const household = await HouseholdService.joinHousehold(userId, inviteCode);

      res.status(200).json({
        success: true,
        data: household,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Obtener información de mi familia
   * GET /api/household
   */
  static async getMyHousehold(req, res) {
    try {
      const userId = req.user.uid;

      const household = await HouseholdService.getMyHousehold(userId);

      if (!household) {
        return res.status(404).json({
          success: false,
          error: 'No perteneces a ninguna familia',
        });
      }

      res.status(200).json({
        success: true,
        data: household,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Salir de la familia
   * POST /api/household/leave
   */
  static async leaveHousehold(req, res) {
    try {
      const userId = req.user.uid;
      const { householdId } = req.body;

      await HouseholdService.leaveHousehold(userId, householdId);

      res.status(200).json({
        success: true,
        message: 'Has salido de la familia exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Eliminar una familia (solo admin)
   * DELETE /api/household/:householdId
   */
  static async deleteHousehold(req, res) {
    try {
      const userId = req.user.uid;
      const { householdId } = req.params;

      await HouseholdService.deleteHousehold(userId, householdId);

      res.status(200).json({
        success: true,
        message: 'Familia eliminada exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Asignar rol a un miembro (solo admin)
   * PUT /api/household/:householdId/members/:targetUserId/role
   */
  static async assignRole(req, res) {
    try {
      const userId = req.user.uid;
      const { householdId, targetUserId } = req.params;
      const { role } = req.body;

      await HouseholdService.assignRole(userId, householdId, targetUserId, role);

      res.status(200).json({
        success: true,
        message: 'Rol asignado exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Remover miembro de la familia (solo admin)
   * DELETE /api/household/:householdId/members/:targetUserId
   */
  static async removeMember(req, res) {
    try {
      const userId = req.user.uid;
      const { householdId, targetUserId } = req.params;

      await HouseholdService.removeMember(userId, householdId, targetUserId);

      res.status(200).json({
        success: true,
        message: 'Miembro removido exitosamente',
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Actualizar información de la familia (solo admin)
   * PUT /api/household/:householdId
   */
  static async updateHousehold(req, res) {
    try {
      const userId = req.user.uid;
      const { householdId } = req.params;
      const updateData = req.body;

      const household = await HouseholdService.updateHousehold(
        userId,
        householdId,
        updateData
      );

      res.status(200).json({
        success: true,
        data: household,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Obtener código de invitación
   * GET /api/household/:householdId/invite-code
   */
  static async getInviteCode(req, res) {
    try {
      const userId = req.user.uid;
      const { householdId } = req.params;

      const data = await HouseholdService.getInviteCode(userId, householdId);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Obtener consumo diario de la familia
   * GET /api/household/:householdId/consumption/daily
   */
  static async getDailyConsumption(req, res) {
    try {
      const userId = req.user.uid;
      const { householdId } = req.params;
      const { date } = req.query;

      // Verificar que el usuario pertenezca a la familia
      const household = await HouseholdService.getMyHousehold(userId);
      if (!household || household.id !== householdId) {
        return res.status(403).json({
          success: false,
          error: 'No perteneces a esta familia',
        });
      }

      const targetDate = date ? new Date(date) : new Date();
      const consumption = await HouseholdStatisticsService.getHouseholdDailyConsumption(
        householdId,
        targetDate
      );

      res.status(200).json({
        success: true,
        data: consumption,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Obtener historial de consumo de la familia
   * GET /api/household/:householdId/consumption/history
   */
  static async getConsumptionHistory(req, res) {
    try {
      const userId = req.user.uid;
      const { householdId } = req.params;
      const { startDate, endDate } = req.query;

      // Verificar que el usuario pertenezca a la familia
      const household = await HouseholdService.getMyHousehold(userId);
      if (!household || household.id !== householdId) {
        return res.status(403).json({
          success: false,
          error: 'No perteneces a esta familia',
        });
      }

      const start = startDate ? new Date(startDate) : new Date();
      start.setDate(start.getDate() - 30); // Últimos 30 días por defecto
      
      const end = endDate ? new Date(endDate) : new Date();

      const history = await HouseholdStatisticsService.getHouseholdConsumptionHistory(
        householdId,
        start,
        end
      );

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Obtener estadísticas generales de la familia
   * GET /api/household/:householdId/statistics
   */
  static async getStatistics(req, res) {
    try {
      const userId = req.user.uid;
      const { householdId } = req.params;
      const { period = 'month' } = req.query;

      // Verificar que el usuario pertenezca a la familia
      const household = await HouseholdService.getMyHousehold(userId);
      if (!household || household.id !== householdId) {
        return res.status(403).json({
          success: false,
          error: 'No perteneces a esta familia',
        });
      }

      const statistics = await HouseholdStatisticsService.getHouseholdStatistics(
        householdId,
        period
      );

      res.status(200).json({
        success: true,
        data: statistics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  /**
   * Obtener consumo por miembro
   * GET /api/household/:householdId/consumption/by-member
   */
  static async getConsumptionByMember(req, res) {
    try {
      const userId = req.user.uid;
      const { householdId } = req.params;
      const { startDate, endDate } = req.query;

      // Verificar que el usuario pertenezca a la familia
      const household = await HouseholdService.getMyHousehold(userId);
      if (!household || household.id !== householdId) {
        return res.status(403).json({
          success: false,
          error: 'No perteneces a esta familia',
        });
      }

      const start = startDate ? new Date(startDate) : new Date();
      start.setMonth(start.getMonth() - 1); // Último mes por defecto
      
      const end = endDate ? new Date(endDate) : new Date();

      const memberStats = await HouseholdStatisticsService.getConsumptionByMember(
        householdId,
        start,
        end
      );

      res.status(200).json({
        success: true,
        data: memberStats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}

