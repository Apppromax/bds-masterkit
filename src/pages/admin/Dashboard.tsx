import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Activity, Loader2, CheckCircle2, ShieldAlert as ShieldCircle, Crown, User, Calendar, Power, Mail, Phone, RotateCcw } from 'lucide-react';
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

export default function AdminDashboard() {
    const { profile: adminProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total_users: 0,
        pro_users: 0
    });

    const [activeTab, setActiveTab] = useState<'users' | 'api' | 'hooks'>('users');

    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Fetch Profiles
            const { data: profiles, error: pError } = await supabase
                .rpc('admin_get_all_profiles');

            if (profiles) {
                setUsers(profiles as UserProfile[]);

                const proCount = profiles.filter((p: any) => p.tier === 'pro').length;
                setStats(prev => ({
                    ...prev,
                    total_users: profiles.length,
                    pro_users: proCount
                }));
            }

        } catch (err) {
            console.error('Admin Load Error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const toggleTier = async (userId: string, currentTier: string) => {
        setIsActionLoading(userId);
        const newTier = currentTier === 'pro' ? 'free' : 'pro';

        const { error } = await supabase
            .from('profiles')
            .update({ tier: newTier })
            .eq('id', userId);

        if (error) {
            alert('Lỗi kích hoạt: ' + error.message);
        } else {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, tier: newTier as 'free' | 'pro' } : u));
            setStats(prev => ({
                ...prev,
                pro_users: prev.pro_users + (newTier === 'pro' ? 1 : -1)
            }));
        }
        setIsActionLoading(null);
    };

    const updateCredits = async (userId: string, currentCredits: number) => {
        const amountStr = window.prompt(`Nhập số Credits muốn thêm/bớt (Ví dụ: 100 hoặc -50). Hiện tại: ${currentCredits}`, "0");
        if (amountStr === null) return;

        const amount = parseInt(amountStr);
        if (isNaN(amount)) return alert('Vui lòng nhập số hợp lệ');

        setIsActionLoading(userId);
        const newCredits = currentCredits + amount;

        const { error } = await supabase
            .from('profiles')
            .update({ credits: newCredits })
            .eq('id', userId);

        if (error) {
            alert('Lỗi cập nhật credits: ' + error.message);
        } else {
            // Log the credit change
            await supabase.from('credit_logs').insert({
                user_id: userId,
                amount: amount,
                type: amount > 0 ? 'top-up' : 'usage',
                action: 'Admin Manual Update'
            });

            setUsers(prev => prev.map(u => u.id === userId ? { ...u, credits: newCredits } : u));
            alert('Đã cập nhật credits thành công!');
        }
        setIsActionLoading(null);
    };

    const handleResetPassword = async (email: string, userId: string) => {
        if (!email) return alert('Người dùng này không có email để reset.');
        if (!window.confirm(`Gửi email đặt lại mật khẩu cho ${email}?`)) return;

        setIsActionLoading(userId);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                alert('Lỗi gửi email reset: ' + error.message);
            } else {
                alert('Đã gửi email đặt lại mật khẩu thành công tới: ' + email);
            }
        } catch (err: any) {
            alert('Lỗi hệ thống: ' + err.message);
        } finally {
            setIsActionLoading(null);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="animate-spin text-gold" size={48} />
        </div>
    );

    return (
        <div className="p-4 pb-20 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 border-b border-white/5 pb-4">
                <div className="flex-1">
                    <h1 className="text-lg font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent italic tracking-tight">
                        ADMIN <span className="text-blue-500 uppercase">Center</span>
                    </h1>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] flex items-center gap-1.5 mt-0.5">
                        <CheckCircle2 size={10} className="text-green-500" /> Hệ thống ổn định • Sếp {adminProfile?.full_name}
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="flex flex-col items-end">
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Hôm nay</p>
                        <p className="text-[11px] font-black text-white">{new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white dark:bg-[#0a0a0b] p-2.5 rounded-lg shadow border border-slate-100 dark:border-white/5 flex items-center gap-2 group hover:border-blue-500/30 transition-all duration-500 overflow-hidden relative">
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-md transition-transform duration-500 relative z-10">
                        <Users size={14} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-0.5 font-inter">Khách hàng</p>
                        <p className="text-base font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">{stats.total_users}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#0a0a0b] p-2.5 rounded-lg shadow border border-slate-100 dark:border-white/5 flex items-center gap-2 group hover:border-amber-500/30 transition-all duration-500 overflow-hidden relative">
                    <div className="p-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 rounded-md transition-transform duration-500 relative z-10">
                        <Crown size={14} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-0.5 font-inter">Elite Pro</p>
                        <p className="text-base font-black text-slate-900 dark:text-white tracking-tighter italic leading-none">{stats.pro_users}</p>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit flex-wrap gap-1">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${activeTab === 'users' ? 'bg-white dark:bg-slate-900 shadow-sm text-gold' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Khách hàng & Cấu hình
                </button>
                <button
                    onClick={() => setActiveTab('hooks')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${activeTab === 'hooks' ? 'bg-white dark:bg-slate-900 shadow-sm text-amber-500' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Quản trị Hook
                </button>
                <button
                    onClick={() => setActiveTab('api')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${activeTab === 'api' ? 'bg-white dark:bg-slate-900 shadow-sm text-gold' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Giám sát AI
                </button>
            </div>

            {activeTab === 'users' ? (
                <div className="space-y-6">
                    {/* User Management Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                            <h2 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                <Users className="text-gold" size={14} /> Quản lý Người Dùng
                            </h2>
                            <button
                                onClick={loadData}
                                className="text-[8px] font-bold bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all"
                            >
                                Làm mới
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="px-3 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">Thông tin</th>
                                        <th className="px-3 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">Liên hệ</th>
                                        <th className="px-3 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">Gói</th>
                                        <th className="px-3 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Xu</th>
                                        <th className="px-3 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">Tham gia</th>
                                        <th className="px-3 py-2 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group border-b border-slate-50 dark:border-slate-800/50">
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    <img
                                                        src={`https://ui-avatars.com/api/?name=${user.full_name}&background=random&bold=true`}
                                                        className="w-6 h-6 rounded-lg border border-white dark:border-slate-700 shadow-sm"
                                                    />
                                                    <div>
                                                        <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-tight">{user.full_name || 'N/A'}</p>
                                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{user.id.substring(0, 8)}...</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="space-y-0.5">
                                                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 truncate max-w-[150px]">
                                                        <Mail size={10} className="text-slate-400" /> {user.email || 'No Email'}
                                                    </p>
                                                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                                        <Phone size={10} className="text-slate-400" /> {user.phone || '---'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${user.tier === 'pro'
                                                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}>
                                                    {user.tier === 'pro' ? '★ PRO' : 'FREE'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <button
                                                    onClick={() => updateCredits(user.id, user.credits)}
                                                    className="inline-flex flex-col items-center group/credit"
                                                >
                                                    <span className="text-[12px] font-black text-slate-900 dark:text-white group-hover/credit:text-gold transition-colors">{user.credits || 0}</span>
                                                    <span className="text-[9px] font-black text-slate-400 group-hover/credit:text-gold/60 uppercase tracking-tighter leading-none">Nạp</span>
                                                </button>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[11px]">
                                                    {formatDate(user.created_at).split(' ')[0]}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => toggleTier(user.id, user.tier)}
                                                        disabled={isActionLoading === user.id}
                                                        className={`p-1 rounded-md transition-all ${user.tier === 'pro'
                                                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                            } disabled:opacity-50`}
                                                        title={user.tier === 'pro' ? 'Hạ xuống Free' : 'Kích hoạt PRO'}
                                                    >
                                                        {isActionLoading === user.id ? (
                                                            <Loader2 size={12} className="animate-spin" />
                                                        ) : (
                                                            user.tier === 'pro' ? <Power size={12} /> : <Crown size={12} />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleResetPassword(user.email || '', user.id)}
                                                        disabled={isActionLoading === user.id}
                                                        className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                                                        title="Reset mật khẩu"
                                                    >
                                                        {isActionLoading === user.id ? (
                                                            <Loader2 size={12} className="animate-spin" />
                                                        ) : (
                                                            <RotateCcw size={12} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {users.length === 0 && (
                            <div className="p-20 text-center">
                                <User size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-bold">Chưa có người dùng nào trên hệ thống.</p>
                            </div>
                        )}
                    </div>

                    {/* App & Billing Configuration */}
                    <AppSettings />
                </div>
            ) : activeTab === 'hooks' ? (
                <div className="space-y-10 animate-fade-in">
                    <SalesHookManager />
                </div>
            ) : (
                <div className="space-y-10 animate-fade-in">
                    {/* API Analytics Section */}
                    <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-xl hover:shadow-gold/5">
                        <ApiUsageAnalytics />
                    </div>

                    {/* Model Pricing Configuration */}
                    <ModelPricing />

                    {/* API Logs Section */}
                    <ApiLogsTable />

                    {/* AI Configuration Section - Advanced Pool Manager */}
                    <ApiKeyManager />
                </div>
            )}

            {/* System Status */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-950 rounded-xl p-4 text-white relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <ShieldCircle size={60} />
                </div>
                <div className="relative z-10 text-center">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-2 backdrop-blur-md">
                        <Activity className="text-blue-400" size={20} />
                    </div>
                    <h3 className="font-black text-sm mb-0.5 tracking-tighter">HỆ THỐNG AN TOÀN</h3>
                    <p className="text-blue-200 text-[11px] font-medium mb-4">Dữ liệu được bảo mật bởi Supabase RLS Policy.</p>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-center">
                            <p className="text-[11px] font-black text-blue-300 uppercase tracking-widest mb-0.5">Region</p>
                            <p className="font-black text-[11px]">Singapore</p>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10 text-center">
                            <p className="text-[11px] font-black text-blue-300 uppercase tracking-widest mb-0.5">Security</p>
                            <p className="font-black text-[11px]">A+ High</p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
