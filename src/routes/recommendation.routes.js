/**
 * Rutas de Recomendaciones
 */

import express from 'express';
import { RecommendationController } from '../controllers/recommendation.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Recommendations
 *   description: Endpoints de recomendaciones personalizadas
 */

/**
 * @swagger
 * /api/recommendations:
 *   get:
 *     summary: Obtener recomendaciones del usuario
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [saving, alert, tip]
 *         description: Filtrar por tipo de recomendación
 *       - in: query
 *         name: unseenOnly
 *         schema:
 *           type: boolean
 *         description: Solo recomendaciones no vistas
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de resultados
 *     responses:
 *       200:
 *         description: Lista de recomendaciones
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
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           userRecommendationId:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [saving, alert, tip]
 *                           seen:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     count:
 *                       type: integer
 */
router.get(
  '/',
  [
    query('type')
      .optional()
      .isIn(['saving', 'alert', 'tip'])
      .withMessage('El tipo debe ser "saving", "alert" o "tip"'),
    query('unseenOnly')
      .optional()
      .isBoolean()
      .withMessage('unseenOnly debe ser un booleano'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe ser un número entre 1 y 100'),
  ],
  validateRequest,
  RecommendationController.getUserRecommendations
);

/**
 * @swagger
 * /api/recommendations/unread:
 *   get:
 *     summary: Obtener recomendaciones no leídas
 *     tags: [Recommendations]
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
 *         description: Recomendaciones no leídas
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
 *                     recommendations:
 *                       type: array
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
  RecommendationController.getUnreadRecommendations
);

/**
 * @swagger
 * /api/recommendations/{recommendationId}:
 *   get:
 *     summary: Obtener recomendación específica
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recommendationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recomendación encontrada
 *       404:
 *         description: Recomendación no encontrada
 */
router.get(
  '/:recommendationId',
  [
    param('recommendationId')
      .trim()
      .notEmpty()
      .withMessage('El ID de la recomendación es requerido'),
  ],
  validateRequest,
  RecommendationController.getRecommendationById
);

/**
 * @swagger
 * /api/recommendations/{recommendationId}/read:
 *   post:
 *     summary: Marcar recomendación como leída
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recommendationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recomendación marcada como leída
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
 *                   example: Recomendación marcada como leída
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     seen:
 *                       type: boolean
 *       404:
 *         description: Recomendación no encontrada
 */
router.post(
  '/:recommendationId/read',
  [
    param('recommendationId')
      .trim()
      .notEmpty()
      .withMessage('El ID de la recomendación es requerido'),
  ],
  validateRequest,
  RecommendationController.markAsRead
);

/**
 * @swagger
 * /api/recommendations/{recommendationId}:
 *   delete:
 *     summary: Eliminar recomendación
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: recommendationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recomendación eliminada exitosamente
 *       404:
 *         description: Recomendación no encontrada
 */
router.delete(
  '/:recommendationId',
  [
    param('recommendationId')
      .trim()
      .notEmpty()
      .withMessage('El ID de la recomendación es requerido'),
  ],
  validateRequest,
  RecommendationController.deleteRecommendation
);

/**
 * @swagger
 * /api/recommendations/generate:
 *   post:
 *     summary: Generar recomendaciones automáticamente (admin/testing)
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recomendaciones generadas
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
 *                   example: Generación completada. 3 recomendación(es) creada(s)
 *                 data:
 *                   type: object
 *                   properties:
 *                     generated:
 *                       type: integer
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           type:
 *                             type: string
 */
router.post('/generate', RecommendationController.generateRecommendations);

export default router;

