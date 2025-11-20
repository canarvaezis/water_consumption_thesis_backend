import { auth } from '../config/firebase.js';
import { UserModel } from '../models/user.model.js';
import { WalletModel } from '../models/wallet.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';

/**
 * Registrar nuevo usuario usando Firebase Authentication
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Crear usuario en Firebase Authentication
    const firebaseUser = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // Crear documento en Firestore con el UID de Firebase Auth
    const userData = {
      name,
      email,
      nickname: null, // Se asigna cuando el usuario compra el item en la tienda
      avatarUrl: null,
    };

    const user = await UserModel.create(firebaseUser.uid, userData);

    // Crear billetera como subcolección
    await WalletModel.create(firebaseUser.uid, 0);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          uid: firebaseUser.uid,
          ...user,
        },
      },
    });
  } catch (error) {
    // Si el email ya existe en Firebase Auth
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado',
      });
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

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      data: {
        user: {
          uid,
          ...user,
        },
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

  res.json({
    success: true,
    data: {
      user: {
        uid: req.user.uid,
        ...user,
      },
    },
  });
});

