import { Navigate, useLocation } from "react-router-dom";
import AuthBootstrapOverlay from "../auth/AuthBootstrapOverlay";
import { normalizedUserMatchesRoutes } from "../auth/routeRoleGate";
import { useAuth } from "../auth/useAuth";

function rolesList(user) {
  const raw = user?.normalizedRoles;
  if (!Array.isArray(raw)) return undefined;
  return raw.map((r) => String(r));
}

/**
 * @param {{
 *   children: import("react").ReactNode;
 *   allowedRoles?: string[];
 *   roleMode?: "any" | "all";
 * }} props
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  roleMode = "any",
}) {
  const location = useLocation();
  const { hydrated, user, isAuthenticated } = useAuth();

  if (!hydrated) {
    return <AuthBootstrapOverlay />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate to="/login" state={{ from: location }} replace />
    );
  }

  if (
    allowedRoles?.length &&
    !normalizedUserMatchesRoutes(rolesList(user), allowedRoles, roleMode)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
