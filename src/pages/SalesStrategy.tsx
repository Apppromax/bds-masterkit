import React, { useState, useEffect } from 'react';
import {
    Snowflake, MapPin, BadgeDollarSign, ShieldAlert, PenTool,
    ArrowLeft, ArrowRight, Loader2, Copy, Check, Sparkles, Zap, Target,
    Brain, Lightbulb, ChevronRight, Info
} from 'lucide-react';
import { generateSalesStrategyAI, checkAndDeductCredits } from '../services/aiService';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import ContentCreator from './ContentCreator';

interface TagCategory {
    label: string;
    key: string;
    options: string[];
}

interface StrategyCard {
    id: string;
    label: string;
    icon: any;
    emoji: string;
    desc: string;
    gradient: string;
    accentBg: string;
    borderHover: string;
    cardGradient: string;
    cardShadow: string;
    tagCategories: TagCategory[];
}

interface StrategyResult {
    diagnosis: string;
    strategy: string;
    message_a: string;
    message_b: string;
}

const STRATEGY_CARDS: StrategyCard[] = [
    {
        id: 'pha-bang',
        label: 'PHÁ BĂNG',
        icon: Snowflake,
        emoji: '🧊',
        desc: 'Khách đang im lặng / ghosting',
        gradient: 'from-cyan-400 to-cyan-600',
        accentBg: 'from-cyan-500/20 to-transparent',
        borderHover: 'hover:border-cyan-500/50',
        cardGradient: 'from-[#67e8f9] via-[#cffafe] to-[#22d3ee]',
        cardShadow: 'shadow-[0_15px_35px_-5px_rgba(34,211,238,0.35)]',
        tagCategories: [
            { label: 'Kiểu im lặng', key: 'silence_type', options: ['Đã xem không rep', 'Chưa xem tin', 'Hứa rồi mất hút'] },
            { label: 'Thời gian im lặng', key: 'duration', options: ['1-3 ngày', '1 tuần', '>1 tháng'] },
            { label: 'Đặc điểm khách', key: 'customer_type', options: ['Khách đầu tư', 'Khách mua ở'] }
        ]
    },
    {
        id: 'hen-di-xem',
        label: 'HẸN ĐI XEM',
        icon: MapPin,
        emoji: '📍',
        desc: 'Tương tác nhưng chưa chịu gặp',
        gradient: 'from-amber-400 to-orange-500',
        accentBg: 'from-amber-500/20 to-transparent',
        borderHover: 'hover:border-amber-500/50',
        cardGradient: 'from-[#fbbf24] via-[#fef3c7] to-[#f59e0b]',
        cardShadow: 'shadow-[0_15px_35px_-5px_rgba(245,158,11,0.35)]',
        tagCategories: [
            { label: 'Rào cản', key: 'barrier', options: ['Bận việc', 'Ngại xa', 'Đợi hỏi người thân', 'Chưa tin ảnh mẫu'] },
            { label: 'Thiện chí', key: 'willingness', options: ['Hỏi rất kỹ', 'Chỉ mới hỏi giá', 'Đã từng bùng hẹn'] }
        ]
    },
    {
        id: 'chot-coc',
        label: 'CHỐT CỌC',
        icon: BadgeDollarSign,
        emoji: '💰',
        desc: 'Đã xem thực tế nhưng đắn đo',
        gradient: 'from-emerald-400 to-green-600',
        accentBg: 'from-emerald-500/20 to-transparent',
        borderHover: 'hover:border-emerald-500/50',
        cardGradient: 'from-[#34d399] via-[#a7f3d0] to-[#10b981]',
        cardShadow: 'shadow-[0_15px_35px_-5px_rgba(16,185,129,0.35)]',
        tagCategories: [
            { label: 'Thái độ sau xem', key: 'after_view', options: ['Rất ưng nhưng im lặng', 'Khen nhà nhưng chê giá', 'Im lặng hoàn toàn'] },
            { label: 'Nút thắt', key: 'blocker', options: ['Thiếu vốn', 'Lo quy hoạch', 'Vợ/chồng chưa duyệt', 'Thầy phong thủy chưa duyệt'] }
        ]
    },
    {
        id: 'xu-ly-tu-choi',
        label: 'XỬ LÝ TỪ CHỐI',
        icon: ShieldAlert,
        emoji: '🛡️',
        desc: 'Khách phản hồi tiêu cực',
        gradient: 'from-rose-400 to-red-500',
        accentBg: 'from-rose-500/20 to-transparent',
        borderHover: 'hover:border-rose-500/50',
        cardGradient: 'from-[#fb7185] via-[#ffe4e6] to-[#f43f5e]',
        cardShadow: 'shadow-[0_15px_35px_-5px_rgba(244,63,94,0.35)]',
        tagCategories: [
            { label: 'Nội dung từ chối', key: 'rejection', options: ['Chê đắt', 'Vị trí xấu', 'Pháp lý yếu', 'Đòi cắt hoa hồng'] },
            { label: 'Đối chiếu', key: 'comparison', options: ['Đang so với dự án khác', 'So với căn cũ đã xem'] }
        ]
    }
];

export default function SalesStrategy() {
    const { profile, refreshProfile } = useAuth();
    const [activeView, setActiveView] = useState<'grid' | 'strategy' | 'soan-tin'>('grid');
    const [activeCard, setActiveCard] = useState<StrategyCard | null>(null);
    const [selectedTags, setSelectedTags] = useState<Record<string, string[]>>({});
    const [propertyInfo, setPropertyInfo] = useState({ type: '', location: '', price: '' });
    const [result, setResult] = useState<StrategyResult | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [dailyUsed, setDailyUsed] = useState(0);

    const DAILY_FREE_LIMIT = 5;
    const COST_PER_USE = 2;
    const freeRemaining = Math.max(0, DAILY_FREE_LIMIT - dailyUsed);
    const isFreeUse = dailyUsed < DAILY_FREE_LIMIT;

    // Count today's usage from api_logs
    useEffect(() => {
        const countTodayUsage = async () => {
            if (!profile?.id) return;
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const { count } = await supabase
                .from('api_logs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id)
                .eq('endpoint', 'sales_strategy')
                .gte('created_at', todayStart.toISOString());

            setDailyUsed(count || 0);
        };
        countTodayUsage();
    }, [profile?.id]);

    const handleCardClick = (card: StrategyCard) => {
        setActiveCard(card);
        setSelectedTags({});
        setPropertyInfo({ type: '', location: '', price: '' });
        setResult(null);
        setActiveView('strategy');
    };

    const toggleTag = (categoryKey: string, tag: string) => {
        setSelectedTags(prev => {
            const current = prev[categoryKey] || [];
            return {
                ...prev,
                [categoryKey]: current.includes(tag)
                    ? current.filter(t => t !== tag)
                    : [...current, tag]
            };
        });
    };

    const totalSelectedTags = Object.values(selectedTags).flat().length;

    const handleGenerate = async () => {
        if (totalSelectedTags === 0) {
            toast.error('Chọn ít nhất 1 triệu chứng!');
            return;
        }
        if (!activeCard) return;

        // Daily free limit check
        if (!isFreeUse) {
            const hasCredits = await checkAndDeductCredits(COST_PER_USE, `Chiến thuật: ${activeCard.label}`);
            if (!hasCredits) {
                toast.error(`Hết lượt miễn phí hôm nay. Bạn cần ${COST_PER_USE} Xu để tiếp tục.`);
                return;
            }
        }

        setIsGenerating(true);
        setResult(null);
        try {
            const tagLabels: Record<string, string[]> = {};
            activeCard.tagCategories.forEach(cat => {
                if (selectedTags[cat.key]?.length) {
                    tagLabels[cat.label] = selectedTags[cat.key];
                }
            });

            const res = await generateSalesStrategyAI({
                cardType: activeCard.id,
                cardLabel: activeCard.label,
                selectedTags: tagLabels,
                propertyInfo: propertyInfo
            });

            if (res) {
                setResult(res);
                setDailyUsed(prev => prev + 1);
                if (isFreeUse) {
                    toast.success(`Phân tích xong! (Miễn phí ${freeRemaining - 1} lượt còn lại)`);
                } else {
                    toast.success(`Phân tích xong! (Đã trừ ${COST_PER_USE} Xu)`);
                    await refreshProfile?.();
                }
            } else {
                toast.error('AI không trả về kết quả. Thử lại nhé.');
            }
        } catch {
            toast.error('Lỗi khi phân tích.');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        toast.success('Đã copy!');
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const goBack = () => {
        setActiveView('grid');
        setActiveCard(null);
        setResult(null);
    };

    const CopyBtn = ({ text, id, label }: { text: string; id: string; label: string }) => (
        <button
            onClick={() => copyToClipboard(text, id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all uppercase shrink-0 ${copiedKey === id ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'}`}
        >
            {copiedKey === id ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
            {copiedKey === id ? 'Đã Copy' : label}
        </button>
    );

    // ═══════════════════════════ GRID VIEW ═══════════════════════════
    if (activeView === 'grid') {
        return (
            <div className="h-[calc(100vh-60px)] md:h-[calc(100vh-80px)] overflow-hidden flex flex-col">
                {/* Header - Matching Image Studio Style */}
                <div className="flex justify-between items-center shrink-0 mb-4 px-1 md:px-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-gold to-[#aa771c] rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                            <Target className="text-black" size={18} strokeWidth={3} />
                        </div>
                        <div>
                            <h1 className="text-lg md:text-xl font-black text-white tracking-widest leading-none uppercase italic">CHỐT SALE <span className="text-gold">HỘ BẠN</span></h1>
                            <p className="text-[7px] font-black text-slate-500 tracking-[0.4em] uppercase mt-1">AI Sales Strategy Engine</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-10 px-1 md:px-0">
                    {/* 5 Cards Grid — Image Studio Style */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
                        {STRATEGY_CARDS.map((card) => (
                            <button
                                key={card.id}
                                onClick={() => handleCardClick(card)}
                                className="group relative p-6 md:p-8 flex flex-col items-center justify-center text-center gap-5 rounded-[2.5rem] bg-[#1a2332] border-2 border-white/5 shadow-2xl hover:border-gold/50 transition-all duration-500 overflow-hidden"
                            >
                                <div className="w-20 h-20 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-[1.8rem] flex items-center justify-center shadow-lg border border-white/25 group-hover:scale-110 transition-transform duration-500">
                                    <card.icon size={38} className="text-[#131b2e]" strokeWidth={2.5} />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-lg md:text-xl font-black text-white group-hover:text-gold transition-colors uppercase italic tracking-tighter leading-tight">{card.label}</h2>
                                    <p className="text-[10px] md:text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-all leading-relaxed line-clamp-2 max-w-[220px]">
                                        {card.desc}
                                    </p>
                                </div>

                                <div className="mt-4 py-3 px-8 bg-gradient-to-r from-gold via-[#fcf6ba] to-gold rounded-full flex items-center gap-3 text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-gold/20 scale-90 group-hover:scale-100 transition-all duration-500">
                                    Bắt đầu ngay
                                    <ArrowRight size={14} strokeWidth={4} />
                                </div>
                            </button>
                        ))}

                        {/* Soạn Tin Card — Same Style */}
                        <button
                            onClick={() => setActiveView('soan-tin')}
                            className="group relative p-6 md:p-8 flex flex-col items-center justify-center text-center gap-5 rounded-[2.5rem] bg-[#1a2332] border-2 border-gold/40 shadow-[0_20px_40px_-5px_rgba(0,0,0,0.4)] hover:border-gold/50 transition-all duration-500 overflow-hidden"
                        >
                            <div className="w-20 h-20 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-[1.8rem] flex items-center justify-center shadow-lg border border-white/25 group-hover:scale-110 transition-transform duration-500">
                                <PenTool size={38} className="text-[#131b2e]" strokeWidth={2.5} />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-lg md:text-xl font-black text-white group-hover:text-gold transition-colors uppercase italic tracking-tighter leading-tight">Soạn Tin</h2>
                                <p className="text-[10px] md:text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-all leading-relaxed line-clamp-2 max-w-[220px]">
                                    Caption đăng tin tự động bằng AI
                                </p>
                            </div>

                            <div className="mt-4 py-3 px-8 bg-gradient-to-r from-gold via-[#fcf6ba] to-gold rounded-full flex items-center gap-3 text-black font-black text-[10px] uppercase tracking-widest shadow-lg shadow-gold/20 scale-90 group-hover:scale-100 transition-all duration-500">
                                Bắt đầu ngay
                                <ArrowRight size={14} strokeWidth={4} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════ SOẠN TIN VIEW ═══════════════════════════
    if (activeView === 'soan-tin') {
        return (
            <div className="h-full flex flex-col animate-in fade-in duration-300">
                <button onClick={goBack} className="flex items-center gap-2 text-slate-400 hover:text-gold font-black text-[10px] uppercase tracking-widest mb-4 transition-colors shrink-0 w-fit">
                    <ArrowLeft size={14} strokeWidth={3} /> Quay lại
                </button>
                <ContentCreator />
            </div>
        );
    }

    // ═══════════════════════════ STRATEGY VIEW ═══════════════════════════
    if (!activeCard) return null;

    return (
        <div className="h-full md:h-[calc(100vh-80px)] overflow-y-auto md:overflow-hidden flex flex-col animate-in fade-in duration-300">
            {/* Back + Header */}
            <div className="flex items-center gap-3 mb-4 shrink-0">
                <button onClick={goBack} className="flex items-center gap-1.5 text-slate-400 hover:text-gold font-black text-[10px] uppercase tracking-widest transition-colors shrink-0">
                    <ArrowLeft size={14} strokeWidth={3} /> Quay lại
                </button>
                <div className="w-px h-5 bg-white/10" />
                <div className={`w-8 h-8 bg-gradient-to-br ${activeCard.gradient} rounded-xl flex items-center justify-center shadow-md shrink-0`}>
                    <activeCard.icon size={16} className="text-white" strokeWidth={2.5} />
                </div>
                <h2 className="text-base md:text-lg font-black text-white uppercase tracking-widest italic">{activeCard.label}</h2>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start flex-1 md:overflow-hidden">
                {/* ═══ LEFT: FORM ═══ */}
                <div className="xl:col-span-5 flex flex-col md:h-full md:overflow-y-auto no-scrollbar pb-6">
                    <div className="bg-[#1a2332] p-5 rounded-[2rem] border border-white/5 shadow-2xl space-y-4 relative overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br ${activeCard.accentBg} opacity-20 pointer-events-none`} />

                        {/* Tag Categories */}
                        <div className="space-y-4 relative z-10">
                            <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2 pb-1.5 border-b border-white/5">
                                <Brain size={12} strokeWidth={3} /> Chọn triệu chứng
                            </h3>

                            {activeCard.tagCategories.map((cat) => (
                                <div key={cat.key} className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{cat.label}</label>
                                    <div className="flex flex-wrap gap-2">
                                        {cat.options.map((opt) => {
                                            const isSelected = (selectedTags[cat.key] || []).includes(opt);
                                            return (
                                                <button
                                                    key={opt}
                                                    onClick={() => toggleTag(cat.key, opt)}
                                                    className={`px-3 py-1.5 rounded-xl border transition-all text-[9px] uppercase font-black tracking-widest ${isSelected
                                                        ? 'bg-gold/10 border-gold text-gold shadow-md shadow-gold/10'
                                                        : 'bg-[#212b3d] border-white/5 text-slate-300 hover:border-gold/30 hover:bg-[#2a364b]'
                                                        }`}
                                                >
                                                    {opt}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Optional BDS Info */}
                        <div className="space-y-3 pt-2 mt-2 border-t border-white/5 relative z-10">
                            <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] flex items-center gap-2 pb-1.5 border-b border-white/5">
                                <Info size={12} strokeWidth={3} /> Thông tin BĐS (tuỳ chọn)
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                <input type="text" placeholder="Loại hình" value={propertyInfo.type} onChange={e => setPropertyInfo(p => ({ ...p, type: e.target.value }))}
                                    className="px-2.5 py-1.5 h-8 rounded-xl border border-white/5 bg-[#212b3d] text-white outline-none focus:border-gold/50 font-bold text-[10px] tracking-wide transition-all" />
                                <input type="text" placeholder="Vị trí" value={propertyInfo.location} onChange={e => setPropertyInfo(p => ({ ...p, location: e.target.value }))}
                                    className="px-2.5 py-1.5 h-8 rounded-xl border border-white/5 bg-[#212b3d] text-white outline-none focus:border-gold/50 font-bold text-[10px] tracking-wide transition-all" />
                                <input type="text" placeholder="Giá" value={propertyInfo.price} onChange={e => setPropertyInfo(p => ({ ...p, price: e.target.value }))}
                                    className="px-2.5 py-1.5 h-8 rounded-xl border border-white/5 bg-[#212b3d] text-white outline-none focus:border-gold/50 font-bold text-[10px] tracking-wide transition-all" />
                            </div>
                        </div>

                        {/* Daily Free Usage Badge */}
                        <div className="flex items-center justify-between text-[10px] mt-1 z-10 relative">
                            {isFreeUse ? (
                                <span className="flex items-center gap-1.5 text-emerald-400 font-black">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    Miễn phí {freeRemaining}/{DAILY_FREE_LIMIT} lượt hôm nay
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-amber-400 font-black">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    Hết miễn phí — {COST_PER_USE} Xu/lượt
                                </span>
                            )}
                            <span className="text-slate-500 font-bold">Đã dùng: {dailyUsed} lượt</span>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || totalSelectedTags === 0}
                            className="w-full mt-2 py-3 bg-gradient-to-r from-gold to-[#aa771c] text-black rounded-xl font-black text-[11px] tracking-[0.2em] shadow-xl shadow-gold/20 flex justify-center items-center gap-2 uppercase hover:scale-[1.02] transition-all disabled:opacity-50 border border-white/20 relative overflow-hidden group z-10"
                        >
                            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} fill="currentColor" className="group-hover:rotate-12 transition-transform" />}
                            {isGenerating ? 'QUÂN SƯ ĐANG PHÂN TÍCH...' : isFreeUse ? `NHẬN CHIẾN THUẬT MIỄN PHÍ (${totalSelectedTags})` : `NHẬN CHIẾN THUẬT — ${COST_PER_USE} XU (${totalSelectedTags})`}
                        </button>
                    </div>
                </div>

                {/* ═══ RIGHT: RESULTS ═══ */}
                <div className="xl:col-span-7 flex flex-col md:h-full md:overflow-y-auto no-scrollbar pb-6 space-y-4">
                    {result ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Diagnosis */}
                            <div className="bg-[#1a2332] p-5 rounded-[2rem] border border-cyan-500/20 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.04] pointer-events-none"><Brain size={80} /></div>
                                <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2.5">
                                    <span className="text-[9px] font-black text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-cyan-500/20">🧠 Chẩn đoán tâm lý</span>
                                </div>
                                <p className="text-slate-300 text-xs leading-relaxed font-medium">{result.diagnosis}</p>
                            </div>

                            {/* Strategy */}
                            <div className="bg-[#1a2332] p-5 rounded-[2rem] border border-amber-500/20 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.04] pointer-events-none"><Lightbulb size={80} /></div>
                                <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2.5">
                                    <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-amber-500/20">⚔️ Chiến thuật</span>
                                </div>
                                <p className="text-slate-300 text-xs leading-relaxed font-medium">{result.strategy}</p>
                            </div>

                            {/* Message A */}
                            <div className="bg-[#1a2332] p-5 rounded-[2rem] border border-gold/20 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700"><Zap size={90} fill="currentColor" className="text-gold" /></div>
                                <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2.5">
                                    <span className="text-[9px] font-black text-gold bg-gold/10 px-3 py-1 rounded-full uppercase tracking-widest border border-gold/20">A. Phương án số liệu</span>
                                    <CopyBtn text={result.message_a} id="msg_a" label="Copy" />
                                </div>
                                <div className="whitespace-pre-wrap text-slate-300 text-xs leading-relaxed font-medium">{result.message_a}</div>
                            </div>

                            {/* Message B */}
                            <div className="bg-[#1a2332] p-5 rounded-[2rem] border border-white/10 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700"><Sparkles size={90} fill="currentColor" className="text-white" /></div>
                                <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2.5">
                                    <span className="text-[9px] font-black text-slate-300 bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest border border-white/20">B. Phương án cảm xúc</span>
                                    <CopyBtn text={result.message_b} id="msg_b" label="Copy" />
                                </div>
                                <div className="whitespace-pre-wrap text-slate-300 text-xs leading-relaxed font-medium">{result.message_b}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-[#1a2332] rounded-[2rem] border-2 border-dashed border-white/5 text-center px-10">
                            <div className={`w-16 h-16 bg-gradient-to-br ${activeCard.gradient} rounded-full flex items-center justify-center mb-4 shadow-lg opacity-30`}>
                                <activeCard.icon size={28} className="text-white" />
                            </div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2">Chờ lệnh quân sư</h3>
                            <p className="text-[10px] text-slate-500 font-bold max-w-xs">Chọn triệu chứng bên trái rồi bấm NHẬN CHIẾN THUẬT để AI phân tích tâm lý và đưa ra mẫu tin nhắn.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
