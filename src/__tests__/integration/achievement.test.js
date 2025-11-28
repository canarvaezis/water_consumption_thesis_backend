/**
 * Tests de integración para endpoints de Logros
 */

import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';

describe('Achievement API', () => {
  const mockToken = 'Bearer mock-firebase-token';

  describe('GET /api/achievements', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/achievements')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/achievements/:achievementId', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/achievements/ach123')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/achievements/category/:category', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/achievements/category/consumption')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/achievements/user', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/achievements/user')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/achievements/progress', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/achievements/progress')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/achievements/:achievementId/claim', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .post('/api/achievements/ach123/claim')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/achievements/evaluate', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .post('/api/achievements/evaluate')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

