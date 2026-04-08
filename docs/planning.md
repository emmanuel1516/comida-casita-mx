# Planning - Cocina Casita MX

## Objetivo

Desarrollar un sistema web de gestión para el restaurante "Comida Casita MX", permitiendo administrar el catálogo de platillos, pedidos, cocina, asignación de meseros y reportes de ventas.

---

## Requerimientos

El sistema debe incluir:

- Catálogo de platillos (categorías, precios, disponibilidad)
- Pedidos (mesa y delivery)
- Estado de pedidos en tiempo real
- Asignación de meseros por mesa
- Vista de cocina (órdenes pendientes en orden cronológico)
- Reporte de ventas por mesero y turno
- Panel administrador completo

---

## Alcance (MVP)

Para esta prueba se desarrollará un MVP funcional que incluya:

- Gestión de categorías
- Gestión de platillos
- Gestión de meseros
- Gestión de mesas
- Creación de pedidos (mesa/delivery)
- Visualización de pedidos en cocina
- Actualización de estado de pedidos
- Reportes básicos de ventas

---

## Módulos del sistema

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
  - Ventas por mesero
  - Ventas por turno

- **Administrador**
  - Gestión general del sistema

---

## Entidades principales

- Category - Categoria
- Dish - Platos 
- Waiter - Mesero
- Table - Mesa
- Order - Orden

---

## Flujo principal del sistema

1. Se crean categorías y platillos
2. Se registran mesas y meseros
3. Se genera un pedido (mesa o delivery)
4. El pedido aparece en cocina
5. Se actualiza el estado del pedido
6. El pedido se marca como entregado
7. Se registra en los reportes

---

## Tecnologías seleccionadas

- Frontend: React + Vite
- Backend: Node.js + Express
- Base de datos: MongoDB
- Real-time: Socket.IO

---

## Estrategia de desarrollo

El proyecto se desarrollará de forma iterativa en las siguientes etapas:

1. Inicialización del proyecto
2. Modelado de datos
3. CRUD de módulos principales
4. Sistema de pedidos
5. Vista de cocina
6. Integración en tiempo real
7. Reportes
8. Funcionalidad extra
9. Deploy y documentación

---

## Funcionalidad extra (propuesta)

Se implementará una funcionalidad adicional para aportar valor al negocio:

- Alerta de pedidos demorados  
  (permite identificar pedidos que superan cierto tiempo de espera)

---

## Objetivo final

Entregar un sistema funcional, desplegado y documentado, cumpliendo todos los requerimientos y demostrando un desarrollo ordenado e iterativo.