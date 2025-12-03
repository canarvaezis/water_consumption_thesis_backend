/**
 * Servicio de Puntos
 * 
 * Centraliza toda la lógica de otorgamiento de puntos por diferentes acciones
 */

import { WalletModel } from '../models/wallet.model.js';
import { WalletTransactionModel } from '../models/wallet-transaction.model.js';

export class PointsService {
  /**
   * Verificar si ya se otorgaron puntos para un milestone específico
   * @param {string} userId - ID del usuario
   * @param {string} milestoneType - Tipo de milestone (ej: 'daily_goal', 'setup_complete')
   * @param {string} milestoneId - ID único del milestone (ej: fecha '2024-01-15' para daily_goal)
   * @returns {Promise<boolean>} - true si ya se otorgaron puntos
   */
  static async hasReceivedPoints(userId, milestoneType, milestoneId) {
    const wallet = await WalletModel.findByUserId(userId);
    if (!wallet) {
      return false;
    }

    // Buscar transacciones con descripción que coincida con el milestone
    const transactions = await WalletTransactionModel.getTransactions(userId, wallet.id, {
      limit: 1000,
      type: 'reward',
    });

    const milestoneDescription = this.getMilestoneDescription(milestoneType, milestoneId);
    
    return transactions.some(t => 
      t.description === milestoneDescription || 
      t.description?.includes(milestoneDescription)
    );
  }

  /**
   * Obtener descripción del milestone
   */
  static getMilestoneDescription(milestoneType, milestoneId) {
    const descriptions = {
      'daily_goal': `Meta diaria cumplida - ${milestoneId}`,
      'monthly_goal': `Meta mensual cumplida - ${milestoneId}`,
      'setup_complete': 'Setup inicial completado',
      'household_create': 'Crear familia',
      'household_join': 'Unirse a familia',
      'avatar_set': 'Avatar configurado',
      'nickname_set': 'Nickname configurado',
      'stratum_set': 'Estrato configurado',
      'daily_goal_set': 'Meta diaria establecida',
      'monthly_goal_set': 'Meta mensual establecida',
      'weekly_consistency': `Semana completa de registros - ${milestoneId}`,
    };
    
    return descriptions[milestoneType] || `Milestone: ${milestoneType}`;
  }

  /**
   * Otorgar puntos al usuario
   * @param {string} userId - ID del usuario
   * @param {number} points - Cantidad de puntos a otorgar
   * @param {string} milestoneType - Tipo de milestone
   * @param {string} milestoneId - ID único del milestone
   * @param {string} referenceId - ID de referencia opcional (ej: sessionId)
   * @returns {Promise<Object>} - Información de la transacción
   */
  static async awardPoints(userId, points, milestoneType, milestoneId = null, referenceId = null) {
    if (points <= 0) {
      return null;
    }

    // Verificar si ya se otorgaron puntos para este milestone
    if (milestoneId && await this.hasReceivedPoints(userId, milestoneType, milestoneId)) {
      return null; // Ya se otorgaron puntos
    }

    // Asegurar que el wallet existe
    let wallet = await WalletModel.findByUserId(userId);
    if (!wallet) {
      wallet = await WalletModel.create(userId, 0);
    }

    // Agregar puntos
    await WalletModel.addPoints(userId, wallet.id, points);

    // Registrar transacción
    const description = this.getMilestoneDescription(milestoneType, milestoneId);
    const transaction = await WalletTransactionModel.create(userId, wallet.id, {
      type: 'reward',
      amount: points,
      description,
      referenceId,
    });

    // Obtener balance actualizado
    const updatedWallet = await WalletModel.findByUserId(userId);

    return {
      points,
      transaction,
      wallet: updatedWallet,
    };
  }

  /**
   * Otorgar puntos por mantener consumo bajo meta diaria
   */
  static async awardDailyGoalPoints(userId, date) {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
    return await this.awardPoints(userId, 20, 'daily_goal', dateStr);
  }

  /**
   * Otorgar puntos por mantener consumo bajo meta mensual
   */
  static async awardMonthlyGoalPoints(userId, year, month) {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    return await this.awardPoints(userId, 100, 'monthly_goal', monthStr);
  }

  /**
   * Otorgar puntos por completar setup inicial
   */
  static async awardSetupCompletePoints(userId) {
    return await this.awardPoints(userId, 25, 'setup_complete', 'once');
  }

  /**
   * Otorgar puntos por crear familia
   */
  static async awardHouseholdCreatePoints(userId, householdId) {
    return await this.awardPoints(userId, 20, 'household_create', householdId, householdId);
  }

  /**
   * Otorgar puntos por unirse a familia
   */
  static async awardHouseholdJoinPoints(userId, householdId) {
    return await this.awardPoints(userId, 15, 'household_join', householdId, householdId);
  }

  /**
   * Otorgar puntos por configurar avatar
   */
  static async awardAvatarSetPoints(userId) {
    return await this.awardPoints(userId, 10, 'avatar_set', 'once');
  }

  /**
   * Otorgar puntos por configurar nickname
   */
  static async awardNicknameSetPoints(userId) {
    return await this.awardPoints(userId, 10, 'nickname_set', 'once');
  }

  /**
   * Otorgar puntos por configurar estrato
   */
  static async awardStratumSetPoints(userId) {
    return await this.awardPoints(userId, 15, 'stratum_set', 'once');
  }

  /**
   * Otorgar puntos por establecer meta diaria
   */
  static async awardDailyGoalSetPoints(userId) {
    return await this.awardPoints(userId, 20, 'daily_goal_set', 'once');
  }

  /**
   * Otorgar puntos por establecer meta mensual
   */
  static async awardMonthlyGoalSetPoints(userId) {
    return await this.awardPoints(userId, 20, 'monthly_goal_set', 'once');
  }

  /**
   * Otorgar puntos por semana completa de registros
   */
  static async awardWeeklyConsistencyPoints(userId, weekStartDate) {
    const weekStr = weekStartDate.toISOString().split('T')[0]; // YYYY-MM-DD
    return await this.awardPoints(userId, 50, 'weekly_consistency', weekStr);
  }
}

