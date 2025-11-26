/**
 * Modelo de Notificación para Firestore
 * 
 * Se almacena como subcolección en users/{userId}/notifications
 * 
 * Estructura del documento:
 * {
 *   notificationId: string (auto-generado)
 *   userId: string
 *   type: string ('achievement' | 'consumption' | 'goal' | 'household' | 'system' | 'mission')
 *   title: string
 *   message: string
 *   read: boolean
 *   createdAt: Timestamp
 *   readAt: Timestamp (opcional, null si no está leída)
 *   actionUrl: string (opcional, URL de acción relacionada)
 *   metadata: object (opcional, datos adicionales)
 * }
 */

import { db } from '../config/firebase.js';
import { Timestamp } from 'firebase-admin/firestore';

export class NotificationModel {
  /**
   * Crear una nueva notificación
   */
  static async create(userId, notificationData) {
    const notificationRef = db
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .doc();
    
    const notification = {
      notificationId: notificationRef.id,
      userId,
      type: notificationData.type || 'system',
      title: notificationData.title,
      message: notificationData.message || null,
      read: false,
      createdAt: Timestamp.now(),
      readAt: null,
      actionUrl: notificationData.actionUrl || null,
      metadata: notificationData.metadata || null,
    };
    
    await notificationRef.set(notification);
    return { id: notificationRef.id, ...notification };
  }

  /**
   * Obtener notificaciones de un usuario
   */
  static async getNotificationsByUserId(userId, options = {}) {
    const { unreadOnly = false, limit = 50, type = null } = options;
    
    let query = db
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .orderBy('createdAt', 'desc');

    // Filtrar por no leídas
    if (unreadOnly) {
      query = query.where('read', '==', false);
    }

    // Filtrar por tipo
    if (type) {
      query = query.where('type', '==', type);
    }

    // Aplicar límite
    if (limit) {
      query = query.limit(limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        readAt: data.readAt?.toDate ? data.readAt.toDate() : data.readAt,
      };
    });
  }

  /**
   * Obtener notificaciones no leídas
   */
  static async getUnreadNotifications(userId, limit = 50) {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .where('read', '==', false)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      };
    });
  }

  /**
   * Obtener notificación por ID
   */
  static async getById(userId, notificationId) {
    const notificationDoc = await db
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .doc(notificationId)
      .get();
    
    if (!notificationDoc.exists) {
      return null;
    }
    
    const data = notificationDoc.data();
    return {
      id: notificationDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      readAt: data.readAt?.toDate ? data.readAt.toDate() : data.readAt,
    };
  }

  /**
   * Marcar notificación como leída
   */
  static async markAsRead(userId, notificationId) {
    const notificationRef = db
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .doc(notificationId);
    
    const notificationDoc = await notificationRef.get();
    
    if (!notificationDoc.exists) {
      throw new Error('Notificación no encontrada');
    }
    
    const data = notificationDoc.data();
    if (data.read) {
      // Ya está leída
      return { id: notificationDoc.id, ...data };
    }
    
    await notificationRef.update({
      read: true,
      readAt: Timestamp.now(),
    });
    
    const updatedDoc = await notificationRef.get();
    const updatedData = updatedDoc.data();
    return {
      id: updatedDoc.id,
      ...updatedData,
      createdAt: updatedData.createdAt?.toDate ? updatedData.createdAt.toDate() : updatedData.createdAt,
      readAt: updatedData.readAt?.toDate ? updatedData.readAt.toDate() : updatedData.readAt,
    };
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  static async markAllAsRead(userId) {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .where('read', '==', false)
      .get();
    
    const batch = db.batch();
    const now = Timestamp.now();
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: now,
      });
    });
    
    await batch.commit();
    return { count: snapshot.docs.length };
  }

  /**
   * Eliminar notificación
   */
  static async delete(userId, notificationId) {
    await db
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .doc(notificationId)
      .delete();
    
    return true;
  }

  /**
   * Contar notificaciones no leídas
   */
  static async countUnread(userId) {
    const snapshot = await db
      .collection('users')
      .doc(userId)
      .collection('notifications')
      .where('read', '==', false)
      .get();
    
    return snapshot.size;
  }
}

