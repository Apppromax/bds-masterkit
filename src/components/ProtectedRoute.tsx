import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children?: React.ReactNode;
    requireAdmin?: boolean;
    requirePro?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false, requirePro = false }) => {
    const { user, profile, loading, profileLoading } = useAuth();

    // Stage 1: Auth is still loading — show full loading screen
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full animate-ping"></div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">Đang xác thực bảo mật...</p>
                </div>
            </div>
        );
    }

    // Stage 2: Not logged in
    if (!user) {
        if (requirePro) {
            return <Navigate to="/pricing" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    // Stage 3: Admin/Pro check requires profile — wait if still loading
    if ((requireAdmin || requirePro) && profileLoading && !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin"></div>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">Đang tải quyền truy cập...</p>
                </div>
            </div>
        );
    }

    // Stage 4: Admin check
    if (requireAdmin) {
        if (!profile || profile.role !== 'admin') {
            return <Navigate to="/" replace />;
        }
    }

    // Stage 5: Pro check
    if (requirePro) {
        if (!profile || profile.tier !== 'pro') {
            return <Navigate to="/pricing" replace />;
        }
    }

    return children ? <>{children}</> : <Outlet />;
};
