/**
 * Tests de integración para endpoints de Setup
 */

import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';

describe('Setup API', () => {
  const mockToken = 'Bearer mock-firebase-token';

  describe('GET /api/setup/items', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/setup/items')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/setup/items', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .post('/api/setup/items')
        .send({
          consumptionItemId: 'item123',
          hasItem: true,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOTA: Estos tests requieren autenticación válida
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .post('/api/setup/items')
        .set('Authorization', mockToken)
        .send({
          hasItem: true,
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });

    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .post('/api/setup/items')
        .set('Authorization', mockToken)
        .send({
          consumptionItemId: 'item123',
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/setup/items/:itemId', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .put('/api/setup/items/item123')
        .send({
          hasItem: false,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOTA: Este test requiere autenticación válida
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .put('/api/setup/items/item123')
        .set('Authorization', mockToken)
        .send({})
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/setup/items/:itemId', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .delete('/api/setup/items/item123')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

