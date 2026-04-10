export const initialForm = {
  name: "",
  email: "",
  phone: "",
  shift: "mañana",
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

export const validateWaiterForm = (form) => {
  const payload = {
    name: form.name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    shift: form.shift,
  };

  if (!payload.name) {
    return { error: "El nombre es obligatorio" };
  }

  if (!payload.email) {
    return { error: "El email es obligatorio" };
  }

  if (!payload.phone) {
    return { error: "El teléfono es obligatorio" };
  }

  if (!["mañana", "tarde"].includes(payload.shift)) {
    return { error: "El turno seleccionado no es válido" };
  }

  return { payload, error: null };
};