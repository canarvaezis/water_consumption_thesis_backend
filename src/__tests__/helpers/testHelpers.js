/**
 * Funciones auxiliares para tests
 */

import { jest } from '@jest/globals';
import { mockAuth, mockFirestore, mockUser, mockDecodedToken, mockWallet } from '../mocks/firebase.mock.js';

/**
 * Configurar mocks de Firebase para un test
 */
export const setupFirebaseMocks = () => {
  // Mock de verifyIdToken - siempre retorna token válido
  mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);
  
  // Mock de getUserByEmail - retorna usuario existente
  mockAuth.getUserByEmail.mockResolvedValue({
    uid: mockUser.uid,
    email: mockUser.email,
  });
  
  // Mock de createUser - crea nuevo usuario
  mockAuth.createUser.mockResolvedValue({
    uid: mockUser.uid,
    email: mockUser.email,
  });
};

/**
 * Crear mock de documento de Firestore
 */
export const createMockDoc = (data, id = 'test-id') => {
  return {
    id,
    exists: true,
    data: () => data,
    get: jest.fn().mockResolvedValue({
      id,
      exists: true,
      data: () => data,
    }),
  };
};

/**
 * Crear mock de snapshot de Firestore
 */
export const createMockSnapshot = (docs = []) => {
  return {
    empty: docs.length === 0,
    size: docs.length,
    docs,
    forEach: jest.fn((callback) => {
      docs.forEach(callback);
    }),
  };
};

/**
 * Crear request mock
 */
export const createMockRequest = (overrides = {}) => {
  return {
    user: {
      uid: 'test-user-id-123',
      email: 'test@example.com',
    },
    body: {},
    params: {},
    query: {},
    headers: {},
    ip: '127.0.0.1',
    method: 'GET',
    path: '/api/test',
    ...overrides,
  };
};

/**
 * Crear response mock
 */
export const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Crear next mock
 */
export const createMockNext = () => {
  return jest.fn();
};

/**
 * Limpiar todos los mocks
 */
export const clearAllMocks = () => {
  jest.clearAllMocks();
  mockAuth.verifyIdToken.mockClear();
  mockAuth.getUserByEmail.mockClear();
  mockAuth.createUser.mockClear();
  mockFirestore.collection.mockClear();
};

