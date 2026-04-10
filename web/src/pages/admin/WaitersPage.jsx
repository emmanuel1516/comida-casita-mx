import { useEffect, useState } from "react";
import { API_URL } from "../../api/api";
import WaitersTable from "./waiters/WaitersTable";
import WaiterModal from "./waiters/WaiterModal";
import {
  fetchJson,
  initialForm,
  validateWaiterForm,
} from "./waiters/waiterHelpers";
import "./waiters-page.css";

function WaitersPage() {
  const [search, setSearch] = useState("");
  const [waiters, setWaiters] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWaiterId, setEditingWaiterId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const searchTerm = search.trim().toLowerCase();
  const isEditing = editingWaiterId !== null;

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  useEffect(() => {
    const loadWaiters = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await fetchJson(`${API_URL}/api/waiters`);
        setWaiters(data);
      } catch (error) {
        setErrorMessage(error.message || "Ocurrió un error al obtener los meseros");
      } finally {
        setIsLoading(false);
      }
    };

    loadWaiters();
  }, []);

  const filteredWaiters = waiters.filter((waiter) => {
    return (
      waiter.name.toLowerCase().includes(searchTerm) ||
      waiter.email.toLowerCase().includes(searchTerm) ||
      waiter.phone.toLowerCase().includes(searchTerm)
    );
  });

  const openCreateModal = () => {
    clearMessages();
    setEditingWaiterId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (waiter) => {
    clearMessages();
    setEditingWaiterId(waiter._id);
    setForm({
      name: waiter.name,
      email: waiter.email,
      phone: waiter.phone,
      shift: waiter.shift,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingWaiterId(null);
    setForm(initialForm);
  };

  const handleFormChange = ({ target }) => {
    const { name, value } = target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { payload, error } = validateWaiterForm(form);

    if (error) {
      setErrorMessage(error);
      return;
    }

    const endpoint = isEditing
      ? `${API_URL}/api/waiters/${editingWaiterId}`
      : `${API_URL}/api/waiters`;

    try {
      setIsSaving(true);
      clearMessages();

      const data = await fetchJson(endpoint, {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      if (isEditing) {
        setWaiters((current) =>
          current.map((waiter) =>
            waiter._id === editingWaiterId ? data : waiter
          )
        );
        setSuccessMessage("Mesero actualizado correctamente");
      } else {
        setWaiters((current) => [data, ...current]);
        setSuccessMessage("Mesero creado correctamente");
      }

      setIsModalOpen(false);
      setEditingWaiterId(null);
      setForm(initialForm);
    } catch (error) {
      setErrorMessage(error.message || "Ocurrió un error al guardar el mesero");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (waiter) => {
    const confirmed = window.confirm(
      `Seguro que querés eliminar a ${waiter.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(waiter._id);
      clearMessages();

      await fetchJson(`${API_URL}/api/waiters/${waiter._id}`, {
        method: "DELETE",
      });

      setWaiters((current) =>
        current.filter((item) => item._id !== waiter._id)
      );
      setSuccessMessage("Mesero eliminado correctamente");
    } catch (error) {
      setErrorMessage(error.message || "Ocurrió un error al eliminar el mesero");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="waiters-page">
      <div className="waiters-page-header">
        <div>
          <h2 className="waiters-page-title">Meseros</h2>
          <p className="waiters-page-subtitle">
            Gestiona el personal de atención del restaurante.
          </p>
        </div>

        <button
          className="waiters-page-create-button"
          onClick={openCreateModal}
        >
          Nuevo mesero
        </button>
      </div>

      <WaitersTable
        search={search}
        setSearch={setSearch}
        successMessage={successMessage}
        errorMessage={errorMessage}
        isLoading={isLoading}
        isModalOpen={isModalOpen}
        filteredWaiters={filteredWaiters}
        deletingId={deletingId}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <WaiterModal
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

export default WaitersPage;