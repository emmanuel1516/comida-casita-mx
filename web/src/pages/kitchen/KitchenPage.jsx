import { useEffect, useState } from "react";
import { API_URL } from "../../api/api";
import "./kitchen-page.css";

const KITCHEN_POLLING_INTERVAL_MS = 10000;

function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [closingOrderId, setClosingOrderId] = useState(null);
  const [tipValues, setTipValues] = useState({});

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const loadOrders = async ({ showLoader = false } = {}) => {
    try {
      if (showLoader) {
        setIsLoading(true);
      }

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudieron cargar los pedidos");
      }

      setOrders(data);
      setTipValues((current) => {
        const nextValues = { ...current };

        data.forEach((order) => {
          if (nextValues[order._id] === undefined) {
            nextValues[order._id] = String(Number(order.tip || 0));
          }
        });

        return nextValues;
      });
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "Ocurrió un error al obtener los pedidos");
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadOrders({ showLoader: true });

    const refreshKitchen = () => {
      if (document.visibilityState === "visible") {
        loadOrders();
      }
    };

    const intervalId = window.setInterval(
      refreshKitchen,
      KITCHEN_POLLING_INTERVAL_MS
    );
    document.addEventListener("visibilitychange", refreshKitchen);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshKitchen);
    };
  }, []);

  const kitchenOrders = orders
    .filter((order) => ["pendiente", "preparando", "listo"].includes(order.status))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const formatDateTime = (dateValue) => {
    if (!dateValue) {
      return "Sin fecha";
    }

    return new Date(dateValue).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNextStatus = (order) => {
    if (order.status === "pendiente") {
      return "preparando";
    }

    if (order.status === "preparando") {
      return order.type === "delivery" ? "entregado" : "listo";
    }

    return "";
  };

  const getNextStatusLabel = (order) => {
    if (order.status === "pendiente") {
      return "Marcar como preparando";
    }

    if (order.status === "preparando") {
      return order.type === "delivery"
        ? "Marcar como entregado"
        : "Marcar como listo";
    }

    return "";
  };

  const isClosingTransition = (order, nextStatus) =>
    (order.type === "mesa" && nextStatus === "listo") ||
    (order.type === "delivery" && nextStatus === "entregado");

  const buildUpdatePayload = (order, nextStatus, nextTip) => ({
    type: order.type,
    table: order.type === "mesa" ? order.table?._id || null : null,
    customerName: order.type === "delivery" ? order.customerName || "" : "",
    customerPhone: order.type === "delivery" ? order.customerPhone || "" : "",
    deliveryAddress: order.type === "delivery" ? order.deliveryAddress || "" : "",
    specialNotes: order.specialNotes || "",
    waiter: order.waiter?._id || "",
    items: order.items.map((item) => ({
      dish: item.dish?._id || item.dish,
      name: item.name,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 0),
      subtotal: Number(item.subtotal || 0),
    })),
    status: nextStatus,
    shift: order.shift,
    total: Number(order.total || 0),
    tip: Number(nextTip || 0),
  });

  const handleTipChange = (orderId, value) => {
    setTipValues((current) => ({
      ...current,
      [orderId]: value,
    }));
  };

  const handleAdvanceStatus = async (order) => {
    const nextStatus = getNextStatus(order);

    if (!nextStatus) {
      return;
    }

    if (isClosingTransition(order, nextStatus)) {
      setClosingOrderId(order._id);
      setTipValues((current) => ({
        ...current,
        [order._id]:
          current[order._id] !== undefined
            ? current[order._id]
            : String(Number(order.tip || 0)),
      }));
      return;
    }

    try {
      setUpdatingId(order._id);
      clearMessages();

      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/api/orders/${order._id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo actualizar el estado");
      }

      setOrders((current) =>
        current.map((item) => (item._id === order._id ? data : item))
      );
      setSuccessMessage("Estado del pedido actualizado correctamente");
    } catch (error) {
      setErrorMessage(error.message || "Ocurrió un error al actualizar el pedido");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCloseOrder = async (order) => {
    const nextStatus = getNextStatus(order);

    if (!nextStatus) {
      return;
    }

    const rawTip = tipValues[order._id] ?? String(Number(order.tip || 0));
    const parsedTip = Number(rawTip);

    if (Number.isNaN(parsedTip) || parsedTip < 0) {
      setErrorMessage("La propina debe ser un número válido mayor o igual a 0");
      return;
    }

    try {
      setUpdatingId(order._id);
      clearMessages();

      const token = localStorage.getItem("token");
      const payload = buildUpdatePayload(order, nextStatus, parsedTip);

      const response = await fetch(`${API_URL}/api/orders/${order._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo cerrar el pedido");
      }

      setOrders((current) =>
        current.map((item) => (item._id === order._id ? data : item))
      );
      setClosingOrderId(null);
      setSuccessMessage("Pedido cerrado correctamente");
    } catch (error) {
      setErrorMessage(error.message || "Ocurrió un error al cerrar el pedido");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancelClosing = () => {
    if (updatingId) {
      return;
    }

    setClosingOrderId(null);
  };

  return (
    <section className="kitchen-page">
      <div className="kitchen-page-header">
        <div>
          <h2 className="kitchen-page-title">Cocina</h2>
          <p className="kitchen-page-subtitle">
            Visualizá y actualizá los pedidos activos en orden cronológico.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="kitchen-page-success">{successMessage}</div>
      )}

      {isLoading ? (
        <div className="kitchen-page-feedback">Cargando pedidos de cocina...</div>
      ) : errorMessage ? (
        <div className="kitchen-page-error">{errorMessage}</div>
      ) : kitchenOrders.length === 0 ? (
        <div className="kitchen-page-empty">No hay pedidos activos en cocina.</div>
      ) : (
        <div className="kitchen-page-grid">
          {kitchenOrders.map((order) => {
            const nextStatus = getNextStatus(order);
            const nextStatusLabel = getNextStatusLabel(order);
            const isClosing = closingOrderId === order._id;

            return (
              <article key={order._id} className="kitchen-order-card">
                <div className="kitchen-order-top">
                  <div>
                    <h3 className="kitchen-order-title">
                      {order.type === "delivery" ? "Delivery" : "Mesa"}
                    </h3>
                    <p className="kitchen-order-meta">
                      {order.type === "mesa"
                        ? `Mesa ${order.table?.number ?? "-"}`
                        : order.customerName || "Sin cliente"}
                    </p>
                  </div>

                  <span className={`kitchen-order-status ${order.status}`}>
                    {{
                      pendiente: "Pendiente",
                      preparando: "Preparando",
                      listo: "Listo",
                      entregado: "Entregado",
                    }[order.status] || order.status}
                  </span>
                </div>

                <div className="kitchen-order-info">
                  <p>
                    <strong>Mesero:</strong> {order.waiter?.name || "Sin mesero"}
                  </p>
                  <p>
                    <strong>Turno:</strong>{" "}
                    {order.shift === "tarde" ? "Tarde" : "Mañana"}
                  </p>
                  <p>
                    <strong>Fecha:</strong> {formatDateTime(order.createdAt)}
                  </p>
                  {order.type === "delivery" && order.deliveryAddress ? (
                    <p>
                      <strong>Dirección:</strong> {order.deliveryAddress}
                    </p>
                  ) : null}
                  {order.specialNotes ? (
                    <p>
                      <strong>Notas:</strong> {order.specialNotes}
                    </p>
                  ) : null}
                </div>

                <div className="kitchen-order-items">
                  <h4>Ítems</h4>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={`${order._id}-${index}`}>
                        <span>
                          {item.quantity}x {item.name}
                        </span>
                        <span>${Number(item.subtotal || 0).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="kitchen-order-footer">
                  <div className="kitchen-order-total">
                    <span>Total</span>
                    <strong>${Number(order.total || 0).toFixed(2)}</strong>
                  </div>

                  {!isClosing && nextStatusLabel ? (
                    <button
                      className="kitchen-order-action-button"
                      onClick={() => handleAdvanceStatus(order)}
                      disabled={updatingId === order._id}
                    >
                      {updatingId === order._id
                        ? "Actualizando..."
                        : nextStatusLabel}
                    </button>
                  ) : null}
                </div>

                {isClosing ? (
                  <div className="kitchen-order-closing-box">
                    <div className="kitchen-order-closing-field">
                      <label htmlFor={`tip-${order._id}`}>
                        Propina ({order.type === "delivery" ? "entregar" : "cerrar mesa"})
                      </label>
                      <input
                        id={`tip-${order._id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={tipValues[order._id] ?? ""}
                        onChange={(event) =>
                          handleTipChange(order._id, event.target.value)
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="kitchen-order-closing-actions">
                      <button
                        type="button"
                        className="kitchen-order-secondary-button"
                        onClick={handleCancelClosing}
                        disabled={updatingId === order._id}
                      >
                        Cancelar
                      </button>

                      <button
                        type="button"
                        className="kitchen-order-action-button"
                        onClick={() => handleCloseOrder(order)}
                        disabled={updatingId === order._id}
                      >
                        {updatingId === order._id
                          ? "Guardando..."
                          : order.type === "delivery"
                            ? "Confirmar entrega"
                            : "Confirmar cierre"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default KitchenPage;