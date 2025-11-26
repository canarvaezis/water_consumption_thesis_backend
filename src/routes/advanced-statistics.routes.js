/**
 * Rutas de Estadísticas Avanzadas
 */

import express from 'express';
import { AdvancedStatisticsController } from '../controllers/advanced-statistics.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Advanced Statistics
 *   description: Endpoints de estadísticas avanzadas de consumo
 */

/**
 * @swagger
 * /api/statistics/comparison:
 *   get:
 *     summary: Comparar consumo entre períodos
 *     tags: [Advanced Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period1
 *         required: true
 *         schema:
 *           type: string
 *         description: Primer período (ej: "lastWeek", "lastMonth", "2024-01-01,2024-01-31", "2024-01-01")
 *       - in: query
 *         name: period2
 *         required: true
 *         schema:
 *           type: string
 *         description: Segundo período (mismo formato que period1)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [daily, monthly, yearly]
 *           default: daily
 *         description: Tipo de comparación
 *     responses:
 *       200:
 *         description: Comparación entre períodos
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
 *                     period1:
 *                       type: object
 *                     period2:
 *                       type: object
 *                     comparison:
 *                       type: object
 *                       properties:
 *                         litersDifference:
 *                           type: number
 *                         costDifference:
 *                           type: number
 *                         litersPercentageChange:
 *                           type: number
 *                         costPercentageChange:
 *                           type: number
 *                         trend:
 *                           type: string
 *                           enum: [increase, decrease, stable]
 */
router.get(
  '/comparison',
  [
    query('period1')
      .notEmpty()
      .withMessage('period1 es requerido'),
    query('period2')
      .notEmpty()
      .withMessage('period2 es requerido'),
    query('type')
      .optional()
      .isIn(['daily', 'monthly', 'yearly'])
      .withMessage('type debe ser daily, monthly o yearly'),
  ],
  validateRequest,
  AdvancedStatisticsController.comparePeriods
);

/**
 * @swagger
 * /api/statistics/trends:
 *   get:
 *     summary: Obtener tendencias de consumo
 *     tags: [Advanced Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         required: true
 *         schema:
 *           type: string
 *         description: Período a analizar (ej: "lastWeek", "lastMonth", "2024-01-01,2024-01-31")
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [liters, cost]
 *           default: liters
 *         description: Métrica a analizar
 *     responses:
 *       200:
 *         description: Tendencias de consumo
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
 *                     period:
 *                       type: object
 *                     metric:
 *                       type: string
 *                     dataPoints:
 *                       type: array
 *                     summary:
 *                       type: object
 *                     trend:
 *                       type: object
 *                       properties:
 *                         direction:
 *                           type: string
 *                           enum: [increasing, decreasing, stable]
 *                         slope:
 *                           type: number
 *                         strength:
 *                           type: number
 */
router.get(
  '/trends',
  [
    query('period')
      .notEmpty()
      .withMessage('period es requerido'),
    query('metric')
      .optional()
      .isIn(['liters', 'cost'])
      .withMessage('metric debe ser liters o cost'),
  ],
  validateRequest,
  AdvancedStatisticsController.getTrends
);

/**
 * @swagger
 * /api/statistics/predictions:
 *   get:
 *     summary: Predecir consumo futuro
 *     tags: [Advanced Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *           minimum: 1
 *           maximum: 90
 *         description: Número de días a predecir
 *       - in: query
 *         name: basedOn
 *         schema:
 *           type: string
 *           enum: [lastWeek, lastMonth]
 *           default: lastWeek
 *         description: Período histórico a usar como base
 *     responses:
 *       200:
 *         description: Predicción de consumo futuro
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
 *                     prediction:
 *                       type: object
 *                       properties:
 *                         averageDailyLiters:
 *                           type: number
 *                         predictedTotalLiters:
 *                           type: number
 *                         predictedTotalCost:
 *                           type: number
 *                     basedOn:
 *                       type: object
 *                     forecast:
 *                       type: array
 *                     days:
 *                       type: integer
 */
router.get(
  '/predictions',
  [
    query('days')
      .optional()
      .isInt({ min: 1, max: 90 })
      .withMessage('days debe ser un número entre 1 y 90'),
    query('basedOn')
      .optional()
      .isIn(['lastWeek', 'lastMonth'])
      .withMessage('basedOn debe ser lastWeek o lastMonth'),
  ],
  validateRequest,
  AdvancedStatisticsController.getPredictions
);

/**
 * @swagger
 * /api/statistics/export:
 *   get:
 *     summary: Exportar datos de consumo
 *     tags: [Advanced Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: csv
 *         description: Formato de exportación
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Datos exportados
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *           application/json:
 *             schema:
 *               type: object
 */
router.get(
  '/export',
  [
    query('format')
      .optional()
      .isIn(['csv', 'json'])
      .withMessage('format debe ser csv o json'),
    query('startDate')
      .notEmpty()
      .withMessage('startDate es requerido')
      .isISO8601()
      .withMessage('startDate debe ser una fecha válida (YYYY-MM-DD)'),
    query('endDate')
      .notEmpty()
      .withMessage('endDate es requerido')
      .isISO8601()
      .withMessage('endDate debe ser una fecha válida (YYYY-MM-DD)'),
  ],
  validateRequest,
  AdvancedStatisticsController.exportData
);

export default router;

