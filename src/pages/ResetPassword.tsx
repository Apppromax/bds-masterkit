import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Lock, AlertCircle, Loader2, CheckCircle2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
            <Particles />

            <div className="w-full max-w-sm relative z-10">
                <div className="bg-[#1a2332] rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gold/20 transform rotate-3">
                            <Lock className="text-gold" size={32} strokeWidth={1.5} />
                        </div>
                        <h1 className="text-2xl font-black bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent uppercase italic tracking-tighter">
                            Đặt Lại Mật Khẩu
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Thiết lập bảo mật mới của bạn</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in shake duration-500">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success ? (
                        <div className="text-center space-y-6 py-4 animate-in fade-in duration-500">
                            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto border border-green-500/20 relative">
                                <CheckCircle2 size={40} />
                                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping opacity-20"></div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Thành công!</h3>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-relaxed">
                                    Mật khẩu đã được cập nhật.<br />Đang chuyển hướng về trang đăng nhập...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Mật khẩu mới</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 rounded-2xl border border-white/5 bg-black/20 text-white placeholder:text-slate-600 focus:border-gold/50 outline-none transition-all font-bold text-sm tracking-widest"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-gold transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Xác nhận mật khẩu</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors" size={18} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 rounded-2xl border border-white/5 bg-black/20 text-white placeholder:text-slate-600 focus:border-gold/50 outline-none transition-all font-bold text-sm tracking-widest"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-gradient-to-r from-gold to-[#aa771c] text-black font-black rounded-2xl shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-[0.2em] text-[11px]"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>ĐANG XỬ LÝ...</span>
                                    </>
                                ) : (
                                    'CẬP NHẬT MẬT KHẨU'
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-slate-600">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Bảo mật cấp cao bởi Chotsale AI</span>
                </div>
            </div>
        </div>
    );
}
