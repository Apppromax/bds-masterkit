import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Stamp, Sparkles, Wand2, ArrowRight, UserSquare2, ShieldCheck, Zap, Image as ImageIcon, Camera } from 'lucide-react';
import QuickEditor from '../components/ImageStudio/QuickEditor';
import AiStudio from '../components/ImageStudio/AiStudio';
import CardCreator from '../components/ImageStudio/CardCreator';
import ProPhotoStudio from '../components/ImageStudio/ProPhotoStudio';

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
    const [searchParams] = useSearchParams();
    const [mode, setMode] = useState<'home' | 'quick' | 'card' | 'ai_enhance' | 'ai_creator' | 'pro_photo'>('home');
    const [incomingTag, setIncomingTag] = useState<string | null>(null);

    useEffect(() => {
        const m = searchParams.get('mode');
        if (m === 'enhance') setMode('ai_enhance');
        if (m === 'create') setMode('ai_creator');
    }, [searchParams]);

    const handleAttachToPhoto = (tagUrl: string) => {
        setIncomingTag(tagUrl);
        setMode('quick');
    };

    if (mode === 'home') {
        const modes = [
            { id: 'card', title: 'Tạo Namecard', icon: UserSquare2, desc: 'Danh thiếp Sale BĐS, chuẩn in 3.5x2 inch.', isAi: false },
            { id: 'ai_enhance', title: 'Làm Đẹp Ảnh BĐS', icon: Wand2, desc: 'Dọn dẹp, thêm nội thất, mở rộng góc flycam.', isAi: true },
            { id: 'ai_creator', title: 'Vẽ Phối Cảnh AI', icon: Sparkles, desc: 'Mô tả bằng chữ → AI vẽ thành ảnh phối cảnh.', isAi: true },
            { id: 'pro_photo', title: 'Ảnh Sale Pro', icon: Camera, desc: 'Tạo ảnh đại diện hoặc ghép mình vào dự án.', isAi: true },
            { id: 'quick', title: 'Dán Logo & SĐT', icon: StickerIcon, desc: 'Chèn logo, số điện thoại, thông số lên ảnh.', isAi: false },
        ];

        return (
            <div className="h-[calc(100vh-60px)] md:h-[calc(100vh-80px)] overflow-hidden flex flex-col">
                {/* Header - Matching Dashboard Style */}
                <div className="flex justify-between items-center shrink-0 mb-4 px-1 md:px-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-gold to-[#aa771c] rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                            <ImageIcon className="text-black" size={18} strokeWidth={3} />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-black text-white tracking-widest leading-none uppercase italic">STUDIO <span className="text-gold">SÁNG TẠO</span></h1>
                            <p className="text-[7px] font-black text-slate-500 tracking-[0.4em] uppercase mt-1">Creative Pro Suite Engine</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-10 px-1 md:px-0">
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-5">
                        {modes.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id as any)}
                                className={`group relative p-4 md:p-8 flex flex-col items-center justify-center text-center gap-3 md:gap-5 rounded-2xl md:rounded-[2.5rem] bg-[#1a2332] border-2 ${m.isAi ? 'border-gold/40 shadow-[0_10px_20px_-5px_rgba(0,0,0,0.4)] md:shadow-[0_20px_40px_-5px_rgba(0,0,0,0.4)]' : 'border-white/5 shadow-xl md:shadow-2xl'} hover:border-gold/50 transition-all duration-500 overflow-hidden`}
                            >
                                <div className="w-12 h-12 md:w-20 md:h-20 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-xl md:rounded-[1.8rem] flex items-center justify-center shadow-lg border border-white/25 group-hover:scale-110 transition-transform duration-500">
                                    <m.icon size={22} className="text-[#131b2e] md:hidden" strokeWidth={2.5} />
                                    <m.icon size={38} className="text-[#131b2e] hidden md:block" strokeWidth={2.5} />
                                </div>

                                <div className="space-y-1 md:space-y-2">
                                    <h2 className="text-xs md:text-xl font-black text-white group-hover:text-gold transition-colors uppercase italic tracking-tighter leading-tight">{m.title}</h2>
                                    <p className="text-[8px] md:text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-all leading-relaxed line-clamp-2 max-w-[220px]">
                                        {m.desc}
                                    </p>
                                </div>

                                {/* Mobile: compact arrow */}
                                <div className="md:hidden w-8 h-8 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
                                    <ArrowRight size={14} className="text-gold" strokeWidth={3} />
                                </div>
                                {/* Desktop: full CTA */}
                                <div className="hidden md:flex mt-4 py-3 px-8 bg-gradient-to-r from-gold via-[#fcf6ba] to-gold rounded-full items-center gap-3 text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-gold/20 scale-90 group-hover:scale-100 transition-all duration-500">
                                    Bắt đầu ngay
                                    <ArrowRight size={14} strokeWidth={4} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>



            </div >
        );
    }

    if (mode === 'quick') return <QuickEditor onBack={() => { setMode('home'); setIncomingTag(null); }} initialTag={incomingTag} />;
    if (mode === 'card') return <CardCreator onBack={() => setMode('home')} onAttachToPhoto={handleAttachToPhoto} />;
    if (mode === 'ai_enhance') return <AiStudio onBack={() => setMode('home')} initialMode="enhance" />;
    if (mode === 'ai_creator') return <AiStudio onBack={() => setMode('home')} initialMode="creator" />;
    if (mode === 'pro_photo') return <ProPhotoStudio onBack={() => setMode('home')} />;

    return null;
}
