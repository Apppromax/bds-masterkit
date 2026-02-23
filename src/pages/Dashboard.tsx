import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    PenTool,
    Calculator,
    Compass,
    Image as ImageIcon,
    MessageSquare,
    ChevronRight,
    Zap,
    Calendar,
    ArrowRight,
    Bell,
    Copy,
    Camera,
    Diamond,
    User as UserIcon,
    LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const isInternalLoading = authLoading || (user && !profile);
    const firstName = isInternalLoading ? '...' : (profile?.full_name?.split(' ').pop() || 'Thành viên');
    const isPro = profile?.tier === 'pro' || profile?.role === 'admin';

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Đã sao chép vào bộ nhớ tạm!');
    };

    const mobileTools = [
        { to: '/loan', icon: Calculator, label: 'Tính Lãi' },
        { to: '/feng-shui', icon: Compass, label: 'Phong Thủy' },
        { to: '/scripts', icon: MessageSquare, label: 'Kịch Bản' },
        { to: '/content', icon: PenTool, label: 'Soạn Tin' }
    ];

    const desktopTools = [
        { to: '/content', icon: PenTool, label: 'Kho Nội Dung', badge: 'Miễn phí', desc: 'Tạo caption đăng tin tự động', accent: 'from-emerald-500/20 to-emerald-500/5' },
        { to: '/loan', icon: Calculator, label: 'Tính Lãi Vay', badge: 'Miễn phí', desc: 'Dự toán khoản vay & trả nợ', accent: 'from-blue-500/20 to-blue-500/5' },
        { to: '/scripts', icon: MessageSquare, label: 'Kịch Bản Sale', badge: 'VIP', desc: 'Bộ quy trình xử lý từ chối', accent: 'from-amber-500/20 to-amber-500/5' },
        { to: '/feng-shui', icon: Compass, label: 'Tra Hướng Nhà', badge: 'Miễn phí', desc: 'Phong thủy theo tuổi gia chủ', accent: 'from-rose-500/20 to-rose-500/5' },
        { to: '/lunar', icon: Calendar, label: 'Lịch Âm Dương', badge: 'Miễn phí', desc: 'Tra cứu ngày tốt, giờ hoàng đạo', accent: 'from-violet-500/20 to-violet-500/5' }
    ];

    return (
        <div className="min-h-[calc(100vh-100px)] md:min-h-screen pb-4 md:pb-0 scroll-smooth overflow-hidden">
            {/* MOBILE VIEW (Super Compact to fit one screen) */}
            <div className="md:hidden flex flex-col h-full space-y-3 pt-1 pb-2 px-1">
                {/* Header - More compact */}
                <div className="flex justify-between items-start mb-2">
                    <div className="space-y-0">
                        <h1 className="text-xl font-black bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent transform scale-x-105 origin-left tracking-tighter">
                            BĐS MasterKit
                        </h1>
                        <p className="text-lg font-bold text-white opacity-90 leading-tight">
                            Chào, {firstName}!
                        </p>
                    </div>
                    <button className="relative w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 shadow-lg">
                        <Bell size={20} className="text-gold" strokeWidth={2.5} />
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#131b2e] shadow-lg"></span>
                    </button>
                </div>

                {/* Daily Insight Card - More compact */}
                <div className="bg-[#1a2332] p-4 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-[30px] rounded-full"></div>
                    <div className="relative z-10 space-y-1.5 focus:outline-none">
                        <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Mẫu tin hôm nay</h3>
                        <p className="text-xs font-semibold text-slate-300 leading-snug italic line-clamp-2">
                            "Đất nền sổ đỏ, giá sụp hầm... <span onClick={() => handleCopy('Đất nền sổ đỏ, giá sụp hầm...')} className="text-gold font-bold underline cursor-pointer ml-1 select-none">[Sao chép]</span>"
                        </p>
                    </div>
                </div>

                {/* Main Action Hero (Gold Gradient) - Slimmer */}
                <Link
                    to="/image-studio"
                    className="block relative p-6 rounded-[2rem] bg-gradient-to-br from-[#d4af37] via-[#fcf6ba] to-[#aa771c] shadow-[0_20px_40px_-10px_rgba(191,149,63,0.3)] transition-all active:scale-[0.98] group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="relative z-10 flex flex-col items-center text-center space-y-3">
                        <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-xl border border-white/20">
                            <Camera size={38} className="text-[#131b2e]" strokeWidth={2.5} />
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="text-lg font-black text-[#131b2e] uppercase tracking-tighter leading-none">THIẾT KẾ ẢNH AI (VIP)</h2>
                            <p className="text-[10px] font-bold text-[#131b2e]/60">(Biến ảnh thành tạp chí)</p>
                        </div>
                    </div>
                </Link>

                {/* Grid Tools - Larger Icons, Luxury Gold, No scroll */}
                <div className="grid grid-cols-2 gap-3 flex-1">
                    {mobileTools.map((tool, idx) => (
                        <Link
                            key={idx}
                            to={tool.to}
                            className="bg-[#1a2332] p-4 rounded-[1.8rem] border border-white/5 flex flex-col items-center justify-center gap-3 active:scale-95 transition-all shadow-lg overflow-hidden group"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-[#d4af37] via-[#fcf6ba] to-[#aa771c] rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(191,149,63,0.2)] border border-white/20 group-hover:scale-105 transition-transform duration-500">
                                <tool.icon size={32} className="text-[#131b2e]" strokeWidth={2.5} />
                            </div>
                            <span className="text-xs font-black text-white/90 tracking-wide uppercase italic">{tool.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* DESKTOP VIEW (Current functional layout refined) */}
            <div className="hidden md:block">
                {/* Header - Extremely Compact */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#bf953f] to-[#aa771c] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(191,149,63,0.4)]">
                            <Zap className="text-black" size={20} strokeWidth={3} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-widest leading-none uppercase italic">HỆ SINH THÁI <span className="text-gold">BĐS</span></h1>
                            <p className="text-[8px] font-black text-slate-500 tracking-[0.4em] uppercase mt-1">Smart Solutions for Professionals</p>
                        </div>
                    </div>
                </div>

                {/* AI HERO CARD */}
                <div className="mb-6 group">
                    <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-[#bf953f]/30 bg-[#1a2332] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] transition-all duration-700 hover:border-[#bf953f]/60">
                        <div className="absolute inset-x-0 top-0 h-[100px] bg-gradient-to-b from-[#bf953f]/10 to-transparent pointer-events-none"></div>

                        <div className="relative z-10 p-6 md:p-10 flex items-center gap-10">
                            <div className="relative shrink-0">
                                <div className="w-24 h-24 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(191,149,63,0.4)] relative z-10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 p-[2px]">
                                    <div className="w-full h-full bg-black/5 rounded-[0.9rem] flex items-center justify-center backdrop-blur-sm">
                                        <ImageIcon size={42} className="text-black" strokeWidth={2.5} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 text-left">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/40 mb-4">
                                    <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">VIP / PRO ACCESS</span>
                                </div>
                                <h2 className="text-2xl md:text-4xl font-black text-white mb-3 tracking-tighter uppercase italic leading-tight group-hover:text-gold transition-colors duration-500">
                                    Tạo Ảnh AI Chuyên Nghiệp
                                </h2>
                                <p className="text-slate-300 text-sm md:text-base font-medium mb-6 max-w-xl leading-relaxed opacity-80">
                                    Nâng tầm hình ảnh BĐS với công nghệ Generative AI đỉnh cao. Xóa vật thể, đổi nền, và làm nét ảnh chỉ trong vài giây.
                                </p>
                                <Link
                                    to="/image-studio"
                                    className="inline-flex items-center gap-3 bg-gradient-to-r from-[#bf953f] to-[#aa771c] text-black px-6 py-3 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:scale-105 hover:shadow-[0_0_40px_rgba(191,149,63,0.5)] transition-all border border-white/20"
                                >
                                    Trải nghiệm ngay
                                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" strokeWidth={3} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Insight Row */}
                <div className="mb-6">
                    <div className="bg-gradient-to-r from-white/[0.04] to-transparent border-l-4 border-gold p-5 flex items-center gap-5 rounded-r-2xl shadow-xl">
                        <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center border border-gold/20 shrink-0">
                            <Calendar size={20} className="text-gold" />
                        </div>
                        <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
                            <span className="text-gold/70 text-[10px] font-black uppercase tracking-widest mr-4">Elite Intelligence</span>
                            Chào <span className="text-gold font-bold">{profile?.full_name || 'Thành viên'}</span>, hướng Đông Nam thu hút tài lộc mạnh mẽ. Chúc bạn một ngày bùng nổ doanh số!
                        </p>
                    </div>
                </div>

                {/* TOOLS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {desktopTools.map((tool, index) => (
                        <Link
                            to={tool.to}
                            key={index}
                            className="group relative p-6 md:p-8 flex flex-col justify-between min-h-[180px] rounded-[2rem] bg-[#1a2332] border border-white/[0.05] hover:border-gold/50 transition-all duration-500 shadow-2xl overflow-hidden hover:shadow-gold/10"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${tool.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}></div>
                            <div className="flex justify-between items-start relative z-10">
                                <div className="w-14 h-14 bg-white/[0.05] rounded-2xl flex items-center justify-center border border-white/[0.1] group-hover:border-gold/50 group-hover:bg-gold/15 transition-all duration-500">
                                    <tool.icon size={28} className="text-gold transition-all duration-500 group-hover:scale-110" strokeWidth={2} />
                                </div>
                                <span className="text-[10px] font-black px-3 py-1 bg-gold/10 text-gold border border-gold/25 rounded-lg uppercase tracking-widest leading-none">
                                    {tool.badge}
                                </span>
                            </div>
                            <div className="mt-6 relative z-10">
                                <h3 className="text-lg font-black text-white leading-tight mb-2 tracking-tight group-hover:text-gold transition-colors duration-300 uppercase italic">{tool.label}</h3>
                                <p className="text-slate-400 text-xs font-medium group-hover:text-slate-200 transition-all leading-relaxed line-clamp-2">{tool.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
}
