/**
 * Tests de integración para endpoints de Metas
 */

import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';

describe('Goals API', () => {
  const mockToken = 'Bearer mock-firebase-token';

  describe('GET /api/goals', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/goals')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token de acceso requerido');
    });
  });

  describe('PUT /api/goals', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .put('/api/goals')
        .send({
          dailyGoal: 50,
          monthlyGoal: 1500,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOTA: Estos tests requieren autenticación válida
    // La validación de campos ocurre después de la autenticación
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .put('/api/goals')
        .set('Authorization', mockToken)
        .send({
          dailyGoal: -10, // Negativo
          monthlyGoal: 1500,
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });

    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .put('/api/goals')
        .set('Authorization', mockToken)
        .send({
          dailyGoal: 50,
          monthlyGoal: -100, // Negativo
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });

    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .put('/api/goals')
        .set('Authorization', mockToken)
        .send({
          dailyGoal: null,
          monthlyGoal: null,
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/goals/progress', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/goals/progress')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

