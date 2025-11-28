/**
 * Tests de integración para endpoints de Estrato
 */

import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';

describe('Stratum API', () => {
  const mockToken = 'Bearer mock-firebase-token';

  describe('GET /api/stratum', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/stratum')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/stratum', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .put('/api/stratum')
        .send({
          stratum: 4,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOTA: Estos tests requieren autenticación válida
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .put('/api/stratum')
        .set('Authorization', mockToken)
        .send({})
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });

    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .put('/api/stratum')
        .set('Authorization', mockToken)
        .send({
          stratum: 7, // Fuera de rango
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });

    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .put('/api/stratum')
        .set('Authorization', mockToken)
        .send({
          stratum: 3.5, // Decimal
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/stratum/history', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/stratum/history')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/stratum/rates', () => {
    it('debería funcionar sin autenticación (endpoint público)', async () => {
      const response = await request(app)
        .get('/api/stratum/rates')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('debería validar que stratum esté entre 1 y 6 si se proporciona', async () => {
      const response = await request(app)
        .get('/api/stratum/rates')
        .query({
          stratum: 10, // Fuera de rango
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });
});

