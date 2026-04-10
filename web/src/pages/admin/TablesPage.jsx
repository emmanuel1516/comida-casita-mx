import { useEffect, useState } from "react";
import { API_URL } from "../../api/api";
import "./tables-page.css";

const initialForm = {
  number: "",
  capacity: 4,
  assignedWaiter: "",
  status: "available",
};

function TablesPage() {
  const [search, setSearch] = useState("");
  const [tables, setTables] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTableId, setEditingTableId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const searchTerm = search.trim();
  const isEditing = editingTableId !== null;

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

        const [tablesResponse, waitersResponse] = await Promise.all([
          fetch(`${API_URL}/api/tables`, { headers }),
          fetch(`${API_URL}/api/waiters`, { headers }),
        ]);

        const [tablesData, waitersData] = await Promise.all([
          tablesResponse.json(),
          waitersResponse.json(),
        ]);

        if (!tablesResponse.ok) {
          throw new Error(tablesData.message || "No se pudieron cargar las mesas");
        }

        if (!waitersResponse.ok) {
          throw new Error(waitersData.message || "No se pudieron cargar los meseros");
        }

        setTables(tablesData);
        setWaiters(waitersData);
      } catch (error) {
        setErrorMessage(error.message || "Ocurrio un error al obtener las mesas");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredTables = tables.filter((table) =>
    String(table.number).includes(searchTerm)
  );

  const openCreateModal = () => {
    clearMessages();
    setEditingTableId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (table) => {
    clearMessages();
    setEditingTableId(table._id);
    setForm({
      number: table.number,
      capacity: table.capacity,
      assignedWaiter: table.assignedWaiter?._id || "",
      status: table.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingTableId(null);
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
      number: Number(form.number),
      capacity: Number(form.capacity),
      assignedWaiter: form.assignedWaiter || null,
      status: form.status,
    };

    if (!payload.number || payload.number < 1) {
      setErrorMessage("El numero de mesa debe ser valido");
      return;
    }

    if (!payload.capacity || payload.capacity < 1) {
      setErrorMessage("La capacidad debe ser valida");
      return;
    }

    if (!["available", "occupied"].includes(payload.status)) {
      setErrorMessage("El estado de la mesa no es valido");
      return;
    }

    const endpoint = isEditing
      ? `${API_URL}/api/tables/${editingTableId}`
      : `${API_URL}/api/tables`;

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
              ? "No se pudo actualizar la mesa"
              : "No se pudo crear la mesa")
        );
      }

      if (isEditing) {
        setTables((current) =>
          current.map((table) =>
            table._id === editingTableId ? data : table
          )
        );
        setSuccessMessage("Mesa actualizada correctamente");
      } else {
        setTables((current) => [data, ...current]);
        setSuccessMessage("Mesa creada correctamente");
      }

      setIsModalOpen(false);
      setEditingTableId(null);
      setForm(initialForm);
    } catch (error) {
      setErrorMessage(error.message || "Ocurrio un error al guardar la mesa");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (table) => {
    const confirmed = window.confirm(
      `Seguro que queres eliminar la mesa ${table.number}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(table._id);
      clearMessages();

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/tables/${table._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo eliminar la mesa");
      }

      setTables((current) =>
        current.filter((item) => item._id !== table._id)
      );
      setSuccessMessage("Mesa eliminada correctamente");
    } catch (error) {
      setErrorMessage(error.message || "Ocurrio un error al eliminar la mesa");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="tables-page">
      <div className="tables-page-header">
        <div>
          <h2 className="tables-page-title">Mesas</h2>
          <p className="tables-page-subtitle">
            Gestiona las mesas y asignaciones del restaurante.
          </p>
        </div>

        <button className="tables-page-create-button" onClick={openCreateModal}>
          Nueva mesa
        </button>
      </div>

      <div className="tables-page-toolbar">
        <input
          type="text"
          placeholder="Buscar por numero de mesa..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="tables-page-search"
        />
      </div>

      {successMessage && (
        <div className="tables-page-success">{successMessage}</div>
      )}

      {isLoading ? (
        <div className="tables-page-feedback">Cargando mesas...</div>
      ) : errorMessage && !isModalOpen ? (
        <div className="tables-page-error">{errorMessage}</div>
      ) : (
        <div className="tables-page-table-wrapper">
          <table className="tables-page-table">
            <thead>
              <tr>
                <th>Mesa</th>
                <th>Capacidad</th>
                <th>Mesero asignado</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredTables.length > 0 ? (
                filteredTables.map((table) => (
                  <tr key={table._id}>
                    <td>Mesa {table.number}</td>
                    <td>{table.capacity}</td>
                    <td>{table.assignedWaiter?.name || "Sin asignar"}</td>
                    <td>
                      <span
                        className={`tables-page-status ${
                          table.status === "occupied" ? "occupied" : "available"
                        }`}
                      >
                        {table.status === "occupied" ? "Ocupada" : "Disponible"}
                      </span>
                    </td>
                    <td>
                      <div className="tables-page-actions">
                        <button
                          className="tables-page-edit-button"
                          onClick={() => openEditModal(table)}
                        >
                          Editar
                        </button>
                        <button
                          className="tables-page-delete-button"
                          onClick={() => handleDelete(table)}
                          disabled={deletingId === table._id}
                        >
                          {deletingId === table._id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="tables-page-empty">
                    No se encontraron mesas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="tables-modal-overlay">
          <div className="tables-modal">
            <div className="tables-modal-header">
              <h3>{isEditing ? "Editar mesa" : "Nueva mesa"}</h3>
              <button
                type="button"
                className="tables-modal-close"
                onClick={closeModal}
              >
                x
              </button>
            </div>

            <form className="tables-form" onSubmit={handleSubmit}>
              <div className="tables-form-field">
                <label htmlFor="table-number">Numero</label>
                <input
                  id="table-number"
                  name="number"
                  type="number"
                  min="1"
                  value={form.number}
                  onChange={handleFormChange}
                  placeholder="Ej: 1"
                  required
                />
              </div>

              <div className="tables-form-field">
                <label htmlFor="table-capacity">Capacidad</label>
                <input
                  id="table-capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={handleFormChange}
                  placeholder="Ej: 4"
                  required
                />
              </div>

              <div className="tables-form-field">
                <label htmlFor="table-waiter">Mesero asignado</label>
                <select
                  id="table-waiter"
                  name="assignedWaiter"
                  value={form.assignedWaiter}
                  onChange={handleFormChange}
                >
                  <option value="">Sin asignar</option>
                  {waiters.map((waiter) => (
                    <option key={waiter._id} value={waiter._id}>
                      {waiter.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="tables-form-field">
                <label htmlFor="table-status">Estado</label>
                <select
                  id="table-status"
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  required
                >
                  <option value="available">Disponible</option>
                  <option value="occupied">Ocupada</option>
                </select>
              </div>

              {errorMessage && (
                <div className="tables-page-error">{errorMessage}</div>
              )}

              <div className="tables-form-actions">
                <button
                  type="button"
                  className="tables-form-cancel-button"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="tables-form-save-button"
                  disabled={isSaving}
                >
                  {isSaving
                    ? isEditing
                      ? "Guardando..."
                      : "Creando..."
                    : isEditing
                    ? "Guardar cambios"
                    : "Crear mesa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default TablesPage;
