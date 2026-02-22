import React, { useState } from 'react';
import { Compass, User, Info, Save, RotateCcw, ShieldCheck, Sparkles, Loader2, Zap, Palette, MapPin, Sparkle, Crown, Ruler, Home, AlertTriangle, CheckCircle } from 'lucide-react';
import { calculateFengShui, checkAgeBuilding, checkLuBan, getColors, type Gender } from '../services/fengShui';
import { generateContentWithAI } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';

export default function FengShui() {
    const { profile } = useAuth();
    const [tab, setTab] = useState<'battrach' | 'tuoilamnha' | 'luban'>('battrach');

    // Bat Trach State
    const [year, setYear] = useState<number>(1990);
    const [gender, setGender] = useState<Gender>('male');
    const [result, setResult] = useState<ReturnType<typeof calculateFengShui> | null>(null);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    // Tuoi Lam Nha State
    const [buildYear, setBuildYear] = useState<number>(new Date().getFullYear());
    const [ageCheckResult, setAgeCheckResult] = useState<ReturnType<typeof checkAgeBuilding> | null>(null);

    // Lu Ban State
    const [lubanSize, setLubanSize] = useState<number>(0);
    const [lubanResult, setLubanResult] = useState<ReturnType<typeof checkLuBan> | null>(null);

    // Handlers
    const handleCalculateBatTrach = () => {
        if (year < 1900 || year > 2100) return alert('Năm sinh không hợp lệ');
        const res = calculateFengShui(year, gender);
        setResult(res);
        setAiInsight(null);
    };

    const handleCheckAge = () => {
        if (year < 1900 || year > 2100) return alert('Năm sinh không hợp lệ');
        const res = checkAgeBuilding(year, buildYear);
        setAgeCheckResult(res);
    };

    const handleCheckLuBan = (val: number) => {
        setLubanSize(val);
        setLubanResult(checkLuBan(val));
    };

    const handleAiConsult = async () => {
        if (!result) return;
        if (profile?.tier !== 'pro' && profile?.role !== 'admin') {
            alert('Tính năng Thầy Phong Thủy AI chỉ dành cho tài khoản PRO!');
            return;
        }
        setIsGeneratingAI(true);
        const prompt = `Bạn là bậc thầy Phong Thủy. Gia chủ sinh năm ${year}, giới tính ${gender === 'male' ? 'Nam' : 'Nữ'}.
        Cung: ${result.cung}, Mệnh: ${result.menh}, Nhóm: ${result.nhom}.
        Hãy đưa ra lời khuyên cao cấp về:
        1. Cách hóa giải hướng xấu nếu lỡ mua nhà hướng ${result.xau[0].dir}.
        2. Vật phẩm phong thủy chi tiết kích tài lộc.
        3. Ngày giờ tốt để động thổ trong năm nay.
        Viết ngắn gọn, súc tích, chuyên nghiệp.`;
        try {
            const insight = await generateContentWithAI(prompt);
            setAiInsight(insight);
        } catch (err) {
            alert('Lỗi AI');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    return (
        <div className="pb-10 min-h-screen">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                        <Compass className="text-[#bf953f]" size={24} strokeWidth={3} />
                        Phong Thủy <span className="text-gold">Elite</span>
                    </h1>
                    <p className="text-slate-500 text-[9px] font-bold tracking-[0.3em] uppercase mt-1">Advanced Feng Shui Analysis System</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white/5 p-1 rounded-2xl mb-8 w-fit gap-1 border border-white/5">
                {[
                    { id: 'battrach', label: 'Bát Trạch', icon: Compass },
                    { id: 'tuoilamnha', label: 'Xem Tuổi', icon: Home },
                    { id: 'luban', label: 'Lỗ Ban', icon: Ruler }
                ].map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setTab(t.id as any)}
                        className={`py-2 px-6 rounded-xl font-black text-[10px] flex items-center gap-2 transition-all uppercase tracking-widest ${tab === t.id ? 'bg-[#bf953f] text-black shadow-lg shadow-[#bf953f]/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <t.icon size={14} strokeWidth={3} /> {t.label}
                    </button>
                ))}
            </div>

            <div className="animate-in fade-in zoom-in duration-300">
                {/* TAB: BÁT TRẠCH */}
                {tab === 'battrach' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Input Area */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="glass-card bg-white/[0.02] border-white/5 p-6 rounded-2xl">
                                <h3 className="text-[10px] font-black text-[#bf953f] uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <User size={14} /> Hồ sơ Gia chủ
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Năm sinh (Dương lịch)</label>
                                        <input
                                            type="number" value={year} onChange={e => setYear(Number(e.target.value))}
                                            className="w-full p-3 bg-white/5 rounded-xl border border-white/10 outline-none font-black text-center text-xl text-[#fcf6ba] focus:border-[#bf953f]/40 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Giới tính</label>
                                        <div className="flex bg-white/5 rounded-xl p-1 gap-1 border border-white/5">
                                            <button onClick={() => setGender('male')} className={`flex-1 py-2 rounded-lg font-black text-[10px] uppercase transition-all ${gender === 'male' ? 'bg-[#bf953f] text-black shadow-md' : 'text-slate-500'}`}>Nam</button>
                                            <button onClick={() => setGender('female')} className={`flex-1 py-2 rounded-lg font-black text-[10px] uppercase transition-all ${gender === 'female' ? 'bg-[#bf953f] text-black shadow-md' : 'text-slate-500'}`}>Nữ</button>
                                        </div>
                                    </div>
                                    <button onClick={handleCalculateBatTrach} className="btn-bronze w-full py-4 !text-[11px] tracking-[0.2em] shadow-lg shadow-[#bf953f]/10 mt-2">
                                        PHÂN TÍCH NGAY
                                    </button>
                                </div>
                            </div>

                            {/* Colors */}
                            {result && (
                                <div className="glass-card bg-white/[0.02] border-white/5 p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <h3 className="text-[10px] font-black text-[#bf953f] uppercase tracking-widest mb-5 flex items-center gap-2">
                                        <Palette size={14} /> Màu Sắc Kim Cương
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="p-3 bg-[#bf953f]/10 rounded-xl border border-[#bf953f]/20">
                                            <span className="text-[8px] font-black text-[#fcf6ba] uppercase block mb-1 tracking-widest">Tương Sinh (Tốt nhất)</span>
                                            <p className="font-bold text-xs text-white uppercase">{getColors(result.menh).hop}</p>
                                        </div>
                                        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                                            <span className="text-[8px] font-black text-red-400 uppercase block mb-1 tracking-widest">Tương Khắc (Đại Kỵ)</span>
                                            <p className="font-bold text-xs text-white opacity-60 uppercase">{getColors(result.menh).ky}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Result Area */}
                        <div className="lg:col-span-8 flex flex-col gap-6">
                            {result ? (
                                <>
                                    <div className="glass-card bg-gradient-to-br from-[#1a1a1a] to-black border-[#bf953f]/30 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700">
                                            <Compass size={220} strokeWidth={1} className="text-[#bf953f]" />
                                        </div>
                                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                            <div className="text-center md:text-left flex-1">
                                                <p className="text-[#bf953f] uppercase text-[10px] font-black tracking-[0.4em] mb-3">Mệnh Cung Đại Cát</p>
                                                <h2 className="text-6xl font-black mb-3 tracking-tighter italic text-gold">{result.cung}</h2>
                                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-slate-300">
                                                    {result.nhom}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                                                <div className="bg-white/5 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/10 min-w-[140px] text-center">
                                                    <p className="text-[8px] uppercase text-[#bf953f] font-black tracking-widest mb-1.5 opacity-70">Hướng Tốt</p>
                                                    <p className="font-black text-xl text-white">{result.tot[0].dir}</p>
                                                </div>
                                                <div className="bg-white/5 backdrop-blur-xl p-5 rounded-[1.5rem] border border-white/10 min-w-[140px] text-center">
                                                    <p className="text-[8px] uppercase text-[#bf953f] font-black tracking-widest mb-1.5 opacity-70">Bản Mệnh</p>
                                                    <p className="font-black text-xl text-white">{result.menh}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Insight */}
                                    <div className="glass-card bg-white/[0.01] border-white/5 p-8 rounded-[2rem] relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-[#bf953f]/5 to-transparent"></div>
                                        <h3 className="font-black text-white text-xs mb-6 flex items-center gap-2 uppercase tracking-widest">
                                            <Sparkles className="text-gold" size={16} /> Thầy Phong Thủy AI (Elite Insight)
                                        </h3>
                                        {aiInsight ? (
                                            <div className="relative z-10 prose prose-invert prose-sm max-w-none">
                                                <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-medium">
                                                    {aiInsight}
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleAiConsult}
                                                disabled={isGeneratingAI}
                                                className="relative z-10 w-full py-5 bg-white/5 hover:bg-[#bf953f]/10 border border-[#bf953f]/20 rounded-2xl font-black text-[10px] transition-all flex justify-center items-center gap-3 uppercase tracking-[0.2em] text-[#bf953f]"
                                            >
                                                {isGeneratingAI ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} strokeWidth={2.5} />}
                                                {isGeneratingAI ? 'AI Đang luận giải...' : 'Xin Lời Khuyên Chuyên Gia (PRO)'}
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white/[0.01] rounded-[2.5rem] border-2 border-dashed border-white/5 text-slate-600 animate-pulse">
                                    <Compass size={48} className="text-[#bf953f] opacity-20 mb-4" />
                                    <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.3em]">Sẵn sàng phân tích gia chủ</h3>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: XEM TUỔI LÀM NHÀ */}
                {tab === 'tuoilamnha' && (
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="glass-card bg-white/[0.02] border-white/5 p-8 rounded-[2.5rem] shadow-sm">
                            <h2 className="text-center font-black text-xl text-white uppercase tracking-tighter mb-8">
                                Phân Tích <span className="text-gold">Động Thổ</span> Elite
                            </h2>
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="space-y-2">
                                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Năm sinh gia chủ</label>
                                    <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 font-black text-lg text-white focus:border-[#bf953f]/50 outline-none text-center" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Năm dự kiến làm</label>
                                    <input type="number" value={buildYear} onChange={e => setBuildYear(Number(e.target.value))} className="w-full p-4 bg-white/5 rounded-2xl border border-white/10 font-black text-lg text-[#fcf6ba] focus:border-[#bf953f]/50 outline-none text-center" />
                                </div>
                            </div>
                            <button onClick={handleCheckAge} className="btn-bronze w-full py-5 !text-xs tracking-[0.3em] shadow-xl shadow-[#bf953f]/10 mb-2">
                                TRA CỨU KẾT QUẢ
                            </button>

                            {ageCheckResult && (
                                <div className="mt-10 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className={`p-8 rounded-[2rem] text-center border-2 shadow-2xl relative overflow-hidden ${ageCheckResult.conclusion === 'Tốt' ? 'bg-[#bf953f]/10 border-[#bf953f]/30 shadow-[#bf953f]/5' : 'bg-red-500/10 border-red-500/20 shadow-red-500/5'}`}>
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            {ageCheckResult.conclusion === 'Tốt' ? <CheckCircle size={80} /> : <AlertTriangle size={80} />}
                                        </div>
                                        <p className="uppercase text-[9px] font-black tracking-[0.4em] mb-4 text-slate-400">Kết luận cuối cùng</p>
                                        <h3 className={`text-6xl font-black mb-4 tracking-tighter ${ageCheckResult.conclusion === 'Tốt' ? 'text-gold italic' : 'text-red-500'}`}>{ageCheckResult.conclusion.toUpperCase()}</h3>
                                        <p className="font-bold text-sm text-slate-200 leading-relaxed max-w-md mx-auto">
                                            {ageCheckResult.conclusion === 'Tốt'
                                                ? `Năm ${buildYear} đại cát để gia chủ ${year} động thổ, kiến tạo vượng khí!`
                                                : `Gia chủ nên mượn tuổi hoặc dời sang năm khác để tránh vận hạn.`}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {[
                                            { label: 'Kim Lâu', status: ageCheckResult.kimLau },
                                            { label: 'Hoang Ốc', status: ageCheckResult.hoangOc },
                                            { label: 'Tam Tai', status: ageCheckResult.tamTai }
                                        ].map((item) => (
                                            <div key={item.label} className="flex flex-col items-center p-5 bg-white/5 border border-white/10 rounded-2xl transition-all hover:bg-white/[0.08]">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{item.label}</span>
                                                {item.status ? (
                                                    <div className="flex items-center gap-1.5 text-red-500 font-black text-xs uppercase">
                                                        <AlertTriangle size={14} /> Phạm
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-green-500 font-black text-xs uppercase">
                                                        <CheckCircle size={14} /> Không phạm
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {ageCheckResult.details.length > 0 && (
                                        <div className="p-6 bg-red-500/5 rounded-2xl text-xs text-red-400/80 border border-red-500/10 italic">
                                            <span className="font-black block mb-2 uppercase tracking-widest text-red-500/60 text-[10px]">Lưu ý chi tiết:</span>
                                            <ul className="space-y-1">
                                                {ageCheckResult.details.map((d, i) => <li key={i} className="flex gap-2"><span>•</span> {d}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: THƯỚC LỖ BAN */}
                {tab === 'luban' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <div className="glass-card bg-white/[0.02] border-white/5 p-10 rounded-[2.5rem] shadow-sm text-center">
                            <div className="mb-10">
                                <h2 className="font-black text-xl text-white uppercase tracking-tighter mb-2">Thước Lỗ Ban <span className="text-gold">52.2cm</span></h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dành cho Cửa đi, Cửa sổ (Thông thủy)</p>
                            </div>

                            <div className="mb-12 space-y-8">
                                <div className="relative group">
                                    <input
                                        type="number"
                                        className="w-full py-10 text-center text-7xl font-black bg-white/5 rounded-3xl border-2 border-transparent focus:border-[#bf953f]/40 outline-none text-gold tracking-tight transition-all"
                                        placeholder="0"
                                        value={lubanSize}
                                        onChange={(e) => handleCheckLuBan(Number(e.target.value))}
                                    />
                                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-600 font-black text-xl italic tracking-widest">CM</span>
                                </div>
                                <div className="px-4">
                                    <input
                                        type="range" min="0" max="500" step="1"
                                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#bf953f]"
                                        value={lubanSize}
                                        onChange={(e) => handleCheckLuBan(Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            {lubanResult && (
                                <div className={`p-10 rounded-3xl text-center transition-all duration-500 animate-in zoom-in-95 ${lubanResult.status === 'Tốt' ? 'bg-[#bf953f] text-black shadow-2xl shadow-[#bf953f]/20 scale-105' : 'bg-white/5 text-slate-400 border border-white/10'}`}>
                                    <p className={`uppercase text-[10px] font-black tracking-[0.4em] mb-4 ${lubanResult.status === 'Tốt' ? 'text-black opacity-60' : 'text-slate-600'}`}>{lubanResult.status === 'Tốt' ? 'CUNG ĐẠI CÁT' : 'CUNG PHẠM XẤU'}</p>
                                    <h3 className="text-5xl font-black mb-5 uppercase italic tracking-tighter">{lubanResult.cung}</h3>
                                    <div className={`h-[1px] w-16 mx-auto mb-5 ${lubanResult.status === 'Tốt' ? 'bg-black/20' : 'bg-white/10'}`}></div>
                                    <p className={`text-lg font-bold ${lubanResult.status === 'Tốt' ? 'text-black' : 'text-slate-500 italic'}`}>{lubanResult.yNghia}</p>
                                </div>
                            )}

                            <div className="mt-10 p-5 bg-white/5 rounded-2xl border border-white/5 text-[10px] text-slate-500 font-medium italic">
                                Chuyên gia khuyên chọn kích thước rơi vào cung <span className="text-[#bf953f] font-black not-italic">Vàng</span> để thu hút vượng khí tốt nhất cho công trình.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
