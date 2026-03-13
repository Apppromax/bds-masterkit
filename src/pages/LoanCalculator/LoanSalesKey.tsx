import React from 'react';
import { Crown, Star, Zap, Sparkles as SparklesIcon } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea, LabelList } from 'recharts';
import type { LoanScenario, LoanResults } from './loanTypes';
import { formatCurrency } from './loanUtils';

interface LoanSalesKeyProps {
    activeScenario: LoanScenario;
    results: LoanResults | null;
}

export default function LoanSalesKey({ activeScenario, results }: LoanSalesKeyProps) {
    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="relative p-10 rounded-[40px] bg-gradient-to-br from-slate-900 to-[#0f172a] text-white overflow-hidden shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] -mr-40 -mt-40"></div>
                <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/10 rounded-full blur-[80px] -ml-30 -mb-30"></div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-xl transform -rotate-6 mb-2">
                        <Crown size={40} className="text-white drop-shadow-md" />
                    </div>
                    <h3 className="text-3xl font-black uppercase tracking-tight italic">ĐẶC QUYỀN <span className="text-amber-500 underline decoration-amber-500/30 underline-offset-8">DÒNG TIỀN</span></h3>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.2em] max-w-md">Đòn bẩy tài chính thông minh - Giúp khách chốt nhà không lo ngộp lãi.</p>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 border-t border-white/10 pt-10">
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
                                <Star className="text-amber-500" size={20} />
                            </div>
                            <div>
                                <h4 className="text-base font-black uppercase tracking-tight text-white mb-1">Tự do Tài chính tối đa</h4>
                                <p className="text-slate-400 text-xs font-medium leading-relaxed">Trong thời gian ân hạn, sếp không bị áp lực trả nợ, dùng vốn vào các kênh sinh lời khác.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                                <Zap className="text-blue-500" size={20} />
                            </div>
                            <div>
                                <h4 className="text-base font-black uppercase tracking-tight text-white mb-1">Đòn bẩy Tài chính cao</h4>
                                <p className="text-slate-400 text-xs font-medium leading-relaxed">Sở hữu bất động sản tiềm năng chỉ với số vốn tự có ban đầu, ngân hàng gánh phần còn lại.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                        <div className="text-center mb-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-1">Tổng cộng ân hạn nợ</p>
                            <p className="text-5xl font-black tracking-tighter text-white">
                                {Math.max(activeScenario.gracePeriod, activeScenario.graceInterest || 0)} <span className="text-lg opacity-40 italic">Tháng</span>
                            </p>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-3 border-b border-white/5">
                                <span className="text-[10px] font-black uppercase text-slate-400">Ân hạn Gốc</span>
                                <span className="text-sm font-black text-white">{activeScenario.gracePeriod} Tháng</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-white/5">
                                <span className="text-[10px] font-black uppercase text-slate-400">Ân hạn Lãi</span>
                                <span className="text-sm font-black text-white">{activeScenario.graceInterest || 0} Tháng</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-[10px] font-black uppercase text-amber-500">Kỳ trả đầu tiên</span>
                                <span className="text-sm font-black text-amber-500 underline">Tháng {Math.min(activeScenario.gracePeriod, activeScenario.graceInterest || 999) + 1}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative mb-2 w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                <div className="bg-[#0b1120] p-6 md:p-8 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden">
                    {/* Glows */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none -ml-32 -mb-32"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
                        <div>
                            <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <SparklesIcon size={24} className="text-amber-500" /> Bản đồ Dòng tiền
                            </h4>
                        </div>

                        <div className="flex flex-wrap gap-2.5 bg-white/5 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none">0 VNĐ (Ân hạn)</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest leading-none">Lãi (Màu Cam)</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
                                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest leading-none">Gốc (Màu Xanh)</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[280px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={results?.schedule?.filter((_, i) => (i + 1) % Math.max(1, Math.ceil((results?.schedule?.length || 1) / 40)) === 0 || i === 0 || i === (results?.schedule?.length || 1) - 1 || i + 1 === activeScenario.graceInterest || i + 1 === (activeScenario.graceInterest || 0) + 1 || i + 1 === activeScenario.gracePeriod || i + 1 === activeScenario.gracePeriod + 1).sort((a, b) => a.month - b.month).map(s => ({ month: s.month, payment: s.payment, principal: s.principal, interest: s.interest })) || []}
                                margin={{ top: 30, right: 10, left: 10, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="principalGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    </linearGradient>
                                    <linearGradient id="interestGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>

                                {activeScenario.graceInterest > 0 && (
                                    <ReferenceArea x1={1} x2={activeScenario.graceInterest} fill="#f59e0b" fillOpacity={0.06} />
                                )}
                                {activeScenario.gracePeriod > (activeScenario.graceInterest || 0) && (
                                    <ReferenceArea x1={Math.max(1, activeScenario.graceInterest || 0)} x2={activeScenario.gracePeriod} fill="#3b82f6" fillOpacity={0.08} />
                                )}
                                <ReferenceArea x1={activeScenario.gracePeriod || 1} x2={results?.schedule?.length} fill="#ffffff" fillOpacity={0.02} />

                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                <XAxis
                                    dataKey="month"
                                    type="number"
                                    domain={['dataMin', 'dataMax']}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(val) => `Th ${val}`}
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                                    dy={10}
                                />
                                <YAxis hide domain={[0, 'dataMax']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)' }}
                                    itemStyle={{ fontSize: '14px', fontWeight: '900' }}
                                    labelStyle={{ color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '2px' }}
                                    formatter={(value: any, name: any) => [`${formatCurrency(Number(value || 0))}`, name === 'principal' ? 'Trả Gốc' : (name === 'interest' ? 'Trả Lãi' : 'Tổng')]}
                                    labelFormatter={(label) => `Tháng ${label}`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="principal"
                                    name="principal"
                                    stackId="1"
                                    stroke="#818cf8"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#principalGradient)"
                                    activeDot={{ r: 6, fill: '#818cf8', stroke: '#0f172a', strokeWidth: 4 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="interest"
                                    name="interest"
                                    stackId="1"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#interestGradient)"
                                    activeDot={{ r: 6, fill: '#f59e0b', stroke: '#0f172a', strokeWidth: 4 }}
                                >
                                    <LabelList
                                        dataKey="payment"
                                        position="top"
                                        content={(props: any) => {
                                            const { x, y, value, index } = props;
                                            const payData = results?.schedule?.filter((_, i) => (i + 1) % Math.max(1, Math.ceil((results?.schedule?.length || 1) / 40)) === 0 || i === 0 || i === (results?.schedule?.length || 1) - 1 || i + 1 === activeScenario.graceInterest || i + 1 === (activeScenario.graceInterest || 0) + 1 || i + 1 === activeScenario.gracePeriod || i + 1 === activeScenario.gracePeriod + 1).sort((a, b) => a.month - b.month).map(s => ({ month: s.month, payment: s.payment, principal: s.principal, interest: s.interest })) || [];

                                            let isKeyPoint = false;
                                            let labelText = '';
                                            const prevPayment = index > 0 ? (payData[index - 1]?.payment || 0) : 0;

                                            if (value > 0 && prevPayment === 0) {
                                                isKeyPoint = true;
                                                labelText = 'Kỳ trả đầu';
                                            } else if (Math.abs(value - prevPayment) > 1000000 && value > 0) {
                                                isKeyPoint = true;
                                                labelText = 'Hết ân hạn';
                                            } else if (index === payData.length - 1 && payData.length > 2) {
                                                isKeyPoint = true;
                                                labelText = 'Kỳ cuối';
                                            }

                                            if (!isKeyPoint) return null;

                                            const displayValue = `${(value / 1000000).toFixed(1)} Triệu`;
                                            return (
                                                <g>
                                                    <rect x={x - 40} y={y - 40} width={80} height={32} rx={8} fill="rgba(15, 23, 42, 0.9)" stroke="rgba(255,255,255,0.3)" strokeWidth={1} style={{ backdropFilter: 'blur(8px)' }} />
                                                    <text x={x} y={y - 25} fill="#94a3b8" textAnchor="middle" fontSize={9} fontWeight={800}>
                                                        {labelText.toUpperCase()}
                                                    </text>
                                                    <text x={x} y={y - 13} fill="#ffffff" textAnchor="middle" fontSize={11} fontWeight={900}>
                                                        {displayValue}
                                                    </text>
                                                </g>
                                            );
                                        }}
                                    />
                                </Area>
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Removed: Expert Advice Block as requested */}
        </div>
    );
}
