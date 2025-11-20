/**
 * Modelo de Logro para Firestore
 * 
 * Estructura del documento:
 * {
 *   achievementId: string (auto-generado)
 *   name: string
 *   description: string (opcional)
 *   reward: number (puntos)
 *   iconUrl: string
 *   createdAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';

const COLLECTION_NAME = 'achievements';

export class AchievementModel {
  /**
   * Crear un nuevo logro
   */
  static async create(achievementData) {
    const achievementRef = db.collection(COLLECTION_NAME).doc();
    const achievement = {
      achievementId: achievementRef.id,
      name: achievementData.name,
      description: achievementData.description || null,
      reward: achievementData.reward,
      iconUrl: achievementData.iconUrl,
      createdAt: new Date(),
    };
    
    await achievementRef.set(achievement);
    return { id: achievementRef.id, ...achievement };
  }

  /**
   * Obtener logro por ID
   */
  static async findById(achievementId) {
    const achievementDoc = await db.collection(COLLECTION_NAME).doc(achievementId).get();
    
    if (!achievementDoc.exists) {
      return null;
    }
    
    return { id: achievementDoc.id, ...achievementDoc.data() };
  }

  /**
   * Obtener todos los logros
   */
  static async findAll() {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Actualizar logro
   */
  static async update(achievementId, updateData) {
    const achievementRef = db.collection(COLLECTION_NAME).doc(achievementId);
    await achievementRef.set({
      ...updateData,
      updatedAt: new Date(),
    }, { merge: true });
    
    return await this.findById(achievementId);
  }

  /**
   * Eliminar logro
   */
  static async delete(achievementId) {
    await db.collection(COLLECTION_NAME).doc(achievementId).delete();
    return true;
  }
}

