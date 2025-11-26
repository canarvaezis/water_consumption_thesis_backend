/**
 * Rutas de Usuario
 */

import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

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

export default router;

