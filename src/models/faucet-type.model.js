/**
 * Modelo de Tipo de Grifo para Firestore
 * 
 * Estructura del documento:
 * {
 *   faucetTypeId: string (auto-generado)
 *   name: string (ej: "Grifo estándar", "Ducha de bajo flujo", "Grifo ahorrador")
 *   description: string
 *   litersPerMinute: number (consumo en litros por minuto)
 *   isActive: boolean
 *   createdAt: Timestamp
 *   updatedAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

const COLLECTION_NAME = 'faucetTypes';

export class FaucetTypeModel {
  /**
   * Crear un nuevo tipo de grifo
   */
  static async create(faucetData) {
    const faucetRef = db.collection(COLLECTION_NAME).doc();
    const faucet = {
      faucetTypeId: faucetRef.id,
      name: faucetData.name,
      description: faucetData.description || '',
      litersPerMinute: faucetData.litersPerMinute,
      isActive: faucetData.isActive !== undefined ? faucetData.isActive : true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await faucetRef.set(faucet);
    return { id: faucetRef.id, ...faucet };
  }

  /**
   * Obtener tipo de grifo por ID
   */
  static async findById(faucetTypeId) {
    const faucetDoc = await db.collection(COLLECTION_NAME).doc(faucetTypeId).get();
    
    if (!faucetDoc.exists) {
      return null;
    }
    
    return { id: faucetDoc.id, ...faucetDoc.data() };
  }

  /**
   * Obtener todos los tipos de grifos activos
   */
  static async findAllActive() {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('isActive', '==', true)
      .orderBy('name', 'asc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Obtener todos los tipos de grifos (incluyendo inactivos)
   */
  static async findAll() {
    const snapshot = await db
      .collection(COLLECTION_NAME)
      .orderBy('name', 'asc')
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Actualizar tipo de grifo
   */
  static async update(faucetTypeId, updateData) {
    const faucetRef = db.collection(COLLECTION_NAME).doc(faucetTypeId);
    await faucetRef.set({
      ...updateData,
      updatedAt: Timestamp.now(),
    }, { merge: true });
    
    return await this.findById(faucetTypeId);
  }

  /**
   * Eliminar tipo de grifo (soft delete)
   */
  static async delete(faucetTypeId) {
    await this.update(faucetTypeId, { isActive: false });
    return true;
  }

  /**
   * Restaurar tipo de grifo eliminado
   */
  static async restore(faucetTypeId) {
    await this.update(faucetTypeId, { isActive: true });
    return await this.findById(faucetTypeId);
  }
}

