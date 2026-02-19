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
                    <button onClick={exportToExcel} className="bg-slate-800 text-white px-5 py-3 rounded-2xl flex items-center gap-2 font-black text-xs transition-all active:scale-95">
                        <FileSpreadsheet size={16} /> XUẤT EXCEL
                    </button>
                    <button onClick={copyToZalo} className="bg-green-500 text-white px-5 py-3 rounded-2xl flex items-center gap-2 font-black text-xs transition-all active:scale-95">
                        <Copy size={16} /> COPY ZALO
                    </button>
                    <button onClick={handleExport} className="bg-blue-600 text-white px-5 py-3 rounded-2xl flex items-center gap-2 font-black text-xs transition-all active:scale-95">
                        <Download size={16} /> XUẤT ẢNH
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Settings className="w-4 h-4" /> So sánh kịch bản</h3>
                            <button onClick={addScenario} className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                                <Plus size={16} />
                            </button>
                        </div>

                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {scenarios.map((s, i) => (
                                <div key={s.id} className="relative group">
                                    <button
                                        onClick={() => setActiveIdx(i)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all border-2 ${activeIdx === i ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
                                    >
                                        {s.name}
                                    </button>
                                    {scenarios.length > 1 && (
                                        <button
                                            onClick={() => removeScenario(i)}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={8} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-50">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase">Số tiền vay (VND)</label>
                                <input
                                    type="number"
                                    className="w-full p-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-2xl text-blue-600 outline-none focus:border-blue-500 transition-all"
                                    value={activeScenario.amount}
                                    onChange={(e) => updateScenario({ amount: Number(e.target.value) })}
                                />
                                <div className="px-1 text-sm font-black text-slate-400 italic">➔ {formatNumberToVietnamese(activeScenario.amount)}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Năm</label>
                                    <input type="number" className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black" value={activeScenario.term} onChange={(e) => updateScenario({ term: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Lãi %</label>
                                    <input type="number" step="0.1" className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-amber-600" value={activeScenario.rate} onChange={(e) => updateScenario({ rate: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Ân hạn (tháng)</label>
                                    <input type="number" className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-green-600" value={activeScenario.gracePeriod} onChange={(e) => updateScenario({ gracePeriod: Number(e.target.value) })} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Phạt trả trước %</label>
                                    <input type="number" step="0.1" className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-red-600" value={activeScenario.prepayPenalty} onChange={(e) => updateScenario({ prepayPenalty: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Tháng dự định tất toán</label>
                                <input type="number" className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-blue-600" value={activeScenario.prepayMonth} onChange={(e) => updateScenario({ prepayMonth: Number(e.target.value) })} />
                            </div>
                            <div className="pt-2 space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Phương thức</label>
                                <div className="flex gap-2">
                                    <button onClick={() => updateScenario({ method: 'emi' })} className={`flex-1 p-3 rounded-xl text-center border-2 transition-all ${activeScenario.method === 'emi' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}>
                                        <p className="text-[10px] font-black">EMI (Cố định)</p>
                                    </button>
                                    <button onClick={() => updateScenario({ method: 'diminishing' })} className={`flex-1 p-3 rounded-xl text-center border-2 transition-all ${activeScenario.method === 'diminishing' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}>
                                        <p className="text-[10px] font-black">Giảm dần</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div ref={resultRef} className="bg-white p-6 md:p-8 rounded-[32px] shadow-2xl border border-slate-100 relative overflow-hidden flex flex-col h-full max-h-[calc(100vh-140px)]">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center mb-6 gap-6 pb-4 border-b border-slate-50">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Building2 className="text-white" size={20} />
                                    </div>
                                    <div className="h-5 w-[2px] bg-slate-200 rounded-full"></div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] leading-none mb-1">Dự toán tài chính</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Homespro Expert</span>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Báo Cáo Lãi Vay</h2>
                                    <p className="text-slate-400 font-bold text-[10px] italic tracking-widest flex items-center gap-2">
                                        <Calendar size={10} /> Ngày lập: {new Date().toLocaleDateString('vi-VN', { dateStyle: 'long' })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-white px-5 py-3 rounded-2xl border border-blue-100 shadow-sm">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${profile?.full_name || 'E'}&background=0066FF&color=fff&bold=true`}
                                    className="w-14 h-14 rounded-xl border-2 border-white shadow-md object-cover"
                                    alt="avatar"
                                />
                                <div className="space-y-0.5">
                                    <div className="px-1.5 py-0.5 bg-blue-600 text-[7px] font-black text-white uppercase rounded-full w-fit mb-0.5 tracking-widest leading-none">Tư vấn viên</div>
                                    <p className="text-base font-black text-slate-900 uppercase leading-none">{profile?.full_name || 'Expert Name'}</p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{profile?.agency || 'Sàn BĐS Homespro'}</p>
                                    <p className="text-sm font-black text-blue-700 flex items-center gap-1.5 pt-1">
                                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                                            <Phone size={10} className="text-white fill-white" />
                                        </div>
                                        {profile?.phone || '09xx.xxx.xxx'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-xl relative overflow-hidden group">
                                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                                <p className="text-[8px] font-black uppercase opacity-60 mb-1 tracking-[0.2em]">Trả tháng đầu</p>
                                <p className="text-2xl font-black tracking-tighter leading-none">{results ? formatCurrency(results.firstMonth) : '...'}</p>
                                <div className="mt-4 pt-4 border-t border-white/20 flex flex-col gap-1 text-[9px]">
                                    <div className="flex justify-between font-bold opacity-80"><span>Trả gốc:</span><span>{results ? formatCurrency(results.monthlyPrincipal) : '...'}</span></div>
                                    <div className="flex justify-between font-bold opacity-80"><span>Trả lãi:</span><span>{results ? formatCurrency(results.monthlyInterest) : '...'}</span></div>
                                </div>
                            </div>
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm flex flex-col justify-center">
                                <p className="text-[8px] font-black text-slate-400 capitalize tracking-widest mb-1 leading-none">Tổng lãi vay</p>
                                <p className="text-xl font-black text-amber-600 tracking-tighter leading-none">{results ? formatCurrency(results.totalInterest) : '...'}</p>
                            </div>
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm flex flex-col justify-center">
                                <p className="text-[8px] font-black text-slate-400 capitalize tracking-widest mb-1 leading-none">Tổng giá trị trả</p>
                                <p className="text-xl font-black text-slate-900 tracking-tighter leading-none">{results ? formatCurrency(results.totalPayment) : '...'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-hidden min-h-0">
                            <div className="flex flex-col space-y-4 overflow-hidden h-full">
                                <div className="flex justify-between items-center">
                                    <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-900 uppercase tracking-widest">
                                        <div className="w-8 h-[2px] bg-blue-600 rounded-full"></div> Chi tiết & Tỷ lệ
                                    </h4>
                                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{activeScenario.name}</span>
                                </div>

                                <div className="h-28 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={30}
                                                outerRadius={45}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} />
                                            <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <div className="flex justify-between py-1.5 border-b border-slate-50 text-[10px] font-bold"><span className="text-slate-400">Gốc vay:</span><span className="text-slate-900">{formatCurrency(activeScenario.amount)}</span></div>
                                    <div className="flex justify-between py-1.5 border-b border-slate-50 text-[10px] font-bold"><span className="text-slate-400">Lãi suất:</span><span className="text-amber-600">{activeScenario.rate}%/năm</span></div>
                                    <div className="flex justify-between py-1.5 border-b border-slate-50 text-[10px] font-bold"><span className="text-slate-400">Phạt trả trước:</span><span className="text-red-500">{activeScenario.prepayPenalty}%</span></div>
                                    <div className="flex justify-between py-1.5 border-b border-slate-50 text-[10px] font-bold bg-red-50/50 px-2 rounded-lg"><span className="text-red-600">Tiền phạt (T{activeScenario.prepayMonth}):</span><span className="text-red-700 font-black">{results ? formatCurrency(results.prepayPenaltyAmount) : '...'}</span></div>
                                </div>

                                <div className="bg-blue-50/50 rounded-xl p-2.5 border border-blue-100 flex gap-2 items-start mt-auto">
                                    <Info size={12} className="text-blue-600 flex-shrink-0" />
                                    <p className="text-[7px] text-slate-500 font-bold leading-tight italic">
                                        Phí phạt trả nợ trước hạn là điểm mấu chốt khi khách hàng muốn tất toán sớm để giảm lãi.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-950 p-6 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col h-full min-h-0">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 blur-[80px]"></div>
                                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-8 flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                    📊 Kế hoạch 12 tháng đầu
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                </h4>
                                <div className={`space-y-2 pr-2 custom-scrollbar flex-grow ${isExporting ? '' : 'max-h-[500px] overflow-y-auto'}`}>
                                    {results?.schedule.map((s, idx) => (
                                        <div key={idx} className={`px-4 py-1.5 rounded-xl border transition-all duration-300 flex items-center gap-3 ${idx === 0 ? 'bg-gradient-to-r from-blue-700 to-blue-500 border-blue-400 shadow-md shadow-blue-500/10' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 ${idx === 0 ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-500'}`}>
                                                {s.month}
                                            </div>

                                            <div className="flex-1 grid grid-cols-3 gap-1.5 items-center">
                                                <div className="flex flex-col"><span className="text-[6px] font-black uppercase opacity-40 mb-0.5 leading-none">Tổng</span><span className={`text-[10px] font-black leading-none ${idx === 0 ? 'text-white' : 'text-blue-400'}`}>{formatCurrency(s.payment)}</span></div>
                                                <div className="flex flex-col"><span className="text-[6px] font-black uppercase opacity-40 mb-0.5 leading-none">Gốc</span><span className="text-[9px] font-bold opacity-80 leading-none">{formatCurrency(s.principal)}</span></div>
                                                <div className="flex flex-col text-right"><span className="text-[6px] font-black uppercase opacity-40 mb-0.5 leading-none">Lãi</span><span className="text-[9px] font-bold opacity-80 leading-none">{formatCurrency(s.interest)}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col items-center space-y-1 opacity-60">
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.3em]">Homespro AI Ecosystem</p>
                            <p className="text-[7px] text-slate-300 font-bold uppercase tracking-widest italic leading-none">Professional Financial Report</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
