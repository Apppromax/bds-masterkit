import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppShell } from './layouts/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Critical path — loaded immediately
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';

// Lazy loaded — downloaded only when user navigates
const LoanCalculator = lazy(() => import('./pages/LoanCalculator'));
const FengShui = lazy(() => import('./pages/FengShui'));
const LunarCalendar = lazy(() => import('./pages/LunarCalendar'));
const SalesScripts = lazy(() => import('./pages/SalesScripts'));
const ContentCreator = lazy(() => import('./pages/ContentCreator'));
const SalesStrategy = lazy(() => import('./pages/SalesStrategy'));
const ImageStudio = lazy(() => import('./pages/ImageStudio'));
const MiniCRM = lazy(() => import('./pages/MiniCRM'));
const Profile = lazy(() => import('./pages/Profile'));
const Pricing = lazy(() => import('./pages/Pricing'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AuthConfirm = lazy(() => import('./pages/AuthConfirm'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));

function LazyFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="animate-spin text-gold" size={32} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LazyFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/confirm" element={<AuthConfirm />} />

            <Route path="/" element={<AppShell />}>
              {/* Free Features - Public Access */}
              <Route index element={<Dashboard />} />
              <Route path="loan" element={<LoanCalculator />} />
              <Route path="feng-shui" element={<FengShui />} />
              <Route path="lunar" element={<LunarCalendar />} />
              <Route path="scripts" element={<SalesScripts />} />

              {/* Placeholder Pages */}
              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="pricing" element={<Pricing />} />

              {/* VIP Features - Require Login */}
              <Route path="chot-sale" element={<ProtectedRoute requirePro><SalesStrategy /></ProtectedRoute>} />
              <Route path="content" element={<Navigate to="/chot-sale" replace />} />
              <Route path="image-studio" element={<ProtectedRoute requirePro><ImageStudio /></ProtectedRoute>} />
              <Route path="crm" element={<ProtectedRoute requirePro><MiniCRM /></ProtectedRoute>} />

              {/* Admin Route */}
              <Route element={<ProtectedRoute requireAdmin />}>
                <Route path="admin" element={<AdminDashboard />} />
              </Route>

              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
