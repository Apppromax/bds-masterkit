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
        <div className="pb-20 md:pb-0">
            <div className="mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                    <MessageSquare className="text-blue-600" /> Kịch bản Sales
                </h1>
                <p className="text-slate-500 text-sm">Thư viện bài mẫu xử lý từ chối & chốt sales</p>
            </div>

            {/* Search & Filter */}
            <div className="glass p-4 rounded-xl shadow-sm mb-6 sticky top-0 z-10 backdrop-blur-md">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm tình huống (VD: chê giá cao, cắt lỗ...)"
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${selectedCategory === 'all'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 hover:border-blue-400'
                                }`}
                        >
                            Tất cả
                        </button>
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all border ${selectedCategory === cat.id
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 border-slate-200 hover:border-blue-400'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Script List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredScripts.length > 0 ? (
                    filteredScripts.map((script) => (
                        <div key={script.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{script.title}</h3>
                                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-500">
                                    {CATEGORIES.find(c => c.id === script.categoryId)?.name}
                                </span>
                            </div>

                            <div className="mb-4">
                                <p className="text-xs font-semibold text-slate-400 mb-1">Tình huống:</p>
                                <p className="text-sm text-slate-600 dark:text-slate-300 italic bg-amber-50 dark:bg-amber-900/10 p-2 rounded-lg border border-amber-100 dark:border-amber-900/20">
                                    "{script.situation}"
                                </p>
                            </div>

                            <div className="mb-4">
                                <p className="text-xs font-semibold text-slate-400 mb-1">Kịch bản mẫu:</p>
                                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                                    {script.content}
                                </div>
                            </div>

                            <div className="flex gap-2 flex-wrap mb-4">
                                {script.tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full">
                                        <Hash size={10} /> {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    onClick={() => handleCopy(script.content, script.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${copiedId === script.id ? 'bg-green-100 text-green-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                        }`}
                                >
                                    <Copy size={16} /> {copiedId === script.id ? 'Đã sao chép' : 'Sao chép'}
                                </button>
                                <button
                                    onClick={() => handleSendZalo(script.content)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                                >
                                    <Send size={16} /> Gửi Zalo
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12 text-slate-400">
                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Không tìm thấy kịch bản nào phù hợp.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
