# Planning - Comida Casita MX

## Objetivo

Desarrollar un sistema web de gestión para el restaurante **Comida Casita MX**, permitiendo administrar el catálogo de platillos, pedidos, cocina, asignación de meseros, autenticación de usuarios y reportes de ventas.

---

## Requerimientos

El sistema debe incluir:

- Catálogo de platillos (categorías, precios, disponibilidad)
- Pedidos (mesa y delivery)
- Estado de pedidos con actualización automática
- Asignación de meseros por mesa
- Vista de cocina (órdenes pendientes en orden cronológico)
- Reporte de ventas por mesero y turno
- Panel administrador completo
- Autenticación obligatoria con login y roles (`admin` y `mesero`)

---

## Alcance (MVP)

Para esta prueba se desarrollará un MVP funcional que incluya:

- Login de usuarios
- Gestión de categorías
- Gestión de platillos
- Gestión de meseros
- Gestión de mesas
- Creación y gestión de pedidos (mesa/delivery)
- Visualización de pedidos en cocina
- Actualización de estado de pedidos
- Dashboard de ventas diarias
- Reportes de ventas con filtros por mesero, fecha y turno

---

## Módulos del sistema

- **Autenticación**
  - Login
  - Roles de usuario (`admin`, `mesero`)

- **Catálogo**
  - Categorías
  - Platillos

- **Pedidos**
  - Pedido mesa
  - Pedido delivery

- **Meseros**
  - Asignación a mesas

- **Cocina**
  - Órdenes pendientes
  - Orden cronológico
  - Cambio de estado

- **Reportes**
  - Total de ventas
  - Cantidad de pedidos
  - Propinas
  - Promedio por pedido
  - Filtros por mesero, fecha y turno

- **Administrador**
  - Gestión de categorías
  - Gestión de platillos
  - Gestión de mesas
  - Gestión de meseros
  - Gestión de pedidos
  - Dashboard de ventas diarias

---

## Entidades principales

- `User` - Usuario
- `Category` - Categoría
- `Dish` - Platillo
- `Waiter` - Mesero
- `Table` - Mesa
- `Order` - Pedido

---

## Flujo principal del sistema

1. Un usuario inicia sesión según su rol
2. El administrador registra categorías y platillos
3. El administrador registra mesas y meseros
4. Se genera un pedido (mesa o delivery)
5. El pedido aparece en cocina
6. Se actualiza el estado del pedido
7. El pedido se marca como entregado
8. La venta impacta en el dashboard y en los reportes

---

## Tecnologías seleccionadas

- Frontend: React + Vite
- Backend: Node.js + Express
- Base de datos: MongoDB
- Autenticación: JWT
- Actualización automática de pedidos: polling con React (`useEffect` + consultas periódicas al backend)

---

## Estrategia de desarrollo

El proyecto se desarrollará de forma iterativa en las siguientes etapas:

1. Inicialización del proyecto
2. Modelado de datos
3. Autenticación y roles
4. CRUD de módulos principales
5. Sistema de pedidos
6. Vista de cocina
7. Actualización automática del estado de pedidos
8. Reportes y dashboard
9. Funcionalidad extra
10. Deploy y documentación

---

## Funcionalidad extra (propuesta)

Se implementará una funcionalidad adicional para aportar valor al negocio:

- **Alerta de pedidos demorados**  
  Permite identificar pedidos que superan cierto tiempo de espera para mejorar el seguimiento desde cocina y administración.

---

## Objetivo final

Entregar un sistema funcional, desplegado y documentado, cumpliendo todos los requerimientos y demostrando un desarrollo ordenado, iterativo y alineado con las necesidades del cliente.