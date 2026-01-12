/**
 * Controlador de Consumo
 * 
 * Maneja las peticiones HTTP relacionadas con el registro de consumo
 */

import { ConsumptionService } from '../services/consumption.service.js';
import { consumptionDataService } from '../services/consumption-data.service.js';
import { asyncHandler } from '../middleware/error.middleware.js';

export class ConsumptionController {
  /**
   * Agregar consumo manual
   * POST /api/consumption
   * 
   * Formato requerido:
   * {
   *   activityName: string,
   *   faucetTypeName: string,
   *   duration: { minutes: number, seconds: number },
   *   householdId?: string (opcional)
   * }
   */
  static addConsumption = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { 
      activityName,
      faucetTypeName,
      duration,
      householdId 
    } = req.body;
    
    try {
      const result = await ConsumptionService.addManualConsumption(userId, {
        activityName,
        faucetTypeName,
        duration,
        householdId: householdId || null,
        sessionDate: new Date(),
      });
      
      res.status(201).json({
        success: true,
        message: 'Consumo registrado exitosamente',
        data: result,
      });
    } catch (error) {
      // Manejar errores con códigos específicos
      if (error.code === 'ITEM_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: error.message,
          error: {
            code: error.code,
            provided: activityName,
            suggestions: error.suggestions || [],
          },
        });
      }
      
      if (error.code === 'FAUCET_NOT_FOUND') {
        return res.status(404).json({
          success: false,
          message: error.message,
          error: {
            code: error.code,
            provided: faucetTypeName,
          },
        });
      }
      
      if (error.code === 'INCOMPATIBLE_FAUCET') {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: {
            code: error.code,
            item: {
              id: error.item.id,
              name: error.item.name,
            },
            selectedFaucet: {
              id: error.selectedFaucet.id,
              name: error.selectedFaucet.name,
            },
            compatibleFaucets: error.compatibleFaucets.map(f => ({
              id: f.id,
              name: f.name,
              isRecommended: f.id === error.item.defaultFaucetTypeId,
              litersPerMinute: f.litersPerMinute,
            })),
          },
        });
      }
      
      // Re-lanzar error para que el middleware de errores lo maneje
      throw error;
    }
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
   * 
   * Acepta:
   * - { duration: { minutes: number, seconds: number } } (opcional)
   * - { faucetTypeName: string } (opcional)
   */
  static updateDetail = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    const { sessionId, detailId } = req.params;
    const { duration, faucetTypeName } = req.body;
    
    try {
      const updatedDetail = await ConsumptionService.updateDetail(
        detailId,
        sessionId,
        userId,
        {
          duration: duration || null,
          faucetTypeName: faucetTypeName || null,
        }
      );
      
      res.json({
        success: true,
        message: 'Detalle actualizado exitosamente',
        data: { detail: updatedDetail },
      });
    } catch (error) {
      if (error.code === 'INCOMPATIBLE_FAUCET') {
        return res.status(400).json({
          success: false,
          message: error.message,
          error: {
            code: error.code,
            compatibleFaucets: error.compatibleFaucets.map(f => ({
              id: f.id,
              name: f.name,
              litersPerMinute: f.litersPerMinute,
            })),
          },
        });
      }
      
      throw error;
    }
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

  /**
   * Obtener racha de consumo
   * GET /api/consumption/streak
   */
  static getStreak = asyncHandler(async (req, res) => {
    const userId = req.user.uid;
    
    const streakData = await ConsumptionService.getConsumptionStreak(userId);
    
    res.json({
      success: true,
      data: streakData,
    });
  });

  /**
   * Obtener todos los datos de consumo (items, grifos, categorías)
   * GET /api/consumption/data
   */
  static getConsumptionData = asyncHandler(async (req, res) => {
    const data = consumptionDataService.getAllData();
    
    res.json({
      success: true,
      data,
    });
  });

  /**
   * Obtener contexto de un item (grifos compatibles, presets, etc.)
   * GET /api/consumption/context/:itemId
   * GET /api/consumption/context?itemName=Baño
   * 
   * Nota: Si itemId viene en el path pero no se encuentra por ID,
   * se intenta buscar por nombre (para soportar nombres en la URL)
   */
  static getItemContext = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { itemName } = req.query;
    
    // Resolver item por ID o nombre
    let item = null;
    let providedValue = null;
    
    // Priorizar query parameter si existe
    if (itemName) {
      providedValue = itemName;
      item = consumptionDataService.getItemByName(itemName);
    } 
    // Si hay itemId en el path, intentar primero por ID
    else if (itemId) {
      providedValue = itemId;
      item = consumptionDataService.getItemById(itemId);
      
      // Si no se encuentra por ID, intentar por nombre (puede ser un nombre en la URL)
      if (!item) {
        item = consumptionDataService.getItemByName(itemId);
      }
    }
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada',
        error: {
          code: 'ITEM_NOT_FOUND',
          provided: providedValue,
          suggestions: consumptionDataService.searchItemsByName(providedValue || ''),
        },
      });
    }
    
    const context = consumptionDataService.getItemContext(item.id);
    
    res.json({
      success: true,
      data: context,
    });
  });
}

