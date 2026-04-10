function DishModal({
  isOpen,
  isEditing,
  form,
  categories,
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
    : "Crear platillo";

  return (
    <div className="dishes-modal-overlay">
      <div className="dishes-modal">
        <div className="dishes-modal-header">
          <h3>{isEditing ? "Editar platillo" : "Nuevo platillo"}</h3>
          <button
            type="button"
            className="dishes-modal-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form className="dishes-form" onSubmit={onSubmit}>
          <div className="dishes-form-field">
            <label htmlFor="dish-name">Nombre</label>
            <input
              id="dish-name"
              name="name"
              type="text"
              value={form.name}
              onChange={onFormChange}
              placeholder="Ej: Taco al pastor"
              required
            />
          </div>

          <div className="dishes-form-field">
            <label htmlFor="dish-description">Descripción</label>
            <textarea
              id="dish-description"
              name="description"
              value={form.description}
              onChange={onFormChange}
              placeholder="Descripción del platillo"
              rows="4"
            />
          </div>

          <div className="dishes-form-field">
            <label htmlFor="dish-category">Categoría</label>
            <select
              id="dish-category"
              name="category"
              value={form.category}
              onChange={onFormChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="dishes-form-field">
            <label htmlFor="dish-price">Precio</label>
            <input
              id="dish-price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={onFormChange}
              placeholder="Ej: 2500"
              required
            />
          </div>

          <label className="dishes-form-checkbox">
            <input
              type="checkbox"
              name="available"
              checked={form.available}
              onChange={onFormChange}
            />
            Platillo disponible
          </label>

          {errorMessage && (
            <div className="dishes-page-error">{errorMessage}</div>
          )}

          <div className="dishes-form-actions">
            <button
              type="button"
              className="dishes-form-cancel-button"
              onClick={onClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="dishes-form-save-button"
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

export default DishModal;