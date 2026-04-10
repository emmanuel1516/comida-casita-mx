function DashboardSummaryCards({
  totalSales,
  totalOrders,
  totalTips,
  averageTicket,
}) {
  return (
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
  );
}

export default DashboardSummaryCards;