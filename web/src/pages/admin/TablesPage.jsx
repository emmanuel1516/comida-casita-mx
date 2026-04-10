import { useEffect, useState } from "react";
import { API_URL } from "../../api/api";
import TablesTable from "./tables/TablesTable";
import TableModal from "./tables/TableModal";
import {
  fetchJson,
  initialForm,
  validateTableForm,
} from "./tables/tableHelpers";
import "./tables-page.css";

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
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [tablesData, waitersData] = await Promise.all([
          fetchJson(`${API_URL}/api/tables`),
          fetchJson(`${API_URL}/api/waiters`),
        ]);

        setTables(tablesData);
        setWaiters(waitersData);
      } catch (error) {
        setErrorMessage(error.message || "Ocurrió un error al obtener las mesas");
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

    const { payload, error } = validateTableForm(form);

    if (error) {
      setErrorMessage(error);
      return;
    }

    const endpoint = isEditing
      ? `${API_URL}/api/tables/${editingTableId}`
      : `${API_URL}/api/tables`;

    try {
      setIsSaving(true);
      clearMessages();

      const data = await fetchJson(endpoint, {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      if (isEditing) {
        setTables((current) =>
          current.map((table) => (table._id === editingTableId ? data : table))
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
      setErrorMessage(error.message || "Ocurrió un error al guardar la mesa");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (table) => {
    const confirmed = window.confirm(
      `Seguro que querés eliminar la mesa ${table.number}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(table._id);
      clearMessages();

      await fetchJson(`${API_URL}/api/tables/${table._id}`, {
        method: "DELETE",
      });

      setTables((current) =>
        current.filter((item) => item._id !== table._id)
      );
      setSuccessMessage("Mesa eliminada correctamente");
    } catch (error) {
      setErrorMessage(error.message || "Ocurrió un error al eliminar la mesa");
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

      <TablesTable
        search={search}
        setSearch={setSearch}
        successMessage={successMessage}
        errorMessage={errorMessage}
        isLoading={isLoading}
        isModalOpen={isModalOpen}
        filteredTables={filteredTables}
        deletingId={deletingId}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <TableModal
        isOpen={isModalOpen}
        isEditing={isEditing}
        form={form}
        waiters={waiters}
        errorMessage={errorMessage}
        isSaving={isSaving}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
      />
    </section>
  );
}

export default TablesPage;