import React from 'react';
import { Calculator, Plus, ShieldCheck } from 'lucide-react';
import type { LoanScenario, LoanResults } from './loanTypes';
import { calculateGenericLoan } from './loanCalculations';
import { formatCurrency } from './loanUtils';

interface LoanCompareModalProps {
    scenarios: LoanScenario[];
    isComparing: boolean;
    setIsComparing: (v: boolean) => void;
    compareSelection: number[];
    setCompareSelection: (v: number[]) => void;
}

export default function LoanCompareModal({
    scenarios,
    isComparing,
    setIsComparing,
    compareSelection,
    setCompareSelection,
}: LoanCompareModalProps) {
    if (!isComparing) return null;

    return (
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
                                {['Vốn vay gốc', 'Ngân hàng', 'Thời hạn (năm)', 'Lãi suất (%/năm)', 'Ân hạn gốc (tháng)', 'Ân hạn lãi (tháng)', 'Phương thức', 'Trả tháng đầu', 'Gốc tháng đầu', 'Lãi tháng đầu', '---', 'Tổng lãi phải trả', 'Tổng lãi + gốc', 'Tất toán tại tháng', 'Dư nợ khi tất toán', 'Phí phạt trả trước', '---', 'TỔNG TẤT TOÁN', 'TỔNG CHI PHÍ DỰ KIẾN'].map((label, idx) => (
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
                                            <div className="h-10 flex items-center justify-center text-sm font-black text-indigo-600">{s.gracePeriod} Tháng</div>
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
                    <span>Chotsale Financial Analytics</span>
                    <div className="flex gap-4">
                        {scenarios.length > 2 && (
                            <button onClick={() => setCompareSelection([])} className="text-blue-600 hover:text-blue-700">Chọn lại kịch bản</button>
                        )}
                        <button onClick={() => setIsComparing(false)} className="text-slate-900 hover:text-black">Đóng bảng so sánh</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
