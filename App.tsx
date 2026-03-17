import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ScrollToTop } from "@/components/ScrollToTop";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import DiagnosticsPage from "./pages/DiagnosticsPage";
import PetProfilePage from "./pages/PetProfilePage";
import TimelinePage from "./pages/TimelinePage";
import WaitlistPage from "./pages/WaitlistPage";
import TriagePage from "./pages/TriagePage";
import RecordsPage from "./pages/RecordsPage";
import AskVetPage from "./pages/AskVetPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import MethodologyPage from "./pages/MethodologyPage";
import ActivityPage from "./pages/ActivityPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
          <Route path="/pet" element={<PetProfilePage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/waitlist" element={<WaitlistPage />} />
          <Route path="/triage" element={<TriagePage />} />
          <Route path="/records" element={<RecordsPage />} />
          <Route path="/ask-vet" element={<AskVetPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/membership" element={<WaitlistPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
