function ReportsSummaryCards({
  totalSales,
  totalTips,
  totalOrders,
  averageTicket,
}) {
  return (
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
        <span>Pedidos cerrados</span>
        <strong>{totalOrders}</strong>
      </article>

      <article className="reports-summary-card">
        <span>Promedio por pedido</span>
        <strong>${averageTicket.toFixed(2)}</strong>
      </article>
    </div>
  );
}

export default ReportsSummaryCards;