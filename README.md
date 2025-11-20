# Water Consumption Backend

Backend para sistema de gestión de consumo de agua desarrollado con Express.js y Firebase Firestore.

## Características

- Autenticación de usuarios
- Gestión de hogares y miembros
- Registro de consumo de agua
- Sistema de puntos y recompensas
- Tienda virtual
- Reportes y análisis de consumo
- Recomendaciones personalizadas

## Estructura del Proyecto

```
water_consumption_thesis/
├── src/
│   ├── config/
│   │   └── firebase.js          # Configuración de Firebase
│   ├── controllers/             # Lógica de negocio
│   ├── middleware/              # Middleware personalizado
│   ├── models/                  # Modelos de datos (schemas)
│   ├── routes/                  # Rutas de la API
│   ├── utils/                   # Utilidades
│   └── server.js                # Punto de entrada
├── .env.example                 # Ejemplo de variables de entorno
├── .gitignore
├── package.json
└── README.md
```

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Configurar Firebase:
   - Crear un proyecto en Firebase Console
   - Generar una clave de cuenta de servicio
   - Agregar las credenciales en el archivo `.env`

5. Ejecutar el servidor:
```bash
npm run dev
```

## Estructura de Base de Datos (Firestore)

### Colecciones Principales

- `users` - Usuarios del sistema
- `households` - Hogares
- `wallets` - Billeteras de usuarios
- `storeItems` - Items de la tienda
- `storeCategories` - Categorías de la tienda
- `consumptionItems` - Items de consumo
- `consumptionCategories` - Categorías de consumo
- `consumptionSessions` - Sesiones de consumo
- `achievements` - Logros disponibles
- `userRecommendations` - Recomendaciones de usuarios

### Subcolecciones

- `users/{userId}/households` - Relación usuario-hogar
- `users/{userId}/wallet` - Billetera del usuario
- `users/{userId}/setupItems` - Items de configuración del usuario
- `users/{userId}/achievements` - Logros del usuario
- `users/{userId}/recommendations` - Recomendaciones del usuario
- `wallets/{walletId}/inventory` - Inventario de la billetera
- `consumptionSessions/{sessionId}/details` - Detalles de consumo

## API Endpoints

### Documentación Swagger

La documentación completa de la API está disponible en Swagger UI:

**URL:** `http://localhost:3000/api-docs`

Puedes ver todos los endpoints, probarlos directamente desde el navegador y ver ejemplos de requests y responses.

### Endpoints Principales

#### Autenticación

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil del usuario autenticado (requiere autenticación)

#### Salud del Servidor

- `GET /health` - Verificar estado del servidor

## Documentación Adicional

- [SETUP.md](./SETUP.md) - Guía detallada de configuración e instalación
- [FIRESTORE_STRUCTURE.md](./FIRESTORE_STRUCTURE.md) - Estructura completa de la base de datos Firestore

## Tecnologías

- Express.js
- Firebase Admin SDK
- Firestore
- JWT para autenticación
- bcryptjs para hash de contraseñas
- Swagger/OpenAPI para documentación de API

