# ✈️ Sistema de Gestión de Aeropuertos y Vuelos

Sistema frontend desarrollado en React + TypeScript que consume una API REST de Django para la gestión integral de aeropuertos, vuelos, pasajeros, tripulación y mantenimiento de aeronaves.

---

## 📋 Descripción

Aplicación web con arquitectura de capas que implementa:

### Interfaces
- **Parte Pública**: Home, Login y Registro (sin autenticación)
- **Parte Privada**: Panel administrativo con autenticación JWT y control de roles

### Módulos Implementados
| Módulo | Funcionalidad |
|--------|---------------|
| **Pasajeros** | CRUD completo con gestión de información personal |
| **Aeropuertos** | CRUD completo (código IATA, ciudad, país, zona horaria) |
| **Aerolíneas** | CRUD completo (código IATA, país, contacto) |
| **Tripulación** | CRUD completo (pilotos, copilotos, auxiliares, ingenieros) |
| **Mantenimiento** | CRUD completo (rutinario, inspección, reparación, revisión) |
| **Vuelos** | Visualización de rutas y horarios |
| **Reservas** | Gestión y seguimiento de bookings |

---

## 🛠️ Stack Tecnológico

- **React 18** + **TypeScript**
- **Vite 6.4.1** (build tool y dev server)
- **React Router DOM** (enrutamiento)
- **Axios** (cliente HTTP)
- **TailwindCSS** (estilos)
- **JWT Decode** (autenticación)

---

## 🚀 Instalación y Ejecución

### Requisitos
- Node.js v18+
- npm v9+

### Comandos

bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Producción
npm run build
npm run preview

# Linting
npm run lint


La aplicación se ejecutará en: `http://localhost:5173`

---

## 📁 Arquitectura del Proyecto

```
src/
├── application/       # Servicios y lógica de negocio
├── domain/           # Tipos y modelos
├── infrastructure/   # HTTP clients y storage
├── presentation/     # UI components, layouts y páginas
└── utils/           # Helpers y constantes
```

---

## 🔐 Autenticación y Roles

### Sistema de Control de Acceso (RBAC)
| Rol | Permisos |
|-----|----------|
| **ADMIN** | Crear, editar, eliminar y visualizar todo |
| **EDITOR** | Crear y editar (sin eliminación) |
| **OPERADOR** | Visualizar y actualizar estados |
| **CLIENTE** | Solo visualización limitada |

### Funcionalidades por Rol
Cada módulo controla visibilidad de acciones según permisos:
- **Ver**: Disponible para todos
- **Crear/Editar**: Admin y Editor
- **Eliminar**: Solo Admin

---

## 🌐 API Backend

**URL**: `https://vuelos-api.desarrollo-software.xyz`

### Endpoints Utilizados
- `/api/auth/jwt/login/` - Autenticación
- `/api/auth/jwt/refresh/` - Renovación de token
- `/api/passengers/` - CRUD Pasajeros
- `/api/airports/` - CRUD Aeropuertos
- `/api/airlines/` - CRUD Aerolíneas
- `/api/crew/` - CRUD Tripulación
- `/api/maintenance/` - CRUD Mantenimiento
- `/api/flights/` - Listado de vuelos
- `/api/bookings/` - Gestión de reservas

---

## ✅ Funcionalidades Implementadas

### Autenticación
- [x] Login con JWT
- [x] Almacenamiento seguro de tokens
- [x] Rutas protegidas
- [x] Logout con limpieza de sesión
- [x] Interceptor Axios para tokens

### CRUD Completo (Pasajeros, Aerolíneas, Aeropuertos, Tripulación, Mantenimiento)
- [x] Listado con datos del API
- [x] Crear con validación de formularios
- [x] Ver detalles en modal
- [x] Editar registros existentes
- [x] Eliminar con confirmación
- [x] Control de permisos por rol
- [x] Manejo de estados de carga
- [x] Mensajes de éxito/error

### Dashboard
- [x] Vista por rol (Admin/Cliente)
- [x] Navegación con sidebar
- [x] Restricción de módulos según permisos

---

## 📸 Validaciones y Detalles

### Pasajeros
- Información personal completa
- Tipo y número de documento
- Nacionalidad y fecha de nacimiento

### Aerolíneas
- Código IATA (2 caracteres, mayúsculas)
- Email y teléfono de contacto
- País de origen

### Aeropuertos
- Código IATA (3 caracteres, mayúsculas)
- Ciudad, país y zona horaria

### Tripulación
- Posiciones: Piloto, Copiloto, Auxiliar, Ingeniero
- Estados: Activo/Inactivo
- Licencia y fecha de contratación

### Mantenimiento
- Tipos: Rutinario, Inspección, Reparación, Revisión Mayor
- Estados: Programado, En Progreso, Completado
- Fechas y técnico asignado

---

## 👥 Credenciales de Prueba

Usuario Administrador:
admin / admin
Rol: ADMIN

Usuario Cliente:
(Credenciales según configuración)
Rol: CLIENTE

---

## 📌 Notas

- El backend detecta ADMIN cuando `user_id === 1`
- Módulos no disponibles: Catálogo, Facturas, Almacenes, Usuarios (endpoints sin desplegar)
- Todos los módulos CRUD incluyen botón "Ver" para visualización de detalles completos

**Última actualización**: Enero 2026  
**Deploy Frontend**: https://torres-billing-ui.desarrollo-software.xyz

