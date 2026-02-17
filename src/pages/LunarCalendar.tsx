import React, { useState, useEffect } from 'react';
/* @ts-ignore */
import { Solar, Lunar } from 'lunar-javascript';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Moon, Sun, Info, Grid, Layout } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';

// --- UTILS ---
const PHIEN_AM_CAN: Record<string, string> = {
    '甲': 'Giáp', '乙': 'Ất', '丙': 'Bính', '丁': 'Đinh', '戊': 'Mậu',
    '己': 'Kỷ', '庚': 'Canh', '辛': 'Tân', '壬': 'Nhâm', '癸': 'Quý'
};
const PHIEN_AM_CHI: Record<string, string> = {
    '子': 'Tý', '丑': 'Sửu', '寅': 'Dần', '卯': 'Mão', '辰': 'Thìn', '巳': 'Tỵ',
    '午': 'Ngọ', '未': 'Mùi', '申': 'Thân', '酉': 'Dậu', '戌': 'Tuất', '亥': 'Hợi'
};

const translateCanChi = (canChiStr: string) => {
    // "甲辰" -> "Giáp Thìn"
    if (!canChiStr) return '';
    return canChiStr.split('').map(part => {
        return PHIEN_AM_CAN[part] || PHIEN_AM_CHI[part] || part;
    }).join(' ');
};

const getGioHoangDao = (lunarDate: any) => {
    // Logic tính giờ hoàng đạo theo Chi Ngày
    const chiNgay = lunarDate.getDayZhi(); // "子", "丑"...

    // Bảng tính giờ hoàng đạo
    const map: Record<string, string[]> = {
        '子': ['Tý (23-1)', 'Sửu (1-3)', 'Mão (5-7)', 'Ngọ (11-13)', 'Thân (15-17)', 'Dậu (17-19)'],
        '午': ['Tý (23-1)', 'Sửu (1-3)', 'Mão (5-7)', 'Ngọ (11-13)', 'Thân (15-17)', 'Dậu (17-19)'],

        '丑': ['Dần (3-5)', 'Mão (5-7)', 'Tỵ (9-11)', 'Thân (15-17)', 'Tuất (19-21)', 'Hợi (21-23)'],
        '未': ['Dần (3-5)', 'Mão (5-7)', 'Tỵ (9-11)', 'Thân (15-17)', 'Tuất (19-21)', 'Hợi (21-23)'],

        '寅': ['Tý (23-1)', 'Sửu (1-3)', 'Thìn (7-9)', 'Tỵ (9-11)', 'Mùi (13-15)', 'Tuất (19-21)'],
        '申': ['Tý (23-1)', 'Sửu (1-3)', 'Thìn (7-9)', 'Tỵ (9-11)', 'Mùi (13-15)', 'Tuất (19-21)'],

        '卯': ['Tý (23-1)', 'Dần (3-5)', 'Mão (5-7)', 'Ngọ (11-13)', 'Mùi (13-15)', 'Dậu (17-19)'],
        '酉': ['Tý (23-1)', 'Dần (3-5)', 'Mão (5-7)', 'Ngọ (11-13)', 'Mùi (13-15)', 'Dậu (17-19)'],

        '辰': ['Dần (3-5)', 'Thìn (7-9)', 'Tỵ (9-11)', 'Thân (15-17)', 'Dậu (17-19)', 'Hợi (21-23)'],
        '戌': ['Dần (3-5)', 'Thìn (7-9)', 'Tỵ (9-11)', 'Thân (15-17)', 'Dậu (17-19)', 'Hợi (21-23)'],

        '巳': ['Sửu (1-3)', 'Thìn (7-9)', 'Ngọ (11-13)', 'Mùi (13-15)', 'Tuất (19-21)', 'Hợi (21-23)'],
        '亥': ['Sửu (1-3)', 'Thìn (7-9)', 'Ngọ (11-13)', 'Mùi (13-15)', 'Tuất (19-21)', 'Hợi (21-23)']
    };

    return map[chiNgay] || ['Đang cập nhật...'];
};

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

    const handlePrev = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'day') newDate.setDate(currentDate.getDate() - 1);
        else newDate.setMonth(currentDate.getMonth() - 1);
        setCurrentDate(newDate);
    };

    const handleNext = () => {
        const newDate = new Date(currentDate);
        if (viewMode === 'day') newDate.setDate(currentDate.getDate() + 1);
        else newDate.setMonth(currentDate.getMonth() + 1);
        setCurrentDate(newDate);
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    if (!lunarDate) return null;

    // --- RENDER HELPERS ---
    const renderDayView = () => {
        const namCanChi = translateCanChi(lunarDate.getYearInGanZhi());
        const thangCanChi = translateCanChi(lunarDate.getMonthInGanZhi());
        const ngayCanChi = translateCanChi(lunarDate.getDayInGanZhi());
        const gioHoangDao = getGioHoangDao(lunarDate);

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Main Calendar Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                    {/* Header */}
                    <div className="bg-blue-600 p-6 text-white text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CalendarIcon size={120} />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-lg font-medium opacity-90 uppercase tracking-widest mb-1">
                                {format(currentDate, 'EEEE', { locale: vi })}
                            </h2>
                            <h3 className="text-3xl font-black">
                                {format(currentDate, 'dd/MM/yyyy', { locale: vi })}
                            </h3>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                        <button onClick={handlePrev} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={handleToday} className="px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-100 transition-colors">
                            Hôm nay
                        </button>
                        <button onClick={handleNext} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 text-center">
                        <div className="flex flex-col items-center">
                            <div className="mb-2 text-slate-500 font-medium uppercase tracking-wider text-sm">Lịch Âm (Lunar)</div>

                            <div className="flex items-end justify-center gap-2 mb-4 leading-none">
                                <span className="text-[120px] font-black text-slate-800 dark:text-white leading-none">
                                    {lunarDate.getDay()}
                                </span>
                                <div className="flex flex-col items-start pb-4">
                                    <span className="text-xl font-bold text-slate-600 dark:text-slate-400">/ {lunarDate.getMonth()}</span>
                                    <span className="text-sm font-medium text-slate-400">Năm {lunarDate.getYear()}</span>
                                </div>
                            </div>

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

                {/* Additional Info */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-8 rounded-3xl text-white relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 p-6 opacity-20">
                            <Moon size={100} />
                        </div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Info size={20} className="text-blue-400" /> Thông tin bổ sung
                        </h3>
                        <div className="space-y-4 relative z-10">
                            <div>
                                <strong className="text-white block mb-2 opacity-90">Giờ Hoàng Đạo trong ngày:</strong>
                                <div className="grid grid-cols-2 gap-2">
                                    {gioHoangDao.map((h: string) => (
                                        <span key={h} className="text-xs bg-white/10 px-2 py-1 rounded text-slate-200">{h}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <strong className="text-white block mb-1 opacity-90">Tiết khí:</strong>
                                <span className="text-blue-300 font-medium">{lunarDate.getJieQi()}</span>
                            </div>
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
        );
    };

    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: startDate, end: endDate });

        const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

        return (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={handlePrev} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><ChevronLeft /></button>
                    <h2 className="text-xl font-bold capitalize text-slate-800 dark:text-white">
                        {format(currentDate, 'MMMM yyyy', { locale: vi })}
                    </h2>
                    <button onClick={handleNext} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><ChevronRight /></button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(d => (
                        <div key={d} className="text-center text-sm font-bold text-slate-400 py-2">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, idx) => {
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, new Date());

                        // Get Lunar
                        const solar = Solar.fromYmd(day.getFullYear(), day.getMonth() + 1, day.getDate());
                        const lunar = solar.getLunar();
                        const lDay = lunar.getDay();
                        const isLFirst = lDay === 1;

                        return (
                            <div
                                key={idx}
                                onClick={() => { setCurrentDate(day); setViewMode('day'); }}
                                className={`
                                    min-h-[80px] p-2 rounded-xl flex flex-col justify-between cursor-pointer border transition-all
                                    ${isToday ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : ''}
                                    ${!isCurrentMonth ? 'opacity-30 bg-slate-50 dark:bg-slate-800/50 border-transparent' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-300'}
                                `}
                            >
                                <span className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-slate-700 dark:text-slate-200'}`}>
                                    {format(day, 'd')}
                                </span>
                                <div className="text-xs text-right">
                                    <span className={`${isLFirst ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                        {isLFirst ? `${lDay}/${lunar.getMonth()}` : lDay}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="pb-20 md:pb-0">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                        <CalendarIcon className="text-blue-600" /> Tra Cứu Lịch Âm
                    </h1>
                    <p className="text-slate-500 text-sm">Xem ngày tốt xấu, giờ hoàng đạo chuẩn xác</p>
                </div>

                <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl w-fit">
                    <button
                        onClick={() => setViewMode('day')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'day' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}
                    >
                        <Layout size={16} /> Ngày
                    </button>
                    <button
                        onClick={() => setViewMode('month')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'month' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500'}`}
                    >
                        <Grid size={16} /> Tháng
                    </button>
                </div>
            </div>

            {viewMode === 'day' ? renderDayView() : renderMonthView()}
        </div>
    );
}
