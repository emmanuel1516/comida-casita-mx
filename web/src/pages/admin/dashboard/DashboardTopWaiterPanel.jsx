function DashboardTopWaiterPanel({ topWaiter }) {
  return (
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
  );
}

export default DashboardTopWaiterPanel;