import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Crown, Check, X, ShieldCheck, Zap, Sparkles, MessageSquare, ImageIcon, Layout, Loader2, ArrowRight, Wallet, CreditCard, Coins, TrendingUp, Star, Gift, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Pricing() {
    const { profile, user } = useAuth();
    const navigate = useNavigate();
    const [settings, setSettings] = useState<Record<string, string>>({
        bank_name: 'MB BANK',
        bank_account: '0901234567',
        bank_owner: 'NGUYEN VAN A',
        payment_note: 'HOMESPRO [EMAIL]'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<'bank' | 'momo' | 'visa'>('bank');
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const targetDate = new Date('2026-03-10T23:59:59').getTime();

        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeLeft(`${days > 0 ? `${days}N ` : ''}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            } else {
                setTimeLeft('ĐÃ KẾT THÚC');
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    const creditPackages = [
        {
            id: 'trial',
            name: 'Dùng Thử',
            credits: 25,
            price: '0',
            bonus: 0,
            description: 'Quà tặng chào mừng.',
            popular: false,
            color: 'from-emerald-400 to-teal-600',
            isTrial: true
        },
        {
            id: 'starter',
            name: 'Gói 60',
            credits: 60,
            price: '30.000',
            bonus: 0,
            description: 'Để trải nghiệm chuyên sâu.',
            popular: false,
            color: 'from-slate-400 to-slate-600'
        },
        {
            id: 'growth',
            name: 'Gói 200',
            credits: 200,
            price: '99.000',
            bonus: 0,
            description: 'Dành cho môi giới chuyên nghiệp.',
            popular: true,
            color: 'from-gold via-white to-gold'
        },
        {
            id: 'elite',
            name: 'Gói 500',
            credits: 500,
            price: '250.000',
            bonus: 0,
            description: 'Dành cho agency/đội nhóm.',
            popular: false,
            color: 'from-amber-400 to-amber-600'
        }
    ];

    useEffect(() => {
        const loadSettings = async () => {
            const { data } = await supabase.from('app_settings').select('*');
            if (data) {
                const mapped = data.reduce((acc: any, curr: any) => {
                    acc[curr.key] = curr.value;
                    return acc;
                }, {});
                setSettings(prev => ({ ...prev, ...mapped }));
            }
            setIsLoading(false);
        };
        loadSettings();
    }, []);

    const features = [
        { name: 'Khởi tạo tài liệu, Namecard số', price: '0', icon: <ImageIcon size={18} /> },
        { name: 'Tra hướng nhà Bát Trạch, Lịch Âm', price: '0', icon: <Layout size={18} /> },
        { name: 'Quân sư tác chiến (Chốt Sale)', price: '1', icon: <MessageSquare size={18} /> },
        { name: 'Thiết kế bài viết đa kênh', price: '1', icon: <Zap size={18} /> },
        { name: 'Kiến tạo phối cảnh AI (Render)', price: '10', icon: <Sparkles size={18} /> },
        { name: 'Phù phép nâng cấp ảnh BĐS', price: '10', icon: <Sparkles size={18} /> },
    ];

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-gold" size={32} />
        </div>
    );

    const handleSelectPackage = (pkg: any) => {
        setSelectedPackage(pkg);
        setShowPayment(true);
    };

    const formatBankName = (name: string) => {
        const clean = name ? name.trim().toUpperCase() : '';
        if (!clean) return '';
        const map: Record<string, string> = {
            'MB BANK': 'MB', 'MBBANK': 'MB', 'VIETCOMBANK': 'VCB', 'TECHCOMBANK': 'TCB',
            'VIETINBANK': 'CTG', 'VPBANK': 'VPB', 'TPBANK': 'TPB', 'SACOMBANK': 'STB', 'AGRIBANK': 'VBA'
        };
        return map[clean] || clean.replace(/\s/g, '');
    };

    const currentPrice = selectedPackage?.price || '0';
    const paymentNote = (settings.payment_note || 'HOMESPRO [EMAIL]').replace('[EMAIL]', user?.email || 'KHACH').toUpperCase();
    const qrUrl = `https://img.vietqr.io/image/${formatBankName(settings.bank_name)}-${settings.bank_account}-compact.png?amount=${currentPrice.replace(/\./g, '')}&addInfo=${encodeURIComponent(paymentNote)}&accountName=${encodeURIComponent(settings.bank_owner)}`;

    const handleDownloadQR = async () => {
        try {
            const response = await fetch(qrUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `QR_CHOTSALE_${currentPrice}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            window.open(qrUrl, '_blank');
        }
    };

    return (
        <div className="max-w-7xl mx-auto min-h-[calc(100vh-100px)] flex flex-col justify-start py-6 md:py-8 px-4 space-y-6 md:space-y-8 font-inter">
            {/* Header section with Balance */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-[#1a2332]/40 p-5 md:p-6 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] -z-10 group-hover:bg-gold/10 transition-all duration-1000"></div>

                <div className="text-center lg:text-left space-y-3 relative flex-1 px-2 md:px-0">
                    {/* Countdown moved to banner */}
                    <h1 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-none pt-1 pb-1 flex flex-wrap justify-center lg:justify-start items-center gap-x-2 gap-y-2">
                        <span className="bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent">
                            Nạp Xu
                        </span>
                        <span className="relative inline-flex items-center text-gold">
                            PRO
                            <Crown size={18} className="ml-1" fill="currentColor" />
                        </span>
                    </h1>
                    <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest opacity-80 italic">Dùng đến đâu trả tiền đến đó</p>
                </div>

                <div className="flex flex-col items-center shrink-0 w-full lg:w-auto mt-2 lg:mt-0">
                    <div className="bg-black/60 backdrop-blur-xl border border-gold/20 px-6 py-4 rounded-[1.5rem] flex items-center justify-center md:justify-start gap-4 shadow-lg group/balance hover:border-gold/40 transition-all w-full lg:w-auto">
                        <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold shadow-inner border border-gold/20 group-hover/balance:scale-110 transition-transform shrink-0">
                            <Coins size={22} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-xl md:text-3xl font-black text-white leading-none tracking-tighter">{profile?.credits || 0}</span>
                            <span className="text-[8px] font-black text-gold/60 uppercase tracking-[0.3em] mt-1">Xu hiện có</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Banner Khuyến Mãi */}
            <div className="max-w-7xl mx-auto w-full px-2 md:px-0 mt-4">
                <div className="w-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 rounded-[2rem] p-[3px] shadow-2xl relative overflow-hidden group cursor-pointer hover:scale-[1.01] transition-transform duration-300"
                    onClick={() => {
                        setSelectedPackage({
                            id: 'first-time',
                            name: 'Gói Tăng Trưởng (Nạp Lần Đầu)',
                            credits: 200,
                            price: '30.000',
                            bonus: 0
                        });
                        setShowPayment(true);
                    }}
                >
                    <div className="absolute inset-0 bg-[#000] opacity-20 mix-blend-overlay pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-[80px] rounded-full group-hover:bg-white/30 transition-colors pointer-events-none"></div>

                    <div className="bg-[#131b2ef0] backdrop-blur-md rounded-[calc(2rem-3px)] py-6 px-4 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 border border-red-500/30 overflow-hidden text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                            <div className="w-16 h-16 md:w-14 md:h-14 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center justify-center text-red-500 shrink-0 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse">
                                <Gift size={32} strokeWidth={2} />
                            </div>
                            <div className="flex flex-col items-center md:items-start w-full">
                                <div className="inline-flex flex-wrap justify-center md:justify-start items-center gap-2 mb-3">
                                    <div className="inline-flex items-center gap-1.5 bg-red-500 text-white px-2.5 py-1 rounded-md">
                                        <Sparkles size={10} className="animate-pulse" />
                                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] leading-none">Ưu Đãi Độc Quyền</span>
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 bg-black/40 border border-red-500/30 px-2.5 py-1 rounded-md">
                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
                                        <span className="text-[8px] md:text-[9px] font-black text-red-400 uppercase tracking-[0.2em] leading-none whitespace-nowrap">Kết thúc sau: {timeLeft}</span>
                                    </div>
                                </div>
                                <h2 className="text-lg md:text-2xl font-black text-white uppercase italic tracking-widest leading-snug mb-2 md:mb-1 whitespace-normal break-words">
                                    KHUYẾN MÃI <span className="text-red-400">NẠP LẦN ĐẦU</span>
                                </h2>
                                <p className="text-[10px] md:text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">Gói Tăng Trưởng: Cơ hội lớn nhất hôm nay</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 bg-black/40 p-4 md:p-3 pr-5 md:pr-4 rounded-2xl border border-white/5 mx-auto md:mx-0 w-full sm:w-[80%] md:w-auto justify-between md:justify-center">
                            <div className="flex flex-col items-center">
                                <span className="text-[10px] md:text-xs font-bold text-slate-400 line-through tracking-wider decoration-red-500/50">99.000Đ</span>
                                <span className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-300 leading-none italic tracking-tighter shrink-0">CHỈ 30K</span>
                            </div>
                            <div className="w-px h-10 bg-white/10"></div>
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] md:text-[10px] font-black text-gold uppercase tracking-[0.3em] mb-1">Nhận Ngay</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-white tracking-tighter italic leading-none shadow-black drop-shadow-md">200</span>
                                    <span className="text-xs font-black text-gold uppercase tracking-widest leading-none">Xu</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Credit Packages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 items-stretch max-w-7xl mx-auto w-full pt-4 md:pt-6 px-2 md:px-0">
                {creditPackages.map((pkg) => (
                    <div
                        key={pkg.id}
                        className={`relative rounded-[1.5rem] p-[1px] h-full group transition-all duration-500 hover:-translate-y-1 ${pkg.popular ? 'bg-gradient-to-br from-[#d4af37] to-[#aa771c] shadow-xl' : 'bg-white/5 shadow-lg'}`}
                    >
                        <div className="bg-[#0b1121] rounded-[calc(1.5rem-1px)] p-5 flex flex-col h-full relative text-center items-center">
                            <div className="mb-4 w-full">
                                <h3 className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-center gap-1 opacity-60">
                                    <Zap size={10} /> {pkg.name}
                                </h3>

                                <div className="flex flex-col items-center">
                                    <div className="flex items-baseline justify-center gap-1 mb-1">
                                        <span className={`text-3xl md:text-4xl font-black italic tracking-tighter bg-gradient-to-r ${pkg.color} bg-clip-text text-transparent px-2`}>
                                            {pkg.credits}
                                        </span>
                                        <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Xu</span>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <p className="text-lg md:text-xl font-black text-white tracking-tighter">
                                            {pkg.price === '0' ? <span className="text-emerald-400 uppercase tracking-widest text-sm">Free</span> : `${pkg.price}đ`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest leading-none mb-4 italic opacity-80">
                                {pkg.description}
                            </p>

                            <button
                                onClick={() => {
                                    if (pkg.isTrial) {
                                        if (!user) navigate('/login');
                                    } else {
                                        handleSelectPackage(pkg);
                                    }
                                }}
                                disabled={pkg.isTrial && !!user}
                                className={`w-full py-2.5 rounded-lg font-black transition-all text-[8px] uppercase tracking-widest flex items-center justify-center gap-1.5 ${pkg.isTrial
                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10'
                                    : pkg.popular
                                        ? 'bg-gradient-to-r from-gold via-white to-gold text-black'
                                        : 'bg-white text-black hover:bg-gold'
                                    }`}
                            >
                                <span>{pkg.isTrial ? (user ? 'Đã nhận' : 'Đăng ký') : 'Mua ngay'}</span>
                                {pkg.isTrial ? <Gift size={12} /> : <TrendingUp size={12} />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Consumption Table */}
            <div className="max-w-4xl mx-auto w-full pt-12 md:pt-20 px-2 md:px-0 space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="text-center space-y-3 px-4">
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-widest flex items-center justify-center gap-2 md:gap-3">
                        <Gift className="text-gold w-5 h-5 md:w-6 md:h-6" /> Quyền lợi gói free và chi phí
                    </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 px-2 md:px-0">
                    {features.map((f, i) => (
                        <div key={i} className="bg-[#1a2332]/40 border border-white/5 p-3 rounded-xl flex items-center justify-between group hover:border-gold/20 transition-all gap-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gold group-hover:scale-110 transition-transform shrink-0">
                                    {React.cloneElement(f.icon as React.ReactElement<any>, { size: 14 })}
                                </div>
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-tight leading-tight">{f.name}</span>
                            </div>
                            <span className={`text-[8px] font-black ${f.price === '0' ? 'text-green-400' : 'text-gold'} uppercase tracking-tighter whitespace-nowrap`}>
                                {f.price === '0' ? 'Free' : `${f.price} Xu`}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPayment(false)}></div>
                    <div className="relative bg-[#1a2332] w-full max-w-[420px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/10 animate-in zoom-in-95 duration-300 max-h-[98vh] flex flex-col p-4 md:p-6 space-y-3 md:space-y-4 no-scrollbar overflow-y-auto">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>
                        <div className="text-center space-y-2">
                            <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-1 border border-gold/20 shadow-xl">
                                <TrendingUp className="text-gold" size={20} />
                            </div>
                            <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tighter italic">Nạp Năng Lượng Sale</h3>
                            <div className="bg-black/40 px-3 py-1.5 rounded-xl border border-white/5 inline-block">
                                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Thanh toán: {selectedPackage?.name}</p>
                                <p className="text-base font-black text-gold">{selectedPackage?.price} VNĐ</p>
                            </div>
                        </div>

                        <div className="flex flex-col items-center bg-black/60 p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 relative overflow-hidden group shadow-inner">
                            <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl"></div>
                            {selectedMethod === 'bank' ? (
                                <>
                                    <img src={qrUrl} className="w-40 h-40 md:w-44 md:h-44 shadow-[0_0_50px_rgba(191,149,63,0.3)] border-[3px] border-gold/30 rounded-[1.25rem] md:rounded-3xl relative z-10" alt="Payment QR" />
                                    <button
                                        onClick={handleDownloadQR}
                                        className="mt-3 text-[8px] font-black text-gold uppercase tracking-[0.2em] flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 rounded-full border border-gold/20 hover:bg-gold hover:text-black transition-all"
                                    >
                                        <Download className="w-3 h-3" /> Lưu mã QR về máy
                                    </button>
                                </>
                            ) : (
                                <div className="w-44 h-44 flex items-center justify-center text-slate-500 font-black text-[10px] uppercase tracking-widest border-2 border-dashed border-white/10 rounded-3xl relative z-10">Đang tích hợp...</div>
                            )}
                        </div>

                        <div className="space-y-2.5 bg-gold/5 p-3 md:p-4 rounded-[1.25rem] border border-gold/10">
                            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                                <div>
                                    <p className="text-slate-500 uppercase text-[7px] tracking-[0.3em] mb-1">Chủ tài khoản</p>
                                    <p className="text-white uppercase text-[8px] font-black tracking-wide bg-white/5 p-1.5 rounded-lg border border-white/5 leading-none">{settings.bank_owner}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 uppercase text-[7px] tracking-[0.3em] mb-1">Số tài khoản</p>
                                    <p className="text-gold font-black tracking-widest text-xs bg-black/40 p-1.5 rounded-lg border border-gold/20 leading-none">{settings.bank_account}</p>
                                </div>
                                <div className="col-span-2 border-t border-gold/10 pt-2.5">
                                    <p className="text-slate-500 uppercase text-[7px] tracking-[0.3em] mb-1.5 leading-none italic">Nội dung chuyển khoản (ĐỂ NẠP AUTO)</p>
                                    <div
                                        className="bg-black/60 w-full p-2 rounded-xl border border-gold/40 flex items-center justify-between group cursor-pointer hover:bg-black/80 transition-all"
                                        onClick={() => {
                                            navigator.clipboard.writeText(paymentNote);
                                            toast.success('Đã sao chép nội dung chuyển khoản!');
                                        }}
                                    >
                                        <p className="text-gold text-[9px] font-black tracking-widest font-mono break-all mr-2">
                                            {paymentNote}
                                        </p>
                                        <div className="text-[7px] text-white/40 uppercase tracking-widest border border-white/10 px-1.5 py-1 rounded-md group-hover:text-gold group-hover:border-gold transition-all shrink-0">Copy</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 pt-1">
                            <button
                                onClick={() => setShowPayment(false)}
                                className="w-full py-3 bg-gradient-to-r from-gold via-[#fcf6ba] to-gold text-black font-black rounded-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 group/btn"
                            >
                                <Check size={14} strokeWidth={4} /> TÔI ĐÃ CHUYỂN KHOẢN XONG
                            </button>
                            <button
                                onClick={() => setShowPayment(false)}
                                className="w-full py-2.5 text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] hover:text-white transition-colors"
                            >
                                Hủy giao dịch
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
