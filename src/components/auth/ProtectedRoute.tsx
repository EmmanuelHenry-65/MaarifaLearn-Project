import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Wait until Supabase finishes checking the session
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0e1a] text-cyan-400 text-lg">
        Loading...
      </div>
    );
  }

  // If the user is not logged in, send them to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated
  return <>{children}</>;
}

