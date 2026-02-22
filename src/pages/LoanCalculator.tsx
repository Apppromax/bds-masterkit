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
                        remainingAtPrepay = remainingPrincipal + principalPaid; // Dư nợ ĐẦU kỳ của tháng tất toán
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

        // 1. Prepare Header Info
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

        // 2. Prepare Schedule Data
        const scheduleData = results.schedule.map(s => [
            s.month,
            Math.round(s.payment),
            Math.round(s.principal),
            Math.round(s.interest),
            Math.round(s.remaining)
        ]);

        // 3. Combine Data
        const fullData = [...infoData, ...scheduleData];

        // 4. Create Workbook & Sheet
        const ws = XLSX.utils.aoa_to_sheet(fullData);

        // Define column widths
        ws['!cols'] = [
            { wch: 10 }, // Tháng
            { wch: 20 }, // Tổng trả
            { wch: 20 }, // Tiền gốc
            { wch: 20 }, // Tiền lãi
            { wch: 20 }  // Dư nợ
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Lich Tra No");

        // 5. Download
        XLSX.writeFile(wb, `Phuong-an-tai-chinh-${activeScenario.bankName || 'BDS'}.xlsx`);
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
        <div className="pb-20 md:pb-0">
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gold flex items-center gap-3 uppercase tracking-tighter">
                        <div className="p-2.5 bg-gradient-to-br from-[#bf953f] to-[#aa771c] rounded-2xl shadow-lg shadow-[#bf953f]/20">
                            <Calculator className="text-black" size={24} strokeWidth={3} />
                        </div>
                        Tính Lãi Vay Elite
                    </h1>
                    <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-2 ml-14">Smart Financial Forecasting AI</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button onClick={() => {
                        if (scenarios.length < 2) {
                            alert('Cần ít nhất 2 kịch bản để so sánh');
                            return;
                        }
                        if (scenarios.length === 2) {
                            setCompareSelection([0, 1]);
                            setIsComparing(true);
                        } else {
                            setIsComparing(true);
                        }
                    }} className="bg-white/5 hover:bg-[#bf953f]/10 text-[#bf953f] px-5 py-3 rounded-xl flex items-center gap-2 font-black text-[10px] transition-all border border-[#bf953f]/20 uppercase tracking-widest">
                        <RefreshCw size={14} strokeWidth={3} /> So sánh
                    </button>
                    <button onClick={exportToExcel} className="bg-white/5 hover:bg-white/10 text-slate-400 px-5 py-3 rounded-xl flex items-center gap-2 font-black text-[10px] transition-all border border-white/10 uppercase tracking-widest">
                        <FileSpreadsheet size={14} /> EXCEL
                    </button>
                    <button onClick={copyToZalo} className="bg-white/5 hover:bg-white/10 text-slate-400 px-5 py-3 rounded-xl flex items-center gap-2 font-black text-[10px] transition-all border border-white/10 uppercase tracking-widest">
                        <Copy size={14} /> ZALO
                    </button>
                    <button onClick={handleExport} className="btn-bronze !py-3 !px-6 !text-[10px] shadow-xl shadow-[#bf953f]/20">
                        <Download size={14} strokeWidth={3} className="mr-2" /> XUẤT ẢNH ELITE
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-3 space-y-6">
                    <div className="glass-card p-1">
                        <div className="bg-black/60 rounded-[1.4rem] p-6 space-y-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-[10px] font-black text-[#bf953f] uppercase tracking-widest flex items-center gap-2">
                                    <Settings className="w-4 h-4" /> Kịch bản Elite
                                </h3>
                                <button onClick={addScenario} className="w-8 h-8 flex items-center justify-center bg-[#bf953f] text-black rounded-lg hover:bg-[#fcf6ba] transition-all shadow-lg shadow-[#bf953f]/20">
                                    <Plus size={16} strokeWidth={3} />
                                </button>
                            </div>

                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 pt-1 px-1 -mx-1">
                                {scenarios.map((s, i) => (
                                    <div key={s.id} className="relative group">
                                        <button
                                            onClick={() => setActiveIdx(i)}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all border ${activeIdx === i
                                                ? 'border-[#bf953f] bg-[#bf953f]/20 text-[#fcf6ba] shadow-[0_0_15px_rgba(191,149,63,0.1)]'
                                                : 'border-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                                        >
                                            {s.name}
                                        </button>
                                        {scenarios.length > 1 && (
                                            <button
                                                onClick={() => removeScenario(i)}
                                                className="absolute -top-1.5 -right-1.5 bg-red-500/80 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg z-30 flex items-center justify-center border-2 border-black"
                                            >
                                                <Trash2 size={10} strokeWidth={3} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-5 mt-4 pt-4 border-t border-white/5">
                                <div className="space-y-2">
                                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.1em]">Số tiền vay dự kiến</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 font-black text-2xl text-gold outline-none focus:border-[#bf953f]/50 transition-all placeholder:text-white/10"
                                            value={activeScenario.amount === 0 ? '' : formatNumber(activeScenario.amount)}
                                            placeholder="0"
                                            onChange={(e) => updateScenario({ amount: parseFormattedNumber(e.target.value) })}
                                            onFocus={(e) => e.target.select()}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#bf953f]/40">VND</div>
                                    </div>
                                    <div className="px-1 text-[10px] font-bold text-slate-600 italic">➔ {formatNumberToVietnamese(activeScenario.amount)}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-tighter">Thời hạn (năm)</label>
                                        <input type="number" placeholder="0" className="w-full p-3.5 rounded-xl border border-white/10 bg-white/5 font-black text-sm text-white outline-none focus:border-[#bf953f]/50" value={activeScenario.term || ''} onChange={(e) => updateScenario({ term: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-tighter">Lãi suất %/năm</label>
                                        <input type="number" step="0.1" placeholder="0" className="w-full p-3.5 rounded-xl border border-white/10 bg-white/5 font-black text-sm text-[#fcf6ba] outline-none focus:border-[#bf953f]/50" value={activeScenario.rate || ''} onChange={(e) => updateScenario({ rate: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <label className="block text-[9px] font-black text-[#bf953f] uppercase mb-2 flex justify-between tracking-widest">
                                        <span>Ân hạn nợ gốc</span>
                                        <span className="text-slate-500 font-bold lowercase italic">Chỉ trả lãi hàng tháng</span>
                                    </label>
                                    <div className="relative">
                                        <input type="number" placeholder="0" className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 font-black text-sm text-[#bf953f] outline-none focus:border-[#bf953f]/50" value={activeScenario.gracePeriod === 0 ? '' : activeScenario.gracePeriod} onChange={(e) => updateScenario({ gracePeriod: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600">tháng</div>
                                    </div>
                                </div>
                                <div className="pt-2 flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 shadow-inner">
                                    <div className="space-y-0.5">
                                        <label className="block text-[9px] font-black text-slate-300 uppercase tracking-widest">Tất toán trước hạn</label>
                                        <p className="text-[7px] text-slate-500 font-bold italic lowercase">Phân tích phí phạt & dư nợ thực tế</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={activeScenario.hasPrepay} onChange={(e) => updateScenario({ hasPrepay: e.target.checked })} />
                                        <div className="w-10 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-none after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#bf953f] peer-checked:after:bg-black"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {activeScenario.hasPrepay && (
                        <div className="glass-card p-1 animate-in slide-in-from-top-2 duration-500">
                            <div className="bg-black/60 rounded-[1.4rem] p-5 grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-tighter">Tháng tất toán</label>
                                    <input type="number" placeholder="0" className="w-full p-3.5 rounded-xl border border-white/10 bg-white/5 font-black text-sm text-white outline-none focus:border-[#bf953f]/50" value={activeScenario.prepayMonth || ''} onChange={(e) => updateScenario({ prepayMonth: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-tighter">Phí phạt %</label>
                                    <input type="number" step="0.1" placeholder="0" className="w-full p-3.5 rounded-xl border border-white/10 bg-white/5 font-black text-sm text-red-400 outline-none focus:border-red-500/30" value={activeScenario.prepayPenalty === 0 ? '' : activeScenario.prepayPenalty} onChange={(e) => updateScenario({ prepayPenalty: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="glass-card p-1">
                        <div className="bg-black/60 rounded-[1.4rem] p-6 space-y-5">
                            <div>
                                <label className="block text-[9px] font-black text-[#bf953f] uppercase mb-3 flex justify-between tracking-widest">
                                    <span>Định chế Ngân hàng</span>
                                    {activeScenario.bankName && <span className="text-white/40 lowercase font-bold">{activeScenario.bankName}</span>}
                                </label>
                                <div className="relative">
                                    <button
                                        onClick={() => setIsBankSelectorOpen(!isBankSelectorOpen)}
                                        className="w-full p-3.5 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-between hover:bg-white/10 hover:border-[#bf953f]/30 transition-all font-bold text-[11px]"
                                    >
                                        <div className="flex items-center gap-3">
                                            {activeScenario.bankCode ? (
                                                <div className="w-8 h-6 bg-white rounded-md p-1 flex items-center justify-center">
                                                    <img src={`https://api.vietqr.io/img/${activeScenario.bankCode === 'CTG' ? 'ICB' : activeScenario.bankCode}.png`} className="w-full h-full object-contain" alt="logo" />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                                                    <Building2 size={16} className="text-[#bf953f]" />
                                                </div>
                                            )}
                                            <span className={activeScenario.bankName ? 'text-white' : 'text-slate-500'}>
                                                {activeScenario.bankName || 'Chọn ngân hàng đối tác...'}
                                            </span>
                                        </div>
                                        <ArrowDownCircle size={14} className={`text-[#bf953f] transition-transform duration-500 ${isBankSelectorOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isBankSelectorOpen && (
                                        <div className="absolute bottom-full left-0 right-0 mb-3 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-[60] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="p-3 border-b border-white/5">
                                                <input
                                                    type="text"
                                                    placeholder="Tìm kiếm ngân hàng..."
                                                    className="w-full p-3 rounded-xl bg-white/5 text-[11px] font-bold text-white outline-none border border-white/5 focus:border-[#bf953f]/30 placeholder:text-slate-600"
                                                    value={bankSearch}
                                                    onChange={(e) => setBankSearch(e.target.value)}
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="max-h-[240px] overflow-y-auto no-scrollbar">
                                                {BANK_LIST.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()) || b.code.toLowerCase().includes(bankSearch.toLowerCase())).map(bank => (
                                                    <button
                                                        key={bank.code}
                                                        onClick={() => {
                                                            updateScenario({ bankCode: bank.code, bankName: bank.name });
                                                            setIsBankSelectorOpen(false);
                                                            setBankSearch('');
                                                        }}
                                                        className="w-full p-4 flex items-center gap-4 hover:bg-[#bf953f]/10 transition-all border-b border-white/5 last:border-0 group"
                                                    >
                                                        <div className="w-10 h-7 bg-white rounded-lg p-1.5 flex items-center justify-center shrink-0">
                                                            <img src={bank.logo} className="w-full h-full object-contain" alt={bank.code} />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-[11px] font-black text-white group-hover:text-[#fcf6ba] leading-none mb-1.5">{bank.code}</p>
                                                            <p className="text-[9px] font-bold text-slate-500 leading-none truncate max-w-[150px]">{bank.name}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[9px] font-black text-[#bf953f] uppercase mb-3 tracking-widest">Phương thức thanh toán</label>
                                <div className="flex gap-3">
                                    <button onClick={() => updateScenario({ method: 'emi' })} className={`flex-1 py-3 px-2 rounded-xl text-center border transition-all duration-300 ${activeScenario.method === 'emi' ? 'border-[#bf953f] bg-[#bf953f]/20 text-[#fcf6ba]' : 'border-white/5 bg-white/5 text-slate-500 hover:text-slate-300'}`}>
                                        <p className="text-[10px] font-black">EMI Cố định</p>
                                    </button>
                                    <button onClick={() => updateScenario({ method: 'diminishing' })} className={`flex-1 py-3 px-2 rounded-xl text-center border transition-all duration-300 ${activeScenario.method === 'diminishing' ? 'border-[#bf953f] bg-[#bf953f]/20 text-[#fcf6ba]' : 'border-white/5 bg-white/5 text-slate-500 hover:text-slate-300'}`}>
                                        <p className="text-[10px] font-black">Dư nợ giảm dần</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-9 space-y-8">
                    <div ref={resultRef} className={`relative overflow-hidden flex flex-col transition-all duration-700 ${isExporting
                        ? 'p-20 w-[1200px] bg-white text-slate-900 rounded-none shadow-none'
                        : 'glass-card p-1 rounded-[2.5rem] shadow-2xl h-full'}`}>

                        {!isExporting && (
                            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#bf953f]/5 to-transparent pointer-events-none rounded-t-[2.5rem]"></div>
                        )}

                        <div className={`${isExporting ? '' : 'bg-black/60 backdrop-blur-3xl rounded-[2.4rem] p-8 md:p-12 min-h-full flex flex-col relative z-10'}`}>

                            {/* Premium Export Background */}
                            {isExporting && (
                                <div className="absolute inset-0 z-0 overflow-hidden">
                                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#bf953f]/5 rounded-full blur-[150px] -mr-96 -mt-96"></div>
                                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#aa771c]/5 rounded-full blur-[120px] -ml-64 -mb-64"></div>
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                                </div>
                            )}

                            <div className="relative z-20 w-full flex flex-col items-center mb-10">
                                <div className="w-full flex justify-between items-center mb-8 pb-4 border-b border-white/5 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#bf953f] to-[#aa771c] p-[1px]">
                                            <div className="w-full h-full bg-black rounded-xl flex items-center justify-center">
                                                <Building2 className="text-[#bf953f]" size={16} strokeWidth={2.5} />
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-gold uppercase tracking-[0.2em] opacity-80">Elite Financial Analytics</span>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-white uppercase leading-none mb-1">{profile?.full_name || 'Senior Advisor'}</p>
                                            <p className="text-[8px] font-bold text-[#bf953f] tracking-widest">{profile?.phone || 'Financial Expert'}</p>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-[#bf953f]/30 p-0.5">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${profile?.full_name || 'Expert'}&background=bf953f&color=000`}
                                                className="w-full h-full rounded-full object-cover"
                                                alt="avatar"
                                            />
                                        </div>
                                    </div>
                                </div>


                                <div className="flex flex-col items-center gap-2 mb-4">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none text-center">
                                        Phướng Án <span className="text-gold">Tài Chính Elite</span>
                                    </h2>
                                    {activeScenario.bankCode && (
                                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-1000">
                                            <div className="w-12 h-8 bg-white rounded-lg p-1.5 flex items-center justify-center shadow-lg">
                                                <img
                                                    src={`https://api.vietqr.io/img/${activeScenario.bankCode === 'CTG' ? 'ICB' : activeScenario.bankCode}.png`}
                                                    className="w-full h-full object-contain"
                                                    alt="bank"
                                                />
                                            </div>
                                            <div className="w-[1px] h-4 bg-white/10"></div>
                                            <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.2em]">
                                                Generated: {new Date().toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>


                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className={`${isExporting ? 'bg-slate-900' : 'bg-white/5 border border-white/10'} p-6 rounded-[2rem] flex flex-col justify-center relative overflow-hidden group`}>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 opacity-80">Số vốn vay</p>
                                    <p className={`text-xl font-black tracking-tighter leading-none ${isExporting ? 'text-white' : 'text-gold'}`}>{formatCurrency(activeScenario.amount)}</p>
                                    <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign size={32} /></div>
                                </div>
                                <div className={`${isExporting ? 'bg-slate-50' : 'bg-white/5 border border-white/5'} p-6 rounded-[2rem] flex flex-col justify-center text-center shadow-sm`}>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Thời hạn</p>
                                    <p className={`text-xl font-black tracking-tighter leading-none ${isExporting ? 'text-slate-800' : 'text-white'}`}>{activeScenario.term} Năm</p>
                                    <p className="text-[7px] font-bold text-slate-500 mt-1.5 uppercase tracking-widest">({activeScenario.term * 12} Tháng)</p>
                                </div>
                                <div className={`${isExporting ? 'bg-slate-50' : 'bg-white/5 border border-white/5'} p-6 rounded-[2rem] flex flex-col justify-center text-center shadow-sm`}>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Lãi suất</p>
                                    <p className={`text-xl font-black tracking-tighter leading-none ${isExporting ? 'text-slate-800' : 'text-white'}`}>{activeScenario.rate}%</p>
                                    <p className="text-[7px] font-bold text-slate-500 mt-1.5 uppercase tracking-widest">Cố định/Năm</p>
                                </div>
                                <div className={`p-6 rounded-[2rem] border flex flex-col justify-center text-center transition-all duration-500 ${activeScenario.gracePeriod > 0
                                    ? (isExporting ? 'bg-indigo-50 border-indigo-200' : 'bg-[#bf953f]/10 border-[#bf953f]/30 shadow-[0_0_20px_rgba(191,149,63,0.1)]')
                                    : (isExporting ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5')}`}>
                                    <p className={`text-[8px] font-black uppercase tracking-widest mb-1 leading-none ${activeScenario.gracePeriod > 0 ? (isExporting ? 'text-indigo-600' : 'text-gold') : 'text-slate-500'}`}>Ân hạn nợ</p>
                                    <p className={`text-xl font-black tracking-tighter leading-none ${activeScenario.gracePeriod > 0 ? (isExporting ? 'text-indigo-700' : 'text-white') : (isExporting ? 'text-slate-800' : 'text-white/40')}`}>{activeScenario.gracePeriod} Tháng</p>
                                    <p className={`text-[7px] font-bold mt-1.5 uppercase tracking-widest ${activeScenario.gracePeriod > 0 ? (isExporting ? 'text-indigo-400' : 'text-gold/50') : 'text-slate-500'}`}>Gốc</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                                <div className={`${isExporting ? 'bg-slate-900' : 'bg-gold shadow-2xl shadow-[#bf953f]/20'} p-6 rounded-[2.2rem] text-black flex flex-col justify-center relative overflow-hidden`}>
                                    <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={28} /></div>
                                    <p className={`text-[8px] font-black uppercase mb-2 tracking-widest leading-none ${isExporting ? 'text-slate-400' : 'text-black/60'}`}>Trả tháng đầu</p>
                                    <p className={`text-2xl font-black tracking-tighter leading-none ${isExporting ? 'text-white' : 'text-black'}`}>{results ? formatCurrency(results.firstMonth) : '...'}</p>
                                </div>
                                <div className={`${isExporting ? 'bg-slate-50' : 'bg-white/5 border border-white/10'} p-6 rounded-[2.2rem] flex flex-col justify-center shadow-sm`}>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 leading-none">Tổng lãi dự kiến</p>
                                    <p className={`text-2xl font-black tracking-tighter leading-none ${isExporting ? 'text-slate-900' : 'text-white'}`}>{results ? formatCurrency(results.totalInterest) : '...'}</p>
                                </div>
                                <div className={`${isExporting ? 'bg-slate-50' : 'bg-white/5 border border-white/10'} p-6 rounded-[2.2rem] flex flex-col justify-center shadow-sm`}>
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2 leading-none">Tổng gốc + lãi</p>
                                    <p className={`text-2xl font-black tracking-tighter leading-none ${isExporting ? 'text-slate-900' : 'text-white'}`}>{results ? formatCurrency(results.totalPayment) : '...'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10">
                                <div className={`${activeScenario.hasPrepay ? 'md:col-span-5' : 'md:col-span-12'} flex flex-col space-y-8`}>
                                    <div className={`grid grid-cols-1 ${activeScenario.hasPrepay ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-8`}>
                                        <div className="flex flex-col space-y-5">
                                            <h4 className="flex items-center gap-3 text-[12px] font-black text-white uppercase tracking-[0.2em]">
                                                <div className="w-10 h-[2px] bg-gold rounded-full"></div> Phân bổ Vốn & Lãi
                                            </h4>
                                            <div className={`${isExporting ? 'bg-slate-50' : 'bg-white/5'} h-[280px] flex items-center justify-center rounded-[2.5rem] border border-white/5 p-6`}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={chartData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={70}
                                                            outerRadius={95}
                                                            paddingAngle={8}
                                                            dataKey="value"
                                                            stroke="none"
                                                            label={({ cx, cy, midAngle = 0, innerRadius = 0, outerRadius = 0, percent }) => {
                                                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                                                return (percent && percent > 0.1) ? (
                                                                    <text x={x} y={y} fill={isExporting ? "white" : "black"} textAnchor="middle" dominantBaseline="central" className="text-[11px] font-black">
                                                                        {`${(percent * 100).toFixed(0)}%`}
                                                                    </text>
                                                                ) : null;
                                                            }}
                                                            labelLine={false}
                                                        >
                                                            {chartData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={index === 0 ? '#bf953f' : '#fcf6ba'} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip
                                                            contentStyle={{ background: '#000', borderRadius: '16px', border: '1px solid #bf953f33', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', fontSize: '11px', color: '#fff' }}
                                                            itemStyle={{ color: '#fff' }}
                                                            formatter={(value: any) => formatCurrency(Number(value || 0))}
                                                        />
                                                        <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '900', paddingTop: '20px', color: '#888' }} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-5">
                                            <h4 className="flex items-center gap-3 text-[12px] font-black text-white uppercase tracking-[0.2em]">
                                                <div className="w-10 h-[2px] bg-slate-500 rounded-full"></div> Biểu đồ dòng tiền
                                            </h4>
                                            <div className={`${isExporting ? 'bg-slate-50' : 'bg-white/5'} h-[280px] rounded-[2.5rem] border border-white/5 p-8`}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={results?.schedule?.filter((_, i) => (i + 1) % 12 === 0 || i === 0).map((s) => ({
                                                            year: s.month === 1 ? 'M1' : `N${Math.ceil(s.month / 12)}`,
                                                            principal: s.principal,
                                                            interest: s.interest,
                                                            total: s.payment
                                                        })).filter((_, i, arr) => i === 0 || (i + 1) % 5 === 0 || i === arr.length - 1) || []}
                                                        margin={{ top: 30, right: 10, left: -20, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isExporting ? "#e2e8f0" : "#ffffff05"} />
                                                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} />
                                                        <YAxis hide />
                                                        <Tooltip
                                                            formatter={(value: any) => formatCurrency(Number(value))}
                                                            contentStyle={{ background: '#000', borderRadius: '16px', border: '1px solid #bf953f33', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', fontSize: '11px', color: '#fff' }}
                                                        />
                                                        <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', paddingTop: '15px' }} />
                                                        <Bar dataKey="principal" name="Gốc" stackId="a" fill="#bf953f" radius={[0, 0, 0, 0]} barSize={24} />
                                                        <Bar dataKey="interest" name="Lãi" stackId="a" fill="#fcf6ba" radius={[6, 6, 0, 0]} barSize={24}>
                                                            <LabelList
                                                                dataKey="total"
                                                                position="top"
                                                                content={(props: any) => {
                                                                    const { x, y, width, value } = props;
                                                                    return (
                                                                        <text x={x + width / 2} y={y - 15} fill={isExporting ? "#94a3b8" : "#bf953f"} textAnchor="middle" fontSize={8} fontWeight={900}>
                                                                            {value > 1000000 ? `${(value / 1000000).toFixed(1)}M` : value}
                                                                        </text>
                                                                    );
                                                                }}
                                                            />
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {activeScenario.hasPrepay && (
                                    <div className="md:col-span-7 flex flex-col space-y-5">
                                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <h4 className="flex items-center gap-2 text-[12px] font-black text-white uppercase tracking-[0.2em]">
                                                <div className="w-8 h-[2px] bg-red-500 rounded-full"></div> Phân tích Tất toán
                                            </h4>
                                            <span className="text-[10px] font-black text-gold border border-gold/30 px-3 py-1 rounded-lg uppercase">{activeScenario.name}</span>
                                        </div>

                                        <div className="flex-grow space-y-3">
                                            <div className="flex justify-between py-2.5 border-b border-white/5 text-[11px] font-bold"><span className="text-slate-500 uppercase tracking-tight">Vốn vay ban đầu:</span><span className="text-white font-black">{formatCurrency(activeScenario.amount)}</span></div>
                                            <div className="flex justify-between py-2.5 border-b border-white/5 text-[11px] font-bold"><span className="text-slate-500 uppercase tracking-tight">Lãi suất áp dụng:</span><span className="text-[#fcf6ba] font-black">{activeScenario.rate}%/năm</span></div>
                                            <div className="flex justify-between py-2.5 border-b border-white/5 text-[11px] font-bold"><span className="text-slate-500 uppercase tracking-tight">Thời điểm tất toán:</span><span className="text-gold font-black">Tháng thứ {activeScenario.prepayMonth}</span></div>

                                            <div className={`${isExporting ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'} mt-4 p-6 rounded-[2.5rem] border shadow-2xl space-y-4 relative overflow-hidden`}>
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#bf953f]/10 rounded-full blur-[60px]"></div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="p-2 bg-[#bf953f]/20 rounded-lg">
                                                        <ShieldCheck size={16} className="text-gold" />
                                                    </div>
                                                    <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Chi tiết Phí phạt & Dư nợ</span>
                                                </div>
                                                <div className="space-y-2 pb-4 border-b border-white/5">
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tight"><span>Gốc đã trả tích lũy:</span><span className="text-slate-300">{results ? formatCurrency(results.paidPrincipalUntilPrepay) : '...'}</span></div>
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-tight"><span>Lãi đã trả tích lũy:</span><span className="text-slate-300">{results ? formatCurrency(results.paidInterestUntilPrepay) : '...'}</span></div>
                                                    <div className="flex justify-between text-[11px] font-black text-gold pt-1 uppercase tracking-tight"><span>Tổng cộng đã thanh toán:</span><span>{results ? formatCurrency(results.paidPrincipalUntilPrepay + results.paidInterestUntilPrepay) : '...'}</span></div>
                                                </div>
                                                <div className="flex justify-between text-[11px] font-bold"><span className="text-slate-500 uppercase tracking-tight">Phí phạt rút trước hạn ({activeScenario.prepayPenalty}%):</span><span className="text-red-500 font-black">{results ? formatCurrency(results.prepayPenaltyAmount) : '...'}</span></div>
                                                <div className="flex justify-between text-[11px] font-bold"><span className="text-slate-500 uppercase tracking-tight">Dư nợ gốc còn lại:</span><span className="text-white font-black">{results ? formatCurrency(results.remainingAtPrepay) : '...'}</span></div>

                                                <div className={`${isExporting ? 'bg-white border-slate-200' : 'bg-black/40 border-white/10 shadow-inner'} flex justify-between items-center p-5 rounded-2xl border mt-4`}>
                                                    <div className="flex flex-col">
                                                        <span className="text-[12px] font-black text-white uppercase tracking-wider">Tổng tiền tất toán:</span>
                                                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">(Gốc còn dư + Phí phạt)</span>
                                                    </div>
                                                    <span className="text-2xl font-black text-gold tracking-tighter">{results ? formatCurrency(results.remainingAtPrepay + results.prepayPenaltyAmount) : '...'}</span>
                                                </div>

                                                <div className="p-4 bg-gradient-to-r from-[#bf953f] to-[#aa771c] rounded-2xl flex justify-between items-center">
                                                    <span className="text-[10px] font-black uppercase text-black">Tổng chi phí dự kiến:</span>
                                                    <span className="text-lg font-black text-black">{results ? formatCurrency(results.paidPrincipalUntilPrepay + results.paidInterestUntilPrepay + results.remainingAtPrepay + results.prepayPenaltyAmount) : '...'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-12 relative z-10">
                                {!isExporting && (
                                    <button
                                        onClick={() => setShowSchedule(!showSchedule)}
                                        className={`w-full py-4 px-8 rounded-2xl border transition-all font-black text-[11px] tracking-[0.3em] uppercase flex items-center justify-center gap-3 ${showSchedule ? 'bg-gold text-black border-gold shadow-lg shadow-[#bf953f]/20' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        <Calendar size={16} /> {showSchedule ? 'Thu gọn lịch trả nợ' : 'Xem lịch trả nợ chi tiết'}
                                    </button>
                                )}

                                {(showSchedule || isExporting) && (
                                    <div className={`mt-8 rounded-[2rem] overflow-hidden border ${isExporting ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5 shadow-2xl'}`}>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse min-w-[600px]">
                                                <thead>
                                                    <tr className={`${isExporting ? 'bg-slate-50 text-slate-400' : 'bg-white/5 text-slate-500'} text-[10px] font-black uppercase tracking-[0.2em]`}>
                                                        <th className="px-8 py-5 border-b border-white/5">Tháng</th>
                                                        <th className="px-8 py-5 border-b border-white/5">Tổng trả</th>
                                                        <th className="px-8 py-5 border-b border-white/5">Tiền gốc</th>
                                                        <th className="px-8 py-5 border-b border-white/5">Tiền lãi</th>
                                                        <th className="px-8 py-5 border-b border-white/5 text-right">Dư nợ còn lại</th>
                                                    </tr>
                                                </thead>
                                                <tbody className={`text-[11px] font-bold ${isExporting ? 'text-slate-700' : 'text-slate-300'}`}>
                                                    {(isExporting ? results?.schedule.slice(0, 12) : results?.schedule)?.map((s, idx) => (
                                                        <tr key={idx} className={`${idx === 0 ? (isExporting ? 'bg-blue-50' : 'bg-gold/10') : ''} ${!isExporting ? 'hover:bg-white/5 border-b border-white/5' : 'border-b border-slate-50'} transition-colors`}>
                                                            <td className={`px-8 py-4 font-black ${isExporting ? 'text-blue-600' : 'text-gold'}`}>Tháng {s.month}</td>
                                                            <td className="px-8 py-4 font-black">{formatCurrency(s.payment)}</td>
                                                            <td className="px-8 py-4 opacity-70">{formatCurrency(s.principal)}</td>
                                                            <td className="px-8 py-4 opacity-70">{formatCurrency(s.interest)}</td>
                                                            <td className="px-8 py-4 text-right font-black">{formatCurrency(s.remaining)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-12 pt-8 border-t border-white/5 flex flex-col items-center space-y-3 opacity-60 relative z-10">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-[1px] bg-gold"></div>
                                    <p className="text-[11px] text-gold font-black uppercase tracking-[0.5em]">Homespro AI Platform</p>
                                    <div className="w-6 h-[1px] bg-gold"></div>
                                </div>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest text-center max-w-md leading-relaxed">
                                    Bản dự thảo mang tính chất tham khảo. Lãi suất và các điều kiện vay thực tế có thể thay đổi tùy theo quy định của ngân hàng tại thời điểm giải ngân.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {isComparing && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsComparing(false)}></div>
                        <div className="bg-black/90 rounded-[3rem] w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-[0_0_50px_rgba(191,149,63,0.15)] relative z-10 flex flex-col border border-white/10 animate-in fade-in zoom-in duration-500">
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <div>
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Bảng <span className="text-gold">So Sánh Elite</span></h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1.5">Deep Financial Analysis & Multi-Scenario Comparison</p>
                                </div>
                                <button onClick={() => setIsComparing(false)} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group">
                                    <Plus size={24} className="rotate-45 text-slate-400 group-hover:text-gold transition-colors" />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-10 no-scrollbar">
                                {scenarios.length > 2 && compareSelection.length < 2 ? (
                                    <div className="text-center py-20">
                                        <p className="text-white font-black text-2xl mb-10 uppercase tracking-tighter">Vui lòng chọn <span className="text-gold">2 kịch bản</span> để phân tích</p>
                                        <div className="flex justify-center flex-wrap gap-8">
                                            {scenarios.map((s, idx) => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => {
                                                        if (compareSelection.includes(idx)) {
                                                            setCompareSelection(compareSelection.filter(id => id !== idx));
                                                        } else if (compareSelection.length < 2) {
                                                            setCompareSelection([...compareSelection, idx]);
                                                        }
                                                    }}
                                                    className={`group relative p-10 rounded-[2.5rem] border-2 transition-all w-56 flex flex-col items-center gap-6 ${compareSelection.includes(idx) ? 'border-gold bg-gold/10 shadow-[0_0_30px_rgba(191,149,63,0.2)] scale-105' : 'border-white/5 bg-white/5 hover:border-gold/30 hover:bg-white/10'}`}
                                                >
                                                    <div className={`w-16 h-16 rounded-[1.4rem] flex items-center justify-center transition-all duration-500 ${compareSelection.includes(idx) ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'bg-black/40 text-slate-500 group-hover:text-gold'}`}>
                                                        <Calculator size={28} strokeWidth={2.5} />
                                                    </div>
                                                    <span className={`text-sm font-black uppercase tracking-widest text-center ${compareSelection.includes(idx) ? 'text-gold' : 'text-slate-400 group-hover:text-white'}`}>{s.name}</span>
                                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${compareSelection.includes(idx) ? 'bg-gold border-gold text-black' : 'border-white/10 text-transparent'}`}>
                                                        <ShieldCheck size={16} strokeWidth={3} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-12">
                                        <div className="pt-28 space-y-6">
                                            {[
                                                'Vốn vay gốc', 'Ngân hàng', 'Thời hạn vay', 'Lãi suất áp dụng', 'Thời gian ân hạn', 'Phương thức',
                                                'Trả tháng đầu', 'Gốc tháng đầu', 'Lãi tháng đầu', '---',
                                                'Tổng lãi dự kiến', 'Tổng gốc + lãi', 'Tháng tất toán', 'Dư nợ còn lại', 'Phí phạt trả trước', '---',
                                                'TỔNG TẤT TOÁN', 'CHI PHÍ THỰC TẾ'
                                            ].map((label, idx) => (
                                                <div key={idx} className={`h-11 flex items-center text-[10px] font-black uppercase tracking-[0.2em] ${label === '---' ? 'h-[1px] bg-white/5' : 'text-slate-500'}`}>
                                                    {label !== '---' && label}
                                                </div>
                                            ))}
                                        </div>
                                        {compareSelection.map(idx => {
                                            const s = scenarios[idx];
                                            const res = calculateGenericLoan(s);
                                            return (
                                                <div key={idx} className="space-y-6">
                                                    <div className="bg-gradient-to-br from-[#bf953f]/20 to-transparent p-8 rounded-[2.5rem] border border-[#bf953f]/30 text-center relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Calculator size={32} /></div>
                                                        <p className="text-[11px] font-black text-gold uppercase mb-2 tracking-[0.2em]">{s.name}</p>
                                                        <p className="text-xl font-black text-white uppercase tracking-tight leading-none">{s.bankName || 'Standard Plan'}</p>
                                                    </div>
                                                    <div className="space-y-6">
                                                        <div className="h-11 flex items-center justify-center text-base font-black text-white">{formatCurrency(s.amount)}</div>
                                                        <div className="h-11 flex items-center justify-center text-[11px] font-black text-gold uppercase text-center tracking-widest">{s.bankName || 'Self Managed'}</div>
                                                        <div className="h-11 flex items-center justify-center text-base font-black text-white">{s.term} Năm</div>
                                                        <div className="h-11 flex items-center justify-center text-lg font-black text-gold">{s.rate}%</div>
                                                        <div className="h-11 flex items-center justify-center text-base font-black text-white opacity-60">{s.gracePeriod} Tháng</div>
                                                        <div className="h-11 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase tracking-widest">{s.method === 'emi' ? 'EMI Cố định' : 'Dư nợ giảm dần'}</div>
                                                        <div className="h-11 flex items-center justify-center text-lg font-black text-gold">{formatCurrency(res.firstMonth)}</div>
                                                        <div className="h-11 flex items-center justify-center text-xs font-bold text-slate-400">{formatCurrency(res.monthlyPrincipal)}</div>
                                                        <div className="h-11 flex items-center justify-center text-xs font-bold text-slate-400">{formatCurrency(res.monthlyInterest)}</div>
                                                        <div className="h-[1px] bg-white/5"></div>
                                                        <div className="h-11 flex items-center justify-center text-lg font-black text-[#fcf6ba]">{formatCurrency(res.totalInterest)}</div>
                                                        <div className="h-11 flex items-center justify-center text-lg font-black text-white">{formatCurrency(res.totalPayment)}</div>
                                                        <div className="h-11 flex items-center justify-center text-sm font-black text-gold border border-gold/20 rounded-xl">Tháng {s.prepayMonth}</div>
                                                        <div className="h-11 flex items-center justify-center text-base font-black text-white">{formatCurrency(res.remainingAtPrepay)}</div>
                                                        <div className="h-11 flex items-center justify-center text-base font-black text-red-500">{formatCurrency(res.prepayPenaltyAmount)}</div>
                                                        <div className="h-[1px] bg-white/5"></div>
                                                        <div className="h-11 flex items-center justify-center text-2xl font-black text-gold tracking-tighter">{formatCurrency(res.remainingAtPrepay + res.prepayPenaltyAmount)}</div>
                                                        <div className="h-11 flex items-center justify-center text-lg font-black text-white/40">{formatCurrency(res.paidPrincipalUntilPrepay + res.paidInterestUntilPrepay + res.remainingAtPrepay + res.prepayPenaltyAmount)}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="p-8 border-t border-white/5 bg-black/40 flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
                                    <span>Homespro Financial Intelligence</span>
                                </div>
                                <div className="flex gap-6">
                                    {scenarios.length > 2 && (
                                        <button onClick={() => setCompareSelection([])} className="text-gold hover:text-white transition-colors underline underline-offset-4 decoration-gold/30">Reset Selection</button>
                                    )}
                                    <button onClick={() => setIsComparing(false)} className="text-white hover:text-gold transition-colors">Close Analytics</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
