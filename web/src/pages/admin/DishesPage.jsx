import { useEffect, useState } from "react";
import { API_URL } from "../../api/api";
import DishesTable from "./dishes/DishesTable";
import DishModal from "./dishes/DishModal";
import {
  fetchJson,
  initialForm,
  validateDishForm,
} from "./dishes/dishHelpers";
import "./dishes-page.css";

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
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [dishesData, categoriesData] = await Promise.all([
          fetchJson(`${API_URL}/api/dishes`),
          fetchJson(`${API_URL}/api/categories`),
        ]);

        setDishes(dishesData);
        setCategories(categoriesData);
      } catch (error) {
        setErrorMessage(
          error.message || "Ocurrió un error al obtener los platillos"
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

    const { payload, error } = validateDishForm(form);

    if (error) {
      setErrorMessage(error);
      return;
    }

    const endpoint = isEditing
      ? `${API_URL}/api/dishes/${editingDishId}`
      : `${API_URL}/api/dishes`;

    try {
      setIsSaving(true);
      clearMessages();

      const data = await fetchJson(endpoint, {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      if (isEditing) {
        setDishes((current) =>
          current.map((dish) => (dish._id === editingDishId ? data : dish))
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
        error.message || "Ocurrió un error al guardar el platillo"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (dish) => {
    const confirmed = window.confirm(
      `Seguro que querés eliminar ${dish.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(dish._id);
      clearMessages();

      await fetchJson(`${API_URL}/api/dishes/${dish._id}`, {
        method: "DELETE",
      });

      setDishes((current) =>
        current.filter((item) => item._id !== dish._id)
      );
      setSuccessMessage("Platillo eliminado correctamente");
    } catch (error) {
      setErrorMessage(
        error.message || "Ocurrió un error al eliminar el platillo"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="dishes-page">
      <div className="dishes-page-header">
        <div>
          <h2 className="dishes-page-title">Platillos</h2>
          <p className="dishes-page-subtitle">
            Gestiona el catálogo de platillos del restaurante.
          </p>
        </div>

        <button className="dishes-page-create-button" onClick={openCreateModal}>
          Nuevo platillo
        </button>
      </div>

      <DishesTable
        search={search}
        setSearch={setSearch}
        successMessage={successMessage}
        errorMessage={errorMessage}
        isLoading={isLoading}
        isModalOpen={isModalOpen}
        filteredDishes={filteredDishes}
        categories={categories}
        deletingId={deletingId}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <DishModal
        isOpen={isModalOpen}
        isEditing={isEditing}
        form={form}
        categories={categories}
        errorMessage={errorMessage}
        isSaving={isSaving}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
      />
    </section>
  );
}

export default DishesPage;