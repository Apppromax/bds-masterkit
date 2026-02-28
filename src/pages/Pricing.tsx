import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Crown, Check, X, ShieldCheck, Zap, Sparkles, MessageSquare, ImageIcon, Layout, Loader2, ArrowRight, Wallet, CreditCard, Coins, TrendingUp, Star, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Pricing() {
    const { profile, user } = useAuth();
    const [settings, setSettings] = useState<Record<string, string>>({
        premium_price: '499.000',
        bank_name: 'MB BANK',
        bank_account: '0901234567',
        bank_owner: 'NGUYEN VAN A',
        payment_note: 'CHOTSALE [EMAIL]'
    });
    const [isLoading, setIsLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<'bank' | 'momo' | 'visa'>('bank');
    const [selectedPackage, setSelectedPackage] = useState<any>(null);

    const creditPackages = [
        {
            id: 'starter',
            name: 'Gói Khởi Đầu',
            credits: 50,
            price: '99.000',
            bonus: 0,
            description: 'Dành cho người mới bắt đầu trải nghiệm AI chuyên sâu.',
            popular: false,
            color: 'from-slate-400 to-slate-600'
        },
        {
            id: 'growth',
            name: 'Gói Tăng Trưởng',
            credits: 300,
            price: '499.000',
            bonus: 20,
            description: 'Lựa chọn tốt nhất cho môi giới cá nhân chuyên nghiệp.',
            popular: true,
            color: 'from-gold via-white to-gold'
        },
        {
            id: 'elite',
            name: 'Gói Agency/Đội Nhóm',
            credits: 1000,
            price: '1.490.000',
            bonus: 50,
            description: 'Sức mạnh tối đa cho đội nhóm từ 5-10 người.',
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
        { name: 'Image Studio cơ bản', price: '0', icon: <ImageIcon size={18} /> },
        { name: 'Tạo quảng cáo mẫu', price: '0', icon: <Layout size={18} /> },
        { name: 'Tra hướng nhà Bát Trạch', price: '0', icon: <Layout size={18} /> },
        { name: 'AI Image Studio (Premium Templates)', price: '1', icon: <Sparkles size={18} /> },
        { name: 'Tạo nội dung AI Đa kênh (FB, Zalo, Tiktok)', price: '2', icon: <MessageSquare size={18} /> },
        { name: 'Thầy Phong Thủy AI (Tư vấn chuyên sâu)', price: '5', icon: <Zap size={18} /> },
        { name: 'Gỡ bỏ Watermark hệ thống', price: '1', icon: <ShieldCheck size={18} /> },
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
        const clean = name.trim().toUpperCase();
        const map: Record<string, string> = {
            'MB BANK': 'MB', 'MBBANK': 'MB', 'VIETCOMBANK': 'VCB', 'TECHCOMBANK': 'TCB',
            'VIETINBANK': 'CTG', 'VPBANK': 'VPB', 'TPBANK': 'TPB', 'SACOMBANK': 'STB', 'AGRIBANK': 'VBA'
        };
        return map[clean] || clean.replace(/\s/g, '');
    };

    const currentPrice = selectedPackage ? selectedPackage.price : settings.premium_price;
    const qrUrl = `https://img.vietqr.io/image/${formatBankName(settings.bank_name)}-${settings.bank_account}-compact.png?amount=${currentPrice.replace(/\./g, '')}&addInfo=${encodeURIComponent(settings.payment_note.replace('[EMAIL]', user?.email || 'KHACH'))}&accountName=${encodeURIComponent(settings.bank_owner)}`;

    return (
        <div className="max-w-7xl mx-auto min-h-[calc(100vh-100px)] flex flex-col justify-start py-8 px-4 space-y-12 font-inter">
            {/* Header section with Balance and Fix Overlap */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 bg-[#1a2332]/40 p-10 md:p-14 rounded-[4rem] border border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.4)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 blur-[120px] -z-10 group-hover:bg-gold/10 transition-all duration-1000"></div>

                <div className="text-center lg:text-left space-y-6 relative max-w-2xl">
                    <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full mb-2">
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Ưu đãi kết thúc sau: 05:24:12</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-gold via-white to-gold bg-clip-text text-transparent uppercase italic tracking-tighter leading-[0.95] py-2">
                        Nâng cấp <br className="hidden md:block" /> trải nghiệm <span className="relative inline-block ml-4">
                            PRO
                            <Crown className="absolute -top-12 -right-12 text-gold rotate-12 drop-shadow-[0_0_20px_rgba(191,149,63,0.8)] animate-[bounce_3s_infinite]" size={56} fill="currentColor" />
                        </span>
                    </h1>
                    <p className="text-slate-400 font-bold text-xs md:text-sm uppercase tracking-[0.4em] opacity-70 italic border-l-4 border-gold/40 pl-6 py-1">Xu cho cỗ máy chốt sale - dùng đến đâu trả tiền đến đó</p>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="bg-black/60 backdrop-blur-2xl border-2 border-gold/20 p-8 rounded-[3rem] flex flex-col items-center gap-4 min-w-[240px] shadow-[0_20px_50px_rgba(191,149,63,0.15)] group/balance hover:border-gold/40 transition-all duration-500">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold shadow-inner border border-gold/20 group-hover/balance:scale-110 transition-transform">
                                <Coins size={28} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-white leading-none tracking-tighter">{profile?.credits || 0}</span>
                                <span className="text-[9px] font-black text-gold/60 uppercase tracking-[0.3em] mt-1">Xu chốt sale</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                const elite = document.getElementById('growth');
                                elite?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-[9px] font-black text-slate-400 hover:text-white uppercase tracking-[0.3em] flex items-center gap-2 transition-colors"
                        >
                            Quản lý ví <ArrowRight size={12} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Credit Packages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto w-full pt-10 px-4">
                {creditPackages.map((pkg) => (
                    <div
                        id={pkg.id}
                        key={pkg.id}
                        className={`relative rounded-[3.5rem] p-[2px] h-full group transition-all duration-700 hover:scale-[1.03] hover:-translate-y-2 ${pkg.popular ? 'bg-gradient-to-br from-[#d4af37] via-[#fcf6ba] to-[#aa771c] shadow-[0_40px_80px_-20px_rgba(191,149,63,0.4)]' : 'bg-white/5 shadow-2xl hover:bg-white/10'}`}
                    >
                        {pkg.popular && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black border-2 border-gold text-gold font-black text-[11px] uppercase tracking-[0.5em] px-10 py-3.5 rounded-full shadow-[0_10px_30px_rgba(191,149,63,0.4)] z-20 flex items-center gap-2 whitespace-nowrap">
                                <Star size={14} fill="currentColor" className="animate-spin-slow" /> HỢP LÝ NHẤT
                            </div>
                        )}

                        <div className="bg-[#0b1121] rounded-[calc(3.5rem-2px)] p-12 flex flex-col h-full relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-gold/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {/* Bonus & Savings Badges */}
                            <div className="absolute top-12 -right-14 flex flex-col items-center">
                                {pkg.bonus > 0 && (
                                    <div className="rotate-45 bg-[#ff3d00] text-white font-black text-[10px] px-16 py-2.5 shadow-xl z-10 flex flex-col items-center leading-none mb-2 outline outline-4 outline-[#0b1121]">
                                        <span>THÊM</span>
                                        <span className="text-base mt-1">+{pkg.bonus}%</span>
                                    </div>
                                )}
                            </div>

                            <div className="mb-12 relative">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                                    <Zap size={14} className={pkg.popular ? 'text-gold' : 'text-slate-600'} /> {pkg.name}
                                </h3>
                                <div className="flex items-baseline gap-3">
                                    <span className={`text-6xl font-black italic tracking-tighter bg-gradient-to-r ${pkg.color} bg-clip-text text-transparent`}>
                                        {pkg.credits + (pkg.credits * pkg.bonus / 100)}
                                    </span>
                                    <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Xu</span>
                                </div>
                                <div className="mt-6 flex flex-col gap-2">
                                    <div className="flex items-center gap-3">
                                        <p className="text-3xl font-black text-white tracking-tighter">{pkg.price}đ</p>
                                        {pkg.id === 'elite' && (
                                            <span className="bg-green-500/10 text-green-500 text-[9px] font-black px-3 py-1 rounded-lg border border-green-500/20 uppercase tracking-widest">Tiết kiệm 30%</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest opacity-60 italic">Giá gốc: {pkg.price} VNĐ</p>
                                </div>
                            </div>

                            <p className="text-slate-400 text-[12px] font-bold uppercase tracking-widest leading-relaxed mb-12 border-l-2 border-gold/20 pl-6 py-1 italic opacity-80">
                                {pkg.description}
                            </p>

                            <div className="flex-1 space-y-5 mb-12">
                                {[
                                    'Mở khóa Elite Studio Premium',
                                    'Dùng AI không giới hạn thời gian',
                                    'Gói tặng thêm credits trọn đời',
                                    'Hỗ trợ chiến lược chốt sale AI'
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 text-white/70 group/item">
                                        <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center text-gold border border-gold/20 group-hover/item:bg-gold group-hover/item:text-black transition-all">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-[0.1em]">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleSelectPackage(pkg)}
                                className={`w-full py-6 rounded-2xl font-black text-black transition-all text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-3 relative overflow-hidden group/btn shadow-2xl ${pkg.popular ? 'bg-gradient-to-r from-gold via-[#fcf6ba] to-gold hover:shadow-gold/40 hover:brightness-110' : 'bg-white text-black hover:bg-gold hover:text-white'}`}
                            >
                                <div className="absolute inset-0 bg-white/40 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 skew-x-[-30deg]"></div>
                                <span>Mua Xu ngay</span> <TrendingUp size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Consumption Table - Incentivize awareness of cost */}
            <div className="max-w-4xl mx-auto w-full pt-12 space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-black text-white uppercase italic tracking-widest flex items-center justify-center gap-3">
                        <Gift className="text-gold" /> Định mức tiêu dùng AI
                    </h2>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">Minh bạch từng lượt sử dụng</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((f, i) => (
                        <div key={i} className="bg-[#1a2332]/40 border border-white/5 p-5 rounded-3xl flex items-center justify-between group hover:border-gold/20 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                                    {f.icon}
                                </div>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">{f.name}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/10">
                                <span className={`text-xs font-black ${f.price === '0' ? 'text-green-400' : 'text-gold'}`}>
                                    {f.price === '0' ? 'Free' : `${f.price} Credits`}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowPayment(false)}></div>
                    <div className="relative bg-[#1a2332] w-full max-w-lg rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/10 animate-in zoom-in-95 duration-300">
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"></div>

                        <div className="p-8 md:p-12 space-y-8">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gold/20 shadow-2xl animate-pulse">
                                    <TrendingUp className="text-gold" size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Nạp Năng Lượng Sale</h3>
                                <div className="bg-black/40 px-6 py-4 rounded-2xl border border-white/5 inline-block">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Thanh toán cho {selectedPackage?.name}</p>
                                    <p className="text-xl font-black text-gold">{selectedPackage?.price} VNĐ</p>
                                </div>
                            </div>

                            <div className="flex justify-center bg-black/60 p-8 rounded-[3rem] border border-white/5 relative overflow-hidden group shadow-inner">
                                <div className="absolute inset-0 bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl"></div>
                                {selectedMethod === 'bank' ? (
                                    <img src={qrUrl} className="w-64 h-64 shadow-[0_0_50px_rgba(191,149,63,0.3)] border-4 border-gold/30 rounded-3xl relative z-10 hover:scale-105 transition-transform duration-500" alt="Payment QR" />
                                ) : (
                                    <div className="w-64 h-64 flex items-center justify-center text-slate-500 font-black text-[10px] uppercase tracking-widest border-2 border-dashed border-white/10 rounded-3xl relative z-10">Đang tích hợp...</div>
                                )}
                            </div>

                            <div className="space-y-4 bg-gold/5 p-8 rounded-[2rem] border border-gold/10">
                                <div className="grid grid-cols-2 gap-6 text-xs font-bold">
                                    <div>
                                        <p className="text-slate-500 uppercase text-[9px] tracking-[0.3em] mb-2">Chủ tài khoản</p>
                                        <p className="text-white uppercase font-black tracking-wide bg-white/5 p-3 rounded-xl border border-white/5 leading-none">{settings.bank_owner}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-500 uppercase text-[9px] tracking-[0.3em] mb-2">Số tài khoản</p>
                                        <p className="text-gold font-black tracking-widest text-lg bg-black/40 p-2.5 rounded-xl border border-gold/20 leading-none">{settings.bank_account}</p>
                                    </div>
                                    <div className="col-span-2 border-t border-gold/10 pt-6">
                                        <p className="text-slate-500 uppercase text-[9px] tracking-[0.3em] mb-3 leading-none italic">Nội dung bắt buộc (để nạp credit tự động)</p>
                                        <div className="bg-black/60 w-full p-4 rounded-2xl border border-gold/40 flex items-center justify-between group cursor-pointer hover:bg-black/80 transition-all">
                                            <p className="text-gold text-lg font-black tracking-[0.2em] font-mono">
                                                {settings.payment_note.replace('[EMAIL]', user?.email || 'KHACH')}
                                            </p>
                                            <div className="text-[9px] text-white/40 uppercase tracking-widest border border-white/10 px-3 py-1.5 rounded-lg group-hover:text-gold group-hover:border-gold transition-all">Copy</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => setShowPayment(false)}
                                    className="w-full py-5 bg-gradient-to-r from-gold via-[#fcf6ba] to-gold text-black font-black rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 group/btn"
                                >
                                    <Check size={18} strokeWidth={4} /> TÔI ĐÃ CHUYỂN KHOẢN XONG
                                </button>
                                <button
                                    onClick={() => setShowPayment(false)}
                                    className="w-full py-4 text-slate-500 font-black text-[9px] uppercase tracking-[0.4em] hover:text-white transition-colors"
                                >
                                    Hủy giao dịch
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
