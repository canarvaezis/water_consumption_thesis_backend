/**
 * Rutas de Estadísticas del Usuario
 */

import express from 'express';
import { UserStatisticsController } from '../controllers/user-statistics.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: User Statistics
 *   description: Endpoints de estadísticas del usuario
 */

/**
 * @swagger
 * /api/user-statistics/today:
 *   get:
 *     summary: Obtener estadísticas del día actual
 *     tags: [User Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del día actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                     liters:
 *                       type: number
 *                     cost:
 *                       type: number
 *                     hasConsumption:
 *                       type: boolean
 */
router.get('/today', UserStatisticsController.getTodayStatistics);

/**
 * @swagger
 * /api/user-statistics/current-month:
 *   get:
 *     summary: Obtener estadísticas del mes actual
 *     tags: [User Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas del mes actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     month:
 *                       type: number
 *                     monthName:
 *                       type: string
 *                     year:
 *                       type: number
 *                     totalLiters:
 *                       type: number
 *                     totalCost:
 *                       type: number
 *                     averageDailyLiters:
 *                       type: number
 *                     averageDailyCost:
 *                       type: number
 *                     daysWithConsumption:
 *                       type: number
 *                     currentDay:
 *                       type: number
 *                     daysInMonth:
 *                       type: number
 */
router.get('/current-month', UserStatisticsController.getCurrentMonthStatistics);

/**
 * @swagger
 * /api/user-statistics/average-daily:
 *   get:
 *     summary: Obtener promedio diario del usuario
 *     tags: [User Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Promedio diario del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     averageDailyLiters:
 *                       type: number
 *                     averageDailyCost:
 *                       type: number
 *                     totalSessions:
 *                       type: number
 *                     totalLiters:
 *                       type: number
 *                     totalCost:
 *                       type: number
 */
router.get('/average-daily', UserStatisticsController.getAverageDaily);

/**
 * @swagger
 * /api/user-statistics/average-monthly:
 *   get:
 *     summary: Obtener promedio mensual del usuario
 *     tags: [User Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Promedio mensual del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     averageMonthlyLiters:
 *                       type: number
 *                     averageMonthlyCost:
 *                       type: number
 *                     totalMonths:
 *                       type: number
 *                     totalLiters:
 *                       type: number
 *                     totalCost:
 *                       type: number
 *                     monthlyData:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/average-monthly', UserStatisticsController.getAverageMonthly);

/**
 * @swagger
 * /api/user-statistics/day/{date}:
 *   get:
 *     summary: Obtener consumo en un día específico
 *     tags: [User Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Consumo del día específico
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       format: date
 *                     liters:
 *                       type: number
 *                     cost:
 *                       type: number
 *                     hasConsumption:
 *                       type: boolean
 *                     sessionId:
 *                       type: string
 */
router.get('/day/:date', UserStatisticsController.getDayConsumption);

/**
 * @swagger
 * /api/user-statistics/all:
 *   get:
 *     summary: Obtener todas las estadísticas del usuario
 *     tags: [User Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las estadísticas del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     today:
 *                       type: object
 *                     currentMonth:
 *                       type: object
 *                     averageDaily:
 *                       type: object
 *                     averageMonthly:
 *                       type: object
 */
router.get('/all', UserStatisticsController.getAllStatistics);

export default router;

