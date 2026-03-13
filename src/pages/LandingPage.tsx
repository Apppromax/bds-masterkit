import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, Sparkles, Wand2, Camera, PenTool, Target,
    Star, ChevronDown, Zap, Gift,
    CheckCircle2, Play, Image as ImageIcon, ChevronUp
} from 'lucide-react';

// ─── SCROLL REVEAL HOOK ───────────────────────────────
function useScrollReveal(threshold = 0.12) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
            { threshold }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, isVisible };
}

function RevealSection({ children, className = '', delay = 0, direction = 'up' }: {
    children: React.ReactNode; className?: string; delay?: number; direction?: 'up' | 'left' | 'right' | 'scale';
}) {
    const { ref, isVisible } = useScrollReveal(0.08);
    const transforms: Record<string, string> = {
        up: 'translateY(60px)',
        left: 'translateX(-60px)',
        right: 'translateX(60px)',
        scale: 'scale(0.85)',
    };
    return (
        <div
            ref={ref}
            className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translate(0) scale(1)' : transforms[direction],
                transitionDelay: `${delay}ms`,
            }}
        >
            {children}
        </div>
    );
}

// ─── FLOATING PARTICLES ───────────────────────────────
function FloatingParticles({ count = 15 }: { count?: number }) {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: `${2 + Math.random() * 5}px`,
                        height: `${2 + Math.random() * 5}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        background: `radial-gradient(circle, rgba(191,149,63,${0.4 + Math.random() * 0.4}) 0%, transparent 70%)`,
                        animation: `float-particle ${6 + Math.random() * 10}s ease-in-out infinite`,
                        animationDelay: `${Math.random() * 8}s`,
                    }}
                />
            ))}
        </div>
    );
}

// ─── MARQUEE TICKER ───────────────────────────────────
function MarqueeTicker() {
    const items = ['500+ Sale đang dùng', '10,000+ ảnh đã nâng cấp', 'Tặng 25 Xu miễn phí', 'Không cần thẻ tín dụng', 'AI xử lý trong 5 giây', 'Xu không hết hạn'];
    return (
        <div className="overflow-hidden py-3 md:py-4 bg-gradient-to-r from-gold/10 via-gold/5 to-gold/10 border-y border-gold/10">
            <div className="flex animate-marquee">
                {[...items, ...items].map((item, i) => (
                    <span key={i} className="shrink-0 mx-4 md:mx-8 text-[10px] md:text-xs font-black text-gold/70 uppercase tracking-[0.2em] whitespace-nowrap flex items-center gap-2">
                        <Sparkles size={10} className="text-gold/50" /> {item}
                    </span>
                ))}
            </div>
        </div>
    );
}

// ─── BEFORE/AFTER SLIDER ──────────────────────────────
function BeforeAfterSlider() {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const handleMove = useCallback((clientX: number) => {
        if (!containerRef.current || !isDragging.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const pos = ((clientX - rect.left) / rect.width) * 100;
        setSliderPos(Math.max(5, Math.min(95, pos)));
    }, []);

    useEffect(() => {
        const onUp = () => { isDragging.current = false; };
        const onMove = (e: MouseEvent) => handleMove(e.clientX);
        const onTouchMove = (e: TouchEvent) => { if (!isDragging.current) return; e.preventDefault(); handleMove(e.touches[0].clientX); };
        window.addEventListener('mouseup', onUp);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchend', onUp);
        window.addEventListener('touchmove', onTouchMove, { passive: false });
        return () => {
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('touchend', onUp);
            window.removeEventListener('touchmove', onTouchMove);
        };
    }, [handleMove]);

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-[3/4] sm:aspect-[4/3] md:aspect-[16/9] rounded-2xl md:rounded-3xl overflow-hidden cursor-col-resize select-none shadow-2xl shadow-black/50 border border-white/10"
            onMouseDown={() => { isDragging.current = true; }}
            onTouchStart={() => { isDragging.current = true; }}
        >
            <img src="/lp/after.png" alt="After AI" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}>
                <img src="/lp/before.png" alt="Before" className="w-full h-full object-cover" />
            </div>

            <div className="absolute top-0 bottom-0 z-20" style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}>
                <div className="w-0.5 h-full bg-gold shadow-[0_0_15px_rgba(191,149,63,0.8),0_0_30px_rgba(191,149,63,0.4)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-gold via-[#fcf6ba] to-gold rounded-full flex items-center justify-center shadow-xl shadow-gold/40 border-2 border-white/30 animate-pulse-glow">
                    <div className="flex gap-0.5 text-black">
                        <ChevronDown size={14} strokeWidth={3} className="rotate-90" />
                        <ChevronDown size={14} strokeWidth={3} className="-rotate-90" />
                    </div>
                </div>
            </div>

            <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 px-2.5 py-1 md:px-3 md:py-1.5 bg-red-500/90 backdrop-blur-sm rounded-full text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest">
                Trước
            </div>
            <div className="absolute top-3 right-3 md:top-4 md:right-4 z-10 px-2.5 py-1 md:px-3 md:py-1.5 bg-emerald-500/90 backdrop-blur-sm rounded-full text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest">
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
                const step = Math.ceil(target / 50);
                const interval = setInterval(() => {
                    start += step;
                    if (start >= target) { setCount(target); clearInterval(interval); }
                    else setCount(start);
                }, 25);
                observer.disconnect();
            }
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [target]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ─── GRADIENT BORDER CARD ─────────────────────────────
function GradientBorderCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`relative group ${className}`}>
            {/* Animated gradient border */}
            <div className="absolute -inset-[1px] rounded-[2rem] bg-gradient-to-r from-gold/0 via-gold/40 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-gradient-rotate" />
            <div className="relative bg-[#1a2332] rounded-[2rem] overflow-hidden h-full">
                {children}
            </div>
        </div>
    );
}

// ─── MAIN LANDING PAGE ────────────────────────────────
export default function LandingPage() {
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
            setShowScrollTop(window.scrollY > 600);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        { icon: Wand2, title: 'Nâng Cấp Ảnh BĐS', desc: 'Upload ảnh xấu → AI biến thành ảnh magazine. Thêm nội thất, dọn dẹp, mở rộng góc.', tag: 'AI Image', cost: '10 Xu/lượt' },
        { icon: Sparkles, title: 'Vẽ Phối Cảnh AI', desc: 'Mô tả bằng chữ → AI render ảnh phối cảnh BĐS siêu thực. Biệt thự, căn hộ, đất nền đều OK.', tag: 'AI Render', cost: '10 Xu/lượt' },
        { icon: Camera, title: 'Ảnh Sale Chuyên Nghiệp', desc: 'Up ảnh selfie → AI tạo ảnh đại diện chuyên nghiệp hoặc ghép bạn vào dự án.', tag: 'AI Photo', cost: '10 Xu/lượt' },
        { icon: PenTool, title: 'Soạn Tin Đăng Bài', desc: 'AI viết caption FB, Zalo, tin rao chuẩn SEO. Chỉ cần nhập thông tin, AI soạn xong.', tag: 'AI Content', cost: '1 Xu/lượt' },
        { icon: Target, title: 'Mẹo Chốt Khách', desc: 'Khách im lặng? Chê giá? Bùng hẹn? AI phân tích và cho bạn kịch bản xử lý chuẩn.', tag: 'AI Coaching', cost: '1 Xu/lượt' },
        { icon: ImageIcon, title: 'Đóng Dấu Thương Hiệu', desc: 'Chèn logo, SĐT, thông số dự án lên ảnh BĐS. Professional branding FREE.', tag: 'Free Tool', cost: 'Miễn phí' },
    ];

    const testimonials = [
        { name: 'Minh Tuấn', role: 'Trưởng nhóm | Century 21', avatar: '👨‍💼', text: 'Từ khi dùng Chốt Sale, đội của mình đăng bài nhanh gấp 3 lần. Ảnh AI đẹp tới mức khách hỏi chụp bằng máy gì!', rating: 5 },
        { name: 'Thu Hà', role: 'Môi giới độc lập | Vinhomes', avatar: '👩‍💼', text: 'Mình không giỏi viết caption, Chốt Sale viết cho mình luôn. 1 Xu thôi mà đỡ tốn bao nhiêu thời gian suy nghĩ.', rating: 5 },
        { name: 'Đức Anh', role: 'Sale Manager | Sun Group', avatar: '🧑‍💼', text: 'Tính năng xử lý từ chối quá đỉnh. Khách chê đắt, AI phân tích và cho kịch bản xoay chuyển liền.', rating: 5 },
    ];

    const steps = [
        { num: '01', title: 'Chọn Tính Năng', desc: 'Chọn công cụ AI phù hợp nhu cầu: ảnh, content, hay chiến thuật.' },
        { num: '02', title: 'Nhập Dữ Liệu', desc: 'Upload ảnh BĐS hoặc nhập thông tin. Chỉ mất 30 giây.' },
        { num: '03', title: 'AI Xử Lý & Nhận Kết Quả', desc: 'AI tạo ra kết quả chuyên nghiệp trong tích tắc. Tải về dùng ngay.' },
    ];

    return (
        <div className="min-h-screen bg-[#0b1121] text-white overflow-x-hidden font-inter">
            {/* ═══ ANIMATION STYLES ═══ */}
            <style>{`
                @keyframes float-particle { 0%,100% { transform: translateY(0) translateX(0); opacity:0.2; } 25% { transform: translateY(-40px) translateX(15px); opacity:0.8; } 50% { transform: translateY(-80px) translateX(-10px); opacity:0.3; } 75% { transform: translateY(-40px) translateX(20px); opacity:0.6; } }
                @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
                @keyframes glow-pulse { 0%,100% { box-shadow: 0 0 20px rgba(191,149,63,0.3),0 0 40px rgba(191,149,63,0.1); } 50% { box-shadow: 0 0 35px rgba(191,149,63,0.6),0 0 70px rgba(191,149,63,0.2); } }
                @keyframes float-orb { 0%,100% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-25px) scale(1.15); } 66% { transform: translate(-25px,15px) scale(0.9); } }
                @keyframes text-reveal { from { opacity:0; transform: translateY(100%) rotateX(10deg); } to { opacity:1; transform: translateY(0) rotateX(0); } }
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                @keyframes gradient-rotate { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                @keyframes pulse-ring { 0% { transform: scale(1); opacity:0.6; } 100% { transform: scale(1.8); opacity:0; } }
                @keyframes hero-gradient { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                @keyframes slide-up-bounce { 0% { opacity:0; transform: translateY(40px); } 60% { transform: translateY(-8px); } 100% { opacity:1; transform: translateY(0); } }
                @keyframes counter-pop { 0% { transform: scale(0.5); opacity:0; } 70% { transform: scale(1.1); } 100% { transform: scale(1); opacity:1; } }
                @keyframes border-dance { 0%,100% { border-color: rgba(191,149,63,0.15); } 25% { border-color: rgba(191,149,63,0.5); } 50% { border-color: rgba(191,149,63,0.2); } 75% { border-color: rgba(191,149,63,0.4); } }

                .animate-shimmer { background-size: 200% auto; animation: shimmer 3s linear infinite; }
                .animate-glow-pulse { animation: glow-pulse 2.5s ease-in-out infinite; }
                .animate-float-orb { animation: float-orb 10s ease-in-out infinite; }
                .animate-float-orb-2 { animation: float-orb 14s ease-in-out infinite reverse; }
                .animate-text-reveal { animation: text-reveal 1.2s cubic-bezier(0.16,1,0.3,1) both; }
                .animate-text-reveal-2 { animation: text-reveal 1.2s cubic-bezier(0.16,1,0.3,1) 0.2s both; }
                .animate-text-reveal-3 { animation: text-reveal 1.2s cubic-bezier(0.16,1,0.3,1) 0.4s both; }
                .animate-marquee { animation: marquee 25s linear infinite; }
                .animate-gradient-rotate { background-size: 200% 200%; animation: gradient-rotate 3s linear infinite; }
                .animate-pulse-glow { animation: glow-pulse 2s ease-in-out infinite; }
                .animate-pulse-ring { animation: pulse-ring 2s ease-out infinite; }
                .animate-hero-gradient { background-size: 300% 300%; animation: hero-gradient 8s ease infinite; }
                .animate-slide-up-bounce { animation: slide-up-bounce 0.8s ease-out both; }
                .animate-counter-pop { animation: counter-pop 0.6s ease-out both; }
                .animate-border-dance { animation: border-dance 4s ease-in-out infinite; }

                @media (max-width: 768px) {
                    .animate-marquee { animation-duration: 15s; }
                }

                /* Skewed heading - replaces italic to prevent stroke thinning */
                .skew-heading {
                    display: inline-block;
                    transform: skewX(-8deg);
                    line-height: 1.3;
                    padding-top: 0.08em;
                    padding-bottom: 0.05em;
                    overflow: visible;
                }
                /* Fix bg-clip-text clipping diacritics */
                .shimmer-text {
                    display: inline-block;
                    transform: skewX(-8deg);
                    padding: 0.15em 0.25em 0.08em 0;
                    line-height: 1.35 !important;
                    filter: drop-shadow(0 0 8px rgba(212,168,67,0.4));
                }
            `}</style>

            {/* ═══ NAVIGATION ═══ */}
            <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrollY > 50 ? 'bg-[#0b1121]/95 backdrop-blur-xl shadow-2xl shadow-black/30' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-gold to-[#aa771c] rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                            <Zap size={14} className="text-black" strokeWidth={3} />
                        </div>
                        <span className="text-base md:text-lg font-black tracking-widest skew-heading">
                            CHỐT<span className="text-gold">SALE</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        {['Tính Năng', 'Demo', 'Bảng Giá'].map((label, i) => (
                            <a key={i} href={`#${['features','demo','pricing'][i]}`} className="text-sm font-bold text-slate-400 hover:text-white transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gold hover:after:w-full after:transition-all after:duration-300">
                                {label}
                            </a>
                        ))}
                        <Link
                            to="/signup"
                            className="flex items-center gap-2 py-2.5 px-6 bg-gradient-to-r from-gold via-[#fcf6ba] to-gold rounded-full text-black text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gold/20 hover:scale-105 hover:shadow-gold/40 transition-all duration-300"
                        >
                            Dùng Thử Miễn Phí <ArrowRight size={14} strokeWidth={4} />
                        </Link>
                    </div>

                    <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5">
                        <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${showMobileMenu ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${showMobileMenu ? 'opacity-0' : ''}`} />
                        <span className={`w-5 h-0.5 bg-white transition-all duration-300 ${showMobileMenu ? '-rotate-45 -translate-y-2' : ''}`} />
                    </button>
                </div>

                {showMobileMenu && (
                    <div className="md:hidden bg-[#131b2e]/98 backdrop-blur-2xl border-t border-white/5 p-5 space-y-3 animate-slide-up-bounce">
                        {['Tính Năng', 'Demo', 'Bảng Giá'].map((label, i) => (
                            <a key={i} href={`#${['features','demo','pricing'][i]}`} onClick={() => setShowMobileMenu(false)}
                               className="block text-sm font-bold text-slate-300 py-2.5 px-4 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors">
                                {label}
                            </a>
                        ))}
                        <Link to="/signup" onClick={() => setShowMobileMenu(false)}
                              className="flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-gold via-[#fcf6ba] to-gold rounded-2xl text-black text-[10px] font-black uppercase tracking-widest mt-2">
                            Dùng Thử Miễn Phí <ArrowRight size={14} strokeWidth={4} />
                        </Link>
                    </div>
                )}
            </nav>

            {/* ═══ HERO SECTION ═══ */}
            <section className="relative pt-24 pb-8 md:pt-40 md:pb-20 px-4 md:px-8">
                <FloatingParticles count={20} />

                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-gold/3 animate-hero-gradient pointer-events-none" />
                <div className="absolute top-10 md:top-20 left-1/2 -translate-x-1/2 w-[500px] md:w-[800px] h-[400px] md:h-[600px] bg-gold/8 blur-[120px] md:blur-[150px] rounded-full pointer-events-none animate-float-orb"
                     style={{ transform: `translate(-50%, ${scrollY * -0.08}px)` }} />
                <div className="absolute top-32 md:top-40 right-0 w-48 md:w-96 h-48 md:h-96 bg-gold/5 blur-[80px] md:blur-[120px] rounded-full pointer-events-none animate-float-orb-2" />

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gold/10 border border-gold/20 rounded-full mb-6 md:mb-8 animate-slide-up-bounce">
                        <Gift size={12} className="text-gold" />
                        <span className="text-[9px] md:text-[11px] font-black text-gold uppercase tracking-widest">Đăng ký tặng 25 Xu miễn phí</span>
                    </div>

                    {/* Hero text with perspective reveal */}
                    <div className="overflow-visible" style={{ perspective: '800px' }}>
                        <h1 className="text-[2rem] sm:text-4xl md:text-7xl font-black text-white skew-heading tracking-tight mb-2 md:mb-3 animate-text-reveal">
                            ĐỪNG ĐỂ ẢNH XẤU
                        </h1>
                    </div>
                    <div className="overflow-visible" style={{ perspective: '800px' }}>
                        <h1 className="text-[2rem] sm:text-4xl md:text-7xl font-black tracking-tight mb-4 md:mb-6 animate-text-reveal-2">
                            <span className="shimmer-text bg-gradient-to-r from-[#d4a843] via-[#fef3c7] via-[#fffbeb] via-[#fef3c7] to-[#d4a843] bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">
                                LÀM MẤT KHÁCH
                            </span>
                        </h1>
                    </div>

                    <p className="text-sm sm:text-base md:text-xl text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed mb-8 md:mb-10 px-2 animate-text-reveal-3">
                        <strong className="text-white">Chốt Sale</strong> là vũ khí AI dành riêng cho môi giới BĐS.
                        Nâng cấp ảnh, soạn tin mời, xử lý từ chối — tất cả trong <strong className="text-gold">5 giây</strong>.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4 sm:px-0">
                        <Link
                            to="/signup"
                            className="relative w-full sm:w-auto flex items-center justify-center gap-3 py-4 px-8 md:px-10 bg-gradient-to-r from-gold via-[#fcf6ba] to-gold rounded-2xl md:rounded-full text-black font-black text-[11px] uppercase tracking-widest shadow-xl shadow-gold/30 hover:scale-105 active:scale-95 transition-all"
                        >
                            {/* Pulse ring on mobile */}
                            <span className="absolute inset-0 rounded-2xl md:rounded-full bg-gold/30 animate-pulse-ring" />
                            <span className="relative z-10 flex items-center gap-3">Bắt đầu miễn phí <ArrowRight size={16} strokeWidth={4} /></span>
                        </Link>
                        <a
                            href="#demo"
                            className="w-full sm:w-auto flex items-center justify-center gap-3 py-4 px-8 bg-white/5 border border-white/10 rounded-2xl md:rounded-full text-white font-black text-[11px] uppercase tracking-widest hover:bg-white/10 active:bg-white/15 transition-all"
                        >
                            <Play size={16} className="text-gold" fill="currentColor" /> Xem Demo
                        </a>
                    </div>
                </div>
            </section>

            {/* ═══ MARQUEE TICKER ═══ */}
            <MarqueeTicker />

            {/* ═══ STATS BAR ═══ */}
            <section className="py-8 md:py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-3 gap-3 md:gap-8">
                        {[
                            { value: 500, suffix: '+', label: 'Sale đang dùng' },
                            { value: 10000, suffix: '+', label: 'Ảnh đã nâng cấp' },
                            { value: 25, suffix: ' Xu', label: 'Tặng khi đăng ký' },
                        ].map((s, i) => (
                            <RevealSection key={i} delay={i * 150} direction="scale">
                                <div className="text-center p-3 md:p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                    <div className="text-xl sm:text-2xl md:text-4xl font-black text-gold skew-heading tracking-tight">
                                        <AnimatedCounter target={s.value} suffix={s.suffix} />
                                    </div>
                                    <div className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ BEFORE / AFTER DEMO ═══ */}
            <section id="demo" className="py-10 md:py-24 px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                    <RevealSection direction="scale">
                        <div className="text-center mb-8 md:mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold/10 border border-gold/20 rounded-full mb-3 md:mb-4">
                                <Sparkles size={12} className="text-gold" />
                                <span className="text-[9px] font-black text-gold uppercase tracking-widest">AI Magic</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white skew-heading tracking-tight mb-3 md:mb-4">
                                TRƯỚC & SAU <span className="text-gold">AI</span>
                            </h2>
                            <p className="text-slate-400 text-xs md:text-base max-w-lg mx-auto px-4 md:px-0">
                                Kéo thanh trượt để xem sự khác biệt. Ảnh gốc xấu → AI biến thành ảnh magazine chuyên nghiệp.
                            </p>
                        </div>
                    </RevealSection>
                    <RevealSection delay={200} direction="scale">
                        <BeforeAfterSlider />
                        <p className="text-center text-[10px] md:text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-4 md:mt-6">
                            👆 Kéo thanh trượt để so sánh • Chỉ mất 5 giây để tạo
                        </p>
                    </RevealSection>
                </div>
            </section>

            {/* ═══ FEATURES ═══ */}
            <section id="features" className="py-10 md:py-24 px-4 md:px-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-48 md:w-72 h-48 md:h-72 bg-gold/5 blur-[80px] md:blur-[100px] rounded-full pointer-events-none animate-float-orb" />

                <div className="max-w-6xl mx-auto relative z-10">
                    <RevealSection>
                        <div className="text-center mb-8 md:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white skew-heading tracking-tight mb-3 md:mb-4">
                                CỖ MÁY <span className="text-gold">CHỐT SALE</span> TOÀN DIỆN
                            </h2>
                            <p className="text-slate-400 text-xs md:text-base max-w-lg mx-auto px-4 md:px-0">
                                6 tính năng AI + Tools miễn phí, giúp bạn bán nhanh hơn, đẹp hơn, chuyên nghiệp hơn.
                            </p>
                        </div>
                    </RevealSection>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                        {features.map((f, i) => (
                            <RevealSection key={i} delay={i * 100} direction={i % 2 === 0 ? 'left' : 'right'}>
                                <GradientBorderCard>
                                    <div className="p-5 md:p-6 h-full">
                                        <div className="absolute -right-10 -top-10 w-24 md:w-32 h-24 md:h-32 bg-gold/5 blur-[50px] md:blur-[60px] rounded-full pointer-events-none group-hover:bg-gold/20 transition-all duration-700" />

                                        <div className="flex items-start gap-3 md:gap-4 relative z-10">
                                            <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-xl flex items-center justify-center shadow-lg border border-white/25 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                                <f.icon size={18} className="text-[#131b2e]" strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-tight group-hover:text-gold transition-colors duration-300 mb-1.5 md:mb-2">{f.title}</h3>
                                                <p className="text-[10px] md:text-[11px] text-slate-400 leading-relaxed mb-2.5 md:mb-3 group-hover:text-slate-300 transition-colors">{f.desc}</p>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-[7px] md:text-[8px] font-black px-2 py-0.5 rounded-full bg-gold/10 text-gold uppercase tracking-widest border border-gold/20">{f.tag}</span>
                                                    <span className={`text-[7px] md:text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border ${f.cost === 'Miễn phí' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-slate-400 border-white/10'}`}>{f.cost}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </GradientBorderCard>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ HOW IT WORKS ═══ */}
            <section className="py-10 md:py-24 px-4 md:px-8">
                <div className="max-w-5xl mx-auto">
                    <RevealSection>
                        <div className="text-center mb-8 md:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white skew-heading tracking-tight mb-3 md:mb-4">
                                3 BƯỚC <span className="text-gold">ĐƠN GIẢN</span>
                            </h2>
                            <p className="text-slate-400 text-xs md:text-base">Không cần kỹ năng. Không cần kinh nghiệm. Chỉ cần 30 giây.</p>
                        </div>
                    </RevealSection>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {steps.map((step, i) => (
                            <RevealSection key={i} delay={i * 200} direction="scale">
                                <div className="relative text-center group">
                                    {i < 2 && (
                                        <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-gold/30 to-transparent" />
                                    )}
                                    <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 md:mb-6 bg-[#1a2332] border-2 border-gold/20 rounded-2xl md:rounded-3xl flex items-center justify-center group-hover:border-gold/60 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 animate-border-dance">
                                        <span className="text-2xl md:text-3xl font-black text-gold skew-heading tracking-tight">{step.num}</span>
                                    </div>
                                    <h3 className="text-sm md:text-lg font-black text-white uppercase tracking-tight mb-1.5 md:mb-2">{step.title}</h3>
                                    <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-xs mx-auto px-2 md:px-0">{step.desc}</p>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ TESTIMONIALS ═══ */}
            <section className="py-10 md:py-24 px-4 md:px-8 relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 md:w-64 h-48 md:h-64 bg-gold/5 blur-[80px] md:blur-[100px] rounded-full pointer-events-none animate-float-orb-2" />

                <div className="max-w-5xl mx-auto relative z-10">
                    <RevealSection>
                        <div className="text-center mb-8 md:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white skew-heading tracking-tight mb-3 md:mb-4">
                                SALE THẬT NÓI <span className="text-gold">THẬT</span>
                            </h2>
                        </div>
                    </RevealSection>

                    {/* Horizontal scroll on mobile, grid on desktop */}
                    <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 -mx-4 md:mx-0 px-4 md:px-0 scrollbar-hide">
                        {testimonials.map((t, i) => (
                            <RevealSection key={i} delay={i * 150} direction={i === 0 ? 'left' : i === 2 ? 'right' : 'up'}>
                                <div className="min-w-[280px] sm:min-w-[300px] md:min-w-0 snap-center p-5 md:p-6 rounded-2xl md:rounded-[2rem] bg-[#1a2332] border border-white/5 hover:border-gold/30 transition-all duration-500">
                                    <div className="flex items-center gap-1 mb-3 md:mb-4">
                                        {Array.from({ length: t.rating }).map((_, j) => (
                                            <Star key={j} size={12} className="text-gold fill-gold" />
                                        ))}
                                    </div>
                                    <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-4 md:mb-6 italic">"{t.text}"</p>
                                    <div className="flex items-center gap-3 pt-3 md:pt-4 border-t border-white/5">
                                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-gold/20 to-transparent flex items-center justify-center text-lg md:text-xl">{t.avatar}</div>
                                        <div>
                                            <p className="text-xs md:text-sm font-black text-white">{t.name}</p>
                                            <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t.role}</p>
                                        </div>
                                    </div>
                                </div>
                            </RevealSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══ PRICING TEASER ═══ */}
            <section id="pricing" className="py-10 md:py-24 px-4 md:px-8">
                <div className="max-w-3xl mx-auto">
                    <RevealSection direction="scale">
                        <div className="relative p-6 md:p-12 rounded-2xl md:rounded-[2.5rem] bg-[#1a2332] border border-gold/20 overflow-hidden animate-border-dance">
                            <div className="absolute -right-16 md:-right-20 -top-16 md:-top-20 w-48 md:w-64 h-48 md:h-64 bg-gold/10 blur-[80px] md:blur-[100px] rounded-full pointer-events-none animate-float-orb" />
                            <div className="absolute -left-8 md:-left-10 -bottom-8 md:-bottom-10 w-36 md:w-48 h-36 md:h-48 bg-gold/5 blur-[60px] md:blur-[80px] rounded-full pointer-events-none animate-float-orb-2" />

                            <div className="relative z-10 text-center">
                                <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4 md:mb-6">
                                    <Gift size={13} className="text-emerald-400" />
                                    <span className="text-[9px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest">Miễn phí khi đăng ký</span>
                                </div>

                                <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white skew-heading tracking-tight mb-3 md:mb-4">
                                    BẮT ĐẦU TỪ <span className="text-gold">0Đ</span>
                                </h2>
                                <p className="text-slate-400 text-xs md:text-base max-w-lg mx-auto mb-3 md:mb-4 px-2 md:px-0">
                                    Đăng ký tài khoản → nhận <strong className="text-gold">25 Xu miễn phí</strong> → dùng thử tất cả tính năng AI.
                                    Hết Xu thì nạp thêm, không ràng buộc.
                                </p>

                                <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-8">
                                    {['Dùng đâu trả đó', 'Xu không hết hạn', 'Không ràng buộc'].map((item, i) => (
                                        <div key={i} className="flex items-center gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 bg-white/5 border border-white/10 rounded-full">
                                            <CheckCircle2 size={10} className="text-gold" />
                                            <span className="text-[9px] md:text-[10px] font-bold text-slate-300">{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-3 gap-2.5 md:gap-4 mb-8 md:mb-10">
                                    {[
                                        { xu: '25', price: '0đ', name: 'Dùng Thử' },
                                        { xu: '200', price: '99K', name: 'Tăng Trưởng', popular: true },
                                        { xu: '500', price: '250K', name: 'Đội Nhóm' },
                                    ].map((pkg, i) => (
                                        <div key={i} className={`p-3 md:p-4 rounded-xl md:rounded-2xl border text-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-default ${pkg.popular ? 'bg-gold/10 border-gold/30 shadow-lg shadow-gold/10' : 'bg-white/3 border-white/5'}`}>
                                            <p className="text-xl sm:text-2xl md:text-3xl font-black text-white skew-heading tracking-tight">{pkg.xu}</p>
                                            <p className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 md:mb-2">Xu</p>
                                            <p className={`text-xs md:text-sm font-black ${pkg.popular ? 'text-gold' : 'text-slate-400'}`}>{pkg.price}</p>
                                            <p className="text-[7px] md:text-[8px] font-bold text-slate-500 uppercase tracking-widest">{pkg.name}</p>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    to="/signup"
                                    className="relative inline-flex items-center justify-center gap-3 py-3.5 md:py-4 px-8 md:px-12 bg-gradient-to-r from-gold via-[#fcf6ba] to-gold rounded-2xl md:rounded-full text-black font-black text-[10px] md:text-[11px] uppercase tracking-widest shadow-xl shadow-gold/30 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
                                >
                                    <span className="absolute inset-0 rounded-2xl md:rounded-full bg-gold/30 animate-pulse-ring" />
                                    <span className="relative z-10 flex items-center gap-3">Tạo tài khoản miễn phí <ArrowRight size={16} strokeWidth={4} /></span>
                                </Link>
                            </div>
                        </div>
                    </RevealSection>
                </div>
            </section>

            {/* ═══ FINAL CTA ═══ */}
            <section className="py-14 md:py-32 px-4 md:px-8 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-gold/8 via-gold/3 to-transparent pointer-events-none" />
                <FloatingParticles count={25} />

                <RevealSection direction="scale">
                    <div className="max-w-3xl mx-auto text-center relative z-10">
                        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white skew-heading tracking-tight mb-4 md:mb-6">
                            ĐỐI THỦ ĐÃ DÙNG AI,
                            <br />
                            <span className="shimmer-text bg-gradient-to-r from-[#d4a843] via-[#fef3c7] via-[#fffbeb] via-[#fef3c7] to-[#d4a843] bg-clip-text text-transparent animate-shimmer bg-[length:200%_auto]">BẠN CÒN ĐỢI GÌ?</span>
                        </h2>
                        <p className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            🎁 Tặng 25 Xu • Không cần thẻ tín dụng • Hủy bất cứ lúc nào
                        </p>
                    </div>
                </RevealSection>
            </section>

            {/* ═══ FOOTER ═══ */}
            <footer className="py-8 md:py-12 px-4 md:px-8 border-t border-white/5">
                <div className="max-w-5xl mx-auto flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-gold to-[#aa771c] rounded-lg flex items-center justify-center">
                            <Zap size={14} className="text-black" strokeWidth={3} />
                        </div>
                        <span className="text-sm font-black tracking-widest skew-heading">
                            CHỐT<span className="text-gold">SALE</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-6 text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <Link to="/login" className="hover:text-white transition-colors">Đăng nhập</Link>
                        <Link to="/signup" className="hover:text-white transition-colors">Đăng ký</Link>
                        <Link to="/pricing" className="hover:text-white transition-colors">Bảng giá</Link>
                    </div>
                    <p className="text-[9px] md:text-[10px] text-slate-600 font-bold">
                        © 2026 Chốt Sale. Powered by AI ✨
                    </p>
                </div>
            </footer>

            {/* ═══ SCROLL TO TOP BUTTON ═══ */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-8 right-4 z-40 w-10 h-10 md:w-11 md:h-11 bg-gold/20 backdrop-blur-xl border border-gold/30 rounded-full flex items-center justify-center text-gold hover:bg-gold/30 active:scale-90 transition-all duration-300 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
            >
                <ChevronUp size={18} strokeWidth={3} />
            </button>

        </div>
    );
}
