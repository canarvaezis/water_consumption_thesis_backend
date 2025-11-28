/**
 * Tests de integración para endpoints de Tienda
 */

import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';

describe('Store API', () => {
  const mockToken = 'Bearer mock-firebase-token';

  describe('GET /api/store/categories', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/store/categories')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/store/categories/:categoryId', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/store/categories/cat123')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/store/items', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/store/items')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/store/items/:itemId', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/store/items/item123')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/store/purchase', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .post('/api/store/purchase')
        .send({
          storeItemId: 'item123',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOTA: Este test requiere autenticación válida
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .post('/api/store/purchase')
        .set('Authorization', mockToken)
        .send({})
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/store/inventory', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/store/inventory')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/store/inventory/:itemId', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/store/inventory/item123')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/store/items/featured', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/store/items/featured')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/store/wallet/transactions', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/store/wallet/transactions')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/store/wallet/add-points', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .post('/api/store/wallet/add-points')
        .send({
          points: 100,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    // NOTA: Este test requiere autenticación válida
    it('debería retornar error 401 con token inválido (validación requiere auth válida)', async () => {
      const response = await request(app)
        .post('/api/store/wallet/add-points')
        .set('Authorization', mockToken)
        .send({
          points: -10, // Negativo
        })
        .expect(401); // Primero se valida la autenticación

      expect(response.body.success).toBe(false);
    });
  });
});

