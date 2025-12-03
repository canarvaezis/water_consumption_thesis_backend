/**
 * Servicio de Consumo
 * 
 * Lógica de negocio para el registro y gestión de consumo de agua
 */

import { ConsumptionSessionModel } from '../models/consumption-session.model.js';
import { UserConsumptionDetailModel } from '../models/user-consumption-detail.model.js';
import { ConsumptionItemModel } from '../models/consumption-item.model.js';
import { FaucetTypeModel } from '../models/faucet-type.model.js';
import { UserModel } from '../models/user.model.js';
import { UserMetricsModel } from '../models/user-metrics.model.js';
import { UserHouseholdModel } from '../models/user-household.model.js';
import { calculateWaterCost, updateConsumptionStreak, getCurrentStreak } from '../utils/water-calculations.utils.js';
import { dateToTimestamp } from '../utils/firestore.utils.js';

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
    
    // Validar que el item de actividad existe
    const item = await ConsumptionItemModel.findById(detailData.consumptionItemId);
    if (!item) {
      throw new Error('Item de consumo (actividad) no encontrado');
    }
    
    // Validar que el tipo de grifo existe
    const faucetType = await FaucetTypeModel.findById(detailData.faucetTypeId);
    if (!faucetType) {
      throw new Error('Tipo de grifo no encontrado');
    }
    
    if (!faucetType.isActive) {
      throw new Error('Tipo de grifo no está activo');
    }
    
    // Validar duración
    if (!detailData.durationMinutes || detailData.durationMinutes <= 0) {
      throw new Error('La duración en minutos debe ser mayor a 0');
    }
    
    // Calcular litros automáticamente: duración × consumo del grifo por minuto
    const calculatedLiters = detailData.durationMinutes * faucetType.litersPerMinute;
    
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
    
    // Crear detalle con litros calculados automáticamente
    const detail = await UserConsumptionDetailModel.addDetail(session.id, {
      consumptionItemId: detailData.consumptionItemId,
      faucetTypeId: detailData.faucetTypeId,
      durationMinutes: detailData.durationMinutes,
      calculatedLiters: calculatedLiters,
    });
    
    // Recalcular totales de la sesión
    await this.recalculateSessionTotals(session.id);
    
    // Actualizar racha de consumo del usuario
    const metrics = await UserMetricsModel.findByUserId(userId);
    if (metrics) {
      const streakUpdate = updateConsumptionStreak(metrics, detailData.sessionDate || new Date());
      await UserMetricsModel.update(userId, {
        consumptionStreak: streakUpdate.consumptionStreak,
        lastConsumptionDate: dateToTimestamp(streakUpdate.lastConsumptionDate),
        streakLastUpdated: dateToTimestamp(streakUpdate.streakLastUpdated),
      });
    } else {
      // Si no existen métricas, crearlas
      const streakUpdate = updateConsumptionStreak({}, detailData.sessionDate || new Date());
      await UserMetricsModel.create(userId, {
        consumptionStreak: streakUpdate.consumptionStreak,
        lastConsumptionDate: dateToTimestamp(streakUpdate.lastConsumptionDate),
        streakLastUpdated: dateToTimestamp(streakUpdate.streakLastUpdated),
      });
    }
    
    return { 
      session, 
      detail: {
        ...detail,
        faucetType: {
          id: faucetType.id,
          name: faucetType.name,
          litersPerMinute: faucetType.litersPerMinute,
        },
      },
    };
  }

  /**
   * Recalcular totales de una sesión
   */
  static async recalculateSessionTotals(sessionId) {
    // Obtener todos los detalles
    const details = await UserConsumptionDetailModel.getDetailsBySessionId(sessionId);
    
    // Sumar litros calculados
    const totalLiters = details.reduce((sum, detail) => sum + (detail.calculatedLiters || 0), 0);
    
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
    
    // Validar que el estrato esté definido
    if (user.stratum === null || user.stratum === undefined) {
      throw new Error('El estrato del usuario no está configurado. Por favor, configure su estrato antes de registrar consumos.');
    }
    const totalCost = calculateWaterCost(totalLiters, user.stratum);
    
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
    
    // Si se actualiza duración o tipo de grifo, recalcular litros
    let finalUpdateData = { ...updateData };
    
    if (updateData.durationMinutes || updateData.faucetTypeId) {
      // Obtener el detalle actual
      const details = await UserConsumptionDetailModel.getDetailsBySessionId(sessionId);
      const currentDetail = details.find(d => d.id === detailId);
      
      if (!currentDetail) {
        throw new Error('Detalle no encontrado');
      }
      
      // Usar valores actualizados o actuales
      const durationMinutes = updateData.durationMinutes || currentDetail.durationMinutes;
      const faucetTypeId = updateData.faucetTypeId || currentDetail.faucetTypeId;
      
      // Validar tipo de grifo
      const faucetType = await FaucetTypeModel.findById(faucetTypeId);
      if (!faucetType || !faucetType.isActive) {
        throw new Error('Tipo de grifo no encontrado o no está activo');
      }
      
      // Recalcular litros
      finalUpdateData.calculatedLiters = durationMinutes * faucetType.litersPerMinute;
    }
    
    // Actualizar detalle
    await UserConsumptionDetailModel.update(sessionId, detailId, finalUpdateData);
    
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
   * Obtener racha de consumo del usuario
   * Verifica si la racha debe resetearse a 0 si no hay consumo reciente
   */
  static async getConsumptionStreak(userId) {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    // Obtener métricas del usuario
    const metrics = await UserMetricsModel.findByUserId(userId);
    
    // Verificar y obtener la racha actual (puede resetearse a 0 si no hay consumo reciente)
    const streakData = getCurrentStreak(metrics || {});
    
    // Si la racha se reseteó a 0, actualizar en la base de datos
    if (streakData.streak === 0 && metrics && metrics.consumptionStreak && metrics.consumptionStreak > 0) {
      await UserMetricsModel.update(userId, {
        consumptionStreak: 0,
        streakLastUpdated: dateToTimestamp(new Date()),
      });
    }
    
    return {
      streak: streakData.streak,
      lastConsumptionDate: streakData.lastConsumptionDate,
    };
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
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    // Validar que el estrato esté definido
    if (user.stratum === null || user.stratum === undefined) {
      throw new Error('El estrato del usuario no está configurado. Por favor, configure su estrato antes de ver estadísticas.');
    }
    
    // Calcular totales
    const totalLiters = sessions.reduce((sum, s) => sum + (s.totalEstimatedLiters || 0), 0);
    const totalCost = calculateWaterCost(totalLiters, user.stratum);
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
      consumptionByItem[itemId].totalLiters += detail.calculatedLiters || 0;
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

