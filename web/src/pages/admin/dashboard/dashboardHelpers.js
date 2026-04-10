export const DASHBOARD_POLLING_INTERVAL_MS = 10000;

export const STATUS_LABELS = {
  pendiente: "Pendiente",
  preparando: "Preparando",
  listo: "Listo",
  entregado: "Entregado",
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

export const isSameDay = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

export const formatTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

export const buildDashboardData = (orders) => {
  const today = new Date();

  const todayOrders = orders.filter(
    (order) => order.createdAt && isSameDay(new Date(order.createdAt), today)
  );

  const salesOrders = todayOrders.filter((order) =>
    ["listo", "entregado"].includes(order.status)
  );

  const statusSummary = {
    pendiente: 0,
    preparando: 0,
    listo: 0,
    entregado: 0,
  };

  let totalSales = 0;
  let totalTips = 0;
  let morningSales = 0;
  let afternoonSales = 0;

  const groupedByWaiter = {};

  for (const order of todayOrders) {
    if (order.status in statusSummary) {
      statusSummary[order.status] += 1;
    }
  }

  for (const order of salesOrders) {
    const orderTotal = Number(order.total || 0);
    const orderTip = Number(order.tip || 0);

    totalSales += orderTotal;
    totalTips += orderTip;

    if (order.shift === "mañana") {
      morningSales += orderTotal;
    }

    if (order.shift === "tarde") {
      afternoonSales += orderTotal;
    }

    const waiterId = order.waiter?._id || "no-waiter";
    const waiterName = order.waiter?.name || "Sin mesero";

    if (!groupedByWaiter[waiterId]) {
      groupedByWaiter[waiterId] = {
        waiterName,
        totalSales: 0,
        totalOrders: 0,
      };
    }

    groupedByWaiter[waiterId].totalSales += orderTotal;
    groupedByWaiter[waiterId].totalOrders += 1;
  }

  const totalOrders = salesOrders.length;
  const averageTicket = totalOrders ? totalSales / totalOrders : 0;

  const topWaiter =
    Object.values(groupedByWaiter).sort((a, b) => b.totalSales - a.totalSales)[0] ||
    null;

  const recentOrders = [...todayOrders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return {
    totalSales,
    totalTips,
    totalOrders,
    averageTicket,
    statusSummary,
    morningSales,
    afternoonSales,
    topWaiter,
    recentOrders,
  };
};