import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleRoute({ children, allowedRoles = [] }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length === 0) {
    return children;
  }

  if (!allowedRoles.includes(user.role)) {
    const redirectTo = user.role === "admin" ? "/admin/dashboard" : "/orders";
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default RoleRoute;
