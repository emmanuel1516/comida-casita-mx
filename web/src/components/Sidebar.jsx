import { NavLink } from "react-router-dom";
import "./sidebar.css";

function Sidebar() {
  const links = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/categories", label: "Categorías" },
    { to: "/admin/dishes", label: "Platillos" },
    { to: "/admin/tables", label: "Mesas" },
    { to: "/admin/waiters", label: "Meseros" },
    { to: "/admin/orders", label: "Pedidos" },
    { to: "/admin/reports", label: "Reportes" },
    { to: "/kitchen", label: "Cocina" },
  ];

  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Comida Casita MX</h2>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;