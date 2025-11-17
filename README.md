# Burger King – Catálogo y Panel Administrador (Angular 15)

Proyecto web desarrollado en **Angular 15** que simula una tienda tipo Burger King con:

- **Sitio público** para que los clientes naveguen por el catálogo y gestionen su carrito.
- **Sistema de autenticación** con roles (`Admin` y `Client`).
- **Panel de administración** para gestionar productos del local (crear, listar y editar).

Es un proyecto académico enfocado en **buenas prácticas de front-end**, **enrutamiento**, **guards de Angular** y **simulación de una capa de datos**.

---

## 🚀 Funcionalidades principales

### Sitio público (Cliente)

- Página principal con catálogo (`/pagina-principal`).
- Carrito de compras (`/carrito`):
  - Agregar productos.
  - Ver resumen de compra.
- Header con navegación principal (catálogo, restaurantes, promociones).

### Autenticación y roles

- **Login** de usuarios con credenciales predefinidas (BD simulada en memoria).
- Manejo de sesión con `BehaviorSubject` (`AuthService`).
- Roles soportados:
  - `Admin`
  - `Client`

### Panel de administración (`/admin`)

- Dashboard de administrador.
- Gestión de productos:
  - **Listado de productos** (`/admin/products`).
  - **Crear producto** (`/admin/products/new`).
  - **Editar producto** (`/admin/products/:id/edit`).

### Protección de rutas (HDU03)

Se implementa la historia de usuario **HDU03 – Proteger rutas de Administrador**:

- Si un **visitante** intenta ir a `/admin` → se redirige a `auth/login`.
- Si un **usuario con rol Client** intenta ir a `/admin` → se redirige a `pagina-principal`.
- Solo un **usuario con rol Admin** puede acceder a `/admin` y a sus rutas hijas.
- El **cierre de sesión del administrador** se realiza desde el menú desplegable del navbar del panel admin.

---

## 🧱 Stack tecnológico

- **Framework:** Angular 15 (Angular CLI)
- **Lenguajes:** TypeScript, HTML, CSS
- **Estilos:** Bootstrap 5 + estilos personalizados
- **Gestión de estado de sesión:** `BehaviorSubject` (RxJS)
- **Enrutamiento:** `RouterModule` (módulo raíz + lazy loading de `AuthModule`)

---

## 📂 Estructura principal del proyecto

Ruta base: `src/app/`

```txt
app/
│   app.module.ts
│   app-routing.module.ts
│   app.component.*
│
├── auth/
│   │   auth.module.ts
│   │   auth-routing.module.ts
│   │   auth.service.ts
│   └── login/
│       └── login.component.*
│
├── components/
│   ├── layout/
│   │   ├── header/
│   │   └── footer/
│   ├── pagina-principal/
│   ├── carrito/
│   └── admin/
│       ├── admin-dashboard/
│       ├── product-list/
│       └── product-form/
│
├── guards/
│   ├── admin.guard.ts
│   ├── cliente.guard.ts
│   └── login.guard.ts
│
├── models/
│   ├── user.model.ts
│   ├── product.model.ts
│   └── item-carrito.ts
│
└── services/
    ├── login.service.ts
    ├── product.service.ts
    └── carrito/
        └── carrito.service.ts
