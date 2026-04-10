export const STATUS_LABELS = {
  pendiente: "Pendiente",
  preparando: "Preparando",
  listo: "Listo",
  entregado: "Entregado",
};

export const SHIFT_LABELS = {
  mañana: "Mañana",
  tarde: "Tarde",
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const formatDate = (value, options) =>
  value ? new Date(value).toLocaleString("es-AR", options) : "-";

export const formatOrderDate = (value) =>
  formatDate(value, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export const formatOrderTime = (value) =>
  formatDate(value, {
    hour: "2-digit",
    minute: "2-digit",
  });

export const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Ocurrió un error en la petición");
  }

  return data;
};

export const validateOrderForm = ({ form, assignedWaiterId, items }) => {
  if (!["mesa", "delivery"].includes(form.type)) {
    return "El tipo de pedido no es válido";
  }

  if (form.type === "mesa" && !form.table) {
    return "Debes seleccionar una mesa";
  }

  if (form.type === "delivery") {
    if (!form.customerName.trim()) return "El nombre del cliente es obligatorio";
    if (!form.customerPhone.trim()) return "El teléfono del cliente es obligatorio";
    if (!form.deliveryAddress.trim()) return "La dirección de entrega es obligatoria";
  }

  if (form.type === "mesa" && !assignedWaiterId) {
    return "La mesa seleccionada no tiene un mesero asignado";
  }

  if (form.type === "delivery" && !form.waiter) {
    return "Debes seleccionar un mesero";
  }

  if (!["pendiente", "preparando", "listo", "entregado"].includes(form.status)) {
    return "El estado del pedido no es válido";
  }

  if (!["mañana", "tarde"].includes(form.shift)) {
    return "El turno del pedido no es válido";
  }

  if (!items.length) {
    return "El pedido debe tener al menos un item";
  }

  for (const item of items) {
    if (!item.dish) return "Todos los items deben tener un platillo";
    if (!item.quantity || item.quantity < 1) {
      return "La cantidad de cada item debe ser válida";
    }
  }

  if (Number(form.tip) < 0) {
    return "La propina no puede ser negativa";
  }

  return null;
};