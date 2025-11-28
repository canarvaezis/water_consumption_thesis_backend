/**
 * Tests de integración para endpoints de Notificaciones
 */

import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';

describe('Notification API', () => {
  const mockToken = 'Bearer mock-firebase-token';

  describe('GET /api/notifications', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/notifications/unread', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/notifications/unread')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/notifications/:notificationId/read', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .put('/api/notifications/notif123/read')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .put('/api/notifications/read-all')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/notifications/:notificationId', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .delete('/api/notifications/notif123')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});

