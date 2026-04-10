import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../../api/api";
import ReportsFilters from "./reports/ReportsFilters";
import ReportsSummaryCards from "./reports/ReportsSummaryCards";
import ReportsTable from "./reports/ReportsTable";
import {
  buildReportData,
  fetchJson,
  initialFilters,
} from "./reports/reportsHelpers";
import "./reports-page.css";

function ReportsPage() {
  const [orders, setOrders] = useState([]);
  const [waiters, setWaiters] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [ordersData, waitersData] = await Promise.all([
          fetchJson(`${API_URL}/api/orders`),
          fetchJson(`${API_URL}/api/waiters`),
        ]);

        setOrders(ordersData);
        setWaiters(waitersData);
      } catch (error) {
        setErrorMessage(error.message || "Ocurrió un error al obtener los reportes");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFilterChange = ({ target }) => {
    const { name, value } = target;

    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const reportData = useMemo(
    () => buildReportData(orders, filters),
    [orders, filters]
  );

  return (
    <section className="reports-page">
      <div className="reports-page-header">
        <div>
          <h2 className="reports-page-title">Reportes</h2>
          <p className="reports-page-subtitle">
            Consultá ventas, propinas y desempeño por mesero y turno.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="reports-page-feedback">Cargando reportes...</div>
      ) : errorMessage ? (
        <div className="reports-page-error">{errorMessage}</div>
      ) : (
        <>
          <ReportsFilters
            filters={filters}
            waiters={waiters}
            onChange={handleFilterChange}
          />

          <ReportsSummaryCards
            totalSales={reportData.totalSales}
            totalTips={reportData.totalTips}
            totalOrders={reportData.totalOrders}
            averageTicket={reportData.averageTicket}
          />

          <ReportsTable reportByWaiter={reportData.reportByWaiter} />
        </>
      )}
    </section>
  );
}

export default ReportsPage;