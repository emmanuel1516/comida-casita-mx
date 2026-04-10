import { useEffect, useState } from "react";
import { API_URL } from "../../api/api";
import "./dishes-page.css";

const initialForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  available: true,
};

function DishesPage() {
  const [search, setSearch] = useState("");
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDishId, setEditingDishId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const searchTerm = search.trim().toLowerCase();
  const isEditing = editingDishId !== null;

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        };

        const [dishesResponse, categoriesResponse] = await Promise.all([
          fetch(`${API_URL}/api/dishes`, { headers }),
          fetch(`${API_URL}/api/categories`, { headers }),
        ]);

        const [dishesData, categoriesData] = await Promise.all([
          dishesResponse.json(),
          categoriesResponse.json(),
        ]);

        if (!dishesResponse.ok) {
          throw new Error(
            dishesData.message || "No se pudieron cargar los platillos"
          );
        }

        if (!categoriesResponse.ok) {
          throw new Error(
            categoriesData.message || "No se pudieron cargar las categorias"
          );
        }

        setDishes(dishesData);
        setCategories(categoriesData);
      } catch (error) {
        setErrorMessage(
          error.message || "Ocurrio un error al obtener los platillos"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredDishes = dishes.filter((dish) =>
    dish.name.toLowerCase().includes(searchTerm)
  );

  const openCreateModal = () => {
    clearMessages();
    setEditingDishId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (dish) => {
    clearMessages();
    setEditingDishId(dish._id);
    setForm({
      name: dish.name,
      description: dish.description || "",
      category:
        typeof dish.category === "object" ? dish.category._id : dish.category,
      price: dish.price ?? "",
      available: dish.available ?? true,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingDishId(null);
    setForm(initialForm);
  };

  const handleFormChange = ({ target }) => {
    const { name, value, type, checked } = target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      price: Number(form.price),
      available: form.available,
    };

    if (!payload.name) {
      setErrorMessage("El nombre del platillo es obligatorio");
      return;
    }

    if (!payload.category) {
      setErrorMessage("La categoria es obligatoria");
      return;
    }

    if (form.price === "" || payload.price < 0) {
      setErrorMessage("El precio debe ser valido");
      return;
    }

    const endpoint = isEditing
      ? `${API_URL}/api/dishes/${editingDishId}`
      : `${API_URL}/api/dishes`;

    try {
      setIsSaving(true);
      clearMessages();

      const token = localStorage.getItem("token");
      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEditing
              ? "No se pudo actualizar el platillo"
              : "No se pudo crear el platillo")
        );
      }

      if (isEditing) {
        setDishes((current) =>
          current.map((dish) =>
            dish._id === editingDishId ? data : dish
          )
        );
        setSuccessMessage("Platillo actualizado correctamente");
      } else {
        setDishes((current) => [data, ...current]);
        setSuccessMessage("Platillo creado correctamente");
      }

      setIsModalOpen(false);
      setEditingDishId(null);
      setForm(initialForm);
    } catch (error) {
      setErrorMessage(
        error.message || "Ocurrio un error al guardar el platillo"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (dish) => {
    const confirmed = window.confirm(
      `Seguro que queres eliminar ${dish.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(dish._id);
      clearMessages();

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/dishes/${dish._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo eliminar el platillo");
      }

      setDishes((current) =>
        current.filter((item) => item._id !== dish._id)
      );
      setSuccessMessage("Platillo eliminado correctamente");
    } catch (error) {
      setErrorMessage(
        error.message || "Ocurrio un error al eliminar el platillo"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryName = (categoryValue) => {
    if (!categoryValue) {
      return "Sin categoria";
    }

    if (typeof categoryValue === "object") {
      return categoryValue.name;
    }

    const category = categories.find(({ _id }) => _id === categoryValue);
    return category ? category.name : "Sin categoria";
  };

  return (
    <section className="dishes-page">
      <div className="dishes-page-header">
        <div>
          <h2 className="dishes-page-title">Platillos</h2>
          <p className="dishes-page-subtitle">
            Gestiona el catalogo de platillos del restaurante.
          </p>
        </div>

        <button className="dishes-page-create-button" onClick={openCreateModal}>
          Nuevo platillo
        </button>
      </div>

      <div className="dishes-page-toolbar">
        <input
          type="text"
          placeholder="Buscar platillo..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="dishes-page-search"
        />
      </div>

      {successMessage && (
        <div className="dishes-page-success">{successMessage}</div>
      )}

      {isLoading ? (
        <div className="dishes-page-feedback">Cargando platillos...</div>
      ) : errorMessage && !isModalOpen ? (
        <div className="dishes-page-error">{errorMessage}</div>
      ) : (
        <div className="dishes-page-table-wrapper">
          <table className="dishes-page-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripcion</th>
                <th>Categoria</th>
                <th>Precio</th>
                <th>Disponible</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredDishes.length > 0 ? (
                filteredDishes.map((dish) => {
                  const available = dish.available ?? true;

                  return (
                    <tr key={dish._id}>
                      <td>{dish.name}</td>
                      <td>{dish.description || "Sin descripcion"}</td>
                      <td>{getCategoryName(dish.category)}</td>
                      <td>${Number(dish.price || 0).toFixed(2)}</td>
                      <td>
                        <span
                          className={`dishes-page-status ${
                            available ? "active" : "inactive"
                          }`}
                        >
                          {available ? "Disponible" : "No disponible"}
                        </span>
                      </td>
                      <td>
                        <div className="dishes-page-actions">
                          <button
                            className="dishes-page-edit-button"
                            onClick={() => openEditModal(dish)}
                          >
                            Editar
                          </button>
                          <button
                            className="dishes-page-delete-button"
                            onClick={() => handleDelete(dish)}
                            disabled={deletingId === dish._id}
                          >
                            {deletingId === dish._id ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="dishes-page-empty">
                    No se encontraron platillos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="dishes-modal-overlay">
          <div className="dishes-modal">
            <div className="dishes-modal-header">
              <h3>{isEditing ? "Editar platillo" : "Nuevo platillo"}</h3>
              <button
                type="button"
                className="dishes-modal-close"
                onClick={closeModal}
              >
                x
              </button>
            </div>

            <form className="dishes-form" onSubmit={handleSubmit}>
              <div className="dishes-form-field">
                <label htmlFor="dish-name">Nombre</label>
                <input
                  id="dish-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Ej: Taco al pastor"
                  required
                />
              </div>

              <div className="dishes-form-field">
                <label htmlFor="dish-description">Descripcion</label>
                <textarea
                  id="dish-description"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Descripcion del platillo"
                  rows="4"
                />
              </div>

              <div className="dishes-form-field">
                <label htmlFor="dish-category">Categoria</label>
                <select
                  id="dish-category"
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Seleccionar categoria</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="dishes-form-field">
                <label htmlFor="dish-price">Precio</label>
                <input
                  id="dish-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleFormChange}
                  placeholder="Ej: 2500"
                  required
                />
              </div>

              <label className="dishes-form-checkbox">
                <input
                  type="checkbox"
                  name="available"
                  checked={form.available}
                  onChange={handleFormChange}
                />
                Platillo disponible
              </label>

              {errorMessage && (
                <div className="dishes-page-error">{errorMessage}</div>
              )}

              <div className="dishes-form-actions">
                <button
                  type="button"
                  className="dishes-form-cancel-button"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="dishes-form-save-button"
                  disabled={isSaving}
                >
                  {isSaving
                    ? isEditing
                      ? "Guardando..."
                      : "Creando..."
                    : isEditing
                    ? "Guardar cambios"
                    : "Crear platillo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default DishesPage;
