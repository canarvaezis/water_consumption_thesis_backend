/**
 * Tests para clases de errores personalizados
 */

import { describe, it, expect } from '@jest/globals';
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
} from '../../../utils/errors.js';

describe('Error Classes', () => {
  describe('AppError', () => {
    it('debería crear error con código de estado', () => {
      const error = new AppError('Test error', 400);
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.status).toBe('fail');
      expect(error.isOperational).toBe(true);
    });

    it('debería marcar como error para códigos 5xx', () => {
      const error = new AppError('Server error', 500);
      
      expect(error.status).toBe('error');
    });
  });

  describe('BadRequestError', () => {
    it('debería crear error 400', () => {
      const error = new BadRequestError('Invalid request');
      
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid request');
      expect(error.name).toBe('BadRequestError');
    });
  });

  describe('UnauthorizedError', () => {
    it('debería crear error 401', () => {
      const error = new UnauthorizedError('Not authorized');
      
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe('UnauthorizedError');
    });
  });

  describe('ForbiddenError', () => {
    it('debería crear error 403', () => {
      const error = new ForbiddenError('Access forbidden');
      
      expect(error.statusCode).toBe(403);
      expect(error.name).toBe('ForbiddenError');
    });
  });

  describe('NotFoundError', () => {
    it('debería crear error 404', () => {
      const error = new NotFoundError('Resource not found');
      
      expect(error.statusCode).toBe(404);
      expect(error.name).toBe('NotFoundError');
    });
  });

  describe('ConflictError', () => {
    it('debería crear error 409', () => {
      const error = new ConflictError('Conflict occurred');
      
      expect(error.statusCode).toBe(409);
      expect(error.name).toBe('ConflictError');
    });
  });

  describe('ValidationError', () => {
    it('debería crear error 422 con errores', () => {
      const errors = [{ field: 'email', message: 'Invalid email' }];
      const error = new ValidationError('Validation failed', errors);
      
      expect(error.statusCode).toBe(422);
      expect(error.errors).toEqual(errors);
      expect(error.name).toBe('ValidationError');
    });
  });

  describe('InternalServerError', () => {
    it('debería crear error 500', () => {
      const error = new InternalServerError('Server error');
      
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('InternalServerError');
    });
  });
});

