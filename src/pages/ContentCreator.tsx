import React, { useState } from 'react';
import { PenTool, Copy, Check, Sparkles, BrainCircuit, Loader2, Crown, Target, MessageSquare } from 'lucide-react';
import { generateContent, type ContentStyle, type PropertyType } from '../services/contentGenerator';
import { generateContentWithAI } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Save } from 'lucide-react';
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
                // Split variants by the separator requested in the prompt
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
        <div className="pb-20 md:pb-0">
            <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-black text-gold flex items-center gap-3 justify-center md:justify-start uppercase tracking-tighter">
                    <PenTool className="text-[#bf953f]" size={32} /> Content Creator
                </h1>
                <p className="text-slate-500 text-sm font-bold tracking-widest uppercase mt-2">Elite AI Content Generation</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Input Form */}
                <div className="space-y-8">
                    <div className="glass-card p-1">
                        <div className="bg-black/60 rounded-[1.4rem] p-8 space-y-8">
                            <h2 className="font-black text-xl text-white flex items-center gap-3 uppercase tracking-tight">
                                <Sparkles className="text-[#bf953f]" /> Thông tin BĐS Elite
                            </h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-[#bf953f] mb-2 uppercase tracking-widest">Loại hình</label>
                                        <select
                                            className="w-full p-3.5 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#bf953f]/50 outline-none transition-all font-bold text-sm"
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value as PropertyType })}
                                        >
                                            <option value="land">Đất nền</option>
                                            <option value="apartment">Căn hộ</option>
                                            <option value="house">Nhà phố</option>
                                            <option value="villa">Biệt thự</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-[#bf953f] mb-2 uppercase tracking-widest">Diện tích (m2)</label>
                                        <input
                                            type="number"
                                            className="w-full p-3.5 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#bf953f]/50 outline-none transition-all font-bold text-sm"
                                            placeholder="100"
                                            value={formData.area}
                                            onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-[#bf953f] mb-2 uppercase tracking-widest">Giá bán (Elite)</label>
                                        <input
                                            type="text"
                                            className="w-full p-3.5 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#bf953f]/50 outline-none transition-all font-bold text-sm"
                                            placeholder="2.5 tỷ"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-[#bf953f] mb-2 uppercase tracking-widest">Mặt tiền / Vỉa hè</label>
                                        <input
                                            type="text"
                                            className="w-full p-3.5 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#bf953f]/50 outline-none transition-all font-bold text-sm"
                                            placeholder="Lô góc, 5m..."
                                            value={formData.frontage}
                                            onChange={(e) => setFormData({ ...formData, frontage: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-[#bf953f] mb-2 uppercase tracking-widest">Vị trí Kim Cương</label>
                                    <input
                                        type="text"
                                        className="w-full p-3.5 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#bf953f]/50 outline-none transition-all font-bold text-sm"
                                        placeholder="Đường 3/2, Quận 10..."
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-[#bf953f] mb-2 uppercase tracking-widest">Tiện ích Thượng Lưu</label>
                                    <textarea
                                        className="w-full p-4 rounded-xl border border-white/10 bg-white/5 text-white h-24 outline-none focus:border-[#bf953f]/50 transition-all text-sm font-medium"
                                        placeholder="Gần chợ, sổ hồng riêng, hướng Đông..."
                                        value={formData.features}
                                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase flex items-center gap-1 tracking-widest">
                                            Kênh Đăng Tin
                                        </label>
                                        <div className="relative">
                                            <select
                                                className="w-full p-3.5 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#bf953f]/50 outline-none transition-all text-sm font-black"
                                                value={formData.channel}
                                                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                                            >
                                                <option value="facebook">Facebook Ads</option>
                                                <option value="zalo">Zalo Business</option>
                                                <option value="tiktok">Short Video Script</option>
                                                <option value="seo">SEO Optimized</option>
                                            </select>
                                            <Crown size={12} className="absolute right-8 top-1/2 -translate-y-1/2 text-[#bf953f]" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase flex items-center gap-1 tracking-widest">
                                            Phân Khúc Khách
                                        </label>
                                        <div className="relative">
                                            <select
                                                className="w-full p-3.5 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#bf953f]/50 outline-none transition-all text-sm font-black"
                                                value={formData.audience}
                                                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                                            >
                                                <option value="homeseeker">Người mua ở thực</option>
                                                <option value="investor">Investors (Sinh lời)</option>
                                            </select>
                                            <Crown size={12} className="absolute right-8 top-1/2 -translate-y-1/2 text-[#bf953f]" />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-[#bf953f] mb-3 uppercase tracking-widest">Giọng văn Chuyên Nghiệp</label>
                                    <div className="flex gap-2.5 flex-wrap">
                                        {(['professional', 'urgent', 'funny', 'sincere', 'story'] as ContentStyle[]).map((style) => (
                                            <button
                                                key={style}
                                                onClick={() => setFormData({ ...formData, style })}
                                                className={`px-5 py-2 rounded-full text-[10px] font-black tracking-widest border transition-all ${formData.style === style
                                                    ? 'bg-[#bf953f] text-black border-[#bf953f] shadow-[0_0_15px_rgba(191,149,63,0.3)]'
                                                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-[#bf953f]/30'
                                                    }`}
                                            >
                                                {style.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 flex flex-col gap-4">
                                    <button
                                        onClick={handleAiGenerate}
                                        disabled={isGeneratingAI}
                                        className="btn-bronze w-full py-5 !text-sm tracking-[0.2em]"
                                    >
                                        <div className="flex items-center gap-3">
                                            {isGeneratingAI ? <Loader2 className="animate-spin" /> : <BrainCircuit size={20} strokeWidth={2.5} />}
                                            {isGeneratingAI ? 'AI ĐANG BIÊN TẬP...' : 'TẠO NỘI DUNG ELITE (PRO)'}
                                        </div>
                                    </button>
                                    <button
                                        onClick={handleGenerate}
                                        className="w-full py-4 bg-white/5 text-[#bf953f] font-black rounded-2xl border border-[#bf953f]/20 hover:bg-[#bf953f]/5 transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
                                    >
                                        <Sparkles size={16} /> Tạo nhanh mẫu Real-time
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Area */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="font-black text-xl text-white flex items-center gap-3 uppercase tracking-tight">
                            <div className="w-1.5 h-6 bg-[#bf953f] rounded-full"></div> Kết quả Phân tích ({results.length})
                        </h2>
                        {results.length > 0 && (
                            <button onClick={() => setResults([])} className="text-[10px] font-black text-red-500 hover:text-red-400 uppercase tracking-widest">Xóa toàn bộ</button>
                        )}
                    </div>

                    {results.length > 0 ? (
                        <div className="space-y-6 max-h-[900px] overflow-y-auto pr-2 custom-scrollbar">
                            {results.map((content, idx) => (
                                <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-500 group">
                                    <div className="flex justify-between items-end mb-3 px-2">
                                        <h3 className="text-[10px] font-black text-[#bf953f] uppercase tracking-[0.25em] flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#bf953f] shadow-[0_0_10px_#bf953f]"></span>
                                            PHƯƠNG ÁN #{results.length - idx}
                                        </h3>
                                    </div>
                                    <div className="glass-card relative">
                                        <div className="bg-black/40 p-8 rounded-[1.4rem]">
                                            <div className="whitespace-pre-wrap text-slate-300 text-[15px] leading-relaxed font-medium">
                                                {content.content}
                                            </div>
                                            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-white/5">
                                                {profile?.role === 'admin' && content.prompt && (
                                                    <button
                                                        onClick={() => savePromptToAdmin(content.prompt!)}
                                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-all uppercase tracking-widest"
                                                    >
                                                        <Save size={14} /> Lưu Prompt
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => copyToClipboard(content.content, idx)}
                                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${copiedIndex === idx
                                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                        : 'bg-white/5 text-slate-400 border border-white/10 hover:text-[#bf953f] hover:border-[#bf953f]/30'
                                                        }`}
                                                >
                                                    {copiedIndex === idx ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                                                    {copiedIndex === idx ? 'Đã sao chép' : 'Sao chép'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[600px] flex flex-col items-center justify-center text-slate-600 bg-white/5 rounded-[3rem] border-2 border-dashed border-white/5">
                            <div className="w-24 h-24 bg-black/40 rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-2xl relative">
                                <div className="absolute inset-0 bg-[#bf953f]/5 blur-2xl rounded-full"></div>
                                <PenTool size={36} className="text-[#bf953f] opacity-40 relative z-10" />
                            </div>
                            <h3 className="text-xl font-black text-white mb-3 uppercase tracking-widest">Chưa có dữ liệu</h3>
                            <p className="max-w-[280px] text-center text-sm font-medium text-slate-500 italic leading-relaxed">Nạp thông tin Bất động sản và để AI kiến tạo nội dung đẳng cấp cho sếp nhé!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

    );
}
