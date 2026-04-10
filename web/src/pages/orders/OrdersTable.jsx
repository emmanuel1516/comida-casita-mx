import { STATUS_LABELS, SHIFT_LABELS, formatOrderDate, formatOrderTime } from "./orderHelpers";

function OrdersTable({
  search,
  setSearch,
  successMessage,
  errorMessage,
  isLoading,
  filteredOrders,
  isAdmin,
  deletingId,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <div className="orders-page-toolbar">
        <input
          type="text"
          placeholder="Buscar por tipo, cliente, estado, turno, fecha, hora o mesa..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="orders-page-search"
        />
      </div>

      {successMessage && <div className="orders-page-success">{successMessage}</div>}

      {isLoading ? (
        <div className="orders-page-feedback">Cargando pedidos...</div>
      ) : errorMessage ? (
        <div className="orders-page-error">{errorMessage}</div>
      ) : (
        <div className="orders-page-table-wrapper">
          <table className="orders-page-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Mesa / Cliente</th>
                <th>Mesero</th>
                <th>Items</th>
                <th>Estado</th>
                <th>Turno</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Total</th>
                <th>Propina</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.type === "delivery" ? "Delivery" : "Mesa"}</td>
                    <td>
                      {order.type === "mesa"
                        ? `Mesa ${order.table?.number ?? "-"}`
                        : order.customerName || "Sin cliente"}
                    </td>
                    <td>{order.waiter?.name || "Sin mesero"}</td>
                    <td>{order.items.length}</td>
                    <td>
                      <span className={`orders-page-status ${order.status}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td>{SHIFT_LABELS[order.shift] || order.shift}</td>
                    <td>{formatOrderDate(order.createdAt)}</td>
                    <td>{formatOrderTime(order.createdAt)}</td>
                    <td>${Number(order.total || 0).toFixed(2)}</td>
                    <td>${Number(order.tip || 0).toFixed(2)}</td>
                    <td>
                      <div className="orders-page-actions">
                        <button
                          className="orders-page-edit-button"
                          onClick={() => onEdit(order)}
                        >
                          Editar
                        </button>

                        {isAdmin && (
                          <button
                            className="orders-page-delete-button"
                            onClick={() => onDelete(order)}
                            disabled={deletingId === order._id}
                          >
                            {deletingId === order._id ? "Eliminando..." : "Eliminar"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="orders-page-empty">
                    No se encontraron pedidos.
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

export default OrdersTable;