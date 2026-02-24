import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Crown, LogOut, Save, Camera, CheckCircle2, Phone, Building2, History, TrendingDown, TrendingUp, Sparkles, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Profile() {
    const navigate = useNavigate();
    const { user, profile, signOut, refreshProfile } = useAuth();
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
        businessEmail: profile?.business_email || ''
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
                businessEmail: profile.business_email || ''
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
        <div className="max-w-4xl mx-auto pb-20 md:pb-0">
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                        <User className="text-blue-600" size={32} /> Cá Nhân
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-1">Quản lý thương hiệu và tài nguyên của bạn</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1 rounded-2xl flex items-center shadow-lg group">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-[0_5px_15px_rgba(37,99,235,0.3)]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <User size={16} /> Hồ sơ
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${activeTab === 'history' ? 'bg-gradient-to-r from-gold to-[#aa771c] text-black shadow-lg shadow-gold/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <History size={16} /> Lịch sử Credits
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Fixed Profile Card Area */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                        <div className="relative w-28 h-28 mx-auto mb-6">
                            <img
                                src={`https://ui-avatars.com/api/?name=${profile?.full_name || user.email}&background=random&size=128&bold=true&font-size=0.33`}
                                alt="Avatar"
                                className="w-full h-full rounded-full border-4 border-slate-50 dark:border-slate-800 shadow-xl object-cover"
                            />
                            <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full border-4 border-white dark:border-slate-800 hover:scale-110 transition-all shadow-lg text-xs">
                                <Camera size={16} />
                            </button>
                        </div>
                        <h2 className="font-black text-xl text-slate-900 dark:text-white mb-1">{profile?.full_name || 'Người dùng'}</h2>
                        <p className="text-xs font-bold text-slate-400 mb-6 flex items-center justify-center gap-1">
                            <Mail size={12} /> {user.email}
                        </p>

                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-widest mb-4 ${profile?.tier === 'pro'
                            ? 'bg-amber-100 text-amber-700 border border-amber-200 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                            }`}>
                            {profile?.tier === 'pro' ? <Crown size={14} className="animate-pulse" /> : <Shield size={14} />}
                            {profile?.tier === 'pro' ? 'HỘI VIÊN PRO' : 'MEMBER FREE'}
                        </div>

                        {/* Credits Balance display */}
                        <div className="bg-gradient-to-br from-[#1a2332] to-[#0f172a] p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 opacity-10 blur-xl w-20 h-20 bg-gold rounded-full transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 relative z-10 flex items-center justify-center gap-1">
                                <CreditCard size={12} className="text-gold" /> Số dư hiện tại
                            </p>
                            <p className="text-3xl font-black text-white relative z-10 tracking-tighter">
                                {profile?.credits || 0} <span className="text-xs text-gold uppercase tracking-widest relative -top-3 left-1">CR</span>
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                            <Shield size={18} className="text-blue-500" /> Bảo mật
                        </h3>
                        <div className="space-y-2">
                            <button className="w-full text-left text-xs font-bold py-3 px-4 rounded-xl border border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex justify-between items-center text-slate-600 dark:text-slate-400">
                                🔑 Đổi mật khẩu <CheckCircle2 size={16} className="text-green-500" />
                            </button>
                            <button className="w-full text-left text-xs font-bold py-3 px-4 rounded-xl border border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex justify-between items-center text-slate-600 dark:text-slate-400">
                                📱 Xác thực 2 lớp <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-lg text-slate-500">Tắt</span>
                            </button>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="w-full mt-6 py-3.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all border border-red-100 dark:border-red-500/10"
                        >
                            <LogOut size={16} /> ĐĂNG XUẤT
                        </button>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <h2 className="font-black text-xl mb-8 text-slate-800 dark:text-white flex items-center gap-2">
                                    🚀 Cấu Hình Thương Hiệu Sale
                                </h2>

                                {message && (
                                    <div className={`mb-8 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                        }`}>
                                        <CheckCircle2 size={20} /> {message.text}
                                    </div>
                                )}

                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">Họ và Tên</label>
                                            <div className="relative">
                                                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full pl-11 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                                    placeholder="Nguyễn Văn A"
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">Số điện thoại (Zalo)</label>
                                            <div className="relative">
                                                <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="tel"
                                                    className="w-full pl-11 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                                    placeholder="09xx.xxx.xxx"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">Chức vụ</label>
                                            <div className="relative">
                                                <Shield size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-11 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                                    placeholder="VD: Chuyên viên kinh doanh"
                                                    value={formData.jobTitle}
                                                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">Sàn Bất Động Sản / Công ty</label>
                                            <div className="relative">
                                                <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-11 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                                    placeholder="VD: CenLand, Đất Xanh, Tự do..."
                                                    value={formData.agency}
                                                    onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">Email công việc</label>
                                            <div className="relative">
                                                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="email"
                                                    className="w-full pl-11 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                                    placeholder="your.email@company.com"
                                                    value={formData.businessEmail}
                                                    onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">Địa chỉ công ty</label>
                                            <div className="relative">
                                                <Save size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-11 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                                    placeholder="Số 1 Nguyễn Trãi, Thanh Xuân, Hà Nội"
                                                    value={formData.companyAddress}
                                                    onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">Website / Facebook</label>
                                            <div className="relative">
                                                <Shield size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-11 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                                    placeholder="www.yourname.com"
                                                    value={formData.website}
                                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-2 font-medium italic">* Các thông tin này sẽ được tự động hiển thị trên mẫu Name Card của sếp.</p>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full md:w-auto px-10 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 uppercase tracking-widest text-[10px]"
                                        >
                                            <Save size={16} strokeWidth={3} /> {loading ? 'Đang lưu...' : 'LƯU THƯƠNG HIỆU'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Pro Benefits */}
                            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[32px] p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Crown size={120} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-amber-500 rounded-2xl shadow-lg shadow-amber-500/20">
                                            <Crown size={24} className="text-white" />
                                        </div>
                                        <h3 className="text-2xl font-black">Lợi ích đặc quyền PRO</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                        {[
                                            'Tùy chỉnh Watermark theo tên/SĐT sếp',
                                            'AI tạo ảnh 4K không giới hạn',
                                            'Mở khóa 100+ kịch bản Sales ngách',
                                            'Ưu tiên hỗ trợ 1-1 từ MasterKit Team'
                                        ].map((benefit, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm font-bold text-slate-300">
                                                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-[10px]">✓</div>
                                                {benefit}
                                            </div>
                                        ))}
                                    </div>

                                    {profile?.tier !== 'pro' && (
                                        <button
                                            onClick={() => navigate('/pricing')}
                                            className="w-full py-4 bg-amber-400 text-slate-900 font-black rounded-2xl hover:bg-amber-300 transition-colors shadow-xl uppercase tracking-wider text-[11px]"
                                        >
                                            NÂNG CẤP LÊN PRO NGAY
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* HISTORY TAB */}
                    {activeTab === 'history' && (
                        <div className="bg-[#1a2332] border border-white/5 p-6 md:p-8 rounded-[2rem] shadow-2xl animate-in fade-in zoom-in-95 duration-300 min-h-[500px] flex flex-col">
                            <h2 className="font-black text-xl mb-6 text-white flex items-center gap-3 uppercase tracking-tighter italic">
                                <History className="text-gold" size={24} strokeWidth={3} /> Biến động Credits
                            </h2>

                            {loadingLogs ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-20">
                                    <div className="w-12 h-12 border-4 border-gold/20 border-t-gold rounded-full animate-spin"></div>
                                    <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Đang tải dữ liệu...</p>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center py-20">
                                    <Sparkles size={48} className="text-slate-600 mb-4" strokeWidth={1.5} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chưa có giao dịch nào phát sinh.</p>
                                    <button
                                        onClick={() => navigate('/pricing')}
                                        className="mt-6 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-gold hover:bg-gold/10 transition-colors uppercase tracking-widest"
                                    >
                                        Nạp thêm Credits
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                                    <div className="space-y-3">
                                        {logs.map((log) => (
                                            <div
                                                key={log.id}
                                                className="flex items-center justify-between p-4 bg-black/20 hover:bg-white/5 transition-colors border border-white/5 rounded-2xl"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${log.amount > 0 ? 'bg-green-500/10 text-green-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                        {log.amount > 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xs md:text-sm font-black text-white">{log.action || 'Sử dụng AI'}</h4>
                                                        <p className="text-[10px] font-bold text-slate-500 mt-0.5 tracking-wider">
                                                            {new Date(log.created_at).toLocaleString('vi-VN', {
                                                                hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <span className={`text-sm md:text-base font-black ${log.amount > 0 ? 'text-green-400' : 'text-rose-400'}`}>
                                                        {log.amount > 0 ? '+' : ''}{log.amount}
                                                    </span>
                                                    <span className="text-[8px] uppercase tracking-widest text-slate-500 ml-1">CR</span>
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
