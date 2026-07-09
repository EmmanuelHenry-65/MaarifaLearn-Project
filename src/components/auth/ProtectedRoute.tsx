import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import LoadingScreen from "./LoadingScreen";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Wait until Supabase finishes checking the session
  if (loading) {
    return <LoadingScreen />;
  }

  // If the user is not logged in, send them to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated
  return <>{children}</>;
}

