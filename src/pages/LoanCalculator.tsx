import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Calculator, Download, DollarSign, Calendar, Percent, Copy, Share2, Info, ArrowDownCircle, ShieldCheck, User, Phone, Building2, Settings, RefreshCw, Crown, Zap, Sparkles as SparklesIcon, Loader2, Plus, Trash2, PieChart as PieChartIcon, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

type CalcMethod = 'emi' | 'diminishing';

export default function LoanCalculator() {
    const { profile } = useAuth();
    const resultRef = useRef<HTMLDivElement>(null);

    const [scenarios, setScenarios] = useState<any[]>([
        { id: 1, name: 'Kịch bản 1', amount: 2000000000, term: 20, rate: 8.5, gracePeriod: 0, method: 'emi', prepayPenalty: 1, prepayMonth: 60 }
    ]);
    const [activeIdx, setActiveIdx] = useState(0);

    const [isExporting, setIsExporting] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);

    const activeScenario = scenarios[activeIdx];

    const [results, setResults] = useState<{
        firstMonth: number;
        totalPayment: number;
        totalInterest: number;
        monthlyPrincipal: number;
        monthlyInterest: number;
        prepayPenaltyAmount: number;
        remainingAtPrepay: number;
        schedule: any[];
    } | null>(null);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', {
            maximumFractionDigits: 0
        }).format(Math.round(val)) + ' đ';
    };

    const formatNumber = (val: number) => {
        return new Intl.NumberFormat('vi-VN').format(Math.round(val));
    };

    const parseFormattedNumber = (val: string) => {
        return Number(val.replace(/\./g, '').replace(/,/g, '')) || 0;
    };

    const formatNumberToVietnamese = (num: number): string => {
        if (num === 0) return '0 VNĐ';
        if (num >= 1000000000) {
            const billions = num / 1000000000;
            return billions.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' Tỷ';
        }
        if (num >= 1000000) {
            const millions = num / 1000000;
            return millions.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' Triệu';
        }
        return new Intl.NumberFormat('vi-VN').format(num) + ' VNĐ';
    };

    const calculateLoan = () => {
        const { amount, rate, term, gracePeriod, method, prepayPenalty, prepayMonth } = activeScenario;
        const principal = amount;
        const annualRate = rate / 100;
        const monthlyRate = annualRate / 12;
        const totalMonths = term * 12;

        let totalInterestPaid = 0;
        let schedule = [];
        let firstMonthTotal = 0;
        let firstMonthPrincipal = 0;
        let firstMonthInterest = 0;
        let prepayPenaltyAmount = 0;
        let remainingAtPrepay = 0;

        let remainingPrincipal = principal;

        if (method === 'emi') {
            const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
                (Math.pow(1 + monthlyRate, totalMonths) - 1);

            for (let i = 1; i <= totalMonths; i++) {
                const interest = remainingPrincipal * monthlyRate;
                const principalPaid = emi - interest;
                remainingPrincipal -= principalPaid;

                if (i === prepayMonth) {
                    remainingAtPrepay = remainingPrincipal;
                    prepayPenaltyAmount = remainingPrincipal * (prepayPenalty / 100);
                }

                if (i === 1) {
                    firstMonthTotal = emi;
                    firstMonthPrincipal = principalPaid;
                    firstMonthInterest = interest;
                }

                if (i <= 12) {
                    schedule.push({
                        month: i,
                        payment: emi,
                        principal: principalPaid,
                        interest: interest,
                        remaining: Math.max(0, remainingPrincipal)
                    });
                }
                totalInterestPaid += interest;
            }

            setResults({
                firstMonth: emi,
                totalPayment: principal + totalInterestPaid,
                totalInterest: totalInterestPaid,
                monthlyPrincipal: firstMonthPrincipal,
                monthlyInterest: firstMonthInterest,
                prepayPenaltyAmount,
                remainingAtPrepay,
                schedule: schedule
            });
        } else {
            const monthsToPayPrincipal = totalMonths - gracePeriod;
            const fixedPrincipal = principal / monthsToPayPrincipal;

            for (let i = 1; i <= totalMonths; i++) {
                const interest = remainingPrincipal * monthlyRate;
                let principalPaid = 0;

                if (i > gracePeriod) {
                    principalPaid = fixedPrincipal;
                }

                const totalMonthPayment = interest + principalPaid;
                remainingPrincipal -= principalPaid;

                if (i === prepayMonth) {
                    remainingAtPrepay = remainingPrincipal;
                    prepayPenaltyAmount = remainingPrincipal * (prepayPenalty / 100);
                }

                if (i === 1) {
                    firstMonthTotal = totalMonthPayment;
                    firstMonthPrincipal = principalPaid;
                    firstMonthInterest = interest;
                }

                if (i <= 12) {
                    schedule.push({
                        month: i,
                        payment: totalMonthPayment,
                        principal: principalPaid,
                        interest: interest,
                        remaining: Math.max(0, remainingPrincipal)
                    });
                }
                totalInterestPaid += interest;
            }

            setResults({
                firstMonth: firstMonthTotal,
                totalPayment: principal + totalInterestPaid,
                totalInterest: totalInterestPaid,
                monthlyPrincipal: firstMonthPrincipal,
                monthlyInterest: firstMonthInterest,
                prepayPenaltyAmount,
                remainingAtPrepay,
                schedule: schedule
            });
        }
    };


    useEffect(() => {
        calculateLoan();
    }, [scenarios, activeIdx]);

    const updateScenario = (updates: any) => {
        const newScenarios = [...scenarios];
        newScenarios[activeIdx] = { ...newScenarios[activeIdx], ...updates };
        setScenarios(newScenarios);
    };

    const addScenario = () => {
        if (scenarios.length >= 3) {
            alert('Tối đa 3 kịch bản so sánh');
            return;
        }
        const newId = scenarios.length + 1;
        setScenarios([...scenarios, { ...activeScenario, id: newId, name: `Kịch bản ${newId}` }]);
        setActiveIdx(scenarios.length);
    };

    const removeScenario = (idx: number) => {
        if (scenarios.length <= 1) return;
        const newScenarios = scenarios.filter((_, i) => i !== idx);
        setScenarios(newScenarios);
        setActiveIdx(0);
    };

    const chartData = results ? [
        { name: 'Gốc', value: activeScenario.amount, color: '#0066FF' },
        { name: 'Lãi', value: results.totalInterest, color: '#f59e0b' }
    ] : [];

    const exportToExcel = () => {
        if (!results) return;
        const headers = ['Thang', 'Tong Tra', 'Tien Goc', 'Tien Lai', 'Con Lai'];
        const rows = results.schedule.map(s => [
            s.month,
            Math.round(s.payment),
            Math.round(s.principal),
            Math.round(s.interest),
            Math.round(s.remaining)
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Lich-tra-no-${activeScenario.name}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const handleExport = async () => {
        if (resultRef.current) {
            setIsExporting(true);

            // Chờ một chút để React re-render giao diện mở rộng
            setTimeout(async () => {
                try {
                    const canvas = await html2canvas(resultRef.current!, {
                        scale: 2,
                        backgroundColor: '#ffffff',
                        useCORS: true,
                        logging: false
                    });
                    const link = document.createElement('a');
                    link.download = `Bao-gia-lai-vay-${new Date().getTime()}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                } catch (error) {
                    console.error(error);
                } finally {
                    setIsExporting(false);
                }
            }, 100);
        }
    };

    const copyToZalo = () => {
        if (!results) return;
        const text = `🏠 BẢNG TÍNH LÃI VAY MUA NHÀ
💰 Số tiền vay: ${formatCurrency(activeScenario.amount)}
🗓 Thời gian: ${activeScenario.term} năm (${activeScenario.term * 12} tháng)
📊 Phương thức: ${activeScenario.method === 'emi' ? 'Dư nợ cố định (EMI)' : 'Dư nợ giảm dần'}
💵 TRẢ THÁNG ĐẦU: ${formatCurrency(results.firstMonth)}
- Gốc: ${formatCurrency(results.monthlyPrincipal)}
- Lãi: ${formatCurrency(results.monthlyInterest)}
⚠️ PHÍ PHẠT TRẢ TRƯỚC (Tháng ${activeScenario.prepayMonth}): ${formatCurrency(results.prepayPenaltyAmount)}
----------------------------
👤 Tư vấn: ${profile?.full_name || 'Expert'}
📞 Hotline: ${profile?.phone || 'Liên hệ ngay'}
(Dự toán mang tính chất tham khảo)`;
        navigator.clipboard.writeText(text);
        alert('Đã copy nội dung gửi Zalo!');
    };

    return (
        <div className="pb-20 md:pb-0">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
                            <Calculator className="text-white" size={24} />
                        </div>
                        TÍNH LÃI VAY THÔNG MINH
                    </h1>
                </div>
                <div className="flex gap-2">
                    <button onClick={exportToExcel} className="bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-black text-[10px] transition-all active:scale-95 shadow-lg shadow-slate-200">
                        <FileSpreadsheet size={14} /> XUẤT EXCEL
                    </button>
                    <button onClick={copyToZalo} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-black text-[10px] transition-all active:scale-95 shadow-lg shadow-emerald-200">
                        <Copy size={14} /> COPY ZALO
                    </button>
                    <button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-black text-[10px] transition-all active:scale-95 shadow-lg shadow-blue-200">
                        <Download size={14} /> XUẤT ẢNH
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-3 space-y-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Settings className="w-3.5 h-3.5" /> Kịch bản</h3>
                            <button onClick={addScenario} className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <Plus size={14} />
                            </button>
                        </div>

                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 pt-3 px-3 -mx-3">
                            {scenarios.map((s, i) => (
                                <div key={s.id} className="relative group">
                                    <button
                                        onClick={() => setActiveIdx(i)}
                                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black whitespace-nowrap transition-all border ${activeIdx === i ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                                    >
                                        {s.name}
                                    </button>
                                    {scenarios.length > 1 && (
                                        <button
                                            onClick={() => removeScenario(i)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg z-30 flex items-center justify-center border-2 border-white"
                                        >
                                            <Trash2 size={10} strokeWidth={3} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 mt-4 pt-4 border-t border-slate-50">
                            <div className="space-y-1.5">
                                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-tight">Số tiền vay</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-xl text-blue-600 outline-none focus:border-blue-500 transition-all"
                                        value={activeScenario.amount === 0 ? '' : formatNumber(activeScenario.amount)}
                                        placeholder="0"
                                        onChange={(e) => updateScenario({ amount: parseFormattedNumber(e.target.value) })}
                                        onFocus={(e) => e.target.select()}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300">VND</div>
                                </div>
                                <div className="px-1 text-[10px] font-black text-slate-400 italic">➔ {formatNumberToVietnamese(activeScenario.amount)}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Thời gian (năm)</label>
                                    <input type="number" placeholder="0" className="w-full p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-sm" value={activeScenario.term || ''} onChange={(e) => updateScenario({ term: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Lãi suất %/năm</label>
                                    <input type="number" step="0.1" placeholder="0" className="w-full p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-sm text-amber-600" value={activeScenario.rate || ''} onChange={(e) => updateScenario({ rate: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Ân hạn (tháng)</label>
                                    <input type="number" placeholder="0" className="w-full p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-sm text-emerald-600" value={activeScenario.gracePeriod === 0 ? '' : activeScenario.gracePeriod} onChange={(e) => updateScenario({ gracePeriod: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Phí phạt %</label>
                                    <input type="number" step="0.1" placeholder="0" className="w-full p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-sm text-red-600" value={activeScenario.prepayPenalty === 0 ? '' : activeScenario.prepayPenalty} onChange={(e) => updateScenario({ prepayPenalty: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Tháng tất toán dự kiến</label>
                                <input type="number" placeholder="0" className="w-full p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-sm text-blue-600" value={activeScenario.prepayMonth || ''} onChange={(e) => updateScenario({ prepayMonth: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                            </div>
                            <div className="pt-2">
                                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1.5">Phương thức trả</label>
                                <div className="flex gap-2">
                                    <button onClick={() => updateScenario({ method: 'emi' })} className={`flex-1 py-2 px-1 rounded-lg text-center border transition-all ${activeScenario.method === 'emi' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}>
                                        <p className="text-[9px] font-black">EMI Cố định</p>
                                    </button>
                                    <button onClick={() => updateScenario({ method: 'diminishing' })} className={`flex-1 py-2 px-1 rounded-lg text-center border transition-all ${activeScenario.method === 'diminishing' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}>
                                        <p className="text-[9px] font-black">Dư nợ giảm dần</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-9 space-y-6">
                    <div ref={resultRef} className={`bg-white relative overflow-hidden flex flex-col transition-all duration-500 ${isExporting ? 'p-16 w-[1000px] border-none shadow-none text-slate-900 rounded-none' : 'p-6 md:p-8 rounded-[32px] shadow-2xl border border-slate-100 h-full'}`}>
                        {/* Premium Export Background - Only visible on export or high-end view */}
                        {isExporting && (
                            <div className="absolute inset-0 z-0 overflow-hidden">
                                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] -mr-64 -mt-64"></div>
                                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-[100px] -ml-48 -mb-48"></div>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                            </div>
                        )}

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start mb-8 gap-6 pb-6 border-b border-slate-100">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Building2 className="text-white" size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-blue-600 uppercase tracking-[0.3em] leading-none mb-1">Homespro AI Ecosystem</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Financial Technology</span>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Dự Toán Lãi Vay</h2>
                                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={10} /> Ngày lập: {new Date().toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${profile?.full_name || 'E'}&background=0066FF&color=fff&bold=true`}
                                    className="w-12 h-12 rounded-xl border-2 border-white shadow-sm object-cover"
                                    alt="avatar"
                                />
                                <div className="space-y-0.5">
                                    <p className="text-sm font-black text-slate-900 uppercase leading-none">{profile?.full_name || 'Chuyên viên tư vấn'}</p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{profile?.agency || 'Hệ thống Homespro'}</p>
                                    <p className="text-xs font-black text-blue-700 flex items-center gap-1.5 pt-1 uppercase">
                                        <Phone size={10} className="fill-blue-700 text-transparent" />
                                        {profile?.phone || 'Liên hệ ngay'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white shadow-xl relative overflow-hidden group">
                                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                                <p className="text-[7px] font-black uppercase opacity-60 mb-1 tracking-[0.2em]">Trả tháng đầu</p>
                                <p className="text-xl font-black tracking-tighter leading-none">{results ? formatCurrency(results.firstMonth) : '...'}</p>
                                <div className="mt-3 pt-3 border-t border-white/20 flex flex-col gap-1 text-[8px]">
                                    <div className="flex justify-between font-bold opacity-80"><span>Gốc:</span><span>{results ? formatCurrency(results.monthlyPrincipal) : '...'}</span></div>
                                    <div className="flex justify-between font-bold opacity-80"><span>Lãi:</span><span>{results ? formatCurrency(results.monthlyInterest) : '...'}</span></div>
                                </div>
                            </div>
                            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm flex flex-col justify-center">
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Tổng lãi vay</p>
                                <p className="text-lg font-black text-amber-600 tracking-tighter leading-none">{results ? formatCurrency(results.totalInterest) : '...'}</p>
                            </div>
                            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm flex flex-col justify-center">
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Tổng gốc + lãi</p>
                                <p className="text-lg font-black text-slate-900 tracking-tighter leading-none">{results ? formatCurrency(results.totalPayment) : '...'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
                            <div className="md:col-span-5 flex flex-col space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-900 uppercase tracking-widest">
                                        <div className="w-8 h-[2px] bg-blue-600 rounded-full"></div> Biểu đồ phân bổ
                                    </h4>
                                </div>

                                <div className="h-[240px] flex items-center justify-center bg-slate-50/50 rounded-3xl border border-slate-50 p-4">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={65}
                                                outerRadius={85}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                                                formatter={(value: any) => formatCurrency(Number(value || 0))}
                                            />
                                            <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', paddingTop: '15px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="md:col-span-7 flex flex-col space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-900 uppercase tracking-widest">
                                        <div className="w-8 h-[2px] bg-red-500 rounded-full"></div> Báo cáo tất toán Dự kiến
                                    </h4>
                                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">{activeScenario.name}</span>
                                </div>

                                <div className="flex-grow space-y-2">
                                    <div className="flex justify-between py-2 border-b border-slate-50 text-[10px] font-bold"><span className="text-slate-400 uppercase tracking-tighter">Số tiền vay gốc:</span><span className="text-slate-900 font-black">{formatCurrency(activeScenario.amount)}</span></div>
                                    <div className="flex justify-between py-2 border-b border-slate-50 text-[10px] font-bold"><span className="text-slate-400 uppercase tracking-tighter">Lãi suất:</span><span className="text-amber-600 font-black">{activeScenario.rate}%/năm</span></div>
                                    <div className="flex justify-between py-2 border-b border-slate-50 text-[10px] font-bold"><span className="text-slate-400 uppercase tracking-tighter">Tháng dự kiến trả:</span><span className="text-blue-600 font-black">Tháng {activeScenario.prepayMonth}</span></div>

                                    <div className="mt-4 p-4 bg-gradient-to-br from-red-50 to-white rounded-3xl border border-red-100 shadow-sm space-y-2.5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl"></div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <ShieldCheck size={14} className="text-red-500" />
                                            <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.1em]">Chi tiết phí phạt & Dư nợ</span>
                                        </div>
                                        <div className="flex justify-between text-[10px] font-bold"><span className="text-slate-500">Hệ số phạt (%):</span><span className="text-red-500 font-black">{activeScenario.prepayPenalty}%</span></div>
                                        <div className="flex justify-between text-[10px] font-bold"><span className="text-slate-500">Dư nợ gốc tại T{activeScenario.prepayMonth}:</span><span className="text-slate-900 font-black">{results ? formatCurrency(results.remainingAtPrepay) : '...'}</span></div>
                                        <div className="flex justify-between text-[10px] font-bold border-t border-dashed border-red-100 pt-2"><span className="text-red-600">Tiền phạt dự kiến:</span><span className="text-red-700 font-black">{results ? formatCurrency(results.prepayPenaltyAmount) : '...'}</span></div>
                                        <div className="flex justify-between items-center bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-red-200 shadow-inner mt-2">
                                            <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">TỔNG TẤT TOÁN:</span>
                                            <span className="text-lg font-black text-red-600 tracking-tighter">{results ? formatCurrency(results.remainingAtPrepay + results.prepayPenaltyAmount) : '...'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expandable Schedule Section */}
                        <div className="mt-8 relative z-10">
                            {!isExporting && (
                                <button
                                    onClick={() => setShowSchedule(!showSchedule)}
                                    className={`w-full py-3 px-6 rounded-2xl border transition-all font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 ${showSchedule ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}
                                >
                                    <Calendar size={14} /> {showSchedule ? 'Thu gọn lịch trả nợ' : 'Xem lịch trả nợ chi tiết'}
                                </button>
                            )}

                            {(showSchedule || isExporting) && (
                                <div className={`mt-6 rounded-3xl overflow-hidden border border-slate-100 ${isExporting ? 'bg-white' : 'bg-white shadow-sm'}`}>
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <th className="px-6 py-4 border-b border-slate-100">Tháng</th>
                                                <th className="px-6 py-4 border-b border-slate-100">Tổng trả</th>
                                                <th className="px-6 py-4 border-b border-slate-100">Tiền gốc</th>
                                                <th className="px-6 py-4 border-b border-slate-100">Tiền lãi</th>
                                                <th className="px-6 py-4 border-b border-slate-100 text-right">Dư nợ còn lại</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-[11px] font-bold text-slate-700">
                                            {results?.schedule.map((s, idx) => (
                                                <tr key={idx} className={`${idx === 0 ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'} transition-colors`}>
                                                    <td className="px-6 py-3 border-b border-slate-50 font-black text-blue-600">Tháng {s.month}</td>
                                                    <td className="px-6 py-3 border-b border-slate-50 font-black">{formatCurrency(s.payment)}</td>
                                                    <td className="px-6 py-3 border-b border-slate-50 text-slate-500">{formatCurrency(s.principal)}</td>
                                                    <td className="px-6 py-3 border-b border-slate-50 text-slate-500">{formatCurrency(s.interest)}</td>
                                                    <td className="px-6 py-3 border-b border-slate-50 text-right font-black">{formatCurrency(s.remaining)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col items-center space-y-2 opacity-40 relative z-10">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Homespro AI Platform</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">Bản dự thảo mang tính chất tham khảo</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
