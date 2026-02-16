import React, { useState } from 'react';
import { Compass, User, Info, Save, RotateCcw, ShieldCheck, Sparkles, Loader2, Zap, Palette, MapPin, Sparkle, Crown } from 'lucide-react';
import { calculateFengShui, type Gender } from '../services/fengShui';
import { generateContentWithAI } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';

export default function FengShui() {
    const { profile } = useAuth();
    const [year, setYear] = useState<number>(1990);
    const [gender, setGender] = useState<Gender>('male');
    const [result, setResult] = useState<ReturnType<typeof calculateFengShui> | null>(null);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    const handleCalculate = () => {
        if (year < 1920 || year > 2030) {
            alert('Năm sinh không hợp lệ');
            return;
        }
        const res = calculateFengShui(year, gender);
        setResult(res);
        setAiInsight(null); // Reset AI insight for new calculation
    };

    const handleAiConsult = async () => {
        if (!result) return;

        if (profile?.tier !== 'pro' && profile?.role !== 'admin') {
            alert('Tính năng Thầy Phong Thủy AI chỉ dành cho tài khoản PRO!');
            return;
        }

        setIsGeneratingAI(true);
        const prompt = `Bạn là một bậc thầy Phong Thủy Bát Trạch. 
Thông tin gia chủ: Năm sinh ${year}, Giới tính ${gender === 'male' ? 'Nam' : 'Nữ'}.
Kết quả tính toán: 
- Cung: ${result.cung}
- Mệnh: ${result.menh}
- Nhóm: ${result.nhom}
- Hướng tốt: ${result.tot.map(t => `${t.dir} (${t.ynghia})`).join(', ')}
- Hướng xấu: ${result.xau.map(x => `${x.dir} (${x.ynghia})`).join(', ')}

Hãy đưa ra lời khuyên "Pro" bao gồm:
1. Cách bố trí phòng khách và giường ngủ để tăng tài lộc.
2. Màu sắc chủ đạo phù hợp với bản mệnh để gặp may mắn.
3. Vật phẩm phong thủy nên đặt trong nhà.
4. Một câu quyết đoán để sếp tự tin mua/xây nhà.
Lưu ý: Viết theo phong cách chuyên gia, có emoji, xuống dòng dễ nhìn, ngôn từ sang trọng.`;

        try {
            const insight = await generateContentWithAI(prompt);
            setAiInsight(insight);
        } catch (err) {
            alert('Lỗi khi gọi Thầy Phong Thủy AI.');
        } finally {
            setIsGeneratingAI(false);
        }
    };

    return (
        <div className="pb-20 md:pb-0">
            <div className="mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Compass className="text-blue-600" /> Tra Cứu Feng Shui (Bát Trạch)
                </h1>
                <p className="text-slate-500 text-sm">Hệ thống la bàn số học chính xác cho sếp BĐS</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Left: Input & Compass Animation */}
                <div className="space-y-8">
                    <div className="glass p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                            <User size={20} className="text-blue-500" /> Thông tin gia chủ
                        </h2>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Năm sinh (Âm lịch/Dương lịch)</label>
                                    <input
                                        type="number"
                                        className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-2xl font-black text-center focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                        placeholder="1990"
                                        value={year}
                                        onChange={(e) => setYear(Number(e.target.value))}
                                    />
                                </div>
                                <button
                                    onClick={() => setGender('male')}
                                    className={`p-4 rounded-2xl border-2 font-black transition-all flex items-center justify-center gap-2 ${gender === 'male'
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'
                                        }`}
                                >
                                    NAM
                                </button>
                                <button
                                    onClick={() => setGender('female')}
                                    className={`p-4 rounded-2xl border-2 font-black transition-all flex items-center justify-center gap-2 ${gender === 'female'
                                        ? 'bg-pink-600 border-pink-600 text-white shadow-lg shadow-pink-500/30'
                                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500'
                                        }`}
                                >
                                    NỮ
                                </button>
                            </div>

                            <button
                                onClick={handleCalculate}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all text-lg"
                            >
                                TRA CỨU NGAY
                            </button>
                        </div>
                    </div>

                    {/* Compass Visualization */}
                    <div className="flex justify-center py-6 relative">
                        <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full"></div>
                        <div
                            className={`relative w-64 h-64 md:w-80 md:h-80 border-8 border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center bg-white dark:bg-slate-950 shadow-2xl transition-all duration-1000 ${result ? 'scale-105' : ''}`}
                            style={{ transform: result ? `rotate(${result.nhom === 'Đông Tứ Trạch' ? '0deg' : '180deg'})` : 'rotate(0deg)' }}
                        >
                            {/* Inner Compass UI */}
                            <div className="absolute inset-2 border border-slate-100 dark:border-slate-800 rounded-full shadow-inner shadow-slate-200/50"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="absolute top-4 font-black text-red-600 drop-shadow-sm">N</span>
                                <span className="absolute bottom-4 font-black text-slate-800 dark:text-slate-200">S</span>
                                <span className="absolute left-4 font-black text-slate-800 dark:text-slate-200">W</span>
                                <span className="absolute right-4 font-black text-slate-800 dark:text-slate-200">E</span>
                            </div>

                            {/* Rotating Needle or Results Plate */}
                            <div className="w-full h-full p-8 flex items-center justify-center">
                                {result ? (
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Cung</p>
                                        <p className="text-3xl md:text-5xl font-black text-slate-800 dark:text-white uppercase">{result.cung}</p>
                                        <div className="h-1 w-12 bg-blue-600 mx-auto mt-2 rounded-full"></div>
                                    </div>
                                ) : (
                                    <Compass size={64} className="text-slate-200 dark:text-slate-800 animate-pulse" />
                                )}
                            </div>

                            {/* Compass Degrees */}
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="absolute inset-0 flex justify-center py-1" style={{ transform: `rotate(${i * 30}deg)` }}>
                                    <div className="w-0.5 h-2 bg-slate-200 dark:border-slate-800"></div>
                                </div>
                            ))}
                        </div>

                        {/* Status badge */}
                        {result && (
                            <div className="absolute top-0 right-0 lg:-right-4 bg-green-500 text-white px-3 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-1 shadow-lg animate-bounce">
                                <ShieldCheck size={12} /> HỢP PHONG THỦY
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Detailed Analysis */}
                <div className="space-y-6">
                    {result ? (
                        <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
                            {/* Summary Card */}
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-bl-full flex items-center justify-center p-4">
                                    <p className="text-4xl font-black text-blue-600/20">{result.cung.charAt(0)}</p>
                                </div>
                                <div className="relative z-10 flex justify-between items-end mb-8">
                                    <div>
                                        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Mệnh Cung Phi</h3>
                                        <p className="text-3xl font-black text-blue-600">{result.cung}</p>
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Bát Trạch</h3>
                                        <p className={`text-lg font-black ${result.nhom === 'Đông Tứ Trạch' ? 'text-teal-600' : 'text-amber-600'}`}>
                                            {result.nhom.toUpperCase()}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-3 border border-slate-100 dark:border-slate-800">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                        <Info size={18} />
                                    </div>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                        Sếp thuộc <span className="font-bold text-slate-800 dark:text-white">{result.nhom}</span>, nên chọn nhà các hướng thuộc nhóm này để đón tài lộc.
                                    </p>
                                </div>
                            </div>

                            {/* Lucky/Unlucky Directions */}
                            <div className="grid grid-cols-1 gap-6">
                                {/* Lucky */}
                                <div className="bg-teal-50 dark:bg-teal-900/10 p-6 rounded-3xl border-2 border-teal-100 dark:border-teal-900/30 group hover:border-teal-400 transition-all">
                                    <h3 className="font-black text-teal-700 dark:text-teal-400 mb-4 flex items-center gap-2 uppercase tracking-wide">
                                        <span className="w-3 h-3 rounded-full bg-teal-500 animate-pulse"></span> Hướng Đại Cát (Tốt)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {result.tot.map((item) => (
                                            <div key={item.dir} className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-teal-100/50 dark:border-teal-900/20">
                                                <p className="text-sm font-black text-slate-800 dark:text-white mb-0.5">{item.dir}</p>
                                                <p className="text-[10px] font-bold text-teal-600 uppercase italic">{item.ynghia}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Unlucky */}
                                <div className="bg-rose-50 dark:bg-rose-900/10 p-6 rounded-3xl border-2 border-rose-100 dark:border-rose-900/30">
                                    <h3 className="font-black text-rose-700 dark:text-rose-400 mb-4 flex items-center gap-2 uppercase tracking-wide">
                                        <span className="w-3 h-3 rounded-full bg-rose-500"></span> Hướng Đại Hung (Xấu)
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {result.xau.map((item) => (
                                            <div key={item.dir} className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-rose-100/50 dark:border-rose-900/20 opacity-80">
                                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-0.5">{item.dir}</p>
                                                <p className="text-[10px] font-medium text-rose-500 uppercase">{item.ynghia}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* AI Master Insight - PREMIUM FEATURE */}
                                <div className="space-y-4">
                                    {aiInsight ? (
                                        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl border border-indigo-500/30 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Sparkle size={100} className="text-blue-400 rotate-12" />
                                            </div>
                                            <h3 className="text-blue-400 font-black text-lg mb-6 flex items-center gap-2 uppercase">
                                                <Zap className="text-yellow-400 fill-yellow-400" /> Giải Mã Từ Thầy Phong Thủy AI
                                            </h3>
                                            <div className="prose prose-invert max-w-none">
                                                <div className="whitespace-pre-wrap text-slate-100 text-sm leading-relaxed tracking-wide font-medium italic">
                                                    {aiInsight}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleAiConsult}
                                            disabled={isGeneratingAI}
                                            className="w-full py-6 bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-white font-black rounded-3xl shadow-2xl shadow-yellow-500/20 hover:scale-[1.02] active:scale-95 transition-all flex flex-col items-center justify-center gap-2 border-b-4 border-amber-700 disabled:opacity-50"
                                        >
                                            {isGeneratingAI ? <Loader2 className="animate-spin" /> : <Sparkles className="animate-pulse" />}
                                            <span className="text-lg">THÀNH TÂM THỈNH GIÁO THẦY AI</span>
                                            <span className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Dành riêng cho sếp PRO</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button className="flex-1 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                                    <Save size={20} /> LƯU KẾT QUẢ
                                </button>
                                <button
                                    onClick={() => setResult(null)}
                                    className="p-4 bg-white dark:bg-slate-800 text-slate-400 hover:text-blue-600 border border-slate-100 dark:border-slate-800 rounded-2xl transition-all"
                                >
                                    <RotateCcw size={20} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 text-center">
                            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100 dark:border-slate-800">
                                <Compass size={48} className="opacity-20 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 uppercase">Bát Quái Đồ</h3>
                            <p className="max-w-[280px] text-sm font-medium">Chọn năm sinh và giới tính để giải mã hướng nhà thu tài kích lộc cho sếp nhé!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
