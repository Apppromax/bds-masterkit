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
            <div className="mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                    <PenTool className="text-blue-600" /> Content Creator
                </h1>
                <p className="text-slate-500 text-sm">Tạo nội dung đăng tin chỉ trong 1 chạm</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Form */}
                <div className="space-y-6">
                    <div className="glass p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h2 className="font-bold text-lg mb-6 text-slate-800 dark:text-white flex items-center gap-2">
                            🚀 Thông tin bất động sản
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Loại hình</label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Diện tích (m2)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="100"
                                        value={formData.area}
                                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Giá bán</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="2.5 tỷ"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Mặt tiền/Vỉa hè</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="Lô góc, 5m..."
                                        value={formData.frontage}
                                        onChange={(e) => setFormData({ ...formData, frontage: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Địa chỉ / Vị trí</label>
                                <input
                                    type="text"
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="Đường 3/2, Quận 10..."
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Tiện ích / Đặc điểm</label>
                                <textarea
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 h-20 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                    placeholder="Gần chợ, sổ hồng riêng, hướng Đông..."
                                    value={formData.features}
                                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase flex items-center gap-1">
                                        <MessageSquare size={12} className="text-blue-500" /> Kênh Đăng Tin (PRO)
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold"
                                            value={formData.channel}
                                            onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                                        >
                                            <option value="facebook">Facebook Ads/Group</option>
                                            <option value="zalo">Zalo OA/Cá nhân</option>
                                            <option value="tiktok">Kịch bản TikTok/Reels</option>
                                            <option value="seo">Website SEO Content</option>
                                        </select>
                                        <Crown size={12} className="absolute right-8 top-1/2 -translate-y-1/2 text-amber-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase flex items-center gap-1">
                                        <Target size={12} className="text-blue-500" /> Đối Tượng Khách (PRO)
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold"
                                            value={formData.audience}
                                            onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                                        >
                                            <option value="homeseeker">Người mua để ở</option>
                                            <option value="investor">Nhà đầu tư sinh lời</option>
                                        </select>
                                        <Crown size={12} className="absolute right-8 top-1/2 -translate-y-1/2 text-amber-500" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Giọng văn / Phong cách</label>
                                <div className="flex gap-2 flex-wrap">
                                    {(['professional', 'urgent', 'funny', 'sincere', 'story'] as ContentStyle[]).map((style) => (
                                        <button
                                            key={style}
                                            onClick={() => setFormData({ ...formData, style })}
                                            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${formData.style === style
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                                                : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-blue-400'
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
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-black rounded-2xl shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center gap-0.5 disabled:opacity-50 border-b-4 border-indigo-800"
                                >
                                    <div className="flex items-center gap-2">
                                        {isGeneratingAI ? <Loader2 className="animate-spin" /> : <BrainCircuit size={20} />}
                                        {isGeneratingAI ? 'AI ĐANG VIẾT...' : 'TẠO NỘI DUNG CHIẾN LƯỢC (PRO)'}
                                    </div>
                                    <div className="flex items-center gap-1 text-[9px] opacity-80 tracking-widest">
                                        <Crown size={10} /> MULTI-CHANNEL AI ENGINE
                                    </div>
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    className="w-full py-3 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold rounded-2xl border-2 border-blue-100 dark:border-blue-900/30 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={18} /> Tạo nhanh mẫu có sẵn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Area */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                            📑 Kết quả ({results.length})
                        </h2>
                        {results.length > 0 && (
                            <button onClick={() => setResults([])} className="text-xs text-red-500 hover:underline">Xóa hết</button>
                        )}
                    </div>

                    {results.length > 0 ? (
                        <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 no-scrollbar">
                            {results.map((content, idx) => (
                                <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-300 group">
                                    <div className="flex justify-between items-end mb-2 px-1">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
                                            PHƯƠNG ÁN #{results.length - idx}
                                        </h3>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 group-hover:shadow-md transition-all relative">
                                        <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
                                            {content.content}
                                        </div>
                                        <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-50 dark:border-slate-800">
                                            {profile?.role === 'admin' && content.prompt && (
                                                <button
                                                    onClick={() => savePromptToAdmin(content.prompt!)}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white transition-all border border-purple-100"
                                                >
                                                    <Save size={14} /> LƯU PROMPT
                                                </button>
                                            )}
                                            <button
                                                onClick={() => copyToClipboard(content.content, idx)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${copiedIndex === idx
                                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white'
                                                    }`}
                                            >
                                                {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                                                {copiedIndex === idx ? 'ĐÃ COPY' : 'COPY'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-[500px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-800">
                                <PenTool size={32} className="opacity-20 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Chưa có nội dung</h3>
                            <p className="max-w-[250px] text-center text-sm">Điền thông tin và nhấn nút để AI viết bài đăng tin cho sếp nhé!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
