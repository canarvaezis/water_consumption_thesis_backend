/**
 * Rutas de Hogar/Familia
 */

import express from 'express';
import { HouseholdController } from '../controllers/household.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @swagger
 * /api/household:
 *   post:
 *     summary: Crear una nueva familia
 *     tags: [Household]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - householdName
 *             properties:
 *               householdName:
 *                 type: string
 *                 example: "Familia Pérez"
 *               memberLimit:
 *                 type: number
 *                 nullable: true
 *                 example: 5
 *     responses:
 *       201:
 *         description: Familia creada exitosamente
 *       400:
 *         description: Error en la petición
 */
router.post(
  '/',
  [
    body('householdName')
      .trim()
      .notEmpty()
      .withMessage('El nombre de la familia es requerido')
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('memberLimit')
      .optional()
      .isInt({ min: 1 })
      .withMessage('El límite de miembros debe ser un número positivo'),
  ],
  validateRequest,
  HouseholdController.createHousehold
);

/**
 * @swagger
 * /api/household/join:
 *   post:
 *     summary: Unirse a una familia usando código de invitación
 *     tags: [Household]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteCode
 *             properties:
 *               inviteCode:
 *                 type: string
 *                 example: "ABC12345"
 *     responses:
 *       200:
 *         description: Unido a la familia exitosamente
 *       400:
 *         description: Error en la petición
 */
router.post(
  '/join',
  [
    body('inviteCode')
      .trim()
      .notEmpty()
      .withMessage('El código de invitación es requerido')
      .isLength({ min: 4, max: 20 })
      .withMessage('El código de invitación debe tener entre 4 y 20 caracteres'),
  ],
  validateRequest,
  HouseholdController.joinHousehold
);

/**
 * @swagger
 * /api/household:
 *   get:
 *     summary: Obtener información de mi familia
 *     tags: [Household]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información de la familia
 *       404:
 *         description: No perteneces a ninguna familia
 */
router.get('/', HouseholdController.getMyHousehold);

/**
 * @swagger
 * /api/household/leave:
 *   post:
 *     summary: Salir de la familia
 *     tags: [Household]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - householdId
 *             properties:
 *               householdId:
 *                 type: string
 *                 example: "household123"
 *     responses:
 *       200:
 *         description: Saliste de la familia exitosamente
 *       400:
 *         description: Error en la petición
 */
router.post(
  '/leave',
  [
    body('householdId')
      .trim()
      .notEmpty()
      .withMessage('El ID de la familia es requerido'),
  ],
  validateRequest,
  HouseholdController.leaveHousehold
);

/**
 * @swagger
 * /api/household/{householdId}:
 *   delete:
 *     summary: Eliminar una familia (solo admin)
 *     tags: [Household]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: householdId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Familia eliminada exitosamente
 *       400:
 *         description: Error en la petición
 */
router.delete(
  '/:householdId',
  [
    param('householdId')
      .trim()
      .notEmpty()
      .withMessage('El ID de la familia es requerido'),
  ],
  validateRequest,
  HouseholdController.deleteHousehold
);

/**
 * @swagger
 * /api/household/{householdId}:
 *   put:
 *     summary: Actualizar información de la familia (solo admin)
 *     tags: [Household]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: householdId
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
 *               householdName:
 *                 type: string
 *                 example: "Familia Pérez Actualizada"
 *               memberLimit:
 *                 type: number
 *                 nullable: true
 *                 example: 6
 *     responses:
 *       200:
 *         description: Familia actualizada exitosamente
 *       400:
 *         description: Error en la petición
 */
router.put(
  '/:householdId',
  [
    param('householdId')
      .trim()
      .notEmpty()
      .withMessage('El ID de la familia es requerido'),
    body('householdName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('memberLimit')
      .optional()
      .isInt({ min: 1 })
      .withMessage('El límite de miembros debe ser un número positivo'),
  ],
  validateRequest,
  HouseholdController.updateHousehold
);

/**
 * @swagger
 * /api/household/{householdId}/invite-code:
 *   get:
 *     summary: Obtener código de invitación de la familia
 *     tags: [Household]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: householdId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Código de invitación
 *       400:
 *         description: Error en la petición
 */
router.get(
  '/:householdId/invite-code',
  [
    param('householdId')
      .trim()
      .notEmpty()
      .withMessage('El ID de la familia es requerido'),
  ],
  validateRequest,
  HouseholdController.getInviteCode
);

/**
 * @swagger
 * /api/household/{householdId}/members/{targetUserId}/role:
 *   put:
 *     summary: Asignar rol a un miembro (solo admin)
 *     tags: [Household]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: householdId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, member]
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: Rol asignado exitosamente
 *       400:
 *         description: Error en la petición
 */
router.put(
  '/:householdId/members/:targetUserId/role',
  [
    param('householdId')
      .trim()
      .notEmpty()
      .withMessage('El ID de la familia es requerido'),
    param('targetUserId')
      .trim()
      .notEmpty()
      .withMessage('El ID del usuario es requerido'),
    body('role')
      .isIn(['admin', 'member'])
      .withMessage('El rol debe ser "admin" o "member"'),
  ],
  validateRequest,
  HouseholdController.assignRole
);

/**
 * @swagger
 * /api/household/{householdId}/members/{targetUserId}:
 *   delete:
 *     summary: Remover miembro de la familia (solo admin)
 *     tags: [Household]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: householdId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Miembro removido exitosamente
 *       400:
 *         description: Error en la petición
 */
router.delete(
  '/:householdId/members/:targetUserId',
  [
    param('householdId')
      .trim()
      .notEmpty()
      .withMessage('El ID de la familia es requerido'),
    param('targetUserId')
      .trim()
      .notEmpty()
      .withMessage('El ID del usuario es requerido'),
  ],
  validateRequest,
  HouseholdController.removeMember
);

/**
 * @swagger
 * /api/household/{householdId}/consumption/daily:
 *   get:
 *     summary: Obtener consumo diario de la familia
 *     tags: [Household]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: householdId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *     responses:
 *       200:
 *         description: Consumo diario de la familia
 *       403:
 *         description: No perteneces a esta familia
 */
router.get(
  '/:householdId/consumption/daily',
  [
    param('householdId')
      .trim()
      .notEmpty()
      .withMessage('El ID de la familia es requerido'),
    query('date')
      .optional()
      .isISO8601()
      .withMessage('La fecha debe ser válida (ISO 8601)'),
  ],
  validateRequest,
  HouseholdController.getDailyConsumption
);

/**
 * @swagger
 * /api/household/{householdId}/consumption/history:
 *   get:
 *     summary: Obtener historial de consumo de la familia
 *     tags: [Household]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: householdId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-31"
 *     responses:
 *       200:
 *         description: Historial de consumo
 *       403:
 *         description: No perteneces a esta familia
 */
router.get(
  '/:householdId/consumption/history',
  [
    param('householdId')
      .trim()
      .notEmpty()
      .withMessage('El ID de la familia es requerido'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('La fecha de inicio debe ser válida (ISO 8601)'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('La fecha de fin debe ser válida (ISO 8601)'),
  ],
  validateRequest,
  HouseholdController.getConsumptionHistory
);

/**
 * @swagger
 * /api/household/{householdId}/statistics:
 *   get:
 *     summary: Obtener estadísticas generales de la familia
 *     tags: [Household]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: householdId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *           default: month
 *           example: "month"
 *     responses:
 *       200:
 *         description: Estadísticas de la familia
 *       403:
 *         description: No perteneces a esta familia
 */
router.get(
  '/:householdId/statistics',
  [
    param('householdId')
      .trim()
      .notEmpty()
      .withMessage('El ID de la familia es requerido'),
    query('period')
      .optional()
      .isIn(['week', 'month', 'year'])
      .withMessage('El período debe ser "week", "month" o "year"'),
  ],
  validateRequest,
  HouseholdController.getStatistics
);

/**
 * @swagger
 * /api/household/{householdId}/consumption/by-member:
 *   get:
 *     summary: Obtener consumo por miembro de la familia
 *     tags: [Household]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: householdId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-31"
 *     responses:
 *       200:
 *         description: Consumo por miembro
 *       403:
 *         description: No perteneces a esta familia
 */
router.get(
  '/:householdId/consumption/by-member',
  [
    param('householdId')
      .trim()
      .notEmpty()
      .withMessage('El ID de la familia es requerido'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('La fecha de inicio debe ser válida (ISO 8601)'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('La fecha de fin debe ser válida (ISO 8601)'),
  ],
  validateRequest,
  HouseholdController.getConsumptionByMember
);

export default router;

