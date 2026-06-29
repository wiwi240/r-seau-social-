import { Navigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { authAtom } from "../state/socialAtoms";

export default function ProtectedRoute({ children }) {
  const { jwt, isReady } = useAtomValue(authAtom);

  if (!isReady) {
    return <p className="card">Vérification de la session...</p>;
  }

  return jwt ? children : <Navigate to="/login" replace />;
}
