# Casita Comida MX app – Prueba Técnica ReWo

Sistema web de gestión para restaurante desarrollado como prueba técnica para ReWo.

## Estructura del proyecto y stack tecnológico
- /app -> backend (Node.js + Express)
- /web -> frontend (React + Vite)
- /docs -> documentación del proyecto

## Descripción
Comida Casita MX es un sistema web orientado a la administración operativa de un restaurante. Permite gestionar categorías, platillos, mesas, meseros, pedidos de mesa y delivery, cocina, reportes y dashboard diario.


## Objetivo del proyecto

Construir una solución funcional, responsive y desplegada públicamente que cubra los requerimientos del cliente y demuestre capacidades de:

- desarrollo full stack
- manejo de Git
- documentación técnica
- comunicación clara de decisiones
- uso asistido de IA con criterio técnico

## Requerimientos cubiertos

- Autenticación obligatoria con roles `admin` y `mesero`
- CRUD de categorías
- CRUD de platillos
- CRUD de mesas
- CRUD de meseros
- CRUD de pedidos
- Vista de cocina en orden cronológico
- Dashboard de ventas diarias
- Reporte de ventas por mesero/turno
- Diseño responsive mobile-first

## Funcionalidad extra implementada

### Sincronización automática entre pedidos y mesas

Se implementó una funcionalidad extra orientada a mejorar la operación del restaurante: la sincronización automática entre el estado de los pedidos y el estado de las mesas.

#### ¿Qué hace?
- Marca una mesa como `occupied` cuando existe un pedido activo de mesa.
- La vuelve a `available` cuando el pedido:
  - se entrega,
  - cambia de mesa,
  - cambia de tipo,
  - o se elimina.
  - Impide crear o mover un pedido activo a una mesa que ya está ocupada por otro pedido activo.
- En el frontend, al abrir el modal de pedidos:
  - se refresca la lista de mesas,
  - se recargan después de guardar/eliminar,
  - el selector muestra solo mesas disponibles,
  - y si estás editando, conserva visible la mesa actual.


## Tecnologías utilizadas

### Frontend
- React + Vite
- React Router
- CSS custom
- Flexbox / Grid
- enfoque mobile-first

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- JWT para autenticación
- middlewares de autorización por rol

## Arquitectura general

### Frontend
Estructura principal:
- `pages/`
- `components/`
- `layouts/`
- `routes/`
- `context/`
- `api/`

### Backend
Arquitectura basada en:
- models
- controllers
- routes
- middlewares

##  Roles y permisos

### Admin
Puede acceder a:
- dashboard
- categorías
- platillos
- mesas
- meseros
- pedidos
- reportes
- cocina

### Mesero
Puede acceder a:
- pedidos
- cocina

Además, los endpoints sensibles están protegidos tanto en frontend como en backend mediante JWT y middleware de roles.

## Modelos principales

### User
- name
- email
- password
- role

### Category
- name
- description
- isActive

### Dish
- name
- description
- category
- price
- available

### Table
- number
- capacity
- assignedWaiter
- status

### Waiter
- name
- email
- phone
- shift
- user

### Order
- type
- table
- customerName
- customerPhone
- deliveryAddress
- specialNotes
- waiter
- items
- status
- shift
- total
- tip

## Endpoints principales

### Auth
- `POST /api/auth/login`

### Categories
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### Dishes
- `GET /api/dishes`
- `POST /api/dishes`
- `PUT /api/dishes/:id`
- `DELETE /api/dishes/:id`

### Tables
- `GET /api/tables`
- `POST /api/tables`
- `PUT /api/tables/:id`
- `DELETE /api/tables/:id`

### Waiters
- `GET /api/waiters`
- `POST /api/waiters`
- `PUT /api/waiters/:id`
- `DELETE /api/waiters/:id`

### Orders
- `GET /api/orders`
- `POST /api/orders`
- `PUT /api/orders/:id`
- `DELETE /api/orders/:id`


## Setup local

### Requisitos
- Node.js
- npm
- MongoDB
- variables de entorno configuradas

## Backend
- cd app
- npm init -y (inicializa el proyecto Node.js)
- npm install express cors dotenv mongoose bcryptjs jsonwebtoken (instala dependencias principales)
- npm install -D nodemon (instala dependencia de desarrollo)

### .env
- PORT=3000
- MONGO_URI=...
- JWT_SECRET=...


## Frontend 
- cd web
- npm create vite@latest . (crea el proyecto React con Vite)
- npm install (instala dependencias)
- npm run dev (levanta el entorno de desarrollo)

### .env
- VITE_API_URL=http://localhost:3000


# Desiciones técnicas

- Se usó React + Vite para rapidez de desarrollo y estructura clara.
- Se utilizó JWT por ser una solución estándar y simple de autenticación stateless.
- Se aplicó separación por páginas, layouts, contexto y rutas en frontend.
- Se protegieron rutas por rol tanto en frontend como en backend.
- Se trabajó con CSS propio para tener control total del responsive sin depender de frameworks adicionales.
- Se eligió una funcionalidad extra con impacto real en la operación del negocio, no solo estética.


## Deploy
- URL: https://comida-casita-mx.vercel.app/

### Admin
- email: admin@test.com
- password: admin123

### Mesero
- email: juan@casita.com
- password: mesero123

## Repositorio
- URL: https://github.com/emmanuel1516/comida-casita-mx

## Videos explicativos
- Demo funcional: https://www.loom.com/share/3647f3d8c23c4318b7aee45b6909d56c
- Video técnico: https://www.loom.com/share/c50e48150c864f1893f5c4d73fe366b1
- Funcionalidad Extra: https://www.loom.com/share/1259841f1f5849aab9bbb32ccb4f090e