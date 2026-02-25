import React, { useState } from 'react';
import { Compass, User, Info, Save, RotateCcw, ShieldCheck, Sparkles, Loader2, Zap, Palette, MapPin, Sparkle, Crown, Ruler, Home, AlertTriangle, CheckCircle } from 'lucide-react';
import { calculateFengShui, checkAgeBuilding, checkLuBan, getColors, type Gender } from '../services/fengShui';
import { generateContentWithAI } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import CompassLuopan from '../components/FengShui/CompassLuopan';

export default function FengShui() {
    const { profile } = useAuth();
    const [tab, setTab] = useState<'battrach' | 'compass' | 'tuoilamnha' | 'luban'>('battrach');

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
        <div className="max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar scroll-smooth pb-4">
            {/* Header - Compact */}
            <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3 px-1">
                <div>
                    <h1 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                        <Compass className="text-gold" size={20} strokeWidth={3} />
                        Phong Thủy <span className="text-[#bf953f] italic">Elite</span>
                    </h1>
                    <p className="text-slate-500 text-[7px] font-black tracking-[0.4em] uppercase mt-0.5 opacity-60">Professional Feng Shui Engine</p>
                </div>

                {/* Tabs - Compact */}
                <div className="flex bg-white/5 p-1 rounded-xl w-fit gap-1 border border-white/10 shadow-lg">
                    {[
                        { id: 'battrach', label: 'Bát Trạch', icon: Compass },
                        { id: 'compass', label: 'La Bàn', icon: Sparkles },
                        { id: 'tuoilamnha', label: 'Xem Tuổi', icon: Home },
                        { id: 'luban', label: 'Lỗ Ban', icon: Ruler }
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

            <div className="animate-in fade-in zoom-in duration-500">
                {/* TAB: BÁT TRẠCH */}
                {tab === 'battrach' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                        {/* Input Area - More Pop */}
                        <div className="lg:col-span-4 space-y-4">
                            <div className="glass-card bg-[#080808] border-white/10 p-5 rounded-2xl shadow-[0_15px_40px_-10px_rgba(0,0,0,1)]">
                                <h3 className="text-[9px] font-black text-gold uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    <User size={12} /> Gia Chủ
                                </h3>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Năm sinh</label>
                                        <input
                                            type="number" value={year} onChange={e => setYear(Number(e.target.value))}
                                            className="w-full p-2.5 bg-white/5 rounded-xl border border-white/10 outline-none font-black text-center text-lg text-gold focus:border-gold/40 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Giới tính</label>
                                        <div className="flex bg-white/5 rounded-xl p-1 gap-1 border border-white/5">
                                            <button onClick={() => setGender('male')} className={`flex-1 py-2 rounded-lg font-black text-[9px] uppercase transition-all ${gender === 'male' ? 'bg-gold text-black shadow-lg' : 'text-slate-500'}`}>Nam</button>
                                            <button onClick={() => setGender('female')} className={`flex-1 py-2 rounded-lg font-black text-[9px] uppercase transition-all ${gender === 'female' ? 'bg-gold text-black shadow-lg' : 'text-slate-500'}`}>Nữ</button>
                                        </div>
                                    </div>
                                    <button onClick={handleCalculateBatTrach} className="w-full py-3.5 bg-gradient-to-r from-[#bf953f] to-[#aa771c] text-black rounded-xl font-black text-[9px] tracking-[0.2em] shadow-lg hover:scale-[1.02] transition-all mt-2 border border-white/10">
                                        PHÂN TÍCH NGAY
                                    </button>
                                </div>
                            </div>

                            {/* Colors */}
                            {result && (
                                <div className="glass-card bg-[#080808] border-gold/20 p-5 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-2">
                                    <h3 className="text-[9px] font-black text-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Palette size={12} /> Màu Sắc Hợp Mệnh
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="p-3 bg-gold/5 rounded-xl border border-gold/10">
                                            <span className="text-[7px] font-black text-gold/60 uppercase block mb-0.5 tracking-widest">Tương Sinh</span>
                                            <p className="font-bold text-[10px] text-white uppercase">{getColors(result.menh).hop}</p>
                                        </div>
                                        <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                                            <span className="text-[7px] font-black text-red-500/60 uppercase block mb-0.5 tracking-widest">Tương Khắc</span>
                                            <p className="font-bold text-[10px] text-white/50 uppercase italic">{getColors(result.menh).ky}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Result Area - Extra Pop */}
                        <div className="lg:col-span-8 space-y-5">
                            {result ? (
                                <>
                                    <div className="glass-card bg-gradient-to-br from-[#0c0c0c] to-black border-gold/30 rounded-[2.5rem] p-8 text-white shadow-[0_20px_50px_rgba(0,0,0,1)] relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700">
                                            <Compass size={180} strokeWidth={1} className="text-gold" />
                                        </div>
                                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                                            <div className="text-center md:text-left flex-1">
                                                <p className="text-gold uppercase text-[8px] font-black tracking-[0.4em] mb-2">Mệnh Cung Đại Cát</p>
                                                <h2 className="text-5xl font-black mb-1 tracking-tighter italic text-gold">{result.cung}</h2>
                                                <div className="text-[10px] font-bold text-slate-400">{result.nhom}</div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                                                <div className="bg-white/5 py-3 p-5 rounded-2xl border border-white/10 min-w-[120px] text-center shadow-lg">
                                                    <p className="text-[7px] uppercase text-gold font-black tracking-widest mb-1 opacity-60">Hướng Tốt</p>
                                                    <p className="font-black text-lg text-white">{result.tot[0].dir}</p>
                                                </div>
                                                <div className="bg-white/5 py-3 p-5 rounded-2xl border border-white/10 min-w-[120px] text-center shadow-lg">
                                                    <p className="text-[7px] uppercase text-gold font-black tracking-widest mb-1 opacity-60">Bản Mệnh</p>
                                                    <p className="font-black text-lg text-white">{result.menh}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Insight - Compact & High Pop */}
                                    <div className="glass-card bg-[#080808] border-white/5 p-6 rounded-2xl relative overflow-hidden shadow-2xl">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-transparent"></div>
                                        <h3 className="font-black text-white text-[9px] mb-4 flex items-center gap-2 uppercase tracking-widest">
                                            <Sparkles className="text-gold" size={14} /> Thầy Phong Thủy AI (Pro Insight)
                                        </h3>
                                        {aiInsight ? (
                                            <div className="relative z-10 prose prose-invert prose-sm max-w-none">
                                                <div className="whitespace-pre-wrap text-slate-300 leading-relaxed text-xs">
                                                    {aiInsight}
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleAiConsult}
                                                disabled={isGeneratingAI}
                                                className="relative z-10 w-full py-4 bg-white/5 hover:bg-gold/10 border border-gold/20 rounded-xl font-black text-[9px] transition-all flex justify-center items-center gap-2 uppercase tracking-[0.2em] text-gold"
                                            >
                                                {isGeneratingAI ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} strokeWidth={3} />}
                                                {isGeneratingAI ? 'AI Đang Luận Giải...' : 'Lấy Lời Khuyên Chuyên Gia (PRO)'}
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="h-full min-h-[300px] flex flex-col items-center justify-center bg-[#080808] rounded-[2.5rem] border-2 border-dashed border-white/5 text-slate-700">
                                    <Compass size={40} className="text-gold/20 mb-4" />
                                    <h3 className="text-[8px] font-black uppercase tracking-[0.4em]">Phân tích vương khí gia chủ</h3>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: LA BÀN - High Pop */}
                {tab === 'compass' && (
                    <div className="max-w-xl mx-auto space-y-5 animate-in fade-in slide-in-from-top-2">
                        <div className="glass-card bg-[#080808] border-white/10 p-5 rounded-[2.5rem] shadow-2xl mb-4">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="space-y-1 w-full flex-1">
                                    <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Nhập Năm Sinh Tự Động Luận Giải</label>
                                    <div className="flex bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                                        <input
                                            type="number" value={year} onChange={e => { setYear(Number(e.target.value)); handleCalculateBatTrach(); }}
                                            className="w-full p-3 bg-transparent outline-none font-black text-center text-sm text-gold focus:border-gold/40 transition-all border-r border-white/10"
                                        />
                                        <select
                                            value={gender} onChange={e => { setGender(e.target.value as Gender); handleCalculateBatTrach(); }}
                                            className="p-3 bg-transparent outline-none font-black text-xs text-slate-300 appearance-none text-center min-w-[80px]"
                                        >
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
                                        <button onClick={handleCalculateBatTrach} className="py-3 px-6 bg-gold text-black rounded-xl font-black text-[9px] uppercase shadow-lg shadow-gold/20">Cập nhật Mệnh Cung</button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <CompassLuopan userKua={result?.cung.split(' ')[0]} userGroup={result?.nhom} />
                    </div>
                )}

                {/* TAB: XEM TUỔI - High Pop */}
                {tab === 'tuoilamnha' && (
                    <div className="max-w-2xl mx-auto space-y-5">
                        <div className="glass-card bg-[#080808] border-white/10 p-7 rounded-[2.5rem] shadow-2xl">
                            <h2 className="text-center font-black text-lg text-white uppercase tracking-tighter mb-6">Phối Hợp <span className="text-gold italic">Động Thổ</span></h2>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="space-y-1">
                                    <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Sinh Năm</label>
                                    <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-full p-3 bg-white/5 rounded-xl border border-white/10 font-black text-base text-white text-center focus:border-gold/40 outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Dự Kiến Xây</label>
                                    <input type="number" value={buildYear} onChange={e => setBuildYear(Number(e.target.value))} className="w-full p-3 bg-white/5 rounded-xl border border-white/10 font-black text-base text-gold text-center focus:border-gold/40 outline-none" />
                                </div>
                            </div>
                            <button onClick={handleCheckAge} className="w-full py-4 bg-gold text-black rounded-xl font-black text-[10px] tracking-[0.3em] shadow-xl shadow-gold/10 hover:scale-[1.02] transition-all border border-white/20">XEM KẾT QUẢ</button>

                            {ageCheckResult && (
                                <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-2 duration-500">
                                    <div className={`p-6 rounded-[2rem] text-center border-2 shadow-2xl relative overflow-hidden ${ageCheckResult.conclusion === 'Tốt' ? 'bg-gold/10 border-gold/30' : 'bg-red-500/10 border-red-500/20'}`}>
                                        <p className="uppercase text-[7px] font-black tracking-[0.4em] mb-2 text-slate-500">Kết luận</p>
                                        <h3 className={`text-5xl font-black mb-3 italic tracking-tighter ${ageCheckResult.conclusion === 'Tốt' ? 'text-gold' : 'text-red-500'}`}>{ageCheckResult.conclusion.toUpperCase()}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 max-w-sm mx-auto leading-relaxed">
                                            {ageCheckResult.conclusion === 'Tốt' ? `Năm ${buildYear} đại cát đại lợi, gia chủ kiến tạo vượng khí.` : `Gia chủ nên mượn tuổi để tránh đại họa, đảm bảo bình an.`}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { label: 'Kim Lâu', status: ageCheckResult.kimLau },
                                            { label: 'Hoang Ốc', status: ageCheckResult.hoangOc },
                                            { label: 'Tam Tai', status: ageCheckResult.tamTai }
                                        ].map((item) => (
                                            <div key={item.label} className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center">
                                                <span className="text-[7px] font-black text-slate-600 uppercase mb-1">{item.label}</span>
                                                <span className={`text-[8px] font-black uppercase ${item.status ? 'text-red-500' : 'text-green-500'}`}>{item.status ? 'Phạm' : 'Tốt'}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: LỖ BAN - High Pop */}
                {tab === 'luban' && (
                    <div className="max-w-xl mx-auto space-y-5">
                        <div className="glass-card bg-[#080808] border-white/10 p-8 rounded-[2.5rem] shadow-2xl text-center">
                            <div className="mb-8">
                                <h2 className="font-black text-lg text-white uppercase tracking-tighter">Thước Lỗ Ban <span className="text-gold">52.2cm</span></h2>
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">Thông thủy cửa đi & cửa sổ</p>
                            </div>
                            <div className="mb-10 space-y-6">
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full py-8 text-center text-6xl font-black bg-white/5 rounded-3xl border-2 border-transparent focus:border-gold/30 outline-none text-gold tracking-tight"
                                        placeholder="0"
                                        value={lubanSize}
                                        onChange={(e) => handleCheckLuBan(Number(e.target.value))}
                                    />
                                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700 font-black italic">CM</span>
                                </div>
                                <input type="range" min="0" max="500" value={lubanSize} onChange={(e) => handleCheckLuBan(Number(e.target.value))} className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold" />
                            </div>
                            {lubanResult && (
                                <div className={`p-8 rounded-3xl animate-in zoom-in-95 ${lubanResult.status === 'Tốt' ? 'bg-gold text-black shadow-2xl shadow-gold/20 scale-105' : 'bg-white/5 text-slate-600 border border-white/5'}`}>
                                    <p className="uppercase text-[7px] font-black tracking-[0.4em] mb-3 opacity-60">{lubanResult.status === 'Tốt' ? 'Cung Đại Cát (Đỏ)' : 'Cung Hung Hiểm (Đen)'}</p>
                                    <h3 className="text-4xl font-black mb-3 italic uppercase">{lubanResult.cung}</h3>
                                    <p className="text-sm font-bold">{lubanResult.yNghia}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />
        </div>
    );
}
