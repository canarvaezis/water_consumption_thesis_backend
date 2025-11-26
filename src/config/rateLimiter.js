/**
 * Configuración de Rate Limiting
 * 
 * Protege la API contra ataques de fuerza bruta y abuso
 * Diferentes límites según el tipo de endpoint
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter general para todas las rutas
 * 100 requests por 15 minutos por IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.',
  },
  standardHeaders: true, // Retorna rate limit info en headers `RateLimit-*`
  legacyHeaders: false, // Desactiva `X-RateLimit-*` headers
  // Skip rate limiting para IPs de confianza (opcional)
  skip: (req) => {
    // En desarrollo, puedes saltar rate limiting para localhost
    if (process.env.NODE_ENV === 'development' && req.ip === '::1') {
      return false; // No saltar, aplicar rate limiting incluso en desarrollo
    }
    return false;
  },
});

/**
 * Rate limiter estricto para autenticación
 * 5 intentos de login por 15 minutos por IP
 * Previene ataques de fuerza bruta
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Solo 5 intentos
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Por favor intenta de nuevo en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Considerar el email también para rate limiting más granular
  keyGenerator: (req) => {
    return req.ip + (req.body?.email || '');
  },
  skipSuccessfulRequests: true, // No contar requests exitosos
});

/**
 * Rate limiter para registro de usuarios
 * 3 registros por hora por IP
 * Previene creación masiva de cuentas
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // Solo 3 registros por hora
  message: {
    success: false,
    message: 'Demasiados intentos de registro. Por favor intenta de nuevo más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter para endpoints de escritura (POST, PUT, DELETE)
 * 50 requests por 15 minutos por IP
 */
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // 50 requests de escritura
  message: {
    success: false,
    message: 'Demasiadas solicitudes de escritura. Por favor intenta de nuevo más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Solo aplicar a métodos de escritura
  skip: (req) => {
    return !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  },
});

/**
 * Rate limiter para endpoints de generación de datos (estadísticas, reportes)
 * 20 requests por hora por IP
 * Previene sobrecarga en cálculos pesados
 */
export const heavyOperationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 requests por hora
  message: {
    success: false,
    message: 'Demasiadas solicitudes de operaciones pesadas. Por favor intenta de nuevo más tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

