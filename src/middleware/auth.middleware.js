import { auth } from '../config/firebase.js';
import { UserModel } from '../models/user.model.js';

/**
 * Middleware de autenticación con Firebase Auth
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const idToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido',
      });
    }

    // Verificar el token ID de Firebase Auth
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    // Verificar que el usuario aún existe en Firestore
    const user = await UserModel.findById(uid);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    req.user = {
      uid,
      email: decodedToken.email,
    };
    
    next();
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      return res.status(403).json({
        success: false,
        message: 'Token expirado',
      });
    }
    
    if (error.code === 'auth/id-token-revoked' || error.code === 'auth/invalid-id-token') {
      return res.status(403).json({
        success: false,
        message: 'Token inválido',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Error al verificar token',
    });
  }
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const idToken = authHeader && authHeader.split(' ')[1];

    if (idToken) {
      const decodedToken = await auth.verifyIdToken(idToken);
      const uid = decodedToken.uid;
      const user = await UserModel.findById(uid);
      
      if (user) {
        req.user = {
          uid,
          email: decodedToken.email,
        };
      }
    }
    
    next();
  } catch (error) {
    // Si hay error, simplemente continuar sin autenticación
    next();
  }
};

