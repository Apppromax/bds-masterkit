import React, { useState } from 'react';
import { PenTool, Copy, Check, Share2, Sparkles } from 'lucide-react';
import { generateContent, type ContentStyle, type PropertyType } from '../services/contentGenerator';

export default function ContentCreator() {
    const [formData, setFormData] = useState({
        type: 'land' as PropertyType,
        area: '',
        location: '',
        price: '',
        frontage: '',
        features: '',
        style: 'professional' as ContentStyle,
        custom: ''
    });

    const [results, setResults] = useState<string[]>([]);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = () => {
        if (!formData.area || !formData.location || !formData.price) {
            alert('Vui lòng điền đủ diện tích, vị trí và giá!');
            return;
        }
        const contents = generateContent(formData);
        setResults(contents);
    };

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <div className="pb-20 md:pb-0">
            <div className="mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                    <PenTool className="text-blue-600" /> Content Creator
                </h1>
                <p className="text-slate-500 text-sm">Tạo nội dung đăng tin chỉ trong 30 giây</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Form */}
                <div className="glass p-6 rounded-2xl shadow-sm h-fit">
                    <h2 className="font-semibold text-lg mb-4 text-slate-800 dark:text-white">Thông tin Bất động sản</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Loại hình</label>
                                <select
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
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
                                <label className="block text-sm font-medium mb-1">Diện tích (m2)</label>
                                <input
                                    type="number"
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    placeholder="VD: 100"
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Giá bán</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    placeholder="VD: 2.5 tỷ"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Mặt tiền (tùy chọn)</label>
                                <input
                                    type="text"
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                    placeholder="VD: 5m, Lô góc"
                                    value={formData.frontage}
                                    onChange={(e) => setFormData({ ...formData, frontage: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Vị trí</label>
                            <input
                                type="text"
                                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                placeholder="VD: Đường 3/2, Quận 10, HCM"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Đặc điểm nổi bật (Key Selling Point)</label>
                            <textarea
                                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-20"
                                placeholder="VD: Gần trường học, sổ hồng riêng, view sông..."
                                value={formData.features}
                                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Phong cách</label>
                            <div className="flex gap-2 flex-wrap">
                                {(['professional', 'urgent', 'funny', 'sincere', 'story'] as ContentStyle[]).map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => setFormData({ ...formData, style })}
                                        className={`px-3 py-1.5 rounded-full text-sm border transition-all ${formData.style === style
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 hover:border-blue-400'
                                            }`}
                                    >
                                        {style.charAt(0).toUpperCase() + style.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Yêu cầu thêm (Tùy chọn)</label>
                            <input
                                type="text"
                                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                placeholder="VD: Viết dạng thơ, thêm emoji..."
                                value={formData.custom}
                                onChange={(e) => setFormData({ ...formData, custom: e.target.value })}
                            />
                        </div>

                        <button
                            onClick={handleGenerate}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                        >
                            <Sparkles size={20} /> Tạo Nội Dung Ngay
                        </button>
                    </div>
                </div>

                {/* Results Area */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-lg text-slate-800 dark:text-white">Kết quả gợi ý</h2>
                    {results.length > 0 ? (
                        results.map((content, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
                                <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 text-sm mb-3">
                                    {content}
                                </div>
                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                    <button className="text-slate-500 hover:text-blue-600 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                        <Share2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(content, idx)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${copiedIndex === idx
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                            }`}
                                    >
                                        {copiedIndex === idx ? <Check size={16} /> : <Copy size={16} />}
                                        {copiedIndex === idx ? 'Đã sao chép' : 'Sao chép'}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <Sparkles size={48} className="mb-2 opacity-20" />
                            <p>Nhập thông tin và nhấn "Tạo nội dung"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
