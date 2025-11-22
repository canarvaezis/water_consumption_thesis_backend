/**
 * Rutas de Consumo
 */

import express from 'express';
import { ConsumptionController } from '../controllers/consumption.controller.js';
import { ConsumptionItemController } from '../controllers/consumption-item.controller.js';
import { ConsumptionCategoryController } from '../controllers/consumption-category.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { body } from 'express-validator';
import { validate } from '../utils/validation.utils.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Consumption
 *   description: Endpoints de registro de consumo de agua
 */

/**
 * @swagger
 * /api/consumption:
 *   post:
 *     summary: Registrar consumo de agua
 *     tags: [Consumption]
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
 *               - estimatedLiters
 *             properties:
 *               consumptionItemId:
 *                 type: string
 *                 example: "item123"
 *               timesPerDay:
 *                 type: number
 *                 example: 2
 *               estimatedLiters:
 *                 type: number
 *                 example: 50
 *               householdId:
 *                 type: string
 *                 example: "household123"
 *     responses:
 *       201:
 *         description: Consumo registrado exitosamente
 *       400:
 *         description: Error de validación
 */
router.post(
  '/',
  [
    body('consumptionItemId')
      .notEmpty()
      .withMessage('ID de item de consumo es requerido')
      .isString(),
    body('estimatedLiters')
      .notEmpty()
      .withMessage('Litros estimados es requerido')
      .isFloat({ min: 0.1 })
      .withMessage('Litros estimados debe ser un número positivo'),
    body('timesPerDay')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Veces por día debe ser un número entero positivo'),
    body('householdId')
      .optional()
      .isString(),
    validate,
  ],
  ConsumptionController.addConsumption
);

/**
 * @swagger
 * /api/consumption/sessions/today:
 *   get:
 *     summary: Obtener sesión de consumo del día actual
 *     tags: [Consumption]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión del día actual
 */
router.get('/sessions/today', ConsumptionController.getTodaySession);

/**
 * @swagger
 * /api/consumption/details/{sessionId}/{detailId}:
 *   delete:
 *     summary: Eliminar detalle de consumo
 *     tags: [Consumption]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: detailId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle eliminado exitosamente
 */
/**
 * @swagger
 * /api/consumption/details/{sessionId}/{detailId}:
 *   put:
 *     summary: Actualizar detalle de consumo (solo día de hoy)
 *     tags: [Consumption]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: detailId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estimatedLiters:
 *                 type: number
 *               timesPerDay:
 *                 type: number
 *     responses:
 *       200:
 *         description: Detalle actualizado exitosamente
 */
router.put(
  '/details/:sessionId/:detailId',
  [
    body('estimatedLiters')
      .optional()
      .isFloat({ min: 0.1 })
      .withMessage('Litros estimados debe ser un número positivo'),
    body('timesPerDay')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Veces por día debe ser un número entero positivo'),
    validate,
  ],
  ConsumptionController.updateDetail
);

/**
 * @swagger
 * /api/consumption/details/{sessionId}/{detailId}:
 *   delete:
 *     summary: Eliminar detalle de consumo (solo día de hoy)
 *     tags: [Consumption]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: detailId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle eliminado exitosamente
 */
router.delete('/details/:sessionId/:detailId', ConsumptionController.deleteDetail);

/**
 * @swagger
 * /api/consumption/history:
 *   get:
 *     summary: Obtener historial de consumo (vista global)
 *     tags: [Consumption]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Límite de resultados
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *     responses:
 *       200:
 *         description: Historial de consumo
 */
router.get('/history', ConsumptionController.getHistory);

/**
 * @swagger
 * /api/consumption/sessions/{date}:
 *   get:
 *     summary: Obtener sesión de consumo por fecha específica
 *     tags: [Consumption]
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
 *         description: Sesión de la fecha especificada
 */
router.get('/sessions/:date', ConsumptionController.getSessionByDate);

/**
 * @swagger
 * /api/consumption/statistics:
 *   get:
 *     summary: Obtener estadísticas de consumo
 *     tags: [Consumption]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Estadísticas de consumo
 */
router.get('/statistics', ConsumptionController.getStatistics);

// Items de consumo
/**
 * @swagger
 * /api/consumption/items:
 *   get:
 *     summary: Obtener todos los items de consumo disponibles
 *     tags: [Consumption]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de items de consumo
 */
router.get('/items', ConsumptionItemController.getItems);

/**
 * @swagger
 * /api/consumption/items/{itemId}:
 *   get:
 *     summary: Obtener item de consumo por ID
 *     tags: [Consumption]
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
 *         description: Item de consumo
 */
router.get('/items/:itemId', ConsumptionItemController.getItem);

/**
 * @swagger
 * /api/consumption/items/category/{categoryId}:
 *   get:
 *     summary: Obtener items de consumo por categoría
 *     tags: [Consumption]
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
router.get('/items/category/:categoryId', ConsumptionItemController.getItemsByCategory);

// Categorías
/**
 * @swagger
 * /api/consumption/categories:
 *   get:
 *     summary: Obtener todas las categorías de consumo
 *     tags: [Consumption]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 */
router.get('/categories', ConsumptionCategoryController.getCategories);

/**
 * @swagger
 * /api/consumption/categories/{categoryId}:
 *   get:
 *     summary: Obtener categoría por ID
 *     tags: [Consumption]
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
 *         description: Categoría de consumo
 */
router.get('/categories/:categoryId', ConsumptionCategoryController.getCategory);

export default router;

