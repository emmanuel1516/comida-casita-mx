import { useEffect, useState } from "react";
import { API_URL } from "../../api/api";
import "./dashboard-page.css";

const DASHBOARD_POLLING_INTERVAL_MS = 10000;

function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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
        setErrorMessage(error.message || "Ocurrió un error al obtener el dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();

    const refreshDashboard = () => {
      if (document.visibilityState === "visible") {
        loadOrders();
      }
    };

    const intervalId = window.setInterval(
      refreshDashboard,
      DASHBOARD_POLLING_INTERVAL_MS
    );

    document.addEventListener("visibilitychange", refreshDashboard);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshDashboard);
    };
  }, []);

  const today = new Date();

  const todayOrders = orders.filter((order) => {
    if (!order.createdAt) {
      return false;
    }

    const orderDate = new Date(order.createdAt);

    return (
      orderDate.getFullYear() === today.getFullYear() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getDate() === today.getDate()
    );
  });

  const salesOrders = todayOrders.filter((order) =>
    ["listo", "entregado"].includes(order.status)
  );

  const totalSales = salesOrders.reduce(
    (total, order) => total + Number(order.total || 0),
    0
  );

  const totalTips = salesOrders.reduce(
    (total, order) => total + Number(order.tip || 0),
    0
  );

  const totalOrders = salesOrders.length;
  const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

  const statusSummary = {
    pendiente: 0,
    preparando: 0,
    listo: 0,
    entregado: 0,
  };

  for (const order of todayOrders) {
    if (order.status in statusSummary) {
      statusSummary[order.status] += 1;
    }
  }

  let morningSales = 0;
  let afternoonSales = 0;
  const groupedByWaiter = {};

  for (const order of salesOrders) {
    if (order.shift === "mañana") {
      morningSales += Number(order.total || 0);
    }

    if (order.shift === "tarde") {
      afternoonSales += Number(order.total || 0);
    }

    const waiterId = order.waiter?._id || "no-waiter";
    const waiterName = order.waiter?.name || "Sin mesero";

    if (!groupedByWaiter[waiterId]) {
      groupedByWaiter[waiterId] = {
        waiterName,
        totalSales: 0,
        totalOrders: 0,
      };
    }

    groupedByWaiter[waiterId].totalSales += Number(order.total || 0);
    groupedByWaiter[waiterId].totalOrders += 1;
  }

  const topWaiter =
    Object.values(groupedByWaiter).sort((a, b) => b.totalSales - a.totalSales)[0] ||
    null;

  const recentOrders = [...todayOrders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const formatTime = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    return new Date(dateValue).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="dashboard-page">
      <div className="dashboard-page-header">
        <div>
          <h2 className="dashboard-page-title">Dashboard</h2>
          <p className="dashboard-page-subtitle">
            Resumen diario de ventas y operación del restaurante.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="dashboard-page-feedback">Cargando dashboard...</div>
      ) : errorMessage ? (
        <div className="dashboard-page-error">{errorMessage}</div>
      ) : (
        <>
          <div className="dashboard-summary-grid">
            <article className="dashboard-summary-card">
              <span>Ventas del día</span>
              <strong>${totalSales.toFixed(2)}</strong>
            </article>

            <article className="dashboard-summary-card">
              <span>Pedidos cerrados</span>
              <strong>{totalOrders}</strong>
            </article>

            <article className="dashboard-summary-card">
              <span>Propinas del día</span>
              <strong>${totalTips.toFixed(2)}</strong>
            </article>

            <article className="dashboard-summary-card">
              <span>Ticket promedio</span>
              <strong>${averageTicket.toFixed(2)}</strong>
            </article>
          </div>

          <div className="dashboard-sections-grid">
            <section className="dashboard-panel">
              <h3>Estado de pedidos</h3>
              <div className="dashboard-status-grid">
                <div className="dashboard-status-card pendiente">
                  <span>Pendientes</span>
                  <strong>{statusSummary.pendiente}</strong>
                </div>
                <div className="dashboard-status-card preparando">
                  <span>Preparando</span>
                  <strong>{statusSummary.preparando}</strong>
                </div>
                <div className="dashboard-status-card listo">
                  <span>Listos</span>
                  <strong>{statusSummary.listo}</strong>
                </div>
                <div className="dashboard-status-card entregado">
                  <span>Entregados</span>
                  <strong>{statusSummary.entregado}</strong>
                </div>
              </div>
            </section>

            <section className="dashboard-panel">
              <h3>Ventas por turno</h3>
              <div className="dashboard-shift-grid">
                <div className="dashboard-shift-card">
                  <span>Mañana</span>
                  <strong>${morningSales.toFixed(2)}</strong>
                </div>
                <div className="dashboard-shift-card">
                  <span>Tarde</span>
                  <strong>${afternoonSales.toFixed(2)}</strong>
                </div>
              </div>
            </section>

            <section className="dashboard-panel">
              <h3>Top mesero del día</h3>
              {topWaiter ? (
                <div className="dashboard-top-waiter">
                  <strong>{topWaiter.waiterName}</strong>
                  <span>Ventas: ${topWaiter.totalSales.toFixed(2)}</span>
                  <span>Pedidos: {topWaiter.totalOrders}</span>
                </div>
              ) : (
                <p className="dashboard-empty-text">No hay ventas hoy.</p>
              )}
            </section>

            <section className="dashboard-panel">
              <h3>Últimos pedidos del día</h3>
              {recentOrders.length > 0 ? (
                <div className="dashboard-recent-orders">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="dashboard-recent-order-card">
                      <div>
                        <strong>{order.type === "delivery" ? "Delivery" : "Mesa"}</strong>
                        <p>{order.waiter?.name || "Sin mesero"}</p>
                      </div>
                      <div className="dashboard-recent-order-right">
                        <span>
                          {{
                            pendiente: "Pendiente",
                            preparando: "Preparando",
                            listo: "Listo",
                            entregado: "Entregado",
                          }[order.status] || order.status}
                        </span>
                        <strong>${Number(order.total || 0).toFixed(2)}</strong>
                        <small>{formatTime(order.createdAt)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="dashboard-empty-text">No hay pedidos hoy.</p>
              )}
            </section>
          </div>
        </>
      )}
    </section>
  );
}

export default DashboardPage;