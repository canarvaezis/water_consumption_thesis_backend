/**
 * Tests para endpoint de salud
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';

describe('Health Check', () => {
  // Cerrar el servidor después de los tests si se inició
  afterAll((done) => {
    // Supertest maneja el servidor automáticamente, no necesitamos cerrarlo
    done();
  });

  it('GET /api/health debería retornar estado OK', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBe('OK');
    expect(response.body.message).toBe('Servidor funcionando correctamente');
    expect(response.body.timestamp).toBeDefined();
  });
});

