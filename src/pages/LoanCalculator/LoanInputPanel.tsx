import React, { useState } from 'react';
import { Settings, Plus, Trash2, Building2, ArrowDownCircle } from 'lucide-react';
import type { LoanScenario } from './loanTypes';
import { BANK_LIST, formatNumber, formatNumberToVietnamese, parseFormattedNumber } from './loanUtils';

interface LoanInputPanelProps {
    scenarios: LoanScenario[];
    activeIdx: number;
    activeScenario: LoanScenario;
    setActiveIdx: (idx: number) => void;
    addScenario: () => void;
    removeScenario: (idx: number) => void;
    updateScenario: (updates: Partial<LoanScenario>) => void;
}

export default function LoanInputPanel({
    scenarios,
    activeIdx,
    activeScenario,
    setActiveIdx,
    addScenario,
    removeScenario,
    updateScenario,
}: LoanInputPanelProps) {
    const [isBankSelectorOpen, setIsBankSelectorOpen] = useState(false);
    const [bankSearch, setBankSearch] = useState('');

    return (
        <div className="lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Settings className="w-3.5 h-3.5" /> Kịch bản</h3>
                    <button onClick={addScenario} className="w-8 h-8 flex items-center justify-center bg-gradient-to-r from-gold to-[#aa771c] text-black rounded-lg hover:brightness-110 transition-colors">
                        <Plus size={14} />
                    </button>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 pt-3 px-3 -mx-3">
                    {scenarios.map((s, i) => (
                        <div key={s.id} className="relative group">
                            <button
                                onClick={() => setActiveIdx(i)}
                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black whitespace-nowrap transition-all border ${activeIdx === i ? 'border-gold bg-gold/10 text-gold' : 'border-slate-100 text-slate-400'}`}
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
                        <label className="block text-[9px] font-black text-slate-700 uppercase tracking-tight">Số tiền vay</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 font-black text-2xl text-gold outline-none focus:border-gold transition-all shadow-sm"
                                value={activeScenario.amount === 0 ? '' : formatNumber(activeScenario.amount)}
                                placeholder="0"
                                onChange={(e) => updateScenario({ amount: parseFormattedNumber(e.target.value) })}
                                onFocus={(e) => e.target.select()}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">VND</div>
                        </div>
                        <div className="px-1 text-[11px] font-black text-slate-500 italic">➔ {formatNumberToVietnamese(activeScenario.amount)}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] font-black text-slate-700 uppercase mb-1">Thời gian (năm)</label>
                            <input type="number" placeholder="0" className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 font-black text-lg text-gold shadow-sm outline-none focus:border-gold" value={activeScenario.term || ''} onChange={(e) => updateScenario({ term: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-700 uppercase mb-1">Lãi suất %/năm</label>
                            <input type="number" step="0.1" placeholder="0" className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 font-black text-lg text-amber-600 shadow-sm outline-none focus:border-amber-500" value={activeScenario.rate || ''} onChange={(e) => updateScenario({ rate: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[9px] font-black text-slate-700 uppercase mb-1 flex justify-between">
                                <span>Ân hạn gốc</span>
                                <span className="text-indigo-600 font-bold lowercase">tháng</span>
                            </label>
                            <input type="number" placeholder="0" className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 font-black text-lg text-indigo-700 shadow-sm outline-none focus:border-indigo-500" value={activeScenario.gracePeriod === 0 ? '' : activeScenario.gracePeriod} onChange={(e) => updateScenario({ gracePeriod: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                        </div>
                        <div>
                            <label className="block text-[9px] font-black text-slate-700 uppercase mb-1 flex justify-between">
                                <span>Ân hạn lãi</span>
                                <span className="text-emerald-600 font-bold lowercase">tháng</span>
                            </label>
                            <input type="number" placeholder="0" className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 font-black text-lg text-emerald-700 shadow-sm outline-none focus:border-emerald-500" value={activeScenario.graceInterest === 0 ? '' : activeScenario.graceInterest} onChange={(e) => updateScenario({ graceInterest: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                        </div>
                    </div>
                    <div className="pt-2 flex items-center justify-between p-4 rounded-3xl bg-slate-50/80 border border-slate-100 mb-2 shadow-sm">
                        <div className="space-y-0.5">
                            <label className="block text-[9px] font-black text-slate-700 uppercase">Tất toán trước hạn</label>
                            <p className="text-[7px] text-slate-500 font-bold italic lowercase italic">tính phí phạt và số dư nợ khi trả trước</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={activeScenario.hasPrepay} onChange={(e) => updateScenario({ hasPrepay: e.target.checked })} />
                            <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                        </label>
                    </div>
                </div>
            </div>

            {activeScenario.hasPrepay && (
                <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-300">
                    <div>
                        <label className="block text-[9px] font-black text-slate-700 uppercase mb-1">Tháng tất toán</label>
                        <input type="number" placeholder="0" className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 font-black text-lg text-gold shadow-sm outline-none focus:border-gold" value={activeScenario.prepayMonth || ''} onChange={(e) => updateScenario({ prepayMonth: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                    </div>
                    <div>
                        <label className="block text-[9px] font-black text-slate-700 uppercase mb-1">Phí phạt %</label>
                        <input type="number" step="0.1" placeholder="0" className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 font-black text-lg text-red-600 shadow-sm outline-none focus:border-red-500" value={activeScenario.prepayPenalty === 0 ? '' : activeScenario.prepayPenalty} onChange={(e) => updateScenario({ prepayPenalty: Number(e.target.value) })} onFocus={(e) => e.target.select()} />
                    </div>
                </div>
            )}
            <div className="pt-2">
                <label className="block text-[9px] font-black text-slate-700 uppercase mb-1.5 flex justify-between">
                    <span>Chọn Ngân hàng</span>
                    {activeScenario.bankName && <span className="text-gold lowercase font-bold">{activeScenario.bankName}</span>}
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
                <label className="block text-[9px] font-black text-slate-700 uppercase mb-1.5">Phương thức trả</label>
                <div className="flex gap-2">
                    <button onClick={() => updateScenario({ method: 'emi' })} className={`flex-1 py-2 px-1 rounded-lg text-center border transition-all ${activeScenario.method === 'emi' ? 'border-gold bg-gold/10 text-gold' : 'border-slate-100 text-slate-400'}`}>
                        <p className="text-[9px] font-black">EMI Cố định</p>
                    </button>
                    <button onClick={() => updateScenario({ method: 'diminishing' })} className={`flex-1 py-2 px-1 rounded-lg text-center border transition-all ${activeScenario.method === 'diminishing' ? 'border-gold bg-gold/10 text-gold' : 'border-slate-100 text-slate-400'}`}>
                        <p className="text-[9px] font-black">Dư nợ giảm dần</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
