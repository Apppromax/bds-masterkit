import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Sun, Moon, RefreshCw, AlertCircle } from 'lucide-react';
import * as LunarLib from 'lunar-javascript';

// Handle CJS/ESM interop safely
const Solar = (LunarLib as any).Solar || (LunarLib as any).default?.Solar;

export default function LunarCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());
    const [lunarDate, setLunarDate] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const translateGanZhi = (text: string) => {
        if (!text) return text;
        const map: Record<string, string> = {
            '甲': 'Giáp', '乙': 'Ất', '丙': 'Bính', '丁': 'Đinh', '戊': 'Mậu',
            '己': 'Kỷ', '庚': 'Canh', '辛': 'Tân', '壬': 'Nhâm', '癸': 'Quý',
            '子': 'Tý', '丑': 'Sửu', '寅': 'Dần', '卯': 'Mão', '辰': 'Thìn',
            '巳': 'Tỵ', '午': 'Ngọ', '未': 'Mùi', '申': 'Thân', '酉': 'Dậu',
            '戌': 'Tuất', '亥': 'Hợi',
            '年': 'Năm', '月': 'Tháng', '日': 'Ngày', '时': 'Giờ',
            // 24 Solar Terms
            '立春': 'Lập Xuân', '雨水': 'Vũ Thủy', '惊蛰': 'Kinh Trập', '春分': 'Xuân Phân',
            '清明': 'Thanh Minh', '谷雨': 'Cốc Vũ', '立夏': 'Lập Hạ', '小满': 'Tiểu Mãn',
            '芒种': 'Mang Chủng', '夏至': 'Hạ Chí', '小暑': 'Tiểu Thử', '大暑': 'Đại Thử',
            '立秋': 'Lập Thu', '处暑': 'Xử Thử', '白露': 'Bạch Lộ', '秋分': 'Thu Phân',
            '寒露': 'Hàn Lộ', '霜降': 'Sương Giáng', '立冬': 'Lập Đông', '小雪': 'Tiểu Tuyết',
            '大雪': 'Đại Tuyết', '冬至': 'Đông Chí', '小寒': 'Tiểu Hàn', '大寒': 'Đại Hàn'
        };

        // Strategy: First check if the whole string is a solar term
        if (map[text]) return map[text];

        // Otherwise split and translate each character (for GanZhi)
        return text.split('').map(char => map[char] || char).join(' ').replace(/\s+/g, ' ').trim();
    };

    const getLunarFromDate = (date: Date) => {
        try {
            if (!Solar || typeof Solar.fromYmd !== 'function') {
                console.error('[Lunar] Solar library not loaded correctly:', Solar);
                return null;
            }
            const solar = Solar.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate());
            return solar.getLunar();
        } catch (err) {
            console.error('[Lunar] Calculation Error:', err);
            return null;
        }
    };

    useEffect(() => {
        const calculate = () => {
            try {
                setIsLoading(true);
                setError(null);

                if (!Solar) {
                    setError('Thư viện lịch chưa được tải. Vui lòng làm mới trang.');
                    setIsLoading(false);
                    return;
                }

                const result = getLunarFromDate(currentDate);
                if (result) {
                    setLunarDate(result);
                } else {
                    setError('Không thể tính toán lịch cho ngày này.');
                }
            } catch (err: any) {
                console.error('[Lunar] Effect Error:', err);
                setError(err?.message || 'Lỗi không xác định khi tải lịch.');
            } finally {
                setIsLoading(false);
            }
        };

        calculate();
    }, [currentDate]);

    const daysInMonth = () => {
        const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-[#1a2332] rounded-[2rem] border border-red-500/20 shadow-2xl">
                <AlertCircle className="text-red-500 mb-4" size={48} />
                <h2 className="text-xl font-black text-white mb-2 uppercase">Lỗi tải lịch</h2>
                <p className="text-slate-400 mb-6 max-w-md">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 bg-gradient-to-r from-gold to-[#aa771c] text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all"
                >
                    <RefreshCw size={16} /> Làm mới trang
                </button>
            </div>
        );
    }

    if (isLoading && !lunarDate) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] bg-[#1a2332] rounded-[2rem] border border-white/5 shadow-2xl">
                <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin mb-4"></div>
                <p className="text-gold font-black uppercase tracking-widest text-xs animate-pulse">Đang tính toán lịch...</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-100px)] md:h-[calc(100vh-80px)] overflow-hidden flex flex-col md:flex-row gap-4 p-1 md:p-0">
            {/* Left Section: Today Detail - Compact */}
            <div className="w-full md:w-[350px] flex flex-col gap-3 shrink-0 overflow-hidden">
                <div className="bg-gradient-to-br from-[#1a2332] to-[#0f172a] p-5 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden flex-1 flex flex-col justify-center">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/5 blur-[50px] rounded-full"></div>

                    <div className="relative z-10 text-center space-y-4">
                        <div className="inline-flex flex-col items-center px-8 py-5 rounded-[2.5rem] bg-gold/5 border border-gold/20 text-gold shadow-[0_0_40px_rgba(191,149,63,0.1)] mb-4">
                            <div className="text-4xl font-black tracking-[-0.05em] tabular-nums leading-none">
                                {format(currentTime, 'HH:mm:ss')}
                            </div>
                        </div>

                        <div className="pt-2">
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] mb-3 opacity-60">Dương Lịch</p>
                            <h2 className="text-4xl font-black text-white tracking-tight select-none">
                                Ngày {format(currentDate, 'dd')} <span className="text-sm opacity-60 font-bold uppercase mx-1">tháng</span> {format(currentDate, 'M')}
                            </h2>
                            <p className="text-slate-500 font-black text-xs mt-2 tracking-[0.3em] uppercase">Năm {format(currentDate, 'yyyy')}</p>
                        </div>

                        <div className="py-6 border-y border-white/5 my-6">
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.4em] mb-3 opacity-60">Âm Lịch Chi Tiết</p>
                            <h3 className="text-4xl font-black text-[#fcf6ba] tracking-tight">
                                Ngày {lunarDate?.getDay() || '--'} <span className="text-sm opacity-60 font-bold uppercase mx-1">tháng</span> {lunarDate?.getMonth() || '--'}
                            </h3>
                            <p className="text-gold font-black text-sm mt-2 tracking-widest uppercase italic">Năm {translateGanZhi(lunarDate?.getYearInGanZhi()) || '...'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-black/40 p-4 rounded-3xl border border-white/5 hover:border-gold/30 transition-all">
                                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Ngày</p>
                                <p className="text-[10px] font-bold text-white truncate">{translateGanZhi(lunarDate?.getDayInGanZhi()) || '...'}</p>
                            </div>
                            <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Giờ</p>
                                <p className="text-[10px] font-bold text-white truncate">{translateGanZhi(lunarDate?.getTimeZhi()) || '...'} (Hoàng đạo)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a2332] p-4 rounded-[1.5rem] border border-white/5 shadow-xl shrink-0">
                    <div className="flex items-center gap-3 text-gold mb-2">
                        <Sun size={18} />
                        <p className="text-xs font-black uppercase tracking-widest">Tiết khí: <span className="text-white ml-2">{translateGanZhi(lunarDate?.getJieQi()) || 'Lập Xuân'}</span></p>
                    </div>
                </div>
            </div>

            {/* Right Section: Calendar Grid - Forced One Page Layout */}
            <div className="flex-1 flex flex-col bg-[#1a2332] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden">
                {/* Header - Compact */}
                <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(191,149,63,0.3)]">
                            <CalendarIcon className="text-black" size={20} />
                        </div>
                        <h2 className="text-lg md:text-xl font-black text-white uppercase italic tracking-tight">Tháng {format(currentDate, 'MM, yyyy')}</h2>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-gold hover:text-black transition-all border border-white/10"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="bg-white/5 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/10"
                        >
                            Hôm nay
                        </button>
                        <button
                            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-gold hover:text-black transition-all border border-white/10"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid - Critical Change: Using flex-1 and no overflow scroll */}
                <div className="flex-1 flex flex-col p-2 md:p-4 overflow-hidden">
                    <div className="grid grid-cols-7 mb-2 shrink-0">
                        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                            <div key={d} className="text-center text-[10px] font-black text-gold/40 uppercase tracking-widest pb-2">{d}</div>
                        ))}
                    </div>

                    <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-1 md:gap-2">
                        {daysInMonth().map((day, idx) => {
                            const lDay = getLunarFromDate(day);
                            const isSelected = isSameDay(day, currentDate);
                            const isCurrentMonth = isSameMonth(day, currentDate);
                            const today = isToday(day);

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentDate(day)}
                                    className={`relative flex flex-col items-center justify-center rounded-xl md:rounded-2xl transition-all border ${isSelected
                                        ? 'bg-gold border-gold text-black shadow-lg shadow-gold/20'
                                        : today
                                            ? 'bg-gold/10 border-gold/50 text-gold'
                                            : isCurrentMonth
                                                ? 'bg-white/[0.02] border-white/5 text-slate-100 hover:bg-white/5 hover:border-white/10'
                                                : 'bg-transparent border-transparent text-slate-700'
                                        }`}
                                >
                                    <span className="text-xs md:text-xl font-black leading-none">{format(day, 'd')}</span>
                                    {isCurrentMonth && (
                                        <span className={`text-[8px] md:text-xs font-bold md:font-black mt-0.5 md:mt-1 ${isSelected ? 'text-black/60' : today ? 'text-gold/60' : 'text-gold/50'}`}>
                                            {lDay?.getDay() === 1 ? `${lDay.getDay()}/${lDay.getMonth()}` : lDay?.getDay()}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
