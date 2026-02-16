import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from '../components/Navigation';

export const AppShell: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
            <Navigation />

            {/* Main Content Area */}
            <main className="md:pl-64 min-h-screen pb-20 md:pb-0 transition-all duration-300">
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
