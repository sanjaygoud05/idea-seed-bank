import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/hooks/useTheme';
import { AuthProvider } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

import AuthPage from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import CompanyProfile from './pages/CompanyProfile';
import UploadCenter from './pages/UploadCenter';
import DocumentResults from './pages/DocumentResults';
import DigitalTwin from './pages/DigitalTwin';
import Analytics from './pages/Analytics';
import AIInsights from './pages/AIInsights';
import CarbonCalculator from './pages/CarbonCalculator';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const protect = (el: React.ReactNode) => <ProtectedRoute>{el}</ProtectedRoute>;

const App = () => (
  <ThemeProvider defaultTheme="dark" storageKey="theme">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={protect(<Dashboard />)} />
              <Route path="/company" element={protect(<CompanyProfile />)} />
              <Route path="/uploads" element={protect(<UploadCenter />)} />
              <Route path="/documents/:id" element={protect(<DocumentResults />)} />
              <Route path="/digital-twin" element={protect(<DigitalTwin />)} />
              <Route path="/analytics" element={protect(<Analytics />)} />
              <Route path="/ai-insights" element={protect(<AIInsights />)} />
              <Route path="/carbon-calculator" element={protect(<CarbonCalculator />)} />
              <Route path="/reports" element={protect(<Reports />)} />
              <Route path="/notifications" element={protect(<Notifications />)} />
              <Route path="/settings" element={protect(<Settings />)} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
