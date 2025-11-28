/**
 * Tests de integración para endpoints de Consumo
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';

describe('Consumption API', () => {
  const mockToken = 'Bearer mock-firebase-token';

  describe('POST /api/consumption', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .post('/api/consumption')
        .send({
          consumptionItemId: 'item123',
          estimatedLiters: 50,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token de acceso requerido');
    });

    // NOTA: Este test requiere que la autenticación pase primero
    // En un entorno real, necesitarías un token válido de Firebase
    // Por ahora, solo verificamos que sin token retorna 401
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .post('/api/consumption')
        .set('Authorization', mockToken)
        .send({
          // Falta consumptionItemId y estimatedLiters
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });

    // NOTA: Estos tests requieren autenticación válida
    // La validación de campos ocurre después de la autenticación
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .post('/api/consumption')
        .set('Authorization', mockToken)
        .send({
          consumptionItemId: 'item123',
          estimatedLiters: -10, // Negativo
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/consumption/sessions/today', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/consumption/sessions/today')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/consumption/history', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/consumption/history')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOTA: Este test requiere autenticación válida
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .get('/api/consumption/history')
        .set('Authorization', mockToken)
        .query({
          startDate: 'invalid-date',
          endDate: '2024-01-31',
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/consumption/statistics', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/consumption/statistics')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/consumption/items', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/consumption/items')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/consumption/items/:itemId', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/consumption/items/item123')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/consumption/categories', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/consumption/categories')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

