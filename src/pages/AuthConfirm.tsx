import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle2, ShieldCheck, ArrowRight, Loader2, XCircle } from 'lucide-react';
import { Particles } from '../components/Particles';

export default function AuthConfirm() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Đang xác thực tài khoản của bạn...');

    useEffect(() => {
        const handleEmailConfirmation = async () => {
            // Supabase handles the actual confirmation via the link, 
            // but we want to verify the session exists now.
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                setStatus('error');
                setMessage('Link xác thực không hợp lệ hoặc đã hết hạn.');
                return;
            }

            if (session) {
                setStatus('success');
                setMessage('Tài khoản của bạn đã được kích hoạt thành công!');
                // Auto redirect after 3 seconds
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                // If no session, it might be an error or the user needs to login
                setStatus('error');
                setMessage('Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại.');
            }
        };

        handleEmailConfirmation();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            <Particles />

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-[#1a2332] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-500">

                    {status === 'loading' && (
                        <div className="space-y-6">
                            <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto border border-gold/20 relative">
                                <Loader2 className="text-gold animate-spin" size={40} />
                                <div className="absolute inset-0 rounded-full bg-gold/20 animate-ping opacity-20"></div>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-xl font-black text-white uppercase tracking-widest italic">Đang xác thực</h1>
                                <p className="text-slate-400 text-sm font-medium">{message}</p>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-6">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20 relative">
                                <CheckCircle2 className="text-green-500 animate-in zoom-in-50 duration-500" size={40} />
                                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping opacity-20"></div>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">Thành Công!</h1>
                                <p className="text-slate-300 text-sm font-bold uppercase tracking-widest">{message}</p>
                            </div>
                            <div className="pt-4">
                                <button
                                    onClick={() => navigate('/')}
                                    className="w-full py-4 bg-gradient-to-r from-gold to-[#aa771c] text-black font-black rounded-2xl uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-gold/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                                >
                                    Vào Trang Chủ <ArrowRight size={18} strokeWidth={3} />
                                </button>
                                <p className="text-[9px] text-slate-500 mt-4 uppercase font-black tracking-widest">Tự động chuyển hướng sau 3 giây...</p>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-6">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20 relative">
                                <XCircle className="text-red-500 animate-in shake duration-500" size={40} />
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-xl font-black text-white uppercase tracking-widest italic text-red-400">Thất Bại</h1>
                                <p className="text-slate-400 text-sm font-medium">{message}</p>
                            </div>
                            <div className="pt-4">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full py-4 bg-white/5 text-white border border-white/10 font-black rounded-2xl uppercase tracking-[0.2em] text-[11px] hover:bg-white/10 transition-all"
                                >
                                    Quay Lại Đăng Nhập
                                </button>
                            </div>
                        </div>
                    )}

                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-slate-600">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Hệ thống bảo mật bởi Chotsale AI</span>
                </div>
            </div>
        </div>
    );
}
