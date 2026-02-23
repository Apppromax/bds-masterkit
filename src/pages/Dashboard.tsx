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
        label: 'Tạo Ảnh AI Chuyền Nghiệp',
        badge: 'VIP / PRO',
        desc: 'Nâng tầm hình ảnh BĐS với công nghệ Generative AI đỉnh cao. Xóa vật thể, đổi nền, và làm nét ảnh chỉ trong vài giây.',
        color: 'from-violet-600 via-indigo-500 to-purple-600'
    };

    const tools = [
        { to: '/content', icon: PenTool, label: 'Kho Nội Dung', badge: 'Miễn phí', desc: 'Tạo caption đăng tin tự động' },
        { to: '/loan', icon: Calculator, label: 'Tính Lãi Vay', badge: 'Miễn phí', desc: 'Dự toán khoản vay & trả nợ' },
        { to: '/scripts', icon: MessageSquare, label: 'Kịch Bản Sale', badge: 'VIP', desc: 'Bộ quy trình xử lý từ chối' },
        { to: '/feng-shui', icon: Compass, label: 'Tra Hướng Nhà', badge: 'Miễn phí', desc: 'Phong thủy theo tuổi gia chủ' },
        { to: '/lunar', icon: Calendar, label: 'Lịch Âm Dương', badge: 'Miễn phí', desc: 'Tra cứu ngày tốt, giờ hoàng đạo' }
    ];

    const handleUserClick = () => {
        if (user) navigate('/profile');
        else navigate('/login');
    };

    return (
        <div className="max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar scroll-smooth">
            {/* Header - Extremely Compact */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#bf953f] to-[#aa771c] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(191,149,63,0.4)]">
                        <Zap className="text-black" size={16} strokeWidth={3} />
                    </div>
                    <div>
                        <h1 className="text-base font-black text-white tracking-widest leading-none">HOMESPRO <span className="text-gold">AI</span></h1>
                        <p className="text-[6px] font-black text-slate-400 tracking-[0.4em] uppercase opacity-70">Elite Real Estate Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {user ? (
                        <div
                            onClick={handleUserClick}
                            className="flex items-center gap-2 bg-white/5 border border-white/10 pl-1 pr-3 py-1 rounded-xl cursor-pointer hover:bg-white/10 transition-all shadow-xl"
                        >
                            <img
                                src={`https://ui-avatars.com/api/?name=${userName}&background=bf953f&color=fff`}
                                alt="Avatar"
                                className="w-5 h-5 rounded-md border border-white/20"
                            />
                            <div className="flex flex-col">
                                <span className="text-[8px] font-black text-white leading-tight uppercase tracking-tighter">{userName.split(' ').pop()}</span>
                                <span className="text-[6px] font-bold text-gold tracking-widest leading-none">{displayRole}</span>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} className="text-[8px] font-black bg-gold text-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-lg active:scale-95 transition-all">Đăng nhập</button>
                    )}
                    <button className="relative w-7 h-7 flex items-center justify-center bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors shadow-lg">
                        <Bell size={14} className="text-slate-400" />
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-gold rounded-full border border-black shadow-[0_0_5px_#bf953f]"></span>
                    </button>
                </div>
            </div>

            {/* AI HERO CARD - High Pop & Compact */}
            <div className="mb-4 group">
                <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#bf953f]/30 bg-[#050505] shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] transition-all duration-700 hover:border-[#bf953f]/60 hover:shadow-[#bf953f]/15">
                    <div className="absolute inset-x-0 top-0 h-[100px] bg-gradient-to-b from-[#bf953f]/5 to-transparent pointer-events-none"></div>

                    <div className="relative z-10 p-5 md:p-8 flex items-center gap-6 md:gap-10">
                        <div className="relative shrink-0 hidden md:block">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(191,149,63,0.4)] relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 p-[1.5px]">
                                <div className="w-full h-full bg-black/10 rounded-[0.9rem] flex items-center justify-center backdrop-blur-sm">
                                    <featuredTool.icon size={36} className="text-black" strokeWidth={2.5} />
                                </div>
                            </div>
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-black rounded-lg flex items-center justify-center border-2 border-[#bf953f] shadow-2xl z-20 animate-bounce">
                                <Sparkles className="text-gold" size={16} />
                            </div>
                        </div>

                        <div className="flex-1 text-left">
                            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-gold/10 border border-gold/40 mb-3">
                                <span className="text-[7px] font-black text-gold uppercase tracking-[0.4em]">{featuredTool.badge}</span>
                            </div>
                            <h2 className="text-lg md:text-3xl font-black text-white mb-2 tracking-tighter uppercase italic leading-tight group-hover:text-gold transition-colors duration-500">
                                {featuredTool.label}
                            </h2>
                            <p className="text-slate-300 text-[10px] md:text-xs font-semibold mb-5 max-w-lg leading-relaxed">
                                {featuredTool.desc}
                            </p>
                            <Link
                                to={featuredTool.to}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#bf953f] to-[#aa771c] text-black px-4 py-2 rounded-lg font-black uppercase tracking-[0.2em] text-[8px] hover:scale-105 hover:shadow-[0_0_30px_#bf953f] transition-all border border-white/20"
                            >
                                Trải nghiệm ngay
                                <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" strokeWidth={4} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Wisdom - Slender Row */}
            <div className="mb-4">
                <div className="bg-gradient-to-r from-white/[0.03] to-transparent border-l-4 border-gold p-3 flex items-center gap-4 rounded-r-xl shadow-lg">
                    <div className="w-7 h-7 bg-gold/10 rounded flex items-center justify-center border border-gold/20 shrink-0">
                        <Calendar size={14} className="text-gold" />
                    </div>
                    <p className="text-slate-300 text-[10px] md:text-xs font-bold leading-none">
                        <span className="text-gold/60 text-[7px] font-black uppercase tracking-widest mr-3">Elite Insights</span>
                        "Chào <span className="text-gold">{userName}</span>, hướng Đông Nam thu hút tài lộc mạnh mẽ. Chúc anh ngày mới bùng nổ doanh số!"
                    </p>
                </div>
            </div>

            {/* TOOLS GRID - HIGH HIGHLIGHT & COMPACT */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool, index) => (
                    <Link
                        to={tool.to}
                        key={index}
                        className="group relative p-4 flex flex-col justify-between min-h-[130px] rounded-2xl bg-[#080808] border-2 border-white/5 hover:border-gold/60 transition-all duration-500 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.8)] hover:shadow-gold/20 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-gold/0 via-gold/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>

                        <div className="flex justify-between items-start relative z-10">
                            <div className="w-9 h-9 bg-white/[0.03] rounded-lg flex items-center justify-center border-2 border-white/5 group-hover:border-gold/60 group-hover:bg-gold/10 transition-all duration-500 shadow-xl">
                                <tool.icon size={18} className="text-gold transition-all duration-500 group-hover:scale-110" strokeWidth={2.5} />
                            </div>
                            <span className="text-[6px] font-black px-1.5 py-0.5 bg-gold/10 text-gold border border-gold/30 rounded uppercase tracking-widest">
                                {tool.badge}
                            </span>
                        </div>

                        <div className="mt-3 relative z-10">
                            <h3 className="text-sm font-black text-white leading-tight mb-0.5 tracking-tight group-hover:text-gold transition-colors uppercase italic">{tool.label}</h3>
                            <p className="text-slate-400 text-[8px] font-bold uppercase tracking-wider mb-3 group-hover:text-slate-200 transition-all truncate">{tool.desc}</p>

                            <div className="flex items-center justify-between">
                                <div className="h-[2px] w-6 bg-gold/20 group-hover:w-12 group-hover:bg-gold transition-all duration-700 rounded-full"></div>
                                <div className="flex items-center gap-1 opacity-100 translate-x-0 transition-all duration-500 group-hover:translate-x-1">
                                    <span className="text-[7px] text-gold font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all">Khám phá</span>
                                    <ChevronRight size={12} className="text-gold" strokeWidth={4} />
                                </div>
                            </div>
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
