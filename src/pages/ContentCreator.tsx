import React, { useState } from 'react';
import { PenTool, Copy, Check, Sparkles, Loader2, Zap, Target, MessageSquare, Megaphone, Info, FileText } from 'lucide-react';
import { generateProContentAI, checkAndDeductCredits } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const PREMADE_TEMPLATES = [
    {
        category: 'Đất Nền',
        title: 'Cắt Lỗ Đất Nền Kẹt Bank',
        content: `🚨 BÁN GẤP LÔ ĐẤT NỀN THỔ CƯ CẮT LỖ SÂU 🚨\n\n📍 Vị trí: [Điền vị trí]\n📐 Diện tích: [Điện tích]m² (Thổ cư 100%)\n💰 Giá cực sốc: Chỉ [Giá bán] (Thương lượng mạnh)\n\n⚡ Lô đất vuông vức siêu đẹp, đường ô tô tránh nhau thoải mái.\n⚡ Kẹt bank cần xả lỗ gấp 20% so với thị trường.\n⚡ Sổ hồng sẵn, sang tên công chứng ngay.\n\n📲 Liên hệ ngay: [Số điện thoại] để xem đất và chốt cọc!`
    },
    {
        category: 'Nhà Phố',
        title: 'Nhà Đẹp Dòng Tiền Tốt',
        content: `⭐ SIÊU PHẨM NHÀ ĐẸP MẶT TIỀN KINH DOANH ⭐\n\n📍 Vị trí vàng: [Vị trí]\n📐 Diện tích: [Diện tích]m² (Nở hậu tài lộc)\n💰 Giá bán: [Giá bán]\n\n💎 Nhà xây sẵn kiên cố, nội thất cao cấp xách vali vào ở.\n💎 Khu vực dân trí cao, an ninh tuyệt đối, gần trường/chợ.\n💎 Hiện đang có Hợp đồng thuê sẵn dòng tiền cực kỳ ổn định.\n\n☎️ Nhấc máy gọi ngay: [Số điện thoại] em hỗ trợ xem nhà 24/7.`
    },
    {
        category: 'Căn Hộ',
        title: 'Căn Hộ Giá Trị Thực Tế',
        content: `🏢  CĂN HỘ CAO CẤP VIEWS TRIỆU ĐÔ 🏢\n\n📍 Dự án: [Tên dự án/Vị trí]\n📐 Diện tích: [Diện tích]m² (Thiết kế thông minh)\n💰 Giá chuyển nhượng: Chỉ [Giá bán]\n\n✨ Tặng Full bộ nội thất nhập khẩu xịn xò.\n✨ View ban công siêu thoáng, đón nắng gió phong thủy vượng khí.\n✨ Tiện ích đặc quyền: Hồ bơi vô cực, Gym, BBQ ngay dưới thềm nhà.\n\n💬 Inbox em ngay để lấy mặt bằng và mã căn chi tiết.`
    },
    {
        category: 'Tương tác',
        title: 'Kéo Tương Tác Khách Hàng',
        content: `🤔 Tầm tài chính khoảng [Số tiền], anh/chị đang tìm kiếm bến đỗ an cư hay một món hời đầu tư tại khu vực [Vị trí]?\n\n👇 Comment ngay bên dưới yêu cầu của anh/chị. Em đang có 5 suất ngoại giao cực kì thơm dành riêng cho tuần này!`
    }
];

export default function ContentCreator() {
    const { profile, refreshProfile } = useAuth();
    const [tab, setTab] = useState<'create' | 'templates'>('create');
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
        const cost = 1;
        const hasCredits = await checkAndDeductCredits(cost, 'Máy tạo nội dung BĐS');
        if (!hasCredits) {
            toast.error('Bạn không đủ Xu hoặc có lỗi xảy ra.');
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

    const ChipSelect = ({ label, options, value, onChange, icon: Icon, cols }: any) => (
        <div className="space-y-1.5">
            <div className="flex justify-between items-end px-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                    {Icon && <Icon size={11} className="text-gold" />} {label}
                </label>
            </div>
            <div className={`grid ${cols ? cols : 'grid-cols-2'} gap-2`}>
                {options.map((opt: string) => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={`px-2 py-1.5 text-center rounded-xl border transition-all text-[9px] uppercase font-black tracking-widest h-8 ${value === opt
                            ? 'bg-gold/10 border-gold text-gold shadow-md'
                            : 'bg-[#212b3d] border-white/5 text-slate-300 hover:border-gold/30 hover:bg-[#2a364b]'
                            }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );

    return (
        <div className="h-full md:h-[calc(100vh-80px)] overflow-y-auto md:overflow-hidden flex flex-col">
            <div className="mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3 px-1 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] via-[#fcf6ba] to-[#aa771c] rounded-xl flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(191,149,63,0.4)] transform rotate-3 shrink-0">
                        <PenTool className="text-black" size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-white tracking-widest leading-none uppercase italic">CONTENT <span className="text-gold">BĐS</span></h1>
                        <p className="text-[8px] font-black text-slate-400 tracking-[0.4em] uppercase mt-1">AI Copywriting Engine</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 p-1 rounded-xl w-fit gap-1 border border-white/10 shadow-lg">
                    {[
                        { id: 'create', label: 'Máy Tạo AI', icon: Sparkles },
                        { id: 'templates', label: 'Mẫu Cực Phẩm', icon: FileText }
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id as any)}
                            className={`py-1.5 px-4 rounded-lg font-black text-[9px] flex items-center gap-2 transition-all uppercase tracking-widest ${tab === t.id ? 'bg-gold text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
                        >
                            <t.icon size={12} strokeWidth={3} /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {tab === 'create' ? (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start animate-in fade-in zoom-in-95 duration-500 flex-1 md:overflow-hidden">
                    {/* SETTINGS AREA */}
                    <div className="xl:col-span-5 flex flex-col md:h-full md:overflow-y-auto no-scrollbar pb-6">
                        <div className="bg-[#1a2332] p-5 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden space-y-4">
                            {/* Thông số BĐS */}
                            <div className="space-y-3 relative z-10">
                                <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2 pb-1.5 border-b border-white/5 mb-2">
                                    <Info size={12} strokeWidth={3} /> 1. Thông số
                                </h3>

                                <ChipSelect
                                    label="Loại hình"
                                    cols="grid-cols-3 md:grid-cols-5"
                                    options={['Đất nền', 'Nhà phố', 'Căn hộ', 'Biệt thự', 'Kho xưởng']}
                                    value={formData.type}
                                    onChange={(val: string) => setFormData({ ...formData, type: val })}
                                />

                                <div className="space-y-2">
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Vị trí</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 h-9 rounded-xl border border-white/5 bg-[#212b3d] text-white outline-none focus:border-gold/50 focus:bg-[#2a364b] font-bold text-xs font-sans tracking-wide transition-all"
                                            placeholder="Phường, Quận..."
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Diện tích</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 h-9 rounded-xl border border-white/5 bg-[#212b3d] text-white outline-none focus:border-gold/50 focus:bg-[#2a364b] font-bold text-xs font-sans tracking-wide transition-all"
                                                placeholder="50m2"
                                                value={formData.area}
                                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Giá bán</label>
                                            <input
                                                type="text"
                                                className="w-full px-3 py-2 h-9 rounded-xl border border-white/5 bg-[#212b3d] text-white outline-none focus:border-gold/50 focus:bg-[#2a364b] font-bold text-xs font-sans tracking-wide transition-all"
                                                placeholder="4.5 Tỷ"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <ChipSelect
                                    label="Pháp lý"
                                    cols="grid-cols-2 md:grid-cols-4"
                                    options={['Sổ hồng riêng', 'Đang chờ sổ', 'Hợp đồng MB', 'Giấy tay']}
                                    value={formData.legal}
                                    onChange={(val: string) => setFormData({ ...formData, legal: val })}
                                />
                            </div>

                            {/* Chiến lược */}
                            <div className="space-y-3 pt-1 mt-1 border-t border-white/5 relative z-10">
                                <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2 pb-1.5 border-b border-white/5 mb-2">
                                    <Target size={12} strokeWidth={3} /> 2. Nhắm Mục Tiêu
                                </h3>

                                <div className="grid grid-cols-3 gap-3">
                                    <ChipSelect
                                        label="Khán giả"
                                        cols="grid-cols-1"
                                        options={['Đầu tư', 'Để ở']}
                                        value={formData.purpose}
                                        onChange={(val: any) => setFormData({ ...formData, purpose: val })}
                                    />
                                    <div className="col-span-2">
                                        <ChipSelect
                                            label="Phong cách"
                                            cols="grid-cols-3"
                                            icon={MessageSquare}
                                            options={['Gây Shock', 'Chuyên nghiệp', 'Kể chuyện']}
                                            value={formData.style}
                                            onChange={(val: string) => setFormData({ ...formData, style: val })}
                                        />
                                    </div>
                                </div>

                                <ChipSelect
                                    label="Nền tảng đăng bài"
                                    icon={Megaphone}
                                    cols="grid-cols-3"
                                    options={['Quảng cáo FB', 'Zalo cá nhân', 'Tin rao BĐS']}
                                    value={formData.channel}
                                    onChange={(val: string) => setFormData({ ...formData, channel: val })}
                                />
                            </div>

                            <button
                                onClick={handleAiGenerate}
                                disabled={isGenerating}
                                className="w-full mt-3 py-3 bg-gradient-to-r from-gold to-[#aa771c] text-black rounded-xl font-black text-[11px] tracking-[0.2em] shadow-xl shadow-gold/20 flex justify-center items-center gap-2 uppercase hover:scale-[1.02] transition-all disabled:opacity-50 border border-white/20 relative overflow-hidden group"
                            >
                                {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" className="group-hover:rotate-12 transition-transform" />}
                                {isGenerating ? 'AI BIÊN TẬP...' : 'TẠO BÀI VIẾT'}
                            </button>
                        </div>
                    </div>

                    {/* RESULTS AREA */}
                    <div className="xl:col-span-7 flex flex-col md:h-full md:overflow-y-auto no-scrollbar pb-6 space-y-4">
                        {results ? (
                            <div className="grid grid-cols-1 gap-4">
                                {/* Option A */}
                                <div className="glass-card bg-[#1a2332] border-gold/20 p-5 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                        <Zap size={100} fill="currentColor" className="text-gold" />
                                    </div>
                                    <div className="flex justify-between items-center mb-3 relative z-10 border-b border-white/5 pb-2.5">
                                        <span className="text-[9px] font-black text-gold bg-gold/10 px-3 py-1 rounded-full uppercase tracking-widest border border-gold/20">A. The Number-Hook</span>
                                        <button
                                            onClick={() => copyToClipboard(results.content_a, 'a')}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all uppercase ${copiedKey === 'a' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'}`}
                                        >
                                            {copiedKey === 'a' ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
                                            {copiedKey === 'a' ? 'Đã Copy' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className="whitespace-pre-wrap text-slate-300 text-xs leading-relaxed font-medium relative z-10">
                                        {results.content_a}
                                    </div>
                                </div>

                                {/* Option B */}
                                <div className="glass-card bg-[#1a2332] border-white/10 p-5 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                                        <Sparkles size={100} fill="currentColor" className="text-white" />
                                    </div>
                                    <div className="flex justify-between items-center mb-3 relative z-10 border-b border-white/5 pb-2.5">
                                        <span className="text-[9px] font-black text-slate-300 bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">B. The Emotion-Hook</span>
                                        <button
                                            onClick={() => copyToClipboard(results.content_b, 'b')}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all uppercase ${copiedKey === 'b' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'}`}
                                        >
                                            {copiedKey === 'b' ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
                                            {copiedKey === 'b' ? 'Đã Copy' : 'Copy'}
                                        </button>
                                    </div>
                                    <div className="whitespace-pre-wrap text-slate-300 text-xs leading-relaxed font-medium relative z-10">
                                        {results.content_b}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-[#1a2332] rounded-[2rem] border-2 border-dashed border-white/5 text-center px-10">
                                <div className="w-16 h-16 bg-gold/5 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(191,149,63,0.1)]">
                                    <Sparkles size={28} className="text-gold opacity-50" />
                                </div>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Chờ Lệnh Biên Tập</h3>
                                <p className="text-[10px] text-slate-500 font-bold max-w-xs">Nhập thông số và bấm TẠO BÀI VIẾT để AI xuất bản 2 phương án chốt sale thần tốc.</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {PREMADE_TEMPLATES.map((item, idx) => (
                        <div key={idx} className="glass-card bg-[#1a2332] border-white/10 p-5 rounded-[2rem] shadow-xl hover:border-gold/30 transition-all group flex flex-col">
                            <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-3">
                                <div>
                                    <span className="text-[8px] font-black text-gold uppercase tracking-widest">{item.category}</span>
                                    <h3 className="text-sm font-black text-white uppercase tracking-tight leading-tight mt-1">{item.title}</h3>
                                </div>
                                <button
                                    onClick={() => copyToClipboard(item.content, `template-${idx}`)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all uppercase shrink-0 ${copiedKey === `template-${idx}` ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-gold/50'}`}
                                >
                                    {copiedKey === `template-${idx}` ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
                                    {copiedKey === `template-${idx}` ? 'Đã Copy' : 'Dùng Mẫu'}
                                </button>
                            </div>
                            <div className="whitespace-pre-wrap text-slate-300 text-xs leading-relaxed font-medium bg-white/5 p-4 rounded-xl border border-white/5 flex-grow">
                                {item.content}
                            </div>
                        </div>
                    ))}
                </div>
            )}



        </div>
    );
}
