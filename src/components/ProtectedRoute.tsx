import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
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

    return <Outlet />;
};
