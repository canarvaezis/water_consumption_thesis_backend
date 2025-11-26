/**
 * Tests unitarios para middleware de autenticación
 * 
 * NOTA: Estos tests requieren mocks más complejos debido a las importaciones de ES modules
 * Para tests completos, considera usar Firebase Emulator o mocks más avanzados
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createMockRequest, createMockResponse, createMockNext } from '../../helpers/testHelpers.js';

describe('Test Helpers', () => {
  describe('createMockRequest', () => {
    it('debería crear request mock con valores por defecto', () => {
      const req = createMockRequest();
      
      expect(req.user).toBeDefined();
      expect(req.body).toBeDefined();
      expect(req.params).toBeDefined();
      expect(req.query).toBeDefined();
    });

    it('debería permitir sobrescribir valores', () => {
      const req = createMockRequest({
        method: 'POST',
        body: { test: 'value' },
      });
      
      expect(req.method).toBe('POST');
      expect(req.body.test).toBe('value');
    });
  });

  describe('createMockResponse', () => {
    it('debería crear response mock con métodos encadenables', () => {
      const res = createMockResponse();
      
      expect(res.status).toBeDefined();
      expect(res.json).toBeDefined();
      expect(res.send).toBeDefined();
      
      // Verificar encadenamiento
      const result = res.status(200).json({ test: 'value' });
      expect(result).toBe(res);
    });
  });

  describe('createMockNext', () => {
    it('debería crear función next mock', () => {
      const next = createMockNext();
      
      expect(typeof next).toBe('function');
      next();
      expect(next).toHaveBeenCalled();
    });
  });
});

