import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/admin/DashboardPage";
import CategoriesPage from "../pages/admin/CategoriesPage";
import DishesPage from "../pages/admin/DishesPage";
import TablesPage from "../pages/admin/TablesPage";
import WaitersPage from "../pages/admin/WaitersPage";
import OrdersPage from "../pages/admin/OrdersPage";
import ReportsPage from "../pages/admin/ReportsPage";
import KitchenPage from "../pages/kitchen/KitchenPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";

function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/categories" element={<CategoriesPage />} />
        <Route path="/admin/dishes" element={<DishesPage />} />
        <Route path="/admin/tables" element={<TablesPage />} />
        <Route path="/admin/waiters" element={<WaitersPage />} />
        <Route path="/admin/orders" element={<OrdersPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/kitchen" element={<KitchenPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;