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

        // Advanced Feng Shui Logic
        const isGoodDay = ['Mão', 'Ngọ', 'Thìn', 'Dần'].some(c => ngayCanChi.includes(c));
        const tietKhi = lunarDate.getJieQi();

        return (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* Large Date Display Card */}
                <div className="xl:col-span-2 relative">
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full"></div>
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-600/10 blur-[120px] rounded-full"></div>

                    <div className="glass-morphism rounded-[2.5rem] border border-white/20 dark:border-white/10 shadow-2xl overflow-hidden relative z-10">
                        {/* Upper Section: Solar Header */}
                        <div className="p-8 pb-4 flex justify-between items-start">
                            <div>
                                <h2 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter">
                                    {format(currentDate, 'MM yyyy')}
                                </h2>
                                <p className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs mt-1">
                                    {format(currentDate, 'EEEE', { locale: vi })}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handlePrev} className="p-3 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm border border-white/20">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={handleToday} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                                    Today
                                </button>
                                <button onClick={handleNext} className="p-3 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all shadow-sm border border-white/20">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Main Body: Big Lunar Number */}
                        <div className="flex flex-col items-center py-10 relative">
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none">
                                <span className="text-[25vw] font-black">{lunarDate.getDay()}</span>
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-10 blur-xl transition-all duration-500"></div>
                                <span className="text-[180px] md:text-[220px] font-black leading-none bg-gradient-to-b from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent drop-shadow-sm">
                                    {lunarDate.getDay()}
                                </span>
                            </div>

                            <div className="mt-4 flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Tháng Âm</div>
                                    <div className="text-2xl font-black text-slate-700 dark:text-slate-200">{lunarDate.getMonth()}</div>
                                </div>
                                <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>
                                <div className="text-center">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Dương Lịch</div>
                                    <div className="text-2xl font-black text-blue-600">{format(currentDate, 'd')}</div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Grid: Can Chi Details */}
                        <div className="grid grid-cols-3 border-t border-slate-100 dark:border-white/5">
                            <div className="p-6 text-center border-r border-slate-100 dark:border-white/5 hover:bg-amber-500/[0.02] transition-colors">
                                <div className="text-[9px] font-black text-amber-600/60 uppercase tracking-widest mb-2 font-black">Năm</div>
                                <div className="text-sm font-black text-slate-800 dark:text-slate-200">{namCanChi}</div>
                            </div>
                            <div className="p-6 text-center border-r border-slate-100 dark:border-white/5 hover:bg-emerald-500/[0.02] transition-colors">
                                <div className="text-[9px] font-black text-emerald-600/60 uppercase tracking-widest mb-2 font-black">Tháng</div>
                                <div className="text-sm font-black text-slate-800 dark:text-slate-200">{thangCanChi}</div>
                            </div>
                            <div className="p-6 text-center hover:bg-purple-500/[0.02] transition-colors">
                                <div className="text-[9px] font-black text-purple-600/60 uppercase tracking-widest mb-2 font-black">Ngày</div>
                                <div className="text-sm font-black text-slate-800 dark:text-slate-200">{ngayCanChi}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info Panel */}
                <div className="space-y-6">
                    {/* Good/Bad Status Card */}
                    <div className={`p-8 rounded-[2rem] shadow-xl relative overflow-hidden transition-all duration-500 ${isGoodDay ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white' : 'bg-gradient-to-br from-indigo-900 to-slate-900 text-white'}`}>
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            {isGoodDay ? <Sun size={80} /> : <Moon size={80} />}
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                                {isGoodDay ? '🌟 Ngày Đại Cát' : '🌙 Thông tin ngày'}
                            </div>
                            <h3 className="text-2xl font-bold mb-2">{isGoodDay ? 'Ngày Tuyệt Vời' : 'Ngày Bình Thường'}</h3>
                            <p className="text-white/70 text-sm leading-relaxed">
                                {isGoodDay
                                    ? "Thời điểm cực tốt để ký kết hợp đồng, khởi công hoặc mở bán dự án BĐS mới."
                                    : "Thích hợp cho các công việc nghiên cứu, lập kế hoạch hoặc khảo sát hiện trường."}
                            </p>
                        </div>
                    </div>

                    {/* Lucky Hours Panel */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h4 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
                            <Clock size={14} className="text-blue-500" /> Giờ Hoàng Đạo
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            {gioHoangDao.map((h: string) => (
                                <div key={h} className="group p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-transparent hover:border-blue-400 transition-all cursor-default">
                                    <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">Cát</div>
                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">{h}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Insights Card */}
                    <div className="bg-slate-900 dark:bg-slate-800 p-6 rounded-[2rem] text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Tiết Khí</span>
                                <Info size={14} className="text-slate-500" />
                            </div>
                            <div className="text-xl font-black mb-1 capitalize">{tietKhi}</div>
                            <p className="text-xs text-slate-400">Ảnh hưởng mạnh đến năng lượng đất đai và vượng khí dự án.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: startDate, end: endDate });

        const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

        return (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 animate-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex gap-2">
                        <button onClick={handlePrev} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all border border-slate-100 dark:border-slate-800"><ChevronLeft size={20} /></button>
                        <button onClick={handleNext} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all border border-slate-100 dark:border-slate-800"><ChevronRight size={20} /></button>
                    </div>
                    <h2 className="text-2xl font-black capitalize text-slate-800 dark:text-white tracking-tight">
                        {format(currentDate, 'MMMM yyyy', { locale: vi })}
                    </h2>
                    <button onClick={handleToday} className="px-6 py-2.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-all">
                        Trở lại hôm nay
                    </button>
                </div>

                <div className="grid grid-cols-7 mb-4">
                    {weekDays.map(d => (
                        <div key={d} className="text-center text-xs font-black text-slate-400 uppercase tracking-widest py-2">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {days.map((day, idx) => {
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, new Date());
                        const solar = Solar.fromYmd(day.getFullYear(), day.getMonth() + 1, day.getDate());
                        const lunar = solar.getLunar();
                        const lDay = lunar.getDay();
                        const isLFirst = lDay === 1;

                        return (
                            <div
                                key={idx}
                                onClick={() => { setCurrentDate(day); setViewMode('day'); }}
                                className={`
                                    min-h-[100px] p-4 rounded-3xl flex flex-col justify-between cursor-pointer border transition-all duration-300 group
                                    ${isToday ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/20' : ''}
                                    ${!isCurrentMonth ? 'opacity-20 bg-slate-50 dark:bg-slate-800/50 border-transparent pointer-events-none' : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-white/5 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1'}
                                `}
                            >
                                <span className={`text-xl font-black ${isToday ? 'text-white' : 'text-slate-800 dark:text-slate-200'} group-hover:text-blue-600 ${isToday ? 'group-hover:text-white' : ''}`}>
                                    {format(day, 'd')}
                                </span>
                                <div className="text-right">
                                    <span className={`text-[10px] font-black ${isToday ? 'text-white/80' : isLFirst ? 'text-red-500' : 'text-slate-400'}`}>
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
        <div className="pb-20 md:pb-10 max-w-7xl mx-auto">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-1 bg-blue-600 rounded-full"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Smart Calendar System</span>
                    </div>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 bg-clip-text text-transparent flex items-center gap-4">
                        <CalendarIcon size={36} className="text-blue-600" /> Lịch Vạn Niên Pro
                    </h1>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit shadow-inner border border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => setViewMode('day')}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'day' ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Layout size={16} /> Ngày
                    </button>
                    <button
                        onClick={() => setViewMode('month')}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'month' ? 'bg-white dark:bg-slate-700 shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Grid size={16} /> Tháng
                    </button>
                </div>
            </div>

            {viewMode === 'day' ? renderDayView() : renderMonthView()}
        </div>
    );
}

// Icon helper
const Clock = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);
