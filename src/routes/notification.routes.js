/**
 * Rutas de Notificaciones
 */

import express from 'express';
import { NotificationController } from '../controllers/notification.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { query, param } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Endpoints de gestión de notificaciones del usuario
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Obtener notificaciones del usuario
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Solo notificaciones no leídas
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [consumption, goal, household, system, mission]
 *         description: Filtrar por tipo de notificación
 *     responses:
 *       200:
 *         description: Lista de notificaciones
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
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           notificationId:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           type:
 *                             type: string
 *                           title:
 *                             type: string
 *                           message:
 *                             type: string
 *                           read:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           readAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           actionUrl:
 *                             type: string
 *                             nullable: true
 *                           metadata:
 *                             type: object
 *                             nullable: true
 *                     count:
 *                       type: integer
 *                     unreadCount:
 *                       type: integer
 */
router.get(
  '/',
  [
    query('unreadOnly')
      .optional()
      .isBoolean()
      .withMessage('unreadOnly debe ser un valor booleano'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe ser un número entre 1 y 100'),
    query('type')
      .optional()
      .isIn(['consumption', 'goal', 'household', 'system', 'mission'])
      .withMessage('Tipo de notificación no válido'),
  ],
  validateRequest,
  NotificationController.getUserNotifications
);

/**
 * @swagger
 * /api/notifications/unread:
 *   get:
 *     summary: Obtener notificaciones no leídas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Lista de notificaciones no leídas
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
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                     count:
 *                       type: integer
 */
router.get(
  '/unread',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe ser un número entre 1 y 100'),
  ],
  validateRequest,
  NotificationController.getUnreadNotifications
);

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   put:
 *     summary: Marcar notificación como leída
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación marcada como leída
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
 *                   example: Notificación marcada como leída
 *                 data:
 *                   type: object
 *       404:
 *         description: Notificación no encontrada
 */
router.put(
  '/:notificationId/read',
  [
    param('notificationId')
      .notEmpty()
      .withMessage('notificationId es requerido')
      .isString()
      .withMessage('notificationId debe ser una cadena de texto'),
  ],
  validateRequest,
  NotificationController.markNotificationAsRead
);

/**
 * @swagger
 * /api/notifications/read-all:
 *   put:
 *     summary: Marcar todas las notificaciones como leídas
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las notificaciones marcadas como leídas
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
 *                   example: "5 notificaciones marcadas como leídas"
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 */
router.put('/read-all', NotificationController.markAllNotificationsAsRead);

/**
 * @swagger
 * /api/notifications/{notificationId}:
 *   delete:
 *     summary: Eliminar notificación
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la notificación
 *     responses:
 *       200:
 *         description: Notificación eliminada exitosamente
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
 *                   example: Notificación eliminada exitosamente
 *       404:
 *         description: Notificación no encontrada
 */
router.delete(
  '/:notificationId',
  [
    param('notificationId')
      .notEmpty()
      .withMessage('notificationId es requerido')
      .isString()
      .withMessage('notificationId debe ser una cadena de texto'),
  ],
  validateRequest,
  NotificationController.deleteNotification
);

export default router;

