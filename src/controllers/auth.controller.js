import { auth } from '../config/firebase.js';
import { UserModel } from '../models/user.model.js';
import { WalletModel } from '../models/wallet.model.js';
import { asyncHandler } from '../middleware/error.middleware.js';

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
      
      return res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            userId: uid,
            ...user,
          },
          wallet: {
            walletId: wallet.id,
            ...wallet,
          },
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

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          userId: uid, // UID de Firebase Auth (ID del documento)
          ...user,
        },
        wallet: {
          walletId: wallet.id, // ID del documento en la subcolección
          ...wallet,
        },
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

