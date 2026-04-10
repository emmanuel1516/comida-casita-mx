function OrderModal({
  isOpen,
  isEditing,
  form,
  waiters,
  dishes,
  availableTables,
  assignedWaiterId,
  assignedWaiterName,
  itemsWithTotals,
  total,
  errorMessage,
  isSaving,
  onClose,
  onSubmit,
  onFormChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
}) {
  if (!isOpen) return null;

  return (
    <div className="orders-modal-overlay">
      <div className="orders-modal">
        <div className="orders-modal-header">
          <h3>{isEditing ? "Editar pedido" : "Nuevo pedido"}</h3>
          <button type="button" className="orders-modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <form className="orders-form" onSubmit={onSubmit}>
          <div className="orders-form-grid">
            <div className="orders-form-field">
              <label htmlFor="order-type">Tipo</label>
              <select
                id="order-type"
                name="type"
                value={form.type}
                onChange={onFormChange}
                required
              >
                <option value="mesa">Mesa</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            <div className="orders-form-field">
              <label htmlFor="order-waiter">Mesero</label>

              {form.type === "mesa" ? (
                <>
                  <input
                    id="order-waiter"
                    type="text"
                    value={
                      assignedWaiterName ||
                      (form.table
                        ? "La mesa no tiene mesero asignado"
                        : "Selecciona una mesa")
                    }
                    readOnly
                  />

                  <small
                    className={`orders-form-help ${
                      form.table && !assignedWaiterId ? "is-error" : ""
                    }`}
                  >
                    {form.table && !assignedWaiterId
                      ? "Asigna un mesero a la mesa antes de guardar el pedido."
                      : "Para pedidos de mesa se usa el mesero asignado a la mesa."}
                  </small>
                </>
              ) : (
                <select
                  id="order-waiter"
                  name="waiter"
                  value={form.waiter}
                  onChange={onFormChange}
                  required
                >
                  <option value="">Seleccionar mesero</option>
                  {waiters.map((waiter) => (
                    <option key={waiter._id} value={waiter._id}>
                      {waiter.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="orders-form-field">
              <label htmlFor="order-shift">Turno</label>
              <select
                id="order-shift"
                name="shift"
                value={form.shift}
                onChange={onFormChange}
                required
              >
                <option value="mañana">Mañana</option>
                <option value="tarde">Tarde</option>
              </select>
            </div>

            <div className="orders-form-field">
              <label htmlFor="order-status">Estado</label>
              <select
                id="order-status"
                name="status"
                value={form.status}
                onChange={onFormChange}
                required
              >
                <option value="pendiente">Pendiente</option>
                <option value="preparando">Preparando</option>
                <option value="listo">Listo</option>
                <option value="entregado">Entregado</option>
              </select>
            </div>

            {form.type === "mesa" ? (
              <div className="orders-form-field orders-form-full">
                <label htmlFor="order-table">Mesa</label>
                <select
                  id="order-table"
                  name="table"
                  value={form.table}
                  onChange={onFormChange}
                  required
                >
                  <option value="">
                    {availableTables.length > 0
                      ? "Seleccionar mesa"
                      : "No hay mesas disponibles"}
                  </option>

                  {availableTables.map((table) => (
                    <option key={table._id} value={table._id}>
                      Mesa {table.number}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div className="orders-form-field">
                  <label htmlFor="order-customer-name">Cliente</label>
                  <input
                    id="order-customer-name"
                    name="customerName"
                    type="text"
                    value={form.customerName}
                    onChange={onFormChange}
                    placeholder="Nombre del cliente"
                  />
                </div>

                <div className="orders-form-field">
                  <label htmlFor="order-customer-phone">Teléfono</label>
                  <input
                    id="order-customer-phone"
                    name="customerPhone"
                    type="text"
                    value={form.customerPhone}
                    onChange={onFormChange}
                    placeholder="Teléfono del cliente"
                  />
                </div>

                <div className="orders-form-field orders-form-full">
                  <label htmlFor="order-address">Dirección</label>
                  <input
                    id="order-address"
                    name="deliveryAddress"
                    type="text"
                    value={form.deliveryAddress}
                    onChange={onFormChange}
                    placeholder="Dirección de entrega"
                  />
                </div>
              </>
            )}

            <div className="orders-form-field orders-form-full">
              <label htmlFor="order-notes">Notas especiales</label>
              <textarea
                id="order-notes"
                name="specialNotes"
                value={form.specialNotes}
                onChange={onFormChange}
                rows="3"
                placeholder="Notas especiales del pedido"
              />
            </div>
          </div>

          <div className="orders-items-section">
            <div className="orders-items-header">
              <h4>Items del pedido</h4>
              <button
                type="button"
                className="orders-add-item-button"
                onClick={onAddItem}
              >
                Agregar item
              </button>
            </div>

            <div className="orders-items-list">
              {itemsWithTotals.map((item, index) => (
                <div key={index} className="orders-item-card">
                  <div className="orders-form-field">
                    <label>Platillo</label>
                    <select
                      value={item.dish}
                      onChange={(event) =>
                        onItemChange(index, "dish", event.target.value)
                      }
                      required
                    >
                      <option value="">Seleccionar platillo</option>
                      {dishes.map((dish) => (
                        <option key={dish._id} value={dish._id}>
                          {dish.name} - ${Number(dish.price || 0).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="orders-form-field">
                    <label>Cantidad</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) =>
                        onItemChange(index, "quantity", event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="orders-item-summary">
                    <span>Precio: ${item.price.toFixed(2)}</span>
                    <span>Subtotal: ${item.subtotal.toFixed(2)}</span>
                  </div>

                  <button
                    type="button"
                    className="orders-remove-item-button"
                    onClick={() => onRemoveItem(index)}
                    disabled={itemsWithTotals.length === 1}
                  >
                    Quitar item
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="orders-totals">
            <div className="orders-form-field">
              <label htmlFor="order-tip">Propina</label>
              <input
                id="order-tip"
                name="tip"
                type="number"
                min="0"
                step="0.01"
                value={form.tip}
                onChange={onFormChange}
              />
            </div>

            <div className="orders-total-box">
              <span>Total pedido</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>

          {errorMessage && <div className="orders-page-error">{errorMessage}</div>}

          <div className="orders-form-actions">
            <button
              type="button"
              className="orders-form-cancel-button"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="orders-form-save-button"
              disabled={isSaving}
            >
              {isSaving
                ? isEditing
                  ? "Guardando..."
                  : "Creando..."
                : isEditing
                ? "Guardar cambios"
                : "Crear pedido"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OrderModal;