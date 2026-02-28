import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { Particles } from '../components/Particles';

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
                        <div className="w-16 h-16 bg-gold/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gold/10 transform rotate-3 transition-transform group-hover:rotate-0 duration-700 shadow-2xl">
                            <Zap className="text-gold" size={32} fill="currentColor" />
                        </div>
                        <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-3">
                            Quên <span className="text-gold">Mật Khẩu</span>
                        </h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3 opacity-60 italic text-center">Chúng tôi sẽ giúp bạn khôi phục quyền truy cập</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-4 bg-red-500/5 border border-red-500/20 text-red-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in shake duration-500">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {success ? (
                        <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 text-green-400 rounded-3xl flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                                <CheckCircle2 size={40} strokeWidth={1} />
                            </div>
                            <div className="space-y-3 px-2">
                                <h3 className="text-xl font-black text-white uppercase italic tracking-tight">Email đã được gửi!</h3>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide leading-relaxed">
                                    Vui lòng kiểm tra hộp thư đến của <span className="text-gold">{email}</span> và làm theo hướng dẫn.
                                </p>
                            </div>
                            <button
                                onClick={() => setSuccess(false)}
                                className="w-full py-5 bg-white/5 border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all uppercase tracking-[0.2em] text-[10px]"
                            >
                                THỬ EMAIL KHÁC
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Nhập Email nhận tin</label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within/input:text-gold transition-colors" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-14 pr-5 py-5 rounded-[1.5rem] border border-white/5 bg-black/40 text-white placeholder:text-slate-700 focus:border-gold/40 focus:bg-black/60 outline-none transition-all font-bold text-sm tracking-wide shadow-inner"
                                        placeholder="sếp@gmail.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="group/btn w-full py-6 bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#aa771c] text-black font-black rounded-[1.5rem] shadow-[0_15px_30px_-5px_rgba(191,149,63,0.3)] hover:shadow-[0_20px_40px_-5px_rgba(191,149,63,0.4)] hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-[0.3em] text-[12px] relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 skew-x-[-20deg]"></div>
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Đang xử lý...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Gửi link khôi phục</span>
                                        <ArrowRight size={20} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-10 flex items-center justify-center gap-2 text-slate-700">
                    <ShieldCheck size={18} />
                    <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Protocol Secured Access Control</span>
                </div>
            </div>
        </div>
    );
}
