/**
 * Modelo de Personalización de Usuario para Firestore
 * 
 * Se almacena como subcolección en users/{uid}/customization
 * Solo hay un documento "main" con toda la personalización activa
 * 
 * Estructura del documento:
 * {
 *   customizationId: "main" (fijo)
 *   userId: string
 *   skinColor: string (storeItemId del color de piel activo, null por defecto)
 *   faceShape: string (storeItemId de la forma de cara activa, null por defecto)
 *   eyes: string (storeItemId de los ojos activos, null por defecto)
 *   nose: string (storeItemId de la nariz activa, null por defecto)
 *   mouth: string (storeItemId de la boca activa, null por defecto)
 *   ears: string (storeItemId de las orejas activas, null por defecto)
 *   hair: string (storeItemId del pelo activo, null por defecto)
 *   alias: string (nickname, null por defecto)
 *   createdAt: Timestamp
 *   updatedAt: Timestamp
 * }
 */

import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

const SUBCOLLECTION_NAME = 'customization';
const DEFAULT_DOCUMENT_ID = 'main';

export class UserCustomizationModel {
  /**
   * Crear o actualizar personalización del usuario
   */
  static async upsert(userId, customizationData) {
    const customizationRef = db
      .collection('users')
      .doc(userId)
      .collection(SUBCOLLECTION_NAME)
      .doc(DEFAULT_DOCUMENT_ID);

    const existing = await this.findByUserId(userId);
    
    const customization = {
      customizationId: DEFAULT_DOCUMENT_ID,
      userId,
      skinColor: customizationData.skinColor !== undefined ? customizationData.skinColor : (existing?.skinColor || null),
      faceShape: customizationData.faceShape !== undefined ? customizationData.faceShape : (existing?.faceShape || null),
      eyes: customizationData.eyes !== undefined ? customizationData.eyes : (existing?.eyes || null),
      nose: customizationData.nose !== undefined ? customizationData.nose : (existing?.nose || null),
      mouth: customizationData.mouth !== undefined ? customizationData.mouth : (existing?.mouth || null),
      ears: customizationData.ears !== undefined ? customizationData.ears : (existing?.ears || null),
      hair: customizationData.hair !== undefined ? customizationData.hair : (existing?.hair || null),
      alias: customizationData.alias !== undefined ? customizationData.alias : (existing?.alias || null),
      updatedAt: Timestamp.now(),
    };

    if (!existing) {
      customization.createdAt = Timestamp.now();
      await customizationRef.set(customization);
    } else {
      await customizationRef.update(customization);
    }

    return { id: DEFAULT_DOCUMENT_ID, ...customization };
  }

  /**
   * Obtener personalización del usuario
   */
  static async findByUserId(userId) {
    const customizationDoc = await db
      .collection('users')
      .doc(userId)
      .collection(SUBCOLLECTION_NAME)
      .doc(DEFAULT_DOCUMENT_ID)
      .get();

    if (!customizationDoc.exists) {
      return null;
    }

    return { id: customizationDoc.id, ...customizationDoc.data() };
  }

  /**
   * Actualizar una parte específica de la personalización
   */
  static async updatePart(userId, part, storeItemId) {
    const validParts = ['skinColor', 'faceShape', 'eyes', 'nose', 'mouth', 'ears', 'hair', 'alias'];
    
    if (!validParts.includes(part)) {
      throw new Error(`Parte de personalización inválida: ${part}`);
    }

    const customizationRef = db
      .collection('users')
      .doc(userId)
      .collection(SUBCOLLECTION_NAME)
      .doc(DEFAULT_DOCUMENT_ID);

    const updateData = {
      [part]: storeItemId,
      updatedAt: Timestamp.now(),
    };

    // Si no existe, crear primero
    const existing = await this.findByUserId(userId);
    if (!existing) {
      await customizationRef.set({
        customizationId: DEFAULT_DOCUMENT_ID,
        userId,
        skinColor: null,
        faceShape: null,
        eyes: null,
        nose: null,
        mouth: null,
        ears: null,
        hair: null,
        alias: null,
        ...updateData,
        createdAt: Timestamp.now(),
      });
    } else {
      await customizationRef.update(updateData);
    }

    return await this.findByUserId(userId);
  }

  /**
   * Eliminar personalización del usuario
   */
  static async delete(userId) {
    await db
      .collection('users')
      .doc(userId)
      .collection(SUBCOLLECTION_NAME)
      .doc(DEFAULT_DOCUMENT_ID)
      .delete();

    return true;
  }
}

