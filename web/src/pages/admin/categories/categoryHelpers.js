export const initialForm = {
  name: "",
  description: "",
  isActive: true,
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

export const validateCategoryForm = (form) => {
  if (!form.name.trim()) {
    return "El nombre de la categoría es obligatorio";
  }

  return null;
};