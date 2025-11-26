# Guía de Testing

Este proyecto incluye tests unitarios e integración para la API.

## Configuración

### Instalar dependencias

```bash
npm install
```

### Variables de entorno para testing

Crea un archivo `.env.test` (opcional, los tests usan valores por defecto):

```env
NODE_ENV=test
PORT=3001
CORS_ORIGIN=*
```

## Ejecutar Tests

### Todos los tests

```bash
npm test
```

### Tests en modo watch (desarrollo)

```bash
npm run test:watch
```

### Tests con cobertura

```bash
npm run test:coverage
```

## Estructura de Tests

```
src/
  __tests__/
    ├── integration/          # Tests de integración (endpoints completos)
    │   ├── auth.test.js
    │   └── health.test.js
    ├── unit/                 # Tests unitarios (funciones individuales)
    │   ├── middleware/
    │   └── utils/
    ├── mocks/                # Mocks y datos de prueba
    │   └── firebase.mock.js
    └── helpers/              # Funciones auxiliares
        └── testHelpers.js
```

## Tipos de Tests

### Tests de Integración

Prueban endpoints completos usando `supertest`:

```javascript
import request from 'supertest';
import app from '../../server.js';

describe('Auth API', () => {
  it('debería registrar un nuevo usuario', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'Pass123' })
      .expect(201);
    
    expect(response.body.success).toBe(true);
  });
});
```

### Tests Unitarios

Prueban funciones individuales:

```javascript
import { BadRequestError } from '../../../utils/errors.js';

describe('Error Classes', () => {
  it('debería crear error 400', () => {
    const error = new BadRequestError('Invalid request');
    expect(error.statusCode).toBe(400);
  });
});
```

## Mocks

### Firebase Mock

Los tests usan mocks de Firebase para evitar conexiones reales:

```javascript
import { mockAuth, mockFirestore } from '../mocks/firebase.mock.js';

// Configurar mock
mockAuth.verifyIdToken.mockResolvedValue({
  uid: 'test-user-id',
  email: 'test@example.com',
});
```

## Cobertura

El objetivo es mantener al menos 80% de cobertura:

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

## Mejores Prácticas

1. **Un test por caso de uso**: Cada test debe verificar un comportamiento específico
2. **Nombres descriptivos**: Usa nombres que describan qué se está probando
3. **Arrange-Act-Assert**: Organiza tus tests en estas tres secciones
4. **Limpieza**: Usa `beforeEach` para limpiar mocks entre tests
5. **Independencia**: Los tests no deben depender unos de otros

## Ejemplos

### Test de endpoint con autenticación

```javascript
it('debería obtener perfil con token válido', async () => {
  // Mock de autenticación
  mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);
  
  const response = await request(app)
    .get('/api/auth/profile')
    .set('Authorization', 'Bearer valid-token')
    .expect(200);
  
  expect(response.body.success).toBe(true);
});
```

### Test de validación

```javascript
it('debería retornar error 400 si faltan campos', async () => {
  const response = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test' })
    .expect(400);
  
  expect(response.body.errors).toBeDefined();
});
```

## Troubleshooting

### Error: "Cannot find module"

Asegúrate de que todas las dependencias estén instaladas:

```bash
npm install
```

### Tests fallan por Firebase

Los tests usan mocks, no necesitas configuración real de Firebase. Si fallan, verifica que los mocks estén configurados correctamente.

### Error con ES Modules

Asegúrate de usar la versión correcta de Node.js (v18+) y que el script de test use `--experimental-vm-modules`.

