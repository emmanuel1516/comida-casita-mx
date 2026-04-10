function WaiterModal({
  isOpen,
  isEditing,
  form,
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
    : "Crear mesero";

  return (
    <div className="waiters-modal-overlay">
      <div className="waiters-modal">
        <div className="waiters-modal-header">
          <h3>{isEditing ? "Editar mesero" : "Nuevo mesero"}</h3>
          <button
            type="button"
            className="waiters-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form className="waiters-form" onSubmit={onSubmit}>
          <div className="waiters-form-field">
            <label htmlFor="waiter-name">Nombre</label>
            <input
              id="waiter-name"
              name="name"
              type="text"
              value={form.name}
              onChange={onFormChange}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="waiters-form-field">
            <label htmlFor="waiter-email">Email</label>
            <input
              id="waiter-email"
              name="email"
              type="email"
              value={form.email}
              onChange={onFormChange}
              placeholder="Ej: juan@mail.com"
              required
            />
          </div>

          <div className="waiters-form-field">
            <label htmlFor="waiter-phone">Teléfono</label>
            <input
              id="waiter-phone"
              name="phone"
              type="text"
              value={form.phone}
              onChange={onFormChange}
              placeholder="Ej: 2342..."
              required
            />
          </div>

          <div className="waiters-form-field">
            <label htmlFor="waiter-shift">Turno</label>
            <select
              id="waiter-shift"
              name="shift"
              value={form.shift}
              onChange={onFormChange}
              required
            >
              <option value="mañana">Mañana</option>
              <option value="tarde">Tarde</option>
            </select>
          </div>

          {errorMessage && (
            <div className="waiters-page-error">{errorMessage}</div>
          )}

          <div className="waiters-form-actions">
            <button
              type="button"
              className="waiters-form-cancel-button"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="waiters-form-save-button"
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

export default WaiterModal;