import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Calculator, Download, DollarSign, Calendar, Percent, Copy, Share2, Info, ArrowDownCircle, ShieldCheck, User, Phone, Building2, Settings, RefreshCw, Crown, Zap, Sparkles as SparklesIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { generateContentWithAI } from '../services/aiService';

type CalcMethod = 'emi' | 'diminishing';

export default function LoanCalculator() {
    const { profile } = useAuth();
    const resultRef = useRef<HTMLDivElement>(null);

    const [amount, setAmount] = useState(2000000000); // 2 tỷ
    const [term, setTerm] = useState(20); // 20 năm
    const [rate, setRate] = useState(8.5); // 8.5%
    const [gracePeriod, setGracePeriod] = useState(0); // Ân hạn gốc (tháng)
    const [method, setMethod] = useState<CalcMethod>('emi');

    const [results, setResults] = useState<{
        firstMonth: number;
        totalPayment: number;
        totalInterest: number;
        monthlyPrincipal: number;
        monthlyInterest: number;
        schedule: any[];
    } | null>(null);

    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiGuruInsight, setAiGuruInsight] = useState<string | null>(null);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    const calculateLoan = () => {
        const principal = amount;
        const annualRate = rate / 100;
        const monthlyRate = annualRate / 12;
        const totalMonths = term * 12;

        let totalInterestPaid = 0;
        let schedule = [];
        let firstMonthTotal = 0;
        let firstMonthPrincipal = 0;
        let firstMonthInterest = 0;

        let remainingPrincipal = principal;

        if (method === 'emi') {
            const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
                (Math.pow(1 + monthlyRate, totalMonths) - 1);

            for (let i = 1; i <= totalMonths; i++) {
                const interest = remainingPrincipal * monthlyRate;
                const principalPaid = emi - interest;
                remainingPrincipal -= principalPaid;

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
                schedule: schedule
            });
        }
    };

    const handleAiGuru = async () => {
        if (!results) return;
        if (profile?.tier !== 'pro' && profile?.role !== 'admin') {
            alert('Tính năng AI Guru Tài Chính chỉ dành cho tài khoản PRO!');
            return;
        }

        setIsAiLoading(true);
        const prompt = `Bạn là một chuyên gia phân tích tài chính bất động sản cao cấp. 
Thông số khoản vay:
- Số tiền: ${formatCurrency(amount)}
- Thời hạn: ${term} năm
- Lãi suất: ${rate}%/năm
- Ân hạn gốc: ${gracePeriod} tháng
- Phương thức: ${method === 'emi' ? 'Dư nợ cố định (EMI)' : 'Dư nợ giảm dần'}

Hãy đưa ra phân tích chuyên sâu cho khách hàng bao gồm:
1. Đánh giá áp lực tài chính hàng tháng so với thu nhập.
2. Lời khuyên về việc nên chọn trả theo dư nợ cố định hay giảm dần.
3. Chiến lược trả nợ trước hạn để tiết kiệm tiền lãi.
4. Câu chốt hành động tự tin.`;

        try {
            const insight = await generateContentWithAI(prompt);
            setAiGuruInsight(insight);
        } catch (err) {
            alert('Lỗi AI.');
        } finally {
            setIsAiLoading(false);
        }
    };

    useEffect(() => {
        calculateLoan();
    }, [amount, term, rate, gracePeriod, method]);

    const handleExport = async () => {
        if (resultRef.current) {
            try {
                const canvas = await html2canvas(resultRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
                const link = document.createElement('a');
                link.download = `Bao-gia-lai-vay-${new Date().getTime()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) { console.error(error); }
        }
    };

    const copyToZalo = () => {
        if (!results) return;
        const text = `🏠 BẢNG TÍNH LÃI VAY MUA NHÀ
💰 Số tiền vay: ${formatCurrency(amount)}
🗓 Thời gian: ${term} năm
💵 TRẢ THÁNG ĐẦU: ${formatCurrency(results.firstMonth)}
- Gốc: ${formatCurrency(results.monthlyPrincipal)}
- Lãi: ${formatCurrency(results.monthlyInterest)}
📞 Liên hệ: ${profile?.full_name || 'Expert'}`;
        navigator.clipboard.writeText(text);
        alert('Copied!');
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
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Settings className="w-4 h-4" /> Khoản vay</h3>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Số tiền (VND)</label>
                            <input type="number" className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-blue-600 outline-none" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Năm</label>
                                <input type="number" className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black" value={term} onChange={(e) => setTerm(Number(e.target.value))} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Lãi %</label>
                                <input type="number" step="0.1" className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-amber-600" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Ân hạn (tháng)</label>
                            <input type="number" className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-green-600" value={gracePeriod} onChange={(e) => setGracePeriod(Number(e.target.value))} />
                        </div>
                        <div className="pt-2 space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Phương thức</label>
                            <button onClick={() => setMethod('emi')} className={`w-full p-4 rounded-2xl text-left border-2 transition-all ${method === 'emi' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800'}`}>
                                <p className="text-xs font-black">Dư nợ cố định (EMI)</p>
                            </button>
                            <button onClick={() => setMethod('diminishing')} className={`w-full p-4 rounded-2xl text-left border-2 transition-all ${method === 'diminishing' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800'}`}>
                                <div className="flex justify-between items-center"><p className="text-xs font-black">Dư nợ giảm dần</p><Crown size={12} className="text-amber-500" /></div>
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-900 p-6 rounded-[32px] border border-indigo-500/30 shadow-2xl space-y-4">
                        <div className="flex items-center gap-2"><Zap className="text-yellow-400 fill-yellow-400" size={20} /><h3 className="text-white font-black text-xs uppercase tracking-widest">AI Guru</h3></div>
                        <button onClick={handleAiGuru} disabled={isAiLoading} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-2 uppercase">
                            {isAiLoading ? <Loader2 className="animate-spin" size={14} /> : <SparklesIcon size={14} />} Tham vấn AI
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div ref={resultRef} className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 relative overflow-hidden min-h-[700px]">
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start mb-12 gap-8 pb-8 border-b-2 border-slate-100">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg"><ShieldCheck className="text-white" size={20} /></div>
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Finance AI</span>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 uppercase">Dự toán tài chính</h2>
                                <p className="text-slate-400 font-bold text-[10px] mt-2 italic capitalize">{new Date().toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-white">
                                <img src={`https://ui-avatars.com/api/?name=${profile?.full_name || 'E'}&background=0066FF&color=fff&bold=true`} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt="avatar" />
                                <div><p className="text-xs font-black text-slate-900 uppercase">{profile?.full_name || 'Expert'}</p><p className="text-[9px] font-bold text-slate-500 uppercase">{profile?.agency || 'BDS Pro'}</p></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="p-8 rounded-[32px] bg-blue-600 text-white shadow-xl relative overflow-hidden">
                                <p className="text-[10px] font-black uppercase opacity-60 mb-2">Trả tháng đầu</p>
                                <p className="text-3xl font-black">{results ? formatCurrency(results.firstMonth) : '...'}</p>
                                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-[10px] opacity-80">
                                    <span>Gốc: {results ? formatCurrency(results.monthlyPrincipal) : '...'}</span>
                                    <span>Lãi: {results ? formatCurrency(results.monthlyInterest) : '...'}</span>
                                </div>
                            </div>
                            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tổng lãi</p>
                                <p className="text-2xl font-black text-amber-600">{results ? formatCurrency(results.totalInterest) : '...'}</p>
                            </div>
                            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tổng cả gốc</p>
                                <p className="text-2xl font-black text-slate-900">{results ? formatCurrency(results.totalPayment) : '...'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-900 border-l-4 border-blue-600 pl-3 uppercase tracking-widest mb-6">Chi tiết khoản vay</h4>
                                <div className="flex justify-between py-3 border-b border-slate-50 text-sm font-bold"><span className="text-slate-400">Gốc vay:</span><span className="text-slate-900">{formatCurrency(amount)}</span></div>
                                <div className="flex justify-between py-3 border-b border-slate-50 text-sm font-bold"><span className="text-slate-400">Thời gian:</span><span className="text-slate-900">{term} Năm</span></div>
                                <div className="flex justify-between py-3 border-b border-slate-50 text-sm font-bold"><span className="text-slate-400">Lãi suất:</span><span className="text-slate-900">{rate}/năm</span></div>
                                <div className="flex justify-between py-3 border-b border-slate-50 text-sm font-bold"><span className="text-slate-400">Phương thức:</span><span className="text-blue-600 uppercase">{method === 'emi' ? 'Dư nợ cố định' : 'Dư nợ giảm dần'}</span></div>
                            </div>

                            <div className="bg-slate-950 p-8 rounded-[32px] text-white shadow-2xl">
                                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 border-b border-white/10 pb-4">📊 Lịch trả 12 tháng đầu</h4>
                                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                    {results?.schedule.map((s, idx) => (
                                        <div key={idx} className={`p-4 rounded-2xl border ${idx === 0 ? 'bg-blue-600 border-blue-400' : 'bg-white/5 border-white/5'}`}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[9px] font-black opacity-60">THÁNG {s.month}</span>
                                                <span className="text-xs font-black">{formatCurrency(s.payment)}</span>
                                            </div>
                                            <div className="flex justify-between text-[9px] opacity-40"><span>Gốc: {formatCurrency(s.principal)}</span><span>Lãi: {formatCurrency(s.interest)}</span></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {aiGuruInsight && (
                            <div className="mb-12 p-8 rounded-[32px] bg-indigo-50 dark:bg-slate-800/50 border-2 border-indigo-100 dark:border-indigo-900/50">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-indigo-600 shadow-sm"><Zap size={20} fill="currentColor" /></div>
                                    <h3 className="text-lg font-black uppercase text-indigo-900 dark:text-indigo-100">AI Guru Insights</h3>
                                </div>
                                <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium text-slate-700 dark:text-slate-300">{aiGuruInsight}</div>
                            </div>
                        )}
                        <p className="text-[9px] text-slate-300 font-bold italic text-center mt-12">* Minh họa mang tính tham khảo. Thông tin chính xác theo ngân hàng tại thời điểm vay.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
