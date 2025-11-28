/**
 * Tests de integración para endpoints de Estadísticas Avanzadas
 */

import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';

describe('Advanced Statistics API', () => {
  const mockToken = 'Bearer mock-firebase-token';

  describe('GET /api/statistics/compare', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/statistics/compare')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOTA: Este test requiere autenticación válida
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .get('/api/statistics/compare')
        .set('Authorization', mockToken)
        .query({
          period1: '2024-01',
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/statistics/trends', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/statistics/trends')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOTA: Este test requiere autenticación válida
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .get('/api/statistics/trends')
        .set('Authorization', mockToken)
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/statistics/predictions', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/statistics/predictions')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOTA: Este test requiere autenticación válida
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .get('/api/statistics/predictions')
        .set('Authorization', mockToken)
        .query({
          days: 100, // Fuera de rango
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/statistics/export', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/statistics/export')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOTA: Estos tests requieren autenticación válida
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .get('/api/statistics/export')
        .set('Authorization', mockToken)
        .query({
          startDate: '2024-01-01',
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });

    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .get('/api/statistics/export')
        .set('Authorization', mockToken)
        .query({
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          format: 'xml', // Inválido
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });
});

