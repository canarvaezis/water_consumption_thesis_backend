/**
 * Rutas de Tienda
 */

import express from 'express';
import { StoreController } from '../controllers/store.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { param, body, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Store
 *   description: Endpoints de tienda, compras e inventario
 */

/**
 * @swagger
 * /api/store/categories:
 *   get:
 *     summary: Obtener todas las categorías de tienda
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           storeCategoryId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 */
router.get('/categories', StoreController.getCategories);

/**
 * @swagger
 * /api/store/categories/{categoryId}:
 *   get:
 *     summary: Obtener categoría por ID
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categoría encontrada
 *       404:
 *         description: Categoría no encontrada
 */
router.get(
  '/categories/:categoryId',
  [
    param('categoryId')
      .trim()
      .notEmpty()
      .withMessage('El ID de categoría es requerido'),
  ],
  validateRequest,
  StoreController.getCategoryById
);

/**
 * @swagger
 * /api/store/items:
 *   get:
 *     summary: Obtener todos los items de tienda
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de items
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
 *                           storeItemId:
 *                             type: string
 *                           category:
 *                             type: string
 *                             enum: [avatar, nickname]
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           price:
 *                             type: number
 *                           assetUrl:
 *                             type: string
 *                             nullable: true
 *                           default:
 *                             type: boolean
 *                           owned:
 *                             type: boolean
 */
router.get('/items', StoreController.getItems);

/**
 * @swagger
 * /api/store/items/{itemId}:
 *   get:
 *     summary: Obtener item por ID
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item encontrado
 *       404:
 *         description: Item no encontrado
 */
router.get(
  '/items/:itemId',
  [
    param('itemId')
      .trim()
      .notEmpty()
      .withMessage('El ID del item es requerido'),
  ],
  validateRequest,
  StoreController.getItemById
);

/**
 * @swagger
 * /api/store/items/category/{categoryId}:
 *   get:
 *     summary: Obtener items por categoría
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de items de la categoría
 */
router.get(
  '/items/category/:categoryId',
  [
    param('categoryId')
      .trim()
      .notEmpty()
      .withMessage('El ID de categoría es requerido'),
  ],
  validateRequest,
  StoreController.getItemsByCategory
);

/**
 * @swagger
 * /api/store/purchase:
 *   post:
 *     summary: Comprar un item de la tienda
 *     tags: [Store]
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
 *                 description: ID del item a comprar
 *                 example: "item123"
 *     responses:
 *       201:
 *         description: Item comprado exitosamente
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
 *                   example: Item comprado exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     item:
 *                       type: object
 *                     inventory:
 *                       type: object
 *                     wallet:
 *                       type: object
 *                       properties:
 *                         balance:
 *                           type: number
 *                     pointsSpent:
 *                       type: number
 *       400:
 *         description: Error en la compra (saldo insuficiente, ya tiene el item, etc.)
 *       404:
 *         description: Item no encontrado
 */
router.post(
  '/purchase',
  [
    body('storeItemId')
      .trim()
      .notEmpty()
      .withMessage('storeItemId es requerido')
      .isString(),
  ],
  validateRequest,
  StoreController.purchaseItem
);

/**
 * @swagger
 * /api/store/inventory:
 *   get:
 *     summary: Obtener inventario completo del usuario
 *     tags: [Store]
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
 *                     inventory:
 *                       type: array
 *                       items:
 *                         type: object
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           inventoryId:
 *                             type: string
 *                           storeItemId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           category:
 *                             type: string
 *                           price:
 *                             type: number
 *                           purchasedAt:
 *                             type: string
 *                             format: date-time
 */
router.get('/inventory', StoreController.getUserInventory);

/**
 * @swagger
 * /api/store/inventory/{itemId}:
 *   get:
 *     summary: Verificar si el usuario tiene un item específico
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verificación de posesión del item
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
 *                     hasItem:
 *                       type: boolean
 */
router.get(
  '/inventory/:itemId',
  [
    param('itemId')
      .trim()
      .notEmpty()
      .withMessage('El ID del item es requerido'),
  ],
  validateRequest,
  StoreController.hasItem
);

export default router;

