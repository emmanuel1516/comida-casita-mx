import KitchenOrderCard from "./KitchenOrderCard";
import { getNextStatusLabel } from "./kitchenHelpers";

function KitchenOrdersGrid({
  orders,
  closingOrderId,
  updatingId,
  tipValues,
  onAdvanceStatus,
  onTipChange,
  onCancelClosing,
  onCloseOrder,
}) {
  return (
    <div className="kitchen-page-grid">
      {orders.map((order) => {
        const isClosing = closingOrderId === order._id;
        const nextStatusLabel = getNextStatusLabel(order);

        return (
          <KitchenOrderCard
            key={order._id}
            order={order}
            isClosing={isClosing}
            updatingId={updatingId}
            nextStatusLabel={nextStatusLabel}
            tipValue={tipValues[order._id]}
            onAdvanceStatus={onAdvanceStatus}
            onTipChange={onTipChange}
            onCancelClosing={onCancelClosing}
            onCloseOrder={onCloseOrder}
          />
        );
      })}
    </div>
  );
}

export default KitchenOrdersGrid;