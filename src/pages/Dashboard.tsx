import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    PenTool,
    Calculator,
    Compass,
    Image as ImageIcon,
    MessageSquare,
    ChevronRight,
    DollarSign,
    Calendar,
    ArrowRight,
    Bell,
    Camera,
    PlayCircle,
    Users,
    Target,
    Sparkles,
    Zap
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { DemoVideoOverlay } from '../components/DemoVideoOverlay';
import { Particles } from '../components/Particles';
import { LiveTicker } from '../components/LiveTicker';
import { TypewriterText } from '../components/TypewriterText';

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
        { to: '/chot-sale', icon: Target, label: 'Chốt Sale', badge: 'VIP', desc: 'Quân sư tác chiến AI', accent: 'from-[#10b981]/20 to-transparent', demoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4' },
        { to: '/loan', icon: Calculator, label: 'Tính Lãi', badge: 'Free', desc: 'Dự toán khoản vay trả nợ', accent: 'from-[#3b82f6]/20 to-transparent' },
        { to: '/scripts', icon: MessageSquare, label: 'Kịch Bản', badge: 'Free', desc: 'Kịch bản bán hàng mẫu', accent: 'from-[#f59e0b]/20 to-transparent', demoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4' },
        { to: '/crm', icon: Users, label: 'CRM Mini', badge: 'VIP', desc: 'Quản lý khách hàng AI', accent: 'from-amber-500/20 to-transparent' },
        { to: '/lunar', icon: Calendar, label: 'Lịch & Phong Thủy', badge: 'Free', desc: 'Lịch âm dương, xem ngày tốt & phong thủy', accent: 'from-[#8b5cf6]/20 to-transparent' }
    ];


    return (
        <div className="h-[calc(100vh-60px)] md:h-[calc(100vh-80px)] overflow-hidden flex flex-col relative">
            <Particles />
            {/* MOBILE VIEW */}
            <div className="md:hidden flex flex-col h-full space-y-3 pt-2 pb-6 px-4 overflow-hidden">
                {/* Header - No Bell, No Daily Insight */}
                <div className="flex flex-col shrink-0">
                    <h1 className="text-xl font-extrabold bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent transform origin-left tracking-tighter uppercase italic flex items-center gap-2 overflow-visible pr-2">
                        CHOTSALE
                    </h1>
                    <div className="flex items-center gap-2 mt-0.5 relative z-10 min-h-[16px]">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></div>
                        <p className="text-xs font-bold text-white opacity-90 leading-tight">
                            {isInternalLoading ? (
                                <span className="text-white/40 italic">Đang tải...</span>
                            ) : (
                                <TypewriterText text={`Chào ${firstName}! Chúc bạn bùng nổ doanh số.`} speed={40} />
                            )}
                        </p>
                    </div>
                </div>

                <LiveTicker />

                {/* Main Action Hero (Gold Graduate) - Now matches Web Format */}
                <div className="grid grid-cols-2 gap-3 shrink-0">
                    <Link
                        to="/image-studio?mode=enhance"
                        className="relative p-5 rounded-[1.8rem] bg-gradient-to-br from-blue-600/90 to-indigo-700/90 shadow-xl transition-all active:scale-[0.98] overflow-hidden border border-white/20"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="relative z-10 text-center space-y-2">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mx-auto backdrop-blur-md border border-white/20">
                                <Sparkles size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-[11px] font-black text-white uppercase tracking-tighter leading-none mb-1">Phù Phép Ảnh</h2>
                                <p className="text-[7px] font-bold text-white/60 uppercase tracking-widest leading-none">AI Nâng cấp BĐS</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/image-studio?mode=create"
                        className="relative p-5 rounded-[1.8rem] bg-gradient-to-br from-amber-500/90 to-orange-600/90 shadow-xl transition-all active:scale-[0.98] overflow-hidden border border-white/20"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                        <div className="relative z-10 text-center space-y-2">
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mx-auto backdrop-blur-md border border-white/20">
                                <Zap size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-[11px] font-black text-white uppercase tracking-tighter leading-none mb-1">Kiến Tạo Phối Cảnh</h2>
                                <p className="text-[7px] font-bold text-white/60 uppercase tracking-widest leading-none">AI Vẽ không gian</p>
                            </div>
                        </div>
                    </Link>
                </div>

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
                                <tool.icon size={24} className="text-[#131b2e]" strokeWidth={1.5} />
                            </div>
                            <div className="text-left relative z-10 flex-1">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h3 className="text-sm font-extrabold text-white italic tracking-tight uppercase overflow-visible pr-1">{tool.label}</h3>
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
            <div className="hidden md:flex flex-col h-full max-w-[1400px] mx-auto w-full pt-4 pb-6 px-8 gap-4 overflow-hidden">
                <div className="flex justify-between items-center shrink-0 relative z-10">
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent transform origin-left tracking-tighter uppercase italic">
                            HỆ SINH THÁI BĐS
                        </h1>
                        <p className="text-[9px] font-black text-slate-500 tracking-[0.4em] uppercase mt-0.5">Smart Solutions for Professionals</p>
                    </div>

                    <div className="flex items-center gap-4 bg-black/40 py-2 px-5 rounded-2xl border border-white/5 shadow-xl backdrop-blur-md min-h-[44px]">
                        <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
                        <div className="text-xs font-bold text-slate-300">
                            Đông Nam hút tài lộc, {isInternalLoading ? (
                                <span className="text-gold/50 italic animate-pulse">Đang chuẩn bị...</span>
                            ) : (
                                <TypewriterText text={`Chúc ${firstName} hôm nay bùng nổ doanh số!`} speed={40} className="text-gold" />
                            )}
                        </div>
                    </div>
                </div>

                <LiveTicker />

                <div className="grid grid-cols-2 gap-5 shrink-0 relative z-10">
                    <div className="relative overflow-hidden rounded-[2rem] border-2 border-blue-500/20 bg-[#1a2332] shadow-2xl transition-all duration-700 hover:border-blue-500/50 group">
                        <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 p-6 flex items-center gap-6">
                            <Link to="/image-studio?mode=enhance" className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg border border-white/10 shrink-0 group-hover:scale-110 transition-transform">
                                <Sparkles size={32} className="text-white" />
                            </Link>
                            <div className="flex-1">
                                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase mb-1 leading-none group-hover:text-blue-400 transition-colors">Phù Phép BĐS</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nâng cấp, làm nét, đổi nền AI</p>
                                <Link to="/image-studio?mode=enhance" className="mt-3 inline-flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                                    SỬ DỤNG NGAY <ArrowRight size={12} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-[2rem] border-2 border-amber-500/20 bg-[#1a2332] shadow-2xl transition-all duration-700 hover:border-amber-500/50 group">
                        <div className="absolute inset-0 bg-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 p-6 flex items-center gap-6">
                            <Link to="/image-studio?mode=create" className="w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg border border-white/10 shrink-0 group-hover:scale-110 transition-transform">
                                <Zap size={32} className="text-white" />
                            </Link>
                            <div className="flex-1">
                                <h2 className="text-xl font-black text-white italic tracking-tighter uppercase mb-1 leading-none group-hover:text-amber-400 transition-colors">Kiến Tạo Không Gian</h2>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sinh ảnh nội thất / ngoại thất</p>
                                <Link to="/image-studio?mode=create" className="mt-3 inline-flex items-center gap-2 text-amber-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                                    SỬ DỤNG NGAY <ArrowRight size={12} />
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
                            className="group relative p-4 md:p-6 flex items-center gap-6 rounded-[2.5rem] bg-[#1a2332] border border-white/[0.05] hover:border-gold/50 transition-all duration-500 shadow-2xl overflow-hidden hover:shadow-gold/5"
                        >
                            <div className="absolute top-5 right-6 flex items-center gap-2 z-20">
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

                            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#d4af37] via-[#fcf6ba] to-[#aa771c] rounded-[1.4rem] md:rounded-[1.8rem] flex items-center justify-center shadow-[0_10px_30px_rgba(191,149,63,0.3)] border border-white/20 group-hover:scale-105 transition-transform duration-500 p-[1.5px] shrink-0">
                                <div className="w-full h-full bg-black/5 rounded-[1.25rem] md:rounded-[1.6rem] flex items-center justify-center backdrop-blur-sm">
                                    <tool.icon size={28} className="text-[#131b2e] md:hidden" strokeWidth={1.5} />
                                    <tool.icon size={34} className="text-[#131b2e] hidden md:block" strokeWidth={1.5} />
                                </div>
                            </div>

                            <div className="flex-1 text-left">
                                <h3 className="text-base md:text-xl font-black text-white leading-tight mb-1 md:mb-2 tracking-widest group-hover:text-gold transition-colors uppercase italic overflow-visible pr-2">{tool.label}</h3>
                                <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity line-clamp-1">{tool.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div >
            </div >




            <DemoVideoOverlay
                isOpen={demoConfig.isOpen}
                onClose={() => setDemoConfig(p => ({ ...p, isOpen: false }))}
                videoUrl={demoConfig.url}
                targetRoute={demoConfig.route}
                title={demoConfig.title}
            />
        </div >
    );
}
