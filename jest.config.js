/**
 * Configuración de Jest para ES Modules
 */

export default {
  // Entorno de testing
  testEnvironment: 'node',
  
  // Extensión de archivos de test
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  
  // Directorios a buscar
  roots: ['<rootDir>/src'],
  
  // Transformaciones (no necesarias para ES modules con experimental-vm-modules)
  transform: {},
  
  // Extensión de módulos
  moduleFileExtensions: ['js', 'json'],
  
  // Mocks y setup
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.js'],
  
  // Cobertura
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/__tests__/**',
    '!src/server.js',
    '!src/config/swagger.js',
  ],
  
  // Directorios a ignorar
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Variables de entorno para testing
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  
  // Verbose
  verbose: true,
  
  // Clear mocks entre tests
  clearMocks: true,
  
  // Restore mocks
  restoreMocks: true,
};

