function TablesTable({
  search,
  setSearch,
  successMessage,
  errorMessage,
  isLoading,
  isModalOpen,
  filteredTables,
  deletingId,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <div className="tables-page-toolbar">
        <input
          type="text"
          placeholder="Buscar por número de mesa..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="tables-page-search"
        />
      </div>

      {successMessage && (
        <div className="tables-page-success">{successMessage}</div>
      )}

      {isLoading ? (
        <div className="tables-page-feedback">Cargando mesas...</div>
      ) : errorMessage && !isModalOpen ? (
        <div className="tables-page-error">{errorMessage}</div>
      ) : (
        <div className="tables-page-table-wrapper">
          <table className="tables-page-table">
            <thead>
              <tr>
                <th>Mesa</th>
                <th>Capacidad</th>
                <th>Mesero asignado</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredTables.length > 0 ? (
                filteredTables.map((table) => (
                  <tr key={table._id}>
                    <td>Mesa {table.number}</td>
                    <td>{table.capacity}</td>
                    <td>{table.assignedWaiter?.name || "Sin asignar"}</td>
                    <td>
                      <span
                        className={`tables-page-status ${
                          table.status === "occupied" ? "occupied" : "available"
                        }`}
                      >
                        {table.status === "occupied" ? "Ocupada" : "Disponible"}
                      </span>
                    </td>
                    <td>
                      <div className="tables-page-actions">
                        <button
                          className="tables-page-edit-button"
                          onClick={() => onEdit(table)}
                        >
                          Editar
                        </button>

                        <button
                          className="tables-page-delete-button"
                          onClick={() => onDelete(table)}
                          disabled={deletingId === table._id}
                        >
                          {deletingId === table._id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="tables-page-empty">
                    No se encontraron mesas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default TablesTable;