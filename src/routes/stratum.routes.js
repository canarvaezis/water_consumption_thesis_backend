/**
 * Rutas de Estrato
 */

import express from 'express';
import { StratumController } from '../controllers/stratum.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = express.Router();

// Rutas que requieren autenticación
const authenticatedRouter = express.Router();
authenticatedRouter.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Stratum
 *   description: Endpoints de gestión de estrato y tarifas
 */

/**
 * @swagger
 * /api/stratum:
 *   get:
 *     summary: Obtener estrato actual del usuario
 *     tags: [Stratum]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estrato del usuario
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
 *                     stratum:
 *                       type: number
 *                       enum: [1, 2, 3, 4, 5, 6]
 *                       example: 3
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 */
authenticatedRouter.get('/', StratumController.getUserStratum);

/**
 * @swagger
 * /api/stratum:
 *   put:
 *     summary: Actualizar estrato del usuario
 *     tags: [Stratum]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stratum
 *             properties:
 *               stratum:
 *                 type: number
 *                 enum: [1, 2, 3, 4, 5, 6]
 *                 description: Nuevo estrato (1-6)
 *                 example: 4
 *     responses:
 *       200:
 *         description: Estrato actualizado exitosamente
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
 *                   example: Estrato actualizado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     stratum:
 *                       type: number
 *                     previousStratum:
 *                       type: number
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     changed:
 *                       type: boolean
 *       400:
 *         description: Error de validación
 */
authenticatedRouter.put(
  '/',
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
 * /api/stratum/history:
 *   get:
 *     summary: Obtener historial de cambios de estrato
 *     tags: [Stratum]
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
 *         description: Historial de cambios de estrato
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
 *                     history:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           stratumHistoryId:
 *                             type: string
 *                           previousStratum:
 *                             type: number
 *                           newStratum:
 *                             type: number
 *                           changedAt:
 *                             type: string
 *                             format: date-time
 *                     count:
 *                       type: integer
 */
authenticatedRouter.get(
  '/history',
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('El límite debe ser un número entre 1 y 100'),
  ],
  validateRequest,
  StratumController.getStratumHistory
);

/**
 * @swagger
 * /api/stratum/rates:
 *   get:
 *     summary: Obtener tarifas por estrato (información pública)
 *     tags: [Stratum]
 *     parameters:
 *       - in: query
 *         name: stratum
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3, 4, 5, 6]
 *         description: Estrato específico (opcional, si no se proporciona retorna todos)
 *     responses:
 *       200:
 *         description: Tarifas de agua por estrato
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
 *                     stratum:
 *                       type: number
 *                       nullable: true
 *                     rates:
 *                       type: object
 *                       description: Tarifas del estrato o todos los estratos
 *                     description:
 *                       type: string
 *                       nullable: true
 *                     note:
 *                       type: string
 *                       nullable: true
 */
router.get(
  '/rates',
  [
    query('stratum')
      .optional()
      .isInt({ min: 1, max: 6 })
      .withMessage('El estrato debe ser un número entre 1 y 6'),
  ],
  validateRequest,
  StratumController.getStratumRates
);

// Usar rutas autenticadas para las rutas que requieren autenticación
router.use(authenticatedRouter);

export default router;

