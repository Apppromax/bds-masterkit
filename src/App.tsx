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
import ImageStudio from './pages/ImageStudio';
import SalesScripts from './pages/SalesScripts';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          <Route path="/" element={<AppShell />}>
            <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="content" element={<ProtectedRoute><ContentCreator /></ProtectedRoute>} />
            <Route path="loan" element={<ProtectedRoute><LoanCalculator /></ProtectedRoute>} />
            <Route path="feng-shui" element={<ProtectedRoute><FengShui /></ProtectedRoute>} />
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
