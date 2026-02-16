import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Activity, BarChart3, Database, Users, Calendar, AlertCircle, Clock } from 'lucide-react';

export default function ApiUsageAnalytics() {
    const [isLoading, setIsLoading] = useState(true);
    const [usageData, setUsageData] = useState<any[]>([]);
    const [providerStats, setProviderStats] = useState<any[]>([]);
    const [userStats, setUserStats] = useState<any[]>([]);
    const [summary, setSummary] = useState({
        total_calls: 0,
        avg_duration: 0,
        success_rate: 0
    });

    const loadAnalytics = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch all logs for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const { data: logs, error } = await supabase
                .from('api_logs')
                .select(`
                    *,
                    profiles:user_id (full_name, email)
                `)
                .gte('created_at', thirtyDaysAgo.toISOString())
                .order('created_at', { ascending: true });

            if (logs) {
                // Aggregate by Day & Provider
                const dayMap: any = {};
                const provMap: any = { gemini: 0, openai: 0, stability: 0 };
                const userMap: any = {};
                let successCount = 0;
                let totalDuration = 0;

                logs.forEach(log => {
                    // Time series data
                    const date = new Date(log.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                    if (!dayMap[date]) dayMap[date] = { date, gemini: 0, openai: 0, stability: 0, total: 0 };
                    dayMap[date][log.provider] = (dayMap[date][log.provider] || 0) + 1;
                    dayMap[date].total += 1;

                    // Provider distribution
                    provMap[log.provider] = (provMap[log.provider] || 0) + 1;

                    // User distribution
                    const userName = log.profiles?.full_name || log.profiles?.email || 'Ẩn danh';
                    if (!userMap[userName]) userMap[userName] = 0;
                    userMap[userName] += 1;

                    // Success & Duration
                    if (log.status_code >= 200 && log.status_code < 300) successCount++;
                    totalDuration += log.duration_ms || 0;
                });

                setUsageData(Object.values(dayMap));
                setProviderStats([
                    { name: 'Gemini', value: provMap.gemini, color: '#10b981' },
                    { name: 'OpenAI', value: provMap.openai, color: '#3b82f6' },
                    { name: 'Stability', value: provMap.stability, color: '#f59e0b' }
                ].filter(p => p.value > 0));

                setUserStats(Object.entries(userMap)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a: any, b: any) => b.count - a.count)
                    .slice(0, 5)
                );

                setSummary({
                    total_calls: logs.length,
                    avg_duration: logs.length > 0 ? Math.round(totalDuration / logs.length) : 0,
                    success_rate: logs.length > 0 ? Math.round((successCount / logs.length) * 100) : 0
                });
            }
        } catch (err) {
            console.error('Analytics Loading Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-3">
                    <BarChart3 className="text-purple-600" size={24} /> Phân Tích Sử Dụng API
                </h2>
                <button
                    onClick={loadAnalytics}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                    <Activity size={20} className="text-slate-400" />
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Database size={12} /> Tổng lượt gọi
                    </p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white mt-1 group-hover:scale-110 transition-transform origin-left">
                        {summary.total_calls.toLocaleString()}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={12} /> Tốc độ trung bình
                    </p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">
                        {summary.avg_duration}<span className="text-sm font-bold text-slate-400 ml-1">ms</span>
                    </p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle size={12} /> Tỉ lệ thành công
                    </p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">
                        {summary.success_rate}<span className="text-sm font-bold text-slate-400 ml-1">%</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Usage Chart */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter">Biểu đồ tổng hệ thống (30 ngày)</p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#10b981]" /><span className="text-[10px] font-bold text-slate-400">Gemini</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3b82f6]" /><span className="text-[10px] font-bold text-slate-400">OpenAI</span></div>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={usageData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                <Area type="monotone" dataKey="gemini" stroke="#10b981" strokeWidth={2} fill="transparent" />
                                <Area type="monotone" dataKey="openai" stroke="#3b82f6" strokeWidth={2} fill="transparent" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Account Usage Breakdown */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                        <Users size={16} className="text-blue-500" /> Tần suất theo tài khoản (Top 5)
                    </p>
                    <div className="flex-1 space-y-4">
                        {userStats.length > 0 ? userStats.map((u, i) => (
                            <div key={u.name} className="space-y-1.5">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-black text-slate-700 dark:text-slate-200">{u.name}</span>
                                    <span className="text-[10px] font-black text-blue-600">{u.count} lượt</span>
                                </div>
                                <div className="w-full h-3 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                                        style={{ width: `${(u.count / userStats[0].count) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                                Chưa có dữ liệu sử dụng.
                            </div>
                        )}
                    </div>
                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Phân bổ nhà cung cấp</p>
                                <div className="flex gap-3 mt-2">
                                    {providerStats.map(ps => (
                                        <div key={ps.name} className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ps.color }} />
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{ps.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-20 h-20">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={providerStats}
                                            innerRadius={25}
                                            outerRadius={35}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {providerStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
