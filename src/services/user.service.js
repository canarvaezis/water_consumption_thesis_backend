/**
 * Servicio de Usuario
 * 
 * Lógica de negocio para gestión de usuarios
 */

import { auth } from '../config/firebase.js';
import { UserModel } from '../models/user.model.js';
import { WalletModel } from '../models/wallet.model.js';
import { ConsumptionSessionModel } from '../models/consumption-session.model.js';
import { UserHouseholdModel } from '../models/user-household.model.js';

export class UserService {
  /**
   * Actualizar perfil del usuario
   */
  static async updateProfile(userId, updateData) {
    const allowedFields = ['name'];
    const filteredData = {};
    
    // Solo permitir actualizar campos permitidos
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    // Validar nombre
    if (filteredData.name !== undefined) {
      if (!filteredData.name || filteredData.name.trim().length < 2) {
        throw new Error('El nombre debe tener al menos 2 caracteres');
      }
      if (filteredData.name.trim().length > 50) {
        throw new Error('El nombre no puede exceder 50 caracteres');
      }
      filteredData.name = filteredData.name.trim();
    }

    if (Object.keys(filteredData).length === 0) {
      throw new Error('No hay campos válidos para actualizar');
    }

    const updatedUser = await UserModel.update(userId, filteredData);
    
    return {
      uid: userId,
      name: updatedUser.name,
      email: updatedUser.email,
      nickname: updatedUser.nickname,
      avatarUrl: updatedUser.avatarUrl,
      stratum: updatedUser.stratum,
      updatedAt: updatedUser.updatedAt,
    };
  }

  /**
   * Cambiar contraseña del usuario
   */
  static async changePassword(userId, newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    // Actualizar contraseña en Firebase Auth
    await auth.updateUser(userId, {
      password: newPassword,
    });

    return {
      message: 'Contraseña actualizada exitosamente',
    };
  }

  /**
   * Eliminar cuenta del usuario
   */
  static async deleteAccount(userId) {
    // Verificar que el usuario existe
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Eliminar usuario de Firebase Auth
    try {
      await auth.deleteUser(userId);
    } catch (error) {
      // Si el usuario no existe en Auth, continuar con la eliminación en Firestore
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Eliminar documento de Firestore
    await UserModel.delete(userId);

    // Nota: Las subcolecciones (wallet, households, etc.) se pueden eliminar
    // manualmente o mediante Cloud Functions si es necesario

    return {
      message: 'Cuenta eliminada exitosamente',
    };
  }

  /**
   * Obtener actividad reciente del usuario
   */
  static async getUserActivity(userId, options = {}) {
    const { limit = 20, startDate = null, endDate = null } = options;

    const activities = [];

    // Obtener sesiones de consumo recientes
    let sessions = [];
    if (startDate && endDate) {
      sessions = await ConsumptionSessionModel.findByDateRange(userId, startDate, endDate);
    } else {
      sessions = await ConsumptionSessionModel.findByUserId(userId, limit);
    }

    sessions.forEach(session => {
      const date = session.consumptionDate?.toDate 
        ? session.consumptionDate.toDate() 
        : (session.createdAt?.toDate ? session.createdAt.toDate() : new Date());
      
      activities.push({
        type: 'consumption',
        date: date,
        description: `Registró ${session.totalEstimatedLiters || 0} litros de consumo`,
        data: {
          sessionId: session.id,
          totalLiters: session.totalEstimatedLiters || 0,
          totalCost: session.totalCost || 0,
        },
      });
    });

    // Obtener información de familia (si pertenece a una)
    const household = await UserHouseholdModel.findByUserId(userId);
    if (household) {
      activities.push({
        type: 'household',
        date: household.joinedAt?.toDate ? household.joinedAt.toDate() : household.joinedAt,
        description: `Se unió a la familia`,
        data: {
          householdId: household.householdId,
        },
      });
    }

    // Ordenar por fecha (más reciente primero)
    activities.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });

    return activities.slice(0, limit);
  }

  /**
   * Obtener configuración del usuario
   */
  static async getUserSettings(userId) {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Configuración básica del usuario
    const defaultSettings = {
      notifications: {
        email: true,
        push: true,
      },
      privacy: {
        profileVisible: true,
      },
      preferences: {
        language: 'es',
        theme: 'light',
      },
    };

    return {
      settings: user.settings || defaultSettings,
      // Datos del usuario que pueden considerarse configuración
      stratum: user.stratum || 3,
      dailyGoal: user.dailyGoal || null,
      monthlyGoal: user.monthlyGoal || null,
    };
  }

  /**
   * Actualizar configuración del usuario
   */
  static async updateUserSettings(userId, settings) {
    const allowedSettings = {
      notifications: ['email', 'push'],
      privacy: ['profileVisible'],
      preferences: ['language', 'theme'],
    };

    const updateData = {};

    // Crear objeto de settings anidado
    const settingsData = {};

    // Actualizar configuración de notificaciones
    if (settings.notifications) {
      settingsData.notifications = {};
      if (settings.notifications.email !== undefined) {
        settingsData.notifications.email = settings.notifications.email;
      }
      if (settings.notifications.push !== undefined) {
        settingsData.notifications.push = settings.notifications.push;
      }
    }

    // Actualizar configuración de privacidad
    if (settings.privacy) {
      settingsData.privacy = {};
      if (settings.privacy.profileVisible !== undefined) {
        settingsData.privacy.profileVisible = settings.privacy.profileVisible;
      }
    }

    // Actualizar preferencias
    if (settings.preferences) {
      settingsData.preferences = {};
      if (settings.preferences.language) {
        if (!['es', 'en'].includes(settings.preferences.language)) {
          throw new Error('Idioma no válido. Use "es" o "en"');
        }
        settingsData.preferences.language = settings.preferences.language;
      }
      if (settings.preferences.theme) {
        if (!['light', 'dark'].includes(settings.preferences.theme)) {
          throw new Error('Tema no válido. Use "light" o "dark"');
        }
        settingsData.preferences.theme = settings.preferences.theme;
      }
    }

    // Combinar con settings existentes
    const user = await UserModel.findById(userId);
    const existingSettings = user.settings || {};
    
    updateData.settings = {
      ...existingSettings,
      ...settingsData,
      notifications: {
        ...(existingSettings.notifications || { email: true, push: true }),
        ...(settingsData.notifications || {}),
      },
      privacy: {
        ...(existingSettings.privacy || { profileVisible: true }),
        ...(settingsData.privacy || {}),
      },
      preferences: {
        ...(existingSettings.preferences || { language: 'es', theme: 'light' }),
        ...(settingsData.preferences || {}),
      },
    };

    if (Object.keys(updateData).length === 0) {
      throw new Error('No hay configuración válida para actualizar');
    }

    // Actualizar usuario
    const updatedUser = await UserModel.update(userId, updateData);

    return {
      settings: updatedUser.settings || {
        notifications: {
          email: true,
          push: true,
        },
        privacy: {
          profileVisible: true,
        },
        preferences: {
          language: 'es',
          theme: 'light',
        },
      },
    };
  }
}

