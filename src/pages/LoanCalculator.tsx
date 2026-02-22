import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Calculator, Download, DollarSign, Calendar, Percent, Copy, Share2, Info, ArrowDownCircle, ShieldCheck, User, Phone, Building2, Settings, RefreshCw, Crown, Zap, Sparkles as SparklesIcon, Loader2, Plus, Trash2, PieChart as PieChartIcon, FileSpreadsheet } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';

type CalcMethod = 'emi' | 'diminishing';

export default function LoanCalculator() {
    const { profile } = useAuth();
    const resultRef = useRef<HTMLDivElement>(null);

    const BANK_LIST = [
        { name: 'Vietcombank', code: 'VCB', logo: 'https://api.vietqr.io/img/VCB.png', color: '#006633' },
        { name: 'Techcombank', code: 'TCB', logo: 'https://api.vietqr.io/img/TCB.png', color: '#E31837' },
        { name: 'BIDV', code: 'BIDV', logo: 'https://api.vietqr.io/img/BIDV.png', color: '#213A99' },
        { name: 'VietinBank', code: 'CTG', logo: 'https://api.vietqr.io/img/ICB.png', color: '#00AEEF' },
        { name: 'MB Bank', code: 'MB', logo: 'https://api.vietqr.io/img/MB.png', color: '#0033FF' },
        { name: 'Agribank', code: 'VBA', logo: 'https://api.vietqr.io/img/VBA.png', color: '#993333' },
        { name: 'VPBank', code: 'VPB', logo: 'https://api.vietqr.io/img/VPB.png', color: '#009966' },
        { name: 'TPBank', code: 'TPB', logo: 'https://api.vietqr.io/img/TPB.png', color: '#55288B' },
        { name: 'ACB', code: 'ACB', logo: 'https://api.vietqr.io/img/ACB.png', color: '#0070B8' },
        { name: 'Sacombank', code: 'STB', logo: 'https://api.vietqr.io/img/STB.png', color: '#1B365D' },
        { name: 'VIB', code: 'VIB', logo: 'https://api.vietqr.io/img/VIB.png', color: '#005DAB' },
        { name: 'HDBank', code: 'HDB', logo: 'https://api.vietqr.io/img/HDB.png', color: '#ED1C24' },
    ];

    const [scenarios, setScenarios] = useState<any[]>([
        { id: 1, name: 'Kịch bản 1', amount: 2000000000, term: 20, rate: 8.5, gracePeriod: 0, method: 'emi', prepayPenalty: 1, prepayMonth: 60, hasPrepay: true, bankCode: 'VCB', bankName: 'Vietcombank' }
    ]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [isBankSelectorOpen, setIsBankSelectorOpen] = useState(false);
    const [bankSearch, setBankSearch] = useState('');

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
        paidPrincipalUntilPrepay: number;
        paidInterestUntilPrepay: number;
        schedule: any[];
    } | null>(null);

    const [isComparing, setIsComparing] = useState(false);
    const [compareSelection, setCompareSelection] = useState<number[]>([]);

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

    const calculateGenericLoan = (scenario: any) => {
        const { amount, rate, term, gracePeriod, method, prepayPenalty, prepayMonth, hasPrepay } = scenario;
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
        let paidPrincipalUntilPrepay = 0;
        let paidInterestUntilPrepay = 0;

        let remainingPrincipal = principal;

        if (method === 'emi') {
            const monthsToPayPrincipal = totalMonths - (gracePeriod || 0);
            const emiAfterGrace = monthsToPayPrincipal > 0
                ? (principal * monthlyRate * Math.pow(1 + monthlyRate, monthsToPayPrincipal)) / (Math.pow(1 + monthlyRate, monthsToPayPrincipal) - 1)
                : 0;

            for (let i = 1; i <= totalMonths; i++) {
                const interest = remainingPrincipal * monthlyRate;
                let principalPaid = 0;
                let currentPayment = interest;

                if (i > (gracePeriod || 0)) {
                    currentPayment = emiAfterGrace;
                    principalPaid = emiAfterGrace - interest;
                }

                remainingPrincipal -= principalPaid;

                if (hasPrepay) {
                    if (i < prepayMonth) {
                        paidPrincipalUntilPrepay += principalPaid;
                        paidInterestUntilPrepay += interest;
                    }

                    if (i === prepayMonth) {
                        remainingAtPrepay = remainingPrincipal + principalPaid;
                        prepayPenaltyAmount = remainingAtPrepay * (prepayPenalty / 100);
                    }
                }

                if (i === 1) {
                    firstMonthTotal = currentPayment;
                    firstMonthPrincipal = principalPaid;
                    firstMonthInterest = interest;
                }

                if (i <= totalMonths) {
                    schedule.push({
                        month: i,
                        payment: currentPayment,
                        principal: principalPaid,
                        interest: interest,
                        remaining: Math.max(0, remainingPrincipal)
                    });
                }
                totalInterestPaid += interest;
            }

            return {
                firstMonth: firstMonthTotal,
                totalPayment: principal + totalInterestPaid,
                totalInterest: totalInterestPaid,
                monthlyPrincipal: firstMonthPrincipal,
                monthlyInterest: firstMonthInterest,
                prepayPenaltyAmount,
                remainingAtPrepay,
                paidPrincipalUntilPrepay,
                paidInterestUntilPrepay,
                schedule: schedule
            };
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

                if (hasPrepay) {
                    if (i < prepayMonth) {
                        paidPrincipalUntilPrepay += principalPaid;
                        paidInterestUntilPrepay += interest;
                    }

                    if (i === prepayMonth) {
                        remainingAtPrepay = remainingPrincipal + principalPaid;
                        prepayPenaltyAmount = remainingAtPrepay * (prepayPenalty / 100);
                    }
                }

                if (i === 1) {
                    firstMonthTotal = totalMonthPayment;
                    firstMonthPrincipal = principalPaid;
                    firstMonthInterest = interest;
                }

                if (i <= totalMonths) {
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

            return {
                firstMonth: firstMonthTotal,
                totalPayment: principal + totalInterestPaid,
                totalInterest: totalInterestPaid,
                monthlyPrincipal: firstMonthPrincipal,
                monthlyInterest: firstMonthInterest,
                prepayPenaltyAmount,
                remainingAtPrepay,
                paidPrincipalUntilPrepay,
                paidInterestUntilPrepay,
                schedule: schedule
            };
        }
    };

    const calculateLoan = () => {
        setResults(calculateGenericLoan(activeScenario));
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
        const newScenario = {
            id: Date.now(),
            name: `Kịch bản ${scenarios.length + 1}`,
            amount: activeScenario.amount,
            term: activeScenario.term,
            rate: activeScenario.rate,
            gracePeriod: activeScenario.gracePeriod,
            method: activeScenario.method,
            prepayPenalty: activeScenario.prepayPenalty,
            prepayMonth: activeScenario.prepayMonth,
            hasPrepay: activeScenario.hasPrepay,
            bankCode: activeScenario.bankCode,
            bankName: activeScenario.bankName
        };
        setScenarios([...scenarios, newScenario]);
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
        const infoData = [
            ['DỰ TOÁN PHƯƠNG ÁN TÀI CHÍNH'],
            [''],
            ['Ngân hàng', activeScenario.bankName || 'Hệ thống'],
            ['Số tiền vay', formatCurrency(activeScenario.amount)],
            ['Thời hạn', `${activeScenario.term} năm (${activeScenario.term * 12} tháng)`],
            ['Lãi suất', `${activeScenario.rate}% / năm`],
            ['Ân hạn nợ gốc', `${activeScenario.gracePeriod} tháng`],
            ['Phương thức trả', activeScenario.method === 'emi' ? 'Dư nợ giảm dần (Gốc + Lãi đều)' : 'Gốc đều, lãi giảm dần'],
            [''],
            ['TỔNG QUAN KẾT QUẢ'],
            ['Tổng lãi phải trả', formatCurrency(results.totalInterest)],
            ['Tổng gốc + lãi', formatCurrency(results.totalPayment)],
            ['Trả tháng đầu', formatCurrency(results.firstMonth)],
            [''],
            ['LỊCH TRẢ NỢ CHI TIẾT'],
            ['Tháng', 'Tổng Trả', 'Tiền Gốc', 'Tiền Lãi', 'Dư Nợ Còn Lại']
        ];
        const scheduleData = results.schedule.map(s => [
            s.month,
            Math.round(s.payment),
            Math.round(s.principal),
            Math.round(s.interest),
            Math.round(s.remaining)
        ]);
        const fullData = [...infoData, ...scheduleData];
        const ws = XLSX.utils.aoa_to_sheet(fullData);
        ws['!cols'] = [{ wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Lich Tra No");
        XLSX.writeFile(wb, `Phuong-an-tai-chinh-${activeScenario.bankName || 'BDS'}.xlsx`);
    };

    const handleExport = async () => {
        if (resultRef.current) {
            setIsExporting(true);
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
        const graceText = activeScenario.gracePeriod > 0
            ? `\n🌟 ÂN HẠN GỐC: ${activeScenario.gracePeriod} tháng (Chỉ trả lãi)`
            : '';
        const prepaymentText = activeScenario.hasPrepay ? `
🛑 DỰ KIẾN TẤT TOÁN (Tháng ${activeScenario.prepayMonth}):
- Gốc đã trả: ${formatCurrency(results.paidPrincipalUntilPrepay)}
- Lãi đã trả: ${formatCurrency(results.paidInterestUntilPrepay)}
- Dư nợ gốc còn lại: ${formatCurrency(results.remainingAtPrepay)}
- Phí phạt (${activeScenario.prepayPenalty}%): ${formatCurrency(results.prepayPenaltyAmount)}

💰 TỔNG TẤT TOÁN: ${formatCurrency(results.remainingAtPrepay + results.prepayPenaltyAmount)}
💎 TỔNG CHI PHÍ DỰ KIẾN: ${formatCurrency(results.paidPrincipalUntilPrepay + results.paidInterestUntilPrepay + results.remainingAtPrepay + results.prepayPenaltyAmount)}` : '';
        const text = `🏠 BÁO GIÁ LÃI VAY & TẤT TOÁN
🏦 Ngân hàng: ${activeScenario.bankName || 'Hệ thống'}
💰 Khoản vay: ${formatCurrency(activeScenario.amount)} (${formatNumberToVietnamese(activeScenario.amount)})
🗓 Thời hạn: ${activeScenario.term} năm (${activeScenario.term * 12} tháng)${graceText}
📊 Phương thức: ${activeScenario.method === 'emi' ? 'Dư nợ cố định (EMI)' : 'Dư nợ giảm dần'}

💵 TRẢ THÁNG ĐẦU: ${formatCurrency(results.firstMonth)}
- Tiền gốc: ${formatCurrency(results.monthlyPrincipal)}
- Tiền lãi: ${formatCurrency(results.monthlyInterest)}${prepaymentText}

----------------------------
👤 Tư vấn: ${profile?.full_name || 'Homespro Expert'}
📞 Hotline: ${profile?.phone || 'Liên hệ ngay'}
(Dự toán mang tính chất tham khảo)`;
        navigator.clipboard.writeText(text);
        alert('Đã copy nội dung gửi Zalo!');
    };

    return (
        <div className="pb-10 min-h-screen overflow-x-hidden">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                        <Calculator className="text-[#bf953f]" size={24} strokeWidth={3} />
                        Tính Lãi Vay <span className="text-[#bf953f]">Elite</span>
                    </h1>
                    <p className="text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase mt-1">Smart Financial Forecasting AI</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => {
                        if (scenarios.length < 2) {
                            alert('Cần ít nhất 2 kịch bản để so sánh');
                            return;
                        }
                        setCompareSelection(scenarios.length === 2 ? [0, 1] : []);
                        setIsComparing(true);
                    }} className="bg-white/5 hover:bg-[#bf953f]/10 text-[#bf953f] px-4 py-2 rounded-xl flex items-center gap-2 font-black text-[9px] transition-all border border-[#bf953f]/20 uppercase tracking-widest">
                        <RefreshCw size={12} strokeWidth={3} /> So sánh
                    </button>
                    <button onClick={exportToExcel} className="bg-white/5 hover:bg-white/10 text-slate-400 px-4 py-2 rounded-xl flex items-center gap-2 font-black text-[9px] transition-all border border-white/10 uppercase tracking-widest">
                        <FileSpreadsheet size={12} /> EXCEL
                    </button>
                    <button onClick={copyToZalo} className="bg-white/5 hover:bg-white/10 text-slate-400 px-4 py-2 rounded-xl flex items-center gap-2 font-black text-[9px] transition-all border border-white/10 uppercase tracking-widest">
                        <Copy size={12} /> ZALO
                    </button>
                    <button onClick={handleExport} className="btn-bronze !py-2 !px-5 !text-[9px] shadow-lg shadow-[#bf953f]/10">
                        <Download size={12} strokeWidth={3} className="mr-1.5" /> XUẤT ẢNH
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Inputs - 3 columns */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="glass-card bg-white/[0.02] border-white/5 rounded-2xl">
                        <div className="p-5 space-y-5">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-[9px] font-black text-[#bf953f] uppercase tracking-widest flex items-center gap-2">
                                    <Settings className="w-3.5 h-3.5" /> Kịch bản
                                </h3>
                                <button onClick={addScenario} className="w-7 h-7 flex items-center justify-center bg-[#bf953f] text-black rounded-lg hover:bg-[#fcf6ba] transition-all shadow-md">
                                    <Plus size={14} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
                                {scenarios.map((s, i) => (
                                    <div key={s.id} className="relative group shrink-0">
                                        <button
                                            onClick={() => setActiveIdx(i)}
                                            className={`px-3 py-1.5 rounded-lg text-[8px] font-black whitespace-nowrap transition-all border ${activeIdx === i
                                                ? 'border-[#bf953f] bg-[#bf953f]/20 text-[#fcf6ba]'
                                                : 'border-white/5 text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {s.name}
                                        </button>
                                        {scenarios.length > 1 && (
                                            <button
                                                onClick={() => removeScenario(i)}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10 border border-black"
                                            >
                                                <Trash2 size={7} strokeWidth={4} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 mt-2 pt-4 border-t border-white/5 text-left">
                                <div className="space-y-1.5">
                                    <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Số tiền vay (VND)</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="w-full p-3 rounded-xl border border-white/10 bg-white/5 font-black text-xl text-[#bf953f] outline-none focus:border-[#bf953f]/40"
                                            value={activeScenario.amount === 0 ? '' : formatNumber(activeScenario.amount)}
                                            onChange={(e) => updateScenario({ amount: parseFormattedNumber(e.target.value) })}
                                        />
                                    </div>
                                    <div className="text-[8px] font-bold text-slate-600 italic px-1">➔ {formatNumberToVietnamese(activeScenario.amount)}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="block text-[8px] font-black text-slate-500 uppercase tracking-tighter">Hạn (năm)</label>
                                        <input type="number" className="w-full p-3 rounded-xl border border-white/10 bg-white/5 font-black text-xs text-white outline-none" value={activeScenario.term || ''} onChange={(e) => updateScenario({ term: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-[8px] font-black text-slate-500 uppercase tracking-tighter">Lãi suất (%/năm)</label>
                                        <input type="number" step="0.1" className="w-full p-3 rounded-xl border border-white/10 bg-white/5 font-black text-xs text-[#fcf6ba] outline-none" value={activeScenario.rate || ''} onChange={(e) => updateScenario({ rate: Number(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[8px] font-black text-[#bf953f] uppercase tracking-widest">Ân hạn gốc (tháng)</label>
                                    <input type="number" className="w-full p-3 rounded-xl border border-white/10 bg-white/5 font-black text-xs text-[#bf953f] outline-none" value={activeScenario.gracePeriod === 0 ? '' : activeScenario.gracePeriod} onChange={(e) => updateScenario({ gracePeriod: Number(e.target.value) })} />
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tất toán sớm</span>
                                    <label className="relative inline-flex items-center cursor-pointer scale-75">
                                        <input type="checkbox" className="sr-only peer" checked={activeScenario.hasPrepay} onChange={(e) => updateScenario({ hasPrepay: e.target.checked })} />
                                        <div className="w-10 h-5 bg-white/10 rounded-full peer peer-checked:bg-[#bf953f] after:content-[''] after:absolute after:top-[2.5px] after:left-[2.5px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-checked:after:bg-black"></div>
                                    </label>
                                </div>
                                {activeScenario.hasPrepay && (
                                    <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded-xl border border-white/5 animate-in fade-in zoom-in duration-300">
                                        <div className="space-y-1">
                                            <label className="block text-[8px] font-black text-slate-500">Tháng trả</label>
                                            <input type="number" className="w-full p-2.5 rounded-lg border border-white/10 bg-black/40 text-xs text-white" value={activeScenario.prepayMonth || ''} onChange={(e) => updateScenario({ prepayMonth: Number(e.target.value) })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-[8px] font-black text-slate-500">Phí phạt %</label>
                                            <input type="number" step="0.1" className="w-full p-2.5 rounded-lg border border-white/10 bg-black/40 text-xs text-red-400" value={activeScenario.prepayPenalty === 0 ? '' : activeScenario.prepayPenalty} onChange={(e) => updateScenario({ prepayPenalty: Number(e.target.value) })} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="block text-[8px] font-black text-[#bf953f] uppercase tracking-widest">Ngân hàng & Phương thức</label>
                                <button
                                    onClick={() => setIsBankSelectorOpen(!isBankSelectorOpen)}
                                    className="w-full p-2.5 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between hover:bg-white/10 transition-all font-bold text-[10px]"
                                >
                                    <div className="flex items-center gap-2">
                                        {activeScenario.bankCode ? <img src={`https://api.vietqr.io/img/${activeScenario.bankCode === 'CTG' ? 'ICB' : activeScenario.bankCode}.png`} className="h-4 object-contain" /> : <Building2 size={12} className="text-[#bf953f]" />}
                                        <span className="truncate max-w-[120px]">{activeScenario.bankName || 'Chọn ngân hàng...'}</span>
                                    </div>
                                    <ArrowDownCircle size={12} className={`text-[#bf953f] transition-transform ${isBankSelectorOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isBankSelectorOpen && (
                                    <div className="absolute left-6 right-6 bg-black border border-white/10 rounded-xl z-50 p-2 shadow-2xl max-h-[200px] overflow-y-auto no-scrollbar">
                                        {BANK_LIST.map(bank => (
                                            <button key={bank.code} onClick={() => { updateScenario({ bankCode: bank.code, bankName: bank.name }); setIsBankSelectorOpen(false); }} className="w-full p-2 flex items-center gap-3 hover:bg-[#bf953f]/10 rounded-lg border-b border-white/5 text-[9px]">
                                                <img src={bank.logo} className="h-4 w-6 object-contain bg-white rounded p-0.5" />
                                                <span className="text-white font-bold">{bank.code}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <button onClick={() => updateScenario({ method: 'emi' })} className={`flex-1 py-2 rounded-lg text-[9px] font-black border transition-all ${activeScenario.method === 'emi' ? 'border-[#bf953f] bg-[#bf953f]/10 text-gold' : 'border-white/5 bg-white/5 text-slate-500'}`}>EMI</button>
                                    <button onClick={() => updateScenario({ method: 'diminishing' })} className={`flex-1 py-2 rounded-lg text-[9px] font-black border transition-all ${activeScenario.method === 'diminishing' ? 'border-[#bf953f] bg-[#bf953f]/10 text-gold' : 'border-white/5 bg-white/5 text-slate-500'}`}>Gốc đều</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results - 9 columns */}
                <div className="lg:col-span-9 space-y-6">
                    <div ref={resultRef} className={`glass-card bg-black flex flex-col relative overflow-hidden ${isExporting ? 'p-16 w-[1100px] text-slate-900 rounded-none' : 'p-6 md:p-8 rounded-[2rem]'}`}>
                        <div className="relative z-10 space-y-8">
                            {/* Dashboard Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-white/[0.03] border border-white/10 p-5 rounded-2xl">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Khoản vay</p>
                                    <p className="text-lg font-black text-[#bf953f] tracking-tighter">{formatCurrency(activeScenario.amount)}</p>
                                </div>
                                <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Lãi suất</p>
                                    <p className="text-lg font-black text-white tracking-tighter">{activeScenario.rate}% <span className="text-[10px] opacity-40">/ Năm</span></p>
                                </div>
                                <div className="bg-[#bf953f] p-5 rounded-2xl text-black">
                                    <p className="text-[8px] font-black uppercase opacity-60 mb-1.5">Trả tháng đầu</p>
                                    <p className="text-lg font-black tracking-tighter">{results ? formatCurrency(results.firstMonth) : '...'}</p>
                                </div>
                                <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Tổng lãi vay</p>
                                    <p className="text-lg font-black text-white tracking-tighter">{results ? formatCurrency(results.totalInterest) : '...'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                                <div className="md:col-span-5 space-y-6">
                                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl h-[300px]">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Cơ cấu nợ vay (%)</h4>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                                    {chartData.map((e, i) => <Cell key={i} fill={i === 0 ? '#bf953f' : '#333'} />)}
                                                </Pie>
                                                <Tooltip contentStyle={{ background: '#000', border: 'none', borderRadius: '12px' }} />
                                                <Legend verticalAlign="bottom" align="center" iconType="circle" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="bg-slate-900 shadow-xl border border-white/5 p-6 rounded-3xl space-y-4">
                                        <h4 className="text-[10px] font-black text-gold uppercase tracking-widest">Tóm tắt phương án</h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-[11px]"><span className="text-slate-500">Gốc thực nhận:</span><span className="text-white font-bold">{formatCurrency(activeScenario.amount)}</span></div>
                                            <div className="flex justify-between text-[11px]"><span className="text-slate-500">Tổng gốc + lãi:</span><span className="text-white font-bold">{results ? formatCurrency(results.totalPayment) : '...'}</span></div>
                                            <div className="flex justify-between text-[11px]"><span className="text-slate-500">Ân hạn nợ gốc:</span><span className="text-gold font-bold">{activeScenario.gracePeriod} Tháng</span></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-7 flex flex-col space-y-6">
                                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl h-[300px]">
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Dòng tiền thanh toán (Năm)</h4>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={results?.schedule?.filter((_, i) => (i + 1) % 12 === 0 || i === 0).map(s => ({
                                                year: `N${Math.ceil(s.month / 12)}`,
                                                principal: s.principal,
                                                interest: s.interest
                                            })).slice(0, 10) || []}>
                                                <XAxis dataKey="year" fontSize={10} axisLine={false} tickLine={false} />
                                                <Tooltip contentStyle={{ background: '#000', border: 'none' }} />
                                                <Bar dataKey="principal" stackId="a" fill="#bf953f" radius={[4, 4, 0, 0]} barSize={15} />
                                                <Bar dataKey="interest" stackId="a" fill="#333" radius={[4, 4, 0, 0]} barSize={15} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {activeScenario.hasPrepay && (
                                        <div className="p-6 bg-gradient-to-br from-[#bf953f]/10 to-transparent border border-[#bf953f]/20 rounded-3xl space-y-4">
                                            <h4 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2">
                                                <ShieldCheck size={14} /> Dự kiến tất toán (Tháng {activeScenario.prepayMonth})
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-[8px] text-slate-500 uppercase mb-1">Dư nợ gốc</p>
                                                    <p className="text-sm font-black text-white">{results ? formatCurrency(results.remainingAtPrepay) : '...'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] text-red-500 uppercase mb-1">Phí phạt ({activeScenario.prepayPenalty}%)</p>
                                                    <p className="text-sm font-black text-red-400">{results ? formatCurrency(results.prepayPenaltyAmount) : '...'}</p>
                                                </div>
                                            </div>
                                            <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                                                <span className="text-[10px] font-black text-white uppercase">Tổng tất toán:</span>
                                                <span className="text-lg font-black text-gold">{results ? formatCurrency(results.remainingAtPrepay + results.prepayPenaltyAmount) : '...'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6">
                                <button onClick={() => setShowSchedule(!showSchedule)} className="w-full py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all flex items-center justify-center gap-2">
                                    <Calendar size={14} /> {showSchedule ? 'Thu gọn lịch' : 'Xem lịch chi tiết'}
                                </button>
                                {showSchedule && (
                                    <div className="mt-4 rounded-2xl overflow-hidden border border-white/5 h-[400px] overflow-y-auto custom-scrollbar">
                                        <table className="w-full text-left text-[11px]">
                                            <thead className="sticky top-0 bg-black text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                                <tr>
                                                    <th className="p-4">Tháng</th>
                                                    <th className="p-4">Tổng trả</th>
                                                    <th className="p-4">Gốc/Lãi</th>
                                                    <th className="p-4 text-right">Dư nợ</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-slate-300 font-bold">
                                                {results?.schedule.map((s, idx) => (
                                                    <tr key={idx} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                                                        <td className="p-4 text-[#bf953f]">M-{s.month}</td>
                                                        <td className="p-4 font-black">{formatCurrency(s.payment)}</td>
                                                        <td className="p-4 text-[9px] opacity-60">{formatCurrency(s.principal)} / {formatCurrency(s.interest)}</td>
                                                        <td className="p-4 text-right font-black opacity-80">{formatCurrency(s.remaining)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {isComparing && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsComparing(false)}></div>
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 animate-in zoom-in-95 duration-300">
                            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Bảng <span className="text-gold">So Sánh Elite</span></h3>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">Multi-Scenario Analysis</p>
                                </div>
                                <button onClick={() => setIsComparing(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10">
                                    <Plus className="rotate-45 text-slate-500" size={20} />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="hidden md:block pt-[112px] space-y-5">
                                        {['Khoản vay', 'Thời hạn', 'Lãi suất', 'Ân hạn', 'Trả tháng đầu', 'Tháng tất toán', 'Tiền tất toán', 'Thực chi dự kiến'].map(l => (
                                            <div key={l} className="h-10 flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">{l}</div>
                                        ))}
                                    </div>
                                    {scenarios.map((s, idx) => {
                                        const res = calculateGenericLoan(s);
                                        return (
                                            <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-5">
                                                <div className="text-center pb-4 border-b border-white/5">
                                                    <p className="text-[10px] font-black text-gold uppercase mb-1">{s.name}</p>
                                                    <p className="text-sm font-black text-white uppercase truncate">{s.bankName || 'Standard'}</p>
                                                </div>
                                                <div className="space-y-5">
                                                    <div className="h-10 flex items-center justify-center text-sm font-black text-white border-b border-white/[0.02]">{formatCurrency(s.amount)}</div>
                                                    <div className="h-10 flex items-center justify-center text-xs font-black text-slate-300 border-b border-white/[0.02]">{s.term} Năm</div>
                                                    <div className="h-10 flex items-center justify-center text-xs font-black text-gold border-b border-white/[0.02]">{s.rate}%</div>
                                                    <div className="h-10 flex items-center justify-center text-xs font-black text-white border-b border-white/[0.02]">{s.gracePeriod} Tháng</div>
                                                    <div className="h-10 flex items-center justify-center text-sm font-black text-[#fcf6ba] border-b border-white/[0.02]">{formatCurrency(res.firstMonth)}</div>
                                                    <div className="h-10 flex items-center justify-center text-xs font-black text-gold border-b border-white/[0.02]">Tháng {s.prepayMonth}</div>
                                                    <div className="h-10 flex items-center justify-center text-sm font-black text-red-400 border-b border-white/[0.02]">{formatCurrency(res.remainingAtPrepay + res.prepayPenaltyAmount)}</div>
                                                    <div className="h-10 flex items-center justify-center text-xs font-black text-white/50 border-b border-white/[0.02]">{formatCurrency(res.paidPrincipalUntilPrepay + res.paidInterestUntilPrepay + res.remainingAtPrepay + res.prepayPenaltyAmount)}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
