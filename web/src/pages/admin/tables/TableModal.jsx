function TableModal({
  isOpen,
  isEditing,
  form,
  waiters,
  errorMessage,
  isSaving,
  onClose,
  onSubmit,
  onFormChange,
}) {
  if (!isOpen) {
    return null;
  }

  const submitLabel = isSaving
    ? isEditing
      ? "Guardando..."
      : "Creando..."
    : isEditing
    ? "Guardar cambios"
    : "Crear mesa";

  return (
    <div className="tables-modal-overlay">
      <div className="tables-modal">
        <div className="tables-modal-header">
          <h3>{isEditing ? "Editar mesa" : "Nueva mesa"}</h3>
          <button
            type="button"
            className="tables-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form className="tables-form" onSubmit={onSubmit}>
          <div className="tables-form-field">
            <label htmlFor="table-number">Número</label>
            <input
              id="table-number"
              name="number"
              type="number"
              min="1"
              value={form.number}
              onChange={onFormChange}
              placeholder="Ej: 1"
              required
            />
          </div>

          <div className="tables-form-field">
            <label htmlFor="table-capacity">Capacidad</label>
            <input
              id="table-capacity"
              name="capacity"
              type="number"
              min="1"
              value={form.capacity}
              onChange={onFormChange}
              placeholder="Ej: 4"
              required
            />
          </div>

          <div className="tables-form-field">
            <label htmlFor="table-waiter">Mesero asignado</label>
            <select
              id="table-waiter"
              name="assignedWaiter"
              value={form.assignedWaiter}
              onChange={onFormChange}
            >
              <option value="">Sin asignar</option>
              {waiters.map((waiter) => (
                <option key={waiter._id} value={waiter._id}>
                  {waiter.name}
                </option>
              ))}
            </select>
          </div>

          <div className="tables-form-field">
            <label htmlFor="table-status">Estado</label>
            <select
              id="table-status"
              name="status"
              value={form.status}
              onChange={onFormChange}
              required
            >
              <option value="available">Disponible</option>
              <option value="occupied">Ocupada</option>
            </select>
          </div>

          {errorMessage && (
            <div className="tables-page-error">{errorMessage}</div>
          )}

          <div className="tables-form-actions">
            <button
              type="button"
              className="tables-form-cancel-button"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="tables-form-save-button"
              disabled={isSaving}
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TableModal;