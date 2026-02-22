import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    PenTool,
    Calculator,
    Compass,
    Image as ImageIcon,
    MessageSquare,
    Star,
    ChevronRight,
    Zap,
    Calendar,
    Sparkles,
    ArrowRight,
    Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
    const { user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const isInternalLoading = authLoading || (user && !profile);
    const userName = isInternalLoading ? '...' : (profile?.full_name || 'Khách');
    const isPro = profile?.tier === 'pro' || profile?.role === 'admin';
    const displayRole = isInternalLoading ? '...' : (profile?.role === 'admin' ? 'ADMIN' : (isPro ? 'PRO' : 'FREE'));

    const featuredTool = {
        to: '/image-studio',
        icon: ImageIcon,
        label: 'Tạo Ảnh AI Chuyên Nghiệp',
        badge: 'VIP / PRO',
        desc: 'Nâng tầm hình ảnh BĐS với công nghệ Generative AI đỉnh cao. Xóa vật thể, đổi nền, và làm nét ảnh chỉ trong vài giây.',
        color: 'from-violet-600 via-indigo-500 to-purple-600'
    };

    const tools = [
        {
            to: '/content',
            icon: PenTool,
            label: 'Kho Nội Dung',
            badge: 'Miễn phí',
            bg: 'bg-teal-500',
            desc: 'Tạo caption đăng tin tự động'
        },
        {
            to: '/loan',
            icon: Calculator,
            label: 'Tính Lãi Vay',
            badge: 'Miễn phí',
            bg: 'bg-blue-500',
            desc: 'Dự toán khoản vay & trả nợ'
        },
        {
            to: '/scripts',
            icon: MessageSquare,
            label: 'Kịch Bản Sale',
            badge: 'VIP',
            bg: 'bg-amber-500',
            desc: 'Bộ quy trình xử lý từ chối'
        },
        {
            to: '/feng-shui',
            icon: Compass,
            label: 'Tra Hướng Nhà',
            badge: 'Miễn phí',
            bg: 'bg-orange-500',
            desc: 'Phong thủy theo tuổi gia chủ'
        },
        {
            to: '/lunar',
            icon: Calendar,
            label: 'Lịch Âm Dương',
            badge: 'Miễn phí',
            bg: 'bg-red-500',
            desc: 'Tra cứu ngày tốt, giờ hoàng đạo'
        }
    ];

    const handleUserClick = () => {
        if (user) navigate('/profile');
        else navigate('/login');
    };

    return (
        <div className="pb-24 min-h-screen bg-black overflow-x-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#bf953f] to-[#aa771c] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#bf953f]/30 ring-1 ring-white/20">
                        <Zap className="text-black" size={24} strokeWidth={3} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-[0.1em] leading-none mb-1">HOMESPRO <span className="text-[#bf953f]">AI</span></h1>
                        <p className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase">The Elite Real Estate Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div
                            onClick={handleUserClick}
                            className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 pl-2 pr-5 py-2 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group active:scale-95"
                        >
                            <img
                                src={`https://ui-avatars.com/api/?name=${userName}&background=bf953f&color=fff`}
                                alt="Avatar"
                                className="w-8 h-8 rounded-xl shadow-lg border border-white/10 group-hover:scale-105 transition-transform"
                            />
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black text-white leading-tight uppercase tracking-wide">
                                    {userName.split(' ').pop()}
                                </span>
                                <span className="text-[9px] font-bold text-[#bf953f] tracking-widest">
                                    {displayRole} MEMBER
                                </span>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="text-xs font-black bg-gradient-to-r from-[#bf953f] to-[#aa771c] text-black px-6 py-2.5 rounded-xl uppercase tracking-widest shadow-lg shadow-[#bf953f]/20 hover:scale-105 transition-transform"
                        >
                            Đăng nhập
                        </button>
                    )}
                    <button className="relative w-11 h-11 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                        <Bell size={22} className="text-slate-400" />
                        <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-[#bf953f] rounded-full border-2 border-black"></span>
                    </button>
                </div>
            </div>

            {/* AI FEATURED SECTION - THE HERO CARD */}
            <div className="mb-12 group">
                <div className="relative overflow-hidden rounded-[2.5rem] border border-[#bf953f]/30 bg-[#0a0a0a] shadow-2xl transition-all duration-500 hover:shadow-[#bf953f]/20 hover:border-[#bf953f]/50">
                    {/* Glossy Overlay Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                    <div className="absolute top-[-100%] left-[-100%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent rotate-12 transition-all duration-1000 group-hover:top-[100%] group-hover:left-[100%]"></div>

                    {/* Animated Background Orbs */}
                    <div className="absolute top-[-50%] left-[-10%] w-[70%] h-[200%] bg-[#bf953f]/5 blur-[120px] rounded-full group-hover:bg-[#bf953f]/10 transition-colors duration-700"></div>
                    <div className="absolute bottom-[-50%] right-[-10%] w-[60%] h-[180%] bg-violet-600/5 blur-[120px] rounded-full group-hover:bg-violet-600/10 transition-colors duration-700"></div>

                    <div className="relative z-10 p-8 md:p-14 flex flex-col md:flex-row items-center gap-10 md:gap-16">
                        <div className="relative">
                            <div className="w-28 h-28 md:w-40 md:h-40 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-[2.5rem] flex items-center justify-center shadow-[0_20px_50px_rgba(191,149,63,0.3)] relative z-10 group-hover:rotate-6 group-hover:scale-105 transition-all duration-700 p-[2px]">
                                <div className="w-full h-full bg-black/10 rounded-[2.4rem] flex items-center justify-center backdrop-blur-sm">
                                    <featuredTool.icon size={56} className="text-black group-hover:scale-110 transition-transform duration-700" strokeWidth={1.5} />
                                </div>
                            </div>
                            <div className="absolute -top-4 -right-4 w-14 h-14 bg-black/90 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-[#bf953f]/50 shadow-2xl z-20 animate-bounce">
                                <Sparkles className="text-[#fcf6ba]" size={24} />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#bf953f]/10 border border-[#bf953f]/20 mb-8 shadow-lg shadow-black/20">
                                <div className="w-2 h-2 bg-[#bf953f] rounded-full animate-ping"></div>
                                <span className="text-[11px] font-black text-[#bf953f] uppercase tracking-[0.3em]">{featuredTool.badge}</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase italic leading-[0.9]">
                                {featuredTool.label.split(' ').map((word, i) => (
                                    <React.Fragment key={i}>
                                        {word === 'AI' ? <span className="text-gold px-2">AI</span> : word}{' '}
                                    </React.Fragment>
                                ))}
                            </h2>
                            <p className="text-slate-400 text-lg md:text-2xl font-medium mb-10 max-w-2xl leading-relaxed">
                                {featuredTool.desc}
                            </p>
                            <Link
                                to={featuredTool.to}
                                className="inline-flex items-center gap-4 bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#aa771c] text-black px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm hover:scale-105 hover:shadow-[0_0_40px_rgba(191,149,63,0.5)] transition-all active:scale-95 group/btn"
                            >
                                Bắt đầu sáng tạo
                                <ArrowRight size={22} className="group-hover/btn:translate-x-2 transition-transform duration-500" strokeWidth={3} />
                            </Link>
                        </div>
                    </div>

                    {/* Decorative bottom line */}
                    <div className="h-1 w-0 bg-gradient-to-r from-transparent via-[#bf953f] to-transparent group-hover:w-full transition-all duration-1000 absolute bottom-0 left-0"></div>
                </div>
            </div>

            {/* Daily Wisdom / Card */}
            <div className="mb-14 relative group">
                <div className="glass-card border-none bg-white/[0.03] p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center rounded-[3rem] shadow-2xl hover:bg-white/[0.05] transition-colors duration-500">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-900 via-black to-slate-900 rounded-[2rem] flex items-center justify-center border border-white/10 shrink-0 shadow-xl group-hover:rotate-3 transition-transform">
                        <Calendar size={32} className="text-[#bf953f]" />
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                            <div className="h-[1px] w-8 bg-[#bf953f]/30"></div>
                            <h4 className="text-[#bf953f] text-[11px] font-black tracking-[0.4em] uppercase">
                                Elite Daily Wisdom
                            </h4>
                            <div className="h-[1px] w-8 bg-[#bf953f]/30"></div>
                        </div>
                        <p className="text-slate-200 text-lg md:text-xl font-semibold leading-relaxed">
                            "Chào <span className="text-[#bf953f] font-black underline underline-offset-4 decoration-[#bf953f]/30">{userName}</span>, hôm nay là ngày hoàng đạo, hướng Đông Nam thu hút tài lộc mạnh mẽ. Một ngày tuyệt vời để <span className="text-white decoration-[#bf953f] decoration-2 underline underline-offset-8 italic">chốt những hợp đồng triệu đô</span>."
                        </p>
                    </div>
                </div>
            </div>

            {/* TOOLS GRID - IMPROVED CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16 px-2">
                {tools.map((tool, index) => (
                    <Link
                        to={tool.to}
                        key={index}
                        className="glass-card group p-10 flex flex-col justify-between min-h-[220px] relative overflow-hidden border-white/5 hover:border-[#bf953f]/40 hover:bg-white/[0.05] active:scale-[0.98] transition-all duration-500 rounded-[2.5rem] shadow-xl"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.02] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>

                        <div className="flex justify-between items-start relative z-10">
                            <div className="w-16 h-16 bg-white/[0.03] backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-[#bf953f]/50 group-hover:bg-[#bf953f]/5 transition-all duration-500 shadow-2xl">
                                <tool.icon size={32} className="text-[#bf953f] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500" strokeWidth={1.5} />
                            </div>
                            <div className="px-5 py-2 rounded-xl bg-black/60 text-[#bf953f] border border-[#bf953f]/20 group-hover:border-[#bf953f]/50 group-hover:shadow-[0_0_15px_rgba(191,149,63,0.2)] transition-all">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tool.badge}</span>
                            </div>
                        </div>

                        <div className="mt-10 relative z-10">
                            <h3 className="text-3xl font-black text-white leading-tight mb-3 tracking-tighter group-hover:text-[#bf953f] transition-colors uppercase italic">{tool.label}</h3>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-6 opacity-80 group-hover:opacity-100 transition-opacity uppercase">{tool.desc}</p>
                            <div className="flex items-center gap-4 group/action">
                                <span className="h-[3px] w-10 bg-gradient-to-r from-[#bf953f] to-transparent group-hover:w-20 transition-all duration-700 rounded-full"></span>
                                <div className="flex items-center gap-2 group-hover:gap-4 transition-all duration-500">
                                    <span className="text-[11px] text-[#bf953f] font-black uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all">Mở Tool</span>
                                    <div className="w-8 h-8 rounded-full bg-[#bf953f]/10 flex items-center justify-center border border-[#bf953f]/30 group-hover:bg-[#bf953f] group-hover:text-black transition-all">
                                        <ChevronRight size={18} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
