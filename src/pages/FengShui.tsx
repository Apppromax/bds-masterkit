import React, { useState } from 'react';
import { Compass, User, Sparkles, Loader2, Zap, Palette, Ruler, Home, AlertTriangle, CheckCircle, Heart, Hash, Briefcase, ChevronDown, ChevronUp, Star, Shield, Flame, Droplets, TreePine, Mountain, Wind } from 'lucide-react';
import { calculateFengShui, checkAgeBuilding, checkLuBan, getColors, calculateCouple, getLuckyNumbers, getDeskDirection, getNguHanhRelation, calculateNapAm, type Gender, type Menh, type FengShuiResult, type DirectionDetail, type CoupleResult } from '../services/fengShui';
import { generateContentWithAI } from '../services/aiService';
import { useCreditGate } from '../hooks/useCreditGate';
import { CreditGateModal } from '../components/CreditGateModal';
import { useAuth } from '../contexts/AuthContext';
import CompassLuopan from '../components/FengShui/CompassLuopan';

type TabId = 'battrach' | 'compass' | 'tuoilamnha' | 'luban' | 'couple' | 'lucky';

const MENH_ICONS: Record<Menh, React.ReactNode> = {
    Kim: <Shield size={16} className="text-slate-300" />,
    Mộc: <TreePine size={16} className="text-green-400" />,
    Thủy: <Droplets size={16} className="text-blue-400" />,
    Hỏa: <Flame size={16} className="text-red-400" />,
    Thổ: <Mountain size={16} className="text-amber-400" />,
};

const MENH_COLORS: Record<Menh, string> = {
    Kim: 'from-slate-300 to-slate-500',
    Mộc: 'from-green-400 to-emerald-600',
    Thủy: 'from-blue-400 to-cyan-600',
    Hỏa: 'from-red-400 to-orange-600',
    Thổ: 'from-amber-400 to-yellow-700',
};

// Ngũ Hành Wheel Component
function NguHanhWheel({ menh }: { menh: Menh }) {
    const elements: { name: Menh; emoji: string; color: string; pos: string }[] = [
        { name: 'Kim', emoji: '⚱️', color: 'text-slate-300 border-slate-500', pos: 'top-0 left-1/2 -translate-x-1/2' },
        { name: 'Thủy', emoji: '💧', color: 'text-blue-400 border-blue-500', pos: 'top-1/2 right-0 -translate-y-1/2' },
        { name: 'Mộc', emoji: '🌳', color: 'text-green-400 border-green-500', pos: 'bottom-0 right-1/4' },
        { name: 'Hỏa', emoji: '🔥', color: 'text-red-400 border-red-500', pos: 'bottom-0 left-1/4' },
        { name: 'Thổ', emoji: '⛰️', color: 'text-amber-400 border-amber-500', pos: 'top-1/2 left-0 -translate-y-1/2' },
    ];
    return (
        <div className="relative w-48 h-48 mx-auto my-4">
            <div className="absolute inset-6 rounded-full border-2 border-dashed border-gold/20" />
            <div className="absolute inset-0 rounded-full">
                {elements.map((el) => (
                    <div key={el.name} className={`absolute ${el.pos} flex flex-col items-center`}>
                        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg ${el.color} ${el.name === menh ? 'bg-gold/20 scale-125 shadow-lg shadow-gold/30 ring-2 ring-gold' : 'bg-white/5'} transition-all`}>
                            {el.emoji}
                        </div>
                        <span className={`text-[8px] font-black uppercase mt-1 ${el.name === menh ? 'text-gold' : 'text-slate-600'}`}>{el.name}</span>
                    </div>
                ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[7px] text-slate-600 uppercase font-black tracking-widest">Mệnh</p>
                    <p className="text-lg font-black text-gold">{menh}</p>
                </div>
            </div>
        </div>
    );
}

// Direction Card Component
function DirectionCard({ d, compact }: { d: DirectionDetail; compact?: boolean }) {
    const [open, setOpen] = useState(false);
    return (
        <div
            className={`p-3 rounded-xl border transition-all cursor-pointer ${d.isGood ? 'bg-gold/5 border-gold/20 hover:border-gold/40' : 'bg-red-500/5 border-red-500/10 hover:border-red-500/30'}`}
            onClick={() => setOpen(!open)}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${d.isGood ? 'bg-gold/20 text-gold' : 'bg-red-500/20 text-red-400'}`}>
                        {d.isGood ? '✓' : '✕'}
                    </div>
                    <div>
                        <p className={`text-xs font-black ${d.isGood ? 'text-gold' : 'text-red-400'}`}>{d.dir}</p>
                        <p className={`text-[9px] font-bold ${d.isGood ? 'text-gold/60' : 'text-red-400/60'}`}>{d.star}</p>
                    </div>
                </div>
                {!compact && (open ? <ChevronUp size={12} className="text-slate-600" /> : <ChevronDown size={12} className="text-slate-600" />)}
            </div>
            {open && !compact && (
                <div className="mt-2 pt-2 border-t border-white/5 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    <p className="text-[10px] text-slate-400">{d.description}</p>
                    <p className="text-[9px] text-slate-500 italic">💡 {d.usage}</p>
                </div>
            )}
        </div>
    );
}

export default function FengShui() {
    const { profile, refreshProfile } = useAuth();
    const { gateState, dismissGate, attemptAction } = useCreditGate();
    const [tab, setTab] = useState<TabId>('battrach');

    // Bat Trach
    const [year, setYear] = useState<number>(1990);
    const [gender, setGender] = useState<Gender>('male');
    const [result, setResult] = useState<FengShuiResult | null>(null);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    // Tuoi Lam Nha
    const [buildYear, setBuildYear] = useState<number>(new Date().getFullYear());
    const [ageCheckResult, setAgeCheckResult] = useState<ReturnType<typeof checkAgeBuilding> | null>(null);

    // Lu Ban
    const [lubanSize, setLubanSize] = useState<number>(0);
    const [lubanResult, setLubanResult] = useState<ReturnType<typeof checkLuBan> | null>(null);

    // Couple
    const [year2, setYear2] = useState<number>(1992);
    const [gender2, setGender2] = useState<Gender>('female');
    const [coupleResult, setCoupleResult] = useState<CoupleResult | null>(null);

    // Handlers
    const handleCalculate = () => {
        if (year < 1900 || year > 2100) return;
        setResult(calculateFengShui(year, gender));
        setAiInsight(null);
    };

    const handleCheckAge = () => {
        if (year < 1900 || year > 2100) return;
        setAgeCheckResult(checkAgeBuilding(year, buildYear));
    };

    const handleCheckLuBan = (val: number) => {
        setLubanSize(val);
        setLubanResult(checkLuBan(val));
    };

    const handleCouple = () => {
        setCoupleResult(calculateCouple(year, gender, year2, gender2));
    };

    const handleAiConsult = async () => {
        if (!result) return;
        const cost = 2;
        const hasCredits = await attemptAction(cost, 'Thầy Phong Thuỷ AI');
        if (!hasCredits.success) return;

        setIsGeneratingAI(true);
        const sinhKhi = result.tot.find(d => d.star === 'Sinh Khí');
        const tuyetMenh = result.xau.find(d => d.star === 'Tuyệt Mệnh');
        const napAm = result.napAm;
        const desk = getDeskDirection(result);
        const lucky = getLuckyNumbers(result.menh);

        const prompt = `Bạn là BẬC THẦY Phong Thủy hàng đầu Việt Nam, kiến thức sâu rộng về Dịch Lý, Bát Trạch, Huyền Không Phi Tinh.

GIA CHỦ: Sinh năm ${year} (${napAm.canChi} - ${napAm.napAm}), ${gender === 'male' ? 'Nam' : 'Nữ'}, tuổi ${napAm.conGiap} ${napAm.conGiapEmoji}
CUNG: ${result.cung} | NHÓM: ${result.nhom} | MỆNH NẠP ÂM: ${napAm.menh} (${napAm.napAm})

HƯỚNG TỐT NHẤT: ${sinhKhi?.dir} (${sinhKhi?.star})
HƯỚNG XẤU NHẤT: ${tuyetMenh?.dir} (${tuyetMenh?.star})
SỐ MAY MẮN: ${lucky.luckyDigits.join(', ')}
HƯỚNG BÀN: ${desk.primary.dir}

Hãy tư vấn CHUYÊN SÂU (viết ngắn gọn, chia mục rõ ràng, dùng emoji):
1. 🏠 Phân tích tổng quan cung mệnh + điểm mạnh/yếu
2. 🔮 Vật phẩm phong thủy CHI TIẾT kích tài lộc (nêu cụ thể vật phẩm, chất liệu, vị trí đặt)
3. ⚡ Cách hóa giải nếu lỡ mua nhà hướng ${tuyetMenh?.dir} (Tuyệt Mệnh)
4. 📅 Tháng tốt nhất trong năm ${new Date().getFullYear()} để ký hợp đồng BĐS, động thổ
5. 💼 Hướng bàn làm việc tối ưu cho sự nghiệp BĐS`;

        try {
            const insight = await generateContentWithAI(prompt);
            setAiInsight(insight);
            if (refreshProfile) await refreshProfile();
        } catch { /* silent */ } finally {
            setIsGeneratingAI(false);
        }
    };

    const TABS: { id: TabId; label: string; icon: any }[] = [
        { id: 'battrach', label: 'Bát Trạch', icon: Compass },
        { id: 'compass', label: 'La Bàn', icon: Sparkles },
        { id: 'tuoilamnha', label: 'Xem Tuổi', icon: Home },
        { id: 'luban', label: 'Lỗ Ban', icon: Ruler },
        { id: 'couple', label: 'Vợ Chồng', icon: Heart },
        { id: 'lucky', label: 'Số May', icon: Hash },
    ];

    return (
        <div className="max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar scroll-smooth pb-4">
            <CreditGateModal state={gateState} onDismiss={dismissGate} />

            {/* Header */}
            <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#bf953f] to-[#aa771c] rounded-xl flex items-center justify-center shadow-lg transform rotate-3 transition-transform group-hover:rotate-6 group-hover:scale-110">
                        <Compass className="text-black" size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-white leading-none tracking-widest transition-colors duration-300 group-hover:text-amber-100 uppercase">
                            PHONG THỦY <span className="text-gold">ELITE</span>
                        </h1>
                        <span className="text-[9px] font-black text-[#bf953f] tracking-[0.2em] uppercase">Bát Trạch · Nạp Âm · Ngũ Hành</span>
                    </div>
                </div>

                {/* Tabs - Scrollable */}
                <div className="flex bg-white/5 p-1 rounded-xl w-full md:w-fit gap-1 border border-white/10 shadow-lg overflow-x-auto no-scrollbar">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`py-1.5 px-3 rounded-lg font-black text-[8px] flex items-center gap-1.5 transition-all uppercase tracking-widest whitespace-nowrap shrink-0 ${tab === t.id ? 'bg-gold text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
                        >
                            <t.icon size={11} strokeWidth={3} /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="animate-in fade-in zoom-in duration-500">
                {/* ========== TAB: BÁT TRẠCH ========== */}
                {tab === 'battrach' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        {/* Input */}
                        <div className="lg:col-span-4 space-y-3">
                            <div className="glass-card bg-[#080808] border-white/10 p-5 rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,1)]">
                                <h3 className="text-[9px] font-black text-gold uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><User size={12} /> Gia Chủ</h3>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Năm sinh (Dương lịch)</label>
                                        <input type="number" value={year} onChange={e => setYear(Number(e.target.value))}
                                            className="w-full p-2.5 bg-white/5 rounded-xl border border-white/10 outline-none font-black text-center text-lg text-gold focus:border-gold/40 transition-all" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Giới tính</label>
                                        <div className="flex bg-white/5 rounded-xl p-1 gap-1 border border-white/5">
                                            <button onClick={() => setGender('male')} className={`flex-1 py-2 rounded-lg font-black text-[9px] uppercase transition-all ${gender === 'male' ? 'bg-gold text-black shadow-lg' : 'text-slate-500'}`}>Nam</button>
                                            <button onClick={() => setGender('female')} className={`flex-1 py-2 rounded-lg font-black text-[9px] uppercase transition-all ${gender === 'female' ? 'bg-gold text-black shadow-lg' : 'text-slate-500'}`}>Nữ</button>
                                        </div>
                                    </div>
                                    <button onClick={handleCalculate} className="w-full py-3 bg-gradient-to-r from-[#bf953f] to-[#aa771c] text-black rounded-xl font-black text-[9px] tracking-[0.2em] shadow-lg hover:scale-[1.02] transition-all mt-1 border border-white/10">
                                        PHÂN TÍCH NGAY
                                    </button>
                                </div>
                            </div>

                            {/* Nạp Âm + Colors */}
                            {result && (
                                <>
                                    <div className="glass-card bg-[#080808] border-gold/20 p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
                                        <h3 className="text-[9px] font-black text-gold uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Star size={12} /> Nạp Âm Ngũ Hành
                                        </h3>
                                        <div className="text-center p-3 bg-white/5 rounded-xl border border-white/5">
                                            <p className="text-2xl mb-1">{result.napAm.conGiapEmoji}</p>
                                            <p className="text-xs font-black text-white">{result.napAm.canChi}</p>
                                            <p className="text-[10px] font-bold text-gold mt-0.5">{result.napAm.napAm}</p>
                                            <p className="text-[8px] text-slate-500 mt-0.5">Tuổi {result.napAm.conGiap} · Mệnh {result.napAm.menh}</p>
                                        </div>
                                        <NguHanhWheel menh={result.menh} />
                                    </div>

                                    <div className="glass-card bg-[#080808] border-gold/20 p-4 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
                                        <h3 className="text-[9px] font-black text-gold uppercase tracking-widest mb-3 flex items-center gap-2"><Palette size={12} /> Màu Sắc Hợp Mệnh</h3>
                                        <div className="space-y-2">
                                            <div className="p-3 bg-gold/5 rounded-xl border border-gold/10">
                                                <span className="text-[7px] font-black text-gold/60 uppercase block mb-1.5 tracking-widest">Tương Sinh ✓</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {getColors(result.menh).hop.map(c => (
                                                        <div key={c.name} className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                                                            <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                                                            <span className="text-[9px] font-bold text-white">{c.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                                                <span className="text-[7px] font-black text-red-500/60 uppercase block mb-1.5 tracking-widest">Tương Khắc ✕</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {getColors(result.menh).ky.map(c => (
                                                        <div key={c.name} className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                                                            <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                                                            <span className="text-[9px] font-bold text-white/50">{c.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Result Area */}
                        <div className="lg:col-span-8 space-y-4">
                            {result ? (
                                <>
                                    {/* Cung Mệnh Hero */}
                                    <div className="glass-card bg-gradient-to-br from-[#0c0c0c] to-black border-gold/30 rounded-[2rem] p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,1)] relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700">
                                            <Compass size={160} strokeWidth={1} className="text-gold" />
                                        </div>
                                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                                            <div className="text-center md:text-left flex-1">
                                                <p className="text-gold uppercase text-[8px] font-black tracking-[0.4em] mb-1">Cung Mệnh · {result.nhom}</p>
                                                <h2 className="text-4xl font-black mb-1 tracking-tighter italic text-gold">{result.cung}</h2>
                                                <p className="text-[10px] text-slate-400">{result.napAm.canChi} · {result.napAm.napAm} · Tuổi {result.napAm.conGiap} {result.napAm.conGiapEmoji}</p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
                                                <div className="bg-white/5 py-3 px-4 rounded-xl border border-white/10 text-center shadow-lg">
                                                    <p className="text-[7px] uppercase text-gold font-black tracking-widest mb-0.5 opacity-60">Sinh Khí</p>
                                                    <p className="font-black text-base text-white">{result.tot.find(d => d.star === 'Sinh Khí')?.dir}</p>
                                                </div>
                                                <div className="bg-white/5 py-3 px-4 rounded-xl border border-white/10 text-center shadow-lg">
                                                    <p className="text-[7px] uppercase text-gold font-black tracking-widest mb-0.5 opacity-60">Bản Mệnh</p>
                                                    <p className="font-black text-base text-white flex items-center justify-center gap-1">{MENH_ICONS[result.menh]} {result.menh}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desk Direction Quick Tip */}
                                    {(() => { const desk = getDeskDirection(result); return (
                                        <div className="glass-card bg-[#080808] border-white/5 p-4 rounded-xl flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center shrink-0"><Briefcase size={18} className="text-gold" /></div>
                                            <div>
                                                <p className="text-[8px] font-black text-gold uppercase tracking-widest">Hướng Bàn Làm Việc</p>
                                                <p className="text-[10px] text-slate-300 mt-0.5">{desk.advice}</p>
                                            </div>
                                        </div>
                                    ); })()}

                                    {/* 8 Directions Grid */}
                                    <div className="space-y-3">
                                        <h3 className="text-[9px] font-black text-gold uppercase tracking-widest flex items-center gap-2 px-1">
                                            <CheckCircle size={12} /> 4 Hướng Cát (Tốt)
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {result.tot.map(d => <DirectionCard key={d.dir} d={d} />)}
                                        </div>
                                        <h3 className="text-[9px] font-black text-red-400/80 uppercase tracking-widest flex items-center gap-2 px-1 mt-3">
                                            <AlertTriangle size={12} /> 4 Hướng Hung (Xấu)
                                        </h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {result.xau.map(d => <DirectionCard key={d.dir} d={d} />)}
                                        </div>
                                    </div>

                                    {/* AI Insight */}
                                    <div className="glass-card bg-[#080808] border-white/5 p-5 rounded-2xl relative overflow-hidden shadow-2xl">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-transparent" />
                                        <h3 className="font-black text-white text-[9px] mb-3 flex items-center gap-2 uppercase tracking-widest relative z-10">
                                            <Sparkles className="text-gold" size={14} /> Thầy Phong Thủy AI (Tư Vấn Chuyên Sâu)
                                        </h3>
                                        {aiInsight ? (
                                            <div className="relative z-10 prose prose-invert prose-sm max-w-none">
                                                <div className="whitespace-pre-wrap text-slate-300 leading-relaxed text-xs">{aiInsight}</div>
                                            </div>
                                        ) : (
                                            <button onClick={handleAiConsult} disabled={isGeneratingAI}
                                                className="relative z-10 w-full py-3.5 bg-white/5 hover:bg-gold/10 border border-gold/20 rounded-xl font-black text-[9px] transition-all flex justify-center items-center gap-2 uppercase tracking-[0.2em] text-gold">
                                                {isGeneratingAI ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} strokeWidth={3} />}
                                                {isGeneratingAI ? 'AI Đang Luận Giải...' : 'Lấy Tư Vấn Bậc Thầy (-2 XU)'}
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-[#080808] rounded-[2rem] border-2 border-dashed border-white/5 text-slate-700">
                                    <Compass size={40} className="text-gold/20 mb-4" />
                                    <h3 className="text-[8px] font-black uppercase tracking-[0.4em]">Nhập năm sinh để phân tích</h3>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ========== TAB: LA BÀN ========== */}
                {tab === 'compass' && (
                    <div className="max-w-xl mx-auto space-y-5 animate-in fade-in slide-in-from-top-2">
                        <div className="glass-card bg-[#080808] border-white/10 p-5 rounded-[2.5rem] shadow-2xl mb-4">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="space-y-1 w-full flex-1">
                                    <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Nhập Năm Sinh Tự Động Luận Giải</label>
                                    <div className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                        <input type="number" value={year} onChange={e => { setYear(Number(e.target.value)); }}
                                            className="w-full p-3 bg-transparent outline-none font-black text-center text-sm text-gold border-r border-white/10" />
                                        <select value={gender} onChange={e => setGender(e.target.value as Gender)}
                                            className="p-3 bg-transparent outline-none font-black text-xs text-slate-300 appearance-none text-center min-w-[80px]">
                                            <option value="male" className="bg-black">Nam</option>
                                            <option value="female" className="bg-black">Nữ</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex-1 flex items-center justify-end">
                                    {result ? (
                                        <div className="px-4 py-2 border border-gold/30 bg-gold/10 rounded-xl text-right">
                                            <p className="text-[8px] font-black uppercase text-gold/60 tracking-[0.2em]">{result.nhom}</p>
                                            <h4 className="text-xl font-black text-gold uppercase italic">{result.cung}</h4>
                                        </div>
                                    ) : (
                                        <button onClick={handleCalculate} className="py-3 px-6 bg-gold text-black rounded-xl font-black text-[9px] uppercase shadow-lg shadow-gold/20">Cập nhật Mệnh Cung</button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <CompassLuopan userKua={result?.cung.split(' ')[0]} userGroup={result?.nhom} />
                    </div>
                )}

                {/* ========== TAB: XEM TUỔI ========== */}
                {tab === 'tuoilamnha' && (
                    <div className="max-w-2xl mx-auto space-y-4">
                        <div className="glass-card bg-[#080808] border-white/10 p-6 rounded-[2rem] shadow-2xl">
                            <h2 className="text-center font-black text-lg text-white uppercase tracking-tighter mb-5">Phối Hợp <span className="text-gold italic pr-1">Động Thổ</span></h2>
                            <div className="grid grid-cols-2 gap-3 mb-5">
                                <div className="space-y-1">
                                    <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Sinh Năm</label>
                                    <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-full p-3 bg-white/5 rounded-xl border border-white/10 font-black text-base text-white text-center focus:border-gold/40 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Dự Kiến Xây / Mua</label>
                                    <input type="number" value={buildYear} onChange={e => setBuildYear(Number(e.target.value))} className="w-full p-3 bg-white/5 rounded-xl border border-white/10 font-black text-base text-gold text-center focus:border-gold/40 outline-none" />
                                </div>
                            </div>
                            <button onClick={handleCheckAge} className="w-full py-3.5 bg-gold text-black rounded-xl font-black text-[10px] tracking-[0.3em] shadow-xl shadow-gold/10 hover:scale-[1.02] transition-all border border-white/20">XEM KẾT QUẢ</button>

                            {ageCheckResult && (
                                <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className={`p-5 rounded-[1.5rem] text-center border-2 shadow-2xl ${ageCheckResult.conclusion === 'Tốt' ? 'bg-gold/10 border-gold/30' : 'bg-red-500/10 border-red-500/20'}`}>
                                        <p className="uppercase text-[7px] font-black tracking-[0.4em] mb-1 text-slate-500">Kết luận · Tuổi mụ: {ageCheckResult.age}</p>
                                        <h3 className={`text-4xl font-black mb-2 italic tracking-tighter ${ageCheckResult.conclusion === 'Tốt' ? 'text-gold' : 'text-red-500'}`}>{ageCheckResult.conclusion.toUpperCase()}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 max-w-md mx-auto leading-relaxed">{ageCheckResult.yearAdvice}</p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { label: 'Kim Lâu', status: ageCheckResult.kimLau },
                                            { label: 'Hoang Ốc', status: ageCheckResult.hoangOc },
                                            { label: 'Tam Tai', status: ageCheckResult.tamTai }
                                        ].map(item => (
                                            <div key={item.label} className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center">
                                                <span className="text-[7px] font-black text-slate-600 uppercase mb-1">{item.label}</span>
                                                <span className={`text-[9px] font-black uppercase ${item.status ? 'text-red-500' : 'text-green-500'}`}>{item.status ? '⚠️ Phạm' : '✅ Tốt'}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {ageCheckResult.details.length > 0 && (
                                        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 space-y-1">
                                            {ageCheckResult.details.map((d, i) => (
                                                <p key={i} className="text-[10px] text-red-300/80 font-medium">{d}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ========== TAB: LỖ BAN ========== */}
                {tab === 'luban' && (
                    <div className="max-w-xl mx-auto space-y-5">
                        <div className="glass-card bg-[#080808] border-white/10 p-7 rounded-[2.5rem] shadow-2xl text-center">
                            <div className="mb-6">
                                <h2 className="font-black text-lg text-white uppercase tracking-tighter">Thước Lỗ Ban <span className="text-gold">52.2cm</span></h2>
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Thông thủy cửa đi & cửa sổ</p>
                            </div>
                            <div className="mb-8 space-y-4">
                                <div className="relative">
                                    <input type="number" className="w-full py-6 text-center text-5xl font-black bg-white/5 rounded-3xl border-2 border-transparent focus:border-gold/30 outline-none text-gold tracking-tight"
                                        placeholder="0" value={lubanSize} onChange={(e) => handleCheckLuBan(Number(e.target.value))} />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 font-black italic">CM</span>
                                </div>
                                <input type="range" min="0" max="500" value={lubanSize} onChange={(e) => handleCheckLuBan(Number(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold" />
                            </div>
                            {lubanResult && (
                                <div className={`p-6 rounded-3xl animate-in zoom-in-95 ${lubanResult.status === 'Tốt' ? 'bg-gold text-black shadow-2xl shadow-gold/20 scale-105' : 'bg-white/5 text-slate-600 border border-white/5'}`}>
                                    <p className="uppercase text-[7px] font-black tracking-[0.4em] mb-2 opacity-60">{lubanResult.status === 'Tốt' ? 'Cung Đại Cát (Đỏ)' : 'Cung Hung Hiểm (Đen)'}</p>
                                    <h3 className="text-3xl font-black mb-2 italic uppercase">{lubanResult.cung}</h3>
                                    <p className="text-sm font-bold">{lubanResult.yNghia}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ========== TAB: VỢ CHỒNG ========== */}
                {tab === 'couple' && (
                    <div className="max-w-2xl mx-auto space-y-4">
                        <div className="glass-card bg-[#080808] border-white/10 p-6 rounded-[2rem] shadow-2xl">
                            <h2 className="text-center font-black text-lg text-white uppercase tracking-tighter mb-5">Phối Hợp <span className="text-gold italic">Vợ Chồng</span> 👫</h2>
                            <div className="grid grid-cols-2 gap-4 mb-5">
                                {/* Person 1 */}
                                <div className="space-y-2 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                                    <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest text-center">Chồng / Trụ cột</p>
                                    <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} placeholder="Năm sinh"
                                        className="w-full p-2.5 bg-white/5 rounded-lg border border-white/10 font-black text-sm text-white text-center outline-none focus:border-gold/40" />
                                    <div className="flex gap-1">
                                        <button onClick={() => setGender('male')} className={`flex-1 py-1.5 rounded-lg font-black text-[8px] uppercase ${gender === 'male' ? 'bg-blue-500/30 text-blue-300' : 'text-slate-600'}`}>Nam</button>
                                        <button onClick={() => setGender('female')} className={`flex-1 py-1.5 rounded-lg font-black text-[8px] uppercase ${gender === 'female' ? 'bg-pink-500/30 text-pink-300' : 'text-slate-600'}`}>Nữ</button>
                                    </div>
                                </div>
                                {/* Person 2 */}
                                <div className="space-y-2 p-3 bg-pink-500/5 rounded-xl border border-pink-500/10">
                                    <p className="text-[8px] font-black text-pink-400 uppercase tracking-widest text-center">Vợ / Đồng hành</p>
                                    <input type="number" value={year2} onChange={e => setYear2(Number(e.target.value))} placeholder="Năm sinh"
                                        className="w-full p-2.5 bg-white/5 rounded-lg border border-white/10 font-black text-sm text-white text-center outline-none focus:border-gold/40" />
                                    <div className="flex gap-1">
                                        <button onClick={() => setGender2('male')} className={`flex-1 py-1.5 rounded-lg font-black text-[8px] uppercase ${gender2 === 'male' ? 'bg-blue-500/30 text-blue-300' : 'text-slate-600'}`}>Nam</button>
                                        <button onClick={() => setGender2('female')} className={`flex-1 py-1.5 rounded-lg font-black text-[8px] uppercase ${gender2 === 'female' ? 'bg-pink-500/30 text-pink-300' : 'text-slate-600'}`}>Nữ</button>
                                    </div>
                                </div>
                            </div>
                            <button onClick={handleCouple} className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-blue-500 text-white rounded-xl font-black text-[10px] tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all">
                                ❤️ PHÂN TÍCH HỢP TUỔI
                            </button>
                        </div>

                        {coupleResult && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-500">
                                {/* Score */}
                                <div className={`glass-card p-6 rounded-[2rem] text-center border-2 shadow-2xl ${coupleResult.score >= 70 ? 'bg-gold/10 border-gold/30' : coupleResult.score >= 50 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                    <p className="uppercase text-[7px] font-black tracking-[0.4em] mb-1 text-slate-500">Độ Hòa Hợp</p>
                                    <h3 className={`text-5xl font-black mb-1 ${coupleResult.score >= 70 ? 'text-gold' : coupleResult.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{coupleResult.score}<span className="text-2xl">%</span></h3>
                                    <p className={`text-sm font-black uppercase ${coupleResult.score >= 70 ? 'text-gold' : coupleResult.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{coupleResult.compatibility}</p>
                                </div>

                                {/* Comparison */}
                                <div className="grid grid-cols-2 gap-3">
                                    {[{ p: coupleResult.person1, label: 'Người 1', color: 'blue' }, { p: coupleResult.person2, label: 'Người 2', color: 'pink' }].map(({ p, label, color }) => (
                                        <div key={label} className={`glass-card bg-[#080808] border-${color}-500/20 p-4 rounded-xl`}>
                                            <p className={`text-[8px] font-black text-${color}-400 uppercase tracking-widest mb-2`}>{label}</p>
                                            <p className="text-lg font-black text-white">{p.cung}</p>
                                            <p className="text-[9px] text-slate-400">{p.nhom}</p>
                                            <p className="text-[9px] text-gold mt-1">{p.napAm.canChi} · {p.napAm.napAm}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Advice */}
                                <div className="glass-card bg-[#080808] border-white/10 p-5 rounded-xl space-y-2">
                                    <h3 className="text-[9px] font-black text-gold uppercase tracking-widest mb-2">💡 Lời Khuyên Bậc Thầy</h3>
                                    {coupleResult.advice.map((a, i) => (
                                        <p key={i} className="text-[11px] text-slate-300 leading-relaxed">{a}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ========== TAB: SỐ MAY ========== */}
                {tab === 'lucky' && (
                    <div className="max-w-2xl mx-auto space-y-4">
                        <div className="glass-card bg-[#080808] border-white/10 p-6 rounded-[2rem] shadow-2xl">
                            <h2 className="text-center font-black text-lg text-white uppercase tracking-tighter mb-4">Con Số <span className="text-gold italic">May Mắn</span> 🎰</h2>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="col-span-2 space-y-1">
                                    <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Năm sinh</label>
                                    <input type="number" value={year} onChange={e => setYear(Number(e.target.value))}
                                        className="w-full p-2.5 bg-white/5 rounded-xl border border-white/10 font-black text-center text-gold outline-none focus:border-gold/40" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Giới tính</label>
                                    <select value={gender} onChange={e => setGender(e.target.value as Gender)}
                                        className="w-full p-2.5 bg-white/5 rounded-xl border border-white/10 font-black text-center text-white outline-none appearance-none text-sm">
                                        <option value="male" className="bg-black">Nam</option>
                                        <option value="female" className="bg-black">Nữ</option>
                                    </select>
                                </div>
                            </div>
                            <button onClick={handleCalculate} className="w-full py-3 bg-gold text-black rounded-xl font-black text-[10px] tracking-[0.3em] shadow-lg hover:scale-[1.02] transition-all">XEM SỐ MAY MẮN</button>
                        </div>

                        {result && (() => {
                            const lucky = getLuckyNumbers(result.menh);
                            return (
                                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3">
                                    {/* Mệnh Info */}
                                    <div className="glass-card bg-[#080808] border-gold/20 p-4 rounded-xl text-center">
                                        <p className="text-[8px] font-black text-gold/60 uppercase tracking-widest mb-1">Mệnh Nạp Âm</p>
                                        <p className="text-xl font-black text-gold">{result.napAm.napAm}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{lucky.explanation}</p>
                                    </div>

                                    {/* Lucky Digits */}
                                    <div className="glass-card bg-[#080808] border-white/10 p-5 rounded-xl">
                                        <h3 className="text-[9px] font-black text-gold uppercase tracking-widest mb-3">🔢 Số Hợp Mệnh (Hà Đồ)</h3>
                                        <div className="flex gap-2 justify-center">
                                            {lucky.luckyDigits.map(n => (
                                                <div key={n} className="w-12 h-12 bg-gold/20 border border-gold/30 rounded-xl flex items-center justify-center text-xl font-black text-gold shadow-lg shadow-gold/10">{n}</div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Lucky Floors */}
                                    <div className="glass-card bg-[#080808] border-white/10 p-5 rounded-xl">
                                        <h3 className="text-[9px] font-black text-gold uppercase tracking-widest mb-3">🏢 Tầng Hợp Mệnh</h3>
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {lucky.luckyFloors.map(f => (
                                                <div key={f} className="px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-lg text-xs font-black text-gold">T{f}</div>
                                            ))}
                                        </div>
                                        <h3 className="text-[9px] font-black text-red-400/80 uppercase tracking-widest mb-2">🚫 Tầng Nên Tránh</h3>
                                        <div className="flex flex-wrap gap-1.5">
                                            {lucky.avoidFloors.map(f => (
                                                <div key={f} className="px-3 py-1.5 bg-red-500/5 border border-red-500/10 rounded-lg text-xs font-bold text-red-400/60">T{f}</div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* House Numbers */}
                                    <div className="glass-card bg-[#080808] border-white/10 p-5 rounded-xl">
                                        <h3 className="text-[9px] font-black text-gold uppercase tracking-widest mb-3">🏠 Số Nhà May Mắn</h3>
                                        <p className="text-[10px] text-slate-400 mb-2">Chọn số nhà có chữ số cuối hoặc tổng các chữ số thuộc nhóm hợp mệnh:</p>
                                        <div className="flex gap-2 justify-center">
                                            {lucky.luckyHouseEndings.map(n => (
                                                <div key={n} className="px-4 py-2 bg-gold/10 border border-gold/20 rounded-xl text-lg font-black text-gold">{n}</div>
                                            ))}
                                        </div>
                                        <p className="text-[9px] text-slate-500 mt-3 text-center italic">VD: Số nhà 18 (1+8=9), 46 (4+6=10→1+0=1), 68 (6+8=14→1+4=5)</p>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}
