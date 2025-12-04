/**
 * Rutas de Usuario (Consolidadas)
 * 
 * Incluye:
 * - Perfil básico
 * - Metas (goals)
 * - Personalización de perfil (customization)
 * - Estrato (stratum)
 * - Setup items
 * - Estadísticas del usuario
 */

import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { GoalsController } from '../controllers/goals.controller.js';
import { ProfileCustomizationController } from '../controllers/profile-customization.controller.js';
import { StratumController } from '../controllers/stratum.controller.js';
import { SetupController } from '../controllers/setup.controller.js';
import { UserStatisticsController } from '../controllers/user-statistics.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { body, query, param } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';
import { validate } from '../utils/validation.utils.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints de gestión de usuario
 */

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Actualizar perfil del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del usuario (2-50 caracteres)
 *                 example: "Juan Pérez"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Perfil actualizado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     uid:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     nickname:
 *                       type: string
 *                       nullable: true
 *                     avatarUrl:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Error de validación
 */
router.put(
  '/profile',
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  ],
  validateRequest,
  UserController.updateProfile
);

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     summary: Cambiar contraseña del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: Nueva contraseña (mínimo 6 caracteres)
 *                 example: "nuevaContraseña123"
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *       400:
 *         description: Error de validación
 */
router.put(
  '/password',
  [
    body('newPassword')
      .trim()
      .notEmpty()
      .withMessage('newPassword es requerido')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  validateRequest,
  UserController.changePassword
);

/**
 * @swagger
 * /api/users/account:
 *   delete:
 *     summary: Eliminar cuenta del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cuenta eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Cuenta eliminada exitosamente
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/account', UserController.deleteAccount);

/**
 * @swagger
 * /api/users/activity:
 *   get:
 *     summary: Obtener actividad reciente del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Límite de actividades a retornar
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Actividad del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     activities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [consumption, household]
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           description:
 *                             type: string
 *                           data:
 *                             type: object
 *                     count:
 *                       type: integer
 */
router.get(
  '/activity',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe ser un número entre 1 y 100'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('La fecha de inicio debe ser válida (ISO 8601)'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('La fecha de fin debe ser válida (ISO 8601)'),
  ],
  validateRequest,
  UserController.getUserActivity
);

/**
 * @swagger
 * /api/users/settings:
 *   get:
 *     summary: Obtener configuración del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuración del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     settings:
 *                       type: object
 *                       properties:
 *                         notifications:
 *                           type: object
 *                           properties:
 *                             email:
 *                               type: boolean
 *                             push:
 *                               type: boolean
 *                         privacy:
 *                           type: object
 *                           properties:
 *                             profileVisible:
 *                               type: boolean
 *                         preferences:
 *                           type: object
 *                           properties:
 *                             language:
 *                               type: string
 *                               enum: [es, en]
 *                             theme:
 *                               type: string
 *                               enum: [light, dark]
 *                     stratum:
 *                       type: number
 *                     dailyGoal:
 *                       type: number
 *                       nullable: true
 *                     monthlyGoal:
 *                       type: number
 *                       nullable: true
 */
router.get('/settings', UserController.getUserSettings);

/**
 * @swagger
 * /api/users/settings:
 *   put:
 *     summary: Actualizar configuración del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notifications:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: boolean
 *                   push:
 *                     type: boolean
 *               privacy:
 *                 type: object
 *                 properties:
 *                   profileVisible:
 *                     type: boolean
 *               preferences:
 *                 type: object
 *                 properties:
 *                   language:
 *                     type: string
 *                     enum: [es, en]
 *                   theme:
 *                     type: string
 *                     enum: [light, dark]
 *     responses:
 *       200:
 *         description: Configuración actualizada exitosamente
 *       400:
 *         description: Error de validación
 */
router.put(
  '/settings',
  [
    body('notifications')
      .optional()
      .isObject()
      .withMessage('notifications debe ser un objeto'),
    body('notifications.email')
      .optional()
      .isBoolean()
      .withMessage('notifications.email debe ser un booleano'),
    body('notifications.push')
      .optional()
      .isBoolean()
      .withMessage('notifications.push debe ser un booleano'),
    body('privacy')
      .optional()
      .isObject()
      .withMessage('privacy debe ser un objeto'),
    body('privacy.profileVisible')
      .optional()
      .isBoolean()
      .withMessage('privacy.profileVisible debe ser un booleano'),
    body('preferences')
      .optional()
      .isObject()
      .withMessage('preferences debe ser un objeto'),
    body('preferences.language')
      .optional()
      .isIn(['es', 'en'])
      .withMessage('preferences.language debe ser "es" o "en"'),
    body('preferences.theme')
      .optional()
      .isIn(['light', 'dark'])
      .withMessage('preferences.theme debe ser "light" o "dark"'),
  ],
  validateRequest,
  UserController.updateUserSettings
);

// ============================================
// RUTAS DE METAS (GOALS)
// ============================================

/**
 * @swagger
 * /api/user/goals:
 *   get:
 *     summary: Obtener metas del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/goals', GoalsController.getGoals);

/**
 * @swagger
 * /api/user/goals:
 *   put:
 *     summary: Actualizar metas del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/goals',
  [
    body('dailyGoal')
      .optional()
      .custom((value) => {
        if (value === null) return true;
        if (typeof value !== 'number' || value < 0) {
          throw new Error('La meta diaria debe ser un número positivo o null');
        }
        return true;
      }),
    body('monthlyGoal')
      .optional()
      .custom((value) => {
        if (value === null) return true;
        if (typeof value !== 'number' || value < 0) {
          throw new Error('La meta mensual debe ser un número positivo o null');
        }
        return true;
      }),
    validate,
  ],
  GoalsController.updateGoals
);

/**
 * @swagger
 * /api/user/goals/progress:
 *   get:
 *     summary: Obtener progreso de metas del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/goals/progress', GoalsController.getProgress);

// ============================================
// RUTAS DE PERSONALIZACIÓN DE PERFIL
// ============================================

/**
 * @swagger
 * /api/user/profile/avatars:
 *   get:
 *     summary: Obtener avatares disponibles
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile/avatars', ProfileCustomizationController.getAvatars);

/**
 * @swagger
 * /api/user/profile/nicknames:
 *   get:
 *     summary: Obtener nicknames disponibles
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile/nicknames', ProfileCustomizationController.getNicknames);

/**
 * @swagger
 * /api/user/profile/avatar:
 *   put:
 *     summary: Aplicar avatar al perfil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/profile/avatar',
  [
    body('storeItemId')
      .notEmpty()
      .withMessage('storeItemId es requerido')
      .isString(),
    validate,
  ],
  ProfileCustomizationController.applyAvatar
);

/**
 * @swagger
 * /api/user/profile/nickname:
 *   put:
 *     summary: Aplicar nickname al perfil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/profile/nickname',
  [
    body('storeItemId')
      .notEmpty()
      .withMessage('storeItemId es requerido')
      .isString(),
    validate,
  ],
  ProfileCustomizationController.applyNickname
);

/**
 * @swagger
 * /api/user/profile/inventory:
 *   get:
 *     summary: Obtener inventario del usuario (avatares y nicknames que posee)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/profile/inventory', ProfileCustomizationController.getInventory);

// ============================================
// RUTAS DE ESTRATO
// ============================================

/**
 * @swagger
 * /api/user/stratum:
 *   get:
 *     summary: Obtener estrato actual del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stratum', StratumController.getUserStratum);

/**
 * @swagger
 * /api/user/stratum:
 *   put:
 *     summary: Actualizar estrato del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/stratum',
  [
    body('stratum')
      .notEmpty()
      .withMessage('stratum es requerido')
      .isInt({ min: 1, max: 6 })
      .withMessage('El estrato debe ser un número entre 1 y 6'),
  ],
  validateRequest,
  StratumController.updateStratum
);

/**
 * @swagger
 * /api/user/stratum/history:
 *   get:
 *     summary: Obtener historial de cambios de estrato
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/stratum/history',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe ser un número entre 1 y 100'),
  ],
  validateRequest,
  StratumController.getStratumHistory
);

// ============================================
// RUTAS DE SETUP
// ============================================

/**
 * @swagger
 * /api/user/setup/items:
 *   get:
 *     summary: Obtener items de configuración del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/setup/items', SetupController.getUserSetupItems);

/**
 * @swagger
 * /api/user/setup/items:
 *   post:
 *     summary: Agregar o actualizar item de configuración
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/setup/items',
  [
    body('consumptionItemId')
      .notEmpty()
      .withMessage('consumptionItemId es requerido')
      .isString()
      .withMessage('consumptionItemId debe ser una cadena de texto'),
    body('hasItem')
      .notEmpty()
      .withMessage('hasItem es requerido')
      .isBoolean()
      .withMessage('hasItem debe ser un valor booleano'),
  ],
  validateRequest,
  SetupController.upsertSetupItem
);

/**
 * @swagger
 * /api/user/setup/items/{itemId}:
 *   put:
 *     summary: Actualizar item de configuración por ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put(
  '/setup/items/:itemId',
  [
    param('itemId')
      .notEmpty()
      .withMessage('itemId es requerido')
      .isString()
      .withMessage('itemId debe ser una cadena de texto'),
    body('hasItem')
      .notEmpty()
      .withMessage('hasItem es requerido')
      .isBoolean()
      .withMessage('hasItem debe ser un valor booleano'),
  ],
  validateRequest,
  SetupController.updateSetupItem
);

/**
 * @swagger
 * /api/user/setup/items/{itemId}:
 *   delete:
 *     summary: Eliminar item de configuración
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
  '/setup/items/:itemId',
  [
    param('itemId')
      .notEmpty()
      .withMessage('itemId es requerido')
      .isString()
      .withMessage('itemId debe ser una cadena de texto'),
  ],
  validateRequest,
  SetupController.deleteSetupItem
);

// ============================================
// RUTAS DE ESTADÍSTICAS DEL USUARIO
// ============================================

/**
 * @swagger
 * /api/user/statistics/today:
 *   get:
 *     summary: Obtener estadísticas del día actual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/statistics/today', UserStatisticsController.getTodayStatistics);

/**
 * @swagger
 * /api/user/statistics/month:
 *   get:
 *     summary: Obtener estadísticas del mes actual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/statistics/month', UserStatisticsController.getCurrentMonthStatistics);

/**
 * @swagger
 * /api/user/statistics/average/daily:
 *   get:
 *     summary: Obtener promedio diario de consumo
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/statistics/average/daily', UserStatisticsController.getAverageDaily);

/**
 * @swagger
 * /api/user/statistics/average/monthly:
 *   get:
 *     summary: Obtener promedio mensual de consumo
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/statistics/average/monthly', UserStatisticsController.getAverageMonthly);

/**
 * @swagger
 * /api/user/statistics/day/:date:
 *   get:
 *     summary: Obtener consumo en un día específico
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/statistics/day/:date',
  [
    param('date')
      .notEmpty()
      .withMessage('date es requerido')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('date debe estar en formato YYYY-MM-DD'),
  ],
  validateRequest,
  UserStatisticsController.getDayConsumption
);

/**
 * @swagger
 * /api/user/statistics/all:
 *   get:
 *     summary: Obtener todas las estadísticas del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/statistics/all', UserStatisticsController.getAllStatistics);

export default router;

