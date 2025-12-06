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
   * Almacena en users/{userId}/households y también en households/{householdId}/members
   */
  static async addUserToHousehold(userId, householdId, role = 'member') {
    const batch = db.batch();
    const timestamp = Timestamp.now();
    
    // Crear referencia en users/{userId}/households
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
      joinedAt: timestamp,
    };
    
    batch.set(userHouseholdRef, userHousehold);
    
    // También almacenar en households/{householdId}/members para consultas eficientes
    const householdMemberRef = db
      .collection('households')
      .doc(householdId)
      .collection('members')
      .doc(userId);
    
    const householdMember = {
      userId,
      householdId,
      role,
      joinedAt: timestamp,
    };
    
    batch.set(householdMemberRef, householdMember);
    
    await batch.commit();
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
   * Usa households/{householdId}/members para consultas eficientes (no requiere índice)
   */
  static async getUsersByHouseholdId(householdId) {
    const membersRef = db
      .collection('households')
      .doc(householdId)
      .collection('members');
    
    const snapshot = await membersRef.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Migrar miembros existentes desde users/{userId}/households a households/{householdId}/members
   * Se llama automáticamente si no se encuentran miembros en la nueva estructura
   */
  static async migrateHouseholdMembers(householdId) {
    // Obtener todos los usuarios que tienen este householdId en users/{userId}/households
    // Esto requiere obtener todos los usuarios, pero es solo para migración
    try {
      // Buscar en todos los usuarios (esto es costoso, pero solo para migración)
      const usersSnapshot = await db.collection('users').limit(1000).get();
      const batch = db.batch();
      let count = 0;

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const householdsSnapshot = await db
          .collection('users')
          .doc(userId)
          .collection('households')
          .where('householdId', '==', householdId)
          .limit(1)
          .get();

        if (!householdsSnapshot.empty) {
          const householdData = householdsSnapshot.docs[0].data();
          const householdMemberRef = db
            .collection('households')
            .doc(householdId)
            .collection('members')
            .doc(userId);
          
          batch.set(householdMemberRef, {
            userId: householdData.userId || userId,
            householdId: householdData.householdId,
            role: householdData.role,
            joinedAt: householdData.joinedAt,
          }, { merge: true });
          count++;
        }
      }

      if (count > 0) {
        await batch.commit();
      }

      return count;
    } catch (error) {
      console.error('Error migrando miembros:', error);
      return 0;
    }
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
   * Actualiza en users/{userId}/households y también en households/{householdId}/members
   */
  static async updateRole(userId, householdId, newRole) {
    const userHousehold = await this.getUserHousehold(userId, householdId);
    if (!userHousehold) {
      throw new Error('Relación usuario-hogar no encontrada');
    }
    
    const batch = db.batch();
    
    // Actualizar en users/{userId}/households
    const userHouseholdRef = db
      .collection('users')
      .doc(userId)
      .collection('households')
      .doc(userHousehold.id);
    
    batch.update(userHouseholdRef, { role: newRole });
    
    // Actualizar en households/{householdId}/members
    const householdMemberRef = db
      .collection('households')
      .doc(householdId)
      .collection('members')
      .doc(userId);
    
    batch.update(householdMemberRef, { role: newRole });
    
    await batch.commit();
    return await this.getUserHousehold(userId, householdId);
  }

  /**
   * Remover usuario de un hogar
   * Elimina de users/{userId}/households y también de households/{householdId}/members
   */
  static async removeUserFromHousehold(userId, householdId) {
    const userHousehold = await this.getUserHousehold(userId, householdId);
    if (!userHousehold) {
      throw new Error('Relación usuario-hogar no encontrada');
    }
    
    const batch = db.batch();
    
    // Eliminar de users/{userId}/households
    const userHouseholdRef = db
      .collection('users')
      .doc(userId)
      .collection('households')
      .doc(userHousehold.id);
    
    batch.delete(userHouseholdRef);
    
    // Eliminar de households/{householdId}/members
    const householdMemberRef = db
      .collection('households')
      .doc(householdId)
      .collection('members')
      .doc(userId);
    
    batch.delete(householdMemberRef);
    
    await batch.commit();
    return true;
  }
}

