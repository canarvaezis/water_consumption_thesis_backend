/**
 * Rutas de Estrato (Solo ruta pública de tarifas)
 * 
 * Las rutas autenticadas de estrato están en /api/user/stratum
 */

import express from 'express';
import { StratumController } from '../controllers/stratum.controller.js';
import { query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Stratum
 *   description: Endpoints de gestión de estrato y tarifas
 */

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

export default router;

