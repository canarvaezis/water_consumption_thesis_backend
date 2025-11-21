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
 *   createdAt: Timestamp
 *   updatedAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';

const COLLECTION_NAME = 'users';

export class UserModel {
  /**
   * Crear un nuevo usuario usando el UID de Firebase Auth
   */
  static async create(uid, userData) {
    const userRef = db.collection(COLLECTION_NAME).doc(uid);
    const user = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
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
      updatedAt: new Date(),
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
}

