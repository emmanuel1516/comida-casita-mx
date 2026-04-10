export const initialFilters = {
  waiter: "",
  shift: "",
  date: "",
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: getAuthHeaders(),
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Ocurrió un error en la petición");
  }

  return data;
};

export const filterOrders = (orders, filters) => {
  return orders.filter((order) => {
    const orderWaiterId = order.waiter?._id || "";
    const orderDate = order.createdAt
      ? new Date(order.createdAt).toISOString().slice(0, 10)
      : "";

    if (filters.waiter && orderWaiterId !== filters.waiter) {
      return false;
    }

    if (filters.shift && order.shift !== filters.shift) {
      return false;
    }

    if (filters.date && orderDate !== filters.date) {
      return false;
    }

    return true;
  });
};

export const buildReportData = (orders, filters) => {
  const filteredOrders = filterOrders(orders, filters);

  const salesOrders = filteredOrders.filter((order) =>
    ["listo", "entregado"].includes(order.status)
  );

  const totalSales = salesOrders.reduce(
    (total, order) => total + Number(order.total || 0),
    0
  );

  const totalTips = salesOrders.reduce(
    (total, order) => total + Number(order.tip || 0),
    0
  );

  const totalOrders = salesOrders.length;
  const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

  const groupedByWaiter = {};

  for (const order of salesOrders) {
    const waiterId = order.waiter?._id || "no-waiter";
    const waiterName = order.waiter?.name || "Sin mesero";

    if (!groupedByWaiter[waiterId]) {
      groupedByWaiter[waiterId] = {
        waiterName,
        totalSales: 0,
        totalTips: 0,
        totalOrders: 0,
      };
    }

    groupedByWaiter[waiterId].totalSales += Number(order.total || 0);
    groupedByWaiter[waiterId].totalTips += Number(order.tip || 0);
    groupedByWaiter[waiterId].totalOrders += 1;
  }

  const reportByWaiter = Object.values(groupedByWaiter).map((item) => ({
    ...item,
    averageTicket: item.totalOrders > 0 ? item.totalSales / item.totalOrders : 0,
  }));

  return {
    totalSales,
    totalTips,
    totalOrders,
    averageTicket,
    reportByWaiter,
  };
};