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

