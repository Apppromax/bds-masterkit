import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { Calculator, Download, DollarSign, Calendar, Percent, Copy, Share2, Info, ArrowDownCircle, ShieldCheck, User, Phone, Building2, Settings, RefreshCw, Crown, Zap, Sparkles as SparklesIcon, Loader2 } from 'lucide-react';
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

    const [isExporting, setIsExporting] = useState(false);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
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


    useEffect(() => {
        calculateLoan();
    }, [amount, term, rate, gracePeriod, method]);

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
💰 Số tiền vay: ${formatCurrency(amount)}
🗓 Thời gian: ${term} năm (${term * 12} tháng)
📊 Phương thức: ${method === 'emi' ? 'Dư nợ cố định (EMI)' : 'Dư nợ giảm dần'}
💵 TRẢ THÁNG ĐẦU: ${formatCurrency(results.firstMonth)}
- Gốc: ${formatCurrency(results.monthlyPrincipal)}
- Lãi: ${formatCurrency(results.monthlyInterest)}
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
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase">Số tiền vay (VND)</label>
                            <input
                                type="number"
                                className="w-full p-4 rounded-2xl border-2 border-slate-50 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black text-2xl text-blue-600 outline-none focus:border-blue-500 transition-all"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                            />
                            <div className="px-1 text-sm font-black text-slate-400 italic">
                                ➔ {formatNumberToVietnamese(amount)}
                            </div>
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

                </div>

                <div className="lg:col-span-3 space-y-6">
                    <div ref={resultRef} className="bg-white p-12 md:p-16 rounded-[48px] shadow-2xl border border-slate-100 relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] -mr-32 -mt-32"></div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start mb-16 gap-10 pb-10 border-b-2 border-slate-50">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
                                        <Building2 className="text-white" size={24} />
                                    </div>
                                    <div className="h-6 w-[2px] bg-slate-200 rounded-full"></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] leading-none mb-1">Dự toán tài chính</span>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Bất động sản chuyên nghiệp</span>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Báo Cáo Lãi Vay</h2>
                                    <p className="text-slate-400 font-bold text-xs italic tracking-widest flex items-center gap-2">
                                        <Calendar size={12} /> Ngày lập: {new Date().toLocaleDateString('vi-VN', { dateStyle: 'long' })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-gradient-to-br from-blue-50 to-white p-4 rounded-3xl border border-blue-100 shadow-sm">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${profile?.full_name || 'E'}&background=0066FF&color=fff&bold=true`}
                                    className="w-16 h-16 rounded-2xl border-4 border-white shadow-lg object-cover"
                                    alt="avatar"
                                />
                                <div className="space-y-0.5">
                                    <div className="px-2 py-0.5 bg-blue-600 text-[8px] font-black text-white uppercase rounded-full w-fit mb-0.5 tracking-widest">Tư vấn viên</div>
                                    <p className="text-lg font-black text-slate-900 uppercase leading-none">{profile?.full_name || 'Expert Name'}</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{profile?.agency || 'Sàn BĐS Homespro'}</p>
                                    <p className="text-base font-black text-blue-700 pt-1.5 flex items-center gap-1.5">
                                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                                            <Phone size={12} className="text-white fill-white" />
                                        </div>
                                        {profile?.phone || '09xx.xxx.xxx'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                                <p className="text-[9px] font-black uppercase opacity-60 mb-2 tracking-[0.2em]">Trả tháng đầu</p>
                                <p className="text-3xl font-black tracking-tighter leading-none">{results ? formatCurrency(results.firstMonth) : '...'}</p>
                                <div className="mt-6 pt-6 border-t border-white/20 flex flex-col gap-1.5">
                                    <div className="flex justify-between text-[10px] font-bold opacity-80"><span>Trả gốc:</span><span>{results ? formatCurrency(results.monthlyPrincipal) : '...'}</span></div>
                                    <div className="flex justify-between text-[10px] font-bold opacity-80"><span>Trả lãi:</span><span>{results ? formatCurrency(results.monthlyInterest) : '...'}</span></div>
                                </div>
                            </div>
                            <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-sm flex flex-col justify-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tổng lãi vay</p>
                                <p className="text-2xl font-black text-amber-600 tracking-tighter">{results ? formatCurrency(results.totalInterest) : '...'}</p>
                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight italic">Trong suốt thời kỳ vay</p>
                            </div>
                            <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-sm flex flex-col justify-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Tổng giá trị trả</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tighter">{results ? formatCurrency(results.totalPayment) : '...'}</p>
                                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight italic">Bao gồm gốc và lãi</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
                            <div className="space-y-8">
                                <h4 className="flex items-center gap-3 text-xs font-black text-slate-900 uppercase tracking-[0.3em]">
                                    <div className="w-10 h-1 bg-blue-600 rounded-full"></div> Thông tin chi tiết
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between py-5 border-b border-slate-50 text-base font-bold"><span className="text-slate-400 font-medium">Giá trị gốc vay:</span><span className="text-slate-900 font-black text-lg">{formatCurrency(amount)}</span></div>
                                    <div className="flex justify-between py-5 border-b border-slate-50 text-base font-bold"><span className="text-slate-400 font-medium">Thời hạn vay:</span><span className="text-slate-900 font-black text-lg">{term} Năm ({term * 12} tháng)</span></div>
                                    <div className="flex justify-between py-5 border-b border-slate-50 text-base font-bold"><span className="text-slate-400 font-medium">Lãi suất năm:</span><span className="text-amber-600 font-black text-lg">{rate}% / năm</span></div>
                                    <div className="flex justify-between py-5 border-b border-slate-50 text-base font-bold"><span className="text-slate-400 font-medium">Hình thức trả:</span><span className="text-blue-600 uppercase font-black text-lg">{method === 'emi' ? 'Dư nợ cố định' : 'Dư nợ giảm dần'}</span></div>
                                </div>
                                <div className="bg-blue-50/50 rounded-[2rem] p-8 border border-blue-100 flex gap-5 items-start">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-600"><Info size={24} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Ghi chú quan trọng</p>
                                        <p className="text-xs text-slate-600 font-bold leading-relaxed italic">
                                            Bảng tính mang tính chất minh họa giúp khách hàng có cái nhìn tổng quan về dòng tiền. Lãi suất và các khoản phí có thể thay đổi theo chính sách của ngân hàng tại từng thời điểm.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-950 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col h-full">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 blur-[80px]"></div>
                                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-10 flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                                    📊 Kế hoạch tài chính 12 tháng đầu
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                </h4>
                                <div className={`space-y-4 pr-3 custom-scrollbar flex-grow ${isExporting ? '' : 'max-h-[500px] overflow-y-auto'}`}>
                                    {results?.schedule.map((s, idx) => (
                                        <div key={idx} className={`p-6 rounded-3xl border transition-all duration-300 ${idx === 0 ? 'bg-gradient-to-r from-blue-700 to-blue-500 border-blue-400 shadow-xl shadow-blue-500/20' : 'bg-white/5 border-white/5 hover:bg-white/[0.08]'}`}>
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black ${idx === 0 ? 'bg-white text-blue-600' : 'bg-blue-600/20 text-blue-400'} uppercase`}>Tháng {s.month}</span>
                                                </div>
                                                <span className="text-lg font-black tracking-tight">{formatCurrency(s.payment)}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex flex-col"><span className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Tiền gốc</span><span className="text-xs font-bold opacity-80">{formatCurrency(s.principal)}</span></div>
                                                <div className="flex flex-col text-right"><span className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Tiền lãi</span><span className="text-xs font-bold opacity-80">{formatCurrency(s.interest)}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-12 border-t border-slate-100 flex flex-col items-center space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-[2px] w-12 bg-slate-100"></div>
                                <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.5em]">Homespro AI Ecosystem</p>
                                <div className="h-[2px] w-12 bg-slate-100"></div>
                            </div>
                        </div>

                        <p className="text-[9px] text-slate-300 font-bold italic text-center mt-12">* Minh họa mang tính tham khảo. Thông tin chính xác theo ngân hàng tại thời điểm vay.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
