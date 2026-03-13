import React from 'react';
import { DollarSign, Zap, ShieldCheck, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import type { LoanScenario, LoanResults } from './loanTypes';
import { formatCurrency } from './loanUtils';

interface LoanResultSummaryProps {
    activeScenario: LoanScenario;
    results: LoanResults | null;
    chartData: { name: string; value: number; color: string }[];
    isExporting: boolean;
    showSchedule: boolean;
    setShowSchedule: (v: boolean) => void;
    includeDetailsInExport: boolean;
    setIncludeDetailsInExport: (v: boolean) => void;
}

export default function LoanResultSummary({
    activeScenario,
    results,
    chartData,
    isExporting,
    showSchedule,
    setShowSchedule,
    includeDetailsInExport,
    setIncludeDetailsInExport,
}: LoanResultSummaryProps) {
    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 w-full">
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
                <div className={`p-4 rounded-[28px] border flex flex-col justify-center text-center shadow-sm transition-all duration-500 ${(activeScenario.gracePeriod > 0 || activeScenario.graceInterest > 0) ? 'bg-indigo-50/50 border-indigo-200 scale-[1.02]' : 'bg-white border-slate-100'}`}>
                    <p className={`text-[7px] font-black uppercase tracking-widest mb-1 leading-none ${(activeScenario.gracePeriod > 0 || activeScenario.graceInterest > 0) ? 'text-indigo-600' : 'text-slate-400'}`}>Ân hạn nợ</p>
                    <p className={`text-base font-black tracking-tighter leading-none ${(activeScenario.gracePeriod > 0 || activeScenario.graceInterest > 0) ? 'text-indigo-700' : 'text-slate-800'}`}>
                        {activeScenario.gracePeriod > 0 ? `Gốc: ${activeScenario.gracePeriod}T` : ''}
                        {activeScenario.gracePeriod > 0 && activeScenario.graceInterest > 0 ? ' - ' : ''}
                        {activeScenario.graceInterest > 0 ? `Lãi: ${activeScenario.graceInterest}T` : (activeScenario.gracePeriod === 0 ? '0 Tháng' : '')}
                    </p>
                    <p className={`text-[6px] font-bold mt-1 ${(activeScenario.gracePeriod > 0 || activeScenario.graceInterest > 0) ? 'text-indigo-400' : 'text-slate-400'}`}>
                        {activeScenario.graceInterest > 0 ? 'Ngân hàng hỗ trợ 0% lãi' : 'Chỉ trả lãi hàng tháng'}
                    </p>
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
                            <div className="h-[240px] bg-slate-50/50 rounded-3xl border border-slate-50 p-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={results?.schedule?.filter((_, i) => {
                                            if (i === 0) return true;
                                            if ((i + 1) % 12 !== 0) return false;
                                            const year = (i + 1) / 12;
                                            const totalYears = activeScenario.term;
                                            if (year === totalYears) return true;
                                            if (totalYears > 10) return year % 5 === 0;
                                            if (totalYears > 5) return year % 3 === 0;
                                            return true;
                                        }).map((s) => ({
                                            year: s.month === 1 ? 'T.1' : `Năm ${s.month / 12}`,
                                            principal: s.principal,
                                            interest: s.interest,
                                            total: s.payment
                                        })) || []}
                                        margin={{ top: 30, right: 10, left: 10, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 700, fill: '#64748b' }} interval="preserveStartEnd" />
                                        <YAxis hide />
                                        <Tooltip
                                            formatter={(value: any) => formatCurrency(Number(value))}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                                        />
                                        <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: '900', paddingTop: '10px' }} />
                                        <Bar dataKey="principal" name="Gốc" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} maxBarSize={40} />
                                        <Bar dataKey="interest" name="Lãi" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                            <LabelList
                                                dataKey="total"
                                                position="top"
                                                content={(props: any) => {
                                                    const { x, y, width, value } = props;
                                                    return (
                                                        <text x={x + width / 2} y={y - 8} fill="#94a3b8" textAnchor="middle" fontSize={9} fontWeight={800}>
                                                            {value >= 1000000000 ? `${(value / 1000000000).toFixed(2)}Tỷ` : value >= 1000000 ? `${(value / 1000000).toFixed(1)}Tr` : value}
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
                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.1em]">Chi tiết phí & Dư nợ</span>
                                </div>
                                <div className="space-y-1 pb-2 border-b border-slate-200">
                                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tight"><span>Gốc đã trả:</span><span className="text-slate-700">{results ? formatCurrency(results.paidPrincipalUntilPrepay) : '...'}</span></div>
                                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-tight"><span>Lãi đã trả:</span><span className="text-slate-700">{results ? formatCurrency(results.paidInterestUntilPrepay) : '...'}</span></div>
                                    <div className="flex justify-between text-[9px] font-black text-slate-900 pt-1 uppercase tracking-tight"><span>Tổng đã trả (G+L):</span><span>{results ? formatCurrency(results.paidPrincipalUntilPrepay + results.paidInterestUntilPrepay) : '...'}</span></div>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold"><span className="text-slate-400 uppercase tracking-tight">Hệ số tất toán trước hạn (%):</span><span className="text-slate-900 font-black">{activeScenario.prepayPenalty}%</span></div>
                                <div className="flex justify-between text-[10px] font-bold"><span className="text-slate-400 uppercase tracking-tight">Dư nợ gốc còn lại:</span><span className="text-slate-900 font-black">{results ? formatCurrency(results.remainingAtPrepay) : '...'}</span></div>
                                <div className="flex justify-between text-[10px] font-bold border-t border-dashed border-slate-200 pt-2"><span className="text-blue-600 uppercase tracking-tight">Tiền phí dự kiến:</span><span className="text-blue-700 font-black">{results ? formatCurrency(results.prepayPenaltyAmount) : '...'}</span></div>

                                <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">TỔNG TẤT TOÁN:</span>
                                        <span className="text-[7px] text-slate-400 font-bold uppercase">(Gốc còn lại + Phí)</span>
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
            </div>

            <div className="mt-8 relative z-10 w-full">
                {!isExporting && (
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => setShowSchedule(!showSchedule)}
                            className={`flex-1 py-3 px-6 rounded-2xl border transition-all font-black text-[10px] tracking-widest uppercase flex items-center justify-center gap-2 ${showSchedule ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}
                        >
                            <Calendar size={14} /> {showSchedule ? 'Thu gọn lịch trả nợ' : 'Xem lịch trả nợ chi tiết'}
                        </button>
                        <div className="flex sm:hidden items-center justify-between p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kèm 12 tháng đầu khi xuất</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={includeDetailsInExport} onChange={(e) => setIncludeDetailsInExport(e.target.checked)} />
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                )}

                {(showSchedule || (isExporting && includeDetailsInExport)) && (
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
        </>
    );
}
