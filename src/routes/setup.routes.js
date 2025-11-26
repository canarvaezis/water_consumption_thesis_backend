/**
 * Rutas de Setup Items
 */

import express from 'express';
import { SetupController } from '../controllers/setup.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Setup
 *   description: Endpoints de gestión de items de configuración del usuario
 */

/**
 * @swagger
 * /api/setup/items:
 *   get:
 *     summary: Obtener items de configuración del usuario
 *     tags: [Setup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de items de configuración
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
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           userSetupItemId:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           consumptionItemId:
 *                             type: string
 *                           hasItem:
 *                             type: boolean
 *                           consumptionItem:
 *                             type: object
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                     count:
 *                       type: integer
 */
router.get('/items', SetupController.getUserSetupItems);

/**
 * @swagger
 * /api/setup/items:
 *   post:
 *     summary: Agregar o actualizar item de configuración
 *     tags: [Setup]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - consumptionItemId
 *               - hasItem
 *             properties:
 *               consumptionItemId:
 *                 type: string
 *                 description: ID del item de consumo
 *                 example: "item123"
 *               hasItem:
 *                 type: boolean
 *                 description: Si el usuario tiene este item
 *                 example: true
 *     responses:
 *       200:
 *         description: Item de configuración guardado exitosamente
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
 *                   example: Item de configuración guardado exitosamente
 *                 data:
 *                   type: object
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Item de consumo no encontrado
 */
router.post(
  '/items',
  [
    body('consumptionItemId')
      .notEmpty()
      .withMessage('consumptionItemId es requerido')
      .isString()
      .withMessage('consumptionItemId debe ser una cadena de texto'),
    body('hasItem')
      .notEmpty()
      .withMessage('hasItem es requerido')
      .isBoolean()
      .withMessage('hasItem debe ser un valor booleano'),
  ],
  validateRequest,
  SetupController.upsertSetupItem
);

/**
 * @swagger
 * /api/setup/items/{itemId}:
 *   put:
 *     summary: Actualizar item de configuración por ID
 *     tags: [Setup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del item de configuración
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hasItem
 *             properties:
 *               hasItem:
 *                 type: boolean
 *                 description: Si el usuario tiene este item
 *                 example: false
 *     responses:
 *       200:
 *         description: Item de configuración actualizado exitosamente
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
 *                   example: Item de configuración actualizado exitosamente
 *                 data:
 *                   type: object
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Item de configuración no encontrado
 */
router.put(
  '/items/:itemId',
  [
    param('itemId')
      .notEmpty()
      .withMessage('itemId es requerido')
      .isString()
      .withMessage('itemId debe ser una cadena de texto'),
    body('hasItem')
      .notEmpty()
      .withMessage('hasItem es requerido')
      .isBoolean()
      .withMessage('hasItem debe ser un valor booleano'),
  ],
  validateRequest,
  SetupController.updateSetupItem
);

/**
 * @swagger
 * /api/setup/items/{itemId}:
 *   delete:
 *     summary: Eliminar item de configuración
 *     tags: [Setup]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del item de configuración
 *     responses:
 *       200:
 *         description: Item de configuración eliminado exitosamente
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
 *                   example: Item de configuración eliminado exitosamente
 *       404:
 *         description: Item de configuración no encontrado
 */
router.delete(
  '/items/:itemId',
  [
    param('itemId')
      .notEmpty()
      .withMessage('itemId es requerido')
      .isString()
      .withMessage('itemId debe ser una cadena de texto'),
  ],
  validateRequest,
  SetupController.deleteSetupItem
);

export default router;

