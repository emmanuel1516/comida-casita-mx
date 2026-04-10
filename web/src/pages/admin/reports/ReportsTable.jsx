function ReportsTable({ reportByWaiter }) {
  return (
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
  );
}

export default ReportsTable;