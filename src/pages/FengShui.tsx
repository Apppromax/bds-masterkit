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
        <div className="pb-24">
            <div className="mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Compass className="text-blue-600" /> Phong Thủy Toàn Tập
                </h1>
                <p className="text-slate-500 text-sm">Công cụ hỗ trợ chốt khách BĐS đỉnh cao</p>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-8 overflow-x-auto">
                <button
                    onClick={() => setTab('battrach')}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${tab === 'battrach' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                    <Compass size={18} /> Bát Trạch
                </button>
                <button
                    onClick={() => setTab('tuoilamnha')}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${tab === 'tuoilamnha' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                    <Home size={18} /> Xem Tuổi
                </button>
                <button
                    onClick={() => setTab('luban')}
                    className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${tab === 'luban' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}
                >
                    <Ruler size={18} /> Thước Lỗ Ban
                </button>
            </div>

            <div className="animate-in fade-in zoom-in duration-300">
                {/* TAB: BÁT TRẠCH */}
                {tab === 'battrach' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Input */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                <h3 className="font-bold mb-4 flex items-center gap-2"><User size={20} /> Gia chủ</h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <input
                                        type="number" value={year} onChange={e => setYear(Number(e.target.value))}
                                        className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-none outline-none font-bold text-center text-lg"
                                    />
                                    <div className="flex bg-slate-50 dark:bg-slate-800 rounded-xl p-1">
                                        <button onClick={() => setGender('male')} className={`flex-1 rounded-lg font-bold text-sm transition-all ${gender === 'male' ? 'bg-blue-500 text-white shadow' : 'text-slate-400'}`}>Nam</button>
                                        <button onClick={() => setGender('female')} className={`flex-1 rounded-lg font-bold text-sm transition-all ${gender === 'female' ? 'bg-pink-500 text-white shadow' : 'text-slate-400'}`}>Nữ</button>
                                    </div>
                                </div>
                                <button onClick={handleCalculateBatTrach} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all">
                                    Tra Cứu Ngay
                                </button>
                            </div>

                            {/* Colors */}
                            {result && (
                                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                    <h3 className="font-bold mb-4 flex items-center gap-2 text-purple-600"><Palette size={20} /> Màu Sắc Hợp Mệnh</h3>
                                    <div className="space-y-4">
                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
                                            <span className="text-xs font-bold text-green-600 uppercase block mb-1">Tương Sinh (Tốt)</span>
                                            <p className="font-medium text-slate-700 dark:text-slate-300">{getColors(result.menh).hop}</p>
                                        </div>
                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
                                            <span className="text-xs font-bold text-red-600 uppercase block mb-1">Tương Khắc (Tránh)</span>
                                            <p className="font-medium text-slate-700 dark:text-slate-300">{getColors(result.menh).ky}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Result */}
                        <div className="space-y-6">
                            {result ? (
                                <>
                                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10"><Compass size={120} /></div>
                                        <div className="relative z-10 text-center">
                                            <p className="opacity-80 uppercase text-xs font-bold tracking-widest mb-2">Mệnh Cung</p>
                                            <h2 className="text-5xl font-black mb-2">{result.cung}</h2>
                                            <p className="text-xl font-medium opacity-90">{result.nhom}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 mt-8">
                                            <div className="bg-white/10 backdrop-blur p-3 rounded-xl">
                                                <p className="text-[10px] uppercase opacity-70 mb-1">Hướng Tốt nhất</p>
                                                <p className="font-bold text-lg">{result.tot[0].dir}</p>
                                            </div>
                                            <div className="bg-white/10 backdrop-blur p-3 rounded-xl">
                                                <p className="text-[10px] uppercase opacity-70 mb-1">Bản Mệnh</p>
                                                <p className="font-bold text-lg">{result.menh}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Insight */}
                                    <div className="bg-slate-900 text-slate-300 p-6 rounded-3xl border border-slate-800">
                                        <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Sparkles className="text-yellow-400" /> Lời khuyên Chuyên Gia AI</h3>
                                        {aiInsight ? (
                                            <div className="prose prose-invert prose-sm">
                                                <div className="whitespace-pre-wrap">{aiInsight}</div>
                                            </div>
                                        ) : (
                                            <button onClick={handleAiConsult} disabled={isGeneratingAI} className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all flex justify-center items-center gap-2">
                                                {isGeneratingAI ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                                                Xin Lời Khuyên (PRO)
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                                    Nhập thông tin để xem kết quả
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TAB: XEM TUỔI LÀM NHÀ */}
                {tab === 'tuoilamnha' && (
                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 max-w-2xl mx-auto">
                        <h2 className="text-center font-bold text-xl mb-6">Xem Tuổi Làm Nhà / Mua Đất</h2>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Năm sinh gia chủ</label>
                                <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Năm dự kiến làm</label>
                                <input type="number" value={buildYear} onChange={e => setBuildYear(Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold" />
                            </div>
                        </div>
                        <button onClick={handleCheckAge} className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl shadow-lg shadow-orange-500/20 mb-8 transition-all">
                            XEM KẾT QUẢ
                        </button>

                        {ageCheckResult && (
                            <div className="space-y-6">
                                <div className={`p-6 rounded-2xl text-center border-2 ${ageCheckResult.conclusion === 'Tốt' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/50' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/50'}`}>
                                    <p className="uppercase text-xs font-bold tracking-widest mb-2 opacity-60">Kết luận</p>
                                    <h3 className={`text-4xl font-black mb-2 ${ageCheckResult.conclusion === 'Tốt' ? 'text-green-600' : 'text-red-600'}`}>{ageCheckResult.conclusion}</h3>
                                    <p className="font-medium text-slate-600 dark:text-slate-300">
                                        {ageCheckResult.conclusion === 'Tốt'
                                            ? `Năm ${buildYear} rất hợp để gia chủ ${year} động thổ!`
                                            : `Gia chủ nên mượn tuổi hoặc dời sang năm khác.`}
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <span className="font-bold">Kim Lâu</span>
                                        {ageCheckResult.kimLau ? <span className="text-red-500 font-bold flex items-center gap-1"><AlertTriangle size={16} /> Phạm</span> : <span className="text-green-500 font-bold flex items-center gap-1"><CheckCircle size={16} /> Không phạm</span>}
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <span className="font-bold">Hoang Ốc</span>
                                        {ageCheckResult.hoangOc ? <span className="text-red-500 font-bold flex items-center gap-1"><AlertTriangle size={16} /> Phạm</span> : <span className="text-green-500 font-bold flex items-center gap-1"><CheckCircle size={16} /> Không phạm</span>}
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                        <span className="font-bold">Tam Tai</span>
                                        {ageCheckResult.tamTai ? <span className="text-red-500 font-bold flex items-center gap-1"><AlertTriangle size={16} /> Phạm</span> : <span className="text-green-500 font-bold flex items-center gap-1"><CheckCircle size={16} /> Không phạm</span>}
                                    </div>
                                </div>

                                {ageCheckResult.details.length > 0 && (
                                    <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl text-sm text-red-700 dark:text-red-400">
                                        <span className="font-bold block mb-1">Chi tiết phạm:</span>
                                        <ul className="list-disc list-inside">
                                            {ageCheckResult.details.map((d, i) => <li key={i}>{d}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: THƯỚC LỖ BAN */}
                {tab === 'luban' && (
                    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 max-w-2xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="font-bold text-xl mb-2">Thước Lỗ Ban 52.2cm</h2>
                            <p className="text-sm text-slate-500">Dành cho Cửa đi, Cửa sổ (Thông thủy)</p>
                        </div>

                        <div className="mb-8">
                            <div className="relative">
                                <input
                                    type="number"
                                    className="w-full p-6 text-center text-5xl font-black bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none"
                                    placeholder="0"
                                    value={lubanSize}
                                    onChange={(e) => handleCheckLuBan(Number(e.target.value))}
                                />
                                <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 font-bold">cm</span>
                            </div>
                            <input
                                type="range" min="0" max="500" step="1"
                                className="w-full mt-4 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                value={lubanSize}
                                onChange={(e) => handleCheckLuBan(Number(e.target.value))}
                            />
                        </div>

                        {lubanResult && (
                            <div className={`p-8 rounded-3xl text-center transition-all ${lubanResult.status === 'Tốt' ? 'bg-red-600 text-white shadow-xl shadow-red-500/30' : 'bg-slate-800 text-slate-400'}`}>
                                <p className="uppercase text-xs font-bold tracking-[0.2em] mb-4 opacity-80">{lubanResult.status === 'Tốt' ? 'CUNG TỐT (ĐỎ)' : 'CUNG XẤU (ĐEN)'}</p>
                                <h3 className="text-4xl font-black mb-4 uppercase">{lubanResult.cung}</h3>
                                <div className="h-0.5 w-16 bg-white/30 mx-auto mb-4"></div>
                                <p className="text-lg font-medium opacity-90">{lubanResult.yNghia}</p>
                            </div>
                        )}

                        <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center text-sm text-slate-500">
                            Nên chọn kích thước rơi vào cung Đỏ (Tốt) để đón tài lộc.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
