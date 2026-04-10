import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../../api/api";
import DashboardSummaryCards from "./dashboard/DashboardSummaryCards";
import DashboardStatusPanel from "./dashboard/DashboardStatusPanel";
import DashboardShiftPanel from "./dashboard/DashboardShiftPanel";
import DashboardTopWaiterPanel from "./dashboard/DashboardTopWaiterPanel";
import DashboardRecentOrdersPanel from "./dashboard/DashboardRecentOrdersPanel";
import {
  DASHBOARD_POLLING_INTERVAL_MS,
  buildDashboardData,
  fetchJson,
} from "./dashboard/dashboardHelpers";
import "./dashboard-page.css";

function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const data = await fetchJson(`${API_URL}/api/orders`);
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

  const dashboardData = useMemo(() => buildDashboardData(orders), [orders]);

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
          <DashboardSummaryCards
            totalSales={dashboardData.totalSales}
            totalOrders={dashboardData.totalOrders}
            totalTips={dashboardData.totalTips}
            averageTicket={dashboardData.averageTicket}
          />

          <div className="dashboard-sections-grid">
            <DashboardStatusPanel statusSummary={dashboardData.statusSummary} />

            <DashboardShiftPanel
              morningSales={dashboardData.morningSales}
              afternoonSales={dashboardData.afternoonSales}
            />

            <DashboardTopWaiterPanel topWaiter={dashboardData.topWaiter} />

            <DashboardRecentOrdersPanel recentOrders={dashboardData.recentOrders} />
          </div>
        </>
      )}
    </section>
  );
}

export default DashboardPage;