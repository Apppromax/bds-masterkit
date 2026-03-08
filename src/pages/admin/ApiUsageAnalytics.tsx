import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    AreaChart, Area, Legend, PieChart, Pie, Cell
} from 'recharts';
import { Activity, BarChart3, Database, Users, Calendar, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function ApiUsageAnalytics() {
    const [isLoading, setIsLoading] = useState(true);
    const [usageData, setUsageData] = useState<any[]>([]);
    const [modelStats, setModelStats] = useState<any[]>([]);
    const [topModels, setTopModels] = useState<string[]>([]);
    const [userStats, setUserStats] = useState<any[]>([]);
    const [errorStats, setErrorStats] = useState<any[]>([]);
    const [dailyCostData, setDailyCostData] = useState<any[]>([]);
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
            // Fetch users list
            const { data: users } = await supabase
                .rpc('admin_get_all_profiles');
            if (users) setUsersList(users);

            // Fetch logs for the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            let query = supabase
                .from('api_logs')
                .select(`
                    id, provider, model, status_code, duration_ms, created_at, 
                    token_count, estimated_cost,
                    profiles:user_id (full_name, email)
                `)
                .gte('created_at', thirtyDaysAgo.toISOString());

            if (selectedUserId !== 'all') {
                query = query.eq('user_id', selectedUserId);
            }

            const { data: logs, error } = await query.order('created_at', { ascending: true });

            if (error) throw error;

            if (logs) {
                const dayMap: any = {};
                const modelMap: any = {};
                const userMap: any = {};
                const errorMap: any = {};
                const costByDay: any = {};
                let successCount = 0;
                let totalDuration = 0;
                let totalTokens = 0;
                let totalCost = 0;

                logs.forEach(log => {
                    const date = new Date(log.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                    const profile = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles;

                    // Usage chart data
                    if (!dayMap[date]) dayMap[date] = { date, total: 0, activeUsers: new Set() };
                    dayMap[date].total += 1;
                    dayMap[date].activeUsers.add(profile?.email || 'unknown');

                    const modelName = log.model || 'Unknown';
                    if (!dayMap[date][modelName]) dayMap[date][modelName] = 0;
                    dayMap[date][modelName] += 1;

                    // Model stats
                    if (!modelMap[modelName]) modelMap[modelName] = 0;
                    modelMap[modelName] += 1;

                    // User stats
                    const userName = profile?.full_name || profile?.email || 'Ẩn danh';
                    if (!userMap[userName]) userMap[userName] = 0;
                    userMap[userName] += 1;

                    // Error mapping & Success tracking
                    if (log.status_code >= 200 && log.status_code < 300) {
                        successCount++;
                    } else {
                        const errCode = log.status_code?.toString() || 'Unknown';
                        errorMap[errCode] = (errorMap[errCode] || 0) + 1;
                    }

                    totalDuration += log.duration_ms || 0;
                    totalTokens += log.token_count || 0;
                    totalCost += log.estimated_cost || 0;

                    // Daily cost aggregation
                    const isoDate = new Date(log.created_at).toISOString().split('T')[0];
                    costByDay[isoDate] = (costByDay[isoDate] || 0) + (log.estimated_cost || 0);
                });

                const usageDataArray = Object.values(dayMap).map((d: any) => ({
                    ...d,
                    activeUsers: d.activeUsers.size
                }));
                setUsageData(usageDataArray);

                const sortedModels = Object.entries(modelMap)
                    .map(([name, count]) => ({
                        name,
                        count: count as number,
                        color: name.includes('3.1') ? '#d4af37' : name.includes('2.0') ? '#10b981' : '#3b82f6'
                    }))
                    .sort((a: any, b: any) => b.count - a.count);

                setModelStats(sortedModels);
                setTopModels(sortedModels.slice(0, 4).map(m => m.name));

                // Daily Cost Data
                setDailyCostData(Object.entries(costByDay)
                    .map(([date, cost]) => ({
                        date: new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                        cost: cost as number
                    }))
                    .sort((a, b) => a.date.localeCompare(b.date))
                );

                // Error Stats
                setErrorStats(Object.entries(errorMap)
                    .map(([code, count]) => ({
                        name: `Mã ${code}`,
                        value: count as number,
                        color: code === '429' ? '#f59e0b' : code.startsWith('5') ? '#ef4444' : '#94a3b8'
                    }))
                    .sort((a: any, b: any) => b.value - a.value)
                );

                // Top Users
                setUserStats(Object.entries(userMap)
                    .map(([name, count]) => ({ name, count: count as number }))
                    .sort((a: any, b: any) => b.count - a.count)
                    .slice(0, 5)
                );

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
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-3">
                    <BarChart3 className="text-gold" size={24} /> Phân Tích Hệ Thống AI
                </h2>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none">
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                            className="w-full md:w-64 p-2.5 pl-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-gold outline-none appearance-none cursor-pointer hover:border-gold/50 transition-all shadow-sm"
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
                        className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-gold hover:text-white transition-all disabled:opacity-50 shadow-sm"
                    >
                        <Activity size={20} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-gold/5 rounded-full" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Users size={12} /> DAU (Người dùng hôm nay)
                    </p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white mt-1 group-hover:scale-105 transition-transform origin-left">
                        {summary.dau.toLocaleString()}
                    </p>
                    <p className="text-[10px] mt-2 font-bold text-slate-400">Trên tổng {summary.total_users} active (30d)</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Database size={12} /> {selectedUserId === 'all' ? 'Tổng lượt gọi AI' : 'Lượt gọi của User'}
                    </p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white mt-1 group-hover:scale-105 transition-transform origin-left">
                        {summary.total_calls.toLocaleString()}
                    </p>
                    <p className="text-[10px] mt-2 font-bold text-slate-400">Success Rate: <span className="text-emerald-500">{summary.success_rate}%</span></p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={12} /> Tổng Tokens tiêu tốn
                    </p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white mt-1">
                        {(summary.total_tokens / 1000).toFixed(1)}<span className="text-sm font-bold text-slate-400 ml-1">k</span>
                    </p>
                    <p className="text-[10px] mt-2 font-bold text-slate-400">Xấp xỉ {summary.total_tokens.toLocaleString()} tokens</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm relative group overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Database size={12} /> Chi phí ước tính
                    </p>
                    <p className="text-4xl font-black text-emerald-500 mt-1">
                        ${summary.total_cost.toFixed(3)}
                    </p>
                    <p className="text-[10px] mt-2 font-bold text-slate-400 italic">Tính theo giá thị trường 2025</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Usage Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                        <div>
                            <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                                Lượt gọi theo Model (30 ngày)
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {topModels.map((m, i) => (
                                <div key={m} className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                                        {m.includes('3.1') ? 'V3.1 Flash' :
                                            m.includes('2.0') ? 'V2.0 Flash' :
                                                m.includes('1.5') ? 'V1.5 Flash' : m}
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
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="total" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorMain)" />
                                {topModels.map((m, i) => (
                                    <Area key={m} type="monotone" dataKey={m} stroke={COLORS[i % COLORS.length]} strokeWidth={2} fill="transparent" dot={false} />
                                ))}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Error Analysis */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-4 flex items-center gap-2">
                        <AlertCircle size={16} className="text-red-500" /> Phân tích Tỷ lệ Lỗi
                    </p>
                    <div className="flex-1 flex flex-col items-center justify-center">
                        {errorStats.length > 0 ? (
                            <>
                                <div className="w-full h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={errorStats} innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                                                {errorStats.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-full space-y-2 mt-4">
                                    {errorStats.map((err) => (
                                        <div key={err.name} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: err.color }} />
                                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{err.name}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400">{err.value} lượt</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-10">
                                <CheckCircle2 className="mx-auto text-emerald-500 mb-2" size={32} />
                                <p className="text-[10px] font-bold text-slate-400 italic">Hệ thống đang hoạt động ổn định.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cost Timeline */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                        <Database size={16} className="text-emerald-500" /> Biểu đồ Chi phí tích lũy ($)
                    </p>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dailyCostData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                                <Tooltip cursor={{ fill: 'rgba(16,185,129,0.05)' }} />
                                <Bar dataKey="cost" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top 5 Users */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col">
                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-6 flex items-center gap-2">
                        <Users size={16} className="text-blue-500" /> Top 5 Tài khoản sử dụng nhiều
                    </p>
                    <div className="flex-1 space-y-3">
                        {userStats.map((u, i) => (
                            <div key={u.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black ${i === 0 ? 'bg-gold/20 text-gold' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                        }`}>
                                        {i + 1}
                                    </div>
                                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">{u.name}</span>
                                </div>
                                <span className="text-[10px] font-black text-blue-500 flex-shrink-0">{u.count} lượt</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
