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

**URL:** `http://localhost:3000/docs`

Puedes ver todos los endpoints, probarlos directamente desde el navegador y ver ejemplos de requests y responses.

### Endpoints Principales

#### Autenticación (`/api/auth`)

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil del usuario autenticado
- `GET /api/auth/balance` - Obtener balance de puntos del usuario

#### Consumo (`/api/consumption`)

- `POST /api/consumption` - Registrar consumo de agua
- `GET /api/consumption/sessions/today` - Obtener sesión de consumo del día actual
- `GET /api/consumption/sessions/:date` - Obtener sesión por fecha específica
- `PUT /api/consumption/details/:sessionId/:detailId` - Actualizar detalle de consumo
- `DELETE /api/consumption/details/:sessionId/:detailId` - Eliminar detalle de consumo
- `GET /api/consumption/history` - Obtener historial de consumo
- `GET /api/consumption/statistics` - Obtener estadísticas de consumo
- `GET /api/consumption/items` - Listar items de consumo disponibles
- `GET /api/consumption/items/:itemId` - Obtener item de consumo por ID
- `GET /api/consumption/items/category/:categoryId` - Items de consumo por categoría
- `GET /api/consumption/categories` - Listar categorías de consumo
- `GET /api/consumption/categories/:categoryId` - Obtener categoría por ID

#### Metas (`/api/goals`)

- `GET /api/goals` - Obtener metas del usuario (diaria y mensual)
- `PUT /api/goals` - Actualizar metas del usuario
- `GET /api/goals/progress` - Obtener progreso de metas

#### Personalización de Perfil (`/api/profile`)

- `GET /api/profile/avatars` - Obtener avatares disponibles
- `GET /api/profile/nicknames` - Obtener nicknames disponibles
- `PUT /api/profile/avatar` - Aplicar avatar al perfil
- `PUT /api/profile/nickname` - Aplicar nickname al perfil
- `GET /api/profile/inventory` - Obtener inventario del usuario

#### Familia/Hogar (`/api/household`)

- `POST /api/household` - Crear una nueva familia
- `POST /api/household/join` - Unirse a una familia usando código de invitación
- `GET /api/household` - Obtener información de mi familia
- `POST /api/household/leave` - Salir de la familia
- `DELETE /api/household/:householdId` - Eliminar familia (solo admin)
- `PUT /api/household/:householdId` - Actualizar información de la familia (solo admin)
- `GET /api/household/:householdId/invite-code` - Obtener código de invitación
- `PUT /api/household/:householdId/members/:targetUserId/role` - Asignar rol a miembro (solo admin)
- `DELETE /api/household/:householdId/members/:targetUserId` - Remover miembro (solo admin)
- `GET /api/household/:householdId/consumption/daily` - Consumo diario de la familia
- `GET /api/household/:householdId/consumption/history` - Historial de consumo familiar
- `GET /api/household/:householdId/statistics` - Estadísticas generales de la familia
- `GET /api/household/:householdId/consumption/by-member` - Consumo por miembro

#### Tienda (`/api/store`)

- `GET /api/store/categories` - Listar categorías de tienda
- `GET /api/store/categories/:categoryId` - Obtener categoría por ID
- `GET /api/store/items` - Listar todos los items de tienda
- `GET /api/store/items/:itemId` - Obtener item por ID
- `GET /api/store/items/category/:categoryId` - Items por categoría
- `POST /api/store/purchase` - Comprar un item de la tienda
- `GET /api/store/inventory` - Obtener inventario completo del usuario
- `GET /api/store/inventory/:itemId` - Verificar si el usuario tiene un item específico

#### Salud del Servidor

- `GET /health` - Verificar estado del servidor

## Documentación Adicional

- [SETUP.md](./SETUP.md) - Guía detallada de configuración e instalación
- [FIRESTORE_STRUCTURE.md](./FIRESTORE_STRUCTURE.md) - Estructura completa de la base de datos Firestore

## Tecnologías

- **Express.js** - Framework web para Node.js
- **Firebase Admin SDK** - SDK para interactuar con Firebase
- **Firestore** - Base de datos NoSQL
- **JWT** - Autenticación basada en tokens
- **bcryptjs** - Hash de contraseñas
- **Swagger/OpenAPI** - Documentación interactiva de API
- **express-validator** - Validación de requests

## Notas Importantes

- Todas las rutas (excepto `/health`, `/api/auth/register` y `/api/auth/login`) requieren autenticación mediante token Bearer
- El token se debe enviar en el header: `Authorization: Bearer <token>`
- Los consumos solo se pueden modificar el día actual
- Un usuario solo puede pertenecer a una familia a la vez
- Los items de tienda con `default: true` son gratuitos y se agregan automáticamente al inventario

