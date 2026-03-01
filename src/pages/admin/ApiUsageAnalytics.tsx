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
    const [modelStats, setModelStats] = useState<any[]>([]);
    const [topModels, setTopModels] = useState<string[]>([]);
    const [userStats, setUserStats] = useState<any[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('all');
    const [usersList, setUsersList] = useState<{ id: string, full_name: string, email: string }[]>([]);
    const [summary, setSummary] = useState({
        total_calls: 0,
        avg_duration: 0,
        success_rate: 0,
        dau: 0, // Daily Active Users
        total_users: 0,
        total_tokens: 0,
        total_cost: 0
    });

    const loadAnalytics = async () => {
        setIsLoading(true);
        try {
            // 0. Fetch Users for filtering (once)
            if (usersList.length === 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .order('full_name');
                if (profiles) setUsersList(profiles);
            }

            // 1. Fetch logs for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            let query = supabase
                .from('api_logs')
                .select(`
                    *,
                    profiles:user_id (full_name, email)
                `)
                .gte('created_at', thirtyDaysAgo.toISOString())
                .order('created_at', { ascending: true });

            if (selectedUserId !== 'all') {
                query = query.eq('user_id', selectedUserId);
            }

            const { data: logs, error } = await query;

            if (logs) {
                // Aggregation
                const dayMap: any = {};
                const provMap: any = { gemini: 0, openai: 0, stability: 0 };
                const modelMap: any = {};
                const userMap: any = {};
                let successCount = 0;
                let totalDuration = 0;
                let totalTokens = 0;
                let totalCost = 0;

                logs.forEach(log => {
                    const date = new Date(log.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                    if (!dayMap[date]) dayMap[date] = { date, total: 0, uniqueUsers: new Set() };

                    const mName = log.model || 'Unknown';
                    dayMap[date][mName] = (dayMap[date][mName] || 0) + 1;
                    dayMap[date].total += 1;

                    const userId = log.user_id;
                    if (userId) {
                        dayMap[date].uniqueUsers.add(userId);
                    }

                    provMap[log.provider] = (provMap[log.provider] || 0) + 1;
                    modelMap[mName] = (modelMap[mName] || 0) + 1;

                    const userName = log.profiles?.full_name || log.profiles?.email || 'Ẩn danh';
                    if (!userMap[userName]) userMap[userName] = 0;
                    userMap[userName] += 1;

                    if (log.status_code >= 200 && log.status_code < 300) successCount++;
                    totalDuration += log.duration_ms || 0;
                    totalTokens += log.token_count || 0;
                    totalCost += log.estimated_cost || 0;
                });

                const usageDataArray = Object.values(dayMap).map((d: any) => ({
                    ...d,
                    activeUsers: d.uniqueUsers.size // Convert Set size to a number for charts
                }));

                setUsageData(usageDataArray);

                const sortedModels = Object.entries(modelMap)
                    .map(([name, count]) => ({
                        name,
                        count,
                        // Add color for pie chart
                        color: name.includes('3.1') ? '#d4af37' : // Gold
                            name.includes('2.0') ? '#10b981' : // Emerald
                                name.includes('1.5') ? '#3b82f6' : // Blue
                                    '#94a3b8' // Slate
                    }))
                    .sort((a: any, b: any) => b.count - a.count);

                setModelStats(sortedModels);
                setTopModels(sortedModels.slice(0, 4).map(m => m.name));

                setUserStats(Object.entries(userMap)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a: any, b: any) => b.count - a.count)
                    .slice(0, 5)
                );

                // Calculate DAU as the active users from the last day in the chart (today/yesterday)
                const latestDay = usageDataArray[usageDataArray.length - 1];
                const dau = latestDay ? latestDay.activeUsers : 0;

                setSummary({
                    total_calls: logs.length,
                    avg_duration: logs.length > 0 ? Math.round(totalDuration / logs.length) : 0,
                    success_rate: logs.length > 0 ? Math.round((successCount / logs.length) * 100) : 0,
                    dau: dau,
                    total_users: Object.keys(userMap).length,
                    total_tokens: totalTokens,
                    total_cost: totalCost
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
    }, [selectedUserId]);

    const COLORS = ['#d4af37', '#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-3">
                    <BarChart3 className="text-gold" size={24} /> Phân Tích Sử Dụng API
                </h2>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="w-full md:w-64 p-2.5 pl-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-gold outline-none appearance-none cursor-pointer hover:border-gold/50 transition-all"
                        >
                            <option value="all">📊 Toàn bộ hệ thống</option>
                            {usersList.map(u => (
                                <option key={u.id} value={u.id}>
                                    👤 {u.full_name || u.email}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                            <Users size={14} />
                        </div>
                    </div>

                    <button
                        onClick={loadAnalytics}
                        disabled={isLoading}
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-gold hover:text-white transition-all disabled:opacity-50"
                    >
                        <Activity size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-gold/5 rounded-full" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Users size={12} /> DAU (Người dùng hôm nay)
                    </p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white mt-1 group-hover:scale-110 transition-transform origin-left">
                        {summary.dau.toLocaleString()}
                    </p>
                    <p className="text-[10px] mt-2 font-bold text-slate-400">Trên tổng {summary.total_users} users active (30d)</p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Database size={12} /> {selectedUserId === 'all' ? 'Tổng lượt gọi AI' : 'Lượt gọi của User'}
                    </p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white mt-1 group-hover:scale-110 transition-transform origin-left">
                        {summary.total_calls.toLocaleString()}
                    </p>
                    <p className="text-[10px] mt-2 font-bold text-slate-400">Tích lũy trong 30 ngày qua</p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={12} /> Tốc độ phản hồi trung bình
                    </p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">
                        {summary.avg_duration}<span className="text-sm font-bold text-slate-400 ml-1">ms</span>
                    </p>
                </div>
                <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={12} /> Tổng Tokens tiêu tốn
                    </p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">
                        {(summary.total_tokens / 1000).toFixed(1)}k
                    </p>
                    <p className="text-[10px] mt-2 font-bold text-slate-400">
                        Chi phí ước tính: <span className="text-emerald-500">${summary.total_cost.toFixed(4)}</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Usage Chart - Model Version Focused */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                        <div>
                            <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                                {selectedUserId === 'all' ? 'Lượt gọi theo Model (30 ngày)' : 'Model sử dụng bởi User'}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Focus: Gemini Versions</p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {topModels.map((m, i) => (
                                <div key={m} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                                        {m.includes('3.1') ? 'V3.1 Flash' :
                                            m.includes('2.0') ? 'V2.0 Flash' :
                                                m.includes('1.5') ? 'V1.5 Flash' :
                                                    m.replace('gemini-', '')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={usageData}>
                                <defs>
                                    <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.9)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                {topModels.map((m, i) => (
                                    <Area
                                        key={m}
                                        type="monotone"
                                        dataKey={m}
                                        stroke={COLORS[i % COLORS.length]}
                                        strokeWidth={2}
                                        fill="transparent"
                                        dot={false}
                                    />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                        <Activity size={16} className="text-emerald-500" /> Phân bổ theo Phiên bản Gemini
                    </p>
                    <div className="flex-1 space-y-4">
                        {modelStats.length > 0 ? modelStats.map((m, i) => (
                            <div key={m.name} className="space-y-1.5">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-black text-slate-700 dark:text-slate-200">{m.name}</span>
                                    <span className="text-[10px] font-black text-emerald-600">{m.count} lượt</span>
                                </div>
                                <div className="w-full h-3 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                        style={{ width: `${(m.count / modelStats[0].count) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex items-center justify-center text-slate-400 font-bold text-sm">
                                Chưa có dữ liệu Model.
                            </div>
                        )}
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
                                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-1000"
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
                                <p className="text-[10px] font-black text-slate-400 uppercase">Tỷ lệ Phiên bản AI</p>
                                <div className="flex flex-col gap-1.5 mt-2">
                                    {modelStats.slice(0, 3).map((ms, i) => (
                                        <div key={ms.name} className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ms.color }} />
                                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                                {ms.name.replace('gemini-', '').substring(0, 15)}...
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="w-24 h-24">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={modelStats}
                                            innerRadius={30}
                                            outerRadius={45}
                                            paddingAngle={4}
                                            dataKey="count"
                                        >
                                            {modelStats.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
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
