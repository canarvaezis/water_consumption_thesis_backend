/**
 * Validadores reutilizables para IDs y parámetros comunes
 * 
 * Proporciona validaciones consistentes para IDs de Firestore,
 * fechas, y otros parámetros comunes en toda la aplicación
 */

import { param, query, body } from 'express-validator';

/**
 * Valida que un ID de Firestore sea válido
 * Los IDs de Firestore tienen un formato específico
 */
export const validateFirestoreId = (field = 'id') => {
  return param(field)
    .notEmpty()
    .withMessage(`${field} es requerido`)
    .isString()
    .withMessage(`${field} debe ser una cadena de texto`)
    .matches(/^[a-zA-Z0-9_-]{1,}$/)
    .withMessage(`${field} tiene un formato inválido`)
    .isLength({ min: 1, max: 150 })
    .withMessage(`${field} debe tener entre 1 y 150 caracteres`);
};

/**
 * Valida un ID de Firestore en el body
 */
export const validateFirestoreIdBody = (field = 'id') => {
  return body(field)
    .notEmpty()
    .withMessage(`${field} es requerido`)
    .isString()
    .withMessage(`${field} debe ser una cadena de texto`)
    .matches(/^[a-zA-Z0-9_-]{1,}$/)
    .withMessage(`${field} tiene un formato inválido`)
    .isLength({ min: 1, max: 150 })
    .withMessage(`${field} debe tener entre 1 y 150 caracteres`);
};

/**
 * Valida una fecha en formato ISO (YYYY-MM-DD)
 */
export const validateDate = (field = 'date') => {
  return query(field)
    .optional()
    .isISO8601()
    .withMessage(`${field} debe ser una fecha válida en formato ISO (YYYY-MM-DD)`)
    .toDate();
};

/**
 * Valida un rango de fechas
 */
export const validateDateRange = () => {
  return [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('startDate debe ser una fecha válida en formato ISO (YYYY-MM-DD)')
      .toDate(),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('endDate debe ser una fecha válida en formato ISO (YYYY-MM-DD)')
      .toDate(),
  ];
};

/**
 * Valida un número entero positivo
 */
export const validatePositiveInteger = (field = 'number', min = 1) => {
  return query(field)
    .optional()
    .isInt({ min })
    .withMessage(`${field} debe ser un número entero positivo`)
    .toInt();
};

/**
 * Valida un número de página para paginación
 */
export const validatePage = () => {
  return query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page debe ser un número entero mayor a 0')
    .toInt()
    .default(1);
};

/**
 * Valida un límite para paginación
 */
export const validateLimit = (max = 100) => {
  return query('limit')
    .optional()
    .isInt({ min: 1, max })
    .withMessage(`limit debe ser un número entero entre 1 y ${max}`)
    .toInt()
    .default(30);
};

/**
 * Valida un estrato (1-6)
 */
export const validateStratum = () => {
  return [
    body('stratum')
      .notEmpty()
      .withMessage('Estrato es requerido')
      .isInt({ min: 1, max: 6 })
      .withMessage('Estrato debe ser un número entre 1 y 6')
      .toInt(),
  ];
};

/**
 * Valida un código de invitación
 */
export const validateInviteCode = () => {
  return body('inviteCode')
    .notEmpty()
    .withMessage('Código de invitación es requerido')
    .isString()
    .withMessage('Código de invitación debe ser una cadena de texto')
    .isLength({ min: 6, max: 20 })
    .withMessage('Código de invitación debe tener entre 6 y 20 caracteres')
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Código de invitación solo puede contener letras mayúsculas y números');
};

