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
        <div className="pb-10 min-h-screen bg-black overflow-x-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#bf953f] to-[#aa771c] rounded-xl flex items-center justify-center shadow-2xl shadow-[#bf953f]/20 ring-1 ring-white/10">
                        <Zap className="text-black" size={20} strokeWidth={3} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-[0.1em] leading-none mb-1">HOMESPRO <span className="text-[#bf953f]">AI</span></h1>
                        <p className="text-[8px] font-bold text-slate-500 tracking-[0.3em] uppercase">The Elite Real Estate Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {user ? (
                        <div
                            onClick={handleUserClick}
                            className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 pl-1.5 pr-4 py-1.5 rounded-xl cursor-pointer hover:bg-white/10 transition-all group active:scale-95"
                        >
                            <img
                                src={`https://ui-avatars.com/api/?name=${userName}&background=bf953f&color=fff`}
                                alt="Avatar"
                                className="w-7 h-7 rounded-lg shadow-lg border border-white/10 group-hover:scale-105 transition-transform"
                            />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white leading-tight uppercase tracking-wide">
                                    {userName.split(' ').pop()}
                                </span>
                                <span className="text-[8px] font-bold text-[#bf953f] tracking-widest">
                                    {displayRole}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="text-[10px] font-black bg-gradient-to-r from-[#bf953f] to-[#aa771c] text-black px-4 py-2 rounded-lg uppercase tracking-widest shadow-lg shadow-[#bf953f]/20 hover:scale-105 transition-transform"
                        >
                            Đăng nhập
                        </button>
                    )}
                    <button className="relative w-9 h-9 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                        <Bell size={18} className="text-slate-400" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#bf953f] rounded-full border-2 border-black"></span>
                    </button>
                </div>
            </div>

            {/* AI FEATURED SECTION - THE HERO CARD (Scaled Down) */}
            <div className="mb-8 group">
                <div className="relative overflow-hidden rounded-3xl border border-[#bf953f]/20 bg-[#0a0a0a] shadow-xl transition-all duration-500 hover:shadow-[#bf953f]/10">
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                    <div className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                        <div className="relative shrink-0">
                            <div className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-3xl flex items-center justify-center shadow-xl relative z-10 group-hover:scale-105 transition-all duration-700 p-[1.5px]">
                                <div className="w-full h-full bg-black/10 rounded-[1.4rem] flex items-center justify-center backdrop-blur-sm">
                                    <featuredTool.icon size={40} className="text-black group-hover:scale-110 transition-transform duration-700" strokeWidth={1.5} />
                                </div>
                            </div>
                            <div className="absolute -top-3 -right-3 w-10 h-10 bg-black/90 backdrop-blur-xl rounded-xl flex items-center justify-center border border-[#bf953f]/50 shadow-2xl z-20 animate-bounce">
                                <Sparkles className="text-[#fcf6ba]" size={18} />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#bf953f]/10 border border-[#bf953f]/20 mb-4 shadow-lg shadow-black/20">
                                <div className="w-1.5 h-1.5 bg-[#bf953f] rounded-full animate-ping"></div>
                                <span className="text-[9px] font-black text-[#bf953f] uppercase tracking-widest">{featuredTool.badge}</span>
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black text-white mb-3 tracking-tighter uppercase italic leading-tight">
                                {featuredTool.label.split(' ').map((word, i) => (
                                    <React.Fragment key={i}>
                                        {word === 'AI' ? <span className="text-gold px-1">AI</span> : word}{' '}
                                    </React.Fragment>
                                ))}
                            </h2>
                            <p className="text-slate-400 text-sm md:text-base font-medium mb-6 max-w-xl leading-relaxed">
                                {featuredTool.desc}
                            </p>
                            <Link
                                to={featuredTool.to}
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#aa771c] text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 hover:shadow-[0_0_20px_rgba(191,149,63,0.3)] transition-all active:scale-95 group/btn"
                            >
                                Trải nghiệm ngay
                                <ArrowRight size={18} className="group-hover/btn:translate-x-1.5 transition-transform duration-500" strokeWidth={3} />
                            </Link>
                        </div>
                    </div>
                    <div className="h-1 w-0 bg-gradient-to-r from-transparent via-[#bf953f] to-transparent group-hover:w-full transition-all duration-1000 absolute bottom-0 left-0"></div>
                </div>
            </div>

            {/* Daily Wisdom / Card */}
            <div className="mb-8 relative group">
                <div className="glass-card border-none bg-white/[0.02] p-5 md:p-6 flex flex-col md:flex-row gap-4 items-center rounded-2xl shadow-lg hover:bg-white/[0.04] transition-colors duration-500">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-900 via-black to-slate-900 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                        <Calendar size={18} className="text-[#bf953f]" />
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <h4 className="text-[#bf953f] text-[9px] font-black tracking-[0.3em] uppercase mb-1">
                            Elite Daily Wisdom
                        </h4>
                        <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
                            "Chào <span className="text-[#bf953f] font-black">{userName}</span>, hướng Đông Nam thu hút tài lộc mạnh mẽ. Một ngày mới tuyệt vời cùng <span className="text-white italic">AI Power</span>."
                        </p>
                    </div>
                </div>
            </div>

            {/* TOOLS GRID - 3 COLUMNS ON DESKTOP FOR SMALLER CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {tools.map((tool, index) => (
                    <Link
                        to={tool.to}
                        key={index}
                        className="glass-card group p-6 flex flex-col justify-between min-h-[160px] relative overflow-hidden border-white/5 hover:border-[#bf953f]/30 hover:bg-white/[0.03] active:scale-[0.98] transition-all duration-500 rounded-2xl"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.02] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>

                        <div className="flex justify-between items-start relative z-10">
                            <div className="w-12 h-12 bg-white/[0.03] backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10 group-hover:border-[#bf953f]/40 transition-all duration-500 shadow-xl">
                                <tool.icon size={24} className="text-[#bf953f] group-hover:scale-110 transition-all duration-500" strokeWidth={1.5} />
                            </div>
                            <span className="text-[8px] font-black px-3 py-1 bg-black/40 text-[#bf953f] border border-[#bf953f]/20 rounded-lg uppercase tracking-widest">
                                {tool.badge}
                            </span>
                        </div>

                        <div className="mt-6 relative z-10">
                            <h3 className="text-lg font-black text-white leading-tight mb-1 tracking-tight group-hover:text-gold transition-colors uppercase italic">{tool.label}</h3>
                            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-4 opacity-80 group-hover:opacity-100 transition-opacity truncate">{tool.desc}</p>
                            <div className="flex items-center gap-2 group/action">
                                <span className="h-[2px] w-6 bg-[#bf953f]/40 group-hover:w-12 transition-all duration-700 rounded-full"></span>
                                <div className="flex items-center gap-1 group-hover:gap-2 transition-all duration-500">
                                    <span className="text-[9px] text-[#bf953f] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all">Mở Tool</span>
                                    <ChevronRight size={14} className="text-[#bf953f]" strokeWidth={3} />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
