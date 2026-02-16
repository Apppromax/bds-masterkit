import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: loadingAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Redirect if already logged in
    useEffect(() => {
        if (user && !loadingAuth) {
            const from = (location.state as any)?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [user, loadingAuth, navigate, location]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            // timeout helper
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Kết nối server quá lâu. Vui lòng kiểm tra lại mạng hoặc refresh lại trang!')), 20000)
            );

            const { data, error: signInError } = await Promise.race([
                supabase.auth.signInWithPassword({ email, password }),
                timeout
            ]) as any;

            if (signInError) {
                setError(signInError.message);
                setLoading(false);
                return;
            }

            if (data?.user) {
                // Success - the useEffect above will handle redirection
                // but we can also navigate directly to be faster
                navigate('/', { replace: true });
            } else {
                setError('Không thể xác thực thông tin tài khoản.');
                setLoading(false);
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Lỗi kết nối server.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
            <div className="w-full max-w-sm">
                <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl shadow-blue-500/5 border border-slate-100 dark:border-slate-800">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                            Đăng Nhập
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">Chào mừng trở lại với MasterKit</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                                    placeholder="yourname@gmail.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mật khẩu</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-xs font-bold">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all" />
                                <span className="text-slate-500 group-hover:text-slate-700 transition-colors">Ghi nhớ</span>
                            </label>
                            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700">Quên mật khẩu?</Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:grayscale flex items-center justify-center gap-2"
                        >
                            {loading || loadingAuth ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>{loadingAuth && !loading ? 'ĐANG KIỂM TRA...' : 'ĐANG XỬ LÝ...'}</span>
                                </>
                            ) : (
                                'ĐĂNG NHẬP NGAY'
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Chưa có tài khoản?{' '}
                        <Link to="/signup" className="text-blue-600 hover:text-blue-800">
                            Đăng ký miễn phí
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
