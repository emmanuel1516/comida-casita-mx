import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import "./dashboard-layout.css";

function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Panel de gestión</h1>
            <p className="dashboard-subtitle">
              Usuario: {user?.name} ({user?.role})
            </p>
          </div>

          <button className="dashboard-logout-button" onClick={logout}>
            Cerrar sesión
          </button>
        </header>

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;