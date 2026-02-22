import React, { useState } from 'react';
import { Stamp, Sparkles, Wand2, ArrowRight, UserSquare2, ShieldCheck, Zap } from 'lucide-react';
import QuickEditor from '../components/ImageStudio/QuickEditor';
import AiStudio from '../components/ImageStudio/AiStudio';
import CardCreator from '../components/ImageStudio/CardCreator';

const StickerIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
            <div className="max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar scroll-smooth">
                {/* Header Section - Extreme Compact */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 mb-3 group cursor-default">
                        <Zap size={10} className="text-gold animate-pulse" />
                        <span className="text-[8px] font-black text-gold uppercase tracking-[0.3em]">Creative Pro Suite</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-black text-white mb-2 tracking-tighter uppercase italic">
                        Studio <span className="text-gold">Sáng Tạo</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] md:text-xs font-bold max-w-lg mx-auto uppercase tracking-wider opacity-60">
                        Tối ưu hóa hình ảnh BĐS với bộ công cụ chuyên nghiệp.
                    </p>
                </div>

                <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 gap-5 pb-6">
                    {/* Mode 1 - Quick Editor */}
                    <button
                        onClick={() => setMode('quick')}
                        className="group relative p-6 flex flex-col min-h-[300px] rounded-[2rem] bg-[#080808] border-2 border-white/5 hover:border-gold/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,1)] hover:shadow-gold/10 transition-all duration-500 overflow-hidden"
                    >
                        <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-110">
                            <Stamp size={180} className="text-gold rotate-12" />
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="w-12 h-12 bg-white/[0.03] rounded-xl border-2 border-white/5 flex items-center justify-center mb-6 text-gold group-hover:border-gold/60 group-hover:bg-gold/10 transition-all duration-500 shadow-xl">
                                <StickerIcon size={24} />
                            </div>
                            <h2 className="text-xl font-black text-white mb-2 group-hover:text-gold transition-colors uppercase italic tracking-tighter">Đóng Dấu & Layout</h2>
                            <p className="text-slate-500 font-bold leading-relaxed flex-1 text-[10px] uppercase tracking-wide opacity-70 group-hover:opacity-100 group-hover:text-slate-300 transition-all">
                                Xử lý hàng loạt ảnh nhanh chóng. Chèn logo, số điện thoại, thông số kỹ thuật chuyên nghiệp.
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-[9px] font-black text-gold tracking-[0.2em] group-hover:gap-4 transition-all uppercase">
                                Bắt đầu ngay <ArrowRight size={14} strokeWidth={4} />
                            </div>
                        </div>
                    </button>

                    {/* Mode 2 - Namecard */}
                    <button
                        onClick={() => setMode('card')}
                        className="group relative p-6 flex flex-col min-h-[300px] rounded-[2rem] bg-[#080808] border-2 border-white/5 hover:border-gold/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,1)] hover:shadow-gold/10 transition-all duration-500 overflow-hidden"
                    >
                        <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:scale-110">
                            <UserSquare2 size={180} className="text-gold -rotate-6" />
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="w-12 h-12 bg-white/[0.03] rounded-xl border-2 border-white/5 flex items-center justify-center mb-6 text-gold group-hover:border-gold/60 group-hover:bg-gold/10 transition-all duration-500 shadow-xl">
                                <UserSquare2 size={24} />
                            </div>
                            <h2 className="text-xl font-black text-white mb-2 group-hover:text-gold transition-colors uppercase italic tracking-tighter">Digital Namecard</h2>
                            <p className="text-slate-500 font-bold leading-relaxed flex-1 text-[10px] uppercase tracking-wide opacity-70 group-hover:opacity-100 group-hover:text-slate-300 transition-all">
                                Tạo danh thiếp điện tử siêu tốc chuẩn 3.5x2 inches dành riêng cho Sales BĐS. Tích hợp QR Code.
                            </p>
                            <div className="mt-6 flex items-center gap-2 text-[9px] font-black text-gold tracking-[0.2em] group-hover:gap-4 transition-all uppercase">
                                Tạo Namecard <ArrowRight size={14} strokeWidth={4} />
                            </div>
                        </div>
                    </button>

                    {/* Mode 3 - AI Studio */}
                    <button
                        onClick={() => setMode('ai')}
                        className="group relative p-6 flex flex-col min-h-[300px] rounded-[2.5rem] bg-[#050505] border-2 border-gold/30 shadow-[0_30px_60px_-10px_rgba(0,0,0,1)] hover:border-gold/60 transition-all duration-500 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none"></div>

                        <div className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:scale-125">
                            <Sparkles size={200} className="text-gold -rotate-12" />
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="w-14 h-14 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-2xl flex items-center justify-center mb-6 text-black shadow-[0_0_30px_rgba(191,149,63,0.4)] group-hover:scale-110 transition-all duration-500">
                                <Wand2 size={28} strokeWidth={2.5} />
                            </div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-[8px] font-black px-2 py-0.5 bg-gold text-black rounded-md uppercase tracking-widest">ELITE AI</span>
                                <ShieldCheck size={12} className="text-gold" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-black text-white mb-2 group-hover:text-gold transition-colors uppercase italic tracking-tighter">AI Magic Studio</h2>
                            <p className="text-slate-400 font-bold leading-relaxed flex-1 text-[10px] uppercase tracking-wide opacity-80 group-hover:opacity-100 group-hover:text-slate-200 transition-all">
                                Nâng cấp ánh sáng, thêm nội thất hoặc vẽ phối cảnh mới tự động bằng AI siêu thực.
                            </p>
                            <div className="mt-6 flex items-center gap-3 text-[10px] font-black text-gold tracking-[0.3em] group-hover:gap-5 transition-all uppercase">
                                Khám phá AI <ArrowRight size={16} strokeWidth={4} />
                            </div>
                        </div>
                    </button>
                </div>
                <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />
            </div>
        );
    }

    if (mode === 'quick') return <QuickEditor onBack={() => setMode('home')} />;
    if (mode === 'card') return <CardCreator onBack={() => setMode('home')} />;
    if (mode === 'ai') return <AiStudio onBack={() => setMode('home')} />;

    return null;
}
