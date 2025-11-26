/**
 * Clases de errores personalizados para manejo consistente de códigos HTTP
 * 
 * Permite lanzar errores con códigos de estado HTTP apropiados
 * que serán capturados por el middleware de manejo de errores global
 */

/**
 * Error base personalizado
 */
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error 400 - Bad Request
 * Usado para errores de validación o solicitudes mal formadas
 */
export class BadRequestError extends AppError {
  constructor(message = 'Solicitud inválida') {
    super(message, 400);
    this.name = 'BadRequestError';
  }
}

/**
 * Error 401 - Unauthorized
 * Usado cuando falta autenticación o es inválida
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Error 403 - Forbidden
 * Usado cuando el usuario está autenticado pero no tiene permisos
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Acceso prohibido') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * Error 404 - Not Found
 * Usado cuando un recurso no existe
 */
export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Error 409 - Conflict
 * Usado cuando hay conflictos (ej: email ya registrado)
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflicto en la solicitud') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * Error 422 - Unprocessable Entity
 * Usado para errores de validación de negocio
 */
export class ValidationError extends AppError {
  constructor(message = 'Error de validación', errors = []) {
    super(message, 422);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Error 500 - Internal Server Error
 * Usado para errores del servidor
 */
export class InternalServerError extends AppError {
  constructor(message = 'Error interno del servidor') {
    super(message, 500);
    this.name = 'InternalServerError';
  }
}

