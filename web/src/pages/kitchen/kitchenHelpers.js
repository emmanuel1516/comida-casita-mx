export const formatDateTime = (dateValue) => {
  if (!dateValue) {
    return "Sin fecha";
  }

  return new Date(dateValue).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getNextStatus = (order) => {
  if (order.status === "pendiente") {
    return "preparando";
  }

  if (order.status === "preparando") {
    return order.type === "delivery" ? "entregado" : "listo";
  }

  return "";
};

export const getNextStatusLabel = (order) => {
  if (order.status === "pendiente") {
    return "Marcar como preparando";
  }

  if (order.status === "preparando") {
    return order.type === "delivery"
      ? "Marcar como entregado"
      : "Marcar como listo";
  }

  return "";
};

export const isClosingTransition = (order, nextStatus) =>
  (order.type === "mesa" && nextStatus === "listo") ||
  (order.type === "delivery" && nextStatus === "entregado");

export const buildUpdatePayload = (order, nextStatus, nextTip) => ({
  type: order.type,
  table: order.type === "mesa" ? order.table?._id || null : null,
  customerName: order.type === "delivery" ? order.customerName || "" : "",
  customerPhone: order.type === "delivery" ? order.customerPhone || "" : "",
  deliveryAddress: order.type === "delivery" ? order.deliveryAddress || "" : "",
  specialNotes: order.specialNotes || "",
  waiter: order.waiter?._id || "",
  items: order.items.map((item) => ({
    dish: item.dish?._id || item.dish,
    name: item.name,
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 0),
    subtotal: Number(item.subtotal || 0),
  })),
  status: nextStatus,
  shift: order.shift,
  total: Number(order.total || 0),
  tip: Number(nextTip || 0),
});