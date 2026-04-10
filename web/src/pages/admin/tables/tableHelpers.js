export const initialForm = {
  number: "",
  capacity: 4,
  assignedWaiter: "",
  status: "available",
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

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

export const validateTableForm = (form) => {
  const payload = {
    number: Number(form.number),
    capacity: Number(form.capacity),
    assignedWaiter: form.assignedWaiter || null,
    status: form.status,
  };

  if (!payload.number || payload.number < 1) {
    return { error: "El número de mesa debe ser válido" };
  }

  if (!payload.capacity || payload.capacity < 1) {
    return { error: "La capacidad debe ser válida" };
  }

  if (!["available", "occupied"].includes(payload.status)) {
    return { error: "El estado de la mesa no es válido" };
  }

  return { payload, error: null };
};