import React, { useState } from 'react';
import { Stamp, Sparkles, Wand2, ArrowRight, UserSquare2, ShieldCheck, Zap } from 'lucide-react';
import QuickEditor from '../components/ImageStudio/QuickEditor';
import AiStudio from '../components/ImageStudio/AiStudio';
import CardCreator from '../components/ImageStudio/CardCreator';

const StickerIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
        <path d="M15 3v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h8" />
        <path d="M8 9h2" />
    </svg>
);

export default function ImageStudio() {
    const [mode, setMode] = useState<'home' | 'quick' | 'card' | 'ai'>('home');

    if (mode === 'home') {
        return (
            <div className="min-h-screen bg-black p-4 md:p-8 flex flex-col items-center">
                {/* Header Section */}
                <div className="text-center mb-10 animate-in fade-in slide-in-from-top duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#bf953f]/10 border border-[#bf953f]/20 mb-4 group cursor-default">
                        <Zap size={12} className="text-[#bf953f] animate-pulse" />
                        <span className="text-[9px] font-black text-[#bf953f] uppercase tracking-[0.2em]">Creative Suite</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tighter uppercase italic">
                        Studio <span className="text-gold">Sáng Tạo</span>
                    </h1>
                    <p className="text-slate-500 text-sm md:text-base font-medium max-w-xl mx-auto">
                        Tối ưu hóa hình ảnh BĐS của bạn với bộ công cụ chuyên nghiệp.
                    </p>
                </div>

                <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Mode 1 - Quick Editor */}
                    <button
                        onClick={() => setMode('quick')}
                        className="glass-card group relative p-8 flex flex-col min-h-[350px] border-white/5 hover:border-[#bf953f]/30 hover:bg-white/[0.03] transition-all duration-500 hover:-translate-y-2 text-left overflow-hidden ring-1 ring-white/5 rounded-3xl"
                    >
                        <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-110">
                            <Stamp size={200} className="text-[#bf953f] rotate-12" />
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="w-14 h-14 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center mb-6 text-[#bf953f] group-hover:scale-110 group-hover:bg-[#bf953f]/10 transition-all duration-500 shadow-xl">
                                <StickerIcon size={28} />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-3 group-hover:text-gold transition-colors uppercase italic tracking-tighter">Đóng Dấu & Layout</h2>
                            <p className="text-slate-400 font-medium leading-relaxed flex-1 text-sm">
                                Xử lý hàng loạt ảnh nhanh chóng. Chèn logo, số điện thoại, thông số kỹ thuật chuyên nghiệp.
                            </p>
                            <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-[#bf953f] tracking-[0.2em] group-hover:gap-4 transition-all uppercase">
                                Bắt đầu ngay <ArrowRight size={16} strokeWidth={3} />
                            </div>
                        </div>
                    </button>

                    {/* Mode 2 - Namecard */}
                    <button
                        onClick={() => setMode('card')}
                        className="glass-card group relative p-8 flex flex-col min-h-[350px] border-white/5 hover:border-[#bf953f]/30 hover:bg-white/[0.03] transition-all duration-500 hover:-translate-y-2 text-left overflow-hidden ring-1 ring-white/5 rounded-3xl"
                    >
                        <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-110">
                            <UserSquare2 size={200} className="text-[#bf953f] -rotate-6" />
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="w-14 h-14 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center mb-6 text-[#bf953f] group-hover:scale-110 group-hover:bg-[#bf953f]/10 transition-all duration-500 shadow-xl">
                                <UserSquare2 size={28} />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-3 group-hover:text-gold transition-colors uppercase italic tracking-tighter">Digital Namecard</h2>
                            <p className="text-slate-400 font-medium leading-relaxed flex-1 text-sm">
                                Tạo danh thiếp điện tử siêu tốc chuẩn 3.5x2 inches dành riêng cho Sales BĐS. Tích hợp QR Code.
                            </p>
                            <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-[#bf953f] tracking-[0.2em] group-hover:gap-4 transition-all uppercase">
                                Tạo Namecard <ArrowRight size={16} strokeWidth={3} />
                            </div>
                        </div>
                    </button>

                    {/* Mode 3 - AI Studio */}
                    <button
                        onClick={() => setMode('ai')}
                        className="group relative p-8 flex flex-col min-h-[350px] rounded-[2rem] bg-gradient-to-br from-[#1a1a1a] to-black border border-[#bf953f]/30 shadow-[0_0_40px_rgba(191,149,63,0.1)] transition-all duration-500 hover:-translate-y-2 text-left overflow-hidden"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.02] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>

                        <div className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:scale-125">
                            <Sparkles size={200} className="text-[#bf953f] -rotate-12" />
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="w-16 h-16 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-2xl flex items-center justify-center mb-6 text-black shadow-2xl group-hover:scale-110 transition-all duration-500">
                                <Wand2 size={30} strokeWidth={2.5} />
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[9px] font-black px-2 py-0.5 bg-[#bf953f] text-black rounded-md uppercase tracking-widest">ELITE AI</span>
                                <ShieldCheck size={14} className="text-[#bf953f]" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-white mb-3 group-hover:text-gold transition-colors uppercase italic tracking-tighter">AI Magic Studio</h2>
                            <p className="text-slate-300 font-semibold leading-relaxed flex-1 text-sm">
                                Nâng cấp ánh sáng, thêm nội thất hoặc vẽ phối cảnh mới tự động bằng AI siêu thực.
                            </p>
                            <div className="mt-8 flex items-center gap-3 text-[11px] font-black text-[#bf953f] tracking-[0.3em] group-hover:gap-5 transition-all uppercase">
                                Khám phá AI <ArrowRight size={18} strokeWidth={3} />
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'quick') return <QuickEditor onBack={() => setMode('home')} />;
    if (mode === 'card') return <CardCreator onBack={() => setMode('home')} />;
    if (mode === 'ai') return <AiStudio onBack={() => setMode('home')} />;

    return null;
}
