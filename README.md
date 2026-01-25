# ✈️ Sistema de Gestión de Aeropuertos y Vuelos - Frontend

Sistema frontend desarrollado en ReactJS que consume una API REST de Django para la gestión integral de aeropuertos, vuelos, pasajeros, tripulación y mantenimiento de aeronaves.

## 📋 Descripción del Proyecto

Aplicación web completa con dos interfaces principales:
- **Parte Pública**: Accesible sin autenticación (Home, Login, Registro)
- **Parte Privada**: Panel de administración protegido con autenticación JWT y control de acceso basado en roles

## 🎯 Características Principales

### Autenticación y Seguridad
- ✅ Sistema de login con JWT (JSON Web Tokens)
- ✅ Almacenamiento seguro de tokens en localStorage
- ✅ Rutas protegidas con validación de autenticación
- ✅ Logout y limpieza de sesión
- ✅ Control de acceso basado en roles (RBAC)

### Control por Roles
El sistema implementa 4 niveles de roles con permisos diferenciados:

| Rol | Permisos |
|-----|----------|
| **ADMIN** | Acceso total: crear, editar, eliminar y visualizar todos los módulos |
| **EDITOR** | Crear y editar recursos, sin permisos de eliminación |
| **OPERADOR** | Visualizar y actualizar estados, sin crear ni eliminar |
| **CLIENTE** | Solo visualización de información limitada |

### Módulos Implementados

#### Módulos con CRUD Completo ✅
1. **Pasajeros** - Gestión completa de información de pasajeros
2. **Aeropuertos** - Administración de aeropuertos (código IATA, ciudad, país, zona horaria)
3. **Aerolíneas** - Gestión de aerolíneas (código IATA, país, contacto)
4. **Tripulación** - Administración de personal de vuelo (pilotos, copilotos, auxiliares, ingenieros)
5. **Mantenimiento** - Control de mantenimiento de aeronaves (rutinario, inspección, reparación, revisión mayor)

#### Módulos con Visualización
6. **Vuelos** - Listado de vuelos con origen/destino
7. **Reservas** - Gestión de bookings

#### Funcionalidades de los Módulos CRUD
Todos los módulos con CRUD completo incluyen:
- ✅ **Botón "Ver"**: Modal de visualización de detalles completos
- ✅ **Botón "Editar"**: Modificación de registros existentes
- ✅ **Botón "Eliminar"**: Eliminación con confirmación
- ✅ **Botón "Crear"**: Formularios modales con validación
- ✅ **Control por Roles**: Los botones se muestran según permisos del usuario

#### Módulos No Disponibles (Backend)
- Catálogo, Facturas, Almacenes, Usuarios (endpoints no desplegados)

## 🛠️ Tecnologías Utilizadas

- **React 18** - Biblioteca principal
- **TypeScript** - Tipado estático
- **Vite 6.4.1** - Build tool y dev server
- **React Router DOM** - Enrutamiento
- **Axios** - Cliente HTTP para consumo de API
- **TailwindCSS** - Framework de estilos
- **JWT Decode** - Decodificación de tokens

## 📦 Requisitos Previos

- Node.js v18 o superior
- npm v9 o superior
- Backend API ejecutándose en: `https://vuelos-api.desarrollo-software.xyz`

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone <URL_DEL_REPOSITORIO>
cd Frontend_Airport
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz del proyecto:
```env
VITE_AIRPORT_API_URL=https://vuelos-api.desarrollo-software.xyz
VITE_BILLING_API_URL=https://vuelos-api.desarrollo-software.xyz
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

## 📝 Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Genera build de producción
npm run preview      # Previsualiza build de producción

# Linting
npm run lint         # Ejecuta ESLint
```

## 🏗️ Estructura del Proyecto

```
src/
├── application/          # Capa de aplicación (servicios)
│   ├── airport-api/     # Servicios de API de aeropuerto
│   ├── auth/            # Servicios de autenticación
│   └── flights-api/     # Servicios de API de vuelos
├── domain/              # Tipos y modelos de dominio
│   ├── airport-api/     # Tipos de aeropuerto
│   ├── auth/            # Tipos de autenticación
│   └── flights-api/     # Tipos de vuelos
├── infrastructure/      # Capa de infraestructura
│   ├── http/           # Cliente HTTP (Axios)
│   └── storage/        # Almacenamiento (tokens)
├── presentation/        # Capa de presentación
│   ├── components/     # Componentes reutilizables
│   ├── layouts/        # Layouts públicos/privados
│   ├── pages/          # Páginas de la aplicación
│   │   ├── public/    # Páginas públicas
│   │   └── private/   # Páginas protegidas (admin)
│   └── routing/        # Componentes de enrutamiento
└── utils/              # Utilidades y helpers
```

## 🔐 Credenciales de Prueba

### Usuario Administrador
```
Usuario: admin
Contraseña: admin
Rol: ADMIN (user_id = 1)
```

### Usuario Cliente
```
Usuario:
Contraseña: 
Rol: CLIENTE
```

**Nota**: El sistema detecta usuarios ADMIN cuando `user_id === 1`, ya que el JWT del backend solo incluye el ID de usuario.

## 🌐 Endpoints de la API Utilizados

### Autenticación
- `POST /api/auth/jwt/login/` - Login y obtención de tokens
- `POST /api/auth/jwt/refresh/` - Refresh de token

### Recursos con CRUD Completo
- `GET/POST/PUT/DELETE /api/passengers/` - Pasajeros
- `GET/POST/PUT/DELETE /api/airports/` - Aeropuertos
- `GET/POST/PUT/DELETE /api/airlines/` - Aerolíneas
- `GET/POST/PUT/DELETE /api/crew/` - Tripulación
- `GET/POST/PUT/DELETE /api/maintenance/` - Mantenimiento

### Recursos con Visualización
- `GET /api/flights/` - Vuelos
- `GET /api/bookings/` - Reservas

## 🎨 Características de la Interfaz

### Parte Pública
- **Home**: Página principal con información del sistema
- **Login**: Formulario de autenticación con validación
- **Register**: Registro de nuevos usuarios

### Parte Privada (Admin)
- **Dashboard por Rol**: 
  - Administrador: acceso a 12 módulos
  - Usuario regular: acceso limitado a 4 módulos
- **Gestión de Recursos**: Tablas con listados, filtros y acciones CRUD
- **Formularios Modales**: Crear y editar recursos con validación completa
- **Modales de Visualización**: Botón "Ver" para mostrar detalles completos de cada registro
- **Validaciones**: Campos requeridos, formatos específicos (IATA, emails, fechas)
- **Feedback Visual**: Mensajes de éxito/error, loaders, confirmaciones
- **Acciones por Registro**:
  - **Ver**: Disponible para todos los usuarios (modal de detalles)
  - **Editar**: Solo usuarios con permisos de edición
  - **Eliminar**: Solo usuarios con permisos de eliminación

## 🔧 Funcionalidades Implementadas

### ✅ Completadas
- [x] Autenticación con JWT
- [x] Rutas protegidas
- [x] Control de acceso por roles
- [x] Dashboard administrativo con permisos
- [x] Listado de recursos consumiendo API real
- [x] CRUD completo de Pasajeros (Crear, Leer, Actualizar, Eliminar, Ver)
- [x] CRUD completo de Aeropuertos (Crear, Leer, Actualizar, Eliminar, Ver)
- [x] CRUD completo de Aerolíneas (Crear, Leer, Actualizar, Eliminar, Ver)
- [x] CRUD completo de Tripulación (Crear, Leer, Actualizar, Eliminar, Ver)
- [x] CRUD completo de Mantenimiento (Crear, Leer, Actualizar, Eliminar, Ver)
- [x] Formularios de creación con validación completa
- [x] Modales de visualización de detalles
- [x] Eliminación de registros con confirmación
- [x] Manejo de estados de carga y errores
- [x] Mensajes de éxito/error en operaciones
- [x] Detección de admin por user_id
- [x] Interceptor de Axios para tokens
- [x] Logout y limpieza de sesión

### 📝 Detalles de Implementación

#### Página de Aerolíneas
- **Campos**: Nombre, Código IATA (2 caracteres), País, Email, Teléfono
- **Validaciones**: Código IATA en mayúsculas, email válido
- **Modal Ver**: Muestra toda la información incluyendo fechas

#### Página de Aeropuertos
- **Campos**: Nombre, Código IATA (3 caracteres), Ciudad, País, Zona Horaria
- **Validaciones**: Código IATA en mayúsculas
- **Modal Ver**: Información completa del aeropuerto

#### Página de Tripulación
- **Campos**: Nombre, Apellido, ID Empleado, Posición, Licencia, Fecha de Contratación, Estado
- **Posiciones**: Piloto, Copiloto, Auxiliar de vuelo, Ingeniero de vuelo
- **Estados**: Activo, Inactivo
- **Modal Ver**: Detalles completos del miembro de tripulación

#### Página de Mantenimiento
- **Campos**: ID Aeronave, Tipo, Fechas (Programada/Completada), Descripción, Técnico, Estado
- **Tipos**: Rutinario, Inspección, Reparación, Revisión Mayor
- **Estados**: Programado, En Progreso, Completado
- **Modal Ver**: Información completa del registro con badges de estado

**Módulos sin Backend**
- Catálogo, Facturas, Almacenes y Usuarios muestran mensaje de "No Disponible"
- Los endpoints no están desplegados en el servidor actual

## 📸 Evidencia de Funcionalidad

### Capturas Requeridas
1. ✅ Pantalla pública (Home)
2. ✅ Login con validación
3. ✅ Dashboard admin con menú de módulos
4. ✅ Listado consumiendo API (Pasajeros/Aeropuertos/Aerolíneas/Tripulación/Mantenimiento)
5. ✅ Formularios de creación (modales con validación)
6. ✅ Formularios de edición (modales con datos precargados)
7. ✅ Modales de visualización (botón "Ver" con información completa)
8. ✅ Restricción por rol (botones ocultos/deshabilitados según permisos)
9. ✅ Eliminación con confirmación
10. ✅ Mensajes de éxito/error en operaciones

### Video Demostrativo
- Navegación por parte pública
- Proceso de login (admin y usuario regular)
- Acceso a dashboard según rol
- Consumo real de endpoints
- **Creación** de recursos (Pasajeros, Aerolíneas, Aeropuertos, Tripulación, Mantenimiento)
- **Visualización** de detalles con botón "Ver"
- **Edición** de registros existentes
- **Eliminación** con confirmación
- Verificación de restricciones por rol

## 👥 Roles y Restricciones

### Implementación Técnica
```typescript
// Hook useRole.tsx
const { canCreate, canEdit, canDelete } = useRole();

// En componentes
{canCreate() && <button>Agregar</button>}
{canEdit() && <button>Editar</button>}
{canDelete() && <button>Eliminar</button>}
```

### Dashboard por Rol
- **Admin Dashboard**: Acceso a Vuelos, Reservas, Pasajeros, Aerolíneas, Aeropuertos, Tripulación, Mantenimiento, Catálogo, Facturas, Almacenes, Usuarios
- **User Dashboard**: Solo Vuelos, Reservas, Pasajeros, Catálogo

### Permisos por Módulo
Cada módulo tiene controles específicos de acceso:

| Módulo | Ver | Crear | Editar | Eliminar |
|--------|-----|-------|--------|----------|
| **Pasajeros** | Todos | Admin/Editor | Admin/Editor | Admin |
| **Aerolíneas** | Todos | Admin/Editor | Admin/Editor | Admin |
| **Aeropuertos** | Todos | Admin/Editor | Admin/Editor | Admin |
| **Tripulación** | Todos | Admin/Editor | Admin/Editor | Admin |
| **Mantenimiento** | Todos | Admin/Editor | Admin/Editor | Admin |
| **Vuelos** | Todos | - | - | - |
| **Reservas** | Todos | - | - | - |

**Última actualización**: Enero 2026  
**Backend API**: https://vuelos-api.desarrollo-software.xyz  
**Puerto de desarrollo**: https://torres-billing-ui.desarrollo-software.xyz
