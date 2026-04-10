import { Order } from "../models/order.model.js";
import { Waiter } from "../models/waiter.model.js";
import { Dish } from "../models/dish.model.js";
import { Table } from "../models/table.model.js";

const ACTIVE_TABLE_ORDER_STATUSES = ["pendiente", "preparando"];

const hasActiveOrderForTable = async (tableId, excludedOrderId = null) => {
  const query = {
    type: "mesa",
    table: tableId,
    status: { $in: ACTIVE_TABLE_ORDER_STATUSES },
  };

  if (excludedOrderId) {
    query._id = { $ne: excludedOrderId };
  }

  return Boolean(await Order.exists(query));
};

const syncTableStatus = async (tableId) => {
  if (!tableId) {
    return;
  }

  const hasActiveOrders = await hasActiveOrderForTable(tableId);

  await Table.findByIdAndUpdate(tableId, {
    status: hasActiveOrders ? "occupied" : "available",
  });
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("table")
      .populate("waiter")
      .populate("items.dish")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los pedidos", error });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("table")
      .populate("waiter")
      .populate("items.dish");

    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener el pedido" });
  }
};

export const createOrder = async (req, res) => {
  try {
    const {
      type,
      table,
      customerName,
      customerPhone,
      deliveryAddress,
      specialNotes,
      waiter,
      items,
      status,
      shift,
      tip,
    } = req.body;
    const nextStatus = status || "pendiente";
    let resolvedWaiter = waiter;

    if (!type || !["mesa", "delivery"].includes(type)) {
      return res.status(400).json({ message: "Tipo de pedido invalido" });
    }

    if (!shift || !["mañana", "tarde"].includes(shift)) {
      return res.status(400).json({ message: "Turno invalido" });
    }

    if (!["pendiente", "preparando", "listo", "entregado"].includes(nextStatus)) {
      return res.status(400).json({ message: "Estado invalido" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Debes enviar al menos un item" });
    }

    if (type === "mesa") {
      if (!table) {
        return res.status(400).json({ message: "La mesa es obligatoria para pedidos de mesa" });
      }

      const tableExists = await Table.findById(table);
      if (!tableExists) {
        return res.status(400).json({ message: "La mesa no existe" });
      }

      if (!tableExists.assignedWaiter) {
        return res.status(400).json({
          message: "La mesa seleccionada no tiene un mesero asignado",
        });
      }

      const assignedWaiter = await Waiter.findById(tableExists.assignedWaiter);
      if (!assignedWaiter) {
        return res.status(400).json({
          message: "El mesero asignado a la mesa no existe",
        });
      }

      resolvedWaiter = assignedWaiter._id;

      if (ACTIVE_TABLE_ORDER_STATUSES.includes(nextStatus)) {
        const tableIsOccupied = await hasActiveOrderForTable(table);

        if (tableIsOccupied) {
          return res.status(400).json({ message: "La mesa seleccionada ya esta ocupada" });
        }
      }
    }

    if (type === "delivery") {
      if (!waiter) {
        return res.status(400).json({ message: "El mesero es obligatorio" });
      }

      const waiterExists = await Waiter.findById(waiter);
      if (!waiterExists) {
        return res.status(400).json({ message: "El mesero no existe" });
      }

      if (!customerName || !customerPhone || !deliveryAddress) {
        return res.status(400).json({
          message: "Para delivery debes enviar nombre, telefono y direccion",
        });
      }
    }

    const processedItems = [];
    let total = 0;

    for (const item of items) {
      const dish = await Dish.findById(item.dish);

      if (!dish) {
        return res.status(400).json({
          message: `El platillo con id ${item.dish} no existe`,
        });
      }

      if (!dish.available) {
        return res.status(400).json({
          message: `El platillo ${dish.name} no esta disponible`,
        });
      }

      const quantity = Number(item.quantity);

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          message: `Cantidad invalida para el platillo ${dish.name}`,
        });
      }

      const price = dish.price;
      const subtotal = price * quantity;
      total += subtotal;

      processedItems.push({
        dish: dish._id,
        name: dish.name,
        price,
        quantity,
        subtotal,
      });
    }

    const order = new Order({
      type,
      table: type === "mesa" ? table : null,
      customerName: type === "delivery" ? customerName : "",
      customerPhone: type === "delivery" ? customerPhone : "",
      deliveryAddress: type === "delivery" ? deliveryAddress : "",
      specialNotes: specialNotes || "",
      waiter: resolvedWaiter,
      items: processedItems,
      status: nextStatus,
      shift,
      total,
      tip: Number(tip) || 0,
    });

    const savedOrder = await order.save();

    if (savedOrder.type === "mesa") {
      await syncTableStatus(savedOrder.table);
    }

    const populatedOrder = await Order.findById(savedOrder._id)
      .populate("table")
      .populate("waiter")
      .populate("items.dish");

    res.status(201).json(populatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el pedido" });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      type,
      table,
      customerName,
      customerPhone,
      deliveryAddress,
      specialNotes,
      waiter,
      items,
      shift,
      tip,
      status,
    } = req.body;
    let resolvedWaiter = waiter;

    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    const previousTableId = existingOrder.table
      ? existingOrder.table.toString()
      : null;
    const nextTableId = type === "mesa" ? table : null;

    if (!type || !["mesa", "delivery"].includes(type)) {
      return res.status(400).json({ message: "Tipo de pedido invalido" });
    }

    if (!shift || !["mañana", "tarde"].includes(shift)) {
      return res.status(400).json({ message: "Turno invalido" });
    }

    if (!status || !["pendiente", "preparando", "listo", "entregado"].includes(status)) {
      return res.status(400).json({ message: "Estado invalido" });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Debes enviar al menos un item" });
    }

    if (type === "mesa") {
      if (!table) {
        return res.status(400).json({ message: "La mesa es obligatoria para pedidos de mesa" });
      }

      const tableExists = await Table.findById(table);
      if (!tableExists) {
        return res.status(400).json({ message: "La mesa no existe" });
      }

      if (!tableExists.assignedWaiter) {
        return res.status(400).json({
          message: "La mesa seleccionada no tiene un mesero asignado",
        });
      }

      const assignedWaiter = await Waiter.findById(tableExists.assignedWaiter);
      if (!assignedWaiter) {
        return res.status(400).json({
          message: "El mesero asignado a la mesa no existe",
        });
      }

      resolvedWaiter = assignedWaiter._id;

      if (ACTIVE_TABLE_ORDER_STATUSES.includes(status)) {
        const tableIsOccupied = await hasActiveOrderForTable(table, id);

        if (tableIsOccupied) {
          return res.status(400).json({ message: "La mesa seleccionada ya esta ocupada" });
        }
      }
    }

    if (type === "delivery") {
      if (!waiter) {
        return res.status(400).json({ message: "El mesero es obligatorio" });
      }

      const waiterExists = await Waiter.findById(waiter);
      if (!waiterExists) {
        return res.status(400).json({ message: "El mesero no existe" });
      }

      if (!customerName || !customerPhone || !deliveryAddress) {
        return res.status(400).json({
          message: "Para delivery debes enviar nombre, telefono y direccion",
        });
      }
    }

    const processedItems = [];
    let total = 0;

    for (const item of items) {
      const dish = await Dish.findById(item.dish);

      if (!dish) {
        return res.status(400).json({
          message: `El platillo con id ${item.dish} no existe`,
        });
      }

      if (!dish.available) {
        return res.status(400).json({
          message: `El platillo ${dish.name} no esta disponible`,
        });
      }

      const quantity = Number(item.quantity);

      if (!quantity || quantity < 1) {
        return res.status(400).json({
          message: `Cantidad invalida para el platillo ${dish.name}`,
        });
      }

      const price = dish.price;
      const subtotal = price * quantity;
      total += subtotal;

      processedItems.push({
        dish: dish._id,
        name: dish.name,
        price,
        quantity,
        subtotal,
      });
    }

    existingOrder.type = type;
    existingOrder.table = type === "mesa" ? table : null;
    existingOrder.customerName = type === "delivery" ? customerName : "";
    existingOrder.customerPhone = type === "delivery" ? customerPhone : "";
    existingOrder.deliveryAddress = type === "delivery" ? deliveryAddress : "";
    existingOrder.specialNotes = specialNotes || "";
    existingOrder.waiter = resolvedWaiter;
    existingOrder.items = processedItems;
    existingOrder.shift = shift;
    existingOrder.status = status;
    existingOrder.total = total;
    existingOrder.tip = Number(tip) || 0;

    await existingOrder.save();

    const tablesToSync = [...new Set([previousTableId, nextTableId].filter(Boolean))];
    await Promise.all(tablesToSync.map((tableId) => syncTableStatus(tableId)));

    const populatedOrder = await Order.findById(existingOrder._id)
      .populate("table")
      .populate("waiter")
      .populate("items.dish");

    res.status(200).json(populatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el pedido" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["pendiente", "preparando", "listo", "entregado"].includes(status)) {
      return res.status(400).json({ message: "Estado invalido" });
    }

    const existingOrder = await Order.findById(id);

    if (!existingOrder) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    existingOrder.status = status;
    await existingOrder.save();

    if (existingOrder.type === "mesa") {
      await syncTableStatus(existingOrder.table);
    }

    const updatedOrder = await Order.findById(existingOrder._id)
      .populate("table")
      .populate("waiter")
      .populate("items.dish");

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar el estado del pedido" });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    if (deletedOrder.type === "mesa") {
      await syncTableStatus(deletedOrder.table);
    }

    res.status(200).json({ message: "Pedido eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el pedido" });
  }
};
