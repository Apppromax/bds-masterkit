import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Activity, Loader2, CheckCircle2, ShieldAlert as ShieldCircle, Crown, User, Calendar, Power, Mail, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import ApiKeyManager from './ApiKeyManager';
import ApiUsageAnalytics from './ApiUsageAnalytics';
import AppSettings from './AppSettings';

interface UserProfile {
    id: string;
    full_name: string;
    email?: string;
    tier: 'free' | 'pro';
    role: 'user' | 'admin';
    created_at: string;
    phone?: string;
    agency?: string;
}

export default function AdminDashboard() {
    const { profile: adminProfile } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total_users: 0,
        total_projects: 0,
        pro_users: 0
    });

    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Fetch Profiles
            const { data: profiles, error: pError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (profiles) {
                setUsers(profiles as UserProfile[]);

                const proCount = profiles.filter(p => p.tier === 'pro').length;
                setStats(prev => ({
                    ...prev,
                    total_users: profiles.length,
                    pro_users: proCount
                }));
            }

            const { count: projectCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
            setStats(prev => ({ ...prev, total_projects: projectCount || 0 }));

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

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );

    return (
        <div className="p-6 pb-24 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 bg-clip-text text-transparent mb-2">
                    Admin Control Center
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" /> Hệ thống đang hoạt động ổn định. Chào sếp {adminProfile?.full_name}!
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng Người Dùng</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.total_users}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng Dự Án</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.total_projects}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl">
                        <Crown size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thành Viên PRO</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.pro_users}</p>
                    </div>
                </div>
            </div>

            {/* API Analytics Section - NEW */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 transition-all hover:shadow-xl hover:shadow-purple-500/5">
                <ApiUsageAnalytics />
            </div>

            {/* User Management Section */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                    <h2 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-3">
                        <Users className="text-blue-600" size={24} /> Quản lý Người Dùng
                    </h2>
                    <button
                        onClick={loadData}
                        className="text-xs font-bold bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all"
                    >
                        Làm mới danh sách
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thông tin</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Liên hệ</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày tham gia</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={`https://ui-avatars.com/api/?name=${user.full_name}&background=random&bold=true`}
                                                className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-700 shadow-sm"
                                            />
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{user.full_name || 'N/A'}</p>
                                                <p className="text-[10px] text-slate-400 font-bold">{user.id.substring(0, 13)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 truncate max-w-[200px]">
                                                <Mail size={12} className="text-slate-400" /> {user.email || 'No Email'}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                                                <Phone size={12} className="text-slate-400" /> {user.phone || 'Chưa cập nhật'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${user.tier === 'pro'
                                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                            }`}>
                                            {user.tier === 'pro' ? '★ PRO MEMBER' : 'FREE USER'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px]">
                                            <Calendar size={14} /> {formatDate(user.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <button
                                            onClick={() => toggleTier(user.id, user.tier)}
                                            disabled={isActionLoading === user.id}
                                            className={`p-2 rounded-xl transition-all ${user.tier === 'pro'
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                } disabled:opacity-50`}
                                            title={user.tier === 'pro' ? 'Hạ xuống Free' : 'Kích hoạt PRO'}
                                        >
                                            {isActionLoading === user.id ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                user.tier === 'pro' ? <Power size={18} /> : <Crown size={18} />
                                            )}
                                        </button>
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

            {/* AI Configuration Section - Advanced Pool Manager */}
            <ApiKeyManager />


            {/* System Status */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCircle size={150} />
                </div>
                <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                        <Activity className="text-blue-400" size={40} />
                    </div>
                    <h3 className="font-black text-2xl mb-3 tracking-tighter">HỆ THỐNG AN TOÀN</h3>
                    <p className="text-blue-200 text-sm font-medium mb-8">Dữ liệu người dùng và API Key được bảo mật bởi Supabase RLS Policy.</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Server Region</p>
                            <p className="font-black text-xs">Singapore</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Security Level</p>
                            <p className="font-black text-xs">A+ High</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
