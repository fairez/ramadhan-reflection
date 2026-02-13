import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { hasConsented } from "@/pages/ConsentPage";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-hero">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  // Redirect to consent page if not yet agreed (skip if already on consent page)
  if (!hasConsented() && location.pathname !== "/consent") {
    return <Navigate to="/consent" replace />;
  }

  return <>{children}</>;
}
