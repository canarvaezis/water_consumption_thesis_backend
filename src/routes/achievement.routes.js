/**
 * Rutas de Logros
 */

import express from 'express';
import { AchievementController } from '../controllers/achievement.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { param } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Achievements
 *   description: Endpoints de logros y recompensas
 */

/**
 * @swagger
 * /api/achievements:
 *   get:
 *     summary: Listar todos los logros disponibles
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de logros
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
 *                     achievements:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           achievementId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           reward:
 *                             type: number
 *                           iconUrl:
 *                             type: string
 *                           category:
 *                             type: string
 *                             nullable: true
 *                           unlocked:
 *                             type: boolean
 *                           unlockedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 */
router.get('/', AchievementController.getAllAchievements);

/**
 * @swagger
 * /api/achievements/{achievementId}:
 *   get:
 *     summary: Obtener logro por ID
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: achievementId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Logro encontrado
 *       404:
 *         description: Logro no encontrado
 */
router.get(
  '/:achievementId',
  [
    param('achievementId')
      .trim()
      .notEmpty()
      .withMessage('El ID del logro es requerido'),
  ],
  validateRequest,
  AchievementController.getAchievementById
);

/**
 * @swagger
 * /api/achievements/category/{category}:
 *   get:
 *     summary: Obtener logros por categoría
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de logros de la categoría
 */
router.get(
  '/category/:category',
  [
    param('category')
      .trim()
      .notEmpty()
      .withMessage('La categoría es requerida'),
  ],
  validateRequest,
  AchievementController.getAchievementsByCategory
);

/**
 * @swagger
 * /api/achievements/my-achievements:
 *   get:
 *     summary: Obtener logros desbloqueados por el usuario
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logros del usuario
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
 *                     achievements:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           achievement:
 *                             type: object
 *                           unlockedAt:
 *                             type: string
 *                             format: date-time
 *                     count:
 *                       type: integer
 */
router.get('/my-achievements', AchievementController.getUserAchievements);

/**
 * @swagger
 * /api/achievements/progress:
 *   get:
 *     summary: Obtener progreso de logros (cuáles están cerca)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Progreso de logros
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
 *                     achievements:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           achievement:
 *                             type: object
 *                           unlocked:
 *                             type: boolean
 *                           progress:
 *                             type: object
 *                             properties:
 *                               percentage:
 *                                 type: number
 *                               description:
 *                                 type: string
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         unlocked:
 *                           type: integer
 *                         locked:
 *                           type: integer
 */
router.get('/progress', AchievementController.getAchievementsProgress);

/**
 * @swagger
 * /api/achievements/{achievementId}/claim:
 *   post:
 *     summary: Reclamar recompensa de logro
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: achievementId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recompensa reclamada exitosamente
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
 *                   example: Recompensa reclamada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     achievement:
 *                       type: object
 *                     wallet:
 *                       type: object
 *                       properties:
 *                         balance:
 *                           type: number
 *                     pointsEarned:
 *                       type: number
 *                     transaction:
 *                       type: object
 *       404:
 *         description: Logro no encontrado o no desbloqueado
 */
router.post(
  '/:achievementId/claim',
  [
    param('achievementId')
      .trim()
      .notEmpty()
      .withMessage('El ID del logro es requerido'),
  ],
  validateRequest,
  AchievementController.claimAchievementReward
);

/**
 * @swagger
 * /api/achievements/evaluate:
 *   post:
 *     summary: Forzar evaluación de logros (admin/testing)
 *     tags: [Achievements]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Evaluación completada
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
 *                   example: Evaluación completada. 2 logro(s) desbloqueado(s)
 *                 data:
 *                   type: object
 *                   properties:
 *                     newlyUnlocked:
 *                       type: integer
 *                     achievements:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.post('/evaluate', AchievementController.evaluateAchievements);

export default router;

