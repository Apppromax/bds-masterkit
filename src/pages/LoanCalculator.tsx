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
    const [results, setResults] = useState<any>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [compareSelection, setCompareSelection] = useState<number[]>([]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(Math.round(val)) + ' đ';
    const formatNumber = (val: number) => new Intl.NumberFormat('vi-VN').format(Math.round(val));
    const parseFormattedNumber = (val: string) => Number(val.replace(/\./g, '').replace(/,/g, '')) || 0;
    const formatNumberToVietnamese = (num: number): string => {
        if (num === 0) return '0 VNĐ';
        if (num >= 1000000000) return (num / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' Tỷ';
        if (num >= 1000000) return (num / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' Tr';
        return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
    };

    const calculateGenericLoan = (scenario: any) => {
        const { amount: principal, rate, term, gracePeriod, method, prepayPenalty, prepayMonth, hasPrepay } = scenario;
        const monthlyRate = (rate / 100) / 12;
        const totalMonths = term * 12;
        let totalInterestPaid = 0, schedule = [], firstMonthTotal = 0, firstMonthPrincipal = 0, firstMonthInterest = 0, prepayPenaltyAmount = 0, remainingAtPrepay = 0, paidPrincipalUntilPrepay = 0, paidInterestUntilPrepay = 0, remainingPrincipal = principal;

        if (method === 'emi') {
            const monthsToPayPrincipal = totalMonths - (gracePeriod || 0);
            const emiAfterGrace = monthsToPayPrincipal > 0 ? (principal * monthlyRate * Math.pow(1 + monthlyRate, monthsToPayPrincipal)) / (Math.pow(1 + monthlyRate, monthsToPayPrincipal) - 1) : 0;
            for (let i = 1; i <= totalMonths; i++) {
                const interest = remainingPrincipal * monthlyRate;
                let principalPaid = i > (gracePeriod || 0) ? emiAfterGrace - interest : 0;
                let currentPayment = i > (gracePeriod || 0) ? emiAfterGrace : interest;
                remainingPrincipal -= principalPaid;
                if (hasPrepay && i < prepayMonth) { paidPrincipalUntilPrepay += principalPaid; paidInterestUntilPrepay += interest; }
                if (hasPrepay && i === prepayMonth) { remainingAtPrepay = remainingPrincipal + principalPaid; prepayPenaltyAmount = remainingAtPrepay * (prepayPenalty / 100); }
                if (i === 1) { firstMonthTotal = currentPayment; firstMonthPrincipal = principalPaid; firstMonthInterest = interest; }
                schedule.push({ month: i, payment: currentPayment, principal: principalPaid, interest, remaining: Math.max(0, remainingPrincipal) });
                totalInterestPaid += interest;
            }
        } else {
            const monthsToPayPrincipal = totalMonths - gracePeriod;
            const fixedPrincipal = principal / monthsToPayPrincipal;
            for (let i = 1; i <= totalMonths; i++) {
                const interest = remainingPrincipal * monthlyRate;
                const principalPaid = i > gracePeriod ? fixedPrincipal : 0;
                const totalMonthPayment = interest + principalPaid;
                remainingPrincipal -= principalPaid;
                if (hasPrepay && i < prepayMonth) { paidPrincipalUntilPrepay += principalPaid; paidInterestUntilPrepay += interest; }
                if (hasPrepay && i === prepayMonth) { remainingAtPrepay = remainingPrincipal + principalPaid; prepayPenaltyAmount = remainingAtPrepay * (prepayPenalty / 100); }
                if (i === 1) { firstMonthTotal = totalMonthPayment; firstMonthPrincipal = principalPaid; firstMonthInterest = interest; }
                schedule.push({ month: i, payment: totalMonthPayment, principal: principalPaid, interest, remaining: Math.max(0, remainingPrincipal) });
                totalInterestPaid += interest;
            }
        }
        return { firstMonth: firstMonthTotal, totalPayment: principal + totalInterestPaid, totalInterest: totalInterestPaid, monthlyPrincipal: firstMonthPrincipal, monthlyInterest: firstMonthInterest, prepayPenaltyAmount, remainingAtPrepay, paidPrincipalUntilPrepay, paidInterestUntilPrepay, schedule };
    };

    useEffect(() => { setResults(calculateGenericLoan(activeScenario)); }, [scenarios, activeIdx]);
    const updateScenario = (updates: any) => { const newScenarios = [...scenarios]; newScenarios[activeIdx] = { ...newScenarios[activeIdx], ...updates }; setScenarios(newScenarios); };
    const addScenario = () => { if (scenarios.length >= 3) return alert('Tối đa 3 kịch bản'); const newScenario = { ...activeScenario, id: Date.now(), name: `Kịch bản ${scenarios.length + 1}` }; setScenarios([...scenarios, newScenario]); setActiveIdx(scenarios.length); };
    const removeScenario = (idx: number) => { if (scenarios.length <= 1) return; setScenarios(scenarios.filter((_, i) => i !== idx)); setActiveIdx(0); };
    const chartData = results ? [{ name: 'Gốc', value: activeScenario.amount }, { name: 'Lãi', value: results.totalInterest }] : [];
    const handleExport = async () => { if (resultRef.current) { setIsExporting(true); setTimeout(async () => { try { const canvas = await html2canvas(resultRef.current!, { scale: 2, backgroundColor: '#000000', useCORS: true }); const link = document.createElement('a'); link.download = `Bao-gia-lai-vay.png`; link.href = canvas.toDataURL('image/png'); link.click(); } catch (e) { } finally { setIsExporting(false); } }, 100); } };
    const copyToZalo = () => { if (!results) return; const text = `🏠 BÁO GIÁ LÃI VAY ELITE\n🏦 Ngân hàng: ${activeScenario.bankName || 'Hệ thống'}\n💰 Khoản vay: ${formatCurrency(activeScenario.amount)}\n🗓 Thời hạn: ${activeScenario.term} năm\n📊 Trả tháng đầu: ${formatCurrency(results.firstMonth)}\n👤 Tư vấn: ${profile?.full_name || 'Expert'}\n📞 Hotline: ${profile?.phone || ''}`; navigator.clipboard.writeText(text); alert('Copied!'); };

    return (
        <div className="max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar scroll-smooth">
            <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div>
                    <h1 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                        <Calculator className="text-gold" size={20} strokeWidth={3} /> Tính Lãi Vay <span className="text-gold italic">Elite</span>
                    </h1>
                    <p className="text-slate-500 text-[7px] font-black tracking-[0.4em] uppercase mt-0.5 opacity-60">Smart Financial Engine</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                    <button onClick={() => setIsComparing(true)} className="bg-white/5 text-gold px-3 py-1.5 rounded-lg font-black text-[8px] border border-gold/20 uppercase tracking-widest">So sánh</button>
                    <button onClick={copyToZalo} className="bg-white/5 text-slate-400 px-3 py-1.5 rounded-lg font-black text-[8px] border border-white/10 uppercase tracking-widest">ZALO</button>
                    <button onClick={handleExport} className="bg-gold text-black px-4 py-1.5 rounded-lg font-black text-[8px] uppercase tracking-widest shadow-lg">XUẤT ẢNH</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pb-8">
                <div className="lg:col-span-4 space-y-4">
                    <div className="glass-card bg-[#080808] border-white/10 p-5 rounded-2xl shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-[8px] font-black text-gold uppercase tracking-widest flex items-center gap-1.5"><Settings size={12} /> Kịch bản</h3>
                            <button onClick={addScenario} className="w-7 h-7 bg-gold text-black rounded-lg flex items-center justify-center shadow-lg"><Plus size={14} strokeWidth={3} /></button>
                        </div>
                        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-3">
                            {scenarios.map((s, i) => (
                                <button key={s.id} onClick={() => setActiveIdx(i)} className={`px-3 py-1.5 rounded-lg text-[8px] font-black border transition-all ${activeIdx === i ? 'bg-gold/20 border-gold text-gold shadow-lg shadow-gold/5' : 'bg-white/5 border-transparent text-slate-500'}`}>{s.name}</button>
                            ))}
                        </div>
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="space-y-1">
                                <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Số tiền vay (đ)</label>
                                <input type="text" className="w-full p-2.5 bg-white/5 rounded-xl border border-white/10 font-black text-xl text-gold outline-none text-center" value={formatNumber(activeScenario.amount)} onChange={(e) => updateScenario({ amount: parseFormattedNumber(e.target.value) })} />
                                <div className="text-[8px] font-black text-gold/40 text-right uppercase tracking-tighter">➔ {formatNumberToVietnamese(activeScenario.amount)}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[7px] font-black text-slate-500 uppercase">Hạn (năm)</label>
                                    <input type="number" className="w-full p-2 bg-white/5 rounded-xl border border-white/10 font-black text-xs text-white text-center" value={activeScenario.term} onChange={(e) => updateScenario({ term: Number(e.target.value) })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[7px] font-black text-slate-500 uppercase">Lãi (%/n)</label>
                                    <input type="number" step="0.1" className="w-full p-2 bg-white/5 rounded-xl border border-white/10 font-black text-xs text-gold text-center" value={activeScenario.rate} onChange={(e) => updateScenario({ rate: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest pl-1">Ân hạn gốc (tháng)</label>
                                <input type="number" className="w-full p-2 bg-white/5 rounded-xl border border-white/10 font-black text-xs text-gold text-center" value={activeScenario.gracePeriod} onChange={(e) => updateScenario({ gracePeriod: Number(e.target.value) })} />
                            </div>
                            <div className="flex bg-white/5 rounded-xl p-1 gap-1">
                                <button onClick={() => updateScenario({ method: 'emi' })} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black transition-all ${activeScenario.method === 'emi' ? 'bg-gold text-black shadow-lg' : 'text-slate-500'}`}>EMI (Cố định)</button>
                                <button onClick={() => updateScenario({ method: 'diminishing' })} className={`flex-1 py-1.5 rounded-lg text-[8px] font-black transition-all ${activeScenario.method === 'diminishing' ? 'bg-gold text-black shadow-lg' : 'text-slate-500'}`}>Dư nợ giảm dần</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-5">
                    <div ref={resultRef} className={`glass-card bg-[#050505] p-6 md:p-8 rounded-[2.5rem] border-2 border-white/5 shadow-[0_30px_60px_-15px_rgba(0,0,0,1)] relative overflow-hidden transition-all hover:border-gold/20`}>
                        <div className="absolute top-0 right-0 p-4 opacity-[0.02] pointer-events-none italic font-black text-[120px] text-gold uppercase">Loan</div>
                        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5"><p className="text-[7px] font-black text-slate-500 mb-1 uppercase tracking-widest">Trả tháng đầu</p><p className="text-base font-black text-gold">{results ? formatCurrency(results.firstMonth) : '...'}</p></div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5"><p className="text-[7px] font-black text-slate-500 mb-1 uppercase tracking-widest">Tổng lãi trả</p><p className="text-base font-black text-white">{results ? formatCurrency(results.totalInterest) : '...'}</p></div>
                            <div className="bg-gold/10 p-4 rounded-2xl border border-gold/20"><p className="text-[7px] font-black text-gold mb-1 uppercase tracking-widest">Tổng gốc + lãi</p><p className="text-base font-black text-gold">{results ? formatCurrency(results.totalPayment) : '...'}</p></div>
                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5"><p className="text-[7px] font-black text-slate-500 mb-1 uppercase tracking-widest">Gốc/Tháng</p><p className="text-base font-black text-white">{results ? formatCurrency(results.monthlyPrincipal) : '...'}</p></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[250px] mb-8">
                            <div className="bg-[#080808] p-5 rounded-3xl border border-white/5 relative flex flex-col items-center">
                                <h4 className="text-[8px] font-black text-slate-700 uppercase absolute top-4 left-5">Biểu đồ cơ cấu</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                                            {chartData.map((e, i) => <Cell key={i} fill={i === 0 ? '#bf953f' : '#222'} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ background: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="bg-[#080808] p-5 rounded-3xl border border-white/5 relative flex flex-col items-center">
                                <h4 className="text-[8px] font-black text-slate-700 uppercase absolute top-4 left-5">Dòng tiền 10 năm đầu</h4>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={results?.schedule?.filter((_: any, i: number) => (i + 1) % 12 === 0).slice(0, 10).map((s: any) => ({ y: `N${Math.ceil(s.month / 12)}`, p: s.principal, i: s.interest })) || []}>
                                        <XAxis dataKey="y" fontSize={8} axisLine={false} tickLine={false} />
                                        <Bar dataKey="p" stackId="a" fill="#bf953f" radius={[2, 2, 0, 0]} barSize={10} />
                                        <Bar dataKey="i" stackId="a" fill="#222" radius={[2, 2, 0, 0]} barSize={10} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <button onClick={() => setShowSchedule(!showSchedule)} className="w-full py-3 bg-white/5 rounded-xl text-[9px] font-black text-slate-500 uppercase border border-white/5 hover:bg-gold/10 hover:text-gold transition-all">
                            {showSchedule ? 'THU GỌN LỊCH TRẢ NỢ' : 'XEM LỊCH TRỰC QUAN CHI TIẾT'}
                        </button>

                        {showSchedule && (
                            <div className="mt-4 border border-white/5 rounded-2xl overflow-hidden h-[300px] overflow-y-auto no-scrollbar animate-in fade-in zoom-in duration-300">
                                <table className="w-full text-left text-[10px]">
                                    <thead className="bg-[#0a0a0a] sticky top-0 font-black text-[7px] text-slate-600 uppercase tracking-widest">
                                        <tr><th className="p-4">Kỳ/Tháng</th><th className="p-4">Tổng trả</th><th className="p-4">Vốn gốc</th><th className="p-4">Tiền lãi</th><th className="p-4 text-right">Dư nợ</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.02]">
                                        {results?.schedule.map((s: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-gold/[0.03] transition-colors">
                                                <td className="p-4 font-black text-gold opacity-60">T{s.month}</td>
                                                <td className="p-4 font-black text-white">{formatCurrency(s.payment)}</td>
                                                <td className="p-4 text-slate-400">{formatCurrency(s.principal)}</td>
                                                <td className="p-4 text-slate-500">{formatCurrency(s.interest)}</td>
                                                <td className="p-4 text-right font-bold text-slate-200 opacity-60">{formatCurrency(s.remaining)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isComparing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={() => setIsComparing(false)}></div>
                    <div className="bg-[#050505] border-2 border-white/10 rounded-[3rem] w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col relative z-10 shadow-[0_0_100px_rgba(0,0,0,1)]">
                        <div className="p-10 flex justify-between items-center border-b border-white/5">
                            <div><h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Bảng <span className="text-gold">So Sánh Elite</span></h3><p className="text-[8px] font-black text-gold/60 uppercase tracking-widest mt-1">Institutional Grade Analysis</p></div>
                            <button onClick={() => setIsComparing(false)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-gold hover:text-black transition-all shadow-lg"><Plus className="rotate-45" size={24} strokeWidth={3} /></button>
                        </div>
                        <div className="p-8 overflow-x-auto no-scrollbar">
                            <div className="flex gap-4">
                                {scenarios.map((s, i) => {
                                    const res = calculateGenericLoan(s);
                                    return (
                                        <div key={i} className="min-w-[280px] flex-1 bg-[#0a0a0a] rounded-3xl border-2 border-white/5 p-6 space-y-4 hover:border-gold/40 transition-all shadow-2xl">
                                            <div className="text-center border-b border-white/5 pb-4"><p className="text-[8px] font-black text-gold uppercase tracking-widest mb-1">{s.name}</p><p className="text-lg font-black text-white italic">{s.bankName || 'Hệ thống'}</p></div>
                                            <div className="space-y-4">
                                                {[{ l: 'Khoản vay', v: formatCurrency(s.amount) }, { l: 'Thời hạn', v: `${s.term} Năm` }, { l: 'Lãi suất', v: `${s.rate}%` }, { l: 'Ân hạn', v: `${s.gracePeriod} Th` }, { l: 'Tháng đầu', v: formatCurrency(res.firstMonth), c: 'text-gold' }, { l: 'Tổng vốn+lãi', v: formatCurrency(res.totalPayment), c: 'text-white/40' }].map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-white/[0.02]">
                                                        <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">{item.l}</span>
                                                        <span className={`text-[11px] font-black ${item.c || 'text-white'}`}>{item.v}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />
        </div>
    );
}
