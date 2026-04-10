function KitchenClosingBox({
  order,
  updatingId,
  tipValue,
  onTipChange,
  onCancel,
  onConfirm,
}) {
  return (
    <div className="kitchen-order-closing-box">
      <div className="kitchen-order-closing-field">
        <label htmlFor={`tip-${order._id}`}>
          Propina ({order.type === "delivery" ? "entregar" : "cerrar mesa"})
        </label>
        <input
          id={`tip-${order._id}`}
          type="number"
          min="0"
          step="0.01"
          value={tipValue ?? ""}
          onChange={(event) => onTipChange(order._id, event.target.value)}
          placeholder="0"
        />
      </div>

      <div className="kitchen-order-closing-actions">
        <button
          type="button"
          className="kitchen-order-secondary-button"
          onClick={onCancel}
          disabled={updatingId === order._id}
        >
          Cancelar
        </button>

        <button
          type="button"
          className="kitchen-order-action-button"
          onClick={() => onConfirm(order)}
          disabled={updatingId === order._id}
        >
          {updatingId === order._id
            ? "Guardando..."
            : order.type === "delivery"
              ? "Confirmar entrega"
              : "Confirmar cierre"}
        </button>
      </div>
    </div>
  );
}

export default KitchenClosingBox;