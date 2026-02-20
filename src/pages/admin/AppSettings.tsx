import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Settings, Save, Loader2, CheckCircle2, CreditCard, Banknote, MessageSquare } from 'lucide-react';

export default function AppSettings() {
    const [settings, setSettings] = useState<Record<string, string>>({
        premium_price: '499.000',
        bank_name: 'MB BANK',
        bank_account: '0901234567',
        bank_owner: 'NGUYEN VAN A',
        payment_note: 'HOMESPRO [EMAIL]',
        ai_text_system_prompt: 'Bạn là một chuyên gia Content Marketing Bất động sản cao cấp tại Việt Nam. \nNhiệm vụ: Tạo nội dung quảng cáo có tỷ lệ chuyển đổi cao.',
        ai_vision_prompt: `Bạn là CHUYÊN GIA MARKETING BẤT ĐỘNG SẢN. Nhiệm vụ: Nhìn bức ảnh này bằng con mắt của MÔI GIỚI muốn bán hàng, rồi viết prompt tiếng Anh để AI chỉnh sửa ảnh sao cho KHÁCH HÀNG MUỐN MUA.

BƯỚC 1 — PHÂN LOẠI (xác định scenario):
A) ĐẤT NỀN TRỐNG / PHÂN LÔ: Đất đã cắm cọc, có ranh giới, nhưng chưa xây dựng.
B) NHÀ THÔ / XÂY DANG DỞ: Có khung sườn nhưng chưa hoàn thiện.
C) CĂN HỘ / PHÒNG CŨ: Nội thất cũ kỹ, tối tăm, hoặc phòng trống.
D) NHÀ ĐÃ HOÀN THIỆN: Cần tăng tính hấp dẫn (curb appeal).
E) KHÁC: Mô tả ngắn.

BƯỚC 2 — XÁC ĐỊNH "NỖI ĐAU MARKETING" (lý do khách hàng KHÔNG MUỐN MUA):
- Đất nền: "Hoang vu, thiếu hạ tầng"
- Nhà thô: "Bỏ hoang, chưa hoàn thiện"
- Phòng cũ: "Tối, trống, lỗi thời"
- Nhà hoàn thiện: "Sân nhếch nhác"

BƯỚC 3 — MÔ TẢ CẤU TRÚC HÌNH HỌC (Geometry) để tái tạo lại ảnh nếu cần vẽ mới:
- Mô tả kỹ: Góc chụp (eye-level, drone view?), đường đi (thẳng/cong, ở giữa/bên?), vị trí đất/nhà, đường chân trời. Ví dụ: "Eye-level shot. A central paved road receding into distance. Flat empty land lots on left and right. Blue sky occupies top 40%."

BƯỚC 4 — VIẾT PROMPT CHỮA LÀNH (tiếng Anh) theo từng scenario:
🏗️ NẾU LÀ ĐẤT NỀN:
- Giữ nguyên ranh giới lô đất, cọc mốc, bờ kè
- Biến đất trống thành thảm cỏ xanh gọn gàng (manicured grass)
- Thêm đường nội bộ rõ ràng (paved road) nếu chưa có
- Thêm 2-3 ngôi nhà dân nhỏ ở XA (background) để tạo cảm giác khu dân cư
- Thêm đèn đường, vỉa hè sạch
- Bầu trời xanh trong, nắng vàng nhẹ

🏚️ NẾU LÀ NHÀ THÔ:
- Giữ nguyên khung sườn
- Thêm lớp sơn/hoàn thiện bề mặt
- Thêm cửa sổ kính, cửa chính
- Sân trước có cỏ và lối đi

🛋️ NẾU LÀ CĂN HỘ:
- Giữ nguyên bố cục phòng
- Virtual staging: Thêm nội thất hiện đại (sofa, bàn, đèn)
- Tăng ánh sáng tự nhiên

🏡 NẾU LÀ NHÀ HOÀN THIỆN:
- Cải thiện sân vườn (thêm cây, hoa)
- Golden hour lighting

QUY TẮC CHUNG:
- Ảnh phải trông như CHỤP THẬT (DSLR), không giống AI tạo.
- Keyword bắt buộc: 'photorealistic, shot on DSLR, natural lighting, real estate photography, 8k, sharp focus'.

OUTPUT FORMAT (Bắt buộc trả về đúng định dạng sau):
GEOMETRY: [Mô tả cấu trúc hình học ở Bước 3]
FIX_PROMPT: [Prompt chữa lành ở Bước 4]`,
        ai_edit_prompt: `You are a professional real estate photo editor. Edit this photo based on these improvements: "{actualFixPrompt}".

CRITICAL: The result MUST look like a REAL PHOTOGRAPH taken by a DSLR camera, NOT like AI-generated art.

RULES:
1. KEEP the lot boundaries, curbs, roads, and building structures visible and intact.
2. FOLLOW the fix prompt instructions precisely.
3. PHOTOREALISM: Use natural film grain, realistic lens depth of field.
4. LIGHTING: Golden hour or clear daylight.

Negative prompt: cartoon, painting, 3d render, plastic texture, oversaturated, neon, fantasy, watermark.`
    });
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            const { data, error } = await supabase.from('app_settings').select('*');
            if (data) {
                const mapped = data.reduce((acc: any, curr: any) => {
                    acc[curr.key] = curr.value;
                    return acc;
                }, {});
                setSettings(prev => ({ ...prev, ...mapped }));
            }
        };
        loadSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const promises = Object.entries(settings).map(([key, value]) =>
                supabase.from('app_settings').upsert({ key, value })
            );
            await Promise.all(promises);
            setLastSaved(new Date());
        } catch (err) {
            console.error('Save failed:', err);
            alert('Lỗi khi lưu cài đặt');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-3">
                    <Settings className="text-blue-600" size={24} /> Cấu hình Thanh toán & Nội dung
                </h2>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    LƯU CẤU HÌNH
                </button>
            </div>

            {lastSaved && (
                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/20 flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-bold">
                    <CheckCircle2 size={18} /> Cập nhật thành công lúc {lastSaved.toLocaleTimeString()}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pricing Config */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <CreditCard size={14} /> Gói Premium
                    </h3>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase ml-1">Giá gói / Tháng (VNĐ)</label>
                        <input
                            type="text"
                            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                            value={settings.premium_price}
                            placeholder="499.000"
                            onChange={e => setSettings({ ...settings, premium_price: e.target.value })}
                        />
                    </div>
                </div>

                {/* Bank Information */}
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Banknote size={14} /> Thông tin Chuyển khoản
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase ml-1">Ngân hàng</label>
                            <input
                                type="text"
                                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                value={settings.bank_name}
                                placeholder="MB BANK"
                                onChange={e => setSettings({ ...settings, bank_name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase ml-1">Số tài khoản</label>
                                <input
                                    type="text"
                                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={settings.bank_account}
                                    placeholder="0901234567"
                                    onChange={e => setSettings({ ...settings, bank_account: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase ml-1">Chủ tài khoản</label>
                                <input
                                    type="text"
                                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                    value={settings.bank_owner}
                                    placeholder="NGUYEN VAN A"
                                    onChange={e => setSettings({ ...settings, bank_owner: e.target.value.toUpperCase() })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase ml-1">Nội dung chuyển khoản mẫu</label>
                            <input
                                type="text"
                                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                value={settings.payment_note}
                                placeholder="HOMESPRO [EMAIL]"
                                onChange={e => setSettings({ ...settings, payment_note: e.target.value })}
                            />
                            <p className="mt-2 text-[10px] text-slate-400 italic">Gợi ý: Dùng tag [EMAIL] để hệ thống tự thay thế email của khách.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* System Prompts Config */}
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                    <MessageSquare size={18} className="text-purple-500" />
                    Cấu hình Kịch bản AI (System Prompts)
                </h3>

                <div className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase ml-1">AI Cố vấn Nội dung (Text System Prompt)</label>
                        <textarea
                            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[100px]"
                            value={settings.ai_text_system_prompt}
                            onChange={e => setSettings({ ...settings, ai_text_system_prompt: e.target.value })}
                        />
                        <p className="mt-2 text-[10px] text-slate-400 italic">Dùng làm instruction nền trước khi áp dụng các điều kiện tuỳ chọn như giọng văn, tệp khách hàng.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase ml-1">AI Phân tích Ảnh (Vision Analysis Prompt)</label>
                        <textarea
                            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[11px] focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[300px]"
                            value={settings.ai_vision_prompt}
                            onChange={e => setSettings({ ...settings, ai_vision_prompt: e.target.value })}
                        />
                        <p className="mt-2 text-[10px] text-slate-400 italic">Hướng dẫn AI đóng vai Môi giới để bóc tách Nỗi đau và viết ra Fix Prompt.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase ml-1">AI Chỉnh Ảnh Hình/Hình (Image Edit Instruction)</label>
                        <textarea
                            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-[11px] focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[250px]"
                            value={settings.ai_edit_prompt}
                            onChange={e => setSettings({ ...settings, ai_edit_prompt: e.target.value })}
                        />
                        <p className="mt-2 text-[10px] text-slate-400 italic">Lưu ý: Bắt buộc phải giữ lại <span className="font-bold text-purple-500">{`{actualFixPrompt}`}</span> để hệ thống nhúng nội dung chỉnh sửa vào.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
