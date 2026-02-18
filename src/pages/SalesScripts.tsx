import React, { useState } from 'react';
import { Search, MessageSquare, Copy, Send, Filter, Hash } from 'lucide-react';
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
        // Zalo doesn't have a direct deep link for creating a message with body on web clearly documented & reliable for all platforms
        // But we can try opening Zalo Web or just rely on clipboard
        // Ideally on mobile "zalo://..." might work but often restricted
        // Best UX: Copy content -> Open Zalo
        navigator.clipboard.writeText(content);
        alert('Đã sao chép nội dung! Đang mở Zalo...');
        window.open('https://chat.zalo.me/', '_blank');
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col">
            {/* Header Area */}
            <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                            <MessageSquare className="text-white" size={20} />
                        </div>
                        KỊCH BẢN CHỐT SALE PRO
                    </h1>
                    <p className="text-slate-400 font-bold text-xs mt-1 tracking-wide uppercase">Thư viện bài mẫu xử lý từ chối & chốt sales đỉnh cao</p>
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kịch bản..."
                        className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-slate-50 dark:border-white/5 bg-white dark:bg-slate-900 focus:border-blue-500 outline-none font-bold text-sm shadow-sm transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden min-h-0">
                {/* Categories Sidebar */}
                <div className="hidden lg:flex flex-col w-64 space-y-2 overflow-y-auto no-scrollbar pb-4 pr-1">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        className={`p-4 rounded-2xl text-left transition-all flex items-center gap-3 ${selectedCategory === 'all'
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 font-black'
                            : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-white dark:hover:bg-slate-800 border border-slate-50 dark:border-white/5 font-bold'}`}
                    >
                        <div className={`p-1.5 rounded-lg ${selectedCategory === 'all' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            <Filter size={16} />
                        </div>
                        <span className="text-xs uppercase tracking-widest">Tất cả bài mẫu</span>
                    </button>
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`p-4 rounded-2xl text-left transition-all flex items-center gap-3 ${selectedCategory === cat.id
                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 font-black'
                                : 'bg-white dark:bg-slate-900 text-slate-500 hover:bg-white dark:hover:bg-slate-800 border border-slate-50 dark:border-white/5 font-bold'}`}
                        >
                            <div className={`p-1.5 rounded-lg ${selectedCategory === cat.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                <Hash size={16} />
                            </div>
                            <span className="text-xs uppercase tracking-widest">{cat.name}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-6">
                    {/* Mobile Categories Slider */}
                    <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-50'}`}
                        >
                            Tất cả
                        </button>
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-50'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {filteredScripts.length > 0 ? (
                            filteredScripts.map((script) => (
                                <div key={script.id} className="group bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-50 dark:border-white/5 hover:border-blue-200 transition-all flex flex-col h-full hover:shadow-2xl hover:shadow-blue-500/5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">
                                                {CATEGORIES.find(c => c.id === script.categoryId)?.name}
                                            </span>
                                            <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight">{script.title}</h3>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleCopy(script.content, script.id)}
                                                className={`p-3 rounded-xl transition-all ${copiedId === script.id ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                                                title="Sao chép"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleSendZalo(script.content)}
                                                className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="Gửi Zalo"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 mb-4">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                            <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Tình huống xử lý</p>
                                        </div>
                                        <p className="text-xs text-amber-900 dark:text-amber-200 font-bold leading-relaxed italic">
                                            "{script.situation}"
                                        </p>
                                    </div>

                                    <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-white/5 mb-4 group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Nội dung đề xuất</p>
                                        <div className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                                            {script.content}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 flex-wrap">
                                        {script.tags.map(tag => (
                                            <span key={tag} className="text-[8px] font-black px-2 py-1 bg-white dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-white/5 rounded-lg uppercase">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 opacity-30">
                                <Search size={64} className="mb-4 text-slate-300" />
                                <p className="text-xl font-black text-slate-400 uppercase tracking-widest">Không có kịch bản này sếp ơi!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
