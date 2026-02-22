import React, { useState } from 'react';
import { PenTool, Copy, Check, Sparkles, BrainCircuit, Loader2, Crown, Target, MessageSquare, Save, Zap } from 'lucide-react';
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
        const prompt = `Lô đất/BĐS: ${formData.type}. Vị trí: ${formData.location}. Diện tích: ${formData.area}m2. Giá: ${formData.price}. ${formData.frontage ? `Mặt tiền: ${formData.frontage}.` : ''} Đặc điểm: ${formData.features}. Yêu cầu thêm: ${formData.custom}.`;
        try {
            const aiResult = await generateContentWithAI(prompt, {
                channel: formData.channel, audience: formData.audience, style: formData.style, multiOption: true, name: profile?.full_name || '', phone: profile?.phone || ''
            });
            if (aiResult) {
                const parts = aiResult.split('---SPLIT---').map(s => s.trim().replace(/^(\*\*|__)?(Phương án|Mẫu|Option|Lựa chọn)\s*\d+(\*\*|__|:|\.|-)?\s*/i, '')).filter(s => s.length > 0);
                setResults(prev => [...parts.map(p => ({ content: p, prompt })), ...prev]);
            } else {
                alert('Không thể gọi AI. Vui lòng kiểm tra lại API Key.');
            }
        } catch (err) {
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
        const { error } = await supabase.from('ai_prompts').insert({ name, prompt_text: generatingPrompt, category: 'content' });
        if (error) toast.error('Lỗi lưu prompt: ' + error.message);
        else toast.success('Đã lưu vào Thư viện Prompt Admin!');
    };

    return (
        <div className="max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar scroll-smooth">
            <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div>
                    <h1 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                        <PenTool className="text-gold" size={20} strokeWidth={3} /> Content <span className="text-gold italic">Generator</span>
                    </h1>
                    <p className="text-slate-500 text-[7px] font-black tracking-[0.4em] uppercase mt-0.5 opacity-60">Elite AI Ad Copy Engine</p>
                </div>
                {results.length > 0 && (
                    <button onClick={() => setResults([])} className="text-[9px] font-black text-red-500/60 hover:text-red-500 uppercase tracking-widest transition-colors">Xóa kết quả</button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pb-6">
                {/* Input Form - High Pop */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="glass-card bg-[#080808] border-white/10 p-5 rounded-2xl shadow-[0_15px_40px_-5px_rgba(0,0,0,1)]">
                        <div className="space-y-4">
                            <h2 className="font-black text-[9px] text-gold flex items-center gap-2 uppercase tracking-widest mb-2">
                                <Sparkles size={12} strokeWidth={3} /> Chi tiết BĐS
                            </h2>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Loại hình</label>
                                        <select className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:border-gold/40 outline-none font-black text-[10px]" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as PropertyType })}>
                                            <option value="land">Đất nền</option><option value="apartment">Căn hộ</option><option value="house">Nhà phố</option><option value="villa">Biệt thự</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Diện tích (m2)</label>
                                        <input type="number" className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:border-gold/40 outline-none font-black text-[10px] text-center" placeholder="100" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Giá bán</label>
                                        <input type="text" className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:border-gold/40 outline-none font-black text-[10px] text-center" placeholder="2.5 tỷ" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Mặt tiền / Đường</label>
                                        <input type="text" className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:border-gold/40 outline-none font-black text-[10px] text-center" placeholder="5m, 12m..." value={formData.frontage} onChange={(e) => setFormData({ ...formData, frontage: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Vị trí địa lý</label>
                                    <input type="text" className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:border-gold/40 outline-none font-black text-[10px]" placeholder="Đường 3/2, Quận 10..." value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Tiện ích / Đặc điểm</label>
                                    <textarea className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 text-white h-16 outline-none focus:border-gold/40 text-[10px] font-medium" placeholder="Sổ hồng riêng, gần chợ..." value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Kênh đăng</label>
                                        <select className="w-full p-2 rounded-xl border border-white/10 bg-white/5 text-white text-[9px] font-black" value={formData.channel} onChange={(e) => setFormData({ ...formData, channel: e.target.value })}><option value="facebook">FB Ads</option><option value="zalo">Zalo</option><option value="tiktok">Tiktok</option><option value="seo">SEO</option></select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Phân khúc</label>
                                        <select className="w-full p-2 rounded-xl border border-white/10 bg-white/5 text-white text-[9px] font-black" value={formData.audience} onChange={(e) => setFormData({ ...formData, audience: e.target.value })}><option value="homeseeker">Mua ở</option><option value="investor">Đầu tư</option></select>
                                    </div>
                                </div>
                                <div className="pt-3 flex flex-col gap-2">
                                    <button onClick={handleAiGenerate} disabled={isGeneratingAI} className="w-full py-3.5 bg-gold text-black rounded-lg font-black text-[10px] tracking-[0.2em] shadow-xl shadow-gold/10 flex justify-center items-center gap-2 uppercase border border-white/20">
                                        {isGeneratingAI ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} strokeWidth={3} />}
                                        {isGeneratingAI ? 'AI PHÂN TÍCH...' : 'XUẤT BẢN NỘI DUNG ELITE'}
                                    </button>
                                    <button onClick={handleGenerate} className="w-full py-2.5 bg-white/5 text-gold font-black rounded-lg border border-gold/20 hover:bg-gold/10 transition-all uppercase text-[8px] tracking-widest flex items-center justify-center gap-2"><Sparkles size={12} /> Mẫu nhanh Instant</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Area - Slender Cards */}
                <div className="lg:col-span-8 space-y-4">
                    {results.length > 0 ? (
                        <div className="space-y-4 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 custom-scrollbar pb-10">
                            {results.map((content, idx) => (
                                <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex justify-between items-center mb-1.5 px-1">
                                        <h3 className="text-[8px] font-black text-gold/60 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1 h-1 rounded-full bg-gold"></span>
                                            Dự thảo #{results.length - idx}
                                        </h3>
                                        <div className="flex gap-2">
                                            {profile?.role === 'admin' && content.prompt && (
                                                <button onClick={() => savePromptToAdmin(content.prompt!)} className="p-2 bg-white/5 text-purple-400 rounded-lg"><Save size={12} /></button>
                                            )}
                                            <button onClick={() => copyToClipboard(content.content, idx)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[8px] font-black border-2 transition-all uppercase tracking-widest ${copiedIndex === idx ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-[#080808] text-slate-500 border-white/10 hover:text-gold hover:border-gold/40 shadow-xl'}`}>
                                                {copiedIndex === idx ? <Check size={12} strokeWidth={4} /> : <Copy size={12} strokeWidth={2.5} />}
                                                {copiedIndex === idx ? 'Copied' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="glass-card bg-[#050505] border-2 border-gold/10 hover:border-gold/30 transition-all rounded-[2rem] shadow-[0_15px_40px_-10px_rgba(0,0,0,1)] group">
                                        <div className="p-6 relative">
                                            <div className="absolute top-4 right-4 text-gold/5 italic font-black text-4xl pointer-events-none group-hover:opacity-10 transition-opacity uppercase">Elite</div>
                                            <div className="whitespace-pre-wrap text-slate-300 text-[11px] md:text-xs leading-relaxed font-semibold relative z-10">{content.content}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-[#080808] rounded-[2.5rem] border-2 border-dashed border-white/5 text-slate-800">
                            <PenTool size={32} className="text-gold opacity-10 mb-4" />
                            <h3 className="text-[8px] font-black uppercase tracking-[0.4em]">Danh sách phương án chốt deal</h3>
                        </div>
                    )}
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } .custom-scrollbar::-webkit-scrollbar { width: 3px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(191,149,63,0.1); border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(191,149,63,0.4); }` }} />
        </div>
    );
}
