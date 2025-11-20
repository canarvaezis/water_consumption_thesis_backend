/**
 * Modelo de Recomendación de Usuario para Firestore
 * 
 * Se almacena como subcolección en users/{userId}/recommendations
 * 
 * Estructura del documento:
 * {
 *   userRecommendationId: string (auto-generado)
 *   userId: string
 *   title: string
 *   description: string
 *   type: string ('saving' | 'alert' | 'tip')
 *   seen: boolean
 *   createdAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';

export class UserRecommendationModel {
  /**
   * Crear una nueva recomendación
   */
  static async create(userId, recommendationData) {
    const recommendationRef = db
      .collection('users')
      .doc(userId)
      .collection('recommendations')
      .doc();
    
    const recommendation = {
      userRecommendationId: recommendationRef.id,
      userId,
      title: recommendationData.title,
      description: recommendationData.description || null,
      type: recommendationData.type || 'tip',
      seen: false,
      createdAt: new Date(),
    };
    
    await recommendationRef.set(recommendation);
    return { id: recommendationRef.id, ...recommendation };
  }

  /**
   * Obtener recomendaciones de un usuario
   */
  static async getRecommendationsByUserId(userId, options = {}) {
    let query = db
      .collection('users')
      .doc(userId)
      .collection('recommendations');
    
    if (options.unseenOnly) {
      query = query.where('seen', '==', false);
    }
    
    if (options.type) {
      query = query.where('type', '==', options.type);
    }
    
    query = query.orderBy('createdAt', 'desc');
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Marcar recomendación como vista
   */
  static async markAsSeen(userId, recommendationId) {
    const recommendationRef = db
      .collection('users')
      .doc(userId)
      .collection('recommendations')
      .doc(recommendationId);
    
    await recommendationRef.update({ seen: true });
    return true;
  }

  /**
   * Eliminar recomendación
   */
  static async delete(userId, recommendationId) {
    await db
      .collection('users')
      .doc(userId)
      .collection('recommendations')
      .doc(recommendationId)
      .delete();
    
    return true;
  }
}

