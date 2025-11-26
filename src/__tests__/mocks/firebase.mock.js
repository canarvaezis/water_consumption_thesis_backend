/**
 * Mocks para Firebase Admin SDK
 * Simula las funciones de Firebase para testing
 */

import { jest } from '@jest/globals';

// Mock de Firestore
export const mockFirestore = {
  collection: jest.fn((collectionName) => ({
    doc: jest.fn((docId) => ({
      get: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      collection: jest.fn((subCollection) => ({
        add: jest.fn(),
        doc: jest.fn((subDocId) => ({
          get: jest.fn(),
          set: jest.fn(),
          update: jest.fn(),
          delete: jest.fn(),
        })),
        where: jest.fn(() => ({
          get: jest.fn(),
          limit: jest.fn(() => ({
            get: jest.fn(),
          })),
        })),
        get: jest.fn(),
      })),
    })),
    add: jest.fn(),
    where: jest.fn(() => ({
      get: jest.fn(),
      limit: jest.fn(() => ({
        get: jest.fn(),
      })),
    })),
    get: jest.fn(),
  })),
  settings: jest.fn(),
};

// Mock de Firebase Auth
export const mockAuth = {
  verifyIdToken: jest.fn(),
  createUser: jest.fn(),
  getUserByEmail: jest.fn(),
  deleteUser: jest.fn(),
  updateUser: jest.fn(),
};

// Mock de Firebase Admin
export const mockAdmin = {
  firestore: () => mockFirestore,
  auth: () => mockAuth,
  apps: {
    length: 0,
  },
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn(),
  },
};

// Datos de prueba
export const mockUser = {
  uid: 'test-user-id-123',
  email: 'test@example.com',
  name: 'Test User',
  nickname: null,
  avatarUrl: null,
  stratum: 3,
  dailyGoal: null,
  monthlyGoal: null,
  createdAt: { toDate: () => new Date('2024-01-01') },
  updatedAt: { toDate: () => new Date('2024-01-01') },
};

export const mockDecodedToken = {
  uid: 'test-user-id-123',
  email: 'test@example.com',
  email_verified: true,
};

export const mockWallet = {
  id: 'wallet-id-123',
  userId: 'test-user-id-123',
  balance: 100,
  createdAt: { toDate: () => new Date('2024-01-01') },
  updatedAt: { toDate: () => new Date('2024-01-01') },
};

