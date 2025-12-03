/**
 * Modelo de Usuario para Firestore
 * 
 * Estructura del documento:
 * El ID del documento es el UID de Firebase Authentication
 * El userId está implícito en el ID del documento
 * 
 * {
 *   name: string
 *   email: string (único, sincronizado con Firebase Auth)
 *   nickname: string (opcional, null por defecto)
 *   avatarUrl: string (opcional, null por defecto)
 *   stratum: number (1-6, null por defecto hasta que se asigne)
 *   dailyGoal: number (opcional, meta diaria en litros, null por defecto)
 *   monthlyGoal: number (opcional, meta mensual en litros, null por defecto)
 *   createdAt: Timestamp
 *   updatedAt: Timestamp
 * }
 * 
 * Nota: Los campos de progreso (consumptionStreak, lastConsumptionDate, streakLastUpdated)
 * están en la subcolección users/{uid}/metrics/{metricsId}
 */

import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

const COLLECTION_NAME = 'users';

export class UserModel {
  /**
   * Crear un nuevo usuario usando el UID de Firebase Auth
   */
  static async create(uid, userData) {
    const userRef = db.collection(COLLECTION_NAME).doc(uid);
    const user = {
      ...userData,
      stratum: userData.stratum !== undefined ? userData.stratum : null, // Estrato null hasta que se asigne
      dailyGoal: userData.dailyGoal !== undefined ? userData.dailyGoal : null, // Meta diaria null por defecto
      monthlyGoal: userData.monthlyGoal !== undefined ? userData.monthlyGoal : null, // Meta mensual null por defecto
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await userRef.set(user);
    return user;
  }

  /**
   * Obtener usuario por UID (ID del documento = UID de Firebase Auth)
   */
  static async findById(uid) {
    const userDoc = await db.collection(COLLECTION_NAME).doc(uid).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    return { uid: userDoc.id, ...userDoc.data() };
  }

  /**
   * Obtener usuario por email
   */
  static async findByEmail(email) {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { uid: doc.id, ...doc.data() };
  }

  /**
   * Actualizar usuario
   */
  static async update(userId, updateData) {
    const userRef = db.collection(COLLECTION_NAME).doc(userId);
    await userRef.update({
      ...updateData,
      updatedAt: Timestamp.now(),
    });
    
    return await this.findById(userId);
  }

  /**
   * Eliminar usuario
   */
  static async delete(userId) {
    await db.collection(COLLECTION_NAME).doc(userId).delete();
    return true;
  }

  /**
   * Verificar si el email existe
   */
  static async emailExists(email) {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  /**
   * Obtener todos los usuarios
   */
  static async findAll() {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
  }
}

