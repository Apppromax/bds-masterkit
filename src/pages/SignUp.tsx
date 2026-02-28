import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User as UserIcon, AlertCircle, Loader2, ArrowLeft, Eye, EyeOff, ShieldCheck, ArrowRight, Zap } from 'lucide-react';
import { Particles } from '../components/Particles';

export default function SignUp() {
    const navigate = useNavigate();
    const { user, loading: loadingAuth } = useAuth();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Redirect if already logged in
    useEffect(() => {
        if (user && !loadingAuth) {
            navigate('/', { replace: true });
        }
    }, [user, loadingAuth, navigate]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: signUpError, data } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (signUpError) throw signUpError;

            // Success
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert([
                        {
                            id: data.user.id,
                            email: email,
                            full_name: fullName,
                            role: 'user',
                            tier: 'free',
                        },
                    ]);

                if (profileError) console.warn('Profile sync warning:', profileError.message);
            }

            alert('Đăng ký thành công! Vui lòng kiểm tra email (nếu có yêu cầu xác thực) hoặc đăng nhập ngay.');
            navigate('/login');
        } catch (err: any) {
            console.error('Signup error:', err);
            setError(err.message || 'Lỗi đăng ký tài khoản.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden font-inter">
            <Particles />

            <div className="w-full max-w-md relative z-10 transition-all duration-500">
                <div className="mb-6">
                    <Link to="/login" className="inline-flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-gold transition-colors uppercase tracking-[0.3em]">
                        <ArrowLeft size={16} /> Quay lại đăng nhập
                    </Link>
                </div>

                <div className="bg-[#0f172a]/80 backdrop-blur-2xl rounded-[3rem] p-10 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-50"></div>

                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gold/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gold/10 transform -rotate-3 transition-transform group-hover:rotate-0 duration-700">
                            <Zap className="text-gold" size={32} fill="currentColor" />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-3">
                            Tạo <span className="text-gold">Tài Khoản</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3 opacity-60 italic">Bắt đầu hành trình cùng MasterKit</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in shake duration-500">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSignUp} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Họ và Tên</label>
                            <div className="relative group/input">
                                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-gold transition-colors" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full pl-14 pr-5 py-4 rounded-[1.5rem] border border-white/5 bg-black/40 text-white placeholder:text-slate-700 focus:border-gold/40 focus:bg-black/60 outline-none transition-all font-bold text-sm tracking-wide"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Email</label>
                            <div className="relative group/input">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-gold transition-colors" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-14 pr-5 py-4 rounded-[1.5rem] border border-white/5 bg-black/40 text-white placeholder:text-slate-700 focus:border-gold/40 focus:bg-black/60 outline-none transition-all font-bold text-sm tracking-wide"
                                    placeholder="sếp@gmail.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Mật khẩu</label>
                            <div className="relative group/input">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-gold transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-14 pr-14 py-4 rounded-[1.5rem] border border-white/5 bg-black/40 text-white placeholder:text-slate-700 focus:border-gold/40 focus:bg-black/60 outline-none transition-all font-bold text-sm tracking-widest"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-gold transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Xác nhận</label>
                            <div className="relative group/input">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-gold transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-14 pr-14 py-4 rounded-[1.5rem] border border-white/5 bg-black/40 text-white placeholder:text-slate-700 focus:border-gold/40 focus:bg-black/60 outline-none transition-all font-bold text-sm tracking-widest"
                                    placeholder="Nhập lại mật khẩu"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || loadingAuth}
                            className="group/btn w-full py-5 bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#aa771c] text-black font-black rounded-[1.5rem] shadow-[0_15px_30px_-5px_rgba(191,149,63,0.3)] hover:shadow-[0_20px_40px_-5px_rgba(191,149,63,0.4)] hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-[0.3em] text-[11px] mt-4 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 skew-x-[-20deg]"></div>
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Đang thiết lập...</span>
                                </>
                            ) : (
                                <>
                                    <span>Tạo tài khoản hội viên</span>
                                    <ArrowRight size={18} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-6 border-t border-white/5 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Đã là hội viên?{' '}
                        <Link to="/login" className="text-gold hover:text-white transition-colors">
                            Đăng nhập ngay
                        </Link>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-slate-700">
                    <ShieldCheck size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Secured with MasterKit Protocol</span>
                </div>
            </div>
        </div>
    );
}
