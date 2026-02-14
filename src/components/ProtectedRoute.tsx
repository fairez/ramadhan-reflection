import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { hasConsented, checkConsentFromDb } from "@/pages/ConsentPage";

const CONSENT_KEY = "ramadhan_journal_consent";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [consentChecked, setConsentChecked] = useState(() => hasConsented());
  const [checkingConsent, setCheckingConsent] = useState(() => !hasConsented());

  useEffect(() => {
    if (user && !hasConsented()) {
      checkConsentFromDb(user.id).then((accepted) => {
        setConsentChecked(accepted);
        setCheckingConsent(false);
      });
    } else if (user && hasConsented()) {
      // Ensure state is synced if localStorage has consent
      setConsentChecked(true);
      setCheckingConsent(false);
    }
  }, [user]);

  // Listen for localStorage changes to detect consent updates in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CONSENT_KEY) {
        const hasConsent = hasConsented();
        setConsentChecked(hasConsent);
        setCheckingConsent(false);
      }
    };

    // Custom event for same-tab localStorage changes
    const handleConsentUpdate = () => {
      const hasConsent = hasConsented();
      setConsentChecked(hasConsent);
      setCheckingConsent(false);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("consentUpdated", handleConsentUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("consentUpdated", handleConsentUpdate);
    };
  }, []);

  useEffect(() => {
    // Always re-check consent status when pathname changes
    const hasConsent = hasConsented();
    setConsentChecked(hasConsent);
    if (hasConsent) {
      setCheckingConsent(false);
    }
    // If navigating away from /consent, ensure we check consent status
    if (location.pathname !== "/consent" && !hasConsent && user) {
      // Re-check from database if localStorage doesn't have it
      checkConsentFromDb(user.id).then((accepted) => {
        setConsentChecked(accepted);
        setCheckingConsent(false);
      });
    }
  }, [location.pathname, user]);

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
