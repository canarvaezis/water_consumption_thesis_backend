/**
 * Servicio de Estrato
 * 
 * Lógica de negocio para gestión de estrato y tarifas
 */

import { UserModel } from '../models/user.model.js';
import { StratumHistoryModel } from '../models/stratum-history.model.js';
import { EMCALI_RATES } from '../utils/water-calculations.utils.js';

export class StratumService {
  /**
   * Obtener estrato actual del usuario
   */
  static async getUserStratum(userId) {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return {
      stratum: user.stratum || 3,
      updatedAt: user.updatedAt?.toDate ? user.updatedAt.toDate() : user.updatedAt,
    };
  }

  /**
   * Actualizar estrato del usuario
   * Registra el cambio en el historial
   */
  static async updateStratum(userId, newStratum) {
    // Validar estrato
    if (!Number.isInteger(newStratum) || newStratum < 1 || newStratum > 6) {
      throw new Error('El estrato debe ser un número entre 1 y 6');
    }

    // Obtener usuario actual
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const previousStratum = user.stratum || 3;

    // Si el estrato no cambió, no hacer nada
    if (previousStratum === newStratum) {
      return {
        stratum: newStratum,
        message: 'El estrato ya está configurado en este valor',
        changed: false,
      };
    }

    // Registrar cambio en historial
    await StratumHistoryModel.create(userId, previousStratum, newStratum);

    // Actualizar estrato del usuario
    const updatedUser = await UserModel.update(userId, {
      stratum: newStratum,
    });

    return {
      stratum: newStratum,
      previousStratum,
      updatedAt: updatedUser.updatedAt?.toDate ? updatedUser.updatedAt.toDate() : updatedUser.updatedAt,
      changed: true,
    };
  }

  /**
   * Obtener historial de cambios de estrato
   */
  static async getStratumHistory(userId, options = {}) {
    const { limit = 50 } = options;
    
    const history = await StratumHistoryModel.getHistoryByUserId(userId, { limit });

    return {
      history,
      count: history.length,
    };
  }

  /**
   * Obtener tarifas por estrato (información pública)
   */
  static async getStratumRates(stratum = null) {
    if (stratum) {
      // Validar estrato
      if (!Number.isInteger(stratum) || stratum < 1 || stratum > 6) {
        throw new Error('El estrato debe ser un número entre 1 y 6');
      }

      const rates = EMCALI_RATES[stratum];
      if (!rates) {
        throw new Error(`Estrato ${stratum} no válido`);
      }

      return {
        stratum,
        rates: {
          block1: rates.block1,
          block2: rates.block2,
          block3: rates.block3,
          fixedCharge: rates.fixedCharge,
        },
        description: this.getStratumDescription(stratum),
      };
    }

    // Retornar todas las tarifas
    const allRates = {};
    for (let i = 1; i <= 6; i++) {
      allRates[i] = {
        block1: EMCALI_RATES[i].block1,
        block2: EMCALI_RATES[i].block2,
        block3: EMCALI_RATES[i].block3,
        fixedCharge: EMCALI_RATES[i].fixedCharge,
        description: this.getStratumDescription(i),
      };
    }

    return {
      rates: allRates,
      note: 'Tarifas de Emcali. Los precios están en pesos colombianos por metro cúbico.',
    };
  }

  /**
   * Obtener descripción del estrato
   */
  static getStratumDescription(stratum) {
    const descriptions = {
      1: 'Estrato 1 - Bajo-bajo',
      2: 'Estrato 2 - Bajo',
      3: 'Estrato 3 - Medio-bajo',
      4: 'Estrato 4 - Medio',
      5: 'Estrato 5 - Medio-alto',
      6: 'Estrato 6 - Alto',
    };
    return descriptions[stratum] || `Estrato ${stratum}`;
  }
}

