import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
    Plus, Trash2, Edit3, Save, X, Loader2, Snowflake, MapPin,
    BadgeDollarSign, ShieldAlert, ToggleLeft, ToggleRight, Target,
    Zap, ChevronDown, ChevronUp, GripVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SalesHook {
    id: string;
    card_id: number;
    hook_name: string;
    strategy_description: string;
    context_template: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

const CARD_CONFIG = [
    { id: 1, label: 'PHÁ BĂNG', icon: Snowflake, emoji: '🧊', color: 'cyan', gradient: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', text: 'text-cyan-400' },
    { id: 2, label: 'HẸN ĐI XEM', icon: MapPin, emoji: '📍', color: 'amber', gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', text: 'text-amber-400' },
    { id: 3, label: 'CHỐT CỌC', icon: BadgeDollarSign, emoji: '💰', color: 'emerald', gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    { id: 4, label: 'XỬ LÝ TỪ CHỐI', icon: ShieldAlert, emoji: '🛡️', color: 'rose', gradient: 'from-rose-500 to-red-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', text: 'text-rose-400' }
];

const EMPTY_FORM: Omit<SalesHook, 'id' | 'created_at' | 'updated_at'> = {
    card_id: 1,
    hook_name: '',
    strategy_description: '',
    context_template: '',
    is_active: true
};

export default function SalesHookManager() {
    const [hooks, setHooks] = useState<SalesHook[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCard, setExpandedCard] = useState<number | null>(1);
    const [editingHook, setEditingHook] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState<number | null>(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [isSaving, setIsSaving] = useState(false);

    const loadHooks = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('sales_hooks')
            .select('*')
            .order('card_id', { ascending: true })
            .order('created_at', { ascending: true });

        if (error) {
            toast.error('Lỗi tải dữ liệu Hook: ' + error.message);
        } else {
            setHooks(data || []);
        }
        setIsLoading(false);
    };

    useEffect(() => { loadHooks(); }, []);

    const handleAdd = async (cardId: number) => {
        if (!formData.hook_name.trim() || !formData.strategy_description.trim()) {
            toast.error('Vui lòng điền Tên Hook và Chiến thuật!');
            return;
        }
        setIsSaving(true);
        const { data, error } = await supabase
            .from('sales_hooks')
            .insert({ ...formData, card_id: cardId })
            .select()
            .single();

        if (error) {
            toast.error('Lỗi thêm Hook: ' + error.message);
        } else if (data) {
            setHooks(prev => [...prev, data]);
            setFormData(EMPTY_FORM);
            setShowAddForm(null);
            toast.success('Đã thêm Hook mới!');
        }
        setIsSaving(false);
    };

    const handleUpdate = async (hookId: string) => {
        if (!formData.hook_name.trim() || !formData.strategy_description.trim()) {
            toast.error('Vui lòng điền Tên Hook và Chiến thuật!');
            return;
        }
        setIsSaving(true);
        const { error } = await supabase
            .from('sales_hooks')
            .update({
                hook_name: formData.hook_name,
                strategy_description: formData.strategy_description,
                context_template: formData.context_template,
                is_active: formData.is_active
            })
            .eq('id', hookId);

        if (error) {
            toast.error('Lỗi cập nhật: ' + error.message);
        } else {
            setHooks(prev => prev.map(h => h.id === hookId ? { ...h, ...formData } : h));
            setEditingHook(null);
            toast.success('Đã cập nhật Hook!');
        }
        setIsSaving(false);
    };

    const handleDelete = async (hookId: string, hookName: string) => {
        if (!window.confirm(`Xóa Hook "${hookName}"? Hành động này không thể hoàn tác.`)) return;

        const { error } = await supabase.from('sales_hooks').delete().eq('id', hookId);
        if (error) {
            toast.error('Lỗi xóa Hook: ' + error.message);
        } else {
            setHooks(prev => prev.filter(h => h.id !== hookId));
            toast.success('Đã xóa Hook!');
        }
    };

    const handleToggleActive = async (hook: SalesHook) => {
        const newVal = !hook.is_active;
        const { error } = await supabase
            .from('sales_hooks')
            .update({ is_active: newVal })
            .eq('id', hook.id);

        if (error) {
            toast.error('Lỗi thay đổi trạng thái');
        } else {
            setHooks(prev => prev.map(h => h.id === hook.id ? { ...h, is_active: newVal } : h));
            toast.success(newVal ? 'Đã kích hoạt Hook' : 'Đã tắt Hook');
        }
    };

    const startEdit = (hook: SalesHook) => {
        setEditingHook(hook.id);
        setFormData({
            card_id: hook.card_id,
            hook_name: hook.hook_name,
            strategy_description: hook.strategy_description,
            context_template: hook.context_template,
            is_active: hook.is_active
        });
    };

    const cancelEdit = () => {
        setEditingHook(null);
        setFormData(EMPTY_FORM);
    };

    const startAdd = (cardId: number) => {
        setShowAddForm(cardId);
        setEditingHook(null);
        setFormData({ ...EMPTY_FORM, card_id: cardId });
    };

    const cancelAdd = () => {
        setShowAddForm(null);
        setFormData(EMPTY_FORM);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-gold" size={32} />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-amber-500/20">
                        <Target size={24} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-black text-xl text-slate-800 dark:text-white flex items-center gap-2">
                            Quản trị Hook — Chốt Sale
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Thêm, sửa, xóa Hook để AI sử dụng khi tạo chiến thuật cho Sale
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                    <Zap size={14} className="text-amber-400" />
                    {hooks.filter(h => h.is_active).length} Hook đang hoạt động / {hooks.length} tổng
                </div>
            </div>

            {/* 4 Card Sections */}
            <div className="space-y-4">
                {CARD_CONFIG.map(card => {
                    const cardHooks = hooks.filter(h => h.card_id === card.id);
                    const activeCount = cardHooks.filter(h => h.is_active).length;
                    const isExpanded = expandedCard === card.id;
                    const CardIcon = card.icon;

                    return (
                        <div
                            key={card.id}
                            className={`rounded-3xl border transition-all duration-300 overflow-hidden ${isExpanded ? `${card.border} shadow-lg` : 'border-slate-200 dark:border-slate-800'}`}
                        >
                            {/* Card Header */}
                            <button
                                onClick={() => setExpandedCard(isExpanded ? null : card.id)}
                                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${card.gradient} rounded-2xl flex items-center justify-center shadow-md`}>
                                        <CardIcon size={22} className="text-white" strokeWidth={2.5} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-black text-base text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                            {card.emoji} {card.label}
                                        </h3>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                            {activeCount} hook active / {cardHooks.length} tổng
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <div className="px-5 pb-5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {/* Hook List */}
                                    {cardHooks.length === 0 && (
                                        <div className="text-center py-8 text-slate-400">
                                            <GripVertical size={32} className="mx-auto mb-2 opacity-30" />
                                            <p className="text-sm font-bold">Chưa có Hook nào cho thẻ này</p>
                                            <p className="text-[10px]">Bấm "+ Thêm Hook mới" để bắt đầu</p>
                                        </div>
                                    )}

                                    {cardHooks.map(hook => (
                                        <div
                                            key={hook.id}
                                            className={`rounded-2xl border p-4 transition-all ${hook.is_active
                                                ? 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                                                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60'
                                                }`}
                                        >
                                            {editingHook === hook.id ? (
                                                /* Edit Mode */
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Tên Hook</label>
                                                            <input
                                                                type="text"
                                                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/40"
                                                                value={formData.hook_name}
                                                                onChange={e => setFormData(f => ({ ...f, hook_name: e.target.value }))}
                                                                placeholder="VD: Tin hạ tầng"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Chiến thuật (cho AI)</label>
                                                            <input
                                                                type="text"
                                                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/40"
                                                                value={formData.strategy_description}
                                                                onChange={e => setFormData(f => ({ ...f, strategy_description: e.target.value }))}
                                                                placeholder="VD: Đánh vào tâm lý FOMO"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Gợi ý nội dung cho AI (Context)</label>
                                                        <textarea
                                                            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-amber-500/40 resize-y min-h-[80px]"
                                                            value={formData.context_template}
                                                            onChange={e => setFormData(f => ({ ...f, context_template: e.target.value }))}
                                                            placeholder="VD: Nhắc về đường vành đai 4, metro sắp hoàn thành..."
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={cancelEdit} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                                            <X size={14} className="inline mr-1" /> Hủy
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdate(hook.id)}
                                                            disabled={isSaving}
                                                            className="px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
                                                        >
                                                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Lưu
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* View Mode */
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <h4 className="font-black text-sm text-slate-800 dark:text-white">{hook.hook_name}</h4>
                                                            {!hook.is_active && (
                                                                <span className="text-[8px] font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full uppercase">Tắt</span>
                                                            )}
                                                        </div>
                                                        <p className={`text-[11px] font-bold mb-1 ${card.text}`}>
                                                            ⚔️ {hook.strategy_description}
                                                        </p>
                                                        {hook.context_template && (
                                                            <p className="text-[10px] text-slate-400 font-medium line-clamp-2">
                                                                💡 {hook.context_template}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <button
                                                            onClick={() => handleToggleActive(hook)}
                                                            className={`p-1.5 rounded-lg transition-all ${hook.is_active ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                                            title={hook.is_active ? 'Tắt Hook' : 'Bật Hook'}
                                                        >
                                                            {hook.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                                        </button>
                                                        <button
                                                            onClick={() => startEdit(hook)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                                                            title="Sửa"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(hook.id, hook.hook_name)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Add New Hook Form */}
                                    {showAddForm === card.id ? (
                                        <div className={`rounded-2xl border-2 border-dashed p-4 space-y-3 ${card.border} ${card.bg}`}>
                                            <h4 className={`text-[10px] font-black uppercase tracking-widest ${card.text} flex items-center gap-1.5`}>
                                                <Plus size={12} /> Thêm Hook mới cho {card.label}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Tên Hook *</label>
                                                    <input
                                                        type="text"
                                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/40"
                                                        value={formData.hook_name}
                                                        onChange={e => setFormData(f => ({ ...f, hook_name: e.target.value }))}
                                                        placeholder="VD: Sốt đất X"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Chiến thuật *</label>
                                                    <input
                                                        type="text"
                                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500/40"
                                                        value={formData.strategy_description}
                                                        onChange={e => setFormData(f => ({ ...f, strategy_description: e.target.value }))}
                                                        placeholder="VD: Đánh vào hạ tầng"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Gợi ý cho AI (Context)</label>
                                                <textarea
                                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-amber-500/40 resize-y min-h-[80px]"
                                                    value={formData.context_template}
                                                    onChange={e => setFormData(f => ({ ...f, context_template: e.target.value }))}
                                                    placeholder="VD: Nhắc về đường vành đai 4..."
                                                />
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={cancelAdd} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                                                    Hủy
                                                </button>
                                                <button
                                                    onClick={() => handleAdd(card.id)}
                                                    disabled={isSaving}
                                                    className="px-5 py-2 rounded-xl text-xs font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
                                                >
                                                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Thêm Hook
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => startAdd(card.id)}
                                            className={`w-full py-3 rounded-2xl border-2 border-dashed text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:shadow-md ${card.border} ${card.text} hover:${card.bg}`}
                                        >
                                            <Plus size={14} /> Thêm Hook mới
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
