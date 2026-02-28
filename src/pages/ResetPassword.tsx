import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Lock, AlertCircle, Loader2, CheckCircle2, Eye, EyeOff, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { Particles } from '../components/Particles';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
        };
        checkSession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp.');
            return;
        }

        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password
            });

            if (updateError) {
                setError(updateError.message);
                setLoading(false);
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError('Lỗi hệ thống: ' + (err.message || 'Không thể cập nhật mật khẩu.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden font-inter">
            <Particles />

            <div className="w-full max-w-md relative z-10 transition-all duration-500">
                <div className="bg-[#0f172a]/80 backdrop-blur-2xl rounded-[3rem] p-10 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden group">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-gold/50 to-transparent opacity-50"></div>

                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gold/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gold/10 transform -rotate-3 transition-transform group-hover:rotate-0 duration-700 shadow-2xl">
                            <Zap className="text-gold" size={32} fill="currentColor" />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-3">
                            Đặt Lại <span className="text-gold">Mật Khẩu</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3 opacity-60 italic text-center">Thiết lập bảo mật mới cho tài khoản của bạn</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-500/5 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in shake duration-500">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success ? (
                        <div className="text-center space-y-8 animate-in zoom-in-95 duration-500 py-4">
                            <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 text-green-400 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.1)] relative">
                                <CheckCircle2 size={40} strokeWidth={1} />
                                <div className="absolute inset-0 rounded-3xl bg-green-500/20 animate-ping opacity-20"></div>
                            </div>
                            <div className="space-y-3 px-2">
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Thành công!</h3>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide leading-relaxed">
                                    Mật khẩu đã được cập nhật an toàn.<br />Hệ thống đang chuyển hướng về trang đăng nhập...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Mật khẩu mới</label>
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

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Xác nhận mật khẩu</label>
                                <div className="relative group/input">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-gold transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-14 pr-14 py-5 rounded-[1.5rem] border border-white/5 bg-black/40 text-white placeholder:text-slate-700 focus:border-gold/40 focus:bg-black/60 outline-none transition-all font-bold text-sm tracking-widest shadow-inner"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group/btn w-full py-6 bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#aa771c] text-black font-black rounded-[1.5rem] shadow-[0_20px_40px_-10px_rgba(191,149,63,0.3)] hover:shadow-[0_25px_50px_-5px_rgba(191,149,63,0.4)] hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-[0.3em] text-[12px] mt-4 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 skew-x-[-20deg]"></div>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Đang cập nhật...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Xác nhận mật khẩu mới</span>
                                        <ArrowRight size={20} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-10 flex items-center justify-center gap-2 text-slate-700">
                    <ShieldCheck size={18} />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Secured with MasterKit Protocol</span>
                </div>
            </div>
        </div>
    );
}
