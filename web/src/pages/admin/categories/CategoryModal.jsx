function CategoryModal({
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

  const modalTitle = isEditing ? "Editar categoría" : "Nueva categoría";

  const submitLabel = isSaving
    ? isEditing
      ? "Guardando..."
      : "Creando..."
    : isEditing
    ? "Guardar cambios"
    : "Crear categoría";

  return (
    <div className="categories-modal-overlay">
      <div className="categories-modal">
        <div className="categories-modal-header">
          <h3>{modalTitle}</h3>
          <button
            type="button"
            className="categories-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form className="categories-form" onSubmit={onSubmit}>
          <div className="categories-form-field">
            <label htmlFor="name">Nombre</label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={onFormChange}
              placeholder="Ej: Tacos"
              required
            />
          </div>

          <div className="categories-form-field">
            <label htmlFor="description">Descripción</label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={onFormChange}
              placeholder="Descripción de la categoría"
              rows="4"
            />
          </div>

          <label className="categories-form-checkbox">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={onFormChange}
            />
            Categoría activa
          </label>

          {errorMessage && (
            <div className="categories-page-error">{errorMessage}</div>
          )}

          <div className="categories-form-actions">
            <button
              type="button"
              className="categories-form-cancel-button"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="categories-form-save-button"
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

export default CategoryModal;