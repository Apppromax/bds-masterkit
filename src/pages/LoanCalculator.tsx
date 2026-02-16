import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Calculator, Download, DollarSign, Calendar, Percent, Copy, Share2, Info, ArrowDownCircle, ShieldCheck, User, Phone, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    const calculateLoan = () => {
        const principal = amount;
        const annualRate = rate / 100;
        const monthlyRate = annualRate / 12;
        const totalMonths = term * 12;

        let totalInterest = 0;
        let schedule = [];
        let firstMonthTotal = 0;
        let monthlyPrincipal = 0;
        let monthlyInterest = 0;

        if (method === 'emi') {
            // Dư nợ cố định (EMI)
            const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
                (Math.pow(1 + monthlyRate, totalMonths) - 1);

            const totalPayment = emi * totalMonths;
            totalInterest = totalPayment - principal;
            firstMonthTotal = emi;
            monthlyPrincipal = principal / totalMonths; // thô
            monthlyInterest = principal * monthlyRate;

            // Simple schedule for visualization
            schedule = [{ month: 1, payment: emi, principal: emi - (principal * monthlyRate), interest: principal * monthlyRate, remaining: principal - (emi - (principal * monthlyRate)) }];
        } else {
            // Dư nợ giảm dần (Fixed Principal)
            // Trong thời gian ân hạn, chỉ trả lãi
            const monthsToPayPrincipal = totalMonths - gracePeriod;
            const fixedPrincipal = principal / monthsToPayPrincipal;

            let remainingPrincipal = principal;
            for (let i = 1; i <= totalMonths; i++) {
                const interest = remainingPrincipal * monthlyRate;
                let principalPaid = 0;

                if (i > gracePeriod) {
                    principalPaid = fixedPrincipal;
                }

                const total = interest + principalPaid;
                if (i === 1) {
                    firstMonthTotal = total;
                    monthlyPrincipal = principalPaid;
                    monthlyInterest = interest;
                }

                totalInterest += interest;
                remainingPrincipal -= principalPaid;

                if (i <= 12) {
                    schedule.push({ month: i, payment: total, principal: principalPaid, interest: interest, remaining: Math.max(0, remainingPrincipal) });
                }
            }
        }

        setResults({
            firstMonth: firstMonthTotal,
            totalPayment: principal + totalInterest,
            totalInterest: totalInterest,
            monthlyPrincipal: monthlyPrincipal,
            monthlyInterest: monthlyInterest,
            schedule: schedule
        });
    };

    useEffect(() => {
        calculateLoan();
    }, [amount, term, rate, gracePeriod, method]);

    const handleExport = async () => {
        if (resultRef.current) {
            try {
                const canvas = await html2canvas(resultRef.current, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    useCORS: true
                });
                const link = document.createElement('a');
                link.download = `Bao-gia-lai-vay-MasterKit-${new Date().getTime()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error('Export error:', error);
            }
        }
    };

    const copyToZalo = () => {
        if (!results) return;
        const text = `🏠 BẢNG TÍNH LÃI VAY MUA NHÀ
---------------------------
💰 Số tiền vay: ${formatCurrency(amount)}
🗓 Thời gian: ${term} năm (${gracePeriod > 0 ? `Ân hạn gốc ${gracePeriod} tháng` : 'Không ân hạn'})
📈 Lãi suất: ${rate}%/năm
🏗 Phương thức: ${method === 'emi' ? 'Dư nợ cố định (EMI)' : 'Dư nợ giảm dần'}

💵 TRẢ THÁNG ĐẦU: ${formatCurrency(results.firstMonth)}
- Tiền gốc: ${formatCurrency(results.monthlyPrincipal)}
- Tiền lãi: ${formatCurrency(results.monthlyInterest)}

💳 TỔNG LÃI PHẢI TRẢ: ${formatCurrency(results.totalInterest)}
💳 TỔNG GỐC + LÃI: ${formatCurrency(results.totalPayment)}

📞 Liên hệ tư vấn: ${profile?.full_name || 'Expert'} - ${profile?.phone || ''}
🏢 Đơn vị: ${profile?.agency || 'BĐS MasterKit'}`;

        navigator.clipboard.writeText(text);
        alert('Đã sao chép nội dung báo giá cho Zalo!');
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
                    <p className="text-slate-500 text-sm font-medium mt-1">Lập bảng phương án tài chính chuyên nghiệp gửi khách hàng</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={copyToZalo}
                        className="bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-2xl flex items-center gap-2 font-black text-xs shadow-lg shadow-green-500/20 transition-all active:scale-95"
                    >
                        <Copy size={16} /> COPY TIN ZALO
                    </button>
                    <button
                        onClick={handleExport}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl flex items-center gap-2 font-black text-xs shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                    >
                        <Download size={16} /> XUẤT ẢNH BÁO GIÁ
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Input Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Settings className="w-4 h-4" /> Cấu hình khoản vay
                        </h3>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Số tiền vay (VND)</label>
                            <input
                                type="number"
                                className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-blue-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                            />
                            <div className="mt-3 flex gap-1">
                                {[1000000000, 2000000000, 5000000000].map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setAmount(v)}
                                        className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                    >
                                        {(v / 1000000000).toFixed(0)} Tỷ
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Thời hạn (năm)</label>
                                <input
                                    type="number"
                                    className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-slate-700 dark:text-white focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    value={term}
                                    onChange={(e) => setTerm(Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Lãi suất (%)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-amber-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    value={rate}
                                    onChange={(e) => setRate(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 ml-1">Ân hạn gốc (tháng)</label>
                            <input
                                type="number"
                                className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-green-600 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                value={gracePeriod}
                                onChange={(e) => setGracePeriod(Number(e.target.value))}
                            />
                            <p className="text-[9px] text-slate-400 mt-2 italic">* Chỉ trả lãi, không trả gốc trong thời gian này</p>
                        </div>

                        <div className="pt-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-3 ml-1">Phương thức trả</label>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setMethod('emi')}
                                    className={`w-full p-4 rounded-2xl text-left border-2 transition-all ${method === 'emi' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md' : 'border-slate-100 dark:border-slate-800'}`}
                                >
                                    <p className={`text-xs font-black ${method === 'emi' ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>Dư nợ cố định (EMI)</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Số tiền trả hàng tháng bằng nhau</p>
                                </button>
                                <button
                                    onClick={() => setMethod('diminishing')}
                                    className={`w-full p-4 rounded-2xl text-left border-2 transition-all ${method === 'diminishing' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-md' : 'border-slate-100 dark:border-slate-800'}`}
                                >
                                    <p className={`text-xs font-black ${method === 'diminishing' ? 'text-blue-600' : 'text-slate-700 dark:text-slate-300'}`}>Dư nợ giảm dần</p>
                                    <p className="text-[10px] text-slate-400 font-medium">Gốc cố định, lãi giảm theo số dư nợ</p>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Result Area */}
                <div className="lg:col-span-3 space-y-6">
                    <div ref={resultRef} className="bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 relative overflow-hidden min-h-[700px]">
                        {/* Premium Report Header */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-full -mr-20 -mt-20 opacity-50 z-0"></div>
                        <div className="absolute top-10 right-10 z-10 opacity-10">
                            <Calculator size={100} />
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start mb-12 gap-8 pb-8 border-b-2 border-slate-100">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                        <ShieldCheck className="text-white" size={24} />
                                    </div>
                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">MasterKit AI Finance</span>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">BÁO CÁO DỰ TOÁN TÀI CHÍNH</h2>
                                <p className="text-slate-400 font-bold uppercase text-[10px] mt-2 flex items-center gap-2">
                                    <Calendar size={12} /> NGÀY LẬP: {new Date().toLocaleDateString('vi-VN')}
                                </p>
                            </div>

                            <div className="flex items-center gap-4 bg-slate-50 p-5 rounded-3xl border border-white shadow-sm">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${profile?.full_name || 'Expert'}&background=0066FF&color=fff&bold=true`}
                                    className="w-14 h-14 rounded-full border-4 border-white shadow-md"
                                />
                                <div>
                                    <p className="text-sm font-black text-slate-900 uppercase">{profile?.full_name || 'CHUYÊN VIÊN TƯ VẤN'}</p>
                                    <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1"><Phone size={10} /> {profile?.phone || '09xx.xxx.xxx'}</p>
                                    <p className="text-[10px] font-bold text-blue-600 flex items-center gap-1 uppercase"><Building2 size={10} /> {profile?.agency || 'Hệ thống BĐS Chuyên nghiệp'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Top Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="p-8 rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-600/20 relative group hover:scale-[1.02] transition-all">
                                <ArrowDownCircle className="absolute top-4 right-4 text-white/20" size={32} />
                                <p className="text-[10px] font-black uppercase opacity-80 tracking-widest mb-2">Trả tháng đầu tiên</p>
                                <p className="text-3xl font-black">{results ? formatCurrency(results.firstMonth) : '...'}</p>
                                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-[10px] font-bold">
                                    <span>Gốc: {results ? formatCurrency(results.monthlyPrincipal) : '...'}</span>
                                    <span>Lãi: {results ? formatCurrency(results.monthlyInterest) : '...'}</span>
                                </div>
                            </div>

                            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tổng lãi suốt kỳ</p>
                                <p className="text-2xl font-black text-amber-600">{results ? formatCurrency(results.totalInterest) : '...'}</p>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-500" style={{ width: '40%' }}></div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400">Dự kiến</span>
                                </div>
                            </div>

                            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 shadow-sm">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tổng gốc + lãi</p>
                                <p className="text-2xl font-black text-slate-900">{results ? formatCurrency(results.totalPayment) : '...'}</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-4 italic">* Tính trên {term} năm ({term * 12} tháng)</p>
                            </div>
                        </div>

                        {/* Summary Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest mb-6">
                                    <Info className="text-blue-600" size={16} /> Chi tiết khoản vay
                                </h4>
                                <div className="flex justify-between items-center py-4 border-b border-slate-100">
                                    <span className="text-sm font-bold text-slate-500">Số tiền gốc vay</span>
                                    <span className="text-sm font-black text-slate-900">{formatCurrency(amount)}</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-slate-100">
                                    <span className="text-sm font-bold text-slate-500">Thời hạn vay</span>
                                    <span className="text-sm font-black text-slate-900">{term} Năm ({term * 12} tháng)</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-slate-100">
                                    <span className="text-sm font-bold text-slate-500">Lãi suất hàng năm</span>
                                    <span className="text-sm font-black text-slate-900">{rate}%/năm</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-slate-100">
                                    <span className="text-sm font-bold text-slate-500">Ân hạn nợ gốc</span>
                                    <span className="text-sm font-black text-green-600">{gracePeriod} Tháng</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-slate-100">
                                    <span className="text-sm font-bold text-slate-500">Phương thức tính</span>
                                    <span className="text-sm font-black text-blue-600 uppercase">{method === 'emi' ? 'Dư nợ cố định' : 'Dư nợ giảm dần'}</span>
                                </div>
                            </div>

                            <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>
                                <h4 className="text-xs font-black text-blue-400 flex items-center gap-2 uppercase tracking-widest mb-6">
                                    📊 Kế hoạch trả 12 tháng đầu
                                </h4>
                                <div className="space-y-3">
                                    {results?.schedule.map((s, idx) => (
                                        <div key={idx} className="flex justify-between text-[11px] font-medium border-b border-white/5 pb-2">
                                            <span className="text-white/40">Tháng {s.month}</span>
                                            <div className="text-right">
                                                <p className="font-black text-white">{formatCurrency(s.payment)}</p>
                                                <p className="text-[9px] text-white/30">Dư nợ: {formatCurrency(s.remaining)}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {gracePeriod > 0 && <p className="text-[9px] text-green-400 italic font-medium pt-2">✨ Trong {gracePeriod} tháng đầu, sếp chỉ trả lãi giúp khách nhé!</p>}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] text-slate-400 font-bold leading-relaxed italic text-center">
                                * Miễn trừ trách nhiệm: Kết quả mang tính chất tham khảo dựa trên các giả định đầu vào.
                                Lãi suất và các khoản phí thực tế sẽ do Ngân hàng quyết định tại thời điểm ký kết hợp đồng vay vốn.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
