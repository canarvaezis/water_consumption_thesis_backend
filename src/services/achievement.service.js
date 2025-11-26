/**
 * Servicio de Logros
 * 
 * Lógica de negocio para gestión de logros y evaluación
 */

import { AchievementModel } from '../models/achievement.model.js';
import { UserAchievementModel } from '../models/user-achievement.model.js';
import { WalletModel } from '../models/wallet.model.js';
import { WalletTransactionModel } from '../models/wallet-transaction.model.js';
import { ConsumptionSessionModel } from '../models/consumption-session.model.js';
import { UserModel } from '../models/user.model.js';

export class AchievementService {
  /**
   * Obtener todos los logros disponibles
   */
  static async getAllAchievements(userId) {
    const achievements = await AchievementModel.findAll();
    const userAchievements = await UserAchievementModel.getAchievementsByUserId(userId);
    const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));

    return achievements.map(achievement => ({
      id: achievement.id,
      achievementId: achievement.achievementId || achievement.id,
      name: achievement.name,
      description: achievement.description,
      reward: achievement.reward || 0,
      iconUrl: achievement.iconUrl,
      category: achievement.category || null,
      unlocked: unlockedAchievementIds.has(achievement.id),
      unlockedAt: userAchievements.find(ua => ua.achievementId === achievement.id)?.unlockedAt || null,
      createdAt: achievement.createdAt,
    }));
  }

  /**
   * Obtener logro por ID
   */
  static async getAchievementById(userId, achievementId) {
    const achievement = await AchievementModel.findById(achievementId);
    if (!achievement) {
      throw new Error('Logro no encontrado');
    }

    const unlocked = await UserAchievementModel.hasAchievement(userId, achievementId);
    const userAchievement = unlocked 
      ? (await UserAchievementModel.getAchievementsByUserId(userId))
          .find(ua => ua.achievementId === achievementId)
      : null;

    return {
      id: achievement.id,
      achievementId: achievement.achievementId || achievement.id,
      name: achievement.name,
      description: achievement.description,
      reward: achievement.reward || 0,
      iconUrl: achievement.iconUrl,
      category: achievement.category || null,
      unlocked,
      unlockedAt: userAchievement?.unlockedAt || null,
      createdAt: achievement.createdAt,
    };
  }

  /**
   * Obtener logros por categoría
   */
  static async getAchievementsByCategory(userId, category) {
    const allAchievements = await this.getAllAchievements(userId);
    return allAchievements.filter(achievement => 
      achievement.category && achievement.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Obtener logros desbloqueados por el usuario
   */
  static async getUserAchievements(userId) {
    const userAchievements = await UserAchievementModel.getAchievementsByUserId(userId);
    const achievements = await Promise.all(
      userAchievements.map(async (userAchievement) => {
        const achievement = await AchievementModel.findById(userAchievement.achievementId);
        if (!achievement) return null;

        return {
          id: userAchievement.id,
          achievement: {
            id: achievement.id,
            achievementId: achievement.achievementId || achievement.id,
            name: achievement.name,
            description: achievement.description,
            reward: achievement.reward || 0,
            iconUrl: achievement.iconUrl,
            category: achievement.category || null,
          },
          unlockedAt: userAchievement.unlockedAt?.toDate 
            ? userAchievement.unlockedAt.toDate() 
            : userAchievement.unlockedAt,
        };
      })
    );

    return achievements.filter(a => a !== null);
  }

  /**
   * Obtener progreso de logros (cuáles están cerca)
   */
  static async getAchievementsProgress(userId) {
    const allAchievements = await AchievementModel.findAll();
    const userAchievements = await UserAchievementModel.getAchievementsByUserId(userId);
    const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));

    // Obtener estadísticas del usuario para evaluar progreso
    const user = await UserModel.findById(userId);
    const sessions = await ConsumptionSessionModel.findByUserId(userId, 30); // Últimos 30 días
    
    const totalConsumption = sessions.reduce((sum, s) => sum + (s.totalEstimatedLiters || 0), 0);
    const daysActive = new Set(sessions.map(s => {
      const date = s.consumptionDate?.toDate ? s.consumptionDate.toDate() : new Date();
      return date.toISOString().split('T')[0];
    })).size;

    const progress = allAchievements.map(achievement => {
      const unlocked = unlockedAchievementIds.has(achievement.id);
      
      // Calcular progreso basado en el tipo de logro
      // Por ahora, retornamos información básica
      // En el futuro se puede extender con lógica específica por tipo de logro
      let progressPercentage = 0;
      let progressDescription = '';

      if (unlocked) {
        progressPercentage = 100;
        progressDescription = 'Completado';
      } else {
        // Lógica básica de progreso (se puede extender)
        // Ejemplo: si el logro es sobre consumo total
        if (achievement.name?.toLowerCase().includes('consumo') || 
            achievement.description?.toLowerCase().includes('litros')) {
          // Progreso basado en consumo (ejemplo simplificado)
          progressPercentage = Math.min(100, (totalConsumption / 1000) * 10); // Ejemplo
          progressDescription = `${totalConsumption.toFixed(1)} litros consumidos`;
        } else if (achievement.name?.toLowerCase().includes('días') || 
                   achievement.description?.toLowerCase().includes('días')) {
          progressPercentage = Math.min(100, (daysActive / 7) * 100); // Ejemplo: 7 días
          progressDescription = `${daysActive} días activos`;
        } else {
          progressPercentage = 0;
          progressDescription = 'No iniciado';
        }
      }

      return {
        achievement: {
          id: achievement.id,
          achievementId: achievement.achievementId || achievement.id,
          name: achievement.name,
          description: achievement.description,
          reward: achievement.reward || 0,
          iconUrl: achievement.iconUrl,
          category: achievement.category || null,
        },
        unlocked,
        progress: {
          percentage: Math.round(progressPercentage),
          description: progressDescription,
        },
      };
    });

    return {
      achievements: progress,
      summary: {
        total: allAchievements.length,
        unlocked: userAchievements.length,
        locked: allAchievements.length - userAchievements.length,
      },
    };
  }

  /**
   * Reclamar recompensa de logro
   */
  static async claimAchievementReward(userId, achievementId) {
    // Verificar que el logro existe
    const achievement = await AchievementModel.findById(achievementId);
    if (!achievement) {
      throw new Error('Logro no encontrado');
    }

    // Verificar que el usuario tiene el logro
    const hasAchievement = await UserAchievementModel.hasAchievement(userId, achievementId);
    if (!hasAchievement) {
      throw new Error('No has desbloqueado este logro');
    }

    // Verificar si ya se reclamó la recompensa (por ahora, asumimos que se reclama al desbloquear)
    // En el futuro se puede agregar un campo "claimed" en UserAchievementModel

    // Obtener o crear wallet
    let wallet = await WalletModel.findByUserId(userId);
    if (!wallet) {
      wallet = await WalletModel.create(userId, 0);
    }

    // Agregar puntos
    const updatedWallet = await WalletModel.addPoints(userId, wallet.id, achievement.reward || 0);

    // Registrar transacción
    const transaction = await WalletTransactionModel.create(userId, wallet.id, {
      type: 'reward',
      amount: achievement.reward || 0,
      description: `Recompensa por logro: ${achievement.name}`,
      referenceId: achievementId,
    });

    return {
      achievement: {
        id: achievement.id,
        name: achievement.name,
        reward: achievement.reward || 0,
      },
      wallet: {
        balance: updatedWallet.balance,
      },
      pointsEarned: achievement.reward || 0,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
      },
    };
  }

  /**
   * Evaluar logros del usuario (automático o manual)
   */
  static async evaluateAchievements(userId) {
    const allAchievements = await AchievementModel.findAll();
    const userAchievements = await UserAchievementModel.getAchievementsByUserId(userId);
    const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));

    // Obtener estadísticas del usuario
    const user = await UserModel.findById(userId);
    const sessions = await ConsumptionSessionModel.findByUserId(userId, 365); // Último año
    
    const totalConsumption = sessions.reduce((sum, s) => sum + (s.totalEstimatedLiters || 0), 0);
    const daysActive = new Set(sessions.map(s => {
      const date = s.consumptionDate?.toDate ? s.consumptionDate.toDate() : new Date();
      return date.toISOString().split('T')[0];
    })).size;

    const newlyUnlocked = [];

    for (const achievement of allAchievements) {
      // Si ya está desbloqueado, continuar
      if (unlockedAchievementIds.has(achievement.id)) {
        continue;
      }

      // Evaluar condiciones del logro
      let shouldUnlock = false;

      // Lógica de evaluación básica (se puede extender)
      const name = achievement.name?.toLowerCase() || '';
      const description = achievement.description?.toLowerCase() || '';

      // Ejemplos de condiciones
      if (name.includes('primer') || description.includes('primer')) {
        // Primer logro: si tiene al menos una sesión
        if (sessions.length > 0) {
          shouldUnlock = true;
        }
      } else if (name.includes('100') || description.includes('100 litros')) {
        // 100 litros consumidos
        if (totalConsumption >= 100) {
          shouldUnlock = true;
        }
      } else if (name.includes('1000') || description.includes('1000 litros')) {
        // 1000 litros consumidos
        if (totalConsumption >= 1000) {
          shouldUnlock = true;
        }
      } else if (name.includes('7 días') || description.includes('7 días')) {
        // 7 días activos
        if (daysActive >= 7) {
          shouldUnlock = true;
        }
      } else if (name.includes('30 días') || description.includes('30 días')) {
        // 30 días activos
        if (daysActive >= 30) {
          shouldUnlock = true;
        }
      }

      if (shouldUnlock) {
        // Desbloquear logro
        await UserAchievementModel.unlockAchievement(userId, achievement.id);
        newlyUnlocked.push(achievement);

        // Agregar puntos automáticamente
        let wallet = await WalletModel.findByUserId(userId);
        if (!wallet) {
          wallet = await WalletModel.create(userId, 0);
        }

        if (achievement.reward > 0) {
          await WalletModel.addPoints(userId, wallet.id, achievement.reward);
          await WalletTransactionModel.create(userId, wallet.id, {
            type: 'reward',
            amount: achievement.reward,
            description: `Recompensa por logro: ${achievement.name}`,
            referenceId: achievement.id,
          });
        }
      }
    }

    return {
      newlyUnlocked: newlyUnlocked.length,
      achievements: newlyUnlocked.map(a => ({
        id: a.id,
        name: a.name,
        reward: a.reward || 0,
      })),
    };
  }
}

