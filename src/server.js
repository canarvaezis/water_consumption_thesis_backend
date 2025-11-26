import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import './config/firebase.js'; // Inicializar Firebase

// Importar Swagger
import { swaggerSpec, swaggerUi } from './config/swagger.js';

// Importar rutas
import authRoutes from './routes/auth.routes.js';
import consumptionRoutes from './routes/consumption.routes.js';
import goalsRoutes from './routes/goals.routes.js';
import profileCustomizationRoutes from './routes/profile-customization.routes.js';
import householdRoutes from './routes/household.routes.js';
import storeRoutes from './routes/store.routes.js';
import userRoutes from './routes/user.routes.js';
import achievementRoutes from './routes/achievement.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging básico
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
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

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/consumption', consumptionRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/profile', profileCustomizationRoutes);
app.use('/api/household', householdRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/achievements', achievementRoutes);

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📝 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

