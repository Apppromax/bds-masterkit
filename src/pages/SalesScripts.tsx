import React, { useState } from 'react';
import { Search, MessageSquare, Copy, Send, Filter, Hash, Check } from 'lucide-react';
import { SCRIPTS, CATEGORIES, type ScriptItem } from '../data/scripts';

export default function SalesScripts() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const filteredScripts = SCRIPTS.filter((script) => {
        const matchesSearch =
            script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            script.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            script.situation.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || script.categoryId === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleSendZalo = (content: string) => {
        navigator.clipboard.writeText(content);
        alert('Đã sao chép nội dung! Đang mở Zalo...');
        window.open('https://chat.zalo.me/', '_blank');
    };

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col pb-4">
            {/* Header Area */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                        <MessageSquare className="text-[#bf953f]" size={24} strokeWidth={3} />
                        Kịch Bản <span className="text-gold">Sales Pro</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-[9px] mt-1 tracking-[0.3em] uppercase">Elite Sales closing & Objection Handling Library</p>
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#bf953f] transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Tìm bài mẫu xử lý..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:border-[#bf953f]/50 outline-none font-bold text-[11px] shadow-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
                {/* Categories Sidebar */}
                <div className="hidden lg:flex flex-col w-60 space-y-1.5 overflow-y-auto no-scrollbar pb-4 pr-1">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`p-3.5 rounded-xl text-left transition-all flex items-center gap-3 border ${selectedCategory === 'all'
                            ? 'bg-[#bf953f] text-black border-[#bf953f] shadow-lg shadow-[#bf953f]/10'
                            : 'bg-white/5 text-slate-500 hover:bg-white/10 border-white/5 uppercase tracking-widest'}`}
                    >
                        <div className={`p-1.5 rounded-lg ${selectedCategory === 'all' ? 'bg-black/20 text-black' : 'bg-white/5'}`}>
                            <Filter size={14} strokeWidth={3} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Tất cả bài mẫu</span>
                    </button>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`p-3.5 rounded-xl text-left transition-all flex items-center gap-3 border ${selectedCategory === cat.id
                                ? 'bg-[#bf953f] text-black border-[#bf953f] shadow-lg shadow-[#bf953f]/10'
                                : 'bg-white/5 text-slate-500 hover:bg-white/10 border-white/5 uppercase tracking-widest'}`}
                        >
                            <div className={`p-1.5 rounded-lg ${selectedCategory === cat.id ? 'bg-black/20 text-black' : 'bg-white/5'}`}>
                                <Hash size={14} strokeWidth={3} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6 space-y-4">
                    {/* Mobile Categories Slider */}
                    <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === 'all' ? 'bg-[#bf953f] text-black border-[#bf953f]' : 'bg-white/5 text-slate-500 border-white/5'}`}
                        >
                            Tất cả
                        </button>
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === cat.id ? 'bg-[#bf953f] text-black border-[#bf953f]' : 'bg-white/5 text-slate-500 border-white/5'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {filteredScripts.length > 0 ? (
                            filteredScripts.map((script) => (
                                <div key={script.id} className="group glass-card bg-white/[0.02] p-5 rounded-2xl border border-white/5 hover:border-[#bf953f]/30 transition-all flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-5">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-[8px] font-black text-[#bf953f] uppercase tracking-widest">
                                                {CATEGORIES.find(c => c.id === script.categoryId)?.name}
                                            </span>
                                            <h3 className="font-black text-base text-white leading-tight pr-4">{script.title}</h3>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleCopy(script.content, script.id)}
                                                className={`p-2.5 rounded-xl transition-all border ${copiedId === script.id ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 text-slate-500 border-white/5 hover:text-[#bf953f] hover:border-[#bf953f]/20'}`}
                                            >
                                                {copiedId === script.id ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                                            </button>
                                            <button
                                                onClick={() => handleSendZalo(script.content)}
                                                className="p-2.5 bg-[#bf953f]/10 text-[#bf953f] rounded-xl border border-[#bf953f]/20 hover:bg-[#bf953f] hover:text-black transition-all"
                                            >
                                                <Send size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-[#bf953f]/5 rounded-xl border border-[#bf953f]/10 mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
                                            <p className="text-[9px] font-black text-[#fcf6ba] uppercase tracking-widest">Tình huống giả định</p>
                                        </div>
                                        <p className="text-[11px] text-slate-300 font-bold leading-relaxed italic opacity-80">
                                            "{script.situation}"
                                        </p>
                                    </div>

                                    <div className="flex-1 p-5 bg-black/40 rounded-xl border border-white/5 mb-4 group-hover:border-white/10 transition-colors">
                                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-3">Mẫu phản hồi Elite</p>
                                        <div className="text-[12px] text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                                            {script.content}
                                        </div>
                                    </div>

                                    <div className="flex gap-1.5 flex-wrap">
                                        {script.tags.map(tag => (
                                            <span key={tag} className="text-[8px] font-black px-2 py-1 bg-white/5 text-slate-600 border border-white/5 rounded-md uppercase tracking-tighter">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-30">
                                <Search size={48} className="mb-4 text-slate-600" />
                                <p className="text-sm font-black text-slate-500 uppercase tracking-widest italic">Kịch bản này chưa được huấn luyện sếp ơi!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
