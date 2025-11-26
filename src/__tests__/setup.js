/**
 * Configuración global para tests
 * Se ejecuta antes de cada test
 */

import dotenv from 'dotenv';
import { jest } from '@jest/globals';

// Cargar variables de entorno de test
dotenv.config({ path: '.env.test' });

// Configurar variables de entorno por defecto para testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.CORS_ORIGIN = '*';

// Suprimir logs durante tests
process.env.LOG_LEVEL = 'error';

// Mock de console para evitar logs en tests (opcional)
// Comentado porque puede interferir con algunos tests
// Si necesitas silenciar logs, descomenta esto:
/*
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
*/

