# 📋 Endpoints Faltantes - Análisis Completo

## 📊 Resumen de Endpoints Existentes

### ✅ Endpoints Implementados (61 endpoints)

#### **Autenticación** (`/api/auth`) - 4 endpoints
- ✅ `POST /api/auth/register` - Registrar usuario
- ✅ `POST /api/auth/login` - Iniciar sesión
- ✅ `GET /api/auth/profile` - Obtener perfil
- ✅ `GET /api/auth/balance` - Obtener balance

#### **Consumo** (`/api/consumption`) - 12 endpoints
- ✅ `POST /api/consumption` - Registrar consumo
- ✅ `GET /api/consumption/sessions/today` - Sesión de hoy
- ✅ `GET /api/consumption/sessions/:date` - Sesión por fecha
- ✅ `PUT /api/consumption/details/:sessionId/:detailId` - Actualizar detalle
- ✅ `DELETE /api/consumption/details/:sessionId/:detailId` - Eliminar detalle
- ✅ `GET /api/consumption/history` - Historial de consumo
- ✅ `GET /api/consumption/statistics` - Estadísticas
- ✅ `GET /api/consumption/items` - Listar items
- ✅ `GET /api/consumption/items/:itemId` - Obtener item
- ✅ `GET /api/consumption/items/category/:categoryId` - Items por categoría
- ✅ `GET /api/consumption/categories` - Listar categorías
- ✅ `GET /api/consumption/categories/:categoryId` - Obtener categoría

#### **Metas** (`/api/goals`) - 3 endpoints
- ✅ `GET /api/goals` - Obtener metas
- ✅ `PUT /api/goals` - Actualizar metas
- ✅ `GET /api/goals/progress` - Progreso de metas

#### **Personalización de Perfil** (`/api/profile`) - 5 endpoints
- ✅ `GET /api/profile/avatars` - Listar avatares
- ✅ `GET /api/profile/nicknames` - Listar nicknames
- ✅ `PUT /api/profile/avatar` - Aplicar avatar
- ✅ `PUT /api/profile/nickname` - Aplicar nickname
- ✅ `GET /api/profile/inventory` - Obtener inventario

#### **Familia/Hogar** (`/api/household`) - 13 endpoints
- ✅ `POST /api/household` - Crear familia
- ✅ `POST /api/household/join` - Unirse a familia
- ✅ `GET /api/household` - Obtener mi familia
- ✅ `POST /api/household/leave` - Salir de familia
- ✅ `DELETE /api/household/:householdId` - Eliminar familia
- ✅ `PUT /api/household/:householdId` - Actualizar familia
- ✅ `GET /api/household/:householdId/invite-code` - Obtener código
- ✅ `PUT /api/household/:householdId/members/:targetUserId/role` - Asignar rol
- ✅ `DELETE /api/household/:householdId/members/:targetUserId` - Remover miembro
- ✅ `GET /api/household/:householdId/consumption/daily` - Consumo diario familiar
- ✅ `GET /api/household/:householdId/consumption/history` - Historial familiar
- ✅ `GET /api/household/:householdId/statistics` - Estadísticas familiares
- ✅ `GET /api/household/:householdId/consumption/by-member` - Consumo por miembro

#### **Tienda** (`/api/store`) - 10 endpoints
- ✅ `GET /api/store/categories` - Listar categorías de tienda
- ✅ `GET /api/store/categories/:categoryId` - Obtener categoría por ID
- ✅ `GET /api/store/items` - Listar todos los items de tienda
- ✅ `GET /api/store/items/:itemId` - Obtener item por ID
- ✅ `GET /api/store/items/category/:categoryId` - Items por categoría
- ✅ `GET /api/store/items/featured` - Items destacados
- ✅ `POST /api/store/purchase` - Comprar un item de la tienda
- ✅ `GET /api/store/inventory` - Obtener inventario completo del usuario
- ✅ `GET /api/store/inventory/:itemId` - Verificar si tiene un item específico
- ✅ `GET /api/store/wallet/transactions` - Historial de transacciones
- ✅ `POST /api/store/wallet/add-points` - Agregar puntos (admin/testing)

#### **Gestión de Usuario** (`/api/users`) - 6 endpoints
- ✅ `PUT /api/users/profile` - Actualizar perfil (nombre)
- ✅ `PUT /api/users/password` - Cambiar contraseña
- ✅ `DELETE /api/users/account` - Eliminar cuenta
- ✅ `GET /api/users/activity` - Actividad reciente del usuario
- ✅ `GET /api/users/settings` - Obtener configuración del usuario
- ✅ `PUT /api/users/settings` - Actualizar configuración

#### **Logros** (`/api/achievements`) - 7 endpoints
- ✅ `GET /api/achievements` - Listar todos los logros disponibles
- ✅ `GET /api/achievements/:achievementId` - Obtener logro por ID
- ✅ `GET /api/achievements/category/:category` - Logros por categoría
- ✅ `GET /api/achievements/my-achievements` - Logros desbloqueados por el usuario
- ✅ `GET /api/achievements/progress` - Progreso de logros (cuáles están cerca)
- ✅ `POST /api/achievements/:achievementId/claim` - Reclamar recompensa de logro
- ✅ `POST /api/achievements/evaluate` - Forzar evaluación de logros (admin/testing)

#### **Recomendaciones** (`/api/recommendations`) - 6 endpoints
- ✅ `GET /api/recommendations` - Obtener recomendaciones del usuario
- ✅ `GET /api/recommendations/:recommendationId` - Obtener recomendación específica
- ✅ `POST /api/recommendations/:recommendationId/read` - Marcar como leída
- ✅ `DELETE /api/recommendations/:recommendationId` - Eliminar recomendación
- ✅ `GET /api/recommendations/unread` - Recomendaciones no leídas
- ✅ `POST /api/recommendations/generate` - Generar recomendaciones (admin/testing)

#### **Health** - 1 endpoint
- ✅ `GET /health` - Estado del servidor

---

## ❌ Endpoints Faltantes (15 endpoints)

---

### 📊 **1. ESTRATO (Stratum)** - `/api/stratum`

**Nota:** El estrato está en el modelo de usuario pero no hay endpoints para gestionarlo.

**Endpoints necesarios:**

- ❌ `GET /api/stratum` - Obtener estrato actual del usuario
- ❌ `PUT /api/stratum` - Actualizar estrato del usuario
  - Body: `{ stratum: number (1-6) }`
  - Validación: solo valores 1-6
  - Debe registrar historial de cambios
- ❌ `GET /api/stratum/history` - Historial de cambios de estrato
- ❌ `GET /api/stratum/rates` - Obtener tarifas por estrato (información pública)

**Total: 4 endpoints**

---

### ⚙️ **2. CONFIGURACIÓN DE USUARIO (Setup Items)** - `/api/setup`

**Modelos existentes:**
- `UserSetupItemModel` ✅

**Endpoints necesarios:**

- ❌ `GET /api/setup/items` - Obtener items de configuración del usuario
- ❌ `POST /api/setup/items` - Agregar/actualizar item de configuración
  - Body: `{ consumptionItemId: string, hasItem: boolean }`
- ❌ `PUT /api/setup/items/:itemId` - Actualizar item de configuración
- ❌ `DELETE /api/setup/items/:itemId` - Eliminar item de configuración

**Total: 4 endpoints**

---

### 🔔 **3. NOTIFICACIONES** - `/api/notifications`

**Modelos existentes:**
- ❌ No existe modelo (necesita ser creado)

**Endpoints sugeridos:**

- ❌ `GET /api/notifications` - Obtener notificaciones del usuario
  - Query params: `unreadOnly`, `limit`, `type`
- ❌ `GET /api/notifications/unread` - Notificaciones no leídas
- ❌ `PUT /api/notifications/:notificationId/read` - Marcar como leída
- ❌ `DELETE /api/notifications/:notificationId` - Eliminar notificación
- ❌ `PUT /api/notifications/read-all` - Marcar todas como leídas

**Total: 5 endpoints**

**Nota:** Requiere crear `NotificationModel` primero.

---

### 📈 **4. ESTADÍSTICAS AVANZADAS** - `/api/statistics`

**Endpoints adicionales que podrían ser útiles:**

- ❌ `GET /api/statistics/comparison` - Comparar consumo entre períodos
  - Query params: `period1`, `period2`, `type` (daily/monthly/yearly)
- ❌ `GET /api/statistics/trends` - Tendencias de consumo
  - Query params: `period`, `metric` (liters/cost)
- ❌ `GET /api/statistics/predictions` - Predicciones de consumo futuro
  - Query params: `days`, `basedOn` (lastWeek/lastMonth)
- ❌ `GET /api/statistics/export` - Exportar datos en CSV/Excel
  - Query params: `format` (csv/excel), `startDate`, `endDate`

**Total: 4 endpoints**

---

## 🎯 Prioridades de Implementación

### **🔴 Alta Prioridad (Funcionalidad Core)**

1. **Estrato (Stratum)**
   - `GET /api/stratum` - Obtener estrato
   - `PUT /api/stratum` - Actualizar estrato
   - `GET /api/stratum/history` - Historial
   - `GET /api/stratum/rates` - Tarifas
   - **Razón:** El estrato se usa para calcular costos pero no se puede actualizar desde la API

2. ~~**Recomendaciones**~~ ✅ **COMPLETADO**
   - ✅ `GET /api/recommendations` - Ver recomendaciones
   - ✅ `POST /api/recommendations/:id/read` - Marcar como leída
   - ✅ `GET /api/recommendations/unread` - No leídas
   - ✅ Generación automática de recomendaciones

### **🟡 Media Prioridad (Mejoras UX)**

3. **Setup Items**
   - `GET /api/setup/items` - Ver configuración
   - `POST /api/setup/items` - Configurar items
   - **Razón:** El modelo existe, permite personalizar qué items de consumo tiene el usuario

4. **Notificaciones**
   - Sistema básico de notificaciones
   - **Razón:** Mejora la experiencia del usuario

### **🟢 Baja Prioridad (Nice to Have)**

5. **Estadísticas Avanzadas**
   - Comparaciones, tendencias, predicciones
   - Exportación de datos
   - **Razón:** Funcionalidades avanzadas para análisis profundo

---

## 📊 Resumen de Endpoints Faltantes por Categoría

| Categoría | Endpoints Faltantes | Prioridad | Estado |
|-----------|---------------------|-----------|--------|
| **Estrato** | 4 endpoints | 🔴 Alta | ❌ Pendiente |
| ~~**Recomendaciones**~~ | ~~6 endpoints~~ → 0 | ~~🔴 Alta~~ | ✅ **COMPLETADO** |
| **Setup Items** | 4 endpoints | 🟡 Media | ❌ Pendiente |
| **Notificaciones** | 5 endpoints | 🟡 Media | ❌ Pendiente |
| **Estadísticas Avanzadas** | 4 endpoints | 🟢 Baja | ❌ Pendiente |
| **TOTAL** | **15 endpoints** | | |

---

## 📝 Notas Importantes

1. **Estrato**: El estrato se usa para calcular costos en múltiples servicios, pero no hay forma de que el usuario lo actualice desde la API. Es crítico implementarlo.

2. **Recomendaciones**: El modelo `UserRecommendationModel` existe y tiene todos los métodos necesarios. Solo faltan los endpoints y la lógica de generación automática.

3. **Setup Items**: El modelo `UserSetupItemModel` existe. Permite al usuario configurar qué items de consumo tiene en su hogar (ej: tiene ducha, tiene lavadora, etc.).

4. **Notificaciones**: No existe modelo. Se necesita crear `NotificationModel` antes de implementar los endpoints.

5. **Estadísticas Avanzadas**: Son funcionalidades adicionales que mejoran el análisis pero no son críticas para el funcionamiento básico.

---

## 🚀 Estado Actual del Proyecto

**Endpoints Implementados:** 67  
**Endpoints Faltantes:** 15  
**Progreso:** ~82% completado

### ✅ Completado:
- Autenticación
- Consumo
- Metas
- Personalización de Perfil
- Familia/Hogar
- Tienda
- Gestión de Usuario
- Logros
- Recomendaciones

### ❌ Pendiente:
- Estrato (Alta prioridad)
- Setup Items (Media prioridad)
- Notificaciones (Media prioridad)
- Estadísticas Avanzadas (Baja prioridad)

---

**Última actualización:** 
- ✅ Recomendaciones completadas (6 endpoints implementados)
  - Listar y obtener recomendaciones
  - Marcar como leída, eliminar
  - Recomendaciones no leídas
  - Generación automática basada en consumo y metas
- Análisis basado en modelos y rutas existentes en el código.

