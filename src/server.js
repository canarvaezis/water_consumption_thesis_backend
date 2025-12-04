import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';

// Validar variables de entorno ANTES de cualquier otra importación
import './config/env.js';

// Inicializar Firebase
import './config/firebase.js';

// Importar logger
import logger from './utils/logger.js';

// Importar Swagger
import { swaggerSpec, swaggerUi } from './config/swagger.js';

// Importar rate limiters
import {
  generalLimiter,
  authLimiter,
  registerLimiter,
  writeLimiter,
  heavyOperationLimiter,
} from './config/rateLimiter.js';

// Importar configuración de entorno
import { env } from './config/env.js';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import consumptionRoutes from './routes/consumption.routes.js';
import householdRoutes from './routes/household.routes.js';
import storeRoutes from './routes/store.routes.js';
import userRoutes from './routes/user.routes.js';
import pushNotificationRoutes from './routes/push-notification.routes.js';
import stratumRoutes from './routes/stratum.routes.js'; // Solo para /api/stratum/rates (público)

const app = express();
const PORT = env.port;

// ============================================
// MIDDLEWARES DE SEGURIDAD (aplicar primero)
// ============================================

// Helmet - Headers de seguridad
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Necesario para Swagger UI
        scriptSrc: ["'self'", "'unsafe-inline'"], // Necesario para Swagger UI
      },
    },
    crossOriginEmbedderPolicy: false, // Desactivar si causa problemas con Swagger
  })
);

// CORS - Configuración de origen cruzado
app.use(
  cors({
    origin: env.corsOrigin === '*' ? '*' : env.corsOrigin.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Compresión de respuestas - Mejora rendimiento
app.use(compression());

// Sanitización - Previene NoSQL injection
app.use(mongoSanitize());

// Rate limiting general - Aplicar a todas las rutas
app.use(generalLimiter);

// Body parser con límites de tamaño
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging estructurado
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Swagger Documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Water Consumption API Documentation',
}));

// Ruta de salud
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Verificar estado del servidor
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servidor funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                   example: Servidor funcionando correctamente
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// RUTAS DE LA API
// ============================================

// Rutas de autenticación con rate limiting estricto
app.use('/api/auth/register', registerLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth', authRoutes);

// Rutas de escritura con rate limiting
app.use('/api/consumption', writeLimiter, consumptionRoutes);
app.use('/api/household', writeLimiter, householdRoutes);
app.use('/api/store', writeLimiter, storeRoutes);
app.use('/api/user', writeLimiter, userRoutes);
app.use('/api/push-notifications', writeLimiter, pushNotificationRoutes);

// Ruta pública de estrato (tarifas)
app.use('/api/stratum', stratumRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  // Log del error con detalles
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.uid || 'anonymous',
    statusCode: err.statusCode || err.status || 500,
  });

  // Obtener código de estado (de AppError o por defecto 500)
  const statusCode = err.statusCode || err.status || 500;
  
  // Respuesta al cliente (sin exponer detalles internos en producción)
  const response = {
    success: false,
    message: err.message || 'Error interno del servidor',
  };

  // Solo incluir stack trace en desarrollo
  if (env.isDevelopment) {
    response.stack = err.stack;
    response.details = err.details || null;
  }

  // Si es un error de validación, incluir detalles
  if (err.name === 'ValidationError' || err.name === 'CastError' || err.errors) {
    response.errors = err.errors || [];
  }

  res.status(statusCode).json(response);
});

// Iniciar servidor solo si no estamos en modo test
// En tests, el servidor se inicia mediante supertest
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    logger.info(`📝 Entorno: ${env.nodeEnv}`);
    logger.info(`🔒 Rate limiting: Activado`);
    logger.info(`🛡️  Seguridad: Helmet, CORS, Sanitización activos`);
  });
}

export default app;

