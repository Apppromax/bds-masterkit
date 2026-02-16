import React, { useState } from 'react';
import { Compass, User, Info, Save } from 'lucide-react';
import { calculateFengShui, type Gender } from '../services/fengShui';

export default function FengShui() {
    const [year, setYear] = useState<number>(1990);
    const [gender, setGender] = useState<Gender>('male');
    const [result, setResult] = useState<ReturnType<typeof calculateFengShui> | null>(null);

    const handleCalculate = () => {
        if (year < 1920 || year > 2030) {
            alert('Năm sinh không hợp lệ');
            return;
        }
        const res = calculateFengShui(year, gender);
        setResult(res);
    };

    return (
        <div className="pb-20 md:pb-0">
            <div className="mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Compass className="text-blue-600" /> Tra Cứu Phong Thủy
                </h1>
                <p className="text-slate-500 text-sm">Xem hướng nhà hợp tuổi gia chủ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass p-8 rounded-2xl shadow-sm h-fit">
                    <h2 className="font-semibold text-lg mb-6 flex items-center gap-2 text-slate-800 dark:text-white">
                        <User size={20} className="text-blue-500" /> Thông tin gia chủ
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Năm sinh (Dương lịch)</label>
                            <input
                                type="number"
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg font-semibold text-center focus:ring-2 focus:ring-blue-500 outline-none"
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Giới tính</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setGender('male')}
                                    className={`p-3 rounded-xl border font-medium transition-all ${gender === 'male'
                                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                                        }`}
                                >
                                    Nam
                                </button>
                                <button
                                    onClick={() => setGender('female')}
                                    className={`p-3 rounded-xl border font-medium transition-all ${gender === 'female'
                                        ? 'bg-pink-50 border-pink-500 text-pink-700'
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                                        }`}
                                >
                                    Nữ
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={handleCalculate}
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
                        >
                            Xem Kết Quả
                        </button>
                    </div>
                </div>

                {/* Results */}
                {result ? (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-slate-500 text-sm">Quẻ mệnh</h3>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{result.cung}</p>
                                </div>
                                <div className="text-right">
                                    <h3 className="text-slate-500 text-sm">Thuộc nhóm</h3>
                                    <p className={`text-xl font-bold ${result.nhom === 'Đông Tứ Trạch' ? 'text-green-600' : 'text-amber-600'}`}>
                                        {result.nhom}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm">
                                <Info size={16} className="text-blue-500" />
                                <span>Màu hợp mệnh: Vàng, Nâu, Trắng (Demo)</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-2xl border border-green-100 dark:border-green-800/30">
                                <h3 className="font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Hướng Tốt (Cát)
                                </h3>
                                <ul className="space-y-2">
                                    {result.tot.map((item) => (
                                        <li key={item.dir} className="flex justify-between text-sm">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{item.dir}</span>
                                            <span className="text-slate-500 text-xs">{item.ynghia}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl border border-red-100 dark:border-red-800/30">
                                <h3 className="font-bold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span> Hướng Xấu (Hung)
                                </h3>
                                <ul className="space-y-2">
                                    {result.xau.map((item) => (
                                        <li key={item.dir} className="flex justify-between text-sm">
                                            <span className="font-medium text-slate-700 dark:text-slate-300">{item.dir}</span>
                                            <span className="text-slate-500 text-xs">{item.ynghia}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <button className="w-full py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                            <Save size={18} /> Lưu thông tin khách
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-400">
                        <Compass size={48} className="mb-4 opacity-20" />
                        <p>Nhập năm sinh để xem phong thủy</p>
                    </div>
                )}
            </div>
        </div>
    );
}
