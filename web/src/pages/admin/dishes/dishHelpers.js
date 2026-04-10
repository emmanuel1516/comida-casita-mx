export const initialForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  available: true,
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

export const validateDishForm = (form) => {
  const payload = {
    name: form.name.trim(),
    description: form.description.trim(),
    category: form.category,
    price: Number(form.price),
    available: form.available,
  };

  if (!payload.name) {
    return { error: "El nombre del platillo es obligatorio" };
  }

  if (!payload.category) {
    return { error: "La categoría es obligatoria" };
  }

  if (form.price === "" || Number.isNaN(payload.price) || payload.price < 0) {
    return { error: "El precio debe ser válido" };
  }

  return { payload, error: null };
};

export const getCategoryName = (categoryValue, categories) => {
  if (!categoryValue) {
    return "Sin categoría";
  }

  if (typeof categoryValue === "object") {
    return categoryValue.name;
  }

  const category = categories.find(({ _id }) => _id === categoryValue);
  return category ? category.name : "Sin categoría";
};