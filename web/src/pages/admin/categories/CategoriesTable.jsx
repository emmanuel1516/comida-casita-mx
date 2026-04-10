function CategoriesTable({
  search,
  setSearch,
  successMessage,
  errorMessage,
  isLoading,
  isModalOpen,
  filteredCategories,
  deletingId,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <div className="categories-page-toolbar">
        <input
          type="text"
          placeholder="Buscar categoría..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="categories-page-search"
        />
      </div>

      {successMessage && (
        <div className="categories-page-success">{successMessage}</div>
      )}

      {isLoading ? (
        <div className="categories-page-feedback">Cargando categorías...</div>
      ) : errorMessage && !isModalOpen ? (
        <div className="categories-page-error">{errorMessage}</div>
      ) : (
        <div className="categories-page-table-wrapper">
          <table className="categories-page-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td>{category.description || "Sin descripción"}</td>
                    <td>
                      <span
                        className={`categories-page-status ${
                          category.isActive ? "active" : "inactive"
                        }`}
                      >
                        {category.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </td>
                    <td>
                      <div className="categories-page-actions">
                        <button
                          className="categories-page-edit-button"
                          onClick={() => onEdit(category)}
                        >
                          Editar
                        </button>

                        <button
                          className="categories-page-delete-button"
                          onClick={() => onDelete(category)}
                          disabled={deletingId === category._id}
                        >
                          {deletingId === category._id ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="categories-page-empty">
                    No se encontraron categorías.
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

export default CategoriesTable;