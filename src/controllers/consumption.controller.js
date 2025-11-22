/**
 * Controlador de Consumo
 * 
 * Maneja las peticiones HTTP relacionadas con el registro de consumo
 */

import { ConsumptionService } from '../services/consumption.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';

export class ConsumptionController {
  /**
   * Agregar consumo manual
   * POST /api/consumption
   */
  static addConsumption = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { consumptionItemId, timesPerDay, estimatedLiters, householdId } = req.body;
    
    const result = await ConsumptionService.addManualConsumption(userId, {
      consumptionItemId,
      timesPerDay: timesPerDay || 1,
      estimatedLiters,
      householdId: householdId || null,
      sessionDate: new Date(),
    });
    
    res.status(201).json({
      success: true,
      message: 'Consumo registrado exitosamente',
      data: result,
    });
  });

  /**
   * Obtener sesión del día actual
   * GET /api/consumption/sessions/today
   */
  static getTodaySession = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    
    const session = await ConsumptionService.getTodaySessionWithDetails(userId);
    
    if (!session) {
      return res.json({
        success: true,
        message: 'No hay sesión para hoy',
        data: { session: null },
      });
    }
    
    res.json({
      success: true,
      data: { session },
    });
  });

  /**
   * Actualizar detalle (solo día de hoy)
   * PUT /api/consumption/details/:sessionId/:detailId
   */
  static updateDetail = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { sessionId, detailId } = req.params;
    const { estimatedLiters, timesPerDay } = req.body;
    
    const updatedDetail = await ConsumptionService.updateDetail(
      detailId,
      sessionId,
      userId,
      {
        estimatedLiters,
        timesPerDay,
      }
    );
    
    res.json({
      success: true,
      message: 'Detalle actualizado exitosamente',
      data: { detail: updatedDetail },
    });
  });

  /**
   * Eliminar detalle (solo día de hoy)
   * DELETE /api/consumption/details/:sessionId/:detailId
   */
  static deleteDetail = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { sessionId, detailId } = req.params;
    
    await ConsumptionService.deleteDetail(detailId, sessionId, userId);
    
    res.json({
      success: true,
      message: 'Detalle eliminado exitosamente',
    });
  });

  /**
   * Obtener historial de consumo (vista global)
   * GET /api/consumption/history
   */
  static getHistory = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { startDate, endDate, limit, page } = req.query;
    
    const history = await ConsumptionService.getConsumptionHistory(userId, {
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      limit: limit ? parseInt(limit) : 30,
      page: page ? parseInt(page) : 1,
    });
    
    res.json({
      success: true,
      data: history,
    });
  });

  /**
   * Obtener sesión por fecha específica
   * GET /api/consumption/sessions/:date
   */
  static getSessionByDate = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { date } = req.params;
    
    const session = await ConsumptionService.getSessionByDate(userId, date);
    
    if (!session) {
      return res.json({
        success: true,
        message: 'No hay sesión para esta fecha',
        data: { session: null },
      });
    }
    
    res.json({
      success: true,
      data: { session },
    });
  });

  /**
   * Obtener estadísticas de consumo
   * GET /api/consumption/statistics
   */
  static getStatistics = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate y endDate son requeridos',
      });
    }
    
    const statistics = await ConsumptionService.getConsumptionStatistics(
      userId,
      startDate,
      endDate
    );
    
    res.json({
      success: true,
      data: statistics,
    });
  });
}

