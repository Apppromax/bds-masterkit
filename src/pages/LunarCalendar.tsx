import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Sun, Moon, RefreshCw, AlertCircle } from 'lucide-react';
import * as LunarLib from 'lunar-javascript';

// Handle CJS/ESM interop safely
const Solar = (LunarLib as any).Solar || (LunarLib as any).default?.Solar;

export default function LunarCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [lunarDate, setLunarDate] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

                    <div className="relative z-10 text-center space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-[10px] font-black uppercase tracking-widest mb-2">
                            <Clock size={12} /> {format(currentDate, 'HH:mm:ss')}
                        </div>

                        <div>
                            <h2 className="text-6xl font-black text-white tracking-tighter mb-1">{format(currentDate, 'dd')}</h2>
                            <p className="text-gold font-black uppercase tracking-[0.2em] text-sm">Tháng {format(currentDate, 'MM')}, {format(currentDate, 'yyyy')}</p>
                        </div>

                        <div className="py-4 border-y border-white/5 my-4">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Âm Lịch</p>
                            <h3 className="text-3xl font-black text-[#fcf6ba] tracking-tight">
                                Ngày {lunarDate?.getDay() || '--'} <span className="text-sm opacity-60">tháng</span> {lunarDate?.getMonth() || '--'}
                            </h3>
                            <p className="text-gold/80 font-bold text-xs mt-1">Năm {lunarDate?.getYearInGanZhi() || '...'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Ngày</p>
                                <p className="text-[10px] font-bold text-white truncate">{lunarDate?.getDayInGanZhi() || '...'}</p>
                            </div>
                            <div className="bg-black/20 p-3 rounded-2xl border border-white/5">
                                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Giờ</p>
                                <p className="text-[10px] font-bold text-white truncate">{lunarDate?.getTimeZhi() || '...'} (Hoàng đạo)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a2332] p-4 rounded-[1.5rem] border border-white/5 shadow-xl shrink-0">
                    <div className="flex items-center gap-3 text-gold mb-2">
                        <Sun size={18} />
                        <p className="text-xs font-black uppercase tracking-widest">Tiết khí: <span className="text-white ml-2">{lunarDate?.getJieQi() || 'Lập Xuân'}</span></p>
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
