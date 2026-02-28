import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, User, LogOut, Zap, Sparkles, LogIn, Users, Coins, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ChotsaleLogo from './ChotsaleLogo';

export const Navigation: React.FC = () => {
    const { profile, user, signOut, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleSignOut = async () => {
        await signOut();
    };

    const navItems = React.useMemo(() => {
        const items = [
            { to: '/', icon: LayoutDashboard, label: 'Trang chủ' },
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
    const userRole = loading ? '...' : (profile?.role === 'admin' ? 'ADMIN' : (profile?.tier === 'pro' ? 'VIP' : 'FREE'));

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-[280px] h-screen fixed left-0 top-0 bg-[#0f172a]/95 backdrop-blur-3xl border-r border-white/5 z-50 transition-all duration-500 overflow-hidden">
                <div className="p-6">
                    <NavLink to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#bf953f] to-[#aa771c] rounded-xl flex items-center justify-center shadow-lg transform rotate-3 transition-transform group-hover:rotate-6 group-hover:scale-110">
                            <ChotsaleLogo className="text-black" size={24} />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-white leading-none tracking-widest transition-colors duration-300 group-hover:text-amber-100 uppercase">
                                CHOTSALE <span className="text-gold">AI</span>
                            </h1>
                            <span className="text-[9px] font-black text-[#bf953f] tracking-[0.2em] uppercase">Elite Engine</span>
                        </div>
                    </NavLink>
                </div>

                <nav className="flex-1 px-4 pt-2">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 group ${isActive
                                            ? 'bg-gradient-to-r from-[#bf953f]/20 to-transparent text-white border-l-4 border-[#bf953f] shadow-lg'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`
                                    }
                                >
                                    <item.icon size={20} strokeWidth={1.5} className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${location.pathname === item.to ? 'text-[#bf953f]' : ''}`} />
                                    <span className="text-xs font-bold tracking-wide uppercase">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>

                    {/* Credit Balance Card (Persuasive UI - Compact) */}
                    {user && (
                        <div className="mt-6 p-4 bg-gradient-to-br from-[#1a2332] to-black rounded-[1.5rem] border border-gold/20 shadow-2xl relative overflow-hidden group/card">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gold/5 blur-[30px] -z-10 group-hover/card:bg-gold/15 transition-all"></div>
                            <div className="flex flex-col gap-3 relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Coins className="text-gold animate-bounce duration-[3000ms]" size={16} />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none italic">Ví Xu</span>
                                    </div>
                                    <span className="text-lg font-black text-white leading-none tracking-tighter">{profile?.credits || 0}</span>
                                </div>
                                <NavLink
                                    to="/pricing"
                                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-gold to-[#aa771c] text-black rounded-lg text-[9px] font-black tracking-[0.2em] uppercase hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-gold/20"
                                >
                                    <Plus size={12} strokeWidth={4} /> Nạp Thêm
                                </NavLink>
                            </div>
                        </div>
                    )}
                </nav>

                {/* Account Section - Compact */}
                <div className="p-6 mt-auto border-t border-white/5 bg-black/40 backdrop-blur-xl">
                    {user ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <NavLink to="/profile" className="shrink-0 hover:scale-110 transition-transform">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${userName}&background=bf953f&color=fff`}
                                        alt="Avatar"
                                        className="w-10 h-10 rounded-xl border-2 border-[#bf953f]/30 shadow-xl"
                                    />
                                </NavLink>
                                <div className="overflow-hidden">
                                    <p className="font-black text-[13px] text-white truncate leading-tight">{userName}</p>
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest inline-block mt-0.5 ${userRole === 'ADMIN' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                                        (userRole === 'VIP' ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-slate-800 text-slate-400 border border-white/5')
                                        }`}>
                                        {userRole}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/10 hover:bg-red-500 hover:text-white transition-all duration-300 group"
                            >
                                <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
                                Đăng xuất
                            </button>
                            <div className="text-center">
                                <span className="text-[8px] font-black text-slate-500/40 tracking-[0.2em] uppercase">v1.0.2</span>
                            </div>
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
            <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-[#171f35]/95 backdrop-blur-3xl border border-white/10 rounded-2xl z-50 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] transition-all duration-300">
                <ul className="flex justify-between items-center h-full px-2">
                    {navItems.map((item) => (
                        <li key={item.to} className="flex-1">
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex flex-col items-center justify-center py-1 gap-1 transition-all duration-300 ${isActive ? 'text-[#bf953f]' : 'text-slate-500 opacity-60'}`
                                }
                            >
                                <div className={`p-1.5 rounded-xl transition-all relative ${location.pathname === item.to ? 'bg-gold/10' : ''}`}>
                                    <item.icon size={20} strokeWidth={location.pathname === item.to ? 1.8 : 1.5} />
                                    {item.to === '/pricing' && user && (
                                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
                                    )}
                                </div>
                                <span className="text-[8px] font-black uppercase tracking-widest text-center">
                                    {item.label === 'Gói PRO' ? (profile?.credits || 0) + ' Xu' : item.label}
                                </span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
};
