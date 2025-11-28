/**
 * Tests de integración para endpoints de Hogar/Familia
 */

import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';

describe('Household API', () => {
  const mockToken = 'Bearer mock-firebase-token';

  describe('POST /api/household', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .post('/api/household')
        .send({
          householdName: 'Mi Familia',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOTA: Estos tests requieren autenticación válida
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .post('/api/household')
        .set('Authorization', mockToken)
        .send({})
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });

    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .post('/api/household')
        .set('Authorization', mockToken)
        .send({
          householdName: 'A', // Muy corto
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });

    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .post('/api/household')
        .set('Authorization', mockToken)
        .send({
          householdName: 'Mi Familia',
          memberLimit: -5, // Negativo
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/household/join', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .post('/api/household/join')
        .send({
          inviteCode: 'ABC123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOTA: Estos tests requieren autenticación válida
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .post('/api/household/join')
        .set('Authorization', mockToken)
        .send({})
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });

    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .post('/api/household/join')
        .set('Authorization', mockToken)
        .send({
          inviteCode: 'AB', // Muy corto
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/household', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/household')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/household/leave', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .post('/api/household/leave')
        .send({
          householdId: 'household123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOTA: Este test requiere autenticación válida
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .post('/api/household/leave')
        .set('Authorization', mockToken)
        .send({})
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/household/:householdId', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .delete('/api/household/household123')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/household/:householdId', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .put('/api/household/household123')
        .send({
          householdName: 'Nuevo Nombre',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/household/:householdId/invite-code', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/household/household123/invite-code')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/household/:householdId/consumption/daily', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/household/household123/consumption/daily')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/household/:householdId/statistics', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/household/household123/statistics')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

