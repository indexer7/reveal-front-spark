import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";

// Pages
import { Profile } from "./pages/Profile";
import { Home } from "./pages/Home";
import { Scan } from "./pages/Scan";
import { FlowDiagram } from "./pages/FlowDiagram";
import { ScanStatus } from "./pages/ScanStatus";
import { Scoring } from "./pages/Scoring";
import { Report } from "./pages/Report";
import { Upload } from "./pages/Upload";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<MainLayout />}>
      <Route index element={<Home />} />
      <Route path="scan" element={<Scan />} />
      <Route path="flow" element={<FlowDiagram />} />
      <Route path="status" element={<ScanStatus />} />
      <Route path="status/:jobId" element={<ScanStatus />} />
      <Route path="scoring" element={<Scoring />} />
      <Route path="scoring/:jobId" element={<Scoring />} />
      <Route path="report" element={<Report />} />
      <Route path="report/:jobId" element={<Report />} />
      <Route path="upload" element={<Upload />} />
      <Route path="profile" element={<Profile />} />
      <Route path="admin/*" element={<div>Admin Panel - Coming Soon</div>} />
    </Route>
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
