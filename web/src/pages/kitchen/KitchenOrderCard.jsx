import KitchenClosingBox from "./KitchenClosingBox";
import { formatDateTime } from "./kitchenHelpers";

function KitchenOrderCard({
  order,
  isClosing,
  updatingId,
  nextStatusLabel,
  tipValue,
  onAdvanceStatus,
  onTipChange,
  onCancelClosing,
  onCloseOrder,
}) {
  return (
    <article className="kitchen-order-card">
      <div className="kitchen-order-top">
        <div>
          <h3 className="kitchen-order-title">
            {order.type === "delivery" ? "Delivery" : "Mesa"}
          </h3>
          <p className="kitchen-order-meta">
            {order.type === "mesa"
              ? `Mesa ${order.table?.number ?? "-"}`
              : order.customerName || "Sin cliente"}
          </p>
        </div>

        <span className={`kitchen-order-status ${order.status}`}>
          {{
            pendiente: "Pendiente",
            preparando: "Preparando",
            listo: "Listo",
            entregado: "Entregado",
          }[order.status] || order.status}
        </span>
      </div>

      <div className="kitchen-order-info">
        <p>
          <strong>Mesero:</strong> {order.waiter?.name || "Sin mesero"}
        </p>
        <p>
          <strong>Turno:</strong> {order.shift === "tarde" ? "Tarde" : "Mañana"}
        </p>
        <p>
          <strong>Fecha:</strong> {formatDateTime(order.createdAt)}
        </p>

        {order.type === "delivery" && order.deliveryAddress ? (
          <p>
            <strong>Dirección:</strong> {order.deliveryAddress}
          </p>
        ) : null}

        {order.specialNotes ? (
          <p>
            <strong>Notas:</strong> {order.specialNotes}
          </p>
        ) : null}
      </div>

      <div className="kitchen-order-items">
        <h4>Ítems</h4>
        <ul>
          {order.items.map((item, index) => (
            <li key={`${order._id}-${index}`}>
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>${Number(item.subtotal || 0).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="kitchen-order-footer">
        <div className="kitchen-order-total">
          <span>Total</span>
          <strong>${Number(order.total || 0).toFixed(2)}</strong>
        </div>

        {!isClosing && nextStatusLabel ? (
          <button
            className="kitchen-order-action-button"
            onClick={() => onAdvanceStatus(order)}
            disabled={updatingId === order._id}
          >
            {updatingId === order._id ? "Actualizando..." : nextStatusLabel}
          </button>
        ) : null}
      </div>

      {isClosing ? (
        <KitchenClosingBox
          order={order}
          updatingId={updatingId}
          tipValue={tipValue}
          onTipChange={onTipChange}
          onCancel={onCancelClosing}
          onConfirm={onCloseOrder}
        />
      ) : null}
    </article>
  );
}

export default KitchenOrderCard;