import React, { useState } from 'react';
import { PenTool, Copy, Check, Sparkles, BrainCircuit, Loader2, Crown, Target, MessageSquare, Save } from 'lucide-react';
import { generateContent, type ContentStyle, type PropertyType } from '../services/contentGenerator';
import { generateContentWithAI } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';

export default function ContentCreator() {
    const { profile } = useAuth();
    const [formData, setFormData] = useState({
        type: 'land' as PropertyType,
        area: '',
        location: '',
        price: '',
        frontage: '',
        features: '',
        style: 'professional' as ContentStyle,
        custom: '',
        channel: 'facebook',
        audience: 'homeseeker'
    });

    const [results, setResults] = useState<{ content: string, prompt?: string }[]>([]);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = () => {
        if (!formData.area || !formData.location || !formData.price) {
            alert('Vui lòng điền đủ diện tích, vị trí và giá!');
            return;
        }
        const contents = generateContent(formData);
        setResults(contents.map(c => ({ content: c })));
    };

    const handleAiGenerate = async () => {
        if (!formData.area || !formData.location || !formData.price) {
            alert('Vui lòng điền đủ diện tích, vị trí và giá!');
            return;
        }

        if (profile?.tier !== 'pro' && profile?.role !== 'admin') {
            alert('Tính năng AI nâng cao chỉ dành cho tài khoản PRO!');
            return;
        }

        setIsGeneratingAI(true);
        const prompt = `Lô đất/BĐS: ${formData.type}. 
Vị trí: ${formData.location}. 
Diện tích: ${formData.area}m2. 
Giá: ${formData.price}. 
${formData.frontage ? `Mặt tiền: ${formData.frontage}.` : ''} 
Đặc điểm: ${formData.features}. 
Yêu cầu thêm: ${formData.custom}.`;

        try {
            const aiResult = await generateContentWithAI(prompt, {
                channel: formData.channel,
                audience: formData.audience,
                style: formData.style,
                multiOption: true,
                name: profile?.full_name || '',
                phone: profile?.phone || ''
            });

            if (aiResult) {
                const parts = aiResult.split('---SPLIT---')
                    .map(s => s.trim().replace(/^(\*\*|__)?(Phương án|Mẫu|Option|Lựa chọn)\s*\d+(\*\*|__|:|\.|-)?\s*/i, ''))
                    .filter(s => s.length > 0);

                setResults(prev => [...parts.map(p => ({ content: p, prompt })), ...prev]);
            } else {
                alert('Không thể gọi AI. Vui lòng kiểm tra lại API Key.');
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi kết nối AI: ' + (err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định"));
        } finally {
            setIsGeneratingAI(false);
        }
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const savePromptToAdmin = async (generatingPrompt: string) => {
        if (!profile || profile.role !== 'admin') return;

        const name = window.prompt('Nhập tên gợi nhớ cho mẫu Script này:', `Mẫu script ${new Date().toLocaleTimeString()}`);
        if (!name) return;

        const { error } = await supabase.from('ai_prompts').insert({
            name,
            prompt_text: generatingPrompt,
            category: 'content'
        });

        if (error) toast.error('Lỗi lưu prompt: ' + error.message);
        else toast.success('Đã lưu vào Thư viện Prompt Admin!');
    };

    return (
        <div className="pb-10 min-h-screen overflow-x-hidden">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                        <PenTool className="text-[#bf953f]" size={24} /> Content <span className="text-gold">Creator</span>
                    </h1>
                    <p className="text-slate-500 text-[9px] font-bold tracking-[0.3em] uppercase mt-1">Elite AI Content Generation</p>
                </div>
                {results.length > 0 && (
                    <button onClick={() => setResults([])} className="text-[10px] font-black text-red-500/60 hover:text-red-500 uppercase tracking-widest transition-colors">Xóa kết quả</button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Input Form */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="glass-card bg-white/[0.02] border-white/5 rounded-2xl">
                        <div className="p-6 space-y-5">
                            <h2 className="font-black text-xs text-white flex items-center gap-2 uppercase tracking-tight opacity-70">
                                <Sparkles className="text-[#bf953f]" size={14} /> Thông tin BĐS Elite
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-[#bf953f] uppercase tracking-widest">Loại hình</label>
                                        <select
                                            className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#bf953f]/50 outline-none transition-all font-bold text-[11px]"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value as PropertyType })}
                                        >
                                            <option value="land">Đất nền</option>
                                            <option value="apartment">Căn hộ</option>
                                            <option value="house">Nhà phố</option>
                                            <option value="villa">Biệt thự</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-[#bf953f] uppercase tracking-widest">Diện tích (m2)</label>
                                        <input
                                            type="number"
                                            className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#bf953f]/50 outline-none transition-all font-bold text-[11px]"
                                            placeholder="100"
                                            value={formData.area}
                                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-[#bf953f] uppercase tracking-widest">Giá bán</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#bf953f]/50 outline-none transition-all font-bold text-[11px]"
                                            placeholder="2.5 tỷ"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-[#bf953f] uppercase tracking-widest">Mặt tiền / Vỉa hè</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#bf953f]/50 outline-none transition-all font-bold text-[11px]"
                                            placeholder="Lô góc, 5m..."
                                            value={formData.frontage}
                                            onChange={(e) => setFormData({ ...formData, frontage: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[9px] font-black text-[#bf953f] uppercase tracking-widest">Vị trí Kim Cương</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#bf953f]/50 outline-none transition-all font-bold text-[11px]"
                                        placeholder="Đường 3/2, Quận 10..."
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[9px] font-black text-[#bf953f] uppercase tracking-widest">Tiện ích Thượng Lưu</label>
                                    <textarea
                                        className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white h-20 outline-none focus:border-[#bf953f]/50 transition-all text-[11px] font-medium"
                                        placeholder="Gần chợ, sổ hồng riêng..."
                                        value={formData.features}
                                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Kênh Đăng</label>
                                        <select
                                            className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#bf953f]/50 outline-none transition-all text-[11px] font-black"
                                            value={formData.channel}
                                            onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                                        >
                                            <option value="facebook">Facebook Ads</option>
                                            <option value="zalo">Zalo Business</option>
                                            <option value="tiktok">Video Script</option>
                                            <option value="seo">SEO Optimized</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Phân Khúc</label>
                                        <select
                                            className="w-full p-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#bf953f]/50 outline-none transition-all text-[11px] font-black"
                                            value={formData.audience}
                                            onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                                        >
                                            <option value="homeseeker">Mua ở thực</option>
                                            <option value="investor">Investors</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[9px] font-black text-[#bf953f] uppercase tracking-widest">Giọng văn Elite</label>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {(['professional', 'urgent', 'funny', 'sincere', 'story'] as ContentStyle[]).map((style) => (
                                            <button
                                                key={style}
                                                onClick={() => setFormData({ ...formData, style })}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest border transition-all ${formData.style === style
                                                    ? 'bg-[#bf953f] text-black border-[#bf953f]'
                                                    : 'bg-white/5 text-slate-500 border-white/10 hover:border-[#bf953f]/30'
                                                    }`}
                                            >
                                                {style.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col gap-3">
                                    <button
                                        onClick={handleAiGenerate}
                                        disabled={isGeneratingAI}
                                        className="btn-bronze w-full py-4 !text-xs tracking-[0.2em] shadow-lg shadow-[#bf953f]/10"
                                    >
                                        <div className="flex items-center gap-2 justify-center">
                                            {isGeneratingAI ? <Loader2 className="animate-spin" size={16} /> : <BrainCircuit size={16} strokeWidth={2.5} />}
                                            {isGeneratingAI ? 'PHÂN TÍCH...' : 'TẠO NỘI DUNG ELITE'}
                                        </div>
                                    </button>
                                    <button
                                        onClick={handleGenerate}
                                        className="w-full py-3 bg-white/5 text-[#bf953f] font-black rounded-xl border border-[#bf953f]/10 hover:bg-[#bf953f]/5 transition-all flex items-center justify-center gap-2 uppercase text-[9px] tracking-widest"
                                    >
                                        <Sparkles size={14} /> Mẫu nhanh Real-time
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Area */}
                <div className="lg:col-span-7 space-y-4 min-h-[500px]">
                    {results.length > 0 ? (
                        <div className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar pb-10">
                            {results.map((content, idx) => (
                                <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex justify-between items-center mb-2 px-1">
                                        <h3 className="text-[9px] font-black text-[#bf953f]/80 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#bf953f]"></span>
                                            PHƯƠNG ÁN #{results.length - idx}
                                        </h3>
                                        <div className="flex gap-2">
                                            {profile?.role === 'admin' && content.prompt && (
                                                <button onClick={() => savePromptToAdmin(content.prompt!)} className="p-2 bg-white/5 text-purple-400 rounded-lg hover:bg-purple-500/10 transition-colors">
                                                    <Save size={14} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => copyToClipboard(content.content, idx)}
                                                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[9px] font-black transition-all uppercase tracking-widest ${copiedIndex === idx
                                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                    : 'bg-white/5 text-slate-400 border border-white/10 hover:text-[#bf953f] hover:border-[#bf953f]/30'
                                                    }`}
                                            >
                                                {copiedIndex === idx ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
                                                {copiedIndex === idx ? 'Đã sao chép' : 'Sao chép'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="glass-card bg-white/[0.01] border-white/5 hover:border-[#bf953f]/20 transition-all rounded-2xl">
                                        <div className="p-6">
                                            <div className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed font-medium">
                                                {content.content}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-600 bg-white/[0.01] rounded-[2rem] border border-dashed border-white/10 animate-pulse">
                            <PenTool size={32} className="text-[#bf953f] opacity-20 mb-4" />
                            <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.3em]">Nội dung sẽ hiển thị tại đây</h3>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
