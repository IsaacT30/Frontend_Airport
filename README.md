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

#### Módulos con CRUD Completo
1. **Pasajeros** - Gestión de información de pasajeros
2. **Aeropuertos** - Administración de aeropuertos (código IATA, ciudad, país)
3. **Aerolíneas** - Gestión de aerolíneas (código IATA, contacto)

#### Módulos con Visualización
4. **Vuelos** - Listado de vuelos con origen/destino
5. **Reservas** - Gestión de bookings
6. **Tripulación** - Administración de personal de vuelo
7. **Mantenimiento** - Control de mantenimiento de aeronaves

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

### Recursos (CRUD)
- `GET/POST /api/passengers/` - Pasajeros
- `GET/POST /api/airports/` - Aeropuertos
- `GET/POST /api/airlines/` - Aerolíneas
- `GET /api/flights/` - Vuelos
- `GET /api/bookings/` - Reservas
- `GET /api/crew/` - Tripulación
- `GET /api/maintenance/` - Mantenimiento

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
- **Formularios Modales**: Crear y editar recursos
- **Validaciones**: Campos requeridos, formatos específicos
- **Feedback Visual**: Mensajes de éxito/error, loaders

## 🔧 Funcionalidades Implementadas

### ✅ Completadas
- [x] Autenticación con JWT
- [x] Rutas protegidas
- [x] Control de acceso por roles
- [x] Dashboard administrativo con permisos
- [x] Listado de recursos consumiendo API real
- [x] Formularios de creación con validación
- [x] Eliminación de registros (con confirmación)
- [x] Manejo de estados de carga
- [x] Mensajes de éxito/error
- [x] Detección de admin por user_id
- [x] Interceptor de Axios para tokens
- [x] Logout y limpieza de sesión

### ⚠️ Limitaciones Conocidas

**Error 405 en Creación de Pasajeros**
- El backend responde con `405 Method Not Allowed` al intentar crear pasajeros
- El token se envía correctamente (`Authorization: Bearer ...`)
- Los datos del formulario son válidos
- **Causa**: Configuración de permisos del backend que restringe POST en `/api/passengers/`
- **Estado**: No es un error del frontend, requiere ajuste en el backend

**Módulos sin Backend**
- Catálogo, Facturas, Almacenes y Usuarios muestran mensaje de "No Disponible"
- Los endpoints no están desplegados en el servidor actual

## 📸 Evidencia de Funcionalidad

### Capturas Requeridas
1. ✅ Pantalla pública (Home)
2. ✅ Login con validación
3. ✅ Dashboard admin con menú de módulos
4. ✅ Listado consumiendo API (Pasajeros/Aeropuertos)
5. ✅ Formulario de creación (modal)
6. ✅ Restricción por rol (botones ocultos/deshabilitados)

### Video Demostrativo
- Navegación por parte pública
- Proceso de login (admin y usuario regular)
- Acceso a dashboard según rol
- Consumo real de endpoints
- Creación de recursos
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

## 🐛 Resolución de Problemas

### El servidor da 405 al crear recursos
- Verificar que el token esté presente en headers (`Authorization: Bearer ...`)
- Confirmar permisos del usuario en el backend Django
- Revisar configuración de DRF permissions

### No aparece el dashboard después del login
- Verificar que el token se guardó en localStorage
- Comprobar que la decodificación del JWT sea correcta
- El sistema usa `user_id === 1` para detectar admin

### Errores de CORS
- El backend debe tener configurado CORS para permitir el origen del frontend
- Verificar headers `Access-Control-Allow-Origin`

## 📚 Documentación Adicional

- [React Documentation](https://react.dev)
- [React Router](https://reactrouter.com)
- [TailwindCSS](https://tailwindcss.com)
- [Axios](https://axios-http.com)

## 👨‍💻 Desarrollo

Este proyecto fue desarrollado como parte del curso de Desarrollo de Software, implementando:
- Arquitectura limpia (Clean Architecture)
- Separación de capas (Application, Domain, Infrastructure, Presentation)
- Principios SOLID
- Control de acceso basado en roles (RBAC)
- Consumo de API REST real

## 📄 Licencia

Este proyecto es parte de un trabajo académico.

---

**Última actualización**: Enero 2026  
**Backend API**: https://vuelos-api.desarrollo-software.xyz  
**Puerto de desarrollo**: https://torres-billing-ui.desarrollo-software.xyz
