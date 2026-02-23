import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShieldCheck, MessageSquare, User, LogOut, Settings, ShieldAlert, Zap, DollarSign, PenTool } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Navigation: React.FC = () => {
    const { profile, user, signOut, loading } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        try {
            // Optimistic update
            navigate('/login');
            await signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const navItems = React.useMemo(() => {
        const items = [
            { to: '/', icon: LayoutDashboard, label: 'Trang chủ' },
            { to: '/profile', icon: User, label: 'Cá nhân' },
        ];

        // Add Pricing to main nav if not PRO
        if (profile?.tier !== 'pro' && profile?.role !== 'admin') {
            items.splice(3, 0, { to: '/pricing', icon: Zap, label: 'Gói PRO' });
        }

        // Add Admin link if user is admin
        if (profile?.role === 'admin') {
            items.push({ to: '/admin', icon: ShieldAlert, label: 'Quản trị hệ thống' });
        }
        return items;
    }, [profile?.role]);

    const userName = loading ? 'Đang tải...' : (profile?.full_name || 'Khách');
    const userRole = loading ? '...' : (profile?.role === 'admin' ? 'ADMIN' : (profile?.tier === 'pro' ? 'PRO' : 'FREE'));

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-[280px] h-screen fixed left-0 top-0 bg-black/40 backdrop-blur-2xl border-r border-white/5 z-50 transition-all duration-500">
                <div className="p-8 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#bf953f] to-[#aa771c] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(191,149,63,0.3)]">
                        <DollarSign className="text-black" size={24} strokeWidth={3} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white leading-none">
                            App BĐS
                        </h1>
                        <span className="text-[10px] font-bold text-[#bf953f] tracking-[0.2em] uppercase">from FTU</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    className={({ isActive }) =>
                                        `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
                                            ? 'bg-gradient-to-r from-[#bf953f]/20 to-transparent text-[#fcf6ba] shadow-[inset_0_0_20px_rgba(191,149,63,0.05)]'
                                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                                        }`
                                    }
                                >
                                    <item.icon size={20} className={`shrink-0 transition-transform duration-300 group-hover:scale-110 ${window.location.pathname === item.to ? 'text-[#bf953f]' : ''}`} />
                                    <span className="text-sm font-bold tracking-wide">{item.label}</span>
                                    {item.to === '/admin' && <span className="ml-auto w-2 h-2 rounded-full bg-[#bf953f] shadow-[0_0_10px_#bf953f] animate-pulse"></span>}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Account Section */}
                <div className="p-6 mt-auto">
                    {user ? (
                        <div className="bg-white/5 backdrop-blur-md p-5 rounded-[2rem] border border-white/10 shadow-2xl">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="relative">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${userName}&background=bf953f&color=fff`}
                                        alt="Avatar"
                                        className="w-11 h-11 rounded-full border-2 border-[#bf953f]/30 shadow-lg"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full"></div>
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-extrabold text-[13px] text-white truncate">{userName}</p>
                                    <p className="text-[10px] text-slate-400 truncate font-medium">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex flex-col gap-1">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full inline-block w-fit ${userRole === 'ADMIN' ? 'bg-red-500/20 text-red-500' :
                                        (userRole === 'PRO' ? 'bg-[#bf953f]/20 text-[#bf953f]' : 'bg-slate-800 text-slate-400')
                                        }`}>
                                        {userRole} MEMBER
                                    </span>
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-yellow-500/10 rounded-full w-fit border border-yellow-500/20">
                                        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_5px_#eab308]"></div>
                                        <span className="text-[10px] font-black text-[#fcf6ba]">{profile?.credits || 0} <span className="opacity-60 text-[8px]">CREDITS</span></span>
                                    </div>
                                </div>
                                {profile?.tier !== 'pro' && profile?.role !== 'admin' && (
                                    <NavLink to="/pricing" className="text-[10px] text-[#bf953f] font-black hover:underline tracking-tighter uppercase">Nâng cấp Pro</NavLink>
                                )}
                            </div>

                            <button
                                onClick={handleSignOut}
                                className="w-full py-2.5 bg-black/40 border border-[#bf953f]/20 rounded-xl text-[10px] font-black text-slate-300 hover:text-white hover:bg-[#bf953f]/10 hover:border-[#bf953f]/40 transition-all uppercase tracking-[0.2em]"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-4 bg-gradient-to-r from-[#bf953f] to-[#aa771c] text-black rounded-2xl font-black shadow-xl shadow-[#bf953f]/20 uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform"
                        >
                            Đăng nhập ngay
                        </button>
                    )}
                </div>
            </aside >

            {/* Mobile Bottom Navigation - Glass Design */}
            < nav className="md:hidden fixed bottom-6 left-6 right-6 h-20 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]" >
                <ul className="flex justify-around items-center h-full px-4">
                    {navItems.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex flex-col items-center justify-center p-2 transition-all ${isActive ? 'text-[#bf953f]' : 'text-slate-400'}`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={`transition-all duration-300 ${isActive ? '-translate-y-1 scale-110' : ''}`}>
                                            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                        </div>
                                        <span className={`text-[10px] font-black mt-1 uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                                            {item.label}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav >
        </>
    );
};
