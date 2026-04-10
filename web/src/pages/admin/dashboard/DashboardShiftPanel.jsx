function DashboardShiftPanel({ morningSales, afternoonSales }) {
  return (
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
  );
}

export default DashboardShiftPanel;