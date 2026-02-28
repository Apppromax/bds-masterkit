import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { Particles } from '../components/Particles';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: loadingAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirect if already logged in
    useEffect(() => {
        if (user && !loadingAuth) {
            const from = (location.state as any)?.from?.pathname || '/';
            navigate(from, { replace: true });
        }
    }, [user, loadingAuth, navigate, location]);

    const handleReset = () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

            if (signInError) {
                let msg = signInError.message;
                if (msg === 'Invalid login credentials') msg = 'Sai email hoặc mật khẩu sếp ơi!';
                if (msg.includes('network')) msg = 'Lỗi kết nối mạng (ISP có thể đang chặn kết nối tới Server Supabase).';

                setError(msg);
                setLoading(false);
                return;
            }

            if (data?.user) {
                navigate('/', { replace: true });
            } else {
                setError('Không thể xác thực thông tin tài khoản.');
                setLoading(false);
            }
        } catch (err: any) {
            console.error('Login error:', err);
            setError('Lỗi hệ thống: ' + (err.message || 'Không thể kết nối tới máy chủ.'));
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden font-inter">
            <Particles />

            <div className="w-full max-w-md relative z-10 transition-all duration-500">
                <div className="bg-[#0f172a]/80 backdrop-blur-2xl rounded-[3rem] p-10 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-50"></div>

                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-gold/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-gold/10 transform -rotate-6 transition-transform group-hover:rotate-0 duration-700 shadow-2xl">
                            <Zap className="text-gold" size={40} fill="currentColor" />
                        </div>
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-3">
                            <span className="bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent">CHOTSALE</span> AI
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 opacity-60">Masterkit for Professionals</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-500/5 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in shake duration-500">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Hệ thống Gmail</label>
                            <div className="relative group/input">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-gold transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-14 pr-5 py-5 rounded-[1.5rem] border border-white/5 bg-black/40 text-white placeholder:text-slate-700 focus:border-gold/40 focus:bg-black/60 outline-none transition-all font-bold text-sm tracking-wide shadow-inner"
                                    placeholder="sếp@chotsale.ai"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Bảo mật</label>
                                <Link to="/forgot-password" virtual-link="true" className="text-[10px] font-black text-gold/40 hover:text-gold uppercase tracking-widest transition-colors">Quên mật khẩu?</Link>
                            </div>
                            <div className="relative group/input">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-gold transition-colors" size={20} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-14 py-5 rounded-[1.5rem] border border-white/5 bg-black/40 text-white placeholder:text-slate-700 focus:border-gold/40 focus:bg-black/60 outline-none transition-all font-bold text-sm tracking-widest shadow-inner"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-gold transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group/btn w-full py-6 bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#aa771c] text-black font-black rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(191,149,63,0.3)] hover:shadow-[0_25px_50px_-5px_rgba(191,149,63,0.4)] hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-[0.3em] text-[12px] relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 skew-x-[-20deg]"></div>
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Xác thực hệ thống...</span>
                                </>
                            ) : (
                                <>
                                    <span>Kích hoạt quyền truy cập</span>
                                    <ArrowRight size={20} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-white/5 text-center">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-5 italic">Chưa có mã định danh?</p>
                        <Link to="/signup" className="inline-flex items-center gap-3 text-[11px] font-black text-white hover:text-gold bg-white/5 px-8 py-3.5 rounded-2xl border border-white/10 transition-all uppercase tracking-widest hover:border-gold/30">
                            Đăng ký hội viên
                        </Link>
                    </div>

                    <div className="mt-8 flex flex-col items-center">
                        <button
                            onClick={handleReset}
                            className="text-[9px] font-black text-slate-700 hover:text-red-500/50 uppercase tracking-[0.2em] transition-colors"
                        >
                            Reset System Connection
                        </button>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-center gap-2 text-slate-700">
                    <ShieldCheck size={18} />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-50">MasterKit Protocol Verified</span>
                </div>
            </div>
        </div>
    );
}
