/**
 * Rutas de Push Notifications
 */

import express from 'express';
import { PushNotificationController } from '../controllers/push-notification.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Push Notifications
 *   description: Endpoints para gestionar tokens FCM y notificaciones push
 */

/**
 * @swagger
 * /api/push-notifications/register:
 *   post:
 *     summary: Registrar token FCM de un dispositivo
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token FCM del dispositivo
 *               deviceInfo:
 *                 type: object
 *                 description: Información del dispositivo (opcional)
 *                 properties:
 *                   platform:
 *                     type: string
 *                     enum: [android, ios, web]
 *                   deviceModel:
 *                     type: string
 *                   osVersion:
 *                     type: string
 *     responses:
 *       200:
 *         description: Token registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 */
router.post(
  '/register',
  [
    body('token').notEmpty().withMessage('Token FCM es requerido'),
    body('deviceInfo').optional().isObject(),
  ],
  validateRequest,
  PushNotificationController.registerToken
);

/**
 * @swagger
 * /api/push-notifications/unregister:
 *   post:
 *     summary: Eliminar token FCM de un dispositivo
 *     tags: [Push Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token FCM del dispositivo
 *     responses:
 *       200:
 *         description: Token eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 */
router.post(
  '/unregister',
  [
    body('token').notEmpty().withMessage('Token FCM es requerido'),
  ],
  validateRequest,
  PushNotificationController.unregisterToken
);

export default router;

