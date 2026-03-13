import { X, Coins, UserPlus, ShoppingCart, Sparkles, Gift, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CreditGateState } from '../hooks/useCreditGate';

interface CreditGateModalProps {
    state: CreditGateState;
    onDismiss: () => void;
}

export function CreditGateModal({ state, onDismiss }: CreditGateModalProps) {
    if (state.type === 'idle' || state.type === 'processing') return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onDismiss}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md animate-in zoom-in-95 fade-in duration-300">
                <div className="bg-[#1a2332] border border-white/10 rounded-[2rem] shadow-2xl shadow-black/50 overflow-hidden">

                    {/* Close button */}
                    <button
                        onClick={onDismiss}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all z-10"
                    >
                        <X size={16} />
                    </button>

                    {state.type === 'guest' ? <GuestContent /> : <InsufficientContent needed={state.needed} current={state.current} onDismiss={onDismiss} />}
                </div>
            </div>
        </div>
    );
}

/** Guest user — invite to create an account */
function GuestContent() {
    return (
        <>
            {/* Header with gradient */}
            <div className="relative px-8 pt-10 pb-6 text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-gold/10 via-gold/5 to-transparent" />
                <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-gold via-[#fcf6ba] to-[#aa771c] rounded-3xl flex items-center justify-center shadow-xl shadow-gold/20 rotate-6 hover:rotate-0 transition-transform duration-500">
                        <Sparkles size={36} className="text-black" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">
                        Trải Nghiệm Miễn Phí
                    </h2>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                        Tạo tài khoản ngay để sử dụng đầy đủ các tính năng AI
                    </p>
                </div>
            </div>

            {/* Gift highlight */}
            <div className="mx-6 mb-6 p-4 bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10 border border-gold/20 rounded-2xl">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gold/20 rounded-2xl flex items-center justify-center shrink-0">
                        <Gift size={24} className="text-gold" />
                    </div>
                    <div>
                        <p className="text-gold font-black text-lg tracking-tight">🎁 TẶNG 25 XU MIỄN PHÍ</p>
                        <p className="text-slate-400 text-xs font-bold mt-0.5">Đăng ký xong là dùng được ngay, không cần nạp tiền!</p>
                    </div>
                </div>
            </div>

            {/* Features list */}
            <div className="mx-6 mb-6 space-y-2">
                {[
                    'Tạo ảnh BĐS chuyên nghiệp bằng AI',
                    'Soạn bài đăng tự động theo phong cách',
                    'Chiến thuật chốt sale thông minh',
                ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/3">
                        <div className="w-5 h-5 bg-gold/20 rounded-full flex items-center justify-center shrink-0">
                            <Coins size={10} className="text-gold" />
                        </div>
                        <span className="text-slate-300 text-sm font-bold">{feat}</span>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <div className="px-6 pb-8 space-y-3">
                <Link
                    to="/signup"
                    className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-gold to-[#aa771c] text-black font-black rounded-2xl text-sm uppercase tracking-widest shadow-xl shadow-gold/20 hover:brightness-110 active:scale-95 transition-all"
                >
                    <UserPlus size={18} strokeWidth={3} /> TẠO TÀI KHOẢN NGAY
                </Link>
                <Link
                    to="/login"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all border border-white/5"
                >
                    Đã có tài khoản? <ArrowRight size={14} /> Đăng nhập
                </Link>
            </div>
        </>
    );
}

/** Logged in but insufficient credits */
function InsufficientContent({ needed, current, onDismiss }: { needed: number; current: number; onDismiss: () => void }) {
    return (
        <>
            {/* Header */}
            <div className="relative px-8 pt-10 pb-6 text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 to-transparent" />
                <div className="relative z-10">
                    <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl flex items-center justify-center shadow-xl border border-white/10">
                        <Coins size={36} className="text-gold" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight mb-2 uppercase">
                        Không Đủ Xu
                    </h2>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        Bạn cần thêm Xu để sử dụng tính năng này
                    </p>
                </div>
            </div>

            {/* Credit info */}
            <div className="mx-6 mb-6 p-5 bg-black/30 border border-white/5 rounded-2xl">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">Số dư hiện tại</p>
                        <p className="text-3xl font-black text-red-400">{current}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Xu</p>
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">Cần để chạy</p>
                        <p className="text-3xl font-black text-gold">{needed}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Xu</p>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 text-center">
                    <p className="text-sm font-bold text-red-400">
                        Thiếu <span className="font-black text-lg">{Math.max(0, needed - current)}</span> Xu
                    </p>
                </div>
            </div>

            {/* CTA */}
            <div className="px-6 pb-8 space-y-3">
                <Link
                    to="/pricing"
                    onClick={onDismiss}
                    className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-gold to-[#aa771c] text-black font-black rounded-2xl text-sm uppercase tracking-widest shadow-xl shadow-gold/20 hover:brightness-110 active:scale-95 transition-all"
                >
                    <ShoppingCart size={18} strokeWidth={3} /> NẠP XU NGAY
                </Link>
                <button
                    onClick={onDismiss}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-slate-400 font-bold rounded-2xl text-xs uppercase tracking-widest transition-all border border-white/5"
                >
                    Để sau
                </button>
            </div>
        </>
    );
}
