import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, User, LogOut, Zap, DollarSign, Sparkles, LogIn, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Navigation: React.FC = () => {
    const { profile, user, signOut, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        try {
            navigate('/login');
            await signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const navItems = React.useMemo(() => {
        const items = [
            { to: '/', icon: LayoutDashboard, label: 'Trang chủ' },
            { to: '/crm', icon: Users, label: 'CRM Mini' },
            { to: '/pricing', icon: Sparkles, label: 'Gói PRO' },
            { to: '/profile', icon: User, label: 'Cá nhân' },
        ];

        // Add Admin link if user is admin
        if (profile?.role === 'admin') {
            items.splice(1, 0, { to: '/admin', icon: ShieldAlert, label: 'Quản trị' });
        }
        return items;
    }, [profile?.role]);

    const userName = loading ? 'Đang tải...' : (profile?.full_name || 'Khách');
    const userRole = loading ? '...' : (profile?.role === 'admin' ? 'ADMIN' : (profile?.tier === 'pro' ? 'PRO' : 'FREE'));

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-[280px] h-screen fixed left-0 top-0 bg-[#0f172a]/90 backdrop-blur-2xl border-r border-white/5 z-50 transition-all duration-500">
                <div className="p-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#bf953f] to-[#aa771c] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                        <Zap className="text-black" size={24} strokeWidth={3} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white leading-none tracking-widest">
                            HOMESPRO <span className="text-gold">AI</span>
                        </h1>
                        <span className="text-[10px] font-bold text-[#bf953f]/60 tracking-[0.2em] uppercase">Elite Engine</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-10 px-6">
                    <ul className="space-y-4">
                        {navItems.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${isActive
                                            ? 'bg-gradient-to-r from-[#bf953f]/20 to-transparent text-white border-l-4 border-[#bf953f] shadow-lg'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`
                                    }
                                >
                                    <item.icon size={22} className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${location.pathname === item.to ? 'text-[#bf953f]' : ''}`} />
                                    <span className="text-sm font-bold tracking-wide">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Account Section */}
                <div className="p-8 mt-auto border-t border-white/5">
                    {user ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${userName}&background=bf953f&color=fff`}
                                    alt="Avatar"
                                    className="w-12 h-12 rounded-2xl border-2 border-[#bf953f]/30 shadow-xl"
                                />
                                <div className="overflow-hidden">
                                    <p className="font-black text-sm text-white truncate">{userName}</p>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${userRole === 'ADMIN' ? 'bg-red-500/20 text-red-500' :
                                        (userRole === 'PRO' ? 'bg-[#bf953f]/20 text-[#bf953f]' : 'bg-slate-800 text-slate-400')
                                        }`}>
                                        {userRole}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-red-500/10 text-red-400 text-xs font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500 hover:text-white transition-all duration-300 group"
                            >
                                <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 bg-gradient-to-r from-[#bf953f] to-[#aa771c] text-black rounded-2xl font-black shadow-xl shadow-[#bf953f]/20 uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform"
                        >
                            Đăng nhập
                        </button>
                    )}
                </div>
            </aside >

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-[#171f35]/95 backdrop-blur-2xl border border-white/10 rounded-2xl z-50 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-300">
                <ul className="flex justify-between items-center h-full px-2">
                    {navItems.map((item) => (
                        <li key={item.to} className="flex-1">
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex flex-col items-center justify-center py-1 gap-1 transition-all duration-300 ${isActive ? 'text-[#bf953f]' : 'text-slate-500 opacity-60'}`
                                }
                            >
                                <div className={`p-1.5 rounded-xl transition-all ${location.pathname === item.to ? 'bg-gold/10' : ''}`}>
                                    <item.icon size={20} strokeWidth={location.pathname === item.to ? 3 : 2} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-widest text-center">
                                    {item.label}
                                </span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
};
