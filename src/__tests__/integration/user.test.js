/**
 * Tests de integración para endpoints de Usuario
 */

import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';

describe('User API', () => {
  const mockToken = 'Bearer mock-firebase-token';

  describe('PUT /api/users/profile', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .send({
          name: 'Nuevo Nombre',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/password', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .send({
          newPassword: 'NewPassword123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOTA: Este test requiere autenticación válida
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .put('/api/users/password')
        .set('Authorization', mockToken)
        .send({})
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/account', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .delete('/api/users/account')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/activity', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/users/activity')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/settings', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/users/settings')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/settings', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .put('/api/users/settings')
        .send({
          theme: 'dark',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

