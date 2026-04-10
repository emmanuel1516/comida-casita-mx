import { useEffect, useState } from "react";
import { API_URL } from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import "./orders-page.css";

const initialForm = {
  type: "mesa",
  table: "",
  customerName: "",
  customerPhone: "",
  deliveryAddress: "",
  specialNotes: "",
  waiter: "",
  status: "pendiente",
  shift: "ma\u00f1ana",
  tip: 0,
  items: [{ dish: "", quantity: 1 }],
};

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

        const [ordersResponse, tablesResponse, waitersResponse, dishesResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/orders`, { headers }),
            fetch(`${API_URL}/api/tables`, { headers }),
            fetch(`${API_URL}/api/waiters`, { headers }),
            fetch(`${API_URL}/api/dishes`, { headers }),
          ]);

        const [ordersData, tablesData, waitersData, dishesData] =
          await Promise.all([
            ordersResponse.json(),
            tablesResponse.json(),
            waitersResponse.json(),
            dishesResponse.json(),
          ]);

        if (!ordersResponse.ok) {
          throw new Error(ordersData.message || "No se pudieron cargar los pedidos");
        }

        if (!tablesResponse.ok) {
          throw new Error(tablesData.message || "No se pudieron cargar las mesas");
        }

        if (!waitersResponse.ok) {
          throw new Error(waitersData.message || "No se pudieron cargar los meseros");
        }

        if (!dishesResponse.ok) {
          throw new Error(dishesData.message || "No se pudieron cargar los platillos");
        }

        setOrders(ordersData);
        setTables(tablesData);
        setWaiters(waitersData);
        setDishes(dishesData);
      } catch (error) {
        setErrorMessage(error.message || "Ocurrio un error al cargar los pedidos");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const tableNumber = order.table ? String(order.table.number) : "";

    return (
      order.type.toLowerCase().includes(searchTerm) ||
      order.customerName.toLowerCase().includes(searchTerm) ||
      order.status.toLowerCase().includes(searchTerm) ||
      order.shift.toLowerCase().includes(searchTerm) ||
      tableNumber.includes(searchTerm)
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

  const openCreateModal = () => {
    clearMessages();
    setEditingOrderId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEditModal = (order) => {
    clearMessages();
    setEditingOrderId(order._id);
    setForm({
      type: order.type,
      table: order.table?._id || "",
      customerName: order.customerName || "",
      customerPhone: order.customerPhone || "",
      deliveryAddress: order.deliveryAddress || "",
      specialNotes: order.specialNotes || "",
      waiter: order.waiter?._id || "",
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
  };

  const closeModal = () => {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingOrderId(null);
    setForm(initialForm);
  };

  const handleFormChange = ({ target }) => {
    const { name, value } = target;

    setForm((current) => ({
      ...current,
      [name]: name === "tip" ? Number(value) : value,
    }));

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const handleItemChange = (index, field, value) => {
    setForm((current) => {
      const nextItems = [...current.items];
      nextItems[index] = {
        ...nextItems[index],
        [field]: field === "quantity" ? Number(value) : value,
      };

      return {
        ...current,
        items: nextItems,
      };
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
      if (current.items.length === 1) {
        return current;
      }

      return {
        ...current,
        items: current.items.filter((_, itemIndex) => itemIndex !== index),
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!["mesa", "delivery"].includes(form.type)) {
      setErrorMessage("El tipo de pedido no es valido");
      return;
    }

    if (form.type === "mesa" && !form.table) {
      setErrorMessage("Debes seleccionar una mesa");
      return;
    }

    if (form.type === "delivery") {
      if (!form.customerName.trim()) {
        setErrorMessage("El nombre del cliente es obligatorio");
        return;
      }

      if (!form.customerPhone.trim()) {
        setErrorMessage("El telefono del cliente es obligatorio");
        return;
      }

      if (!form.deliveryAddress.trim()) {
        setErrorMessage("La direccion de entrega es obligatoria");
        return;
      }
    }

    if (!form.waiter) {
      setErrorMessage("Debes seleccionar un mesero");
      return;
    }

    if (!["pendiente", "preparando", "listo", "entregado"].includes(form.status)) {
      setErrorMessage("El estado del pedido no es valido");
      return;
    }

    if (!["ma\u00f1ana", "tarde"].includes(form.shift)) {
      setErrorMessage("El turno del pedido no es valido");
      return;
    }

    if (itemsWithTotals.length === 0) {
      setErrorMessage("El pedido debe tener al menos un item");
      return;
    }

    for (const item of itemsWithTotals) {
      if (!item.dish) {
        setErrorMessage("Todos los items deben tener un platillo");
        return;
      }

      if (!item.quantity || item.quantity < 1) {
        setErrorMessage("La cantidad de cada item debe ser valida");
        return;
      }
    }

    if (Number(form.tip) < 0) {
      setErrorMessage("La propina no puede ser negativa");
      return;
    }

    const payload = {
      type: form.type,
      table: form.type === "mesa" ? form.table : null,
      customerName: form.type === "delivery" ? form.customerName.trim() : "",
      customerPhone: form.type === "delivery" ? form.customerPhone.trim() : "",
      deliveryAddress:
        form.type === "delivery" ? form.deliveryAddress.trim() : "",
      specialNotes: form.specialNotes.trim(),
      waiter: form.waiter,
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
              ? "No se pudo actualizar el pedido"
              : "No se pudo crear el pedido")
        );
      }

      if (isEditing) {
        setOrders((current) =>
          current.map((order) =>
            order._id === editingOrderId ? data : order
          )
        );
        setSuccessMessage("Pedido actualizado correctamente");
      } else {
        setOrders((current) => [data, ...current]);
        setSuccessMessage("Pedido creado correctamente");
      }

      setIsModalOpen(false);
      setEditingOrderId(null);
      setForm(initialForm);
    } catch (error) {
      setErrorMessage(error.message || "Ocurrio un error al guardar el pedido");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (order) => {
    const confirmed = window.confirm("Seguro que queres eliminar este pedido?");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(order._id);
      clearMessages();

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/orders/${order._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo eliminar el pedido");
      }

      setOrders((current) =>
        current.filter((item) => item._id !== order._id)
      );
      setSuccessMessage("Pedido eliminado correctamente");
    } catch (error) {
      setErrorMessage(error.message || "Ocurrio un error al eliminar el pedido");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="orders-page">
      <div className="orders-page-header">
        <div>
          <h2 className="orders-page-title">Pedidos</h2>
          <p className="orders-page-subtitle">
            Gestiona pedidos de mesa y delivery.
          </p>
        </div>

        <button className="orders-page-create-button" onClick={openCreateModal}>
          Nuevo pedido
        </button>
      </div>

      <div className="orders-page-toolbar">
        <input
          type="text"
          placeholder="Buscar por tipo, cliente, estado, turno o mesa..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="orders-page-search"
        />
      </div>

      {successMessage && (
        <div className="orders-page-success">{successMessage}</div>
      )}

      {isLoading ? (
        <div className="orders-page-feedback">Cargando pedidos...</div>
      ) : errorMessage && !isModalOpen ? (
        <div className="orders-page-error">{errorMessage}</div>
      ) : (
        <div className="orders-page-table-wrapper">
          <table className="orders-page-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Mesa / Cliente</th>
                <th>Mesero</th>
                <th>Items</th>
                <th>Estado</th>
                <th>Turno</th>
                <th>Total</th>
                <th>Propina</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.type === "delivery" ? "Delivery" : "Mesa"}</td>
                    <td>
                      {order.type === "mesa"
                        ? `Mesa ${order.table?.number ?? "-"}`
                        : order.customerName || "Sin cliente"}
                    </td>
                    <td>{order.waiter?.name || "Sin mesero"}</td>
                    <td>{order.items.length}</td>
                    <td>
                      <span className={`orders-page-status ${order.status}`}>
                        {{
                          pendiente: "Pendiente",
                          preparando: "Preparando",
                          listo: "Listo",
                          entregado: "Entregado",
                        }[order.status] || order.status}
                      </span>
                    </td>
                    <td>{order.shift === "tarde" ? "Tarde" : "Ma\u00f1ana"}</td>
                    <td>${Number(order.total || 0).toFixed(2)}</td>
                    <td>${Number(order.tip || 0).toFixed(2)}</td>
                    <td>
                      <div className="orders-page-actions">
                        <button
                          className="orders-page-edit-button"
                          onClick={() => openEditModal(order)}
                        >
                          Editar
                        </button>
                        {isAdmin ? (
                          <button
                            className="orders-page-delete-button"
                            onClick={() => handleDelete(order)}
                            disabled={deletingId === order._id}
                          >
                            {deletingId === order._id ? "Eliminando..." : "Eliminar"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="orders-page-empty">
                    No se encontraron pedidos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="orders-modal-overlay">
          <div className="orders-modal">
            <div className="orders-modal-header">
              <h3>{isEditing ? "Editar pedido" : "Nuevo pedido"}</h3>
              <button
                type="button"
                className="orders-modal-close"
                onClick={closeModal}
              >
                &times;
              </button>
            </div>

            <form className="orders-form" onSubmit={handleSubmit}>
              <div className="orders-form-grid">
                <div className="orders-form-field">
                  <label htmlFor="order-type">Tipo</label>
                  <select
                    id="order-type"
                    name="type"
                    value={form.type}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="mesa">Mesa</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                <div className="orders-form-field">
                  <label htmlFor="order-waiter">Mesero</label>
                  <select
                    id="order-waiter"
                    name="waiter"
                    value={form.waiter}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Seleccionar mesero</option>
                    {waiters.map((waiter) => (
                      <option key={waiter._id} value={waiter._id}>
                        {waiter.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="orders-form-field">
                  <label htmlFor="order-shift">Turno</label>
                  <select
                    id="order-shift"
                    name="shift"
                    value={form.shift}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="ma\u00f1ana">Ma\u00f1ana</option>
                    <option value="tarde">Tarde</option>
                  </select>
                </div>

                <div className="orders-form-field">
                  <label htmlFor="order-status">Estado</label>
                  <select
                    id="order-status"
                    name="status"
                    value={form.status}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="preparando">Preparando</option>
                    <option value="listo">Listo</option>
                    <option value="entregado">Entregado</option>
                  </select>
                </div>

                {form.type === "mesa" ? (
                  <div className="orders-form-field orders-form-full">
                    <label htmlFor="order-table">Mesa</label>
                    <select
                      id="order-table"
                      name="table"
                      value={form.table}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Seleccionar mesa</option>
                      {tables.map((table) => (
                        <option key={table._id} value={table._id}>
                          Mesa {table.number}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="orders-form-field">
                      <label htmlFor="order-customer-name">Cliente</label>
                      <input
                        id="order-customer-name"
                        name="customerName"
                        type="text"
                        value={form.customerName}
                        onChange={handleFormChange}
                        placeholder="Nombre del cliente"
                      />
                    </div>

                    <div className="orders-form-field">
                      <label htmlFor="order-customer-phone">Telefono</label>
                      <input
                        id="order-customer-phone"
                        name="customerPhone"
                        type="text"
                        value={form.customerPhone}
                        onChange={handleFormChange}
                        placeholder="Telefono del cliente"
                      />
                    </div>

                    <div className="orders-form-field orders-form-full">
                      <label htmlFor="order-address">Direccion</label>
                      <input
                        id="order-address"
                        name="deliveryAddress"
                        type="text"
                        value={form.deliveryAddress}
                        onChange={handleFormChange}
                        placeholder="Direccion de entrega"
                      />
                    </div>
                  </>
                )}

                <div className="orders-form-field orders-form-full">
                  <label htmlFor="order-notes">Notas especiales</label>
                  <textarea
                    id="order-notes"
                    name="specialNotes"
                    value={form.specialNotes}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="Notas especiales del pedido"
                  />
                </div>
              </div>

              <div className="orders-items-section">
                <div className="orders-items-header">
                  <h4>Items del pedido</h4>
                  <button
                    type="button"
                    className="orders-add-item-button"
                    onClick={handleAddItem}
                  >
                    Agregar item
                  </button>
                </div>

                <div className="orders-items-list">
                  {itemsWithTotals.map((item, index) => (
                    <div key={index} className="orders-item-card">
                      <div className="orders-form-field">
                        <label>Platillo</label>
                        <select
                          value={item.dish}
                          onChange={(event) =>
                            handleItemChange(index, "dish", event.target.value)
                          }
                          required
                        >
                          <option value="">Seleccionar platillo</option>
                          {dishes.map((dish) => (
                            <option key={dish._id} value={dish._id}>
                              {dish.name} - ${Number(dish.price || 0).toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="orders-form-field">
                        <label>Cantidad</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            handleItemChange(index, "quantity", event.target.value)
                          }
                          required
                        />
                      </div>

                      <div className="orders-item-summary">
                        <span>Precio: ${item.price.toFixed(2)}</span>
                        <span>Subtotal: ${item.subtotal.toFixed(2)}</span>
                      </div>

                      <button
                        type="button"
                        className="orders-remove-item-button"
                        onClick={() => handleRemoveItem(index)}
                        disabled={form.items.length === 1}
                      >
                        Quitar item
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="orders-totals">
                <div className="orders-form-field">
                  <label htmlFor="order-tip">Propina</label>
                  <input
                    id="order-tip"
                    name="tip"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.tip}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="orders-total-box">
                  <span>Total pedido</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>
              </div>

              {errorMessage && (
                <div className="orders-page-error">{errorMessage}</div>
              )}

              <div className="orders-form-actions">
                <button
                  type="button"
                  className="orders-form-cancel-button"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="orders-form-save-button"
                  disabled={isSaving}
                >
                  {isSaving
                    ? isEditing
                      ? "Guardando..."
                      : "Creando..."
                    : isEditing
                    ? "Guardar cambios"
                    : "Crear pedido"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default OrdersPage;
