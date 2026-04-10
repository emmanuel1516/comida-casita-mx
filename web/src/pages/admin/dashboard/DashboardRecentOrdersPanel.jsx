import { STATUS_LABELS, formatTime } from "./dashboardHelpers";

function DashboardRecentOrdersPanel({ recentOrders }) {
  return (
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
                <span>{STATUS_LABELS[order.status] || order.status}</span>
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
  );
}

export default DashboardRecentOrdersPanel;