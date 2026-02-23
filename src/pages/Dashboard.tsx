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
    Camera
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const isInternalLoading = authLoading || (user && !profile);
    const firstName = isInternalLoading ? '...' : (profile?.full_name?.split(' ').pop() || 'Thành viên');

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Đã sao chép vào bộ nhớ tạm!');
    };

    const tools = [
        { to: '/content', icon: PenTool, label: 'Soạn Tin', badge: 'Miễn phí', desc: 'Tạo caption đăng tin tự động' },
        { to: '/loan', icon: Calculator, label: 'Tính Lãi', badge: 'Miễn phí', desc: 'Dự toán khoản vay & trả nợ' },
        { to: '/scripts', icon: MessageSquare, label: 'Kịch Bản', badge: 'VIP', desc: 'Bộ quy trình xử lý từ chối' },
        { to: '/feng-shui', icon: Compass, label: 'Phong Thủy', badge: 'Miễn phí', desc: 'Phong thủy theo tuổi gia chủ' },
        { to: '/lunar', icon: Calendar, label: 'Lịch Âm', badge: 'Miễn phí', desc: 'Tra cứu ngày tốt, giờ hoàng đạo' }
    ];

    return (
        <div className="h-[calc(100vh-60px)] md:h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            {/* MOBILE VIEW */}
            <div className="md:hidden flex flex-col h-full space-y-2 pt-1 pb-4 px-1 overflow-hidden">
                <div className="flex justify-between items-start mb-1">
                    <div className="space-y-0">
                        <h1 className="text-xl font-black bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent transform scale-x-105 origin-left tracking-tighter">
                            BĐS MasterKit
                        </h1>
                        <p className="text-lg font-bold text-white opacity-90 leading-tight">
                            Chào, {firstName}!
                        </p>
                    </div>
                    <button className="relative w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10">
                        <Bell size={20} className="text-gold" strokeWidth={2.5} />
                        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#131b2e]"></span>
                    </button>
                </div>

                <div className="bg-[#1a2332] p-3 rounded-2xl border border-white/5 shadow-xl relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 blur-[30px] rounded-full"></div>
                    <div className="relative z-10 space-y-1">
                        <h3 className="text-[9px] font-black text-white/50 uppercase tracking-[0.2em]">Mẫu tin hôm nay</h3>
                        <p className="text-[11px] font-semibold text-slate-300 leading-snug italic line-clamp-2">
                            "Đất nền sổ đỏ, giá sụp hầm... <span onClick={() => handleCopy('Đất nền sổ đỏ, giá sụp hầm...')} className="text-gold font-bold underline cursor-pointer ml-1">[Sao chép]</span>"
                        </p>
                    </div>
                </div>

                <Link
                    to="/image-studio"
                    className="block relative p-5 rounded-[1.8rem] bg-gradient-to-br from-[#d4af37] via-[#fcf6ba] to-[#aa771c] shadow-lg transition-all active:scale-[0.98] shrink-0"
                >
                    <div className="relative z-10 flex flex-col items-center text-center space-y-2">
                        <div className="w-14 h-14 bg-black/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-xl border border-white/20">
                            <Camera size={34} className="text-[#131b2e]" strokeWidth={2.5} />
                        </div>
                        <div className="space-y-0">
                            <h2 className="text-base font-black text-[#131b2e] uppercase tracking-tighter leading-none">THIẾT KẾ ẢNH AI (VIP)</h2>
                            <p className="text-[9px] font-bold text-[#131b2e]/60">(Biến ảnh thành tạp chí)</p>
                        </div>
                    </div>
                </Link>

                <div className="grid grid-cols-2 gap-2 flex-1 overflow-hidden">
                    {tools.slice(0, 4).map((tool, idx) => (
                        <Link
                            key={idx}
                            to={tool.to}
                            className="bg-[#1a2332] p-3 rounded-[1.5rem] border border-white/5 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all shadow-md group"
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37] via-[#fcf6ba] to-[#aa771c] rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                                <tool.icon size={26} className="text-[#131b2e]" strokeWidth={2.5} />
                            </div>
                            <span className="text-[10px] font-black text-white/90 uppercase italic">{tool.label}</span>
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
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/40 mb-4">
                                    <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em]">VIP / PRO ACCESS</span>
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
                    {tools.slice(0, 6).map((tool, index) => (
                        <Link
                            to={tool.to}
                            key={index}
                            className="group relative p-6 md:p-8 flex flex-col items-center justify-center gap-5 rounded-[2.5rem] bg-[#1a2332] border border-white/[0.05] hover:border-gold/50 transition-all duration-500 shadow-2xl overflow-hidden hover:shadow-gold/5"
                        >
                            <div className="absolute top-4 right-6">
                                <span className="text-[9px] font-black px-2 py-0.5 bg-gold/10 text-gold border border-gold/20 rounded-md uppercase tracking-widest italic">
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
        </div>
    );
}
