import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PenTool, Calculator, Compass, Image, MessageSquare, ShieldCheck, Menu } from 'lucide-react';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/content', icon: PenTool, label: 'Content' },
    { to: '/loan', icon: Calculator, label: 'Lãi Vay' },
    { to: '/feng-shui', icon: Compass, label: 'Phong Thủy' },
    { to: '/image-studio', icon: Image, label: 'Ảnh BĐS' },
    { to: '/scripts', icon: MessageSquare, label: 'Kịch Bản' },
    // Admin link will be protected later, visible for now for dev
    { to: '/admin', icon: ShieldCheck, label: 'Admin' },
];

export const Navigation: React.FC = () => {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transition-colors">
                <div className="p-6 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        MasterKit
                    </h1>
                </div>

                <nav className="flex-1 overflow-y-auto py-4">
                    <ul className="space-y-1 px-3">
                        {navItems.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                        }`
                                    }
                                >
                                    <item.icon size={20} className="shrink-0" />
                                    <span>{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl text-white shadow-lg shadow-amber-500/20">
                        <p className="text-xs font-medium opacity-90">Gói hiện tại</p>
                        <p className="font-bold">Member Free</p>
                        <button className="mt-2 w-full py-1.5 px-3 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold backdrop-blur-sm transition-colors">
                            Nâng cấp Pro
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 pb-safe">
                <ul className="flex justify-around items-center h-16">
                    {navItems.slice(0, 5).map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex flex-col items-center justify-center p-2 w-16 transition-colors ${isActive
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className="text-[10px] mt-1 font-medium truncate w-full text-center">
                                            {item.label}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
};
