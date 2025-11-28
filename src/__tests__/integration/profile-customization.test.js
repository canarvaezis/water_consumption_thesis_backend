/**
 * Tests de integración para endpoints de Personalización de Perfil
 */

import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';

describe('Profile Customization API', () => {
  const mockToken = 'Bearer mock-firebase-token';

  describe('GET /api/profile/avatars', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/profile/avatars')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/profile/nicknames', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/profile/nicknames')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/profile/avatar', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .put('/api/profile/avatar')
        .send({
          storeItemId: 'avatar123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOTA: Este test requiere autenticación válida
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .put('/api/profile/avatar')
        .set('Authorization', mockToken)
        .send({})
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/profile/nickname', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .put('/api/profile/nickname')
        .send({
          storeItemId: 'nickname123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOTA: Este test requiere autenticación válida
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .put('/api/profile/nickname')
        .set('Authorization', mockToken)
        .send({})
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/profile/inventory', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/profile/inventory')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

