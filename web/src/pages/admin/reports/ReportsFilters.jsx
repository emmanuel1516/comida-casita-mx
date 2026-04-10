function ReportsFilters({ filters, waiters, onChange }) {
  return (
    <div className="reports-page-filters">
      <div className="reports-page-filter-field">
        <label htmlFor="filter-waiter">Mesero</label>
        <select
          id="filter-waiter"
          name="waiter"
          value={filters.waiter}
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
        />
      </div>
    </div>
  );
}

export default ReportsFilters;