import React, { useState, useEffect } from 'react';
/* @ts-ignore */
import { Solar, Lunar } from 'lunar-javascript';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Moon, Sun, Info, Grid, Layout, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { vi } from 'date-fns/locale';

const PHIEN_AM_CAN: Record<string, string> = { '甲': 'Giáp', '乙': 'Ất', '丙': 'Bính', '丁': 'Đinh', '戊': 'Mậu', '己': 'Kỷ', '庚': 'Canh', '辛': 'Tân', '壬': 'Nhâm', '癸': 'Quý' };
const PHIEN_AM_CHI: Record<string, string> = { '子': 'Tý', '丑': 'Sửu', '寅': 'Dần', '卯': 'Mão', '辰': 'Thìn', '巳': 'Tỵ', '午': 'Ngọ', '未': 'Mùi', '申': 'Thân', '酉': 'Dậu', '戌': 'Tuất', '亥': 'Hợi' };

const translateCanChi = (canChiStr: string) => {
    if (!canChiStr) return '';
    return canChiStr.split('').map(part => PHIEN_AM_CAN[part] || PHIEN_AM_CHI[part] || part).join(' ');
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
        const solar = Solar.fromYmd(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
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

    if (!lunarDate) return null;

    const renderDayView = () => {
        const namCanChi = translateCanChi(lunarDate.getYearInGanZhi());
        const thangCanChi = translateCanChi(lunarDate.getMonthInGanZhi());
        const ngayCanChi = translateCanChi(lunarDate.getDayInGanZhi());
        const gioHoangDao = getGioHoangDao(lunarDate);
        const isGoodDay = ['Mão', 'Ngọ', 'Thìn', 'Dần'].some(c => ngayCanChi.includes(c));
        const tietKhi = lunarDate.getJieQi();

        return (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-4">
                {/* Main Card - Extreme Pop */}
                <div className="xl:col-span-8 relative">
                    <div className="glass-card bg-[#050505] rounded-[2.5rem] border-2 border-white/5 shadow-[0_30px_60px_-10px_rgba(0,0,0,1)] overflow-hidden relative z-10 transition-all hover:border-gold/20">
                        <div className="p-6 md:p-8 flex justify-between items-start bg-white/[0.01]">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter">
                                    {format(currentDate, 'MM / YYYY', { locale: vi })}
                                </h2>
                                <p className="text-gold font-black uppercase tracking-[0.4em] text-[8px] mt-1 italic">
                                    {format(currentDate, 'EEEE', { locale: vi })}
                                </p>
                            </div>
                            <div className="flex gap-1.5">
                                <button onClick={handlePrev} className="p-2.5 bg-white/5 hover:bg-gold/10 rounded-xl border border-white/10 active:scale-90 transition-all group">
                                    <ChevronLeft size={16} className="text-gold group-hover:-translate-x-0.5 transition-transform" />
                                </button>
                                <button onClick={() => setCurrentDate(new Date())} className="px-5 bg-gold text-black rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg hover:brightness-110 active:scale-95 transition-all">HÔM NAY</button>
                                <button onClick={handleNext} className="p-2.5 bg-white/5 hover:bg-gold/10 rounded-xl border border-white/10 active:scale-90 transition-all group">
                                    <ChevronRight size={16} className="text-gold group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col items-center py-6 relative">
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.01] pointer-events-none select-none">
                                <span className="text-[35vw] font-black italic">{lunarDate.getDay()}</span>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-[-10px] bg-gold/10 rounded-full blur-[40px] opacity-0 group-hover:opacity-60 transition-all duration-1000"></div>
                                <span className="text-[140px] md:text-[160px] font-black leading-none bg-gradient-to-b from-white via-gold to-[#aa771c] bg-clip-text text-transparent drop-shadow-[0_10px_40px_rgba(191,149,63,0.4)] italic">
                                    {lunarDate.getDay()}
                                </span>
                            </div>
                            <div className="mt-2 flex items-center gap-10">
                                <div className="text-center">
                                    <p className="text-[6px] font-black text-slate-600 uppercase tracking-widest mb-1">Tháng Âm</p>
                                    <p className="text-xl font-black text-gold mb-[-4px]">{lunarDate.getMonth()}</p>
                                </div>
                                <div className="w-[1px] h-8 bg-white/10"></div>
                                <div className="text-center">
                                    <p className="text-[6px] font-black text-slate-600 uppercase tracking-widest mb-1">Dương Lịch</p>
                                    <p className="text-xl font-black text-white mb-[-4px]">{format(currentDate, 'd')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 border-t border-white/5 bg-black/40">
                            {[{ l: 'Kỷ Năm', v: namCanChi }, { l: 'Kỷ Tháng', v: thangCanChi }, { l: 'Kỷ Ngày', v: ngayCanChi }].map((item, idx) => (
                                <div key={idx} className="p-4 text-center border-r border-white/5 last:border-0 hover:bg-gold/[0.03] transition-colors">
                                    <p className="text-[6px] font-black text-slate-700 uppercase tracking-widest mb-1">{item.l}</p>
                                    <p className="text-[11px] font-black text-gold/80 uppercase italic tracking-tighter">{item.v}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar - High Density Pop */}
                <div className="xl:col-span-4 space-y-5">
                    <div className={`p-7 rounded-[2.5rem] border-2 transition-all duration-700 relative overflow-hidden shadow-2xl ${isGoodDay ? 'bg-gradient-to-br from-gold/10 to-transparent border-gold/30' : 'bg-[#080808] border-white/5'}`}>
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            {isGoodDay ? <Sun size={80} className="text-gold" strokeWidth={1} /> : <Moon size={80} className="text-slate-500" strokeWidth={1} />}
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-gold text-black px-2.5 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-gold/20">
                                {isGoodDay ? '🌟 Ngày Đại Cát' : '🌙 Thông Tin Ngày'}
                            </div>
                            <h3 className="text-lg font-black mb-1 text-white uppercase italic tracking-tighter">{isGoodDay ? 'Ngày Tuyệt Vời' : 'Ngày Bình Thường'}</h3>
                            <p className="text-slate-500 text-[10px] font-medium leading-relaxed italic opacity-80">
                                {isGoodDay ? "Khởi công, ký kết, mở bán vạn sự như ý, lộc lá đầy nhà." : "Nên tập trung khảo sát, lập kế hoạch dự án kỹ lưỡng trong ngày hôm nay."}
                            </p>
                        </div>
                    </div>

                    <div className="glass-card bg-[#080808] border-white/10 p-6 rounded-[2.5rem] shadow-xl">
                        <h4 className="flex items-center gap-2 text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mb-4">
                            <Clock size={12} className="text-gold" strokeWidth={3} /> Giờ Hoàng Đạo
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            {gioHoangDao.map((h: string) => (
                                <div key={h} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all text-center">
                                    <p className="text-[10px] font-bold text-slate-300 tracking-tight">{h}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-black p-5 rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-xl border-l-4 border-l-gold">
                        <div className="absolute inset-0 bg-gradient-to-tr from-gold/5 via-transparent to-transparent"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-[7px] font-black uppercase tracking-[0.4em] text-gold/60 mb-1">Tiết Khí</p>
                                <p className="text-xl font-black text-white italic uppercase tracking-tighter">{tietKhi}</p>
                            </div>
                            <Info size={16} className="text-slate-800" />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
        const endDate = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

        return (
            <div className="glass-card bg-[#050505] rounded-[2.5rem] border-2 border-white/5 p-5 md:p-6 shadow-[0_30px_60px_-10px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-6 gap-4 border-b border-white/5 pb-4 px-2">
                    <div className="flex gap-1.5 focus-within:ring-0">
                        <button onClick={handlePrev} className="p-2.5 bg-white/5 hover:bg-gold/10 rounded-xl border border-white/10 transition-all"><ChevronLeft size={16} className="text-gold" /></button>
                        <button onClick={handleNext} className="p-2.5 bg-white/5 hover:bg-gold/10 rounded-xl border border-white/10 transition-all"><ChevronRight size={16} className="text-gold" /></button>
                    </div>
                    <h2 className="text-xl font-black capitalize text-white italic uppercase tracking-tight">
                        {format(currentDate, 'MMMM / YYYY', { locale: vi })}
                    </h2>
                    <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 bg-gold/10 text-gold border border-gold/20 text-[8px] font-black uppercase tracking-[0.2em] rounded-lg hover:bg-gold hover:text-black transition-all">HIỆN TẠI</button>
                </div>
                <div className="grid grid-cols-7 mb-2 opacity-40">
                    {weekDays.map(d => <div key={d} className="text-center text-[7px] font-black text-slate-500 uppercase py-2">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, idx) => {
                        const isCur = isSameMonth(day, monthStart);
                        const isTod = isSameDay(day, new Date());
                        const lDay = Solar.fromYmd(day.getFullYear(), day.getMonth() + 1, day.getDate()).getLunar().getDay();
                        return (
                            <div key={idx} onClick={() => { if (isCur) { setCurrentDate(day); setViewMode('day'); } }}
                                className={`min-h-[75px] p-2.5 rounded-xl border transition-all duration-300 flex flex-col justify-between ${isTod ? 'bg-gold border-gold' : !isCur ? 'opacity-5 pointer-events-none' : 'bg-white/[0.02] border-white/5 hover:border-gold/40 hover:bg-gold/5'}`}>
                                <span className={`text-base font-black ${isTod ? 'text-black' : 'text-slate-300'}`}>{format(day, 'd')}</span>
                                <span className={`text-[7px] font-black text-right ${isTod ? 'text-black/60' : lDay === 1 ? 'text-gold' : 'text-slate-600'}`}>{lDay}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar scroll-smooth">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <div>
                    <h1 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                        <CalendarIcon size={20} className="text-gold" strokeWidth={3} /> Lịch Vạn Niên <span className="text-gold italic">Pro</span>
                    </h1>
                    <p className="text-slate-500 text-[7px] font-black tracking-[0.4em] uppercase mt-0.5 opacity-60">Elite Spiritual Engine</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl w-fit gap-1 border border-white/10 shadow-lg">
                    <button onClick={() => setViewMode('day')} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${viewMode === 'day' ? 'bg-gold text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                        <Layout size={12} strokeWidth={3} /> Chi Tiết
                    </button>
                    <button onClick={() => setViewMode('month')} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${viewMode === 'month' ? 'bg-gold text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                        <Grid size={12} strokeWidth={3} /> Tổng Quát
                    </button>
                </div>
            </div>
            {viewMode === 'day' ? renderDayView() : renderMonthView()}
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />
        </div>
    );
}
