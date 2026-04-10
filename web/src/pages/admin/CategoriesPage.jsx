import { useEffect, useState } from "react";
import { API_URL } from "../../api/api";
import "./categories-page.css";

const initialForm = {
  name: "",
  description: "",
  isActive: true,
};

function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const searchTerm = search.trim().toLowerCase();
  const isEditing = editingCategoryId !== null;
  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/categories`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "No se pudieron cargar las categorías");
        }

        setCategories(data);
      } catch (error) {
        setErrorMessage(
          error.message || "Ocurrió un error al cargar las categorías"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm)
  );

  const openCreateModal = () => {
    clearMessages();
    setEditingCategoryId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    clearMessages();
    setEditingCategoryId(category._id);
    setForm({
      name: category.name,
      description: category.description || "",
      isActive: category.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingCategoryId(null);
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
      isActive: form.isActive,
    };

    if (!payload.name) {
      setErrorMessage("El nombre de la categoría es obligatorio");
      return;
    }

    const endpoint = isEditing
      ? `${API_URL}/api/categories/${editingCategoryId}`
      : `${API_URL}/api/categories`;

    try {
      setIsSaving(true);
      clearMessages();

      const token = localStorage.getItem("token");
      const response = await fetch(endpoint, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEditing
              ? "No se pudo actualizar la categoría"
              : "No se pudo crear la categoría")
        );
      }

      if (isEditing) {
        setCategories((current) =>
          current.map((category) =>
            category._id === editingCategoryId ? data : category
          )
        );
        setSuccessMessage("Categoría actualizada correctamente");
      } else {
        setCategories((current) => [data, ...current]);
        setSuccessMessage("Categoría creada correctamente");
      }

      setIsModalOpen(false);
      setEditingCategoryId(null);
      setForm(initialForm);
    } catch (error) {
      setErrorMessage(
        error.message || "Ocurrió un error al guardar la categoría"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `¿Seguro que querés eliminar ${category.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(category._id);
      clearMessages();

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/categories/${category._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "No se pudo eliminar la categoría");
      }

      setCategories((current) =>
        current.filter(({ _id }) => _id !== category._id)
      );
      setSuccessMessage("Categoría eliminada correctamente");
    } catch (error) {
      setErrorMessage(
        error.message || "Ocurrió un error al eliminar la categoría"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const modalTitle = isEditing ? "Editar categoría" : "Nueva categoría";
  const submitLabel = isSaving
    ? isEditing
      ? "Guardando..."
      : "Creando..."
    : isEditing
    ? "Guardar cambios"
    : "Crear categoría";

  return (
    <section className="categories-page">
      <div className="categories-page-header">
        <div>
          <h2 className="categories-page-title">Categorías</h2>
          <p className="categories-page-subtitle">
            Gestioná las categorías del menú del restaurante.
          </p>
        </div>

        <button
          className="categories-page-create-button"
          onClick={openCreateModal}
        >
          Nueva categoría
        </button>
      </div>

      <div className="categories-page-toolbar">
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="categories-page-search"
        />
      </div>

      {successMessage && (
        <div className="categories-page-success">{successMessage}</div>
      )}

      {isLoading ? (
        <div className="categories-page-feedback">Cargando categorías...</div>
      ) : errorMessage && !isModalOpen ? (
        <div className="categories-page-error">{errorMessage}</div>
      ) : (
        <div className="categories-page-table-wrapper">
          <table className="categories-page-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td>{category.description || "Sin descripción"}</td>
                    <td>
                      <span
                        className={`categories-page-status ${
                          category.isActive ? "active" : "inactive"
                        }`}
                      >
                        {category.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td>
                      <div className="categories-page-actions">
                        <button
                          className="categories-page-edit-button"
                          onClick={() => openEditModal(category)}
                        >
                          Editar
                        </button>
                        <button
                          className="categories-page-delete-button"
                          onClick={() => handleDelete(category)}
                          disabled={deletingId === category._id}
                        >
                          {deletingId === category._id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="categories-page-empty">
                    No se encontraron categorías.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="categories-modal-overlay">
          <div className="categories-modal">
            <div className="categories-modal-header">
              <h3>{modalTitle}</h3>
              <button
                type="button"
                className="categories-modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form className="categories-form" onSubmit={handleSubmit}>
              <div className="categories-form-field">
                <label htmlFor="name">Nombre</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Ej: Tacos"
                  required
                />
              </div>

              <div className="categories-form-field">
                <label htmlFor="description">Descripción</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  placeholder="Descripción de la categoría"
                  rows="4"
                />
              </div>

              <label className="categories-form-checkbox">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleFormChange}
                />
                Categoría activa
              </label>

              {errorMessage && (
                <div className="categories-page-error">{errorMessage}</div>
              )}

              <div className="categories-form-actions">
                <button
                  type="button"
                  className="categories-form-cancel-button"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="categories-form-save-button"
                  disabled={isSaving}
                >
                  {submitLabel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default CategoriesPage;
