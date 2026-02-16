import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children?: React.ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full animate-ping"></div>
                    </div>
                    <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Đang xác thực bảo mật...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin) {
        // If profile is not loaded yet or role is not admin, redirect
        // Note: profile might be null if DB is not set up correctly, effectively blocking admin access, which is safe.
        if (!profile || profile.role !== 'admin') {
            return <Navigate to="/" replace />;
        }
    }

    return children ? <>{children}</> : <Outlet />;
};
