/**
 * Controlador de Hogar/Familia
 * 
 * Maneja las peticiones HTTP relacionadas con familias
 */

import { HouseholdService } from '../services/household.service.js';
import { HouseholdStatisticsService } from '../services/household-statistics.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors.js';

export class HouseholdController {
  /**
   * Crear una nueva familia
   * POST /api/household
   */
  static createHousehold = asyncHandler(async (req, res) => {
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
  });

  /**
   * Unirse a una familia usando código de invitación
   * POST /api/household/join
   */
  static joinHousehold = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { inviteCode } = req.body;

    const household = await HouseholdService.joinHousehold(userId, inviteCode);

    res.status(200).json({
      success: true,
      data: household,
    });
  });

  /**
   * Obtener información de mi familia
   * GET /api/household
   */
  static getMyHousehold = asyncHandler(async (req, res) => {
    const userId = req.user.uid;

    const household = await HouseholdService.getMyHousehold(userId);

    if (!household) {
      throw new NotFoundError('No perteneces a ninguna familia');
    }

    res.status(200).json({
      success: true,
      data: household,
    });
  });

  /**
   * Salir de la familia
   * POST /api/household/leave
   */
  static leaveHousehold = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { householdId } = req.body;

    await HouseholdService.leaveHousehold(userId, householdId);

    res.status(200).json({
      success: true,
      message: 'Has salido de la familia exitosamente',
    });
  });

  /**
   * Eliminar una familia (solo admin)
   * DELETE /api/household/:householdId
   */
  static deleteHousehold = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { householdId } = req.params;

    await HouseholdService.deleteHousehold(userId, householdId);

    res.status(200).json({
      success: true,
      message: 'Familia eliminada exitosamente',
    });
  });

  /**
   * Asignar rol a un miembro (solo admin)
   * PUT /api/household/:householdId/members/:targetUserId/role
   */
  static assignRole = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { householdId, targetUserId } = req.params;
    const { role } = req.body;

    await HouseholdService.assignRole(userId, householdId, targetUserId, role);

    res.status(200).json({
      success: true,
      message: 'Rol asignado exitosamente',
    });
  });

  /**
   * Remover miembro de la familia (solo admin)
   * DELETE /api/household/:householdId/members/:targetUserId
   */
  static removeMember = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { householdId, targetUserId } = req.params;

    await HouseholdService.removeMember(userId, householdId, targetUserId);

    res.status(200).json({
      success: true,
      message: 'Miembro removido exitosamente',
    });
  });

  /**
   * Actualizar información de la familia (solo admin)
   * PUT /api/household/:householdId
   */
  static updateHousehold = asyncHandler(async (req, res) => {
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
  });

  /**
   * Obtener código de invitación
   * GET /api/household/:householdId/invite-code
   */
  static getInviteCode = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { householdId } = req.params;

    const data = await HouseholdService.getInviteCode(userId, householdId);

    res.status(200).json({
      success: true,
      data,
    });
  });

  /**
   * Obtener consumo diario de la familia
   * GET /api/household/:householdId/consumption/daily
   */
  static getDailyConsumption = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { householdId } = req.params;
    const { date } = req.query;

    // Verificar que el usuario pertenezca a la familia
    const household = await HouseholdService.getMyHousehold(userId);
    if (!household || household.id !== householdId) {
      throw new ForbiddenError('No perteneces a esta familia');
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
  });

  /**
   * Obtener historial de consumo de la familia
   * GET /api/household/:householdId/consumption/history
   */
  static getConsumptionHistory = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { householdId } = req.params;
    const { startDate, endDate } = req.query;

    // Verificar que el usuario pertenezca a la familia
    const household = await HouseholdService.getMyHousehold(userId);
    if (!household || household.id !== householdId) {
      throw new ForbiddenError('No perteneces a esta familia');
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
  });

  /**
   * Obtener estadísticas generales de la familia
   * GET /api/household/:householdId/statistics
   */
  static getStatistics = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { householdId } = req.params;
    const { period = 'month' } = req.query;

    // Verificar que el usuario pertenezca a la familia
    const household = await HouseholdService.getMyHousehold(userId);
    if (!household || household.id !== householdId) {
      throw new ForbiddenError('No perteneces a esta familia');
    }

    const statistics = await HouseholdStatisticsService.getHouseholdStatistics(
      householdId,
      period
    );

    res.status(200).json({
      success: true,
      data: statistics,
    });
  });

  /**
   * Obtener consumo por miembro
   * GET /api/household/:householdId/consumption/by-member
   */
  static getConsumptionByMember = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { householdId } = req.params;
    const { startDate, endDate } = req.query;

    // Verificar que el usuario pertenezca a la familia
    const household = await HouseholdService.getMyHousehold(userId);
    if (!household || household.id !== householdId) {
      throw new ForbiddenError('No perteneces a esta familia');
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
  });
}

