import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { Calculator, Download, Copy, RefreshCw, FileSpreadsheet, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import type { LoanScenario, LoanResults } from './loanTypes';
import { formatCurrency, formatNumber, formatNumberToVietnamese } from './loanUtils';
import { calculateGenericLoan } from './loanCalculations';
import LoanInputPanel from './LoanInputPanel';
import LoanResultSummary from './LoanResultSummary';
import LoanSalesKey from './LoanSalesKey';
import LoanCompareModal from './LoanCompareModal';

export default function LoanCalculator() {
    const { profile } = useAuth();
    const resultRef = useRef<HTMLDivElement>(null);

    const [scenarios, setScenarios] = useState<LoanScenario[]>([
        { id: 1, name: 'Kịch bản 1', amount: 2000000000, term: 20, rate: 8.5, gracePeriod: 0, graceInterest: 0, method: 'emi', prepayPenalty: 1, prepayMonth: 60, hasPrepay: true, bankCode: 'VCB', bankName: 'Vietcombank' }
    ]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [isExporting, setIsExporting] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);
    const [includeDetailsInExport, setIncludeDetailsInExport] = useState(true);
    const [resultTab, setResultTab] = useState<'summary' | 'sales'>('summary');
    const [isComparing, setIsComparing] = useState(false);
    const [compareSelection, setCompareSelection] = useState<number[]>([]);

    const activeScenario = scenarios[activeIdx];

    const [results, setResults] = useState<LoanResults | null>(null);

    useEffect(() => {
        setResults(calculateGenericLoan(activeScenario));
    }, [scenarios, activeIdx]);

    const updateScenario = (updates: Partial<LoanScenario>) => {
        const newScenarios = [...scenarios];
        newScenarios[activeIdx] = { ...newScenarios[activeIdx], ...updates };
        setScenarios(newScenarios);
    };

    const addScenario = () => {
        if (scenarios.length >= 3) {
            alert('Tối đa 3 kịch bản so sánh');
            return;
        }
        const newScenario: LoanScenario = {
            id: Date.now(),
            name: `Kịch bản ${scenarios.length + 1}`,
            amount: activeScenario.amount,
            term: activeScenario.term,
            rate: activeScenario.rate,
            gracePeriod: activeScenario.gracePeriod,
            graceInterest: activeScenario.graceInterest,
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
            ['Ân hạn lãi', `${activeScenario.graceInterest || 0} tháng`],
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
        ws['!cols'] = [
            { wch: 10 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 }
        ];

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
                        backgroundColor: null,
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
        const graceInterestText = activeScenario.graceInterest > 0
            ? `\n🌟 ÂN HẠN LÃI: ${activeScenario.graceInterest} tháng (0% lãi)`
            : '';

        let afterGraceText = '';
        if (activeScenario.gracePeriod > 0 && results.schedule.length > activeScenario.gracePeriod) {
            const firstFullPayment = results.schedule[activeScenario.gracePeriod];
            afterGraceText = `\n\n💵 TRẢ THÁNG SAU ÂN HẠN (Tháng ${activeScenario.gracePeriod + 1}): ${formatCurrency(firstFullPayment.payment)}
- Tiền gốc: ${formatCurrency(firstFullPayment.principal)}
- Tiền lãi: ${formatCurrency(firstFullPayment.interest)}`;
        }

        const prepayText = activeScenario.hasPrepay ? `\n\n🛑 DỰ KIẾN TẤT TOÁN (Tháng ${activeScenario.prepayMonth}):
- Gốc đã trả: ${formatCurrency(results.paidPrincipalUntilPrepay)}
- Lãi đã trả: ${formatCurrency(results.paidInterestUntilPrepay)}
- Dư nợ gốc còn lại: ${formatCurrency(results.remainingAtPrepay)}
- Phí phạt (${activeScenario.prepayPenalty}%): ${formatCurrency(results.prepayPenaltyAmount)}

💰 TỔNG TẤT TOÁN: ${formatCurrency(results.remainingAtPrepay + results.prepayPenaltyAmount)}
💎 TỔNG CHI PHÍ DỰ KIẾN: ${formatCurrency(results.paidPrincipalUntilPrepay + results.paidInterestUntilPrepay + results.remainingAtPrepay + results.prepayPenaltyAmount)}` : '';

        const text = `🏠 BÁO GIÁ LÃI VAY${activeScenario.hasPrepay ? ' & TẤT TOÁN' : ''}
🏦 Ngân hàng: ${activeScenario.bankName || 'Hệ thống'}
💰 Khoản vay: ${formatCurrency(activeScenario.amount)} (${formatNumberToVietnamese(activeScenario.amount)})
🗓 Thời hạn: ${activeScenario.term} năm (${activeScenario.term * 12} tháng)${graceText}${graceInterestText}
📊 Phương thức: ${activeScenario.method === 'emi' ? 'Dư nợ cố định (EMI)' : 'Dư nợ giảm dần'}

💵 TRẢ THÁNG ĐẦU: ${formatCurrency(results.firstMonth)}
- Tiền gốc: ${formatCurrency(results.monthlyPrincipal)}
- Tiền lãi: ${formatCurrency(results.monthlyInterest)}${afterGraceText}${prepayText}

----------------------------
👤 Tư vấn: ${profile?.full_name || 'Chotsale Expert'}
📞 Hotline: ${profile?.phone || 'Liên hệ ngay'}
(Dự toán mang tính chất tham khảo)`;
        navigator.clipboard.writeText(text);
        alert('Đã copy nội dung gửi Zalo!');
    };

    return (
        <div className="pb-20 md:pb-0">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] via-[#fcf6ba] to-[#aa771c] rounded-xl flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(191,149,63,0.4)] transform rotate-3 shrink-0">
                        <Calculator className="text-black" size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-white tracking-widest leading-none uppercase italic">LÃI VAY <span className="text-gold">THÔNG MINH</span></h1>
                        <p className="text-[8px] font-black text-slate-400 tracking-[0.4em] uppercase mt-1">Smart Financial Engine</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-xl mr-2">
                        <input
                            type="checkbox"
                            id="exportToggle"
                            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            checked={includeDetailsInExport}
                            onChange={(e) => setIncludeDetailsInExport(e.target.checked)}
                        />
                        <label htmlFor="exportToggle" className="text-[9px] font-black text-slate-400 uppercase tracking-widest cursor-pointer">Kèm 12 tháng đầu</label>
                    </div>
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
                <LoanInputPanel
                    scenarios={scenarios}
                    activeIdx={activeIdx}
                    activeScenario={activeScenario}
                    setActiveIdx={setActiveIdx}
                    addScenario={addScenario}
                    removeScenario={removeScenario}
                    updateScenario={updateScenario}
                />

                <div className="lg:col-span-9 space-y-6">
                    <div ref={resultRef} className={`bg-white relative overflow-hidden flex flex-col transition-all duration-500 ${isExporting ? 'p-6 w-[850px] border-none shadow-none text-slate-900 rounded-[32px] bg-white' : 'p-6 md:p-8 rounded-[32px] shadow-2xl border border-slate-100 h-full'}`}>
                        {/* Premium Export Background */}
                        {isExporting && (
                            <div className="absolute inset-0 z-0 overflow-hidden">
                                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[120px] -mr-64 -mt-64"></div>
                                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-[100px] -ml-48 -mb-48"></div>
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
                            </div>
                        )}

                        <div className="relative z-10 w-full flex flex-col items-center mb-4">
                            <div className="w-full flex flex-col md:flex-row justify-between items-center mb-2 pb-3 border-b border-slate-100 gap-3">
                                <div className="flex items-center gap-2 md:w-1/3 justify-center md:justify-start">
                                    <Building2 className="text-blue-600" size={14} />
                                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest hidden sm:inline">Chotsale Ecosystem</span>
                                </div>

                                <div className="flex flex-col items-center gap-1 md:w-1/3">
                                    <h2 className="text-sm md:text-base font-black text-slate-900 uppercase tracking-tight leading-none text-center">Phương Án Tài Chính</h2>
                                    {activeScenario.bankCode && (
                                        <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-500">
                                            <img
                                                src={`https://api.vietqr.io/img/${activeScenario.bankCode === 'CTG' ? 'ICB' : activeScenario.bankCode}.png`}
                                                className="h-5 w-auto object-contain grayscale opacity-70"
                                                alt="bank"
                                            />
                                            <div className="w-[1px] h-2.5 bg-slate-200"></div>
                                            <p className="text-slate-400 font-bold text-[6px] uppercase tracking-widest whitespace-nowrap">
                                                Ngày lập: {new Date().toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 md:w-1/3 justify-center md:justify-end">
                                    <p className="text-[8px] md:text-[9px] font-black text-slate-900 uppercase text-right">{profile?.full_name || 'Expert'}</p>
                                    <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                                    <p className="text-[7px] md:text-[8px] font-bold text-blue-700 whitespace-nowrap">{profile?.phone || '09xx'}</p>
                                </div>
                            </div>

                            {/* Tab Switcher */}
                            {!isExporting && (
                                <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 mt-4 self-center shadow-inner">
                                    <button
                                        onClick={() => setResultTab('summary')}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${resultTab === 'summary' ? 'bg-white text-blue-600 shadow-md translate-y-[-1px]' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        Báo cáo chi tiết
                                    </button>
                                    <button
                                        onClick={() => setResultTab('sales')}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${resultTab === 'sales' ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-200 translate-y-[-1px]' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        💡 Key Bán hàng (Ưu đãi)
                                    </button>
                                </div>
                            )}

                            {resultTab === 'summary' ? (
                                <LoanResultSummary
                                    activeScenario={activeScenario}
                                    results={results}
                                    chartData={chartData}
                                    isExporting={isExporting}
                                    showSchedule={showSchedule}
                                    setShowSchedule={setShowSchedule}
                                    includeDetailsInExport={includeDetailsInExport}
                                    setIncludeDetailsInExport={setIncludeDetailsInExport}
                                />
                            ) : (
                                <LoanSalesKey
                                    activeScenario={activeScenario}
                                    results={results}
                                />
                            )}
                        </div>

                        <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col items-center space-y-2 opacity-40 relative z-10">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Chotsale AI Platform</p>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest leading-none">Bản dự thảo mang tính chất tham khảo</p>
                        </div>
                    </div>
                </div>
            </div>

            <LoanCompareModal
                scenarios={scenarios}
                isComparing={isComparing}
                setIsComparing={setIsComparing}
                compareSelection={compareSelection}
                setCompareSelection={setCompareSelection}
            />
        </div>
    );
}
