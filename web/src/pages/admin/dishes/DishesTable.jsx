import { getCategoryName } from "./dishHelpers";

function DishesTable({
  search,
  setSearch,
  successMessage,
  errorMessage,
  isLoading,
  isModalOpen,
  filteredDishes,
  categories,
  deletingId,
  onEdit,
  onDelete,
}) {
  return (
    <>
      <div className="dishes-page-toolbar">
        <input
          type="text"
          placeholder="Buscar platillo..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="dishes-page-search"
        />
      </div>

      {successMessage && (
        <div className="dishes-page-success">{successMessage}</div>
      )}

      {isLoading ? (
        <div className="dishes-page-feedback">Cargando platillos...</div>
      ) : errorMessage && !isModalOpen ? (
        <div className="dishes-page-error">{errorMessage}</div>
      ) : (
        <div className="dishes-page-table-wrapper">
          <table className="dishes-page-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Disponible</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredDishes.length > 0 ? (
                filteredDishes.map((dish) => {
                  const available = dish.available ?? true;

                  return (
                    <tr key={dish._id}>
                      <td>{dish.name}</td>
                      <td>{dish.description || "Sin descripción"}</td>
                      <td>{getCategoryName(dish.category, categories)}</td>
                      <td>${Number(dish.price || 0).toFixed(2)}</td>
                      <td>
                        <span
                          className={`dishes-page-status ${
                            available ? "active" : "inactive"
                          }`}
                        >
                          {available ? "Disponible" : "No disponible"}
                        </span>
                      </td>
                      <td>
                        <div className="dishes-page-actions">
                          <button
                            className="dishes-page-edit-button"
                            onClick={() => onEdit(dish)}
                          >
                            Editar
                          </button>

                          <button
                            className="dishes-page-delete-button"
                            onClick={() => onDelete(dish)}
                            disabled={deletingId === dish._id}
                          >
                            {deletingId === dish._id ? "Eliminando..." : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="dishes-page-empty">
                    No se encontraron platillos.
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

export default DishesTable;