import { useEffect, useState } from "react";
import { API_URL } from "../../api/api";
import "./reports-page.css";

const initialFilters = {
  waiter: "",
  shift: "",
  date: "",
};

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

        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        };

        const [ordersResponse, waitersResponse] = await Promise.all([
          fetch(`${API_URL}/api/orders`, { headers }),
          fetch(`${API_URL}/api/waiters`, { headers }),
        ]);

        const [ordersData, waitersData] = await Promise.all([
          ordersResponse.json(),
          waitersResponse.json(),
        ]);

        if (!ordersResponse.ok) {
          throw new Error(ordersData.message || "No se pudieron cargar los pedidos");
        }

        if (!waitersResponse.ok) {
          throw new Error(waitersData.message || "No se pudieron cargar los meseros");
        }

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

  const filteredOrders = orders.filter((order) => {
    const orderWaiterId = order.waiter?._id || "";
    const orderDate = order.createdAt
      ? new Date(order.createdAt).toISOString().slice(0, 10)
      : "";

    if (filters.waiter && orderWaiterId !== filters.waiter) {
      return false;
    }

    if (filters.shift && order.shift !== filters.shift) {
      return false;
    }

    if (filters.date && orderDate !== filters.date) {
      return false;
    }

    return true;
  });

  const totalSales = filteredOrders.reduce(
    (total, order) => total + Number(order.total || 0),
    0
  );
  const totalTips = filteredOrders.reduce(
    (total, order) => total + Number(order.tip || 0),
    0
  );
  const totalOrders = filteredOrders.length;
  const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

  const groupedByWaiter = {};

  for (const order of filteredOrders) {
    const waiterId = order.waiter?._id || "no-waiter";
    const waiterName = order.waiter?.name || "Sin mesero";

    if (!groupedByWaiter[waiterId]) {
      groupedByWaiter[waiterId] = {
        waiterName,
        totalSales: 0,
        totalTips: 0,
        totalOrders: 0,
      };
    }

    groupedByWaiter[waiterId].totalSales += Number(order.total || 0);
    groupedByWaiter[waiterId].totalTips += Number(order.tip || 0);
    groupedByWaiter[waiterId].totalOrders += 1;
  }

  const reportByWaiter = Object.values(groupedByWaiter).map((item) => ({
    ...item,
    averageTicket: item.totalOrders > 0 ? item.totalSales / item.totalOrders : 0,
  }));

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
          <div className="reports-page-filters">
            <div className="reports-page-filter-field">
              <label htmlFor="filter-waiter">Mesero</label>
              <select
                id="filter-waiter"
                name="waiter"
                value={filters.waiter}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                {waiters.map((waiter) => (
                  <option key={waiter._id} value={waiter._id}>
                    {waiter.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="reports-page-filter-field">
              <label htmlFor="filter-shift">Turno</label>
              <select
                id="filter-shift"
                name="shift"
                value={filters.shift}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="mañana">Mañana</option>
                <option value="tarde">Tarde</option>
              </select>
            </div>

            <div className="reports-page-filter-field">
              <label htmlFor="filter-date">Fecha</label>
              <input
                id="filter-date"
                name="date"
                type="date"
                value={filters.date}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div className="reports-page-summary-grid">
            <article className="reports-summary-card">
              <span>Total ventas</span>
              <strong>${totalSales.toFixed(2)}</strong>
            </article>

            <article className="reports-summary-card">
              <span>Total propinas</span>
              <strong>${totalTips.toFixed(2)}</strong>
            </article>

            <article className="reports-summary-card">
              <span>Cantidad de pedidos</span>
              <strong>{totalOrders}</strong>
            </article>

            <article className="reports-summary-card">
              <span>Promedio por pedido</span>
              <strong>${averageTicket.toFixed(2)}</strong>
            </article>
          </div>

          <div className="reports-page-table-wrapper">
            <table className="reports-page-table">
              <thead>
                <tr>
                  <th>Mesero</th>
                  <th>Total ventas</th>
                  <th>Propinas</th>
                  <th>Pedidos</th>
                  <th>Promedio por pedido</th>
                </tr>
              </thead>

              <tbody>
                {reportByWaiter.length > 0 ? (
                  reportByWaiter.map((item, index) => (
                    <tr key={`${item.waiterName}-${index}`}>
                      <td>{item.waiterName}</td>
                      <td>${item.totalSales.toFixed(2)}</td>
                      <td>${item.totalTips.toFixed(2)}</td>
                      <td>{item.totalOrders}</td>
                      <td>${item.averageTicket.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="reports-page-empty">
                      No hay datos para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default ReportsPage;
