/**
 * Tests de integración para endpoints de autenticación
 * 
 * NOTA: Estos tests requieren que Firebase esté configurado o usar mocks
 * Para tests completos, considera usar Firebase Emulator
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('debería retornar error 400 si faltan campos requeridos', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          // Falta email y password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('debería validar formato de email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'Password123',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('debería validar formato de contraseña', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'weak', // Muy corta y sin mayúsculas/números
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    it('debería retornar error 400 si falta idToken', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('debería retornar error 401 con token inválido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          idToken: 'invalid-token',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /api/auth/profile', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token de acceso requerido');
    });

    it('debería retornar error 401 con token inválido', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/balance', () => {
    it('debería retornar error 401 sin token', async () => {
      const response = await request(app)
        .get('/api/auth/balance')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Token de acceso requerido');
    });
  });
});

