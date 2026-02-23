import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppShell } from './layouts/AppShell';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/admin/Dashboard';
import Dashboard from './pages/Dashboard';
import ContentCreator from './pages/ContentCreator';
import LoanCalculator from './pages/LoanCalculator';
import FengShui from './pages/FengShui';
import LunarCalendar from './pages/LunarCalendar';
import ImageStudio from './pages/ImageStudio';
import SalesScripts from './pages/SalesScripts';
import { ProtectedRoute } from './components/ProtectedRoute';
import Profile from './pages/Profile';
import Pricing from './pages/Pricing';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/" element={<AppShell />}>
            {/* Free Features - Public Access */}
            <Route index element={<Dashboard />} />
            <Route path="content" element={<ContentCreator />} />
            <Route path="loan" element={<LoanCalculator />} />
            <Route path="feng-shui" element={<FengShui />} />
            <Route path="lunar" element={<LunarCalendar />} />

            {/* Placeholder Pages */}
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="pricing" element={<Pricing />} />

            {/* VIP Features - Require Login */}
            <Route path="image-studio" element={<ProtectedRoute><ImageStudio /></ProtectedRoute>} />
            <Route path="scripts" element={<ProtectedRoute><SalesScripts /></ProtectedRoute>} />

            {/* Admin Route */}
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="admin" element={<AdminDashboard />} />
            </Route>

            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
