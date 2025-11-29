/**
 * Rutas de Consumo
 */

import express from 'express';
import { ConsumptionController } from '../controllers/consumption.controller.js';
import { ConsumptionItemController } from '../controllers/consumption-item.controller.js';
import { ConsumptionCategoryController } from '../controllers/consumption-category.controller.js';
import { FaucetTypeController } from '../controllers/faucet-type.controller.js';
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
 *               - faucetTypeId
 *               - durationMinutes
 *             properties:
 *               consumptionItemId:
 *                 type: string
 *                 example: "item123"
 *                 description: "ID de la actividad (ej: baño, lavado de manos)"
 *               faucetTypeId:
 *                 type: string
 *                 example: "faucet123"
 *                 description: "ID del tipo de grifo utilizado"
 *               durationMinutes:
 *                 type: number
 *                 example: 7
 *                 description: "Duración de la actividad en minutos"
 *               householdId:
 *                 type: string
 *                 example: "household123"
 *                 description: "ID del hogar (opcional)"
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
      .withMessage('ID de actividad de consumo es requerido')
      .isString(),
    body('faucetTypeId')
      .notEmpty()
      .withMessage('ID de tipo de grifo es requerido')
      .isString(),
    body('durationMinutes')
      .notEmpty()
      .withMessage('Duración en minutos es requerida')
      .isFloat({ min: 0.1 })
      .withMessage('La duración debe ser un número positivo mayor a 0'),
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
 *               durationMinutes:
 *                 type: number
 *                 description: "Duración de la actividad en minutos"
 *               faucetTypeId:
 *                 type: string
 *                 description: "ID del tipo de grifo utilizado"
 *     responses:
 *       200:
 *         description: Detalle actualizado exitosamente
 */
router.put(
  '/details/:sessionId/:detailId',
  [
    body('durationMinutes')
      .optional()
      .isFloat({ min: 0.1 })
      .withMessage('La duración debe ser un número positivo mayor a 0'),
    body('faucetTypeId')
      .optional()
      .isString()
      .withMessage('ID de tipo de grifo debe ser una cadena de texto'),
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

// Tipos de grifos
/**
 * @swagger
 * /api/consumption/faucet-types:
 *   get:
 *     summary: Obtener todos los tipos de grifos disponibles
 *     tags: [Consumption]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Incluir tipos de grifos inactivos
 *     responses:
 *       200:
 *         description: Lista de tipos de grifos
 */
router.get('/faucet-types', FaucetTypeController.getFaucetTypes);

/**
 * @swagger
 * /api/consumption/faucet-types/{faucetTypeId}:
 *   get:
 *     summary: Obtener tipo de grifo por ID
 *     tags: [Consumption]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: faucetTypeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tipo de grifo
 */
router.get('/faucet-types/:faucetTypeId', FaucetTypeController.getFaucetType);

export default router;

