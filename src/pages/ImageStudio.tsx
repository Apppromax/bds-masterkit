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
            <div className="min-h-screen bg-black p-6 md:p-12 flex flex-col items-center">
                {/* Header Section */}
                <div className="text-center mb-16 animate-in fade-in slide-in-from-top duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#bf953f]/10 border border-[#bf953f]/20 mb-6 group cursor-default">
                        <Zap size={14} className="text-[#bf953f] animate-pulse" />
                        <span className="text-[10px] font-black text-[#bf953f] uppercase tracking-[0.3em]">Premium Creative Suite</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter uppercase italic">
                        Studio <span className="text-gold">Sáng Tạo</span>
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
                        Chọn công cụ chuyên biệt để bắt đầu tối ưu hóa hình ảnh bất động sản của bạn.
                    </p>
                </div>

                <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Mode 1 - Quick Editor */}
                    <button
                        onClick={() => setMode('quick')}
                        className="glass-card group relative p-10 flex flex-col min-h-[400px] border-white/5 hover:border-[#bf953f]/30 hover:bg-white/[0.03] transition-all duration-500 hover:-translate-y-2 text-left overflow-hidden ring-1 ring-white/5"
                    >
                        <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-110">
                            <Stamp size={240} className="text-[#bf953f] rotate-12" />
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-[1.5rem] border border-white/10 flex items-center justify-center mb-8 text-[#bf953f] group-hover:scale-110 group-hover:bg-[#bf953f]/10 transition-all duration-500 shadow-xl">
                                <StickerIcon size={32} />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4 group-hover:text-gold transition-colors uppercase italic tracking-tighter">Đóng Dấu & Layout</h2>
                            <p className="text-slate-400 font-medium leading-relaxed flex-1 text-base">
                                Xử lý hàng loạt ảnh nhanh chóng. Chèn logo, số điện thoại, thông số kỹ thuật chuyên nghiệp.
                            </p>
                            <div className="mt-10 flex items-center gap-3 text-[11px] font-black text-[#bf953f] tracking-[0.2em] group-hover:gap-5 transition-all uppercase">
                                Bắt đầu ngay <ArrowRight size={18} strokeWidth={3} />
                            </div>
                        </div>
                    </button>

                    {/* Mode 2 - Namecard */}
                    <button
                        onClick={() => setMode('card')}
                        className="glass-card group relative p-10 flex flex-col min-h-[400px] border-white/5 hover:border-[#bf953f]/30 hover:bg-white/[0.03] transition-all duration-500 hover:-translate-y-2 text-left overflow-hidden ring-1 ring-white/5"
                    >
                        <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-110">
                            <UserSquare2 size={240} className="text-[#bf953f] -rotate-6" />
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="w-16 h-16 bg-white/5 backdrop-blur-xl rounded-[1.5rem] border border-white/10 flex items-center justify-center mb-8 text-[#bf953f] group-hover:scale-110 group-hover:bg-[#bf953f]/10 transition-all duration-500 shadow-xl">
                                <UserSquare2 size={32} />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4 group-hover:text-gold transition-colors uppercase italic tracking-tighter">Digital Namecard</h2>
                            <p className="text-slate-400 font-medium leading-relaxed flex-1 text-base">
                                Tạo danh thiếp điện tử siêu tốc chuẩn 3.5x2 inches dành riêng cho Sales BĐS. Tích hợp QR Code Auto.
                            </p>
                            <div className="mt-10 flex items-center gap-3 text-[11px] font-black text-[#bf953f] tracking-[0.2em] group-hover:gap-5 transition-all uppercase">
                                Tạo Namecard <ArrowRight size={18} strokeWidth={3} />
                            </div>
                        </div>
                    </button>

                    {/* Mode 3 - AI Studio */}
                    <button
                        onClick={() => setMode('ai')}
                        className="group relative p-10 flex flex-col min-h-[400px] rounded-[2.5rem] bg-gradient-to-br from-[#1a1a1a] to-black border border-[#bf953f]/40 shadow-[0_0_50px_rgba(191,149,63,0.15)] transition-all duration-500 hover:-translate-y-2 text-left overflow-hidden"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.02] to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none"></div>

                        <div className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:scale-125">
                            <Sparkles size={240} className="text-[#bf953f] -rotate-12" />
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-[2rem] flex items-center justify-center mb-8 text-black shadow-2xl group-hover:scale-110 transition-all duration-500">
                                <Wand2 size={36} strokeWidth={2.5} />
                            </div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[10px] font-black px-3 py-1 bg-[#bf953f] text-black rounded-lg uppercase tracking-widest">TOP TRENDING</span>
                                <ShieldCheck size={16} className="text-[#bf953f]" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 group-hover:text-gold transition-colors uppercase italic tracking-tighter">AI Magic Studio</h2>
                            <p className="text-slate-300 font-semibold leading-relaxed flex-1 text-base">
                                Biến ảnh chụp thô thành tuyệt phẩm "ăn khách". Nâng cấp ánh sáng, thêm nội thất hoặc vẽ phối cảnh mới từ Zero.
                            </p>
                            <div className="mt-10 flex items-center gap-4 text-[12px] font-black text-[#bf953f] tracking-[0.3em] group-hover:gap-6 transition-all uppercase">
                                Khám phá AI Magic <ArrowRight size={20} strokeWidth={3} />
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


