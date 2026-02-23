import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) {
                setError(resetError.message === 'User not found' ? 'Không tìm thấy tài khoản với email này.' : resetError.message);
                setLoading(false);
                return;
            }

            setSuccess(true);
        } catch (err: any) {
            setError('Lỗi hệ thống: ' + (err.message || 'Không thể gửi yêu cầu.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-sm">
                <Link to="/login" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-6 transition-colors group">
                    <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
                    <span>Quay lại đăng nhập</span>
                </Link>

                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl shadow-blue-500/5 border border-slate-100 dark:border-slate-800">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                            Quên Mật Khẩu
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">Đừng lo, chúng tôi sẽ giúp bạn lấy lại quyền truy cập.</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success ? (
                        <div className="text-center space-y-6">
                            <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-2xl flex items-center justify-center mx-auto">
                                <CheckCircle2 size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">Email đã được gửi!</h3>
                                <p className="text-sm text-slate-500 font-medium">
                                    Vui lòng kiểm tra hộp thư đến của <b>{email}</b> và làm theo hướng dẫn để đặt lại mật khẩu.
                                </p>
                            </div>
                            <button
                                onClick={() => setSuccess(false)}
                                className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-black rounded-2xl hover:bg-slate-200 transition-all"
                            >
                                THỬ EMAIL KHÁC
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Nhập Email của bạn</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                                        placeholder="yourname@gmail.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:grayscale flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>ĐANG GỬI...</span>
                                    </>
                                ) : (
                                    'GỬI LINK ĐẶT LẠI MẬT KHẨU'
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
