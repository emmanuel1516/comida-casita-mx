import { useEffect, useState } from "react";
import"./orders-page.css";
import { API_URL } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import OrdersTable from "./OrdersTable";
import OrderModal from "./OrderModal";
import {
  fetchJson,
  formatOrderDate,
  formatOrderTime,
  validateOrderForm,
} from "./orderHelpers";

const initialForm = {
  type: "mesa",
  table: "",
  customerName: "",
  customerPhone: "",
  deliveryAddress: "",
  specialNotes: "",
  waiter: "",
  status: "pendiente",
  shift: "mañana",
  tip: 0,
  items: [{ dish: "", quantity: 1 }],
};

const ORDERS_POLLING_INTERVAL_MS = 10000;

function OrdersPage() {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const searchTerm = search.trim().toLowerCase();
  const isEditing = editingOrderId !== null;
  const isAdmin = user?.role === "admin";

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const getAssignedWaiterId = (tableId, sourceTables = tables) => {
    if (!tableId) return "";

    const selectedTable = sourceTables.find((table) => table._id === tableId);
    if (!selectedTable?.assignedWaiter) return "";

    return typeof selectedTable.assignedWaiter === "string"
      ? selectedTable.assignedWaiter
      : selectedTable.assignedWaiter._id || "";
  };

  const getAssignedWaiterName = (table) => {
    if (!table?.assignedWaiter) return "";

    if (typeof table.assignedWaiter === "string") {
      return waiters.find((waiter) => waiter._id === table.assignedWaiter)?.name || "";
    }

    return table.assignedWaiter.name || "";
  };

  const selectedTable = tables.find((table) => table._id === form.table) || null;
  const assignedWaiterId = getAssignedWaiterId(form.table);
  const assignedWaiterName = getAssignedWaiterName(selectedTable);

  const loadTables = async () => {
    const data = await fetchJson(`${API_URL}/api/tables`);
    setTables(data);
    return data;
  };

  const loadData = async ({ showLoader = false } = {}) => {
    try {
      if (showLoader) setIsLoading(true);

      const [ordersData, tablesData, waitersData, dishesData] = await Promise.all([
        fetchJson(`${API_URL}/api/orders`),
        fetchJson(`${API_URL}/api/tables`),
        fetchJson(`${API_URL}/api/waiters`),
        fetchJson(`${API_URL}/api/dishes`),
      ]);

      setOrders(ordersData);
      setTables(tablesData);
      setWaiters(waitersData);
      setDishes(dishesData);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "Ocurrió un error al cargar los pedidos");
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData({ showLoader: true });

    const refreshOrders = () => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    };

    const intervalId = window.setInterval(refreshOrders, ORDERS_POLLING_INTERVAL_MS);
    document.addEventListener("visibilitychange", refreshOrders);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshOrders);
    };
  }, []);

  useEffect(() => {
    if (form.type !== "mesa" || form.waiter === assignedWaiterId) return;

    setForm((current) =>
      current.type === "mesa" ? { ...current, waiter: assignedWaiterId } : current
    );
  }, [assignedWaiterId, form.type, form.waiter]);

  const filteredOrders = orders.filter((order) => {
    const tableNumber = order.table ? String(order.table.number) : "";
    const dateText = formatOrderDate(order.createdAt).toLowerCase();
    const timeText = formatOrderTime(order.createdAt).toLowerCase();

    return (
      order.type.toLowerCase().includes(searchTerm) ||
      order.customerName.toLowerCase().includes(searchTerm) ||
      order.status.toLowerCase().includes(searchTerm) ||
      order.shift.toLowerCase().includes(searchTerm) ||
      tableNumber.includes(searchTerm) ||
      dateText.includes(searchTerm) ||
      timeText.includes(searchTerm)
    );
  });

  const itemsWithTotals = form.items.map((item) => {
    const dish = dishes.find(({ _id }) => _id === item.dish);
    const price = dish ? Number(dish.price) : 0;
    const quantity = Number(item.quantity || 0);

    return {
      ...item,
      name: dish ? dish.name : "",
      price,
      subtotal: price * quantity,
    };
  });

  const total = itemsWithTotals.reduce((acc, item) => acc + item.subtotal, 0);

  const availableTables = tables.filter(
    (table) => table.status === "available" || table._id === form.table
  );

  const openCreateModal = async () => {
    clearMessages();
    try {
      await loadTables();
      setEditingOrderId(null);
      setForm(initialForm);
      setIsModalOpen(true);
    } catch (error) {
      setErrorMessage(error.message || "No se pudieron cargar las mesas");
    }
  };

  const openEditModal = async (order) => {
    clearMessages();

    try {
      const latestTables = await loadTables();

      setEditingOrderId(order._id);
      setForm({
        type: order.type,
        table: order.table?._id || "",
        customerName: order.customerName || "",
        customerPhone: order.customerPhone || "",
        deliveryAddress: order.deliveryAddress || "",
        specialNotes: order.specialNotes || "",
        waiter:
          order.type === "mesa"
            ? getAssignedWaiterId(order.table?._id || "", latestTables) ||
              order.waiter?._id ||
              ""
            : order.waiter?._id || "",
        status: order.status,
        shift: order.shift,
        tip: order.tip ?? 0,
        items: order.items.length
          ? order.items.map((item) => ({
              dish: item.dish?._id || "",
              quantity: item.quantity,
            }))
          : [{ dish: "", quantity: 1 }],
      });

      setIsModalOpen(true);
    } catch (error) {
      setErrorMessage(error.message || "No se pudieron cargar las mesas");
    }
  };

  const closeModal = () => {
    if (isSaving) return;

    setIsModalOpen(false);
    setEditingOrderId(null);
    setForm(initialForm);
  };

  const handleFormChange = ({ target: { name, value } }) => {
    setForm((current) => {
      if (name === "table") {
        return { ...current, table: value, waiter: getAssignedWaiterId(value) };
      }

      if (name === "type") {
        const isDelivery = value === "delivery";

        return {
          ...current,
          type: value,
          table: isDelivery ? "" : current.table,
          waiter: isDelivery ? "" : getAssignedWaiterId(current.table),
        };
      }

      return {
        ...current,
        [name]: name === "tip" ? Number(value) : value,
      };
    });

    if (errorMessage) setErrorMessage("");
  };

  const handleItemChange = (index, field, value) => {
    setForm((current) => {
      const nextItems = [...current.items];
      nextItems[index] = {
        ...nextItems[index],
        [field]: field === "quantity" ? Number(value) : value,
      };

      return { ...current, items: nextItems };
    });
  };

  const handleAddItem = () => {
    setForm((current) => ({
      ...current,
      items: [...current.items, { dish: "", quantity: 1 }],
    }));
  };

  const handleRemoveItem = (index) => {
    setForm((current) => {
      if (current.items.length === 1) return current;

      return {
        ...current,
        items: current.items.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateOrderForm({
      form,
      assignedWaiterId,
      items: itemsWithTotals,
    });

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    const payload = {
      type: form.type,
      table: form.type === "mesa" ? form.table : null,
      customerName: form.type === "delivery" ? form.customerName.trim() : "",
      customerPhone: form.type === "delivery" ? form.customerPhone.trim() : "",
      deliveryAddress: form.type === "delivery" ? form.deliveryAddress.trim() : "",
      specialNotes: form.specialNotes.trim(),
      waiter: form.type === "mesa" ? assignedWaiterId : form.waiter,
      items: itemsWithTotals.map((item) => ({
        dish: item.dish,
        name: item.name,
        price: item.price,
        quantity: Number(item.quantity),
        subtotal: item.subtotal,
      })),
      status: form.status,
      shift: form.shift,
      total,
      tip: Number(form.tip || 0),
    };

    const endpoint = isEditing
      ? `${API_URL}/api/orders/${editingOrderId}`
      : `${API_URL}/api/orders`;

    try {
      setIsSaving(true);
      clearMessages();

      const data = await fetchJson(endpoint, {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      if (isEditing) {
        setOrders((current) =>
          current.map((order) => (order._id === editingOrderId ? data : order))
        );
        setSuccessMessage("Pedido actualizado correctamente");
      } else {
        setOrders((current) => [data, ...current]);
        setSuccessMessage("Pedido creado correctamente");
      }

      loadTables().catch(() => {});
      setIsModalOpen(false);
      setEditingOrderId(null);
      setForm(initialForm);
    } catch (error) {
      setErrorMessage(error.message || "Ocurrió un error al guardar el pedido");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (order) => {
    const confirmed = window.confirm("Seguro que querés eliminar este pedido?");
    if (!confirmed) return;

    try {
      setDeletingId(order._id);
      clearMessages();

      await fetchJson(`${API_URL}/api/orders/${order._id}`, {
        method: "DELETE",
      });

      setOrders((current) => current.filter((item) => item._id !== order._id));
      setSuccessMessage("Pedido eliminado correctamente");
      loadTables().catch(() => {});
    } catch (error) {
      setErrorMessage(error.message || "Ocurrió un error al eliminar el pedido");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="orders-page">
      <div className="orders-page-header">
        <div>
          <h2 className="orders-page-title">Pedidos</h2>
          <p className="orders-page-subtitle">Gestiona pedidos de mesa y delivery.</p>
        </div>

        <button className="orders-page-create-button" onClick={openCreateModal}>
          Nuevo pedido
        </button>
      </div>

      <OrdersTable
        search={search}
        setSearch={setSearch}
        successMessage={successMessage}
        errorMessage={errorMessage}
        isLoading={isLoading}
        filteredOrders={filteredOrders}
        isAdmin={isAdmin}
        deletingId={deletingId}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      <OrderModal
        isOpen={isModalOpen}
        isEditing={isEditing}
        form={form}
        waiters={waiters}
        dishes={dishes}
        availableTables={availableTables}
        assignedWaiterId={assignedWaiterId}
        assignedWaiterName={assignedWaiterName}
        itemsWithTotals={itemsWithTotals}
        total={total}
        errorMessage={errorMessage}
        isSaving={isSaving}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
        onItemChange={handleItemChange}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
      />
    </section>
  );
}

export default OrdersPage;