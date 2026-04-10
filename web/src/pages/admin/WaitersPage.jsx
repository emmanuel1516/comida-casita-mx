import { useEffect, useState } from "react";
import { API_URL } from "../../api/api";
import "./waiters-page.css";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  shift: "mañana",
};

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
      setIsLoading(true);
      setErrorMessage("");

      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/api/waiters`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "No se pudieron cargar los meseros");
        }

        setWaiters(data);
      } catch (error) {
        setErrorMessage(error.message || "Ocurrio un error al obtener los meseros");
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

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      shift: form.shift,
    };

    if (!payload.name) {
      setErrorMessage("El nombre es obligatorio");
      return;
    }

    if (!payload.email) {
      setErrorMessage("El email es obligatorio");
      return;
    }

    if (!payload.phone) {
      setErrorMessage("El telefono es obligatorio");
      return;
    }

    if (!["mañana", "tarde"].includes(payload.shift)) {
      setErrorMessage("El turno seleccionado no es valido");
      return;
    }

    const endpoint = isEditing
      ? `${API_URL}/api/waiters/${editingWaiterId}`
      : `${API_URL}/api/waiters`;

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
              ? "No se pudo actualizar el mesero"
              : "No se pudo crear el mesero")
        );
      }

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
      setErrorMessage(error.message || "Ocurrio un error al guardar el mesero");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (waiter) => {
    const confirmed = window.confirm(
      `Seguro que queres eliminar a ${waiter.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(waiter._id);
      clearMessages();

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/waiters/${waiter._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo eliminar el mesero");
      }

      setWaiters((current) =>
        current.filter((item) => item._id !== waiter._id)
      );
      setSuccessMessage("Mesero eliminado correctamente");
    } catch (error) {
      setErrorMessage(error.message || "Ocurrio un error al eliminar el mesero");
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
            Gestiona el personal de atencion del restaurante.
          </p>
        </div>

        <button
          className="waiters-page-create-button"
          onClick={openCreateModal}
        >
          Nuevo mesero
        </button>
      </div>

      <div className="waiters-page-toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre, email o telefono..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="waiters-page-search"
        />
      </div>

      {successMessage && (
        <div className="waiters-page-success">{successMessage}</div>
      )}

      {isLoading ? (
        <div className="waiters-page-feedback">Cargando meseros...</div>
      ) : errorMessage && !isModalOpen ? (
        <div className="waiters-page-error">{errorMessage}</div>
      ) : (
        <div className="waiters-page-table-wrapper">
          <table className="waiters-page-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Telefono</th>
                <th>Turno</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredWaiters.length > 0 ? (
                filteredWaiters.map((waiter) => (
                  <tr key={waiter._id}>
                    <td>{waiter.name}</td>
                    <td>{waiter.email}</td>
                    <td>{waiter.phone}</td>
                    <td>
                        <span className="waiters-page-shift">
                        {waiter.shift === "tarde" ? "Tarde" : "Mañana"}
                      </span>
                    </td>
                    <td>
                      <div className="waiters-page-actions">
                        <button
                          className="waiters-page-edit-button"
                          onClick={() => openEditModal(waiter)}
                        >
                          Editar
                        </button>
                        <button
                          className="waiters-page-delete-button"
                          onClick={() => handleDelete(waiter)}
                          disabled={deletingId === waiter._id}
                        >
                          {deletingId === waiter._id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="waiters-page-empty">
                    No se encontraron meseros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="waiters-modal-overlay">
          <div className="waiters-modal">
            <div className="waiters-modal-header">
              <h3>{isEditing ? "Editar mesero" : "Nuevo mesero"}</h3>
              <button
                type="button"
                className="waiters-modal-close"
                onClick={closeModal}
              >
                x
              </button>
            </div>

            <form className="waiters-form" onSubmit={handleSubmit}>
              <div className="waiters-form-field">
                <label htmlFor="waiter-name">Nombre</label>
                <input
                  id="waiter-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Ej: Juan Perez"
                  required
                />
              </div>

              <div className="waiters-form-field">
                <label htmlFor="waiter-email">Email</label>
                <input
                  id="waiter-email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="Ej: juan@mail.com"
                  required
                />
              </div>

              <div className="waiters-form-field">
                <label htmlFor="waiter-phone">Telefono</label>
                <input
                  id="waiter-phone"
                  name="phone"
                  type="text"
                  value={form.phone}
                  onChange={handleFormChange}
                  placeholder="Ej: 2342..."
                  required
                />
              </div>

              <div className="waiters-form-field">
                <label htmlFor="waiter-shift">Turno</label>
                <select
                  id="waiter-shift"
                  name="shift"
                  value={form.shift}
                  onChange={handleFormChange}
                  required
                >
                  <option value="mañana">Mañana</option>
                  <option value="tarde">Tarde</option>
                </select>
              </div>

              {errorMessage && (
                <div className="waiters-page-error">{errorMessage}</div>
              )}

              <div className="waiters-form-actions">
                <button
                  type="button"
                  className="waiters-form-cancel-button"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="waiters-form-save-button"
                  disabled={isSaving}
                >
                  {isSaving
                    ? isEditing
                      ? "Guardando..."
                      : "Creando..."
                    : isEditing
                    ? "Guardar cambios"
                    : "Crear mesero"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default WaitersPage;
