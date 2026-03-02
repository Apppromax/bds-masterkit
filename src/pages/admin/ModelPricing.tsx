import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { DollarSign, Save, Loader2, CheckCircle2, Cpu, Info } from 'lucide-react';

interface ModelPrice {
    id: string;
    name: string;
    inputPrice: string;   // $ per 1M tokens
    outputPrice: string;  // $ per 1M tokens
    description: string;
}

const DEFAULT_MODELS: ModelPrice[] = [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', inputPrice: '0.10', outputPrice: '0.40', description: 'Model chính — nhanh, giá rẻ, đa năng' },
    { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', inputPrice: '0.075', outputPrice: '0.30', description: 'Phiên bản lite, tối ưu chi phí' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', inputPrice: '1.25', outputPrice: '5.00', description: 'Model cao cấp, context dài (≤128K)' },
    { id: 'gemini-1.5-pro-long', name: 'Gemini 1.5 Pro (>128K)', inputPrice: '2.50', outputPrice: '10.00', description: 'Context dài >128K tokens' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', inputPrice: '0.075', outputPrice: '0.30', description: 'Nhanh, phù hợp tác vụ nhẹ (≤128K)' },
    { id: 'gemini-1.5-flash-long', name: 'Gemini 1.5 Flash (>128K)', inputPrice: '0.15', outputPrice: '0.60', description: 'Context dài >128K tokens' },
    { id: 'gemini-1.5-flash-8b', name: 'Gemini 1.5 Flash 8B', inputPrice: '0.0375', outputPrice: '0.15', description: 'Siêu nhẹ, tối ưu tốc độ' },
    { id: 'gemini-3.0-flash-preview', name: 'Gemini 3.0 Flash (Preview)', inputPrice: '0.10', outputPrice: '0.40', description: 'Thế hệ mới — preview' },
    { id: 'gemini-3.1-flash-image-preview', name: 'Gemini 3.1 Flash Image Preview', inputPrice: '0.10', outputPrice: '0.40', description: 'Chuyên xử lý ảnh — image generation/edit' },
];

export default function ModelPricing() {
    const [models, setModels] = useState<ModelPrice[]>(DEFAULT_MODELS);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        loadPricing();
    }, []);

    const loadPricing = async () => {
        const { data } = await supabase
            .from('app_settings')
            .select('*')
            .eq('key', 'model_pricing');

        if (data && data.length > 0) {
            try {
                const parsed = JSON.parse(data[0].value);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    // Merge saved data with defaults (keep new models that aren't saved yet)
                    const merged = DEFAULT_MODELS.map(dm => {
                        const saved = parsed.find((p: ModelPrice) => p.id === dm.id);
                        return saved ? { ...dm, inputPrice: saved.inputPrice, outputPrice: saved.outputPrice } : dm;
                    });
                    setModels(merged);
                }
            } catch (e) {
                console.error('Failed to parse model pricing:', e);
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const pricingData = models.map(m => ({
                id: m.id,
                name: m.name,
                inputPrice: m.inputPrice,
                outputPrice: m.outputPrice,
            }));

            await supabase.from('app_settings').upsert({
                key: 'model_pricing',
                value: JSON.stringify(pricingData)
            });

            setLastSaved(new Date());
        } catch (err) {
            console.error('Save pricing failed:', err);
            alert('Lỗi khi lưu bảng giá');
        } finally {
            setIsSaving(false);
        }
    };

    const updatePrice = (id: string, field: 'inputPrice' | 'outputPrice', value: string) => {
        setModels(prev => prev.map(m =>
            m.id === id ? { ...m, [field]: value } : m
        ));
    };

    // Calculate example cost
    const calcExample = (model: ModelPrice) => {
        const input = parseFloat(model.inputPrice) || 0;
        const output = parseFloat(model.outputPrice) || 0;
        // Assume avg request: 500 input tokens + 1000 output tokens
        const cost = (500 * input + 1000 * output) / 1_000_000;
        return cost.toFixed(6);
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="font-black text-xl flex items-center gap-3 text-slate-800 dark:text-white">
                        <Cpu size={24} className="text-emerald-500" /> Bảng Giá Token theo Model
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <Info size={12} />
                        Giá tính bằng USD / 1 triệu tokens. Dùng để tính chi phí trong API Logs.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-emerald-700 transition-all disabled:opacity-50 shrink-0"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    LƯU BẢNG GIÁ
                </button>
            </div>

            {lastSaved && (
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/20 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-bold">
                    <CheckCircle2 size={18} /> Đã lưu bảng giá lúc {lastSaved.toLocaleTimeString()}
                </div>
            )}

            {/* Pricing Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                            <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Model</th>
                            <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                <div className="flex flex-col items-center">
                                    <span>Input Price</span>
                                    <span className="text-[8px] font-bold text-slate-300 normal-case">($/1M tokens)</span>
                                </div>
                            </th>
                            <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                <div className="flex flex-col items-center">
                                    <span>Output Price</span>
                                    <span className="text-[8px] font-bold text-slate-300 normal-case">($/1M tokens)</span>
                                </div>
                            </th>
                            <th className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                <div className="flex flex-col items-center">
                                    <span>Ví dụ</span>
                                    <span className="text-[8px] font-bold text-slate-300 normal-case">(500in + 1000out)</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {models.map((model) => (
                            <tr key={model.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                                <td className="px-5 py-4">
                                    <div>
                                        <p className="text-sm font-black text-slate-800 dark:text-white">{model.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{model.description}</p>
                                        <code className="text-[9px] text-blue-400/70 bg-blue-400/5 px-1.5 py-0.5 rounded mt-1 inline-block">{model.id}</code>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center justify-center">
                                        <span className="text-xs font-black text-slate-400 mr-1.5">$</span>
                                        <input
                                            type="text"
                                            className="w-24 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-sm text-center text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 outline-none"
                                            value={model.inputPrice}
                                            onChange={(e) => updatePrice(model.id, 'inputPrice', e.target.value)}
                                        />
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center justify-center">
                                        <span className="text-xs font-black text-slate-400 mr-1.5">$</span>
                                        <input
                                            type="text"
                                            className="w-24 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-black text-sm text-center text-amber-600 dark:text-amber-400 focus:ring-2 focus:ring-amber-500 outline-none"
                                            value={model.outputPrice}
                                            onChange={(e) => updatePrice(model.id, 'outputPrice', e.target.value)}
                                        />
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-center">
                                    <span className="text-xs font-black text-blue-500">
                                        ${calcExample(model)}
                                    </span>
                                    <span className="text-[9px] text-slate-400 block">/request</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Info Box */}
            <div className="bg-slate-50 dark:bg-slate-800/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <DollarSign size={12} /> Công thức tính chi phí
                </p>
                <code className="text-xs text-slate-600 dark:text-slate-300 block bg-black/5 dark:bg-black/20 p-3 rounded-xl">
                    cost = (input_tokens × input_price + output_tokens × output_price) / 1,000,000
                </code>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                    Edge Function sẽ tự động đọc bảng giá này khi ghi log. Nếu model không có trong bảng, mặc định sử dụng giá của <strong>gemini-2.0-flash</strong>.
                </p>
            </div>
        </div>
    );
}
