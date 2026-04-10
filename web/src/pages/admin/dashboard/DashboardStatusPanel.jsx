function DashboardStatusPanel({ statusSummary }) {
  return (
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
  );
}

export default DashboardStatusPanel;