import { useEffect, useState } from "react";
import { API_URL } from "../../api/api";
import "./kitchen-page.css";

function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

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
      } catch (error) {
        setErrorMessage(error.message || "Ocurrió un error al obtener los pedidos");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  const kitchenOrders = orders
    .filter((order) =>
      ["pendiente", "preparando", "listo"].includes(order.status)
    )
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

  const handleAdvanceStatus = async (order) => {
    const nextStatus =
      order.status === "pendiente"
        ? "preparando"
        : order.status === "preparando"
          ? "listo"
          : "";

    if (!nextStatus) {
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

      {successMessage && <div className="kitchen-page-success">{successMessage}</div>}

      {isLoading ? (
        <div className="kitchen-page-feedback">Cargando pedidos de cocina...</div>
      ) : errorMessage ? (
        <div className="kitchen-page-error">{errorMessage}</div>
      ) : kitchenOrders.length === 0 ? (
        <div className="kitchen-page-empty">
          No hay pedidos activos en cocina.
        </div>
      ) : (
        <div className="kitchen-page-grid">
          {kitchenOrders.map((order) => {
            const nextStatusLabel =
              order.status === "pendiente"
                ? "Marcar como preparando"
                : order.status === "preparando"
                  ? "Marcar como listo"
                  : "";

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
                    <strong>Turno:</strong> {order.shift === "tarde" ? "Tarde" : "Mañana"}
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

                  {nextStatusLabel ? (
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
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default KitchenPage;
