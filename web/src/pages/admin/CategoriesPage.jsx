import { useEffect, useState } from "react";
import { API_URL } from "../../api/api";
import CategoriesTable from "./categories/CategoriesTable";
import CategoryModal from "./categories/CategoryModal";
import {
  fetchJson,
  initialForm,
  validateCategoryForm,
} from "./categories/categoryHelpers";
import "./categories-page.css";

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
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await fetchJson(`${API_URL}/api/categories`);
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

    const validationError = validateCategoryForm(form);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      isActive: form.isActive,
    };

    const endpoint = isEditing
      ? `${API_URL}/api/categories/${editingCategoryId}`
      : `${API_URL}/api/categories`;

    try {
      setIsSaving(true);
      clearMessages();

      const data = await fetchJson(endpoint, {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

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

      await fetchJson(`${API_URL}/api/categories/${category._id}`, {
        method: "DELETE",
      });

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

      <CategoriesTable
        search={search}
        setSearch={setSearch}
        successMessage={successMessage}
        errorMessage={errorMessage}
        isLoading={isLoading}
        isModalOpen={isModalOpen}
        filteredCategories={filteredCategories}
        deletingId={deletingId}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <CategoryModal
        isOpen={isModalOpen}
        isEditing={isEditing}
        form={form}
        errorMessage={errorMessage}
        isSaving={isSaving}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
      />
    </section>
  );
}

export default CategoriesPage;