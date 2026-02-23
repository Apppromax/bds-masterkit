import React, { useState } from 'react';
import { PenTool, Copy, Check, Sparkles, Loader2, Zap, Target, MessageSquare, Megaphone, Info } from 'lucide-react';
import { generateProContentAI, checkAndDeductCredits } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ContentCreator() {
    const { profile, refreshProfile } = useAuth();
    const [formData, setFormData] = useState({
        type: 'Đất nền',
        location: '',
        area: '',
        price: '',
        legal: 'Sổ hồng riêng',
        purpose: 'Đầu tư' as 'Đầu tư' | 'Để ở',
        channel: 'Quảng cáo FB',
        style: 'Gây Shock'
    });

    const [results, setResults] = useState<{ content_a: string, content_b: string } | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const handleAiGenerate = async () => {
        if (!formData.location || !formData.area || !formData.price) {
            toast.error('Vui lòng nhập đủ Vị trí, Diện tích và Giá!');
            return;
        }

        // Credit check
        const cost = 10;
        const hasCredits = await checkAndDeductCredits(cost, 'Máy tạo nội dung BĐS');
        if (!hasCredits) {
            toast.error('Bạn không đủ credits hoặc có lỗi xảy ra.');
            return;
        }

        setIsGenerating(true);
        setResults(null);
        try {
            const result = await generateProContentAI({
                ...formData,
                phone: profile?.phone || '',
                name: profile?.full_name || ''
            });

            if (result && (result.content_a || result.content_b)) {
                setResults(result);
                toast.success('Đã tạo xong 2 phương án nội dung!');
                await refreshProfile?.();
            } else {
                toast.error('AI không trả về nội dung. Vui lòng thử lại.');
            }
        } catch (err) {
            toast.error('Lỗi khi tạo nội dung.');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        toast.success('Đã copy!');
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const ChipSelect = ({ label, options, value, onChange, icon: Icon }: any) => (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                {Icon && <Icon size={12} className="text-[#bf953f]" />} {label}
            </label>
            <div className="flex flex-wrap gap-2">
                {options.map((opt: string) => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border-2 uppercase tracking-tighter ${value === opt
                            ? 'bg-[#bf953f] border-[#bf953f] text-black shadow-[0_0_20px_rgba(191,149,63,0.4)]'
                            : 'bg-white/5 border-white/5 text-slate-300 hover:border-white/20'
                            }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar scroll-smooth">
            <div className="mb-6 px-1">
                <h1 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                    <PenTool className="text-[#bf953f]" size={24} strokeWidth={3} />
                    MÁY TẠO <span className="text-[#bf953f] italic underline decoration-[#bf953f]/30">NỘI DUNG</span> BĐS
                </h1>
                <p className="text-slate-400 text-[8px] font-black tracking-[0.5em] uppercase mt-1 opacity-80">Thôi miên khách hàng bằng con số và cảm xúc</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">
                {/* SETTINGS AREA */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass-card bg-[#0a0a0a] border-white/10 p-6 rounded-[2.5rem] shadow-2xl space-y-6 hover:transform-none">
                        {/* Thông số BĐS */}
                        <div className="space-y-5">
                            <h3 className="text-[11px] font-black text-[#bf953f] uppercase tracking-[0.2em] flex items-center gap-2 pb-2 border-b border-white/5">
                                <Info size={14} strokeWidth={3} /> 1. Thông số Bất động sản
                            </h3>

                            <ChipSelect
                                label="Loại hình"
                                options={['Đất nền', 'Nhà phố', 'Căn hộ', 'Biệt thự', 'Kho xưởng']}
                                value={formData.type}
                                onChange={(val: string) => setFormData({ ...formData, type: val })}
                            />

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vị trí (Quận/Huyện, Đường...)</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 rounded-2xl border border-white/10 bg-black/40 text-white outline-none focus:border-[#bf953f]/40 font-bold text-sm"
                                        placeholder="VD: Quận 7, TP.HCM"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Diện tích (m2)</label>
                                        <input
                                            type="text"
                                            className="w-full p-4 rounded-2xl border border-white/10 bg-black/40 text-white outline-none focus:border-[#bf953f]/40 font-bold text-sm text-center"
                                            placeholder="50"
                                            value={formData.area}
                                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Giá bán</label>
                                        <input
                                            type="text"
                                            className="w-full p-4 rounded-2xl border border-white/10 bg-black/40 text-white outline-none focus:border-[#bf953f]/40 font-bold text-sm text-center"
                                            placeholder="4.5 Tỷ"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <ChipSelect
                                label="Pháp lý"
                                options={['Sổ hồng riêng', 'Đang chờ sổ', 'Hợp đồng MB', 'Giấy tay']}
                                value={formData.legal}
                                onChange={(val: string) => setFormData({ ...formData, legal: val })}
                            />
                        </div>

                        {/* Chiến lược */}
                        <div className="space-y-5 pt-4">
                            <h3 className="text-[11px] font-black text-[#bf953f] uppercase tracking-[0.2em] flex items-center gap-2 pb-2 border-b border-white/5">
                                <Target size={14} strokeWidth={3} /> 2. Chiến lược nội dung
                            </h3>

                            <ChipSelect
                                label="Mục đích"
                                options={['Đầu tư', 'Để ở']}
                                value={formData.purpose}
                                onChange={(val: any) => setFormData({ ...formData, purpose: val })}
                            />

                            <ChipSelect
                                label="Kênh đăng"
                                icon={Megaphone}
                                options={['Quảng cáo FB', 'Zalo cá nhân', 'Tin rao BĐS']}
                                value={formData.channel}
                                onChange={(val: string) => setFormData({ ...formData, channel: val })}
                            />

                            <ChipSelect
                                label="Phong cách"
                                icon={MessageSquare}
                                options={['Gây Shock', 'Chuyên nghiệp', 'Kể chuyện']}
                                value={formData.style}
                                onChange={(val: string) => setFormData({ ...formData, style: val })}
                            />
                        </div>

                        <button
                            onClick={handleAiGenerate}
                            disabled={isGenerating}
                            className="w-full py-5 bg-gradient-to-r from-[#bf953f] to-[#aa771c] text-black rounded-3xl font-black text-xs tracking-[0.2em] shadow-2xl shadow-[#bf953f]/20 flex justify-center items-center gap-3 uppercase hover:scale-[1.02] transition-all disabled:opacity-50"
                        >
                            {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
                            {isGenerating ? 'AI ĐANG BIÊN TẬP...' : 'XUẤT BẢN NỘI DUNG'}
                        </button>
                    </div>
                </div>

                {/* RESULTS AREA */}
                <div className="lg:col-span-7 space-y-8">
                    {results ? (
                        <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-right-4 duration-700">
                            {/* Option A */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-4">
                                    <span className="text-[10px] font-black text-[#bf953f] bg-[#bf953f]/10 px-3 py-1 rounded-full uppercase tracking-widest">Phương án A: Number-Hook</span>
                                    <button
                                        onClick={() => copyToClipboard(results.content_a, 'a')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black border transition-all uppercase ${copiedKey === 'a' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'}`}
                                    >
                                        {copiedKey === 'a' ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                                        {copiedKey === 'a' ? 'Đã Copy' : 'Sao chép'}
                                    </button>
                                </div>
                                <div className="glass-card bg-black/40 border-white/10 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:transform-none">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                        <Zap size={140} fill="currentColor" className="text-[#bf953f]" />
                                    </div>
                                    <div className="whitespace-pre-wrap text-slate-200 text-sm leading-relaxed font-semibold relative z-10 selection:bg-[#bf953f]/30">
                                        {results.content_a}
                                    </div>
                                </div>
                            </div>

                            {/* Option B */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-4">
                                    <span className="text-[10px] font-black text-purple-400 bg-purple-400/10 px-3 py-1 rounded-full uppercase tracking-widest">Phương án B: Word-Hook</span>
                                    <button
                                        onClick={() => copyToClipboard(results.content_b, 'b')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black border transition-all uppercase ${copiedKey === 'b' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'}`}
                                    >
                                        {copiedKey === 'b' ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                                        {copiedKey === 'b' ? 'Đã Copy' : 'Sao chép'}
                                    </button>
                                </div>
                                <div className="glass-card bg-black/40 border-white/10 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group hover:transform-none">
                                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                        <Sparkles size={140} fill="currentColor" className="text-purple-400" />
                                    </div>
                                    <div className="whitespace-pre-wrap text-slate-200 text-sm leading-relaxed font-semibold relative z-10 selection:bg-purple-400/30">
                                        {results.content_b}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-black/20 rounded-[4rem] border-4 border-dashed border-white/5 text-center px-10">
                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <BrainCircuit size={48} className="text-[#bf953f] opacity-20" />
                            </div>
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Chờ lệnh từ sếp</h3>
                            <p className="text-[10px] text-slate-600 font-bold max-w-xs">Chọn thông số bên trái và nhấn XUẤT BẢN để AI thực thực chiến viết bài chốt deal cho sếp.</p>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            ` }} />
        </div>
    );
}

function BrainCircuit(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.21 3 3 0 1 0 5.998-.124" />
            <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.52 8.21 3 3 0 1 1-5.998-.124" />
            <path d="M9 13a4.5 4.5 0 0 0 3-4" />
            <path d="M12 9a4.5 4.5 0 0 0 3 4" />
            <path d="M15 13a4.5 4.5 0 0 1-3 4" />
            <path d="M12 17a4.5 4.5 0 0 1-3-4" />
            <path d="M12 13h.01" />
        </svg>
    )
}
