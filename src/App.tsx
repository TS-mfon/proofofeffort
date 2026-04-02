import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/lib/genlayer/WalletProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";
import EngagementsPage from "./pages/EngagementsPage";
import NewEngagementPage from "./pages/NewEngagementPage";
import EngagementDetailPage from "./pages/EngagementDetailPage";
import SubmitWorkPage from "./pages/SubmitWorkPage";
import DisputePage from "./pages/DisputePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import VerifyPage from "./pages/VerifyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5000, refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <Toaster position="top-right" theme="dark" richColors closeButton />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/profile/:wallet" element={<ProfilePage />} />
                <Route path="/engagements" element={<EngagementsPage />} />
                <Route path="/engagements/new" element={<NewEngagementPage />} />
                <Route path="/engagements/:id" element={<EngagementDetailPage />} />
                <Route path="/engagements/:id/submit" element={<SubmitWorkPage />} />
                <Route path="/engagements/:id/dispute" element={<DisputePage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/verify/:wallet" element={<VerifyPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
