import React, { useState } from 'react';
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
    Camera,
    PlayCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { DemoVideoOverlay } from '../components/DemoVideoOverlay';

export default function Dashboard() {
    const { user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [demoConfig, setDemoConfig] = useState({ isOpen: false, url: '', route: '', title: '' });

    const isInternalLoading = authLoading || (user && !profile);
    const firstName = isInternalLoading ? '...' : (profile?.full_name?.split(' ').pop() || 'Thành viên');

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Đã sao chép vào bộ nhớ tạm!');
    };

    const tools = [
        { to: '/content', icon: PenTool, label: 'Soạn Tin', badge: 'Free', desc: 'Caption đăng tin tự động', accent: 'from-[#10b981]/20 to-transparent', demoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4' },
        { to: '/loan', icon: Calculator, label: 'Tính Lãi', badge: 'Free', desc: 'Dự toán khoản vay trả nợ', accent: 'from-[#3b82f6]/20 to-transparent' },
        { to: '/scripts', icon: MessageSquare, label: 'Kịch Bản', badge: 'VIP', desc: 'Quy trình xử lý từ chối', accent: 'from-[#f59e0b]/20 to-transparent', demoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4' },
        { to: '/feng-shui', icon: Compass, label: 'Phong Thủy', badge: 'Free', desc: 'Tra hướng nhà theo tuổi', accent: 'from-[#ef4444]/20 to-transparent' },
        { to: '/lunar', icon: Calendar, label: 'Lịch Âm', badge: 'Free', desc: 'Ngày tốt, giờ hoàng đạo', accent: 'from-[#8b5cf6]/20 to-transparent' }
    ];

    return (
        <div className="h-[calc(100vh-60px)] md:h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            {/* MOBILE VIEW */}
            <div className="md:hidden flex flex-col h-full space-y-3 pt-2 pb-6 px-4 overflow-hidden">
                {/* Header - No Bell, No Daily Insight */}
                <div className="flex flex-col shrink-0">
                    <h1 className="text-xl font-black bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent transform scale-x-105 origin-left tracking-tighter uppercase italic">
                        BĐS MasterKit
                    </h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></div>
                        <p className="text-xs font-bold text-white opacity-90 leading-tight">
                            Chào, {firstName}! Chúc bạn bùng nổ doanh số.
                        </p>
                    </div>
                </div>

                {/* Main Action Hero (Gold Graduate) - Now matches Web Format */}
                <Link
                    to="/image-studio"
                    className="block relative p-6 rounded-[2.2rem] bg-gradient-to-br from-[#d4af37] via-[#fcf6ba] to-[#aa771c] shadow-[0_20px_40px_-5px_rgba(191,149,63,0.4)] transition-all active:scale-[0.98] shrink-0 overflow-hidden border border-white/30"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="relative z-10 flex items-center gap-5">
                        <div className="w-16 h-16 bg-black/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-xl border border-white/20 shrink-0">
                            <ImageIcon size={34} className="text-[#131b2e]" strokeWidth={2.5} />
                        </div>
                        <div className="text-left flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="inline-flex px-2 py-0.5 rounded-md bg-black/20 border border-black/10">
                                    <span className="text-[8px] font-black text-[#131b2e] uppercase tracking-widest leading-tight">VIP</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setDemoConfig({ isOpen: true, url: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4', route: '/image-studio', title: 'Tạo Ảnh AI Chuyên Nghiệp' });
                                    }}
                                    className="flex items-center gap-1 bg-[#131b2e] text-gold px-2 py-0.5 rounded-md border border-gold/30 hover:bg-black/80 transition-colors pointer-events-auto z-20 relative"
                                >
                                    <PlayCircle size={10} />
                                    <span className="text-[8px] font-black uppercase tracking-widest leading-tight">Demo</span>
                                </button>
                            </div>
                            <h2 className="text-base font-black text-[#131b2e] uppercase tracking-tighter leading-none mb-1">Tạo Ảnh AI Chuyên Nghiệp</h2>
                            <p className="text-[9px] font-bold text-[#131b2e]/60 leading-tight">Nâng tầm hình ảnh BĐS với công nghệ đỉnh cao</p>
                        </div>
                    </div>
                </Link>

                {/* Grid Tools - Full Info as Web View */}
                <div className="grid grid-cols-1 gap-3 flex-1 overflow-y-auto no-scrollbar pb-4 mt-2">
                    {tools.map((tool, idx) => (
                        <Link
                            key={idx}
                            to={tool.to}
                            className="bg-[#1a2332] p-4 rounded-[1.8rem] border border-white/5 flex items-center gap-4 active:scale-[0.97] transition-all shadow-lg group relative overflow-hidden"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${tool.accent} opacity-30`}></div>
                            <div className="w-14 h-14 bg-gradient-to-br from-[#d4af37] via-[#fcf6ba] to-[#aa771c] rounded-2xl flex items-center justify-center shadow-md border border-white/20 relative z-10 shrink-0">
                                <tool.icon size={28} className="text-[#131b2e]" strokeWidth={2.5} />
                            </div>
                            <div className="text-left relative z-10 flex-1">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h3 className="text-sm font-black text-white italic tracking-tight uppercase">{tool.label}</h3>
                                    <div className="flex items-center gap-1.5">
                                        {tool.demoUrl && (
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setDemoConfig({ isOpen: true, url: tool.demoUrl, route: tool.to, title: tool.label });
                                                }}
                                                className="flex items-center gap-1 px-1.5 py-0.5 bg-white/5 text-slate-400 border border-white/10 rounded-md z-20 hover:text-gold pointer-events-auto relative"
                                            >
                                                <PlayCircle size={8} />
                                                <span className="text-[7px] font-black uppercase tracking-widest leading-none mt-[1px]">Demo</span>
                                            </button>
                                        )}
                                        <span className="text-[7px] font-black px-1.5 py-0.5 bg-gold/10 text-gold border border-gold/20 rounded-md uppercase tracking-widest leading-none items-center flex">
                                            {tool.badge}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 font-medium line-clamp-1">{tool.desc}</p>
                            </div>
                            <ChevronRight size={14} className="text-slate-700" strokeWidth={3} />
                        </Link>
                    ))}
                </div>
            </div>

            {/* DESKTOP VIEW */}
            <div className="hidden md:flex flex-col h-full space-y-5 overflow-hidden">
                <div className="flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#bf953f] to-[#aa771c] rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                            <Zap className="text-black" size={18} strokeWidth={3} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-widest leading-none uppercase italic">HỆ SINH THÁI <span className="text-gold">BĐS</span></h1>
                            <p className="text-[7px] font-black text-slate-500 tracking-[0.4em] uppercase mt-1">Smart Solutions for Professionals</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-[#1a2332] py-2 px-5 rounded-2xl border border-white/5 shadow-xl">
                        <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
                        <p className="text-xs font-bold text-slate-300">
                            Đông Nam hút tài lộc, chúc <span className="text-gold">{firstName}</span> hôm nay bùng nổ doanh số!
                        </p>
                    </div>
                </div>

                <div className="group shrink-0">
                    <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-[#bf953f]/30 bg-[#1a2332] shadow-2xl transition-all duration-700 hover:border-[#bf953f]/60">
                        <div className="absolute inset-x-0 top-0 h-[100px] bg-gradient-to-b from-[#bf953f]/10 to-transparent pointer-events-none"></div>

                        <div className="relative z-10 p-6 md:p-10 flex items-center gap-10">
                            <div className="relative shrink-0">
                                <div className="w-24 h-24 bg-gradient-to-br from-[#d4af37] via-[#fcf6ba] to-[#aa771c] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(191,149,63,0.4)] transition-all duration-700 p-[1.5px]">
                                    <div className="w-full h-full bg-black/5 rounded-[0.9rem] flex items-center justify-center backdrop-blur-sm">
                                        <ImageIcon size={42} className="text-[#131b2e]" strokeWidth={2.5} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 text-left">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/40">
                                        <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em] leading-tight mt-0.5">VIP</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDemoConfig({ isOpen: true, url: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4', route: '/image-studio', title: 'Tạo Ảnh AI Chuyên Nghiệp' });
                                        }}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white hover:bg-gold hover:text-black transition-colors pointer-events-auto z-20 relative"
                                    >
                                        <PlayCircle size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest leading-tight mt-0.5">Xem Demo</span>
                                    </button>
                                </div>
                                <h2 className="text-2xl md:text-5xl font-black text-white mb-3 tracking-tighter uppercase italic leading-tight group-hover:text-gold transition-colors duration-500">
                                    Tạo Ảnh AI Chuyên Nghiệp
                                </h2>
                                <p className="text-slate-300 text-sm md:text-base font-medium mb-6 max-w-2xl leading-relaxed opacity-70 line-clamp-2">
                                    Nâng tầm hình ảnh BĐS với công nghệ Generative AI đỉnh cao. Xóa vật thể, đổi nền, và làm nét ảnh chỉ trong vài giây.
                                </p>
                                <Link
                                    to="/image-studio"
                                    className="inline-flex items-center gap-3 bg-gradient-to-r from-[#bf953f] to-[#aa771c] text-black px-7 py-3 rounded-xl font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-all"
                                >
                                    Trải nghiệm ngay
                                    <ArrowRight size={18} strokeWidth={3} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-5 flex-1 overflow-hidden">
                    {tools.map((tool, index) => (
                        <Link
                            to={tool.to}
                            key={index}
                            className="group relative p-6 md:p-8 flex flex-col items-center justify-center gap-5 rounded-[2.5rem] bg-[#1a2332] border border-white/[0.05] hover:border-gold/50 transition-all duration-500 shadow-2xl overflow-hidden hover:shadow-gold/5"
                        >
                            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                                {tool.demoUrl && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setDemoConfig({ isOpen: true, url: tool.demoUrl, route: tool.to, title: tool.label });
                                        }}
                                        className="flex items-center gap-1 px-2 py-0.5 bg-black/40 text-slate-300 hover:text-white border border-white/10 hover:border-white/30 rounded-md transition-all pointer-events-auto"
                                    >
                                        <PlayCircle size={10} />
                                        <span className="text-[8px] font-black uppercase tracking-widest leading-none mt-[1px]">Demo</span>
                                    </button>
                                )}
                                <span className="text-[9px] font-black px-2 py-0.5 bg-gold/10 text-gold border border-gold/20 rounded-md uppercase tracking-widest italic leading-none flex items-center h-[20px]">
                                    {tool.badge}
                                </span>
                            </div>
                            <div className="w-20 h-20 bg-gradient-to-br from-[#d4af37] via-[#fcf6ba] to-[#aa771c] rounded-[1.8rem] flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-110 transition-transform duration-500">
                                <tool.icon size={38} className="text-[#131b2e]" strokeWidth={2.5} />
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-black text-white leading-tight mb-2 tracking-tight group-hover:text-gold transition-colors uppercase italic">{tool.label}</h3>
                                <p className="text-[11px] text-slate-500 line-clamp-1">{tool.desc}</p>
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

            <DemoVideoOverlay
                isOpen={demoConfig.isOpen}
                onClose={() => setDemoConfig(p => ({ ...p, isOpen: false }))}
                videoUrl={demoConfig.url}
                targetRoute={demoConfig.route}
                title={demoConfig.title}
            />
        </div>
    );
}
