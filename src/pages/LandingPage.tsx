import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Sparkles, Wand2, Camera, PenTool, Target,
    Users, Star, ChevronDown, Zap, Gift, Shield,
    CheckCircle2, Play, Image as ImageIcon
} from 'lucide-react';

// ─── BEFORE/AFTER SLIDER ──────────────────────────────
function BeforeAfterSlider() {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMove = (clientX: number) => {
        if (!containerRef.current || !isDragging.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const pos = ((clientX - rect.left) / rect.width) * 100;
        setSliderPos(Math.max(5, Math.min(95, pos)));
    };

    useEffect(() => {
        const onUp = () => { isDragging.current = false; };
        const onMove = (e: MouseEvent) => handleMove(e.clientX);
        const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchend', onUp);
        window.addEventListener('touchmove', onTouchMove);
        return () => {
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('touchend', onUp);
            window.removeEventListener('touchmove', onTouchMove);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-3xl overflow-hidden cursor-col-resize select-none shadow-2xl shadow-black/50 border border-white/10"
            onMouseDown={() => { isDragging.current = true; }}
            onTouchStart={() => { isDragging.current = true; }}
        >
            {/* After (bottom layer) */}
            <img src="/lp/after.png" alt="After AI" className="absolute inset-0 w-full h-full object-cover" />

            {/* Before (clipped layer) */}
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                <img src="/lp/before.png" alt="Before" className="w-full h-full object-cover" />
            </div>

            {/* Slider line */}
            <div className="absolute top-0 bottom-0 z-20" style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}>
                <div className="w-1 h-full bg-gold shadow-[0_0_20px_rgba(191,149,63,0.6)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gradient-to-br from-gold via-[#fcf6ba] to-gold rounded-full flex items-center justify-center shadow-xl shadow-gold/30 border-2 border-white/30">
                    <div className="flex gap-0.5 text-black">
                        <ChevronDown size={16} strokeWidth={3} className="rotate-90" />
                        <ChevronDown size={16} strokeWidth={3} className="-rotate-90" />
                    </div>
                </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-red-500/90 backdrop-blur-sm rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                Trước
            </div>
            <div className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-emerald-500/90 backdrop-blur-sm rounded-full text-[10px] font-black text-white uppercase tracking-widest">
                Sau AI ✨
            </div>
        </div>
    );
}

// ─── COUNTER ANIMATION ────────────────────────────────
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                let start = 0;
                const step = Math.ceil(target / 40);
                const interval = setInterval(() => {
                    start += step;
                    if (start >= target) { setCount(target); clearInterval(interval); }
                    else setCount(start);
                }, 30);
                observer.disconnect();
            }
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── MAIN LANDING PAGE ────────────────────────────────
export default function LandingPage() {
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const features = [
        {
            icon: Wand2, title: 'Nâng Cấp Ảnh BĐS',
            desc: 'Upload ảnh xấu → AI biến thành ảnh magazine. Thêm nội thất, dọn dẹp, mở rộng góc.',
            tag: 'AI Image', cost: '10 Xu/lượt'
        },
        {
            icon: Sparkles, title: 'Vẽ Phối Cảnh AI',
            desc: 'Mô tả bằng chữ → AI render ảnh phối cảnh BĐS siêu thực. Biệt thự, căn hộ, đất nền đều OK.',
            tag: 'AI Render', cost: '10 Xu/lượt'
        },
        {
            icon: Camera, title: 'Ảnh Sale Chuyên Nghiệp',
            desc: 'Up ảnh selfie → AI tạo ảnh đại diện chuyên nghiệp hoặc ghép bạn vào dự án.',
            tag: 'AI Photo', cost: '10 Xu/lượt'
        },
        {
            icon: PenTool, title: 'Soạn Tin Đăng Bài',
            desc: 'AI viết caption FB, Zalo, tin rao chuẩn SEO. Chỉ cần nhập thông tin, AI soạn xong.',
            tag: 'AI Content', cost: '1 Xu/lượt'
        },
        {
            icon: Target, title: 'Mẹo Chốt Khách',
            desc: 'Khách im lặng? Chê giá? Bùng hẹn? AI phân tích và cho bạn kịch bản xử lý chuẩn.',
            tag: 'AI Coaching', cost: '1 Xu/lượt'
        },
        {
            icon: ImageIcon, title: 'Đóng Dấu Thương Hiệu',
            desc: 'Chèn logo, SĐT, thông số dự án lên ảnh BĐS. Professional branding FREE.',
            tag: 'Free Tool', cost: 'Miễn phí'
        },
    ];

    const testimonials = [
        {
            name: 'Minh Tuấn',
            role: 'Trưởng nhóm | Century 21',
            avatar: '👨‍💼',
            text: 'Từ khi dùng Chốt Sale, đội của mình đăng bài nhanh gấp 3 lần. Ảnh AI đẹp tới mức khách hỏi chụp bằng máy gì!',
            rating: 5
        },
        {
            name: 'Thu Hà',
            role: 'Môi giới độc lập | Vinhomes',
            avatar: '👩‍💼',
            text: 'Mình không giỏi viết caption, Chốt Sale viết cho mình luôn. 1 Xu thôi mà đỡ tốn bao nhiêu thời gian suy nghĩ.',
            rating: 5
        },
        {
            name: 'Đức Anh',
            role: 'Sale Manager | Sun Group',
            avatar: '🧑‍💼',
            text: 'Tính năng xử lý từ chối quá đỉnh. Khách chê đắt, AI phân tích và cho kịch bản xoay chuyển liền.',
            rating: 5
        }
    ];

    const steps = [
        { num: '01', title: 'Chọn Tính Năng', desc: 'Chọn công cụ AI phù hợp nhu cầu: ảnh, content, hay chiến thuật.' },
        { num: '02', title: 'Nhập Dữ Liệu', desc: 'Upload ảnh BĐS hoặc nhập thông tin. Chỉ mất 30 giây.' },
        { num: '03', title: 'AI Xử Lý & Nhận Kết Quả', desc: 'AI tạo ra kết quả chuyên nghiệp trong tích tắc. Tải về dùng ngay.' },
    ];

    return (
        <div className="min-h-screen bg-[#0b1121] text-white font-inter overflow-x-hidden">
            {/* ═══ NAVIGATION ═══ */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-[#0b1121]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-gold to-[#aa771c] rounded-lg flex items-center justify-center">
                            <Zap size={16} className="text-black" strokeWidth={3} />
                        </div>
                        <span className="text-lg font-black uppercase tracking-widest italic">
                            Chốt<span className="text-gold">Sale</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Tính Năng</a>
                        <a href="#demo" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Demo</a>
                        <a href="#pricing" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Bảng Giá</a>
                        <Link
                            to="/signup"
                            className="flex items-center gap-2 py-2.5 px-6 bg-gradient-to-r from-gold via-[#fcf6ba] to-gold rounded-full text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gold/20 hover:scale-105 transition-all"
                        >
                            Dùng Thử Miễn Phí <ArrowRight size={14} strokeWidth={4} />
                        </Link>
                    </div>

                    <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5">
                        <span className={`w-6 h-0.5 bg-white transition-all ${showMobileMenu ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`w-6 h-0.5 bg-white transition-all ${showMobileMenu ? 'opacity-0' : ''}`} />
                        <span className={`w-6 h-0.5 bg-white transition-all ${showMobileMenu ? '-rotate-45 -translate-y-2' : ''}`} />
                    </button>
                </div>

                {showMobileMenu && (
                    <div className="md:hidden bg-[#131b2e] border-t border-white/5 p-6 space-y-4">
                        <a href="#features" onClick={() => setShowMobileMenu(false)} className="block text-sm font-bold text-slate-300 py-2">Tính Năng</a>
                        <a href="#demo" onClick={() => setShowMobileMenu(false)} className="block text-sm font-bold text-slate-300 py-2">Demo</a>
                        <a href="#pricing" onClick={() => setShowMobileMenu(false)} className="block text-sm font-bold text-slate-300 py-2">Bảng Giá</a>
                        <Link to="/signup" className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-gold via-[#fcf6ba] to-gold rounded-full text-black text-[10px] font-black uppercase tracking-widest">
                            Dùng Thử Miễn Phí <ArrowRight size={14} strokeWidth={4} />
                        </Link>
                    </div>
                )}
            </nav>

            {/* ═══ HERO SECTION ═══ */}
            <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 px-4 md:px-8">
                {/* Background glow */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gold/8 blur-[150px] rounded-full pointer-events-none" />
                <div className="absolute top-40 right-0 w-96 h-96 bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full mb-8">
                        <Gift size={14} className="text-gold" />
                        <span className="text-[11px] font-black text-gold uppercase tracking-widest">Đăng ký tặng 25 Xu miễn phí</span>
                    </div>

                    <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tight leading-[0.95] mb-6">
                        Đừng để ảnh xấu
                        <br />
                        <span className="bg-gradient-to-r from-gold via-[#fcf6ba] to-gold bg-clip-text text-transparent">
                            làm mất khách
                        </span>
                    </h1>

                    <p className="text-base md:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
                        <strong className="text-white">Chốt Sale</strong> là vũ khí AI dành riêng cho môi giới BĐS.
                        Nâng cấp ảnh, soạn tin mời, xử lý từ chối — tất cả trong <strong className="text-gold">5 giây</strong>.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/signup"
                            className="flex items-center gap-3 py-4 px-10 bg-gradient-to-r from-gold via-[#fcf6ba] to-gold rounded-full text-black font-black text-[11px] uppercase tracking-widest shadow-xl shadow-gold/30 hover:scale-105 active:scale-95 transition-all"
                        >
                            Bắt đầu miễn phí <ArrowRight size={16} strokeWidth={4} />
                        </Link>
                        <a
                            href="#demo"
                            className="flex items-center gap-3 py-4 px-8 bg-white/5 border border-white/10 rounded-full text-white font-black text-[11px] uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                            <Play size={16} className="text-gold" fill="currentColor" /> Xem Demo
                        </a>
                    </div>

                    {/* Stats bar */}
                    <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16">
                        {[
                            { value: 500, suffix: '+', label: 'Sale đang dùng' },
                            { value: 10000, suffix: '+', label: 'Ảnh đã nâng cấp' },
                            { value: 25, suffix: ' Xu', label: 'Tặng khi đăng ký' },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="text-3xl md:text-4xl font-black text-gold tracking-tight">
                                    <AnimatedCounter target={s.value} suffix={s.suffix} />
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ BEFORE / AFTER DEMO ═══ */}
            <section id="demo" className="py-16 md:py-24 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-full mb-4">
                            <Sparkles size={12} className="text-gold" />
                            <span className="text-[9px] font-black text-gold uppercase tracking-widest">AI Magic</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
                            Trước & Sau <span className="text-gold">AI</span>
                        </h2>
                        <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto">
                            Kéo thanh trượt để xem sự khác biệt. Ảnh gốc xấu → AI biến thành ảnh magazine chuyên nghiệp.
                        </p>
                    </div>
                    <BeforeAfterSlider />
                    <p className="text-center text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-6">
                        👆 Kéo thanh trượt để so sánh • Chỉ mất 5 giây để tạo
                    </p>
                </div>
            </section>

            {/* ═══ FEATURES ═══ */}
            <section id="features" className="py-16 md:py-24 px-4 md:px-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-72 h-72 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
                            Cỗ máy <span className="text-gold">chốt sale</span> toàn diện
                        </h2>
                        <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto">
                            6 tính năng AI + Tools miễn phí, giúp bạn bán nhanh hơn, đẹp hơn, chuyên nghiệp hơn.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className="group relative p-6 rounded-[2rem] bg-[#1a2332] border border-white/5 hover:border-gold/40 transition-all duration-500 overflow-hidden"
                            >
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-gold/5 blur-[60px] rounded-full pointer-events-none group-hover:bg-gold/15 transition-all duration-700" />

                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-xl flex items-center justify-center shadow-lg border border-white/25 group-hover:scale-110 transition-transform duration-500">
                                        <f.icon size={20} className="text-[#131b2e]" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="text-sm font-black text-white uppercase tracking-tight group-hover:text-gold transition-colors">{f.title}</h3>
                                        </div>
                                        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">{f.desc}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-gold/10 text-gold uppercase tracking-widest border border-gold/20">{f.tag}</span>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border ${f.cost === 'Miễn phí' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-slate-400 border-white/10'}`}>{f.cost}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ HOW IT WORKS ═══ */}
            <section className="py-16 md:py-24 px-4 md:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
                            3 bước <span className="text-gold">đơn giản</span>
                        </h2>
                        <p className="text-slate-400 text-sm md:text-base">Không cần kỹ năng. Không cần kinh nghiệm. Chỉ cần 30 giây.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step, i) => (
                            <div key={i} className="relative text-center group">
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-gold/30 to-transparent" />
                                )}
                                <div className="w-24 h-24 mx-auto mb-6 bg-[#1a2332] border-2 border-gold/20 rounded-3xl flex items-center justify-center group-hover:border-gold/60 group-hover:scale-110 transition-all duration-500">
                                    <span className="text-3xl font-black text-gold tracking-tight">{step.num}</span>
                                </div>
                                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">{step.title}</h3>
                                <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ TESTIMONIALS ═══ */}
            <section className="py-16 md:py-24 px-4 md:px-8 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
                            Sale thật nói <span className="text-gold">thật</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <div key={i} className="p-6 rounded-[2rem] bg-[#1a2332] border border-white/5 hover:border-gold/30 transition-all duration-500">
                                <div className="flex items-center gap-1 mb-4">
                                    {Array.from({ length: t.rating }).map((_, j) => (
                                        <Star key={j} size={14} className="text-gold fill-gold" />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed mb-6 italic">"{t.text}"</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-transparent flex items-center justify-center text-xl">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white">{t.name}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ PRICING TEASER ═══ */}
            <section id="pricing" className="py-16 md:py-24 px-4 md:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="relative p-8 md:p-12 rounded-[2.5rem] bg-[#1a2332] border border-gold/20 overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-gold/10 blur-[100px] rounded-full pointer-events-none" />
                        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-gold/5 blur-[80px] rounded-full pointer-events-none" />

                        <div className="relative z-10 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
                                <Gift size={14} className="text-emerald-400" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Miễn phí khi đăng ký</span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-4">
                                Bắt đầu từ <span className="text-gold">0đ</span>
                            </h2>
                            <p className="text-slate-400 text-sm md:text-base max-w-lg mx-auto mb-4">
                                Đăng ký tài khoản → nhận <strong className="text-gold">25 Xu miễn phí</strong> → dùng thử tất cả tính năng AI.
                                Hết Xu thì nạp thêm, không ràng buộc.
                            </p>

                            <div className="flex flex-wrap justify-center gap-3 mb-8">
                                {['Dùng đâu trả đó', 'Xu không hết hạn', 'Không ràng buộc'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                                        <CheckCircle2 size={12} className="text-gold" />
                                        <span className="text-[10px] font-bold text-slate-300">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-10">
                                {[
                                    { xu: '25', price: '0đ', name: 'Dùng Thử' },
                                    { xu: '200', price: '99K', name: 'Tăng Trưởng', popular: true },
                                    { xu: '500', price: '250K', name: 'Đội Nhóm' },
                                ].map((pkg, i) => (
                                    <div key={i} className={`p-4 rounded-2xl border text-center ${pkg.popular ? 'bg-gold/10 border-gold/30' : 'bg-white/3 border-white/5'}`}>
                                        <p className="text-2xl md:text-3xl font-black text-white tracking-tight">{pkg.xu}</p>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Xu</p>
                                        <p className={`text-sm font-black ${pkg.popular ? 'text-gold' : 'text-slate-400'}`}>{pkg.price}</p>
                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{pkg.name}</p>
                                    </div>
                                ))}
                            </div>

                            <Link
                                to="/signup"
                                className="inline-flex items-center gap-3 py-4 px-12 bg-gradient-to-r from-gold via-[#fcf6ba] to-gold rounded-full text-black font-black text-[11px] uppercase tracking-widest shadow-xl shadow-gold/30 hover:scale-105 active:scale-95 transition-all"
                            >
                                Tạo tài khoản miễn phí <ArrowRight size={16} strokeWidth={4} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ FINAL CTA ═══ */}
            <section className="py-20 md:py-32 px-4 md:px-8 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-gold/5 via-transparent to-transparent pointer-events-none" />
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mb-6">
                        Đối thủ đã dùng AI,
                        <br />
                        <span className="text-gold">bạn còn đợi gì?</span>
                    </h2>
                    <p className="text-slate-400 text-base md:text-lg max-w-lg mx-auto mb-10">
                        Mỗi ngày không dùng Chốt Sale là mỗi ngày bạn mất khách vào tay đối thủ.
                        Bắt đầu miễn phí ngay hôm nay.
                    </p>
                    <Link
                        to="/signup"
                        className="inline-flex items-center gap-3 py-5 px-14 bg-gradient-to-r from-gold via-[#fcf6ba] to-gold rounded-full text-black font-black text-sm uppercase tracking-widest shadow-2xl shadow-gold/30 hover:scale-105 active:scale-95 transition-all"
                    >
                        Dùng Thử Miễn Phí <ArrowRight size={18} strokeWidth={4} />
                    </Link>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-6">
                        🎁 Tặng 25 Xu • Không cần thẻ tín dụng • Hủy bất cứ lúc nào
                    </p>
                </div>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="py-12 px-4 md:px-8 border-t border-white/5">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-gold to-[#aa771c] rounded-lg flex items-center justify-center">
                            <Zap size={16} className="text-black" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-black uppercase tracking-widest italic">
                            Chốt<span className="text-gold">Sale</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <Link to="/login" className="hover:text-white transition-colors">Đăng nhập</Link>
                        <Link to="/signup" className="hover:text-white transition-colors">Đăng ký</Link>
                        <Link to="/pricing" className="hover:text-white transition-colors">Bảng giá</Link>
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold">
                        © 2026 Chốt Sale. Powered by AI ✨
                    </p>
                </div>
            </footer>
        </div>
    );
}
