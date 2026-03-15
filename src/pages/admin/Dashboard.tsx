import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
    Users, Activity, Loader2, CheckCircle2, Crown, User, Mail, Phone,
    RotateCcw, Power, Coins, TrendingUp, TrendingDown, BarChart3,
    Settings, Bot, Anchor, Calendar, Search, ChevronDown, ArrowUpRight,
    DollarSign, Zap, Eye, Clock, Filter
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import ApiKeyManager from './ApiKeyManager';
import ApiUsageAnalytics from './ApiUsageAnalytics';
import AppSettings from './AppSettings';
import ApiLogsTable from './ApiLogsTable';
import ModelPricing from './ModelPricing';
import SalesHookManager from './SalesHookManager';

interface UserProfile {
    id: string;
    full_name: string;
    email?: string;
    tier: 'free' | 'pro';
    role: 'user' | 'admin';
    credits: number;
    created_at: string;
    phone?: string;
    agency?: string;
}

interface CreditLog {
    id: string;
    user_id: string;
    amount: number;
    type: string;
    action: string;
    created_at: string;
    profiles?: { full_name: string; email: string };
}

type TabKey = 'overview' | 'users' | 'credits' | 'settings' | 'ai' | 'hooks';

const TABS: { key: TabKey; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'overview', label: 'Tổng quan', icon: <BarChart3 size={14} />, color: 'text-blue-500' },
    { key: 'users', label: 'Người dùng', icon: <Users size={14} />, color: 'text-emerald-500' },
    { key: 'credits', label: 'Xu & Doanh thu', icon: <Coins size={14} />, color: 'text-amber-500' },
    { key: 'settings', label: 'Cấu hình', icon: <Settings size={14} />, color: 'text-slate-400' },
    { key: 'ai', label: 'AI & API', icon: <Bot size={14} />, color: 'text-cyan-500' },
    { key: 'hooks', label: 'Sales Hooks', icon: <Anchor size={14} />, color: 'text-rose-500' },
];

export default function AdminDashboard() {
    const { profile: adminProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [creditLogs, setCreditLogs] = useState<CreditLog[]>([]);
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
    const [userSearch, setUserSearch] = useState('');
    const [creditFilter, setCreditFilter] = useState<'all' | 'top-up' | 'usage' | 'bonus'>('all');
    const [apiCostToday, setApiCostToday] = useState(0);
    const [apiCostMonth, setApiCostMonth] = useState(0);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Fetch users
            const { data: profiles } = await supabase.rpc('admin_get_all_profiles');
            if (profiles) setUsers(profiles as UserProfile[]);

            // Fetch credit logs (last 200)
            const { data: logs } = await supabase
                .from('credit_logs')
                .select('*, profiles(full_name, email)')
                .order('created_at', { ascending: false })
                .limit(200);
            if (logs) setCreditLogs(logs as CreditLog[]);

            // Fetch API costs
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const monthStart = new Date();
            monthStart.setDate(1);
            monthStart.setHours(0, 0, 0, 0);

            const { data: todayCosts } = await supabase
                .from('api_logs')
                .select('estimated_cost')
                .gte('created_at', todayStart.toISOString());
            if (todayCosts) setApiCostToday(todayCosts.reduce((s, r) => s + (r.estimated_cost || 0), 0));

            const { data: monthCosts } = await supabase
                .from('api_logs')
                .select('estimated_cost')
                .gte('created_at', monthStart.toISOString());
            if (monthCosts) setApiCostMonth(monthCosts.reduce((s, r) => s + (r.estimated_cost || 0), 0));

        } catch (err) {
            console.error('Admin Load Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // Computed stats
    const stats = useMemo(() => {
        const totalUsers = users.length;
        const proUsers = users.filter(u => u.tier === 'pro').length;
        const totalCreditsInSystem = users.reduce((s, u) => s + (u.credits || 0), 0);

        const totalTopUp = creditLogs.filter(l => l.type === 'top-up').reduce((s, l) => s + Math.abs(l.amount), 0);
        const totalUsage = creditLogs.filter(l => l.amount < 0).reduce((s, l) => s + Math.abs(l.amount), 0);
        const totalBonus = creditLogs.filter(l => l.type === 'bonus').reduce((s, l) => s + l.amount, 0);

        // Today's activity
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayLogs = creditLogs.filter(l => new Date(l.created_at) >= todayStart);
        const todayUsage = todayLogs.filter(l => l.amount < 0).reduce((s, l) => s + Math.abs(l.amount), 0);
        const todayTopUp = todayLogs.filter(l => l.type === 'top-up').reduce((s, l) => s + l.amount, 0);

        return { totalUsers, proUsers, totalCreditsInSystem, totalTopUp, totalUsage, totalBonus, todayUsage, todayTopUp };
    }, [users, creditLogs]);

    // User management functions
    const toggleTier = async (userId: string, currentTier: string) => {
        setIsActionLoading(userId);
        const newTier = currentTier === 'pro' ? 'free' : 'pro';
        const { error } = await supabase.from('profiles').update({ tier: newTier }).eq('id', userId);
        if (error) { alert('Lỗi: ' + error.message); }
        else { setUsers(prev => prev.map(u => u.id === userId ? { ...u, tier: newTier as 'free' | 'pro' } : u)); }
        setIsActionLoading(null);
    };

    const updateCredits = async (userId: string, currentCredits: number) => {
        const amountStr = window.prompt(`Nhập số Xu thêm/bớt (VD: 100 hoặc -50). Hiện tại: ${currentCredits}`, "0");
        if (amountStr === null) return;
        const amount = parseInt(amountStr);
        if (isNaN(amount)) return alert('Số không hợp lệ');

        setIsActionLoading(userId);
        const { error } = await supabase.from('profiles').update({ credits: currentCredits + amount }).eq('id', userId);
        if (error) { alert('Lỗi: ' + error.message); }
        else {
            await supabase.from('credit_logs').insert({ user_id: userId, amount, type: amount > 0 ? 'top-up' : 'usage', action: 'Admin cập nhật' });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, credits: currentCredits + amount } : u));
        }
        setIsActionLoading(null);
    };

    const handleResetPassword = async (email: string, userId: string) => {
        if (!email) return alert('User không có email');
        if (!window.confirm(`Gửi email reset mật khẩu cho ${email}?`)) return;
        setIsActionLoading(userId);
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) alert('Lỗi: ' + error.message);
        else alert('Đã gửi email reset thành công!');
        setIsActionLoading(null);
    };

    const fmt = (d: string) => new Date(d).toLocaleDateString('vi-VN');
    const fmtFull = (d: string) => {
        const date = new Date(d);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const filteredUsers = useMemo(() => {
        if (!userSearch) return users;
        const q = userSearch.toLowerCase();
        return users.filter(u => u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone?.includes(q));
    }, [users, userSearch]);

    const filteredLogs = useMemo(() => {
        if (creditFilter === 'all') return creditLogs;
        if (creditFilter === 'top-up') return creditLogs.filter(l => l.type === 'top-up');
        if (creditFilter === 'usage') return creditLogs.filter(l => l.amount < 0);
        if (creditFilter === 'bonus') return creditLogs.filter(l => l.type === 'bonus');
        return creditLogs;
    }, [creditLogs, creditFilter]);

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="animate-spin text-gold" size={48} />
        </div>
    );

    // ═══════════════════ STAT CARD COMPONENT ═══════════════════
    const StatCard = ({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string }) => (
        <div className="bg-[#0f1419] p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg bg-white/5 ${color}`}>{icon}</div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-xl font-black text-white tracking-tight">{value}</p>
            {sub && <p className="text-[10px] text-slate-500 font-bold mt-0.5">{sub}</p>}
        </div>
    );

    return (
        <div className="p-3 md:p-6 pb-24 max-w-7xl mx-auto space-y-4 md:space-y-6">
            {/* ═══════════ HEADER ═══════════ */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-black text-white tracking-tight">
                        ADMIN <span className="text-gold">CENTER</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                        <CheckCircle2 size={10} className="text-emerald-500" /> Online • {adminProfile?.full_name}
                    </p>
                </div>
                <button onClick={loadData} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-gold hover:border-gold/30 transition-all" title="Làm mới">
                    <RotateCcw size={16} />
                </button>
            </div>

            {/* ═══════════ TAB NAVIGATION (Scrollable on mobile) ═══════════ */}
            <div className="overflow-x-auto no-scrollbar -mx-3 px-3 md:mx-0 md:px-0">
                <div className="flex bg-[#0a0e13] p-1 rounded-2xl border border-white/5 w-max md:w-full gap-0.5">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                activeTab === tab.key
                                    ? 'bg-white/10 text-white shadow-lg'
                                    : 'text-slate-600 hover:text-slate-300'
                            }`}
                        >
                            <span className={activeTab === tab.key ? tab.color : ''}>{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══════════ TAB CONTENT ═══════════ */}

            {/* ─────── TAB: TỔNG QUAN ─────── */}
            {activeTab === 'overview' && (
                <div className="space-y-4 animate-fade-in">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard icon={<Users size={14} />} label="Người dùng" value={stats.totalUsers} sub={`${stats.proUsers} Pro`} color="text-blue-400" />
                        <StatCard icon={<TrendingUp size={14} />} label="Xu đã nạp" value={stats.totalTopUp} sub="Tổng cộng" color="text-emerald-400" />
                        <StatCard icon={<TrendingDown size={14} />} label="Xu đã dùng" value={stats.totalUsage} sub="Tổng cộng" color="text-rose-400" />
                        <StatCard icon={<Coins size={14} />} label="Xu trong hệ thống" value={stats.totalCreditsInSystem} sub={`Bonus: ${stats.totalBonus}`} color="text-amber-400" />
                    </div>

                    {/* Today + API Cost */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard icon={<Zap size={14} />} label="Hôm nay nạp" value={stats.todayTopUp + ' Xu'} color="text-emerald-400" />
                        <StatCard icon={<Activity size={14} />} label="Hôm nay dùng" value={stats.todayUsage + ' Xu'} color="text-rose-400" />
                        <StatCard icon={<DollarSign size={14} />} label="Chi phí API hôm nay" value={'$' + apiCostToday.toFixed(4)} color="text-cyan-400" />
                        <StatCard icon={<DollarSign size={14} />} label="Chi phí API tháng" value={'$' + apiCostMonth.toFixed(4)} color="text-orange-400" />
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-[#0f1419] rounded-2xl border border-white/5 overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Clock size={12} className="text-gold" /> Hoạt động gần nhất
                            </h2>
                        </div>
                        <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto">
                            {creditLogs.slice(0, 20).map(log => (
                                <div key={log.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                            log.amount > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                        }`}>
                                            {log.amount > 0 ? <ArrowUpRight size={14} /> : <TrendingDown size={14} />}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-bold text-white truncate">{(log.profiles as any)?.full_name || 'N/A'}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{log.action}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-3">
                                        <p className={`text-[12px] font-black ${log.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {log.amount > 0 ? '+' : ''}{log.amount} Xu
                                        </p>
                                        <p className="text-[9px] text-slate-600">{fmtFull(log.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ─────── TAB: NGƯỜI DÙNG ─────── */}
            {activeTab === 'users' && (
                <div className="space-y-4 animate-fade-in">
                    {/* Search */}
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên, email, SĐT..."
                            value={userSearch}
                            onChange={e => setUserSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-[#0f1419] border border-white/10 rounded-xl text-[11px] text-white placeholder:text-slate-600 focus:border-gold/30 focus:outline-none transition-colors"
                        />
                    </div>

                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{filteredUsers.length} người dùng</p>

                    {/* User Cards (Mobile-first) */}
                    <div className="space-y-2 md:hidden">
                        {filteredUsers.map(user => (
                            <div key={user.id} className="bg-[#0f1419] rounded-2xl border border-white/5 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <img src={`https://ui-avatars.com/api/?name=${user.full_name}&background=random&bold=true&size=32`} className="w-8 h-8 rounded-lg border border-white/10" />
                                        <div>
                                            <p className="text-[12px] font-black text-white">{user.full_name || 'N/A'}</p>
                                            <p className="text-[10px] text-slate-500">{user.email || 'No email'}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${user.tier === 'pro' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-500'}`}>
                                        {user.tier === 'pro' ? '★ PRO' : 'FREE'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <div className="flex items-center gap-3">
                                        <span className="text-slate-500"><Phone size={10} className="inline mr-1" />{user.phone || '---'}</span>
                                        <span className="text-slate-500"><Calendar size={10} className="inline mr-1" />{fmt(user.created_at)}</span>
                                    </div>
                                    <button onClick={() => updateCredits(user.id, user.credits)} className="font-black text-gold">
                                        {user.credits || 0} Xu
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => toggleTier(user.id, user.tier)} disabled={isActionLoading === user.id}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${user.tier === 'pro' ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                        {isActionLoading === user.id ? <Loader2 size={12} className="animate-spin mx-auto" /> : (user.tier === 'pro' ? 'Hạ Free' : 'Nâng Pro')}
                                    </button>
                                    <button onClick={() => handleResetPassword(user.email || '', user.id)} disabled={isActionLoading === user.id}
                                        className="px-4 py-2 rounded-xl bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                        Reset PW
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* User Table (Desktop) */}
                    <div className="hidden md:block bg-[#0f1419] rounded-2xl border border-white/5 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-white/5">
                                    <tr>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Thông tin</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Liên hệ</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Gói</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Xu</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tham gia</th>
                                        <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <img src={`https://ui-avatars.com/api/?name=${user.full_name}&background=random&bold=true`} className="w-7 h-7 rounded-lg border border-white/10" />
                                                    <div>
                                                        <p className="text-[11px] font-black text-white">{user.full_name || 'N/A'}</p>
                                                        <p className="text-[9px] text-slate-500">{user.id.substring(0, 8)}...</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-[11px] text-slate-300 truncate max-w-[180px]"><Mail size={10} className="inline mr-1 text-slate-500" />{user.email || '---'}</p>
                                                <p className="text-[10px] text-slate-500"><Phone size={10} className="inline mr-1" />{user.phone || '---'}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${user.tier === 'pro' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-500'}`}>
                                                    {user.tier === 'pro' ? '★ PRO' : 'FREE'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => updateCredits(user.id, user.credits)} className="font-black text-[12px] text-white hover:text-gold transition-colors">
                                                    {user.credits || 0}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-[11px] text-slate-500">{fmt(user.created_at)}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button onClick={() => toggleTier(user.id, user.tier)} disabled={isActionLoading === user.id}
                                                        className={`p-1.5 rounded-lg transition-all ${user.tier === 'pro' ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                                                        title={user.tier === 'pro' ? 'Hạ Free' : 'Nâng Pro'}>
                                                        {isActionLoading === user.id ? <Loader2 size={12} className="animate-spin" /> : (user.tier === 'pro' ? <Power size={12} /> : <Crown size={12} />)}
                                                    </button>
                                                    <button onClick={() => handleResetPassword(user.email || '', user.id)} disabled={isActionLoading === user.id}
                                                        className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 transition-all" title="Reset mật khẩu">
                                                        {isActionLoading === user.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ─────── TAB: XU & DOANH THU ─────── */}
            {activeTab === 'credits' && (
                <div className="space-y-4 animate-fade-in">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <StatCard icon={<TrendingUp size={14} />} label="Tổng nạp" value={stats.totalTopUp + ' Xu'} color="text-emerald-400" />
                        <StatCard icon={<TrendingDown size={14} />} label="Tổng dùng" value={stats.totalUsage + ' Xu'} color="text-rose-400" />
                        <StatCard icon={<Coins size={14} />} label="Bonus tặng" value={stats.totalBonus + ' Xu'} color="text-amber-400" />
                        <StatCard icon={<DollarSign size={14} />} label="Chi phí API tháng" value={'$' + apiCostMonth.toFixed(4)} color="text-cyan-400" />
                    </div>

                    {/* Filter */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {(['all', 'top-up', 'usage', 'bonus'] as const).map(f => (
                            <button key={f} onClick={() => setCreditFilter(f)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                                    creditFilter === f ? 'bg-gold/20 text-gold border border-gold/30' : 'bg-white/5 text-slate-500 border border-white/5 hover:text-white'
                                }`}>
                                <Filter size={10} className="inline mr-1" />
                                {f === 'all' ? 'Tất cả' : f === 'top-up' ? 'Nạp Xu' : f === 'usage' ? 'Sử dụng' : 'Bonus'}
                            </button>
                        ))}
                    </div>

                    {/* Credit Logs Table */}
                    <div className="bg-[#0f1419] rounded-2xl border border-white/5 overflow-hidden">
                        <div className="px-4 py-3 border-b border-white/5">
                            <h2 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Eye size={12} className="text-gold" /> Lịch sử giao dịch Xu ({filteredLogs.length})
                            </h2>
                        </div>

                        {/* Mobile: Card view */}
                        <div className="md:hidden divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                            {filteredLogs.map(log => (
                                <div key={log.id} className="px-4 py-3 flex items-center justify-between">
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-white truncate">{(log.profiles as any)?.full_name || 'N/A'}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{log.action}</p>
                                        <p className="text-[9px] text-slate-600">{fmtFull(log.created_at)}</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-3">
                                        <p className={`text-[12px] font-black ${log.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {log.amount > 0 ? '+' : ''}{log.amount}
                                        </p>
                                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                                            log.type === 'top-up' ? 'bg-emerald-500/20 text-emerald-400' : log.type === 'bonus' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                                        }`}>{log.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop: Table view */}
                        <div className="hidden md:block overflow-x-auto max-h-[500px] overflow-y-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-white/5 sticky top-0 bg-[#0f1419]">
                                    <tr>
                                        <th className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Thời gian</th>
                                        <th className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Người dùng</th>
                                        <th className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Hành động</th>
                                        <th className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Loại</th>
                                        <th className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Số Xu</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-2 text-[10px] text-slate-500 whitespace-nowrap">{fmtFull(log.created_at)}</td>
                                            <td className="px-4 py-2 text-[11px] font-bold text-white">{(log.profiles as any)?.full_name || 'N/A'}</td>
                                            <td className="px-4 py-2 text-[11px] text-slate-400 max-w-[200px] truncate">{log.action}</td>
                                            <td className="px-4 py-2">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                                                    log.type === 'top-up' ? 'bg-emerald-500/20 text-emerald-400' : log.type === 'bonus' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                                                }`}>{log.type}</span>
                                            </td>
                                            <td className={`px-4 py-2 text-right text-[12px] font-black ${log.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {log.amount > 0 ? '+' : ''}{log.amount}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ─────── TAB: CẤU HÌNH ─────── */}
            {activeTab === 'settings' && (
                <div className="space-y-6 animate-fade-in">
                    <AppSettings />
                    <ModelPricing />
                </div>
            )}

            {/* ─────── TAB: AI & API ─────── */}
            {activeTab === 'ai' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-[#0f1419] rounded-2xl p-4 md:p-6 border border-white/5">
                        <ApiUsageAnalytics />
                    </div>
                    <ApiLogsTable />
                    <ApiKeyManager />
                </div>
            )}

            {/* ─────── TAB: SALES HOOKS ─────── */}
            {activeTab === 'hooks' && (
                <div className="space-y-6 animate-fade-in">
                    <SalesHookManager />
                </div>
            )}
        </div>
    );
}
