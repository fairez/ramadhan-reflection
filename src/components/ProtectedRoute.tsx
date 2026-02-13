import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { hasConsented, checkConsentFromDb } from "@/pages/ConsentPage";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [consentChecked, setConsentChecked] = useState(hasConsented());
  const [checkingConsent, setCheckingConsent] = useState(!hasConsented());

  useEffect(() => {
    if (user && !hasConsented()) {
      checkConsentFromDb(user.id).then((accepted) => {
        setConsentChecked(accepted);
        setCheckingConsent(false);
      });
    }
  }, [user]);

  if (loading || checkingConsent) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-hero">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  if (!consentChecked && location.pathname !== "/consent") {
    return <Navigate to="/consent" replace />;
  }

  return <>{children}</>;
}
