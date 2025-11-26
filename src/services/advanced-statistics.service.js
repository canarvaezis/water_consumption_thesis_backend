/**
 * Servicio de Estadísticas Avanzadas
 * 
 * Proporciona análisis avanzados de consumo:
 * - Comparación entre períodos
 * - Tendencias de consumo
 * - Predicciones de consumo futuro
 * - Exportación de datos
 */

import { ConsumptionSessionModel } from '../models/consumption-session.model.js';
import { UserConsumptionDetailModel } from '../models/user-consumption-detail.model.js';
import { UserModel } from '../models/user.model.js';
import { calculateWaterCost, calculatePercentageChange } from '../utils/water-calculations.utils.js';

export class AdvancedStatisticsService {
  /**
   * Comparar consumo entre dos períodos
   */
  static async comparePeriods(userId, period1, period2, type = 'daily') {
    // Parsear períodos
    const p1 = this.parsePeriod(period1, type);
    const p2 = this.parsePeriod(period2, type);

    // Obtener estadísticas de ambos períodos
    const stats1 = await this.getPeriodStatistics(userId, p1.start, p1.end);
    const stats2 = await this.getPeriodStatistics(userId, p2.start, p2.end);

    // Calcular diferencias
    const litersDiff = stats2.totalLiters - stats1.totalLiters;
    const costDiff = stats2.totalCost - stats1.totalCost;
    const litersPercentageChange = calculatePercentageChange(stats2.totalLiters, stats1.totalLiters);
    const costPercentageChange = calculatePercentageChange(stats2.totalCost, stats1.totalCost);

    return {
      period1: {
        ...p1,
        ...stats1,
      },
      period2: {
        ...p2,
        ...stats2,
      },
      comparison: {
        litersDifference: litersDiff,
        costDifference: costDiff,
        litersPercentageChange: Math.round(litersPercentageChange * 100) / 100,
        costPercentageChange: Math.round(costPercentageChange * 100) / 100,
        trend: litersDiff > 0 ? 'increase' : litersDiff < 0 ? 'decrease' : 'stable',
      },
    };
  }

  /**
   * Obtener tendencias de consumo
   */
  static async getConsumptionTrends(userId, period, metric = 'liters') {
    // Parsear período
    const parsedPeriod = this.parsePeriod(period, 'daily');
    const start = parsedPeriod.start;
    const end = parsedPeriod.end;

    // Obtener sesiones agrupadas por día
    const sessions = await ConsumptionSessionModel.findByDateRange(userId, start, end);
    const user = await UserModel.findById(userId);
    const stratum = user?.stratum || 3;

    // Agrupar por día
    const dailyData = {};
    sessions.forEach(session => {
      // Convertir consumptionDate (Timestamp) a Date
      const sessionDate = session.consumptionDate?.toDate 
        ? session.consumptionDate.toDate() 
        : (session.consumptionDate instanceof Date 
          ? session.consumptionDate 
          : new Date(session.consumptionDate));
      const dateKey = sessionDate.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          liters: 0,
          cost: 0,
          sessions: 0,
        };
      }
      dailyData[dateKey].liters += session.totalEstimatedLiters || 0;
      dailyData[dateKey].sessions += 1;
    });

    // Calcular costos
    Object.keys(dailyData).forEach(dateKey => {
      dailyData[dateKey].cost = calculateWaterCost(dailyData[dateKey].liters, stratum);
    });

    // Convertir a array y ordenar
    const dataPoints = Object.values(dailyData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // Calcular métricas de tendencia
    const values = dataPoints.map(dp => metric === 'liters' ? dp.liters : dp.cost);
    const average = values.length > 0 
      ? values.reduce((sum, val) => sum + val, 0) / values.length 
      : 0;
    
    // Calcular tendencia (regresión lineal simple)
    const trend = this.calculateLinearTrend(dataPoints.map((dp, idx) => ({
      x: idx,
      y: metric === 'liters' ? dp.liters : dp.cost,
    })));

    return {
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
      metric,
      dataPoints,
      summary: {
        average: Math.round(average * 100) / 100,
        min: values.length > 0 ? Math.min(...values) : 0,
        max: values.length > 0 ? Math.max(...values) : 0,
        total: values.reduce((sum, val) => sum + val, 0),
      },
      trend: {
        direction: trend.slope > 0 ? 'increasing' : trend.slope < 0 ? 'decreasing' : 'stable',
        slope: Math.round(trend.slope * 100) / 100,
        strength: Math.round(trend.r2 * 100) / 100, // R² como medida de fuerza
      },
    };
  }

  /**
   * Predecir consumo futuro
   */
  static async predictConsumption(userId, days, basedOn = 'lastWeek') {
    // Determinar período base
    let baseStart, baseEnd;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (basedOn === 'lastWeek') {
      baseEnd = new Date(today);
      baseEnd.setDate(baseEnd.getDate() - 1); // Ayer
      baseStart = new Date(baseEnd);
      baseStart.setDate(baseStart.getDate() - 6); // 7 días atrás
    } else if (basedOn === 'lastMonth') {
      baseEnd = new Date(today);
      baseEnd.setDate(baseEnd.getDate() - 1);
      baseStart = new Date(baseEnd);
      baseStart.setMonth(baseStart.getMonth() - 1);
    } else {
      // lastWeek por defecto
      baseEnd = new Date(today);
      baseEnd.setDate(baseEnd.getDate() - 1);
      baseStart = new Date(baseEnd);
      baseStart.setDate(baseStart.getDate() - 6);
    }

    // Obtener datos históricos
    const sessions = await ConsumptionSessionModel.findByDateRange(userId, baseStart, baseEnd);
    const user = await UserModel.findById(userId);
    const stratum = user?.stratum || 3;

    if (sessions.length === 0) {
      return {
        prediction: {
          averageDailyLiters: 0,
          predictedTotalLiters: 0,
          predictedTotalCost: 0,
        },
        basedOn: {
          period: {
            start: baseStart.toISOString().split('T')[0],
            end: baseEnd.toISOString().split('T')[0],
          },
          days: 0,
          totalLiters: 0,
        },
        forecast: [],
        message: 'No hay datos históricos suficientes para hacer una predicción',
      };
    }

    // Calcular promedio diario
    const totalLiters = sessions.reduce((sum, s) => sum + (s.totalEstimatedLiters || 0), 0);
    const averageDailyLiters = totalLiters / sessions.length;

    // Predecir para los próximos días
    const predictedTotalLiters = averageDailyLiters * days;
    const predictedTotalCost = calculateWaterCost(predictedTotalLiters, stratum);

    // Generar forecast diario
    const forecast = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i + 1);
      forecast.push({
        date: date.toISOString().split('T')[0],
        predictedLiters: Math.round(averageDailyLiters * 100) / 100,
        predictedCost: Math.round(calculateWaterCost(averageDailyLiters, stratum) * 100) / 100,
      });
    }

    return {
      prediction: {
        averageDailyLiters: Math.round(averageDailyLiters * 100) / 100,
        predictedTotalLiters: Math.round(predictedTotalLiters * 100) / 100,
        predictedTotalCost: Math.round(predictedTotalCost * 100) / 100,
      },
      basedOn: {
        period: {
          start: baseStart.toISOString().split('T')[0],
          end: baseEnd.toISOString().split('T')[0],
        },
        days: sessions.length,
        totalLiters: Math.round(totalLiters * 100) / 100,
        averageDailyLiters: Math.round(averageDailyLiters * 100) / 100,
      },
      forecast,
      days,
    };
  }

  /**
   * Exportar datos de consumo
   */
  static async exportConsumptionData(userId, startDate, endDate, format = 'csv') {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Obtener sesiones
    const sessions = await ConsumptionSessionModel.findByDateRange(userId, start, end);
    const user = await UserModel.findById(userId);
    const stratum = user?.stratum || 3;

    // Obtener detalles de todas las sesiones
    const exportData = [];
    for (const session of sessions) {
      const details = await UserConsumptionDetailModel.getDetailsBySessionId(session.id);
      
      // Convertir consumptionDate (Timestamp) a Date
      const sessionDate = session.consumptionDate?.toDate 
        ? session.consumptionDate.toDate() 
        : (session.consumptionDate instanceof Date 
          ? session.consumptionDate 
          : new Date(session.consumptionDate));
      const dateKey = sessionDate.toISOString().split('T')[0];

      if (details.length === 0) {
        // Sesión sin detalles
        exportData.push({
          date: dateKey,
          sessionId: session.id,
          totalLiters: session.totalEstimatedLiters || 0,
          totalCost: calculateWaterCost(session.totalEstimatedLiters || 0, stratum),
          itemId: null,
          itemName: null,
          timesPerDay: null,
          itemLiters: null,
        });
      } else {
        // Agregar cada detalle como fila
        for (const detail of details) {
          exportData.push({
            date: dateKey,
            sessionId: session.id,
            totalLiters: session.totalEstimatedLiters || 0,
            totalCost: calculateWaterCost(session.totalEstimatedLiters || 0, stratum),
            itemId: detail.consumptionItemId,
            itemName: null, // Se podría enriquecer con el nombre del item
            timesPerDay: detail.timesPerDay || 1,
            itemLiters: detail.estimatedLiters || 0,
          });
        }
      }
    }

    // Generar exportación según formato
    if (format === 'csv') {
      return this.generateCSV(exportData);
    } else if (format === 'json') {
      return {
        format: 'json',
        data: exportData,
        summary: {
          totalRecords: exportData.length,
          startDate: startDate,
          endDate: endDate,
          totalLiters: exportData.reduce((sum, row) => sum + (row.totalLiters || 0), 0),
        },
      };
    } else {
      throw new Error('Formato no soportado. Use "csv" o "json"');
    }
  }

  // ========== Métodos auxiliares ==========

  /**
   * Parsear período (puede ser "lastWeek", "lastMonth", o rango de fechas)
   */
  static parsePeriod(period, type) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period.includes('lastWeek')) {
      const end = new Date(today);
      end.setDate(end.getDate() - 1);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      return { start, end };
    } else if (period.includes('lastMonth')) {
      const end = new Date(today);
      end.setDate(end.getDate() - 1);
      const start = new Date(end);
      start.setMonth(start.getMonth() - 1);
      return { start, end };
    } else if (period.includes(',')) {
      // Rango de fechas: "2024-01-01,2024-01-31"
      const [startStr, endStr] = period.split(',');
      return {
        start: new Date(startStr),
        end: new Date(endStr),
      };
    } else {
      // Fecha única
      const date = new Date(period);
      return { start: date, end: date };
    }
  }

  /**
   * Obtener estadísticas de un período
   */
  static async getPeriodStatistics(userId, start, end) {
    const sessions = await ConsumptionSessionModel.findByDateRange(userId, start, end);
    const user = await UserModel.findById(userId);
    const stratum = user?.stratum || 3;

    const totalLiters = sessions.reduce((sum, s) => sum + (s.totalEstimatedLiters || 0), 0);
    const totalCost = calculateWaterCost(totalLiters, stratum);
    const averageLitersPerDay = sessions.length > 0 ? totalLiters / sessions.length : 0;

    return {
      totalLiters: Math.round(totalLiters * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      averageLitersPerDay: Math.round(averageLitersPerDay * 100) / 100,
      daysWithConsumption: sessions.length,
      totalDays: Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1,
    };
  }

  /**
   * Calcular tendencia lineal (regresión simple)
   */
  static calculateLinearTrend(dataPoints) {
    if (dataPoints.length < 2) {
      return { slope: 0, intercept: 0, r2: 0 };
    }

    const n = dataPoints.length;
    const sumX = dataPoints.reduce((sum, p) => sum + p.x, 0);
    const sumY = dataPoints.reduce((sum, p) => sum + p.y, 0);
    const sumXY = dataPoints.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = dataPoints.reduce((sum, p) => sum + p.x * p.x, 0);
    const sumY2 = dataPoints.reduce((sum, p) => sum + p.y * p.y, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calcular R²
    const meanY = sumY / n;
    const ssRes = dataPoints.reduce((sum, p) => {
      const predicted = slope * p.x + intercept;
      return sum + Math.pow(p.y - predicted, 2);
    }, 0);
    const ssTot = dataPoints.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0);
    const r2 = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

    return { slope, intercept, r2 };
  }

  /**
   * Generar CSV
   */
  static generateCSV(data) {
    if (data.length === 0) {
      return 'No hay datos para exportar';
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) {
          return '';
        }
        // Escapar comillas y envolver en comillas si contiene comas
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }
}

