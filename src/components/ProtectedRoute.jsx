import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children }) {
  const jwt = useSelector((state) => state.auth.jwt);
  return jwt ? children : <Navigate to="/login" replace />;
}
