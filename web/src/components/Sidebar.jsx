import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

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

  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleCloseMenu = () => {
    setIsOpen(false);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <h2 className="sidebar-title">Comida Casita MX</h2>

        <button
          className="sidebar-toggle"
          type="button"
          onClick={handleToggleMenu}
          aria-label="Abrir menú"
        >
          ☰
        </button>
      </div>

      <nav className={`sidebar-nav ${isOpen ? "open" : ""}`}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={handleCloseMenu}
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