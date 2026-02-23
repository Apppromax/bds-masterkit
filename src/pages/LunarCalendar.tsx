import React, { useState, useEffect } from 'react';
// @ts-ignore
import * as LunarLib from 'lunar-javascript';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Moon, Sun, Info, Grid, Layout, Clock, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';

// Handle CJS/ESM interop safely
const Solar = (LunarLib as any).Solar || (LunarLib as any).default?.Solar;

const PHIEN_AM_CAN: Record<string, string> = { '甲': 'Giáp', '乙': 'Ất', '丙': 'Bính', '丁': 'Đinh', '戊': 'Mậu', '己': 'Kỷ', '庚': 'Canh', '辛': 'Tân', '壬': 'Nhâm', '癸': 'Quý' };
const PHIEN_AM_CHI: Record<string, string> = { '子': 'Tý', '丑': 'Sửu', '寅': 'Dần', '卯': 'Mão', '辰': 'Thìn', '巳': 'Tỵ', '午': 'Ngọ', '未': 'Mùi', '申': 'Thân', '酉': 'Dậu', '戌': 'Tuất', '亥': 'Hợi' };

const translateCanChi = (canChiStr: string) => {
    if (!canChiStr) return '';
    return canChiStr.split('').map(part => PHIEN_AM_CAN[part] || PHIEN_AM_CHI[part] || part).join(' ');
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

const getGioHoangDao = (lunarDate: any) => {
    if (!lunarDate) return ['...'];
    try {
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
    } catch (e) {
        return ['...'];
    }
};

export default function LunarCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [lunarDate, setLunarDate] = useState<any>(null);
    const [viewMode, setViewMode] = useState<'day' | 'month'>('day');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-in fade-in duration-700">
                <div className="p-6 bg-red-500/10 rounded-[2rem] border border-red-500/20 shadow-2xl">
                    <CalendarIcon size={48} className="text-red-400" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-white uppercase italic">Lỗi Hệ Thống Lịch</h2>
                    <p className="text-slate-400 max-w-sm text-xs font-bold leading-relaxed">{error}</p>
                </div>
                <button
                    onClick={() => { setError(null); setCurrentDate(new Date()); window.location.reload(); }}
                    className="px-8 py-3 bg-gold text-black rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(191,149,63,0.3)] hover:scale-105 active:scale-95 transition-all"
                >
                    Làm mới ứng dụng
                </button>
            </div>
        );
    }

    if (isLoading || !lunarDate) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 bg-gold/20 blur-2xl animate-pulse"></div>
                    <Loader2 size={40} className="text-gold animate-spin relative z-10" />
                </div>
                <p className="text-[10px] text-gold font-black uppercase tracking-[0.4em] brightness-75">Đang giải mã tinh tú...</p>
            </div>
        );
    }

    const renderDayView = () => {
        const namCanChi = translateCanChi(lunarDate.getYearInGanZhi());
        const thangCanChi = translateCanChi(lunarDate.getMonthInGanZhi());
        const ngayCanChi = translateCanChi(lunarDate.getDayInGanZhi());
        const gioHoangDao = getGioHoangDao(lunarDate);
        const isGoodDay = ['Mão', 'Ngọ', 'Thìn', 'Dần'].some(c => ngayCanChi.includes(c));
        const tietKhi = lunarDate.getJieQi();

        return (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-4">
                <div className="xl:col-span-8 relative">
                    <div className="glass-card bg-[#050505] rounded-[2.5rem] border-2 border-white/5 shadow-[0_30px_60px_-10px_rgba(0,0,0,1)] overflow-hidden relative z-10 transition-all hover:border-gold/20">
                        <div className="p-6 md:p-8 flex justify-between items-start bg-white/[0.01]">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-white italic uppercase tracking-tighter">
                                    {format(currentDate, 'MM / yyyy', { locale: vi })}
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
                                <div className="absolute inset-[-15px] bg-gold/15 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-all duration-1000"></div>
                                <span className="text-[140px] md:text-[180px] font-black leading-none bg-gradient-to-b from-white via-gold to-[#aa771c] bg-clip-text text-transparent drop-shadow-[0_15px_50px_rgba(191,149,63,0.5)] italic">
                                    {lunarDate.getDay()}
                                </span>
                            </div>
                            <div className="mt-4 flex items-center gap-12">
                                <div className="text-center group/item cursor-default">
                                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1 group-hover/item:text-gold transition-colors">Tháng Âm</p>
                                    <p className="text-2xl font-black text-gold mb-[-4px] group-hover/item:scale-110 transition-transform">{lunarDate.getMonth()}</p>
                                </div>
                                <div className="w-[1px] h-10 bg-white/10 rotate-12"></div>
                                <div className="text-center group/item cursor-default">
                                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1 group-hover/item:text-white transition-colors">Dương Lịch</p>
                                    <p className="text-2xl font-black text-white mb-[-4px] group-hover/item:scale-110 transition-transform">{format(currentDate, 'd')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 border-t border-white/5 bg-black/40">
                            {[{ l: 'Kỷ Năm', v: namCanChi }, { l: 'Kỷ Tháng', v: thangCanChi }, { l: 'Kỷ Ngày', v: ngayCanChi }].map((item, idx) => (
                                <div key={idx} className="p-5 text-center border-r border-white/5 last:border-0 hover:bg-gold/[0.04] transition-colors group/box">
                                    <p className="text-[7px] font-black text-slate-700 uppercase tracking-widest mb-1 group-hover/box:text-gold/50 transition-colors">{item.l}</p>
                                    <p className="text-[12px] font-black text-gold/80 uppercase italic tracking-tighter group-hover/box:text-gold group-hover/box:scale-105 transition-all">{item.v}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-4 space-y-5">
                    <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-700 relative overflow-hidden shadow-2xl group/card ${isGoodDay ? 'bg-gradient-to-br from-gold/15 via-black/40 to-transparent border-gold/40' : 'bg-[#080808] border-white/5'}`}>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/card:opacity-10 transition-opacity">
                            {isGoodDay ? <Sun size={100} className="text-gold" strokeWidth={1} /> : <Moon size={100} className="text-slate-500" strokeWidth={1} />}
                        </div>
                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 bg-gold text-black px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest mb-5 shadow-[0_5px_15px_rgba(191,149,63,0.4)]">
                                {isGoodDay ? '🌟 Ngày Đại Cát' : '🌙 Thông Tin Ngày'}
                            </div>
                            <h3 className="text-xl font-black mb-2 text-white uppercase italic tracking-tighter">{isGoodDay ? 'Ngày Tuyệt Vời' : 'Ngày Bình Thường'}</h3>
                            <p className="text-slate-400 text-[11px] font-medium leading-relaxed italic opacity-80 group-hover/card:opacity-100 transition-opacity">
                                {isGoodDay ? "Khởi công, ký kết, mở bán vạn sự như ý, lộc lá đầy nhà. Năng lượng vũ trụ đang ủng hộ bạn hoàn toàn." : "Nên tập trung khảo sát, lập kế hoạch dự án kỹ lưỡng. Một ngày tốt để tinh chỉnh các chi tiết nhỏ."}
                            </p>
                        </div>
                    </div>

                    <div className="glass-card bg-[#080808] border-white/10 p-7 rounded-[2.5rem] shadow-xl hover:border-gold/30 transition-all">
                        <h4 className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] mb-5">
                            <Clock size={14} className="text-gold" strokeWidth={3} /> Giờ Hoàng Đạo
                        </h4>
                        <div className="grid grid-cols-2 gap-2.5">
                            {gioHoangDao.map((h: string) => (
                                <div key={h} className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-gold/40 hover:bg-gold/10 transition-all text-center group/time">
                                    <p className="text-[11px] font-bold text-slate-300 tracking-tight group-hover/time:text-white transition-colors">{h}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-black p-6 rounded-[2.5rem] border-2 border-white/5 relative overflow-hidden shadow-2xl border-l-[6px] border-l-gold group/ti">
                        <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 via-transparent to-transparent opacity-0 group-hover/ti:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gold/60 mb-1.5">Tiết Khí Hiện Tại</p>
                                <p className="text-2xl font-black text-white italic uppercase tracking-tighter group-hover/ti:text-gold transition-colors">{tietKhi || 'Đang cập nhật'}</p>
                            </div>
                            <Info size={20} className="text-slate-800 group-hover/ti:text-gold/20 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderMonthView = () => {
        const monthStart = startOfMonth(currentDate);
        const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const days = eachDayOfInterval({
            start: startOfWeek(monthStart, { weekStartsOn: 1 }),
            end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 })
        });

        return (
            <div className="glass-card bg-[#050505] rounded-[2.5rem] border-2 border-white/5 p-6 md:p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between mb-8 gap-4 border-b border-white/5 pb-6 px-2">
                    <div className="flex gap-2">
                        <button onClick={handlePrev} className="p-3 bg-white/5 hover:bg-gold/20 rounded-xl border border-white/10 transition-all active:scale-90"><ChevronLeft size={20} className="text-gold" /></button>
                        <button onClick={handleNext} className="p-3 bg-white/5 hover:bg-gold/20 rounded-xl border border-white/10 transition-all active:scale-90"><ChevronRight size={20} className="text-gold" /></button>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black capitalize text-white italic uppercase tracking-tight">
                        {format(currentDate, 'MMMM / yyyy', { locale: vi })}
                    </h2>
                    <button onClick={() => setCurrentDate(new Date())} className="px-6 py-3 bg-gold/10 text-gold border border-gold/30 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-gold hover:text-black transition-all shadow-lg active:scale-95">HIỆN TẠI</button>
                </div>
                <div className="grid grid-cols-7 mb-4 opacity-30">
                    {weekDays.map(d => <div key={d} className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1.5 md:gap-3">
                    {days.map((day, idx) => {
                        const isCur = isSameMonth(day, monthStart);
                        const isTod = isSameDay(day, new Date());
                        let lunarDay = '';
                        try {
                            const ld = getLunarFromDate(day);
                            if (ld) lunarDay = ld.getDay().toString();
                        } catch (e) { /* skip */ }

                        return (
                            <div key={idx} onClick={() => { if (isCur) { setCurrentDate(day); setViewMode('day'); } }}
                                className={`min-h-[85px] md:min-h-[110px] p-3 md:p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer group/day ${isTod ? 'bg-gold border-gold shadow-[0_10px_30px_rgba(191,149,63,0.4)] scale-105 z-10' :
                                        !isCur ? 'opacity-[0.03] grayscale pointer-events-none' :
                                            'bg-white/[0.02] border-white/5 hover:border-gold/50 hover:bg-gold/10 hover:shadow-2xl hover:scale-[1.02]'}`}>
                                <span className={`text-xl font-black ${isTod ? 'text-black' : 'text-slate-200 group-hover/day:text-gold transition-colors'}`}>{format(day, 'd')}</span>
                                {isCur && lunarDay && (
                                    <span className={`text-[9px] font-black text-right ${isTod ? 'text-black/70' : lunarDay === '1' ? 'text-gold' : 'text-slate-500 group-hover/day:text-slate-300'} transition-colors`}>{lunarDay}</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar scroll-smooth">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
                        <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/20">
                            <CalendarIcon size={24} className="text-gold" strokeWidth={3} />
                        </div>
                        Lịch Vạn Niên <span className="text-gold italic font-black">Pro Max</span>
                    </h1>
                    <p className="text-slate-500 text-[8px] font-black tracking-[0.5em] uppercase mt-1.5 opacity-60">Architectural Temporal Engine v2.0</p>
                </div>
                <div className="flex bg-white/5 p-1.5 rounded-2xl w-fit gap-1.5 border border-white/10 shadow-2xl backdrop-blur-xl">
                    <button onClick={() => setViewMode('day')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'day' ? 'bg-gold text-black shadow-xl shadow-gold/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                        <Layout size={14} strokeWidth={3} /> Chi Tiết
                    </button>
                    <button onClick={() => setViewMode('month')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${viewMode === 'month' ? 'bg-gold text-black shadow-xl shadow-gold/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                        <Grid size={14} strokeWidth={3} /> Tổng Quát
                    </button>
                </div>
            </div>
            {viewMode === 'day' ? renderDayView() : renderMonthView()}
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />
        </div>
    );
}
