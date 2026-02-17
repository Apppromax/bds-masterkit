import React, { useState, useEffect } from 'react';
/* @ts-ignore */
import { Solar, Lunar } from 'lunar-javascript';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Moon, Sun, Info } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function LunarCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [lunarDate, setLunarDate] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'day' | 'month'>('day');

    useEffect(() => {
        const solar = Solar.fromYmd(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            currentDate.getDate()
        );
        const lunar = solar.getLunar();
        setLunarDate(lunar);
    }, [currentDate]);

    const handlePrevDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    if (!lunarDate) return null;

    // Lunar Info
    const lunarDay = lunarDate.getDay();
    const lunarMonth = lunarDate.getMonth();
    const lunarYear = lunarDate.getYear();
    const namCanChi = lunarDate.getYearInGanZhi(); // Giáp Thìn
    const thangCanChi = lunarDate.getMonthInGanZhi();
    const ngayCanChi = lunarDate.getDayInGanZhi();
    const gioHoangDao = lunarDate.getTimeZhi(); // Giờ hoàng đạo (list string?) No, usually library returns just basic info.
    // lunar-javascript is powerful, let's check docs or common methods.
    // getDayInGanZhi() -> can chi ngày
    // getMonthInGanZhi() -> can chi tháng
    // getYearInGanZhi() -> can chi năm

    const dayOfWeek = format(currentDate, 'EEEE', { locale: vi });
    const fullDate = format(currentDate, 'dd/MM/yyyy', { locale: vi });

    return (
        <div className="pb-20 md:pb-0">
            <div className="mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                    <CalendarIcon className="text-blue-600" /> Tra Cứu Lịch Âm
                </h1>
                <p className="text-slate-500 text-sm">Xem ngày tốt xấu, giờ hoàng đạo chuẩn xác</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Calendar Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                    {/* Header */}
                    <div className="bg-blue-600 p-6 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CalendarIcon size={120} />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-lg font-medium opacity-90 uppercase tracking-widest mb-1">{dayOfWeek}</h2>
                            <h3 className="text-3xl font-black">{fullDate}</h3>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                        <button onClick={handlePrevDay} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={handleToday} className="px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-100 transition-colors">
                            Hôm nay
                        </button>
                        <button onClick={handleNextDay} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 text-center">
                        <div className="flex flex-col items-center">
                            <div className="mb-2 text-slate-500 font-medium uppercase tracking-wider text-sm">Lịch Âm (Lunar)</div>

                            {/* Big Lunar Date */}
                            <div className="flex items-end justify-center gap-2 mb-4 leading-none">
                                <span className="text-[120px] font-black text-slate-800 dark:text-white leading-none">
                                    {lunarDay}
                                </span>
                                <div className="flex flex-col items-start pb-4">
                                    <span className="text-xl font-bold text-slate-600 dark:text-slate-400">/ {lunarMonth}</span>
                                    <span className="text-sm font-medium text-slate-400">Năm {lunarYear}</span>
                                </div>
                            </div>

                            {/* Info Badges */}
                            <div className="grid grid-cols-1 gap-3 w-full max-w-xs">
                                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20">
                                    <span className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase">Năm</span>
                                    <span className="font-black text-slate-700 dark:text-slate-200">{namCanChi}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-500 uppercase">Tháng</span>
                                    <span className="font-black text-slate-700 dark:text-slate-200">{thangCanChi}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/20">
                                    <span className="text-xs font-bold text-purple-700 dark:text-purple-500 uppercase">Ngày</span>
                                    <span className="font-black text-slate-700 dark:text-slate-200">{ngayCanChi}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Info / Quotes */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-3xl text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 p-6 opacity-20">
                            <Moon size={100} />
                        </div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Info size={20} className="text-blue-400" /> Thông tin bổ sung
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <p className="text-slate-300">
                                <strong className="text-white block mb-1">Giờ Hoàng Đạo:</strong>
                                Tý (23-1), Dần (3-5), Mão (5-7), Ngọ (11-13), Mùi (13-15), Dậu (17-19).
                                <span className="block text-[10px] italic mt-1 text-slate-500">*Dữ liệu mô phỏng, cần tích hợp thư viện chi tiết hơn để lấy chính xác từng ngày.</span>
                            </p>
                            <p className="text-slate-300">
                                <strong className="text-white block mb-1">Tiết khí:</strong>
                                {lunarDate.getJieQi()}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-3">Sự kiện trong tháng</h4>
                        {/* Placeholder for events */}
                        <div className="text-center py-8 text-slate-400 text-sm">
                            <CalendarIcon size={32} className="mx-auto mb-2 opacity-20" />
                            Không có sự kiện đặc biệt nào.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
