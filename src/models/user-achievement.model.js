/**
 * Modelo de Logro de Usuario para Firestore
 * 
 * Se almacena como subcolección en users/{userId}/achievements
 * 
 * Estructura del documento:
 * {
 *   userAchievementId: string (auto-generado)
 *   userId: string
 *   achievementId: string
 *   unlockedAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

export class UserAchievementModel {
  /**
   * Desbloquear logro para un usuario
   */
  static async unlockAchievement(userId, achievementId) {
    const userAchievementRef = db
      .collection('users')
      .doc(userId)
      .collection('achievements')
      .doc();
    
    const userAchievement = {
      userAchievementId: userAchievementRef.id,
      userId,
      achievementId,
      unlockedAt: Timestamp.now(),
    };
    
    await userAchievementRef.set(userAchievement);
    return { id: userAchievementRef.id, ...userAchievement };
  }

  /**
   * Obtener todos los logros de un usuario
   */
  static async getAchievementsByUserId(userId) {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('achievements')
      .orderBy('unlockedAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Verificar si un usuario tiene un logro
   */
  static async hasAchievement(userId, achievementId) {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('achievements')
      .where('achievementId', '==', achievementId)
      .limit(1)
      .get();
    
    return !snapshot.empty;
  }
}

