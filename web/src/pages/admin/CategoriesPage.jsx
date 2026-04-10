import { useEffect, useMemo, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_URL}/api/categories`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "No se pudieron cargar las categorías");
        }

        let normalizedCategories = [];

        if (Array.isArray(data)) {
          normalizedCategories = data;
        } else if (Array.isArray(data.categories)) {
          normalizedCategories = data.categories;
        }

        setCategories(normalizedCategories);
      } catch (error) {
        setErrorMessage(
          error.message || "Ocurrió un error al obtener las categorías"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const name = category.name || category.nombre || "";
      return name.toLowerCase().includes(search.toLowerCase());
    });
  }, [categories, search]);

  const openCreateModal = () => {
    setEditingCategoryId(null);
    setForm(initialForm);
    setActionMessage("");
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategoryId(category._id || category.id);
    setForm({
      name: category.name || category.nombre || "",
      description: category.description || category.descripcion || "",
      isActive: Boolean(category.isActive),
    });
    setActionMessage("");
    setErrorMessage("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setIsModalOpen(false);
    setEditingCategoryId(null);
    setForm(initialForm);
  };

  const handleChangeForm = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmitForm = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setErrorMessage("El nombre de la categoría es obligatorio");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");
      setActionMessage("");

      const token = localStorage.getItem("token");

      const isEditing = Boolean(editingCategoryId);
      const endpoint = isEditing
        ? `${API_URL}/api/categories/${editingCategoryId}`
        : `${API_URL}/api/categories`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          isActive: form.isActive,
        }),
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

      const savedCategory = data.category || data;

      if (isEditing) {
        setCategories((prevCategories) =>
          prevCategories.map((item) =>
            (item._id || item.id) === editingCategoryId ? savedCategory : item
          )
        );
        setActionMessage("Categoría actualizada correctamente");
      } else {
        setCategories((prevCategories) => [savedCategory, ...prevCategories]);
        setActionMessage("Categoría creada correctamente");
      }

      setIsModalOpen(false);
      setEditingCategoryId(null);
      setForm(initialForm);
    } catch (error) {
      setErrorMessage(
        error.message ||
          "Ocurrió un error al guardar la categoría"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    const categoryId = category._id || category.id;
    const categoryName = category.name || category.nombre || "esta categoría";

    const confirmed = window.confirm(
      `¿Seguro que querés eliminar ${categoryName}?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(categoryId);
      setErrorMessage("");
      setActionMessage("");

      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      let data = null;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data?.message || "No se pudo eliminar la categoría");
      }

      setCategories((prevCategories) =>
        prevCategories.filter((item) => (item._id || item.id) !== categoryId)
      );

      setActionMessage("Categoría eliminada correctamente");
    } catch (error) {
      setErrorMessage(
        error.message || "Ocurrió un error al eliminar la categoría"
      );
    } finally {
      setDeletingId(null);
    }
  };

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

      {actionMessage && (
        <div className="categories-page-success">{actionMessage}</div>
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
                filteredCategories.map((category) => {
                  const id = category._id || category.id;
                  const name = category.name || category.nombre || "Sin nombre";
                  const description =
                    category.description ||
                    category.descripcion ||
                    "Sin descripción";

                  const isActive = Boolean(category.isActive);

                  return (
                    <tr key={id}>
                      <td>{name}</td>
                      <td>{description}</td>
                      <td>
                        <span
                          className={`categories-page-status ${
                            isActive ? "active" : "inactive"
                          }`}
                        >
                          {isActive ? "Activa" : "Inactiva"}
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
                            onClick={() => handleDeleteCategory(category)}
                            disabled={deletingId === id}
                          >
                            {deletingId === id ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
              <h3>
                {editingCategoryId ? "Editar categoría" : "Nueva categoría"}
              </h3>
              <button
                type="button"
                className="categories-modal-close"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <form className="categories-form" onSubmit={handleSubmitForm}>
              <div className="categories-form-field">
                <label htmlFor="name">Nombre</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChangeForm}
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
                  onChange={handleChangeForm}
                  placeholder="Descripción de la categoría"
                  rows="4"
                />
              </div>

              <label className="categories-form-checkbox">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={form.isActive}
                  onChange={handleChangeForm}
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
                  {isSaving
                    ? editingCategoryId
                      ? "Guardando..."
                      : "Creando..."
                    : editingCategoryId
                    ? "Guardar cambios"
                    : "Crear categoría"}
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
