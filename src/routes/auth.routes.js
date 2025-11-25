import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, getBalance } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validators, validate } from '../utils/validation.utils.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: Endpoints de autenticación y gestión de usuarios
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Error de validación o email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Error interno del servidor
 */
router.post(
  '/register',
  [
    validators.name,
    validators.email,
    validators.password,
    validate,
  ],
  register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Credenciales inválidas
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/login',
  [
    body('idToken').notEmpty().withMessage('Token ID de Firebase es requerido'),
    validate,
  ],
  login
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     wallet:
 *                       type: object
 *                       properties:
 *                         walletId:
 *                           type: string
 *                           nullable: true
 *                           description: ID de la billetera
 *                         balance:
 *                           type: number
 *                           description: Balance actual en puntos
 *                           example: 150
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *       401:
 *         description: No autorizado - Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Token de acceso requerido
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @swagger
 * /api/auth/balance:
 *   get:
 *     summary: Obtener balance del usuario
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance del usuario
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
 *                     walletId:
 *                       type: string
 *                       nullable: true
 *                       description: ID de la billetera
 *                     balance:
 *                       type: number
 *                       description: Balance actual en puntos
 *                       example: 150
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                       description: Fecha de última actualización
 *       401:
 *         description: No autorizado - Token inválido o expirado
 */
router.get('/balance', authenticateToken, getBalance);

export default router;

