/**
 * Rutas de Tienda
 */

import express from 'express';
import { StoreController } from '../controllers/store.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { param, body, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';
import { validateFirestoreId } from '../utils/validators.js';

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
    validateFirestoreId('categoryId'),
    validateRequest,
  ],
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
    validateFirestoreId('itemId'),
    validateRequest,
  ],
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
    validateFirestoreId('categoryId'),
    validateRequest,
  ],
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
    validateFirestoreId('itemId'),
    validateRequest,
  ],
  StoreController.hasItem
);

/**
 * @swagger
 * /api/store/items/featured:
 *   get:
 *     summary: Obtener items destacados de la tienda
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de items destacados
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
 */
router.get('/items/featured', StoreController.getFeaturedItems);

/**
 * @swagger
 * /api/store/wallet/transactions:
 *   get:
 *     summary: Obtener historial de transacciones de la billetera
 *     tags: [Store]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Límite de transacciones a retornar
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [purchase, reward, admin_add, refund]
 *         description: Filtrar por tipo de transacción
 *       - in: query
 *         name: startAfter
 *         schema:
 *           type: string
 *         description: ID de transacción para paginación
 *     responses:
 *       200:
 *         description: Historial de transacciones
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
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [purchase, reward, admin_add, refund]
 *                           amount:
 *                             type: number
 *                             description: Positivo para ingresos, negativo para gastos
 *                           description:
 *                             type: string
 *                           storeItemId:
 *                             type: string
 *                             nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalEarned:
 *                           type: number
 *                         totalSpent:
 *                           type: number
 *                         netAmount:
 *                           type: number
 *                         transactionCount:
 *                           type: integer
 *                         transactionsByType:
 *                           type: object
 *                     wallet:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         balance:
 *                           type: number
 */
router.get('/wallet/transactions', StoreController.getTransactions);

/**
 * @swagger
 * /api/store/wallet/add-points:
 *   post:
 *     summary: Agregar puntos a la billetera (admin/testing)
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
 *               - points
 *             properties:
 *               points:
 *                 type: number
 *                 description: Cantidad de puntos a agregar
 *                 example: 100
 *               description:
 *                 type: string
 *                 description: Descripción de la transacción
 *                 example: "Puntos de prueba"
 *     responses:
 *       201:
 *         description: Puntos agregados exitosamente
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
 *                   example: Puntos agregados exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     wallet:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         balance:
 *                           type: number
 *                     pointsAdded:
 *                       type: number
 *                     transaction:
 *                       type: object
 *       400:
 *         description: Error de validación
 */
router.post(
  '/wallet/add-points',
  [
    body('points')
      .isFloat({ min: 0.01 })
      .withMessage('Los puntos deben ser un número positivo mayor a 0'),
    body('description')
      .optional()
      .isString()
      .trim(),
  ],
  validateRequest,
  StoreController.addPoints
);

export default router;

