import { auth } from '../config/firebase.js';
import { UserModel } from '../models/user.model.js';
import { WalletModel } from '../models/wallet.model.js';
import { UserMetricsModel } from '../models/user-metrics.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';
import { getCurrentStreak } from '../utils/water-calculations.utils.js';
import { dateToTimestamp } from '../utils/firestore.utils.js';

/**
 * Registrar nuevo usuario usando Firebase Authentication
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  let firebaseUser = null;
  let uid = null;

  try {
    // Verificar si el usuario ya existe en Firebase Auth por email
    try {
      const existingUser = await auth.getUserByEmail(email);
      uid = existingUser.uid;
      firebaseUser = existingUser;
      
      // Si existe en Auth, verificar si ya tiene documento en Firestore
      const existingFirestoreUser = await UserModel.findById(uid);
      if (existingFirestoreUser) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está registrado',
        });
      }
      
      // Si existe en Auth pero no en Firestore, crear solo el documento
      const userData = {
        name,
        email,
        nickname: null,
        avatarUrl: null,
      };
      
      const user = await UserModel.create(uid, userData);
      const wallet = await WalletModel.create(uid, 0);
      const metrics = await UserMetricsModel.create(uid);
      
      // Convertir Timestamps a fechas legibles
      const userDataResponse = {
        userId: uid,
        ...user,
        createdAt: user.createdAt?.toDate 
          ? user.createdAt.toDate() 
          : user.createdAt,
        updatedAt: user.updatedAt?.toDate 
          ? user.updatedAt.toDate() 
          : user.updatedAt,
      };
      
      const walletDataResponse = {
        walletId: wallet.id,
        balance: wallet.balance || 0,
        createdAt: wallet.createdAt?.toDate 
          ? wallet.createdAt.toDate() 
          : wallet.createdAt,
        updatedAt: wallet.updatedAt?.toDate 
          ? wallet.updatedAt.toDate() 
          : wallet.updatedAt,
      };
      
      const metricsDataResponse = {
        metricsId: metrics.id,
        consumptionStreak: metrics.consumptionStreak || 0,
        lastConsumptionDate: metrics.lastConsumptionDate || null,
        streakLastUpdated: metrics.streakLastUpdated || null,
        createdAt: metrics.createdAt?.toDate 
          ? metrics.createdAt.toDate() 
          : metrics.createdAt,
        updatedAt: metrics.updatedAt?.toDate 
          ? metrics.updatedAt.toDate() 
          : metrics.updatedAt,
      };
      
      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: userDataResponse,
          wallet: walletDataResponse,
          metrics: metricsDataResponse,
        },
      });
    } catch (authError) {
      // Si el error es que no existe el usuario, continuar con la creación
      if (authError.code !== 'auth/user-not-found') {
        throw authError;
      }
    }

    // Si no existe en Auth, crear usuario nuevo
    firebaseUser = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    uid = firebaseUser.uid;

    // Crear documento en Firestore con el UID de Firebase Auth
    const userData = {
      name,
      email,
      nickname: null, // Se asigna cuando el usuario compra el item en la tienda
      avatarUrl: null,
    };

    // Guardar usuario en Firestore
    const user = await UserModel.create(uid, userData);

    // Crear billetera como subcolección
    const wallet = await WalletModel.create(uid, 0);
    
    // Crear métricas como subcolección
    const metrics = await UserMetricsModel.create(uid);

    // Convertir Timestamps a fechas legibles
    const userDataResponse = {
      userId: uid,
      ...user,
      createdAt: user.createdAt?.toDate 
        ? user.createdAt.toDate() 
        : user.createdAt,
      updatedAt: user.updatedAt?.toDate 
        ? user.updatedAt.toDate() 
        : user.updatedAt,
    };
    
    const walletDataResponse = {
      walletId: wallet.id,
      balance: wallet.balance || 0,
      createdAt: wallet.createdAt?.toDate 
        ? wallet.createdAt.toDate() 
        : wallet.createdAt,
      updatedAt: wallet.updatedAt?.toDate 
        ? wallet.updatedAt.toDate() 
        : wallet.updatedAt,
    };
    
    const metricsDataResponse = {
      metricsId: metrics.id,
      consumptionStreak: metrics.consumptionStreak || 0,
      lastConsumptionDate: metrics.lastConsumptionDate || null,
      streakLastUpdated: metrics.streakLastUpdated || null,
      createdAt: metrics.createdAt?.toDate 
        ? metrics.createdAt.toDate() 
        : metrics.createdAt,
      updatedAt: metrics.updatedAt?.toDate 
        ? metrics.updatedAt.toDate() 
        : metrics.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: userDataResponse,
        wallet: walletDataResponse,
        metrics: metricsDataResponse,
      },
    });
  } catch (error) {
    // Si el email ya existe en Firebase Auth (caso edge)
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado',
      });
    }
    
    // Si hay error al crear en Firestore, eliminar el usuario de Auth (solo si lo creamos nosotros)
    if (firebaseUser && firebaseUser.uid && error.code !== 'auth/email-already-exists') {
      try {
        // Verificar que el usuario fue creado en este flujo (no existía antes)
        const userInFirestore = await UserModel.findById(firebaseUser.uid);
        if (!userInFirestore) {
          await auth.deleteUser(firebaseUser.uid);
        }
      } catch (deleteError) {
        console.error('Error al limpiar usuario de Auth:', deleteError);
      }
    }
    
    throw error;
  }
});

/**
 * Iniciar sesión
 * Nota: Firebase Auth maneja la autenticación en el cliente
 * Este endpoint verifica el token ID del cliente
 */
export const login = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({
      success: false,
      message: 'Token ID requerido',
    });
  }

  try {
    // Verificar el token ID de Firebase Auth
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Obtener datos del usuario de Firestore
    const user = await UserModel.findById(uid);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Obtener wallet del usuario
    const wallet = await WalletModel.findByUserId(uid);
    
    // Obtener métricas del usuario
    const metrics = await UserMetricsModel.findByUserId(uid);

    // Verificar y obtener la racha actual (puede resetearse a 0 si no hay consumo reciente)
    const streakData = getCurrentStreak(metrics || {});
    
    // Convertir Timestamps a fechas legibles
    const userData = {
      uid,
      ...user,
      createdAt: user.createdAt?.toDate 
        ? user.createdAt.toDate() 
        : user.createdAt,
      updatedAt: user.updatedAt?.toDate 
        ? user.updatedAt.toDate() 
        : user.updatedAt,
    };
    
    // Preparar datos de métricas
    const metricsData = metrics ? {
      consumptionStreak: streakData.streak,
      lastConsumptionDate: streakData.lastConsumptionDate
        ? (streakData.lastConsumptionDate.toDate 
            ? streakData.lastConsumptionDate.toDate() 
            : new Date(streakData.lastConsumptionDate))
        : null,
      streakLastUpdated: metrics.streakLastUpdated
        ? (metrics.streakLastUpdated.toDate 
            ? metrics.streakLastUpdated.toDate() 
            : new Date(metrics.streakLastUpdated))
        : null,
      createdAt: metrics.createdAt?.toDate 
        ? metrics.createdAt.toDate() 
        : metrics.createdAt,
      updatedAt: metrics.updatedAt?.toDate 
        ? metrics.updatedAt.toDate() 
        : metrics.updatedAt,
    } : {
      consumptionStreak: 0,
      lastConsumptionDate: null,
      streakLastUpdated: null,
      createdAt: null,
      updatedAt: null,
    };

    // Preparar datos del wallet
    const walletData = wallet ? {
      walletId: wallet.id,
      balance: wallet.balance || 0,
      createdAt: wallet.createdAt?.toDate 
        ? wallet.createdAt.toDate() 
        : wallet.createdAt,
      updatedAt: wallet.updatedAt?.toDate 
        ? wallet.updatedAt.toDate() 
        : wallet.updatedAt,
    } : {
      walletId: null,
      balance: 0,
      createdAt: null,
      updatedAt: null,
    };

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: userData,
        wallet: walletData,
        metrics: metricsData,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
    });
  }
});

/**
 * Obtener perfil del usuario autenticado
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user.uid);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado',
    });
  }

  // Obtener wallet del usuario
  const wallet = await WalletModel.findByUserId(req.user.uid);
  
  // Obtener métricas del usuario
  const metrics = await UserMetricsModel.findByUserId(req.user.uid);

  // Verificar y obtener la racha actual (puede resetearse a 0 si no hay consumo reciente)
  const streakData = getCurrentStreak(metrics || {});
  
  // Si la racha se reseteó a 0, actualizar en la base de datos
  if (streakData.streak === 0 && metrics && metrics.consumptionStreak && metrics.consumptionStreak > 0) {
    await UserMetricsModel.update(req.user.uid, {
      consumptionStreak: 0,
      streakLastUpdated: dateToTimestamp(new Date()),
    });
    if (metrics) {
      metrics.consumptionStreak = 0;
    }
  }
  
  // Convertir Timestamps a fechas legibles
  const userData = {
    uid: req.user.uid,
    ...user,
    createdAt: user.createdAt?.toDate 
      ? user.createdAt.toDate() 
      : user.createdAt,
    updatedAt: user.updatedAt?.toDate 
      ? user.updatedAt.toDate() 
      : user.updatedAt,
  };
  
  // Preparar datos de métricas
  const metricsData = metrics ? {
    consumptionStreak: streakData.streak,
    lastConsumptionDate: streakData.lastConsumptionDate
      ? (streakData.lastConsumptionDate.toDate 
          ? streakData.lastConsumptionDate.toDate() 
          : new Date(streakData.lastConsumptionDate))
      : null,
    streakLastUpdated: metrics.streakLastUpdated
      ? (metrics.streakLastUpdated.toDate 
          ? metrics.streakLastUpdated.toDate() 
          : new Date(metrics.streakLastUpdated))
      : null,
    createdAt: metrics.createdAt?.toDate 
      ? metrics.createdAt.toDate() 
      : metrics.createdAt,
    updatedAt: metrics.updatedAt?.toDate 
      ? metrics.updatedAt.toDate() 
      : metrics.updatedAt,
  } : {
    consumptionStreak: 0,
    lastConsumptionDate: null,
    streakLastUpdated: null,
    createdAt: null,
    updatedAt: null,
  };

  // Preparar datos del wallet
  const walletData = wallet ? {
    walletId: wallet.id,
    balance: wallet.balance || 0,
    createdAt: wallet.createdAt?.toDate 
      ? wallet.createdAt.toDate() 
      : wallet.createdAt,
    updatedAt: wallet.updatedAt?.toDate 
      ? wallet.updatedAt.toDate() 
      : wallet.updatedAt,
  } : {
    walletId: null,
    balance: 0,
    createdAt: null,
    updatedAt: null,
  };

  res.json({
    success: true,
    data: {
      user: userData,
      wallet: walletData,
      metrics: metricsData,
    },
  });
});

/**
 * Obtener balance del usuario (endpoint separado para actualizaciones rápidas)
 */
export const getBalance = asyncHandler(async (req, res) => {
  const wallet = await WalletModel.findByUserId(req.user.uid);

  if (!wallet) {
    return res.json({
      success: true,
      data: {
        walletId: null,
        balance: 0,
      },
    });
  }

  res.json({
    success: true,
    data: {
      walletId: wallet.id,
      balance: wallet.balance || 0,
      updatedAt: wallet.updatedAt?.toDate 
        ? wallet.updatedAt.toDate() 
        : wallet.updatedAt,
    },
  });
});

