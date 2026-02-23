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
        { to: '/content', icon: PenTool, label: 'Kho Nội Dung', badge: 'Miễn phí', desc: 'Tạo caption đăng tin tự động', accent: 'from-emerald-500/20 to-emerald-500/5' },
        { to: '/loan', icon: Calculator, label: 'Tính Lãi Vay', badge: 'Miễn phí', desc: 'Dự toán khoản vay & trả nợ', accent: 'from-blue-500/20 to-blue-500/5' },
        { to: '/scripts', icon: MessageSquare, label: 'Kịch Bản Sale', badge: 'VIP', desc: 'Bộ quy trình xử lý từ chối', accent: 'from-amber-500/20 to-amber-500/5' },
        { to: '/feng-shui', icon: Compass, label: 'Tra Hướng Nhà', badge: 'Miễn phí', desc: 'Phong thủy theo tuổi gia chủ', accent: 'from-rose-500/20 to-rose-500/5' },
        { to: '/lunar', icon: Calendar, label: 'Lịch Âm Dương', badge: 'Miễn phí', desc: 'Tra cứu ngày tốt, giờ hoàng đạo', accent: 'from-violet-500/20 to-violet-500/5' }
    ];

    const handleUserClick = () => {
        if (user) navigate('/profile');
        else navigate('/login');
    };

    return (
        <div className="max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar scroll-smooth">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#bf953f] to-[#aa771c] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(191,149,63,0.4)]">
                        <Zap className="text-black" size={16} strokeWidth={3} />
                    </div>
                    <div>
                        <h1 className="text-base font-black text-white tracking-widest leading-none">HOMESPRO <span className="text-gold">AI</span></h1>
                        <p className="text-[6px] font-black text-slate-500 tracking-[0.3em] uppercase mt-0.5">Elite Real Estate Engine</p>
                    </div>
                </div>
            </div>

            {/* AI HERO CARD - High Pop & Compact */}
            <div className="mb-3 group">
                <div className="relative overflow-hidden rounded-[1.5rem] border-2 border-[#bf953f]/30 bg-[#0a0a0c] shadow-[0_20px_40px_-10px_rgba(0,0,0,1)] transition-all duration-700 hover:border-[#bf953f]/60">
                    <div className="absolute inset-x-0 top-0 h-[80px] bg-gradient-to-b from-[#bf953f]/8 to-transparent pointer-events-none"></div>

                    <div className="relative z-10 p-4 md:p-6 flex items-center gap-4 md:gap-8">
                        <div className="relative shrink-0 hidden md:block">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(191,149,63,0.3)] relative z-10 group-hover:scale-105 transition-all duration-700 p-[1px]">
                                <div className="w-full h-full bg-black/10 rounded-[0.7rem] flex items-center justify-center backdrop-blur-sm">
                                    <featuredTool.icon size={28} className="text-black" strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 text-left">
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/40 mb-2">
                                <span className="text-[7px] font-black text-gold uppercase tracking-[0.3em]">{featuredTool.badge}</span>
                            </div>
                            <h2 className="text-lg md:text-2xl font-black text-white mb-1 tracking-tighter uppercase italic leading-tight group-hover:text-gold transition-colors duration-500">
                                {featuredTool.label}
                            </h2>
                            <p className="text-slate-300 text-[10px] md:text-xs font-medium mb-3 max-w-lg leading-relaxed line-clamp-2">
                                {featuredTool.desc}
                            </p>
                            <Link
                                to={featuredTool.to}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#bf953f] to-[#aa771c] text-black px-4 py-1.5 rounded-lg font-black uppercase tracking-[0.1em] text-[9px] hover:scale-105 transition-all border border-white/20"
                            >
                                Trải nghiệm ngay
                                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Wisdom - Slender Row */}
            <div className="mb-3">
                <div className="bg-gradient-to-r from-white/[0.04] to-transparent border-l-4 border-gold p-3 flex items-center gap-3 rounded-r-xl shadow-lg">
                    <div className="w-6 h-6 bg-gold/10 rounded-lg flex items-center justify-center border border-gold/20 shrink-0">
                        <Calendar size={12} className="text-gold" />
                    </div>
                    <p className="text-slate-300 text-[10px] md:text-xs font-medium leading-none">
                        <span className="text-gold/70 text-[8px] font-black uppercase tracking-widest mr-2">Elite Insights</span>
                        "Chào <span className="text-gold font-bold">{userName}</span>, hướng Đông Nam thu hút tài lộc mạnh mẽ."
                    </p>
                </div>
            </div>

            {/* TOOLS GRID - REDESIGNED FOR VISIBILITY */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {tools.map((tool, index) => (
                    <Link
                        to={tool.to}
                        key={index}
                        className="group relative p-3 md:p-4 flex flex-col justify-between min-h-[110px] rounded-[1.2rem] bg-[#111113] border border-white/[0.08] hover:border-gold/50 transition-all duration-500 shadow-xl overflow-hidden"
                    >
                        {/* Subtle gradient accent on hover */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${tool.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}></div>
                        <div className="absolute inset-0 bg-gradient-to-tr from-gold/0 via-gold/[0.03] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>

                        <div className="flex justify-between items-start relative z-10">
                            <div className="w-8 h-8 bg-white/[0.06] rounded-lg flex items-center justify-center border border-white/[0.08] group-hover:border-gold/50 group-hover:bg-gold/10 transition-all duration-500 shadow-lg">
                                <tool.icon size={16} className="text-gold transition-all duration-500" strokeWidth={2} />
                            </div>
                            <span className="text-[7px] font-black px-1.5 py-0.5 bg-gold/10 text-gold border border-gold/25 rounded-md uppercase tracking-wider">
                                {tool.badge}
                            </span>
                        </div>

                        <div className="mt-2 relative z-10">
                            <h3 className="text-xs font-black text-white leading-tight mb-0.5 tracking-tight group-hover:text-gold transition-colors duration-300 uppercase">{tool.label}</h3>
                            <p className="text-slate-400 text-[8px] font-medium group-hover:text-slate-300 transition-all leading-relaxed line-clamp-1">{tool.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
}
