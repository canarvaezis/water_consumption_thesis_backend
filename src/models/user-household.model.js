/**
 * Modelo de Relación Usuario-Hogar para Firestore
 * 
 * Se almacena como subcolección en users/{userId}/households
 * 
 * Estructura del documento:
 * {
 *   userHouseholdId: string (auto-generado)
 *   userId: string
 *   householdId: string
 *   role: string ('admin' | 'member')
 *   joinedAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

export class UserHouseholdModel {
  /**
   * Agregar usuario a un hogar
   */
  static async addUserToHousehold(userId, householdId, role = 'member') {
    const userHouseholdRef = db
      .collection('users')
      .doc(userId)
      .collection('households')
      .doc();
    
    const userHousehold = {
      userHouseholdId: userHouseholdRef.id,
      userId,
      householdId,
      role,
      joinedAt: Timestamp.now(),
    };
    
    await userHouseholdRef.set(userHousehold);
    return { id: userHouseholdRef.id, ...userHousehold };
  }

  /**
   * Obtener todos los hogares de un usuario
   */
  static async getHouseholdsByUserId(userId) {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('households')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Obtener todos los usuarios de un hogar
   */
  static async getUsersByHouseholdId(householdId) {
    // Necesitamos hacer una consulta en todas las subcolecciones
    // Esto requiere una consulta más compleja o almacenar también en households
    const usersRef = db.collectionGroup('households')
      .where('householdId', '==', householdId);
    
    const snapshot = await usersRef.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Obtener relación específica usuario-hogar
   */
  static async getUserHousehold(userId, householdId) {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('households')
      .where('householdId', '==', householdId)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Actualizar rol de usuario en hogar
   */
  static async updateRole(userId, householdId, newRole) {
    const userHousehold = await this.getUserHousehold(userId, householdId);
    if (!userHousehold) {
      throw new Error('Relación usuario-hogar no encontrada');
    }
    
    const userHouseholdRef = db
      .collection('users')
      .doc(userId)
      .collection('households')
      .doc(userHousehold.id);
    
    await userHouseholdRef.update({ role: newRole });
    return await this.getUserHousehold(userId, householdId);
  }

  /**
   * Remover usuario de un hogar
   */
  static async removeUserFromHousehold(userId, householdId) {
    const userHousehold = await this.getUserHousehold(userId, householdId);
    if (!userHousehold) {
      throw new Error('Relación usuario-hogar no encontrada');
    }
    
    await db
      .collection('users')
      .doc(userId)
      .collection('households')
      .doc(userHousehold.id)
      .delete();
    
    return true;
  }
}

