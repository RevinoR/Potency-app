import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, isAdmin } from "./auth";

/**
 * A wrapper component for routes that require admin authentication
 * Redirects to login page if not authenticated or not an admin
 */
const AdminRoute = ({ children }) => {
  const location = useLocation();

  // Check if user is authenticated and is an admin
  const authenticated = isAuthenticated();
  const admin = isAdmin();

  if (!authenticated) {
    // Redirect to login with return URL
    return (
      <Navigate to="/signin" state={{ returnUrl: location.pathname }} replace />
    );
  }

  if (!admin) {
    // Redirect to home if authenticated but not admin
    return <Navigate to="/" replace />;
  }

  // If authenticated and admin, render the protected component
  return children;
};

export default AdminRoute;
