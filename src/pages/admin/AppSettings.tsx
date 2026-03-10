import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Settings, Save, Loader2, CheckCircle2, CreditCard, Banknote, MessageSquare, Target } from 'lucide-react';

export default function AppSettings() {
    const [settings, setSettings] = useState<Record<string, string>>({
        premium_price: '499.000',
        bank_name: 'MB BANK',
        bank_account: '0901234567',
        bank_owner: 'NGUYEN VAN A',
        payment_note: 'CHOTSALE [EMAIL]',

        ai_model_content: 'gemini-2.5-flash',
        ai_model_strategy: 'gemini-2.5-flash',
        ai_model_vision: 'gemini-2.5-flash',
        ai_model_lead: 'gemini-2.5-flash',
        ai_model_image: 'imagen-4.0-generate-001',
        ai_vision_prompt: `Bạn là CHUYÊN GIA MARKETING BẤT ĐỘNG SẢN. Nhiệm vụ: Nhìn bức ảnh này và viết mô tả chi tiết để AI chỉnh sửa ảnh sao cho KHÁCH HÀNG MUỐN MUA.

BƯỚC 1 — PHÂN LOẠI (xác định bối cảnh):
A) ĐẤT NỀN TRỐNG / PHÂN LÔ: Đất đã cắm cọc, có ranh giới, nhưng chưa xây dựng. B) NHÀ THÔ / XÂY DANG DỞ: Có khung sườn nhưng chưa hoàn thiện. C) CĂN HỘ / PHÒNG CŨ: Nội thất cũ kỹ, tối tăm, hoặc phòng trống. D) NHÀ ĐÃ HOÀN THIỆN: Cần tăng tính hấp dẫn. E) KHÁC: Mô tả ngắn.

BƯỚC 2 — XÁC ĐỊNH "NỖI ĐAU MARKETING":
- Đất nền: "Hoang vu, thiếu hạ tầng". - Nhà thô: "Bỏ hoang, chưa hoàn thiện". - Phòng cũ: "Tối, trống, lỗi thời". - Nhà hoàn thiện: "Sân nhếch nhác".

BƯỚC 3 — MÔ TẢ CẤU TRÚC HÌNH HỌC (Geometry):
- Mô tả kỹ: Góc chụp, đường đi, vị trí đất/nhà, đường chân trời. Ví dụ: "Chụp ngang tầm mắt. Một con đường trải nhựa ở giữa chạy xa dần. Các lô đất trống bằng phẳng ở hai bên. Bầu trời xanh chiếm 40% phía trên."

BƯỚC 4 — VIẾT YÊU CẦU CHỈNH SỬA (tiếng Việt) theo từng scenario:
🏗️ NẾU LÀ ĐẤT NỀN: Giữ ranh giới, thêm cỏ xanh, đường nhựa, đèn đường.
🏚️ NẾU LÀ NHÀ THÔ: Hoàn thiện bề mặt sơn, thêm cửa kính, sân vườn.
🛋️ NẾU LÀ CĂN HỘ: Thêm nội thất hiện đại, tăng ánh sáng.
🏡 NẾU LÀ NHÀ HOÀN THIỆN: Cải thiện cảnh quan, ánh sáng đẹp.

QUY TẮC CHUNG: Ảnh phải trông như CHỤP THẬT (DSLR), cực kỳ sắc nét, sống động.

OUTPUT FORMAT: Bạn BẮT BUỘC chỉ được trả về một chuỗi JSON chuẩn có cấu trúc:
{
  "geometry": "[Mô tả cấu trúc hình học ở Bước 3]",
  "fixPrompt": "[Yêu cầu chỉnh sửa chi tiết ở Bước 4]"
}`,
        ai_edit_prompt: `Sếp là một biên tập viên ảnh bất động sản chuyên nghiệp. Hãy chỉnh sửa bức ảnh này dựa trên những yêu cầu sau: "{actualFixPrompt}".

    QUAN TRỌNG: Kết quả PHẢI trông như một bức ẢNH CHỤP THẬT bằng máy ảnh chuyên nghiệp, KHÔNG được giống tranh vẽ hay ảnh do AI tạo ra.
    
    QUY TẮC:
    1. GIỮ NGUYÊN ranh giới lô đất, vỉa hè, đường xá và cấu trúc các công trình hiện có trong ảnh.
    2. Thực hiện chính xác các yêu cầu chỉnh sửa.
    3. ĐẢM BẢO ĐỘ THẬT: Sử dụng vân nhám tự nhiên, độ sâu trường ảnh thực tế.
    4. ÁNH SÁNG: Ánh sáng ban ngày trong vắt hoặc nắng vàng nhẹ.
    5. Tuyệt đối TRÁNH: Tránh nhìn như render 3D, tránh nhìn như nhựa, hoạt hình hay tranh vẽ.

    Trả về bản mô tả chi tiết bằng tiếng Việt để bộ máy tạo ảnh hiểu rõ nhất. Chỉ trả về kết quả, không giải thích gì thêm.`,
        ai_content_generator_prompt: `Bạn là chuyên gia Content BĐS thực chiến. Hãy viết 02 nội dung khác nhau dựa trên dữ liệu người dùng cung cấp.
Yêu cầu bắt buộc cho 2 nội dung:
Nội dung A (Number-Hook): Câu đầu tiên phải bắt đầu bằng con số (Giá, Diện tích, hoặc Lợi nhuận) và viết HOA toàn bộ.
Nội dung B (Word-Hook): Câu đầu tiên phải là từ ngữ khơi gợi cảm xúc/tình trạng theo đúng Phong cách đã chọn.

Quy tắc theo Phong cách:
Gây Shock: Dùng từ mạnh (Vỡ nợ, Thở oxy, Cắt lỗ, Duy nhất).
Chuyên nghiệp: Tập trung vào giá trị tiềm năng, quy hoạch, pháp lý sổ sách.
Kể chuyện: Dẫn dắt gần gũi (Ví dụ: 'Sáng nay chủ nhà gọi điện nhờ em...', 'Biết bao nhiêu tâm huyết gửi vào căn nhà này...').

Quy tắc theo Vị trí đăng:
FB Quảng cáo: Giật tít mạnh, nhiều Emoji, có Hashtag.
Zalo cá nhân: Ngắn gọn, chân thực, xuống dòng nhiều.
Tin rao BĐS: Đầy đủ, mạch lạc, chuyên nghiệp.

OUTPUT FORMAT: Bạn BẮT BUỘC chỉ được trả về một chuỗi JSON chuẩn có cấu trúc:
{
  "content_a": "[Nội dung A]",
  "content_b": "[Nội dung B]"
}`,
        ai_image_gen_prompt: `Ảnh chụp bất động sản cao cấp: {prompt}, cực kỳ chân thực, độ phân giải 8k, ánh sáng kiến trúc, sắc nét, bố cục sạch sẽ, TUYỆT ĐỐI KHÔNG có chữ, không nhãn dán, không logo, không hình mờ`,
        ai_flycam_prompt: `Đây là một bức ảnh bất động sản đã được nâng cấp. Hãy phân tích phong cách, màu sắc và nội dung của nó.
Tạo một yêu cầu cụ thể bằng tiếng Việt để MỞ RỘNG khung cảnh này thành một góc nhìn flycam/drone CAO hơn và RỘNG hơn.
Giữ nguyên phong cách. Trả về định dạng JSON: {"geometry": "Mô tả góc rộng...", "fixPrompt": "Yêu cầu mở rộng chi tiết..."}`,
        ai_sales_strategy_prompt: `Bạn là chuyên gia tư vấn BĐS. Khi nhận được Chiến thuật và Triệu chứng của khách hàng từ User, hãy tạo 1 nội dung tin nhắn để gửi cho khách hàng và đạt được mục tiêu của triệu chứng, chỉ trả về kết quả theo định dạng sau:

Chiến thuật: [1 câu mô tả hướng xử lý tâm lý]
Tin nhắn mẫu: [Nội dung tin nhắn chuyên nghiệp, có khoảng trống để sale điền thông tin nếu cần]

OUTPUT FORMAT (JSON):
{ "strategy": "...", "sample_message": "..." }`
    });
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    useEffect(() => {
        const loadSettings = async () => {
            const { data } = await supabase.from('app_settings').select('*');
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
                <div className="flex items-center gap-6">
                    <h2 className="font-black text-xl flex items-center gap-3 text-slate-800 dark:text-white">
                        <Settings size={24} className="text-blue-500" /> Cấu hình Hệ thống
                    </h2>
                </div>
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
                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <CreditCard size={14} /> Gói Premium
                    </h3>
                    <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">Giá gói / Tháng (VNĐ)</label>
                        <input
                            type="text"
                            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={settings.premium_price}
                            placeholder="499.000"
                            onChange={e => setSettings({ ...settings, premium_price: e.target.value })}
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Banknote size={14} /> Thông tin Chuyển khoản
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">Ngân hàng</label>
                            <input
                                type="text"
                                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={settings.bank_name}
                                placeholder="MB BANK"
                                onChange={e => setSettings({ ...settings, bank_name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">Số tài khoản</label>
                                <input
                                    type="text"
                                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={settings.bank_account}
                                    placeholder="0901234567"
                                    onChange={e => setSettings({ ...settings, bank_account: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">Chủ tài khoản</label>
                                <input
                                    type="text"
                                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                    value={settings.bank_owner}
                                    placeholder="NGUYEN VAN A"
                                    onChange={e => setSettings({ ...settings, bank_owner: e.target.value.toUpperCase() })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">Nội dung chuyển khoản mẫu</label>
                            <input
                                type="text"
                                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-black text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={settings.payment_note}
                                placeholder="CHOTSALE [EMAIL]"
                                onChange={e => setSettings({ ...settings, payment_note: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                    <MessageSquare size={18} className="text-gold" />
                    Cấu hình Trí tuệ Nhân tạo (AI Core)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Content Model */}
                    <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">Model: Viết Content & Đăng tin</label>
                        <select
                            className="w-full p-4 rounded-2xl border border-white/10 bg-black/40 text-slate-100 text-sm focus:ring-2 focus:ring-[#bf953f]/40 outline-none font-bold"
                            value={settings.ai_model_content || 'gemini-2.5-flash'}
                            onChange={e => setSettings({ ...settings, ai_model_content: e.target.value })}
                        >
                            <optgroup label="Thế hệ mới nhất (Khuyên dùng)">
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Nhanh, Rẻ, Thông minh)</option>
                                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Nặng, Suy luận sâu)</option>
                            </optgroup>
                            <optgroup label="Bản thử nghiệm (Experimental)">
                                <option value="gemini-2.5-pro-exp">Gemini 2.5 Pro Exp (Thử nghiệm tính năng mới)</option>
                                <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Exp 02-05</option>
                            </optgroup>
                            <optgroup label="Thế hệ 2.0 (Legacy)">
                                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                                <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                            </optgroup>
                            <optgroup label="Thế hệ 1.5 (Cũ)">
                                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                            </optgroup>
                        </select>
                    </div>

                    {/* Strategy Model */}
                    <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">Model: Quân Sư & Chốt Sale</label>
                        <select
                            className="w-full p-4 rounded-2xl border border-white/10 bg-black/40 text-slate-100 text-sm focus:ring-2 focus:ring-[#bf953f]/40 outline-none font-bold"
                            value={settings.ai_model_strategy || 'gemini-2.5-flash'}
                            onChange={e => setSettings({ ...settings, ai_model_strategy: e.target.value })}
                        >
                            <optgroup label="Thế hệ mới nhất (Khuyên dùng)">
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Nhanh, Rẻ, Thông minh)</option>
                                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Nặng, Suy luận sâu)</option>
                            </optgroup>
                            <optgroup label="Bản thử nghiệm (Experimental)">
                                <option value="gemini-2.5-pro-exp">Gemini 2.5 Pro Exp (Thử nghiệm tính năng mới)</option>
                                <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Exp 02-05</option>
                            </optgroup>
                            <optgroup label="Thế hệ 2.0 (Legacy)">
                                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                                <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                            </optgroup>
                            <optgroup label="Thế hệ 1.5 (Cũ)">
                                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                            </optgroup>
                        </select>
                    </div>

                    {/* Vision Model */}
                    <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">Model: Phân tích Ảnh Nhận dạng (Vision)</label>
                        <select
                            className="w-full p-4 rounded-2xl border border-white/10 bg-black/40 text-slate-100 text-sm focus:ring-2 focus:ring-[#bf953f]/40 outline-none font-bold"
                            value={settings.ai_model_vision || 'gemini-2.5-flash'}
                            onChange={e => setSettings({ ...settings, ai_model_vision: e.target.value })}
                        >
                            <optgroup label="Thế hệ mới nhất (Khuyên dùng)">
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Nhanh, Rẻ, Thông minh)</option>
                                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Nặng, Suy luận sâu)</option>
                            </optgroup>
                            <optgroup label="Bản thử nghiệm (Experimental)">
                                <option value="gemini-2.5-pro-exp">Gemini 2.5 Pro Exp (Thử nghiệm tính năng mới)</option>
                                <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Exp 02-05</option>
                            </optgroup>
                            <optgroup label="Thế hệ 2.0 (Legacy)">
                                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                                <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                            </optgroup>
                            <optgroup label="Thế hệ 1.5 (Cũ)">
                                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                            </optgroup>
                        </select>
                    </div>

                    {/* Lead Extraction Model */}
                    <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">Model: Trích xuất Data/SĐT Khách</label>
                        <select
                            className="w-full p-4 rounded-2xl border border-white/10 bg-black/40 text-slate-100 text-sm focus:ring-2 focus:ring-[#bf953f]/40 outline-none font-bold"
                            value={settings.ai_model_lead || 'gemini-2.5-flash'}
                            onChange={e => setSettings({ ...settings, ai_model_lead: e.target.value })}
                        >
                            <optgroup label="Thế hệ mới nhất (Khuyên dùng)">
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Nhanh, Rẻ, Thông minh)</option>
                                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Nặng, Suy luận sâu)</option>
                            </optgroup>
                            <optgroup label="Bản thử nghiệm (Experimental)">
                                <option value="gemini-2.5-pro-exp">Gemini 2.5 Pro Exp (Thử nghiệm tính năng mới)</option>
                                <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Exp 02-05</option>
                            </optgroup>
                            <optgroup label="Thế hệ 2.0 (Legacy)">
                                <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                                <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite</option>
                                <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite</option>
                            </optgroup>
                            <optgroup label="Thế hệ 1.5 (Cũ)">
                                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                            </optgroup>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">Model: Tạo & Chỉnh sửa Hình ảnh (Imagen)</label>
                    <select
                        className="w-full p-4 rounded-2xl border border-white/10 bg-black/40 text-slate-100 text-sm focus:ring-2 focus:ring-[#bf953f]/40 outline-none font-bold"
                        value={settings.ai_model_image || 'imagen-4.0-generate-001'}
                        onChange={e => setSettings({ ...settings, ai_model_image: e.target.value })}
                    >
                        <optgroup label="Phiên bản 4.0 (Hiện đại nhất)">
                            <option value="imagen-4.0-generate-001">Imagen 4.0 Generate (Chất lượng cao nhất)</option>
                            <option value="imagen-4.0-fast-generate-001">Imagen 4.0 Fast Generate (Tạo nhanh)</option>
                        </optgroup>
                        <optgroup label="Phiên bản 3.0 (Legacy)">
                            <option value="imagen-3.0-generate-001">Imagen 3.0 Generate</option>
                            <option value="imagen-3.0-fast-generate-001">Imagen 3.0 Fast Generate</option>
                        </optgroup>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-2 px-2 border-l-2 border-gold ml-1">Tính năng Gen Hình ảnh yêu cầu dùng mẫu Imagen Model chuyên biệt của Google để đảm bảo chất lượng hình ảnh vượt trội.</p>
                </div>

                <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">AI Phân tích Ảnh (Vision Analysis Prompt)</label>
                    <textarea
                        className="w-full p-4 rounded-2xl border border-white/10 bg-black/40 text-slate-100 text-sm focus:ring-2 focus:ring-[#bf953f]/40 outline-none resize-y min-h-[300px] selection:bg-[#bf953f]/30"
                        value={settings.ai_vision_prompt}
                        onChange={e => setSettings({ ...settings, ai_vision_prompt: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">AI Chỉnh Ảnh Hình/Hình (Image Edit Instruction)</label>
                    <textarea
                        className="w-full p-4 rounded-2xl border border-white/10 bg-black/40 text-slate-100 text-sm focus:ring-2 focus:ring-[#bf953f]/40 outline-none resize-y min-h-[200px] selection:bg-[#bf953f]/30"
                        value={settings.ai_edit_prompt}
                        onChange={e => setSettings({ ...settings, ai_edit_prompt: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">AI Máy Tạo Nội Dung (System Prompt)</label>
                    <textarea
                        className="w-full p-4 rounded-2xl border border-white/10 bg-black/40 text-slate-100 text-sm focus:ring-2 focus:ring-[#bf953f]/40 outline-none resize-y min-h-[250px] selection:bg-[#bf953f]/30"
                        value={settings.ai_content_generator_prompt}
                        onChange={e => setSettings({ ...settings, ai_content_generator_prompt: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">AI Tạo Ảnh (Text-to-Image Prompt Template)</label>
                    <textarea
                        className="w-full p-4 rounded-2xl border border-white/10 bg-black/40 text-slate-100 text-sm focus:ring-2 focus:ring-[#bf953f]/40 outline-none resize-y min-h-[150px] selection:bg-[#bf953f]/30"
                        value={settings.ai_image_gen_prompt}
                        placeholder="Dùng {prompt} để chèn nội dung người dùng nhập"
                        onChange={e => setSettings({ ...settings, ai_image_gen_prompt: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">AI Flycam / Mở rộng không gian (Vision Instruction)</label>
                    <textarea
                        className="w-full p-4 rounded-2xl border border-white/10 bg-black/40 text-slate-100 text-sm focus:ring-2 focus:ring-[#bf953f]/40 outline-none resize-y min-h-[150px] selection:bg-[#bf953f]/30"
                        value={settings.ai_flycam_prompt}
                        onChange={e => setSettings({ ...settings, ai_flycam_prompt: e.target.value })}
                    />
                </div>

                <div className="pt-6 border-t border-white/5">
                    <h3 className="flex items-center gap-2 text-sm font-black text-amber-400 uppercase tracking-widest mb-4">
                        <Target size={18} className="text-amber-400" />
                        Chốt Sale Hộ Bạn — Quân Sư Tác Chiến
                    </h3>
                    <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
                        Biến thể: <code className="text-amber-400/80 bg-amber-400/5 px-1.5 py-0.5 rounded">{'{SITUATION}'}</code> = tình huống card,
                        <code className="text-amber-400/80 bg-amber-400/5 px-1.5 py-0.5 rounded ml-1">{'{TAGS}'}</code> = triệu chứng đã chọn,
                        <code className="text-amber-400/80 bg-amber-400/5 px-1.5 py-0.5 rounded ml-1">{'{PROPERTY_INFO}'}</code> = thông tin BĐS
                    </p>
                    <textarea
                        className="w-full p-4 rounded-2xl border border-amber-500/20 bg-black/40 text-slate-100 text-sm focus:ring-2 focus:ring-amber-500/40 outline-none resize-y min-h-[350px] selection:bg-amber-500/30"
                        value={settings.ai_sales_strategy_prompt}
                        onChange={e => setSettings({ ...settings, ai_sales_strategy_prompt: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );
}
