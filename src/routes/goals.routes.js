import express from 'express';
import { body } from 'express-validator';
import { GoalsController } from '../controllers/goals.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validate } from '../utils/validation.utils.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Goals
 *   description: Endpoints para gestionar metas de consumo diarias y mensuales
 */

/**
 * @swagger
 * /api/goals:
 *   get:
 *     summary: Obtener metas del usuario
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metas del usuario
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
 *                     dailyGoal:
 *                       type: number
 *                       nullable: true
 *                       description: Meta diaria en litros
 *                       example: 50
 *                     monthlyGoal:
 *                       type: number
 *                       nullable: true
 *                       description: Meta mensual en litros
 *                       example: 1500
 */
router.get('/', authenticateToken, GoalsController.getGoals);

/**
 * @swagger
 * /api/goals:
 *   put:
 *     summary: Actualizar metas del usuario
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dailyGoal:
 *                 type: number
 *                 nullable: true
 *                 description: Meta diaria en litros (null para eliminar)
 *                 example: 50
 *               monthlyGoal:
 *                 type: number
 *                 nullable: true
 *                 description: Meta mensual en litros (null para eliminar)
 *                 example: 1500
 *     responses:
 *       200:
 *         description: Metas actualizadas exitosamente
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
 *                   example: Metas actualizadas exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     dailyGoal:
 *                       type: number
 *                       nullable: true
 *                     monthlyGoal:
 *                       type: number
 *                       nullable: true
 *       400:
 *         description: Error de validación
 */
router.put(
  '/',
  authenticateToken,
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
 * /api/goals/progress:
 *   get:
 *     summary: Obtener progreso de metas del usuario
 *     tags: [Goals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progreso de metas
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
 *                     goals:
 *                       type: object
 *                       properties:
 *                         dailyGoal:
 *                           type: number
 *                           nullable: true
 *                         monthlyGoal:
 *                           type: number
 *                           nullable: true
 *                     daily:
 *                       type: object
 *                       properties:
 *                         consumption:
 *                           type: number
 *                           description: Consumo actual del día en litros
 *                         goal:
 *                           type: number
 *                           nullable: true
 *                           description: Meta diaria en litros
 *                         progress:
 *                           type: number
 *                           nullable: true
 *                           description: Porcentaje de progreso (0-100)
 *                         remaining:
 *                           type: number
 *                           nullable: true
 *                           description: Litros restantes para alcanzar la meta
 *                         percentage:
 *                           type: number
 *                           nullable: true
 *                         achieved:
 *                           type: boolean
 *                           nullable: true
 *                           description: Si se alcanzó la meta
 *                     monthly:
 *                       type: object
 *                       properties:
 *                         consumption:
 *                           type: number
 *                           description: Consumo actual del mes en litros
 *                         goal:
 *                           type: number
 *                           nullable: true
 *                           description: Meta mensual en litros
 *                         progress:
 *                           type: number
 *                           nullable: true
 *                           description: Porcentaje de progreso (0-100)
 *                         remaining:
 *                           type: number
 *                           nullable: true
 *                           description: Litros restantes para alcanzar la meta
 *                         percentage:
 *                           type: number
 *                           nullable: true
 *                         achieved:
 *                           type: boolean
 *                           nullable: true
 *                           description: Si se alcanzó la meta
 *                         daysRemaining:
 *                           type: number
 *                           description: Días restantes del mes
 *                         averageDailyConsumption:
 *                           type: number
 *                           description: Consumo promedio diario del mes
 *                         projectedMonthlyConsumption:
 *                           type: number
 *                           description: Proyección de consumo mensual basada en el promedio actual
 */
router.get('/progress', authenticateToken, GoalsController.getProgress);

export default router;

