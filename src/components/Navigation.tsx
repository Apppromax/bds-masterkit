import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, MessageSquare, User, LogOut, Settings, ShieldAlert, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Navigation: React.FC = () => {
    const { profile, user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            // Race with 1s timeout to prevent hanging
            await Promise.race([
                signOut(),
                new Promise(resolve => setTimeout(resolve, 1000))
            ]);
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            // Force navigation to login page
            navigate('/login');
        }
    };

    const navItems = React.useMemo(() => {
        const items = [
            { to: '/', icon: LayoutDashboard, label: 'Trang chủ' },
            { to: '/projects', icon: ShieldCheck, label: 'Kho dự án' },
            { to: '/notifications', icon: MessageSquare, label: 'Tin nhắn' },
            { to: '/profile', icon: User, label: 'Cá nhân' },
        ];

        // Add Admin link if user is admin
        if (profile?.role === 'admin') {
            items.push({ to: '/admin', icon: ShieldAlert, label: 'Quản trị hệ thống' });
        }
        return items;
    }, [profile?.role]);

    const userName = profile?.full_name || 'Khách';
    const userRole = profile?.role === 'admin' ? 'ADMIN' : (profile?.tier === 'pro' ? 'PRO' : 'FREE');

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transition-colors">
                <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Zap className="text-white" size={20} fill="currentColor" />
                    </div>
                    <h1 className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        HOMESPRO AI
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
                                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-bold'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 uppercase text-[11px] font-bold tracking-wider'
                                        } ${item.to === '/admin' ? 'mt-4 border border-red-100 bg-red-50/50 text-red-600 hover:bg-red-100 hover:text-red-700' : ''}`
                                    }
                                >
                                    <item.icon size={18} className="shrink-0" />
                                    <span>{item.label}</span>
                                    {item.to === '/admin' && <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Account Section */}
                <div className="p-4 space-y-4 border-t border-slate-100 dark:border-slate-800">
                    {user ? (
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${userName}&background=random`}
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
                                />
                                <div className="overflow-hidden">
                                    <p className="font-black text-sm text-slate-900 dark:text-white truncate">{userName}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${userRole === 'ADMIN' ? 'bg-red-100 text-red-600' :
                                    (userRole === 'PRO' ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-600')
                                    }`}>
                                    {userRole} MEMBER
                                </span>
                                {profile?.tier !== 'pro' && profile?.role !== 'admin' && (
                                    <button className="text-[10px] text-blue-600 font-bold hover:underline">Nâng cấp Pro</button>
                                )}
                            </div>

                            <button
                                onClick={handleSignOut}
                                className="w-full py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-2"
                            >
                                <LogOut size={14} /> ĐĂNG XUẤT
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20"
                        >
                            Đăng nhập ngay
                        </button>
                    )}
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-50 pb-safe shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)] rounded-t-3xl">
                <ul className="flex justify-around items-center h-20 px-4">
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex flex-col items-center justify-center p-2 transition-all ${isActive
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={`p-1.5 rounded-full transition-all ${isActive ? 'bg-blue-50 dark:bg-blue-900/20 -translate-y-2' : ''}`}>
                                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} />
                                        </div>
                                        <span className={`text-[10px] font-bold transition-all ${isActive ? 'opacity-100 -translate-y-1' : 'opacity-80'}`}>
                                            {item.label}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                    {/* Logout for mobile in user action or just here */}
                    {user && (
                        <li>
                            <button
                                onClick={handleSignOut}
                                className="flex flex-col items-center justify-center p-2 text-red-400"
                            >
                                <div className="p-1.5 rounded-full">
                                    <LogOut size={24} />
                                </div>
                                <span className="text-[10px] font-bold opacity-80 uppercase">Thoát</span>
                            </button>
                        </li>
                    )}
                </ul>
            </nav>
        </>
    );
};
