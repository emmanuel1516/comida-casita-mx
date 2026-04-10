import { useEffect, useState } from "react";
import { API_URL } from "../../api/api";
import "./kitchen-page.css";
import KitchenOrdersGrid from "./KitchenOrdersGrid";
import {
  buildUpdatePayload,
  getNextStatus,
  isClosingTransition,
} from "./kitchenHelpers";

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
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

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
        <KitchenOrdersGrid
          orders={kitchenOrders}
          closingOrderId={closingOrderId}
          updatingId={updatingId}
          tipValues={tipValues}
          onAdvanceStatus={handleAdvanceStatus}
          onTipChange={handleTipChange}
          onCancelClosing={handleCancelClosing}
          onCloseOrder={handleCloseOrder}
        />
      )}
    </section>
  );
}

export default KitchenPage;