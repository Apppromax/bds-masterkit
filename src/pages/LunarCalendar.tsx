import React, { useState, useEffect } from 'react';
/* @ts-ignore */
import { Solar, Lunar } from 'lunar-javascript';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Moon, Sun, Info, Grid, Layout, Clock } from 'lucide-react';
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
    if (!canChiStr) return '';
    return canChiStr.split('').map(part => {
        return PHIEN_AM_CAN[part] || PHIEN_AM_CHI[part] || part;
    }).join(' ');
};

const getGioHoangDao = (lunarDate: any) => {
    const chiNgay = lunarDate.getDayZhi();
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
    return map[chiNgay] || ['...'];
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

    const handleToday = () => setCurrentDate(new Date());

    if (!lunarDate) return null;

    const renderDayView = () => {
        const namCanChi = translateCanChi(lunarDate.getYearInGanZhi());
        const thangCanChi = translateCanChi(lunarDate.getMonthInGanZhi());
        const ngayCanChi = translateCanChi(lunarDate.getDayInGanZhi());
        const gioHoangDao = getGioHoangDao(lunarDate);
        const isGoodDay = ['Mão', 'Ngọ', 'Thìn', 'Dần'].some(c => ngayCanChi.includes(c));
        const tietKhi = lunarDate.getJieQi();

        return (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Large Date Display Card */}
                <div className="xl:col-span-8 relative">
                    <div className="glass-card bg-white/[0.02] rounded-[2rem] border border-white/5 shadow-2xl overflow-hidden relative z-10">
                        {/* Upper Section */}
                        <div className="p-6 md:p-8 pb-4 flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                                    {format(currentDate, 'MMMM / yyyy', { locale: vi })}
                                </h2>
                                <p className="text-gold font-black uppercase tracking-[0.3em] text-[10px] mt-1">
                                    {format(currentDate, 'EEEE', { locale: vi })}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handlePrev} className="p-3 bg-white/5 hover:bg-[#bf953f]/10 rounded-xl transition-all border border-white/5 active:scale-95">
                                    <ChevronLeft size={18} className="text-[#bf953f]" />
                                </button>
                                <button onClick={handleToday} className="px-5 py-3 bg-[#bf953f] text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#bf953f]/20">
                                    HÔM NAY
                                </button>
                                <button onClick={handleNext} className="p-3 bg-white/5 hover:bg-[#bf953f]/10 rounded-xl transition-all border border-white/5 active:scale-95">
                                    <ChevronRight size={18} className="text-[#bf953f]" />
                                </button>
                            </div>
                        </div>

                        {/* Main Body */}
                        <div className="flex flex-col items-center py-8 relative">
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
                                <span className="text-[30vw] font-black italic">{lunarDate.getDay()}</span>
                            </div>

                            <div className="relative group p-4">
                                <div className="absolute -inset-4 bg-[#bf953f]/20 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-all duration-700"></div>
                                <span className="text-[140px] md:text-[180px] font-black leading-none bg-gradient-to-b from-[#fcf6ba] via-[#bf953f] to-[#aa771c] bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(191,149,63,0.3)]">
                                    {lunarDate.getDay()}
                                </span>
                            </div>

                            <div className="mt-2 flex items-center gap-8">
                                <div className="text-center">
                                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Tháng Âm</div>
                                    <div className="text-xl font-black text-gold">{lunarDate.getMonth()}</div>
                                </div>
                                <div className="w-px h-10 bg-white/10"></div>
                                <div className="text-center">
                                    <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Dương Lịch</div>
                                    <div className="text-xl font-black text-white">{format(currentDate, 'd')}</div>
                                </div>
                            </div>
                        </div>

                        {/* Can Chi Grid */}
                        <div className="grid grid-cols-3 border-t border-white/5 bg-white/[0.01]">
                            {[
                                { label: 'Kỷ Năm', val: namCanChi },
                                { label: 'Kỷ Tháng', val: thangCanChi },
                                { label: 'Kỷ Ngày', val: ngayCanChi }
                            ].map((item, idx) => (
                                <div key={idx} className={`p-5 text-center transition-colors border-r border-white/5 last:border-0 hover:bg-[#bf953f]/5`}>
                                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">{item.label}</div>
                                    <div className="text-[12px] font-black text-[#fcf6ba] uppercase">{item.val}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="xl:col-span-4 space-y-6">
                    <div className={`p-8 rounded-[2rem] border transition-all duration-500 relative overflow-hidden ${isGoodDay ? 'bg-gradient-to-br from-[#bf953f]/20 to-transparent border-[#bf953f]/30' : 'bg-white/[0.02] border-white/5'}`}>
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            {isGoodDay ? <Sun size={60} className="text-gold" /> : <Moon size={60} className="text-slate-500" />}
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-[#bf953f] text-black px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-4">
                                {isGoodDay ? '🌟 Ngày Đại Cát' : '🌙 Thông tin ngày'}
                            </div>
                            <h3 className="text-xl font-black mb-2 text-white italic uppercase tracking-tighter">{isGoodDay ? 'Ngày Tuyệt Vời' : 'Ngày Bình Thường'}</h3>
                            <p className="text-slate-400 text-xs leading-relaxed font-medium">
                                {isGoodDay
                                    ? "Thời điểm cực tốt để ký kết hợp đồng, khởi công hoặc mở bán dự án BĐS mới. Vạn sự hanh thông."
                                    : "Thích hợp cho các công việc nghiên cứu, lập kế hoạch hoặc khảo sát hiện trường dự án."}
                            </p>
                        </div>
                    </div>

                    <div className="glass-card bg-white/[0.02] border-white/5 p-7 rounded-[2rem]">
                        <h4 className="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest mb-5">
                            <Clock size={12} className="text-gold" strokeWidth={3} /> Giờ Hoàng Đạo
                        </h4>
                        <div className="grid grid-cols-2 gap-2.5">
                            {gioHoangDao.map((h: string) => (
                                <div key={h} className="group p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#bf953f]/30 transition-all cursor-default">
                                    <div className="text-[8px] font-black text-gold mb-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase">Elite</div>
                                    <div className="text-[11px] font-bold text-slate-300">{h}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#1a1a1a] to-black p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#bf953f]/10 to-transparent"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#bf953f]">Tiết Khí</span>
                                <Info size={14} className="text-slate-600" />
                            </div>
                            <div className="text-2xl font-black mb-1 capitalize text-white italic tracking-tighter">{tietKhi}</div>
                            <p className="text-[10px] text-slate-500 font-medium">Ảnh hưởng mạnh đến năng lượng đất đai và vượng khí chung.</p>
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
            <div className="glass-card bg-white/[0.02] rounded-[2.5rem] border border-white/5 p-6 md:p-8 animate-in zoom-in-95 duration-500">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div className="flex gap-2">
                        <button onClick={handlePrev} className="p-3 bg-white/5 hover:bg-[#bf953f]/10 rounded-xl transition-all border border-white/5">
                            <ChevronLeft size={18} className="text-[#bf953f]" />
                        </button>
                        <button onClick={handleNext} className="p-3 bg-white/5 hover:bg-[#bf953f]/10 rounded-xl transition-all border border-white/5">
                            <ChevronRight size={18} className="text-[#bf953f]" />
                        </button>
                    </div>
                    <h2 className="text-2xl font-black capitalize text-white tracking-tight italic uppercase">
                        {format(currentDate, 'MMMM yyyy', { locale: vi })}
                    </h2>
                    <button onClick={handleToday} className="px-5 py-2.5 bg-[#bf953f]/10 text-[#bf953f] border border-[#bf953f]/20 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-[#bf953f] hover:text-black transition-all">
                        Trở lại hôm nay
                    </button>
                </div>

                <div className="grid grid-cols-7 mb-4 border-b border-white/5">
                    {weekDays.map(d => (
                        <div key={d} className="text-center text-[9px] font-black text-slate-500 uppercase tracking-widest py-3">{d}</div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-1.5 md:gap-2">
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
                                    min-h-[85px] p-3 rounded-2xl flex flex-col justify-between cursor-pointer border transition-all duration-300 group
                                    ${isToday ? 'bg-[#bf953f] border-[#bf953f]' : ''}
                                    ${!isCurrentMonth ? 'opacity-5 bg-white/5 border-transparent pointer-events-none' : 'bg-white/5 border-white/5 hover:border-[#bf953f]/50 hover:bg-[#bf953f]/5'}
                                `}
                            >
                                <span className={`text-lg font-black ${isToday ? 'text-black' : 'text-slate-200'} ${!isToday && 'group-hover:text-gold'}`}>
                                    {format(day, 'd')}
                                </span>
                                <div className="text-right">
                                    <span className={`text-[9px] font-black ${isToday ? 'text-black/60' : isLFirst ? 'text-[#bf953f]' : 'text-slate-500'}`}>
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
        <div className="pb-10 max-w-7xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                        <CalendarIcon size={24} className="text-[#bf953f]" strokeWidth={3} />
                        Lịch Vạn Niên <span className="text-gold italic">Pro</span>
                    </h1>
                    <p className="text-slate-500 text-[9px] font-bold tracking-[0.3em] uppercase mt-1">Spiritual & Real Estate Calendar</p>
                </div>

                <div className="flex bg-white/5 p-1 rounded-2xl w-fit gap-1 border border-white/5 shadow-inner">
                    <button
                        onClick={() => setViewMode('day')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'day' ? 'bg-[#bf953f] text-black shadow-lg shadow-[#bf953f]/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Layout size={14} strokeWidth={3} /> Chi tiết
                    </button>
                    <button
                        onClick={() => setViewMode('month')}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'month' ? 'bg-[#bf953f] text-black shadow-lg shadow-[#bf953f]/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Grid size={14} strokeWidth={3} /> Tổng quát
                    </button>
                </div>
            </div>

            {viewMode === 'day' ? renderDayView() : renderMonthView()}
        </div>
    );
}
