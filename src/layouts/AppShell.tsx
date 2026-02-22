import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navigation } from '../components/Navigation';

export const AppShell: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-bronze/30 selection:text-white">
            {/* Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#bf953f]/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#aa771c]/5 blur-[120px] rounded-full"></div>
            </div>

            <Navigation />

            {/* Main Content Area */}
            <main className="md:pl-[280px] min-h-screen pb-24 md:pb-0 relative z-10 transition-all duration-500">
                <div className="max-w-[1400px] mx-auto p-4 md:p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
