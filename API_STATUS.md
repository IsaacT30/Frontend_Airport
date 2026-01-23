# Estado de la API Backend

## API Desplegada

**URL:** https://vuelos-api.desarrollo-software.xyz

### Endpoints Disponibles ✅

#### Autenticación

- `POST /api/auth/jwt/login/` - Iniciar sesión (username + password)
- `POST /api/auth/jwt/refresh/` - Refrescar token

#### Airport API

- `GET/POST /api/airlines/` - Gestión de aerolíneas
- `GET/POST /api/airports/` - Gestión de aeropuertos
- `GET/POST /api/flights/` - Gestión de vuelos
- `GET/POST /api/passengers/` - Gestión de pasajeros
- `GET/POST /api/bookings/` - Gestión de reservas
- `GET/POST /api/crew/` - Gestión de tripulación
- `GET/POST /api/maintenance/` - Gestión de mantenimiento

### Endpoints NO Disponibles ❌

#### Billing/Flights API (No desplegada)

- ❌ `/api/catalog/` - Catálogo de productos
- ❌ `/api/invoices/` - Facturas
- ❌ `/api/users/` - Usuarios (profile management)
- ❌ `/api/warehouses/` - Almacenes
- ❌ `/api/payments/` - Pagos

## Credenciales de Prueba

```
Username: admin
Password: admin
```

## Configuración Frontend

### Variables de Entorno (.env)

```
VITE_AIRPORT_API_URL=https://vuelos-api.desarrollo-software.xyz
VITE_BILLING_API_URL=https://vuelos-api.desarrollo-software.xyz
```

### Rutas Activas

- ✅ `/` - Home (público)
- ✅ `/login` - Login (público)
- ✅ `/register` - Registro (público, pero endpoint no disponible)
- ✅ `/dashboard` - Panel de control
- ✅ `/flights` - Gestión de vuelos
- ✅ `/bookings` - Reservas
- ✅ `/passengers` - Pasajeros
- ✅ `/airlines` - Aerolíneas (placeholder)
- ✅ `/airports` - Aeropuertos (placeholder)
- ✅ `/crew` - Tripulación (placeholder)
- ✅ `/maintenance` - Mantenimiento (placeholder)

### Rutas Deshabilitadas (Endpoints no disponibles)

- ❌ `/catalog` - Catálogo de productos
- ❌ `/invoices` - Facturas
- ❌ `/users` - Gestión de usuarios
- ❌ `/warehouses` - Almacenes

## Notas

1. **Solo existe Airport API desplegada**: El servidor solo tiene la API de aeropuerto, no la de billing/flights.

2. **Autenticación JWT**: El login funciona correctamente y retorna tokens `access` y `refresh`.

3. **Sin endpoint /me/**: No existe endpoint para obtener el usuario actual, por lo que se usa el username del login.

4. **Registro deshabilitado**: El endpoint de registro no está disponible en el servidor.

## Para Desarrolladores

Si necesitas habilitar los endpoints de Billing/Flights API:

1. Desplegar `billing_api` en el servidor
2. Actualizar `VITE_BILLING_API_URL` en `.env` con la URL correcta
3. Descomentar las rutas en `App.tsx`
4. Descomentar los imports de `CatalogPage` e `InvoicesPage`
