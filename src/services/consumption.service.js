/**
 * Servicio de Consumo
 * 
 * Lógica de negocio para el registro y gestión de consumo de agua
 */

import { ConsumptionSessionModel } from '../models/consumption-session.model.js';
import { UserConsumptionDetailModel } from '../models/user-consumption-detail.model.js';
import { ConsumptionItemModel } from '../models/consumption-item.model.js';
import { UserModel } from '../models/user.model.js';
import { UserHouseholdModel } from '../models/user-household.model.js';
import { calculateWaterCost } from '../utils/water-calculations.utils.js';

export class ConsumptionService {
  /**
   * Validar que la fecha sea hoy (no permite fechas pasadas)
   */
  static validateDateIsToday(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);
    
    if (inputDate.getTime() !== today.getTime()) {
      throw new Error('Solo se puede registrar consumo del día actual');
    }
  }

  /**
   * Obtener o crear sesión del día actual
   */
  static async getOrCreateTodaySession(userId, householdId = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Buscar sesión existente
    let session = await ConsumptionSessionModel.findByUserAndDate(userId, today);
    
    if (!session) {
      // Crear nueva sesión (Firestore convertirá Date a Timestamp automáticamente)
      session = await ConsumptionSessionModel.create({
        userId,
        householdId,
        consumptionDate: today, // Se convertirá a Timestamp en el modelo
        totalEstimatedLiters: 0,
        formType: 'manual',
      });
    }
    
    return session;
  }

  /**
   * Agregar consumo manual
   */
  static async addManualConsumption(userId, detailData) {
    // Validar fecha
    this.validateDateIsToday(detailData.sessionDate || new Date());
    
    // Validar que el item existe
    const item = await ConsumptionItemModel.findById(detailData.consumptionItemId);
    if (!item) {
      throw new Error('Item de consumo no encontrado');
    }
    
    // Validar pertenencia al hogar si se especifica
    let householdId = null;
    if (detailData.householdId) {
      const userHousehold = await UserHouseholdModel.getUserHousehold(
        userId,
        detailData.householdId
      );
      if (!userHousehold) {
        throw new Error('No perteneces a este hogar');
      }
      householdId = detailData.householdId;
    }
    
    // Obtener o crear sesión del día
    const session = await this.getOrCreateTodaySession(userId, householdId);
    
    // Crear detalle
    const detail = await UserConsumptionDetailModel.addDetail(session.id, {
      consumptionItemId: detailData.consumptionItemId,
      timesPerDay: detailData.timesPerDay || 1,
      estimatedLiters: detailData.estimatedLiters,
    });
    
    // Recalcular totales de la sesión
    await this.recalculateSessionTotals(session.id);
    
    return { session, detail };
  }

  /**
   * Recalcular totales de una sesión
   */
  static async recalculateSessionTotals(sessionId) {
    // Obtener todos los detalles
    const details = await UserConsumptionDetailModel.getDetailsBySessionId(sessionId);
    
    // Sumar litros
    const totalLiters = details.reduce((sum, detail) => sum + (detail.estimatedLiters || 0), 0);
    
    // Obtener sesión
    const session = await ConsumptionSessionModel.findById(sessionId);
    if (!session) {
      throw new Error('Sesión no encontrada');
    }
    
    // Obtener usuario para calcular costo según estrato
    const user = await UserModel.findById(session.userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    // Calcular costo (usar estrato del usuario si existe, sino usar 3 por defecto)
    const stratum = user.stratum || 3; // Estrato por defecto si no está definido
    const totalCost = calculateWaterCost(totalLiters, stratum);
    
    // Actualizar sesión
    await ConsumptionSessionModel.update(sessionId, {
      totalEstimatedLiters: totalLiters,
    });
    
    return await ConsumptionSessionModel.findById(sessionId);
  }

  /**
   * Obtener sesión del día con detalles
   */
  static async getTodaySessionWithDetails(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const session = await ConsumptionSessionModel.findByUserAndDate(userId, today);
    
    if (!session) {
      return null;
    }
    
    const details = await UserConsumptionDetailModel.getDetailsBySessionId(session.id);
    
    // Convertir Timestamps a fechas legibles
    return {
      ...session,
      consumptionDate: session.consumptionDate?.toDate 
        ? session.consumptionDate.toDate() 
        : session.consumptionDate,
      createdAt: session.createdAt?.toDate 
        ? session.createdAt.toDate() 
        : session.createdAt,
      details: details.map(detail => ({
        ...detail,
        createdAt: detail.createdAt?.toDate 
          ? detail.createdAt.toDate() 
          : detail.createdAt,
      })),
    };
  }

  /**
   * Actualizar detalle (solo si es del día de hoy)
   */
  static async updateDetail(detailId, sessionId, userId, updateData) {
    // Verificar que la sesión pertenece al usuario
    const session = await ConsumptionSessionModel.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new Error('No tienes permiso para actualizar este detalle');
    }
    
    // Validar que la sesión sea del día de hoy
    // Firestore Timestamp necesita convertirse a Date
    const sessionDate = session.consumptionDate?.toDate 
      ? session.consumptionDate.toDate() 
      : new Date(session.consumptionDate);
    this.validateDateIsToday(sessionDate);
    
    // Actualizar detalle
    await UserConsumptionDetailModel.update(sessionId, detailId, updateData);
    
    // Recalcular sesión
    await this.recalculateSessionTotals(sessionId);
    
    // Obtener detalle actualizado
    const details = await UserConsumptionDetailModel.getDetailsBySessionId(sessionId);
    const updatedDetail = details.find(d => d.id === detailId);
    
    return updatedDetail;
  }

  /**
   * Eliminar detalle (solo si es del día de hoy)
   */
  static async deleteDetail(detailId, sessionId, userId) {
    // Verificar que la sesión pertenece al usuario
    const session = await ConsumptionSessionModel.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new Error('No tienes permiso para eliminar este detalle');
    }
    
    // Validar que la sesión sea del día de hoy
    // Firestore Timestamp necesita convertirse a Date
    const sessionDate = session.consumptionDate?.toDate 
      ? session.consumptionDate.toDate() 
      : new Date(session.consumptionDate);
    this.validateDateIsToday(sessionDate);
    
    // Eliminar detalle
    await UserConsumptionDetailModel.delete(sessionId, detailId);
    
    // Recalcular sesión
    await this.recalculateSessionTotals(sessionId);
    
    return true;
  }

  /**
   * Obtener historial de consumo (vista global)
   */
  static async getConsumptionHistory(userId, options = {}) {
    const {
      startDate,
      endDate,
      limit = 30,
      page = 1,
    } = options;
    
    let sessions;
    
    if (startDate && endDate) {
      // Rango de fechas específico
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      sessions = await ConsumptionSessionModel.findByDateRange(userId, start, end);
    } else {
      // Últimas sesiones
      sessions = await ConsumptionSessionModel.findByUserId(userId, limit);
    }
    
    // Obtener detalles para cada sesión y convertir Timestamps
    const sessionsWithDetails = await Promise.all(
      sessions.map(async (session) => {
        const details = await UserConsumptionDetailModel.getDetailsBySessionId(session.id);
        return {
          ...session,
          consumptionDate: session.consumptionDate?.toDate 
            ? session.consumptionDate.toDate() 
            : session.consumptionDate,
          createdAt: session.createdAt?.toDate 
            ? session.createdAt.toDate() 
            : session.createdAt,
          details: details.map(detail => ({
            ...detail,
            createdAt: detail.createdAt?.toDate 
              ? detail.createdAt.toDate() 
              : detail.createdAt,
          })),
        };
      })
    );
    
    // Calcular estadísticas
    const totalLiters = sessions.reduce((sum, s) => sum + (s.totalEstimatedLiters || 0), 0);
    const averageLiters = sessions.length > 0 ? totalLiters / sessions.length : 0;
    const totalDays = sessions.length;
    
    return {
      sessions: sessionsWithDetails,
      statistics: {
        totalLiters,
        averageLiters: Math.round(averageLiters * 100) / 100,
        totalDays,
        dateRange: startDate && endDate ? { startDate, endDate } : null,
      },
      pagination: {
        total: sessions.length,
        limit,
        page,
      },
    };
  }

  /**
   * Obtener sesión por fecha específica
   */
  static async getSessionByDate(userId, date) {
    // Aceptar string de fecha (YYYY-MM-DD) o Date object
    const targetDate = date instanceof Date ? date : new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const session = await ConsumptionSessionModel.findByUserAndDate(userId, targetDate);
    
    if (!session) {
      return null;
    }
    
    const details = await UserConsumptionDetailModel.getDetailsBySessionId(session.id);
    
    // Convertir Timestamps a fechas legibles si es necesario
    const sessionData = {
      ...session,
      consumptionDate: session.consumptionDate?.toDate 
        ? session.consumptionDate.toDate() 
        : session.consumptionDate,
      createdAt: session.createdAt?.toDate 
        ? session.createdAt.toDate() 
        : session.createdAt,
      details: details.map(detail => ({
        ...detail,
        createdAt: detail.createdAt?.toDate 
          ? detail.createdAt.toDate() 
          : detail.createdAt,
      })),
    };
    
    return sessionData;
  }

  /**
   * Obtener estadísticas de consumo
   */
  static async getConsumptionStatistics(userId, startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const sessions = await ConsumptionSessionModel.findByDateRange(userId, start, end);
    
    if (sessions.length === 0) {
      return {
        totalLiters: 0,
        averageLitersPerDay: 0,
        totalCost: 0,
        daysWithConsumption: 0,
        totalDays: 0,
        consumptionByItem: {},
      };
    }
    
    // Obtener usuario para calcular costo
    const user = await UserModel.findById(userId);
    const stratum = user?.stratum || 3;
    
    // Calcular totales
    const totalLiters = sessions.reduce((sum, s) => sum + (s.totalEstimatedLiters || 0), 0);
    const totalCost = calculateWaterCost(totalLiters, stratum);
    const averageLitersPerDay = totalLiters / sessions.length;
    
    // Obtener todos los detalles para análisis por item
    const allDetails = [];
    for (const session of sessions) {
      const details = await UserConsumptionDetailModel.getDetailsBySessionId(session.id);
      allDetails.push(...details);
    }
    
    // Agrupar por item
    const consumptionByItem = {};
    for (const detail of allDetails) {
      const itemId = detail.consumptionItemId;
      if (!consumptionByItem[itemId]) {
        consumptionByItem[itemId] = {
          itemId,
          totalLiters: 0,
          count: 0,
        };
      }
      consumptionByItem[itemId].totalLiters += detail.estimatedLiters || 0;
      consumptionByItem[itemId].count += 1;
    }
    
    // Calcular días del rango
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      totalLiters,
      averageLitersPerDay: Math.round(averageLitersPerDay * 100) / 100,
      totalCost,
      daysWithConsumption: sessions.length,
      totalDays: daysDiff,
      consumptionByItem,
    };
  }
}

