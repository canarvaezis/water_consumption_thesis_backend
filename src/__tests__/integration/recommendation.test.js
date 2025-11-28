/**
 * Tests de integración para endpoints de Recomendaciones
 */

import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';

describe('Recommendation API', () => {
  const mockToken = 'Bearer mock-firebase-token';

  describe('GET /api/recommendations', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/recommendations')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/recommendations/:recommendationId', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/recommendations/rec123')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/recommendations/:recommendationId/read', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .put('/api/recommendations/rec123/read')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/recommendations/:recommendationId', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .delete('/api/recommendations/rec123')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/recommendations/unread', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/recommendations/unread')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/recommendations/generate', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .post('/api/recommendations/generate')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

