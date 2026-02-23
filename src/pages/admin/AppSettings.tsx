import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Settings, Save, Loader2, CheckCircle2, CreditCard, Banknote, MessageSquare, Library, Trash2, Plus, Sparkles } from 'lucide-react';

export default function AppSettings() {
    const [settings, setSettings] = useState<Record<string, string>>({
        premium_price: '499.000',
        bank_name: 'MB BANK',
        bank_account: '0901234567',
        bank_owner: 'NGUYEN VAN A',
        payment_note: 'HOMESPRO [EMAIL]',

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
}`
    });
    const [prompts, setPrompts] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [activeTab, setActiveTab] = useState<'config' | 'prompts'>('config');

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

        const loadPrompts = async () => {
            const { data } = await supabase.from('ai_prompts').select('*').order('created_at', { ascending: false });
            if (data) setPrompts(data);
        };

        loadSettings();
        loadPrompts();
    }, []);

    const handleDeletePrompt = async (id: string) => {
        if (!window.confirm('Bạn có chắc muốn xóa prompt này?')) return;
        const { error } = await supabase.from('ai_prompts').delete().eq('id', id);
        if (!error) {
            setPrompts(prompts.filter(p => p.id !== id));
        }
    };

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
                    <button
                        onClick={() => setActiveTab('config')}
                        className={`font-black text-xl flex items-center gap-3 transition-colors ${activeTab === 'config' ? 'text-blue-600' : 'text-slate-400'}`}
                    >
                        <Settings size={24} /> Cấu hình Hệ thống
                    </button>
                    <button
                        onClick={() => setActiveTab('prompts')}
                        className={`font-black text-xl flex items-center gap-3 transition-colors ${activeTab === 'prompts' ? 'text-purple-600' : 'text-slate-400'}`}
                    >
                        <Library size={24} /> Thư viện Prompt
                    </button>
                </div>
                {activeTab === 'config' && (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        LƯU CẤU HÌNH
                    </button>
                )}
            </div>

            {activeTab === 'config' ? (
                <>
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
                                        placeholder="HOMESPRO [EMAIL]"
                                        onChange={e => setSettings({ ...settings, payment_note: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                        <h3 className="flex items-center gap-2 text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                            <MessageSquare size={18} className="text-purple-500" />
                            Cấu hình Kịch bản AI (System Prompts)
                        </h3>



                        <div>
                            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">AI Phân tích Ảnh (Vision Analysis Prompt)</label>
                            <textarea
                                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[300px]"
                                value={settings.ai_vision_prompt}
                                onChange={e => setSettings({ ...settings, ai_vision_prompt: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">AI Chỉnh Ảnh Hình/Hình (Image Edit Instruction)</label>
                            <textarea
                                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[200px]"
                                value={settings.ai_edit_prompt}
                                onChange={e => setSettings({ ...settings, ai_edit_prompt: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase ml-1">AI Máy Tạo Nội Dung (System Prompt)</label>
                            <textarea
                                className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[250px]"
                                value={settings.ai_content_generator_prompt}
                                onChange={e => setSettings({ ...settings, ai_content_generator_prompt: e.target.value })}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-slate-500 text-sm">Quản lý các mẫu prompt hiệu quả cao để huấn luyện AI.</p>
                    </div>

                    {prompts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {prompts.map((p) => (
                                <div key={p.id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[24px] border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full mb-2 inline-block">
                                                {p.category || 'GENERAL'}
                                            </span>
                                            <h4 className="font-bold text-slate-800 dark:text-white uppercase">{p.name}</h4>
                                        </div>
                                        <button
                                            onClick={() => handleDeletePrompt(p.id)}
                                            className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                        {p.prompt_text}
                                    </div>
                                    <div className="mt-4 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                                        <span>Ngày tạo: {new Date(p.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border-2 border-dashed border-slate-200">
                            <Plus size={48} className="mx-auto mb-4 text-slate-300" />
                            <h3 className="font-bold text-slate-800">Chưa có prompt mẫu nào</h3>
                            <p className="text-slate-500 text-sm">Các prompt sếp lưu từ màn hình AI sẽ xuất hiện tại đây.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
