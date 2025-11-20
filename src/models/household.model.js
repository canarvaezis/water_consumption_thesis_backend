/**
 * Modelo de Hogar para Firestore
 * 
 * Estructura del documento:
 * {
 *   householdId: string (auto-generado)
 *   householdName: string
 *   inviteCode: string (único)
 *   createdAt: Timestamp
 *   updatedAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION_NAME = 'households';

export class HouseholdModel {
  /**
   * Generar código de invitación único
   */
  static async generateInviteCode() {
    let inviteCode;
    let exists = true;
    
    while (exists) {
      inviteCode = uuidv4().substring(0, 8).toUpperCase();
      const snapshot = await db
        .collection(COLLECTION_NAME)
        .where('inviteCode', '==', inviteCode)
        .limit(1)
        .get();
      exists = !snapshot.empty;
    }
    
    return inviteCode;
  }

  /**
   * Crear un nuevo hogar
   */
  static async create(householdData) {
    const householdRef = db.collection(COLLECTION_NAME).doc();
    const inviteCode = await this.generateInviteCode();
    
    const household = {
      householdId: householdRef.id,
      householdName: householdData.householdName,
      inviteCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await householdRef.set(household);
    return { id: householdRef.id, ...household };
  }

  /**
   * Obtener hogar por ID
   */
  static async findById(householdId) {
    const householdDoc = await db.collection(COLLECTION_NAME).doc(householdId).get();
    
    if (!householdDoc.exists) {
      return null;
    }
    
    return { id: householdDoc.id, ...householdDoc.data() };
  }

  /**
   * Obtener hogar por código de invitación
   */
  static async findByInviteCode(inviteCode) {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('inviteCode', '==', inviteCode)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Actualizar hogar
   */
  static async update(householdId, updateData) {
    const householdRef = db.collection(COLLECTION_NAME).doc(householdId);
    await householdRef.set({
      ...updateData,
      updatedAt: new Date(),
    }, { merge: true });
    
    return await this.findById(householdId);
  }

  /**
   * Eliminar hogar
   */
  static async delete(householdId) {
    await db.collection(COLLECTION_NAME).doc(householdId).delete();
    return true;
  }
}

