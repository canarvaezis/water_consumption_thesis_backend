import express from 'express';
import { body } from 'express-validator';
import { ProfileCustomizationController } from '../controllers/profile-customization.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validate } from '../utils/validation.utils.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Profile Customization
 *   description: Endpoints para personalizar perfil con avatares y nicknames
 */

/**
 * @swagger
 * /api/profile/avatars:
 *   get:
 *     summary: Obtener avatares disponibles
 *     tags: [Profile Customization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de avatares disponibles
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
 *                     avatars:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           asset_url:
 *                             type: string
 *                           price:
 *                             type: number
 *                           default:
 *                             type: boolean
 *                           category:
 *                             type: string
 *                           owned:
 *                             type: boolean
 */
router.get('/avatars', authenticateToken, ProfileCustomizationController.getAvatars);

/**
 * @swagger
 * /api/profile/nicknames:
 *   get:
 *     summary: Obtener nicknames disponibles
 *     tags: [Profile Customization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de nicknames disponibles
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
 *                     nicknames:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           price:
 *                             type: number
 *                           default:
 *                             type: boolean
 *                           category:
 *                             type: string
 *                           owned:
 *                             type: boolean
 */
router.get('/nicknames', authenticateToken, ProfileCustomizationController.getNicknames);

/**
 * @swagger
 * /api/profile/avatar:
 *   put:
 *     summary: Aplicar avatar al perfil
 *     tags: [Profile Customization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storeItemId
 *             properties:
 *               storeItemId:
 *                 type: string
 *                 description: ID del item de avatar
 *     responses:
 *       200:
 *         description: Avatar aplicado exitosamente
 *       400:
 *         description: Error de validación o item no encontrado
 *       403:
 *         description: El usuario no tiene este avatar en su inventario
 */
router.put(
  '/avatar',
  authenticateToken,
  [
    body('storeItemId')
      .notEmpty()
      .withMessage('storeItemId es requerido')
      .isString(),
    validate,
  ],
  ProfileCustomizationController.applyAvatar
);

/**
 * @swagger
 * /api/profile/nickname:
 *   put:
 *     summary: Aplicar nickname al perfil
 *     tags: [Profile Customization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storeItemId
 *             properties:
 *               storeItemId:
 *                 type: string
 *                 description: ID del item de nickname
 *     responses:
 *       200:
 *         description: Nickname aplicado exitosamente
 *       400:
 *         description: Error de validación o item no encontrado
 *       403:
 *         description: El usuario no tiene este nickname en su inventario
 */
router.put(
  '/nickname',
  authenticateToken,
  [
    body('storeItemId')
      .notEmpty()
      .withMessage('storeItemId es requerido')
      .isString(),
    validate,
  ],
  ProfileCustomizationController.applyNickname
);

/**
 * @swagger
 * /api/profile/inventory:
 *   get:
 *     summary: Obtener inventario del usuario (avatares y nicknames que posee)
 *     tags: [Profile Customization]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventario del usuario
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
 *                     avatars:
 *                       type: array
 *                       items:
 *                         type: object
 *                     nicknames:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/inventory', authenticateToken, ProfileCustomizationController.getInventory);

export default router;

