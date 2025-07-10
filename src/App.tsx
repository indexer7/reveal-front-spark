import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthContext, useAuthProvider } from "@/hooks/useAuth";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

// Pages
import { Login } from "./pages/Login";
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
    {/* Public routes */}
    <Route path="/login" element={<Login />} />
    
    {/* Protected routes */}
    <Route path="/" element={
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    }>
      <Route index element={<Home />} />
      <Route path="scan" element={<Scan />} />
      <Route path="flow" element={<FlowDiagram />} />
      <Route path="status/:jobId" element={<ScanStatus />} />
      <Route path="scoring/:jobId" element={<Scoring />} />
      <Route path="report/:jobId" element={<Report />} />
      <Route path="upload" element={<Upload />} />
      <Route path="profile" element={<Profile />} />
      
      {/* Admin routes */}
      <Route path="admin/*" element={
        <ProtectedRoute requiredRole="admin">
          <div>Admin Panel - Coming Soon</div>
        </ProtectedRoute>
      } />
    </Route>
    
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  const auth = useAuthProvider();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={auth}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
