import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import IntroPage from "./pages/IntroPage";
import DashboardPage from "./pages/DashboardPage";
import LetterPage from "./pages/LetterPage";
import TrackerPage from "./pages/TrackerPage";
import DailyTargetsPage from "./pages/DailyTargetsPage";
import TadabburPage from "./pages/TadabburPage";
import QuranJournalPage from "./pages/QuranJournalPage";
import ItikafPage from "./pages/ItikafPage";
import DoaPage from "./pages/DoaPage";
import ConsentPage from "./pages/ConsentPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/consent" element={<ProtectedRoute><ConsentPage /></ProtectedRoute>} />
            <Route path="/intro" element={<ProtectedRoute><IntroPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/letter" element={<ProtectedRoute><LetterPage /></ProtectedRoute>} />
            <Route path="/tracker" element={<ProtectedRoute><TrackerPage /></ProtectedRoute>} />
            <Route path="/daily-targets" element={<ProtectedRoute><DailyTargetsPage /></ProtectedRoute>} />
            <Route path="/tadabbur" element={<ProtectedRoute><TadabburPage /></ProtectedRoute>} />
            <Route path="/quran-journal" element={<ProtectedRoute><QuranJournalPage /></ProtectedRoute>} />
            <Route path="/itikaf" element={<ProtectedRoute><ItikafPage /></ProtectedRoute>} />
            <Route path="/doa" element={<ProtectedRoute><DoaPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
