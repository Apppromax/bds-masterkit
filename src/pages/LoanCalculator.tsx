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
            const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
                (Math.pow(1 + monthlyRate, totalMonths) - 1);

            for (let i = 1; i <= totalMonths; i++) {
                const interest = remainingPrincipal * monthlyRate;
                const principalPaid = emi - interest;
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
                    firstMonthTotal = emi;
                    firstMonthPrincipal = principalPaid;
                    firstMonthInterest = interest;
                }

                if (i <= totalMonths) {
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

            return {
                firstMonth: emi,
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

        const text = `🏠 BÁO GIÁ LÃI VAY & TẤT TOÁN
🏦 Ngân hàng: ${activeScenario.bankName || 'Hệ thống'}
💰 Khoản vay: ${formatCurrency(activeScenario.amount)} (${formatNumberToVietnamese(activeScenario.amount)})
🗓 Thời hạn: ${activeScenario.term} năm (${activeScenario.term * 12} tháng)${graceText}
📊 Phương thức: ${activeScenario.method === 'emi' ? 'Dư nợ cố định (EMI)' : 'Dư nợ giảm dần'}

💵 TRẢ THÁNG ĐẦU: ${formatCurrency(results.firstMonth)}
- Tiền gốc: ${formatCurrency(results.monthlyPrincipal)}
- Tiền lãi: ${formatCurrency(results.monthlyInterest)}

🛑 DỰ KIẾN TẤT TOÁN (Tháng ${activeScenario.prepayMonth}):
- Gốc đã trả: ${formatCurrency(results.paidPrincipalUntilPrepay)}
- Lãi đã trả: ${formatCurrency(results.paidInterestUntilPrepay)}
- Dư nợ gốc còn lại: ${formatCurrency(results.remainingAtPrepay)}
- Phí phạt (${activeScenario.prepayPenalty}%): ${formatCurrency(results.prepayPenaltyAmount)}

💰 TỔNG TẤT TOÁN: ${formatCurrency(results.remainingAtPrepay + results.prepayPenaltyAmount)}
💎 TỔNG CHI PHÍ DỰ KIẾN: ${formatCurrency(results.paidPrincipalUntilPrepay + results.paidInterestUntilPrepay + results.remainingAtPrepay + results.prepayPenaltyAmount)}

----------------------------
👤 Tư vấn: ${profile?.full_name || 'Homespro Expert'}
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
                    <button onClick={() => {
                        if (scenarios.length < 2) {
                            alert('Cần ít nhất 2 kịch bản để so sánh');
                            return;
                        }
                        if (scenarios.length === 2) {
                            setCompareSelection([0, 1]);
                            setIsComparing(true);
                        } else {
                            // Show selector modal logic (simplified here as simple alert for now, but will implement UI)
                            setIsComparing(true);
                        }
                    }} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-black text-[10px] transition-all active:scale-95 shadow-lg shadow-amber-100">
                        <RefreshCw size={14} /> SO SÁNH
                    </button>
                    <button onClick={exportToExcel} className="bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-black text-[10px] transition-all active:scale-95 shadow-lg shadow-slate-200">
                        <FileSpreadsheet size={14} /> EXCEL
                    </button>
                    <button onClick={copyToZalo} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-black text-[10px] transition-all active:scale-95 shadow-lg shadow-emerald-200">
                        <Copy size={14} /> ZALO
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
                            <div className="pt-2 flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-2">
                                <div className="space-y-0.5">
                                    <label className="block text-[9px] font-black text-slate-500 uppercase">Tất toán trước hạn</label>
                                    <p className="text-[7px] text-slate-400 font-bold italic lowercase">tính phí phạt và số dư nợ khi trả trước</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={activeScenario.hasPrepay} onChange={(e) => updateScenario({ hasPrepay: e.target.checked })} />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {activeScenario.hasPrepay && (
                        <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
                            <div>
                                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Tháng tất toán</label>
                                <input type="number" placeholder="0" className="w-full p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-sm text-blue-600" value={activeScenario.prepayMonth || ''} onChange={(e) => updateScenario({ prepayMonth: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                            </div>
                            <div>
                                <label className="block text-[9px] font-black text-slate-500 uppercase mb-1">Phí phạt %</label>
                                <input type="number" step="0.1" placeholder="0" className="w-full p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-sm text-red-600" value={activeScenario.prepayPenalty === 0 ? '' : activeScenario.prepayPenalty} onChange={(e) => updateScenario({ prepayPenalty: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                            </div>
                        </div>
                    )}
                    <div className="pt-2">
                        <label className="block text-[9px] font-black text-slate-500 uppercase mb-1.5 flex justify-between">
                            <span>Chọn Ngân hàng</span>
                            {activeScenario.bankName && <span className="text-blue-600 lowercase font-bold">{activeScenario.bankName}</span>}
                        </label>
                        <div className="relative">
                            <button
                                onClick={() => setIsBankSelectorOpen(!isBankSelectorOpen)}
                                className="w-full p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between hover:border-blue-500 transition-all font-bold text-[11px]"
                            >
                                <div className="flex items-center gap-2">
                                    {activeScenario.bankCode ? (
                                        <img src={`https://api.vietqr.io/img/${activeScenario.bankCode === 'CTG' ? 'ICB' : activeScenario.bankCode}.png`} className="w-6 h-4 object-contain" alt="logo" />
                                    ) : (
                                        <Building2 size={14} className="text-slate-400" />
                                    )}
                                    <span className={activeScenario.bankName ? 'text-slate-900' : 'text-slate-400'}>
                                        {activeScenario.bankName || 'Chọn ngân hàng...'}
                                    </span>
                                </div>
                                <ArrowDownCircle size={12} className={`text-slate-400 transition-transform ${isBankSelectorOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isBankSelectorOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in duration-200">
                                    <div className="p-2 border-b border-slate-50">
                                        <input
                                            type="text"
                                            placeholder="Tìm tên ngân hàng..."
                                            className="w-full p-2 rounded-lg bg-slate-50 text-[10px] outline-none placeholder:text-slate-400"
                                            value={bankSearch}
                                            onChange={(e) => setBankSearch(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="max-h-[200px] overflow-y-auto no-scrollbar">
                                        {BANK_LIST.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()) || b.code.toLowerCase().includes(bankSearch.toLowerCase())).map(bank => (
                                            <button
                                                key={bank.code}
                                                onClick={() => {
                                                    updateScenario({ bankCode: bank.code, bankName: bank.name });
                                                    setIsBankSelectorOpen(false);
                                                    setBankSearch('');
                                                }}
                                                className="w-full p-3 flex items-center gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                            >
                                                <img src={bank.logo} className="w-8 h-6 object-contain" alt={bank.code} />
                                                <div className="text-left">
                                                    <p className="text-[10px] font-black text-slate-900 leading-none mb-1">{bank.code}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 leading-none">{bank.name}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
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

                <div className="lg:col-span-9 space-y-6">
                    <div ref={resultRef} className={`bg-white relative overflow-hidden flex flex-col transition-all duration-500 ${isExporting ? 'p-16 w-[1000px] border-none shadow-none text-slate-900 rounded-none' : 'p-6 md:p-8 rounded-[32px] shadow-2xl border border-slate-100 h-full'}`}>
                        {/* Premium Export Background */}
                        {isExporting && (
                            <div className="absolute inset-0 z-0 overflow-hidden">
                                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] -mr-64 -mt-64"></div>
                                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-[100px] -ml-48 -mb-48"></div>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                            </div>
                        )}

                        <div className="relative z-10 w-full flex flex-col items-center mb-6">
                            <div className="w-full flex justify-between items-center mb-4 pb-3 border-b border-slate-100 gap-4">
                                <div className="flex items-center gap-2">
                                    <Building2 className="text-blue-600" size={14} />
                                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Homespro Ecosystem</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-[9px] font-black text-slate-900 uppercase">{profile?.full_name || 'Expert'}</p>
                                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                    <p className="text-[8px] font-bold text-blue-700">{profile?.phone || '09xx'}</p>
                                </div>
                            </div>


                            <div className="flex flex-col items-center gap-1.5 translate-y-[-4px]">
                                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">Phương Án Tài Chính</h2>
                                {activeScenario.bankCode && (
                                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-700">
                                        <img
                                            src={`https://api.vietqr.io/img/${activeScenario.bankCode === 'CTG' ? 'ICB' : activeScenario.bankCode}.png`}
                                            className="h-5 w-auto object-contain grayscale opacity-70"
                                            alt="bank"
                                        />
                                        <div className="w-[1px] h-3 bg-slate-200"></div>
                                        <p className="text-slate-400 font-bold text-[7px] uppercase tracking-widest">
                                            Ngày lập: {new Date().toLocaleDateString('vi-VN')}
                                        </p>
                                    </div>
                                )}
                            </div>


                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                <div className="md:col-span-1 p-5 rounded-[28px] bg-slate-900 text-white shadow-xl flex flex-col justify-center relative overflow-hidden">
                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-80">Số vốn vay</p>
                                    <p className="text-xl font-black tracking-tighter leading-none">{formatCurrency(activeScenario.amount)}</p>
                                    <div className="absolute top-0 right-0 p-2 opacity-10"><DollarSign size={28} /></div>
                                </div>
                                <div className="p-5 rounded-[28px] bg-white border border-slate-100 flex flex-col justify-center text-center shadow-sm">
                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Thời hạn</p>
                                    <p className="text-lg font-black text-slate-800 tracking-tighter leading-none">{activeScenario.term} Năm</p>
                                    <p className="text-[6px] font-bold text-slate-400 mt-1">({activeScenario.term * 12} Tháng)</p>
                                </div>
                                <div className="p-5 rounded-[28px] bg-white border border-slate-100 flex flex-col justify-center text-center shadow-sm">
                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">Lãi suất</p>
                                    <p className="text-lg font-black text-slate-800 tracking-tighter leading-none">{activeScenario.rate}%</p>
                                    <p className="text-[6px] font-bold text-slate-400 mt-1">Năm</p>
                                </div>
                                <div className={`p-5 rounded-[28px] border flex flex-col justify-center text-center shadow-sm transition-all duration-500 ${activeScenario.gracePeriod > 0 ? 'bg-indigo-50/50 border-indigo-200 scale-[1.02]' : 'bg-white border-slate-100'}`}>
                                    <p className={`text-[7px] font-black uppercase tracking-widest mb-1 leading-none ${activeScenario.gracePeriod > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>Ân hạn nợ</p>
                                    <p className={`text-lg font-black tracking-tighter leading-none ${activeScenario.gracePeriod > 0 ? 'text-indigo-700' : 'text-slate-800'}`}>{activeScenario.gracePeriod} Tháng</p>
                                    <p className={`text-[6px] font-bold mt-1 ${activeScenario.gracePeriod > 0 ? 'text-indigo-400' : 'text-slate-400'}`}>Gốc</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
                                <div className="p-5 rounded-[28px] bg-blue-600 text-white shadow-lg flex flex-col justify-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-10"><Zap size={24} /></div>
                                    <p className="text-[7px] font-black uppercase opacity-60 mb-2 tracking-widest leading-none">Trả tháng đầu</p>
                                    <p className="text-2xl font-black tracking-tighter leading-none">{results ? formatCurrency(results.firstMonth) : '...'}</p>
                                </div>
                                <div className="p-5 rounded-[28px] bg-slate-50 border border-slate-100 flex flex-col justify-center shadow-sm">
                                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1.5 leading-none">Tổng lãi dự kiến</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tighter leading-none">{results ? formatCurrency(results.totalInterest) : '...'}</p>
                                </div>
                                <div className="p-5 rounded-[28px] bg-slate-50 border border-slate-100 flex flex-col justify-center shadow-sm">
                                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest mb-1.5 leading-none">Tổng gốc + lãi</p>
                                    <p className="text-xl font-black text-slate-900 tracking-tighter leading-none">{results ? formatCurrency(results.totalPayment) : '...'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
                                <div className={`${activeScenario.hasPrepay ? 'md:col-span-5' : 'md:col-span-12'} flex flex-col space-y-6`}>
                                    <div className={`grid grid-cols-1 ${activeScenario.hasPrepay ? 'md:grid-cols-1' : 'md:grid-cols-2'} gap-6`}>
                                        <div className="flex flex-col space-y-4">
                                            <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-900 uppercase tracking-widest">
                                                <div className="w-8 h-[2px] bg-blue-600 rounded-full"></div> Biểu đồ phân bổ
                                            </h4>
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
                                                            label={({ cx, cy, midAngle = 0, innerRadius = 0, outerRadius = 0, percent }) => {
                                                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                                                const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                                                const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                                                return (percent && percent > 0.1) ? (
                                                                    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-black">
                                                                        {`${(percent * 100).toFixed(0)}%`}
                                                                    </text>
                                                                ) : null;
                                                            }}
                                                            labelLine={false}
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
                                        <div className="flex flex-col space-y-4">
                                            <h4 className="flex items-center gap-2 text-[11px] font-black text-slate-900 uppercase tracking-widest">
                                                <div className="w-8 h-[2px] bg-emerald-500 rounded-full"></div> Cơ cấu Trả nợ theo năm
                                            </h4>
                                            <div className="h-[220px] bg-slate-50/50 rounded-3xl border border-slate-50 p-6">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart
                                                        data={results?.schedule?.filter((_, i) => (i + 1) % 12 === 0 || i === 0).map((s) => ({
                                                            year: s.month === 1 ? 'M1' : `Năm ${Math.ceil(s.month / 12)}`,
                                                            principal: s.principal,
                                                            interest: s.interest,
                                                            total: s.payment
                                                        })).filter((_, i, arr) => i === 0 || (i + 1) % 5 === 0 || i === arr.length - 1) || []}
                                                        margin={{ top: 30, right: 10, left: -20, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} />
                                                        <YAxis hide />
                                                        <Tooltip
                                                            formatter={(value: any) => formatCurrency(Number(value))}
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                                                        />
                                                        <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: '900', paddingTop: '10px' }} />
                                                        <Bar dataKey="principal" name="Gốc" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} barSize={28} />
                                                        <Bar dataKey="interest" name="Lãi" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={28}>
                                                            <LabelList
                                                                dataKey="total"
                                                                position="top"
                                                                content={(props: any) => {
                                                                    const { x, y, width, value } = props;
                                                                    return (
                                                                        <text x={x + width / 2} y={y - 12} fill="#94a3b8" textAnchor="middle" fontSize={7} fontWeight={900}>
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

                                            <div className="mt-4 p-4 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm space-y-2.5 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl"></div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <ShieldCheck size={14} className="text-slate-900" />
                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.1em]">Chi tiết phí phạt & Dư nợ</span>
                                                </div>
                                                <div className="space-y-1 pb-2 border-b border-slate-200">
                                                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tight"><span>Gốc đã trả:</span><span className="text-slate-700">{results ? formatCurrency(results.paidPrincipalUntilPrepay) : '...'}</span></div>
                                                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tight"><span>Lãi đã trả:</span><span className="text-slate-700">{results ? formatCurrency(results.paidInterestUntilPrepay) : '...'}</span></div>
                                                    <div className="flex justify-between text-[9px] font-black text-slate-900 pt-1 uppercase tracking-tight"><span>Tổng đã trả (G+L):</span><span>{results ? formatCurrency(results.paidPrincipalUntilPrepay + results.paidInterestUntilPrepay) : '...'}</span></div>
                                                </div>
                                                <div className="flex justify-between text-[10px] font-bold"><span className="text-slate-400 uppercase tracking-tight">Hệ số phạt (%):</span><span className="text-slate-900 font-black">{activeScenario.prepayPenalty}%</span></div>
                                                <div className="flex justify-between text-[10px] font-bold"><span className="text-slate-400 uppercase tracking-tight">Dư nợ gốc còn lại:</span><span className="text-slate-900 font-black">{results ? formatCurrency(results.remainingAtPrepay) : '...'}</span></div>
                                                <div className="flex justify-between text-[10px] font-bold border-t border-dashed border-slate-200 pt-2"><span className="text-blue-600 uppercase tracking-tight">Tiền phạt dự kiến:</span><span className="text-blue-700 font-black">{results ? formatCurrency(results.prepayPenaltyAmount) : '...'}</span></div>

                                                <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm mt-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">TỔNG TẤT TOÁN:</span>
                                                        <span className="text-[7px] text-slate-400 font-bold uppercase">(Gốc còn lại + Phạt)</span>
                                                    </div>
                                                    <span className="text-lg font-black text-slate-900 tracking-tighter">{results ? formatCurrency(results.remainingAtPrepay + results.prepayPenaltyAmount) : '...'}</span>
                                                </div>

                                                <div className="p-3 bg-slate-900 rounded-2xl flex justify-between items-center text-white">
                                                    <span className="text-[9px] font-black uppercase">Toàn bộ chi phí:</span>
                                                    <span className="text-sm font-black text-blue-400">{results ? formatCurrency(results.paidPrincipalUntilPrepay + results.paidInterestUntilPrepay + results.remainingAtPrepay + results.prepayPenaltyAmount) : '...'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {!activeScenario.hasPrepay && (
                                    <div className="hidden md:flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200 text-center space-y-3 h-full min-h-[400px] opacity-60">
                                        <div className="p-4 bg-white rounded-full shadow-sm text-slate-300">
                                            <Calendar size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Analytics Nâng Cao</h4>
                                            <p className="text-[10px] text-slate-400 font-bold max-w-[200px] leading-relaxed italic">
                                                Bật "Tất toán trước hạn" để xem báo cáo phí phạt và dư nợ khi trả nợ trước thời hạn.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

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
                                                {(isExporting ? results?.schedule.slice(0, 12) : results?.schedule)?.map((s, idx) => (
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

                {isComparing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsComparing(false)}></div>
                        <div className="bg-white rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl relative z-10 flex flex-col border border-white/20 animate-in fade-in zoom-in duration-300">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">So Sánh Kịch Bản</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Phân tích chi tiết phương án tài chính</p>
                                </div>
                                <button onClick={() => setIsComparing(false)} className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 transition-colors">
                                    <Plus size={20} className="rotate-45 text-slate-400" />
                                </button>
                            </div>

                            <div className="flex-grow overflow-y-auto p-8 no-scrollbar">
                                {scenarios.length > 2 && compareSelection.length < 2 ? (
                                    <div className="text-center py-12">
                                        <p className="text-slate-900 font-black text-lg mb-6 uppercase tracking-tight">Chọn 2 kịch bản để so sánh</p>
                                        <div className="flex justify-center gap-6">
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
                                                    className={`group p-8 rounded-[32px] border-2 transition-all w-48 flex flex-col items-center gap-4 ${compareSelection.includes(idx) ? 'border-blue-600 bg-blue-50 shadow-xl shadow-blue-100 scale-105' : 'border-slate-100 hover:border-blue-200'}`}
                                                >
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${compareSelection.includes(idx) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                                        <Calculator size={20} />
                                                    </div>
                                                    <span className={`text-sm font-black uppercase text-center ${compareSelection.includes(idx) ? 'text-blue-600' : 'text-slate-400'}`}>{s.name}</span>
                                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${compareSelection.includes(idx) ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 text-transparent'}`}>
                                                        <ShieldCheck size={12} strokeWidth={3} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-3 gap-8">
                                        <div className="pt-24 space-y-6">
                                            {['Vốn vay gốc', 'Ngân hàng', 'Thời hạn (năm)', 'Lãi suất (%/năm)', 'Phương thức', 'Trả tháng đầu', 'Gốc tháng đầu', 'Lãi tháng đầu', '---', 'Tổng lãi phải trả', 'Tổng lãi + gốc', 'Tất toán tại tháng', 'Dư nợ khi tất toán', 'Phí phạt trả trước', '---', 'TỔNG TẤT TOÁN', 'TỔNG CHI PHÍ DỰ KIẾN'].map((label, idx) => (
                                                <div key={idx} className={`h-10 flex items-center text-[10px] font-black uppercase tracking-widest ${label === '---' ? 'h-px bg-slate-100' : 'text-slate-400'}`}>
                                                    {label !== '---' && label}
                                                </div>
                                            ))}
                                        </div>
                                        {compareSelection.map(idx => {
                                            const s = scenarios[idx];
                                            const res = calculateGenericLoan(s);
                                            return (
                                                <div key={idx} className="space-y-6">
                                                    <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 text-center relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 p-3 opacity-10"><Calculator size={20} /></div>
                                                        <p className="text-[10px] font-black text-blue-600 uppercase mb-1">{s.name}</p>
                                                        <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{s.bankName || 'Hệ thống'}</p>
                                                    </div>
                                                    <div className="space-y-6">
                                                        <div className="h-10 flex items-center justify-center text-sm font-black text-slate-900">{formatCurrency(s.amount)}</div>
                                                        <div className="h-10 flex items-center justify-center text-sm font-black text-slate-900 text-center">{s.bankName || 'Hệ thống'}</div>
                                                        <div className="h-10 flex items-center justify-center text-sm font-black text-slate-900">{s.term} Năm</div>
                                                        <div className="h-10 flex items-center justify-center text-sm font-black text-amber-600">{s.rate}%</div>
                                                        <div className="h-10 flex items-center justify-center text-[9px] font-black text-slate-500 uppercase">{s.method === 'emi' ? 'EMI' : 'Giảm dần'}</div>
                                                        <div className="h-10 flex items-center justify-center text-sm font-black text-blue-600">{formatCurrency(res.firstMonth)}</div>
                                                        <div className="h-10 flex items-center justify-center text-xs font-bold text-slate-500">{formatCurrency(res.monthlyPrincipal)}</div>
                                                        <div className="h-10 flex items-center justify-center text-xs font-bold text-slate-500">{formatCurrency(res.monthlyInterest)}</div>
                                                        <div className="h-px bg-slate-100"></div>
                                                        <div className="h-10 flex items-center justify-center text-sm font-black text-amber-700">{formatCurrency(res.totalInterest)}</div>
                                                        <div className="h-10 flex items-center justify-center text-sm font-black text-slate-900">{formatCurrency(res.totalPayment)}</div>
                                                        <div className="h-10 flex items-center justify-center text-sm font-black text-blue-600">Tháng {s.prepayMonth}</div>
                                                        <div className="h-10 flex items-center justify-center text-sm font-black text-slate-900">{formatCurrency(res.remainingAtPrepay)}</div>
                                                        <div className="h-10 flex items-center justify-center text-sm font-black text-red-600">{formatCurrency(res.prepayPenaltyAmount)}</div>
                                                        <div className="h-px bg-slate-100"></div>
                                                        <div className="h-10 flex items-center justify-center text-lg font-black text-red-600">{formatCurrency(res.remainingAtPrepay + res.prepayPenaltyAmount)}</div>
                                                        <div className="h-10 flex items-center justify-center text-base font-black text-emerald-600">{formatCurrency(res.paidPrincipalUntilPrepay + res.paidInterestUntilPrepay + res.remainingAtPrepay + res.prepayPenaltyAmount)}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Homespro Financial Analytics</span>
                                <div className="flex gap-4">
                                    {scenarios.length > 2 && (
                                        <button onClick={() => setCompareSelection([])} className="text-blue-600 hover:text-blue-700">Chọn lại kịch bản</button>
                                    )}
                                    <button onClick={() => setIsComparing(false)} className="text-slate-900 hover:text-black">Đóng bảng so sánh</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
