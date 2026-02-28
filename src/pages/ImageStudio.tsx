import React, { useState } from 'react';
import { Stamp, Sparkles, Wand2, ArrowRight, UserSquare2, ShieldCheck, Zap, LayoutDashboard } from 'lucide-react';
import QuickEditor from '../components/ImageStudio/QuickEditor';
import AiStudio from '../components/ImageStudio/AiStudio';
import CardCreator from '../components/ImageStudio/CardCreator';

const StickerIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
        <path d="M15 3v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h8" />
        <path d="M8 9h2" />
    </svg>
);

export default function ImageStudio() {
    const [mode, setMode] = useState<'home' | 'quick' | 'card' | 'ai_enhance' | 'ai_creator'>('home');
    const [incomingTag, setIncomingTag] = useState<string | null>(null);

    const handleAttachToPhoto = (tagUrl: string) => {
        setIncomingTag(tagUrl);
        setMode('quick');
    };

    if (mode === 'home') {
        const modes = [
            { id: 'card', title: 'Digital Namecard', icon: UserSquare2, desc: 'Danh thiếp điện tử Sales BĐS chuẩn 3.5x2 inch.', isAi: false },
            { id: 'ai_enhance', title: 'Nâng Cấp Ảnh', icon: Wand2, desc: 'Dọn dẹp, thêm nội thất, mở rộng góc flycam.', isAi: true },
            { id: 'ai_creator', title: 'Kiến Tạo & Render', icon: Sparkles, desc: 'Vẽ cảnh quan theo mô tả, biến văn bản thành hình.', isAi: true },
            { id: 'quick', title: 'Đóng Dấu & Layout', icon: StickerIcon, desc: 'Chèn logo, SĐT, thông số kỹ thuật chuyên nghiệp.', isAi: false },
        ];

        return (
            <div className="h-[calc(100vh-60px)] md:h-[calc(100vh-80px)] overflow-hidden flex flex-col">
                {/* Header - Matching Dashboard Style */}
                <div className="flex justify-between items-center shrink-0 mb-4 px-1 md:px-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-gold to-[#aa771c] rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                            <LayoutDashboard className="text-black" size={18} strokeWidth={3} />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-black text-white tracking-widest leading-none uppercase italic">STUDIO <span className="text-gold">SÁNG TẠO</span></h1>
                            <p className="text-[7px] font-black text-slate-500 tracking-[0.4em] uppercase mt-1">Creative Pro Suite Engine</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-10 px-1 md:px-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                        {modes.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id as any)}
                                className={`group relative p-6 md:p-8 flex flex-col items-center justify-center text-center gap-5 rounded-[2.5rem] bg-[#1a2332] border-2 ${m.isAi ? 'border-gold/40 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.4)]' : 'border-white/5 shadow-2xl'} hover:border-gold/50 transition-all duration-500 overflow-hidden relative`}
                            >
                                {m.isAi && (
                                    <div className="absolute top-4 right-6 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gold/10 border border-gold/40">
                                        <span className="text-[8px] font-black text-gold uppercase tracking-[0.2em]">VIP</span>
                                        <ShieldCheck size={10} className="text-gold" />
                                    </div>
                                )}

                                <div className={`w-20 h-20 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-[1.8rem] flex items-center justify-center shadow-lg border border-white/25 group-hover:scale-110 transition-transform duration-500`}>
                                    <m.icon size={38} className="text-[#131b2e]" strokeWidth={2.5} />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-lg md:text-xl font-black text-white group-hover:text-gold transition-colors uppercase italic tracking-tighter leading-tight">{m.title}</h2>
                                    <p className="text-[10px] md:text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-all leading-relaxed line-clamp-2 max-w-[220px]">
                                        {m.desc}
                                    </p>
                                </div>

                                <div className="mt-2 flex items-center gap-3 text-[10px] font-black text-gold tracking-[0.3em] group-hover:gap-5 transition-all uppercase italic">
                                    {m.isAi ? 'Khám phá VIP' : m.id === 'card' ? 'Tạo Namecard' : 'Bắt đầu ngay'}
                                    <ArrowRight size={14} strokeWidth={4} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />
            </div>
        );
    }

    if (mode === 'quick') return <QuickEditor onBack={() => { setMode('home'); setIncomingTag(null); }} initialTag={incomingTag} />;
    if (mode === 'card') return <CardCreator onBack={() => setMode('home')} onAttachToPhoto={handleAttachToPhoto} />;
    if (mode === 'ai_enhance') return <AiStudio onBack={() => setMode('home')} initialMode="enhance" />;
    if (mode === 'ai_creator') return <AiStudio onBack={() => setMode('home')} initialMode="creator" />;

    return null;
}
