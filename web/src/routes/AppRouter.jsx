import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/admin/DashboardPage";
import CategoriesPage from "../pages/admin/CategoriesPage";
import DishesPage from "../pages/admin/DishesPage";
import TablesPage from "../pages/admin/TablesPage";
import WaitersPage from "../pages/admin/WaitersPage";
import OrdersPage from "../pages/orders/OrdersPage";
import ReportsPage from "../pages/admin/ReportsPage";
import KitchenPage from "../pages/kitchen/KitchenPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

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
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <DashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <CategoriesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/dishes"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <DishesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/tables"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <TablesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/waiters"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <WaitersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <OrdersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <ReportsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <RoleRoute allowedRoles={["admin", "mesero"]}>
              <OrdersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/kitchen"
          element={
            <RoleRoute allowedRoles={["admin", "mesero"]}>
              <KitchenPage />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
