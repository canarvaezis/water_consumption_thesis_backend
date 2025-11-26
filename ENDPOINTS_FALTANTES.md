# 📋 Endpoints Faltantes - Análisis Completo

## 📊 Resumen de Endpoints Existentes

### ✅ Endpoints Implementados

#### **Autenticación** (`/api/auth`)
- ✅ `POST /api/auth/register` - Registrar usuario
- ✅ `POST /api/auth/login` - Iniciar sesión
- ✅ `GET /api/auth/profile` - Obtener perfil
- ✅ `GET /api/auth/balance` - Obtener balance

#### **Consumo** (`/api/consumption`)
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

#### **Metas** (`/api/goals`)
- ✅ `GET /api/goals` - Obtener metas
- ✅ `PUT /api/goals` - Actualizar metas
- ✅ `GET /api/goals/progress` - Progreso de metas

#### **Personalización de Perfil** (`/api/profile`)
- ✅ `GET /api/profile/avatars` - Listar avatares
- ✅ `GET /api/profile/nicknames` - Listar nicknames
- ✅ `PUT /api/profile/avatar` - Aplicar avatar
- ✅ `PUT /api/profile/nickname` - Aplicar nickname
- ✅ `GET /api/profile/inventory` - Obtener inventario

#### **Familia/Hogar** (`/api/household`)
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

#### **Tienda** (`/api/store`)
- ✅ `GET /api/store/categories` - Listar categorías de tienda
- ✅ `GET /api/store/categories/:categoryId` - Obtener categoría por ID
- ✅ `GET /api/store/items` - Listar todos los items de tienda
- ✅ `GET /api/store/items/:itemId` - Obtener item por ID
- ✅ `GET /api/store/items/category/:categoryId` - Items por categoría
- ✅ `POST /api/store/purchase` - Comprar un item de la tienda
- ✅ `GET /api/store/inventory` - Obtener inventario completo del usuario
- ✅ `GET /api/store/inventory/:itemId` - Verificar si tiene un item específico

#### **Health**
- ✅ `GET /health` - Estado del servidor

---

## ❌ Endpoints Faltantes

### 🛒 **1. TIENDA (Store/Shop)** - `/api/store`

**Modelos existentes:**
- `StoreItemModel` ✅
- `StoreCategoryModel` ✅
- `InventoryModel` ✅
- `WalletModel` ✅

**Endpoints pendientes (opcionales):**

#### **Billetera (Wallet) - Opcionales**
- ❌ `GET /api/store/wallet/transactions` - Historial de transacciones
- ❌ `POST /api/store/wallet/add-points` - Agregar puntos (admin/testing)
- ✅ `GET /api/store/wallet/balance` - Ya existe en `/api/auth/balance`

#### **Items Destacados (Opcional)**
- ❌ `GET /api/store/items/featured` - Items destacados

---

### 🏆 **2. LOGROS (Achievements)** - `/api/achievements`

**Modelos existentes:**
- `AchievementModel` ✅
- `UserAchievementModel` ✅

**Endpoints necesarios:**

#### **Logros Disponibles**
- ❌ `GET /api/achievements` - Listar todos los logros disponibles
- ❌ `GET /api/achievements/:achievementId` - Obtener logro por ID
- ❌ `GET /api/achievements/category/:category` - Logros por categoría

#### **Logros del Usuario**
- ❌ `GET /api/achievements/my-achievements` - Logros desbloqueados por el usuario
- ❌ `GET /api/achievements/progress` - Progreso de logros (cuáles están cerca)
- ❌ `POST /api/achievements/:achievementId/claim` - Reclamar recompensa de logro

#### **Evaluación Automática**
- ⚠️ Nota: La evaluación de logros debería ser automática al registrar consumo, pero podría necesitar:
- ❌ `POST /api/achievements/evaluate` - Forzar evaluación de logros (admin/testing)

---

### 💡 **3. RECOMENDACIONES** - `/api/recommendations`

**Modelos existentes:**
- `UserRecommendationModel` ✅

**Endpoints necesarios:**

- ❌ `GET /api/recommendations` - Obtener recomendaciones del usuario
- ❌ `GET /api/recommendations/:recommendationId` - Obtener recomendación específica
- ❌ `POST /api/recommendations/:recommendationId/read` - Marcar como leída
- ❌ `DELETE /api/recommendations/:recommendationId` - Eliminar recomendación
- ❌ `GET /api/recommendations/unread` - Recomendaciones no leídas
- ⚠️ Nota: La generación de recomendaciones debería ser automática, pero podría necesitar:
- ❌ `POST /api/recommendations/generate` - Generar recomendaciones (admin/testing)

---

### ⚙️ **4. CONFIGURACIÓN DE USUARIO (Setup Items)** - `/api/setup`

**Modelos existentes:**
- `UserSetupItemModel` ✅

**Endpoints necesarios:**

- ❌ `GET /api/setup/items` - Obtener items de configuración del usuario
- ❌ `POST /api/setup/items` - Agregar item de configuración
- ❌ `PUT /api/setup/items/:itemId` - Actualizar item de configuración
- ❌ `DELETE /api/setup/items/:itemId` - Eliminar item de configuración

---

### 📊 **5. ESTRATO (Stratum)** - `/api/stratum`

**Nota:** El estrato está en el modelo de usuario pero no hay endpoints para gestionarlo.

**Endpoints necesarios:**

- ❌ `GET /api/stratum` - Obtener estrato actual del usuario
- ❌ `PUT /api/stratum` - Actualizar estrato del usuario
  - Body: `{ stratum: number (1-6) }`
  - Validación: solo valores 1-6
- ❌ `GET /api/stratum/history` - Historial de cambios de estrato
- ❌ `GET /api/stratum/rates` - Obtener tarifas por estrato (información pública)

---

### 📈 **6. ESTADÍSTICAS AVANZADAS** - `/api/statistics`

**Endpoints adicionales que podrían ser útiles:**

- ❌ `GET /api/statistics/comparison` - Comparar consumo entre períodos
- ❌ `GET /api/statistics/trends` - Tendencias de consumo
- ❌ `GET /api/statistics/predictions` - Predicciones de consumo futuro
- ❌ `GET /api/statistics/export` - Exportar datos en CSV/Excel

---

### 🔔 **7. NOTIFICACIONES** - `/api/notifications`

**Endpoints sugeridos:**

- ❌ `GET /api/notifications` - Obtener notificaciones del usuario
- ❌ `GET /api/notifications/unread` - Notificaciones no leídas
- ❌ `PUT /api/notifications/:notificationId/read` - Marcar como leída
- ❌ `DELETE /api/notifications/:notificationId` - Eliminar notificación
- ❌ `PUT /api/notifications/read-all` - Marcar todas como leídas

---

### 👤 **8. GESTIÓN DE USUARIO** - `/api/users`

**Endpoints adicionales:**

- ❌ `PUT /api/users/profile` - Actualizar perfil (nombre, email, etc.)
- ❌ `PUT /api/users/password` - Cambiar contraseña
- ❌ `DELETE /api/users/account` - Eliminar cuenta
- ❌ `GET /api/users/activity` - Actividad reciente del usuario
- ❌ `GET /api/users/settings` - Obtener configuración del usuario
- ❌ `PUT /api/users/settings` - Actualizar configuración

---

## 🎯 Prioridades de Implementación

### **🔴 Alta Prioridad (Funcionalidad Core)**

1. ~~**Tienda (Store)**~~ ✅ **COMPLETADO**
   - ✅ `GET /api/store/items` - Listar items
   - ✅ `POST /api/store/purchase` - Comprar items
   - ✅ `GET /api/store/inventory` - Ver inventario

2. **Logros (Achievements)**
   - `GET /api/achievements` - Listar logros
   - `GET /api/achievements/my-achievements` - Logros del usuario
   - Evaluación automática al registrar consumo

3. **Estrato**
   - `GET /api/stratum` - Obtener estrato
   - `PUT /api/stratum` - Actualizar estrato

### **🟡 Media Prioridad (Mejoras UX)**

4. **Recomendaciones**
   - `GET /api/recommendations` - Ver recomendaciones
   - Generación automática basada en consumo

5. **Notificaciones**
   - `GET /api/notifications` - Ver notificaciones
   - Sistema básico de notificaciones

### **🟢 Baja Prioridad (Nice to Have)**

6. **Estadísticas Avanzadas**
   - Comparaciones, tendencias, predicciones

7. **Setup Items**
   - Gestión de configuración avanzada

8. **Gestión de Usuario Avanzada**
   - Actualización de perfil, configuración

---

## 📝 Notas Importantes

1. **Evaluación Automática**: Los logros y recomendaciones deberían evaluarse automáticamente cuando se registra consumo, no necesariamente requieren endpoints manuales.

2. **Sistema de Puntos**: El sistema de puntos ya está parcialmente implementado (wallet), pero falta la lógica de:
   - Ganar puntos por completar misiones/logros
   - Gastar puntos en la tienda
   - Historial de transacciones

3. **Estrato**: El estrato se usa para calcular costos, pero no hay forma de que el usuario lo actualice desde la API.

4. ~~**Tienda**~~: ✅ **COMPLETADO** - Todos los endpoints principales están implementados:
   - ✅ Endpoints para listar items y categorías
   - ✅ Endpoint para comprar items
   - ✅ Gestión de inventario
   - ⚠️ Pendiente: Historial de transacciones (opcional)

5. **Logros**: Los modelos existen pero no hay endpoints ni lógica de evaluación.

---

## 🚀 Resumen de Endpoints Faltantes por Categoría

| Categoría | Endpoints Faltantes | Prioridad | Estado |
|-----------|---------------------|-----------|--------|
| ~~**Tienda**~~ | ~~8 endpoints~~ → 2 opcionales | ~~🔴 Alta~~ | ✅ **COMPLETADO** |
| **Logros** | 5 endpoints | 🔴 Alta | ❌ Pendiente |
| **Estrato** | 3 endpoints | 🔴 Alta | ❌ Pendiente |
| **Recomendaciones** | 5 endpoints | 🟡 Media | ❌ Pendiente |
| **Notificaciones** | 5 endpoints | 🟡 Media | ❌ Pendiente |
| **Setup Items** | 4 endpoints | 🟢 Baja | ❌ Pendiente |
| **Estadísticas Avanzadas** | 4 endpoints | 🟢 Baja | ❌ Pendiente |
| **Gestión Usuario** | 5 endpoints | 🟢 Baja | ❌ Pendiente |
| **TOTAL** | **31 endpoints** (2 opcionales de tienda) | | |

---

**Última actualización:** 
- ✅ Tienda completada (8 endpoints principales implementados)
- Análisis basado en modelos y servicios existentes en el código.

