import { SHIFT_LABELS } from "./waiterHelpers";

function WaitersTable({
  search,
  setSearch,
  successMessage,
  errorMessage,
  isLoading,
  isModalOpen,
  filteredWaiters,
  deletingId,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <div className="waiters-page-toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="waiters-page-search"
        />
      </div>

      {successMessage && (
        <div className="waiters-page-success">{successMessage}</div>
      )}

      {isLoading ? (
        <div className="waiters-page-feedback">Cargando meseros...</div>
      ) : errorMessage && !isModalOpen ? (
        <div className="waiters-page-error">{errorMessage}</div>
      ) : (
        <div className="waiters-page-table-wrapper">
          <table className="waiters-page-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Turno</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredWaiters.length > 0 ? (
                filteredWaiters.map((waiter) => (
                  <tr key={waiter._id}>
                    <td>{waiter.name}</td>
                    <td>{waiter.email}</td>
                    <td>{waiter.phone}</td>
                    <td>
                      <span className="waiters-page-shift">
                        {SHIFT_LABELS[waiter.shift] || waiter.shift}
                      </span>
                    </td>
                    <td>
                      <div className="waiters-page-actions">
                        <button
                          className="waiters-page-edit-button"
                          onClick={() => onEdit(waiter)}
                        >
                          Editar
                        </button>

                        <button
                          className="waiters-page-delete-button"
                          onClick={() => onDelete(waiter)}
                          disabled={deletingId === waiter._id}
                        >
                          {deletingId === waiter._id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="waiters-page-empty">
                    No se encontraron meseros.
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

export default WaitersTable;