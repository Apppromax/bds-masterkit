import React, { useState } from 'react';
import { Search, MessageSquare, Copy, Send, Filter, Hash, Check, Zap } from 'lucide-react';
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
        <div className="h-[calc(100vh-100px)] flex flex-col overflow-hidden">
            {/* Header - High Pop & Compact */}
            <div className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
                <div>
                    <h1 className="text-xl font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                        <MessageSquare className="text-gold" size={20} strokeWidth={3} />
                        Kịch Bản <span className="text-[#bf953f] italic">Sales Pro</span>
                    </h1>
                    <p className="text-slate-500 font-bold text-[7px] mt-0.5 tracking-[0.4em] uppercase opacity-80">Elite Sales closing Library</p>
                </div>

                <div className="relative w-full md:w-72 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors" size={14} strokeWidth={3} />
                    <input
                        type="text"
                        placeholder="Tìm kịch bản chốt deal..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/5 bg-[#1a2332] text-white focus:border-gold/40 outline-none font-bold text-[10px] shadow-2xl transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-1 gap-5 overflow-hidden min-h-0">
                {/* Sidebar - Compact & Integrated */}
                <div className="hidden lg:flex flex-col w-56 space-y-1 overflow-y-auto no-scrollbar pb-4">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 border-2 ${selectedCategory === 'all'
                            ? 'bg-gold text-black border-gold shadow-[0_10px_30px_rgba(191,149,63,0.3)]'
                            : 'bg-white/5 text-slate-500 hover:bg-white/10 border-transparent'}`}
                    >
                        <Filter size={14} strokeWidth={3} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Tất cả mẫu</span>
                    </button>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`p-3 rounded-xl text-left transition-all flex items-center gap-3 border-2 ${selectedCategory === cat.id
                                ? 'bg-gold text-black border-gold shadow-[0_10px_30px_rgba(191,149,63,0.3)]'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10 border-transparent'}`}
                        >
                            <Hash size={14} strokeWidth={3} />
                            <span className="text-[9px] font-black uppercase tracking-widest truncate">{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content - High Visibility Cards */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6 space-y-4">
                    {/* Mobile Slider */}
                    <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                        <button onClick={() => setSelectedCategory('all')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 ${selectedCategory === 'all' ? 'bg-gold text-black border-gold' : 'bg-white/5 text-slate-500 border-transparent'}`}>Tất cả</button>
                        {CATEGORIES.map((cat) => (
                            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border-2 ${selectedCategory === cat.id ? 'bg-gold text-black border-gold' : 'bg-white/5 text-slate-500 border-transparent'}`}>{cat.name}</button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {filteredScripts.length > 0 ? (
                            filteredScripts.map((script) => (
                                <div key={script.id} className="group glass-card bg-[#1a2332] p-5 rounded-[2rem] border border-white/5 hover:border-gold/30 transition-all flex flex-col h-full shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-10 transition-opacity">
                                        <Zap size={60} className="text-gold" />
                                    </div>

                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[7px] font-black text-gold uppercase tracking-[0.3em]">
                                                {CATEGORIES.find(c => c.id === script.categoryId)?.name}
                                            </span>
                                            <h3 className="font-black text-sm md:text-base text-white leading-tight pr-4 uppercase italic tracking-tighter">{script.title}</h3>
                                        </div>
                                        <div className="flex gap-1.5 shrink-0">
                                            <button
                                                onClick={() => handleCopy(script.content, script.id)}
                                                className={`p-2.5 rounded-lg transition-all border-2 ${copiedId === script.id ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-white/5 text-slate-500 border-white/5 hover:text-gold hover:border-gold/30'}`}
                                            >
                                                {copiedId === script.id ? <Check size={14} strokeWidth={4} /> : <Copy size={14} strokeWidth={2.5} />}
                                            </button>
                                            <button
                                                onClick={() => handleSendZalo(script.content)}
                                                className="p-2.5 bg-gold/10 text-gold rounded-lg border-2 border-gold/20 hover:bg-gold hover:text-black transition-all shadow-lg shadow-gold/5"
                                            >
                                                <Send size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-gold/5 rounded-xl border border-gold/20 mb-4 relative z-10">
                                        <div className="flex items-center gap-1.5 mb-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></div>
                                            <p className="text-[7px] font-black text-gold/60 uppercase tracking-widest">Tình huống giả định</p>
                                        </div>
                                        <p className="text-[10px] text-white font-bold leading-relaxed italic opacity-80">
                                            "{script.situation}"
                                        </p>
                                    </div>

                                    <div className="flex-1 p-4 bg-black/60 rounded-xl border border-white/5 mb-4 relative z-10 group-hover:border-white/10 transition-colors">
                                        <p className="text-[7px] font-black text-slate-700 uppercase tracking-widest mb-2">Mẫu phản hồi Elite</p>
                                        <div className="text-[11px] text-slate-300 font-medium leading-relaxed whitespace-pre-wrap">
                                            {script.content}
                                        </div>
                                    </div>

                                    <div className="flex gap-1.5 flex-wrap relative z-10">
                                        {script.tags.map(tag => (
                                            <span key={tag} className="text-[7px] font-black px-2 py-0.5 bg-white/5 text-slate-600 border border-white/5 rounded-md uppercase">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-20">
                                <Search size={40} className="mb-4 text-slate-700" />
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Không tìm thấy kịch bản phù hợp</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(191, 149, 63, 0.2); border-radius: 10px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(191, 149, 63, 0.5); }` }} />
        </div>
    );
}
