import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Crown, LogOut, Save, Camera, CheckCircle2, Phone, Building2, History, TrendingDown, TrendingUp, Sparkles, CreditCard, Image as ImageIcon, ArrowRight, Coins } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Profile() {
    const navigate = useNavigate();
    const { user, profile, signOut, refreshProfile, profileLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
    const [logs, setLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const [formData, setFormData] = useState({
        fullName: profile?.full_name || '',
        phone: profile?.phone || '',
        agency: profile?.agency || '',
        jobTitle: profile?.job_title || '',
        companyAddress: profile?.company_address || '',
        website: profile?.website || '',
        businessEmail: profile?.business_email || '',
        companyLogo: profile?.company_logo || ''
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (profile) {
            setFormData({
                fullName: profile.full_name || '',
                phone: profile.phone || '',
                agency: profile.agency || '',
                jobTitle: profile.job_title || '',
                companyAddress: profile.company_address || '',
                website: profile.website || '',
                businessEmail: profile.business_email || '',
                companyLogo: profile.company_logo || ''
            });
        }
    }, [profile]);

    useEffect(() => {
        if (activeTab === 'history' && user) {
            fetchLogs();
        }
    }, [activeTab, user]);

    const fetchLogs = async () => {
        setLoadingLogs(true);
        try {
            const { data, error } = await supabase
                .from('credit_logs')
                .select('*')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error('Lỗi tải lịch sử:', error);
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.fullName,
                    phone: formData.phone,
                    agency: formData.agency,
                    job_title: formData.jobTitle,
                    company_address: formData.companyAddress,
                    website: formData.website,
                    business_email: formData.businessEmail,
                    company_logo: formData.companyLogo,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
            await refreshProfile();
        } catch (error: any) {
            console.error('Update error:', error);
            setMessage({ type: 'error', text: 'Lỗi cập nhật: ' + (error.message || 'Không rõ nguyên nhân') });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-70px)] md:h-auto md:pb-0 flex flex-col overflow-hidden">
            {/* Compact Header: Avatar + Name + Credits + Tabs */}
            <div className="flex items-center justify-between gap-3 px-4 md:px-0 pt-3 pb-2 md:pt-4 md:pb-3 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0">
                        <img
                            src={`https://ui-avatars.com/api/?name=${profile?.full_name || user.email}&background=1a2332&color=d4af37&size=96&bold=true&font-size=0.33`}
                            alt="Avatar"
                            className="w-full h-full rounded-full border-2 border-gold/30 shadow-md object-cover"
                        />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-sm md:text-base font-black text-white truncate leading-tight">{profile?.full_name || 'Người dùng'}</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest leading-none ${profile?.tier === 'pro' ? 'bg-gold/10 text-gold border border-gold/20' : 'bg-white/5 text-slate-500 border border-white/10'}`}>
                                {profile?.tier === 'pro' ? 'PRO' : 'FREE'}
                            </span>
                            <div className="flex items-center gap-1 bg-black/40 px-2 py-0.5 rounded-md border border-white/5">
                                <Coins size={10} className="text-gold" />
                                <span className="text-[10px] font-black text-white">{profileLoading ? '...' : (profile?.credits ?? 0)}</span>
                                <span className="text-[7px] font-black text-gold/60 uppercase">Xu</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 bg-[#1a2332] p-1 rounded-xl border border-white/5 shrink-0">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 transition-all ${activeTab === 'profile' ? 'bg-gold text-black shadow-md' : 'text-slate-500 hover:text-white'}`}
                    >
                        <User size={12} /> Hồ sơ
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-3 py-1.5 rounded-lg font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 transition-all ${activeTab === 'history' ? 'bg-gold text-black shadow-md' : 'text-slate-500 hover:text-white'}`}
                    >
                        <History size={12} /> Xu
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4 md:gap-6 px-4 md:px-0 pb-2">
                {/* Desktop Sidebar - hidden on mobile */}
                <div className="hidden md:flex md:w-[260px] flex-col gap-4 shrink-0">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                        <div className="relative w-20 h-20 mx-auto mb-3">
                            <img
                                src={`https://ui-avatars.com/api/?name=${profile?.full_name || user.email}&background=1a2332&color=d4af37&size=128&bold=true&font-size=0.33`}
                                alt="Avatar"
                                className="w-full h-full rounded-full border-3 border-slate-50 dark:border-slate-800 shadow-lg object-cover"
                            />
                            <button className="absolute bottom-0 right-0 p-1.5 bg-gradient-to-r from-gold to-[#aa771c] text-black rounded-full border-3 border-white dark:border-slate-800 hover:scale-110 transition-all shadow-md">
                                <Camera size={12} />
                            </button>
                        </div>
                        <h2 className="font-black text-base text-slate-900 dark:text-white mb-0.5">{profile?.full_name || 'Người dùng'}</h2>
                        <p className="text-[10px] font-bold text-slate-400 mb-3 flex items-center justify-center gap-1">
                            <Mail size={10} /> {user.email}
                        </p>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest mb-3 ${profile?.tier === 'pro' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                            {profile?.tier === 'pro' ? <Crown size={12} className="animate-pulse" /> : <Shield size={12} />}
                            {profile?.tier === 'pro' ? 'PRO' : 'FREE'}
                        </div>
                        <div className="bg-gradient-to-br from-[#1a2332] to-[#0f172a] p-3 rounded-xl border border-white/10">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5 flex items-center justify-center gap-1">
                                <CreditCard size={10} className="text-gold" /> Số dư
                            </p>
                            <p className="text-2xl font-black text-white tracking-tighter">
                                {profileLoading ? <span className="inline-block w-10 h-6 bg-white/10 rounded animate-pulse" /> : (profile?.credits ?? 0)} <span className="text-[10px] text-gold uppercase tracking-widest relative -top-2">Xu</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="font-black text-slate-800 dark:text-white mb-3 flex items-center gap-1.5 uppercase text-[10px] tracking-widest">
                            <Shield size={14} className="text-gold" /> Bảo mật
                        </h3>
                        <div className="space-y-1.5">
                            <button className="w-full text-left text-[10px] font-bold py-2 px-3 rounded-lg border border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex justify-between items-center text-slate-600 dark:text-slate-400">
                                🔑 Đổi mật khẩu <CheckCircle2 size={12} className="text-green-500" />
                            </button>
                            <button className="w-full text-left text-[10px] font-bold py-2 px-3 rounded-lg border border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex justify-between items-center text-slate-600 dark:text-slate-400">
                                📱 Xác thực 2 lớp <span className="text-[8px] bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-slate-500">Tắt</span>
                            </button>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="w-full mt-4 py-2.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 transition-all border border-red-100 dark:border-red-500/10"
                        >
                            <LogOut size={14} /> ĐĂNG XUẤT
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {activeTab === 'profile' && (
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <h2 className="font-black text-sm md:text-base mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                                    🚀 Cấu Hình Thương Hiệu Sale
                                </h2>

                                {message && (
                                    <div className={`mb-3 p-2.5 rounded-xl text-[10px] font-bold flex items-center gap-2 animate-in fade-in ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                        <CheckCircle2 size={14} /> {message.text}
                                    </div>
                                )}

                                <form onSubmit={handleUpdateProfile} className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest ml-0.5">Họ và Tên</label>
                                            <div className="relative">
                                                <User size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full pl-8 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-gold/15 outline-none transition-all font-bold text-xs text-slate-900 dark:text-white"
                                                    placeholder="Nguyễn Văn A"
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest ml-0.5">SĐT (Zalo)</label>
                                            <div className="relative">
                                                <Phone size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    className="w-full pl-8 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-gold/15 outline-none transition-all font-bold text-xs text-slate-900 dark:text-white"
                                                    placeholder="09xx.xxx.xxx"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest ml-0.5">Chức vụ</label>
                                            <div className="relative">
                                                <Shield size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-8 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-gold/15 outline-none transition-all font-bold text-xs text-slate-900 dark:text-white"
                                                    placeholder="Chuyên viên KD"
                                                    value={formData.jobTitle}
                                                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest ml-0.5">Sàn / Công ty</label>
                                            <div className="relative">
                                                <Building2 size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-8 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-gold/15 outline-none transition-all font-bold text-xs text-slate-900 dark:text-white"
                                                    placeholder="CenLand, Đất Xanh..."
                                                    value={formData.agency}
                                                    onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest ml-0.5">Email công việc</label>
                                            <div className="relative">
                                                <Mail size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="email"
                                                    className="w-full pl-8 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-gold/15 outline-none transition-all font-bold text-xs text-slate-900 dark:text-white"
                                                    placeholder="your.email@company.com"
                                                    value={formData.businessEmail}
                                                    onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest ml-0.5">Địa chỉ công ty</label>
                                            <div className="relative">
                                                <Building2 size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-8 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-gold/15 outline-none transition-all font-bold text-xs text-slate-900 dark:text-white"
                                                    placeholder="Số 1 Nguyễn Trãi, Thanh Xuân, HN"
                                                    value={formData.companyAddress}
                                                    onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-[9px] font-black text-slate-400 mb-1 uppercase tracking-widest ml-0.5">Website / Facebook</label>
                                            <div className="relative">
                                                <Shield size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-8 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-gold/15 outline-none transition-all font-bold text-xs text-slate-900 dark:text-white"
                                                    placeholder="www.yourname.com"
                                                    value={formData.website}
                                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-[9px] text-slate-400 font-medium italic px-0.5">* Thông tin sẽ tự động hiển thị trên mẫu Name Card.</p>

                                    <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 md:flex-none px-8 py-3 bg-gradient-to-r from-gold to-[#aa771c] text-black font-black rounded-xl shadow-lg shadow-gold/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 uppercase tracking-widest text-[10px]"
                                        >
                                            <Save size={14} strokeWidth={3} /> {loading ? 'Đang lưu...' : 'LƯU'}
                                        </button>
                                        {/* Mobile-only: Sign out button */}
                                        <button
                                            type="button"
                                            onClick={() => signOut()}
                                            className="md:hidden px-4 py-3 bg-red-500/10 text-red-400 rounded-xl text-[10px] font-black flex items-center gap-1.5 border border-red-500/10 hover:bg-red-500/20 transition-all"
                                        >
                                            <LogOut size={14} /> Thoát
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* HISTORY TAB */}
                    {activeTab === 'history' && (
                        <div className="flex-1 bg-[#1a2332] border border-white/5 p-4 md:p-6 rounded-2xl shadow-2xl flex flex-col min-h-0 overflow-hidden">
                            <h2 className="font-black text-sm mb-3 text-white flex items-center gap-2 uppercase tracking-tighter italic shrink-0">
                                <History className="text-gold" size={18} strokeWidth={3} /> Biến động Xu
                            </h2>

                            {loadingLogs ? (
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <div className="w-10 h-10 border-3 border-gold/20 border-t-gold rounded-full animate-spin"></div>
                                    <p className="mt-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Đang tải...</p>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center">
                                    <Sparkles size={36} className="text-slate-600 mb-3" strokeWidth={1.5} />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Chưa có giao dịch nào.</p>
                                    <button
                                        onClick={() => navigate('/pricing')}
                                        className="mt-4 px-6 py-2.5 bg-gradient-to-r from-gold via-[#fcf6ba] to-gold rounded-full text-[9px] font-black text-black hover:scale-105 transition-all uppercase tracking-widest shadow-md inline-flex items-center gap-2"
                                    >
                                        Nạp Xu <ArrowRight size={12} strokeWidth={4} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto no-scrollbar">
                                    <div className="space-y-2">
                                        {logs.map((log) => (
                                            <div
                                                key={log.id}
                                                className="flex items-center justify-between p-3 bg-black/20 hover:bg-white/5 transition-colors border border-white/5 rounded-xl"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${log.amount > 0 ? 'bg-green-500/10 text-green-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                        {log.amount > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[11px] font-black text-white leading-tight">{log.action || 'Sử dụng AI'}</h4>
                                                        <p className="text-[9px] font-bold text-slate-500 mt-0.5">
                                                            {new Date(log.created_at).toLocaleString('vi-VN', {
                                                                hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-xs font-black ${log.amount > 0 ? 'text-green-400' : 'text-rose-400'}`}>
                                                        {log.amount > 0 ? '+' : ''}{log.amount}
                                                    </span>
                                                    <span className="text-[7px] uppercase tracking-widest text-slate-500 ml-0.5">Xu</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
