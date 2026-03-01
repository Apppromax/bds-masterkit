import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, RefreshCw, AlertCircle, CheckCircle2, Clock, Terminal, User, Calendar, ChevronDown, ChevronUp, Maximize2 } from 'lucide-react';

interface ApiLog {
    id: string;
    provider: string;
    model: string;
    endpoint: string;
    status_code: number;
    duration_ms: number;
    prompt_preview: string;
    created_at: string;
    token_count?: number;
    estimated_cost?: number;
    profiles?: {
        full_name: string;
        email: string;
    };
}

export default function ApiLogsTable() {
    const [logs, setLogs] = useState<ApiLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterProvider, setFilterProvider] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedLogId(expandedLogId === id ? null : id);
    };

    const loadLogs = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('api_logs')
                .select(`
                    id, provider, model, endpoint, status_code, duration_ms, prompt_preview, created_at,
                    token_count, estimated_cost,
                    profiles:user_id (full_name, email)
                `)
                .order('created_at', { ascending: false })
                .limit(50); // Show last 50 requests

            if (data) {
                setLogs(data as any);
            }
            if (error) console.error('Error fetching logs:', error);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const filteredLogs = logs.filter(log => {
        if (filterProvider !== 'all' && log.provider !== filterProvider) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const email = log.profiles?.email?.toLowerCase() || '';
            const name = log.profiles?.full_name?.toLowerCase() || '';
            if (!email.includes(query) && !name.includes(query)) return false;
        }
        return true;
    });

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20">
                <h2 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-3">
                    <Terminal size={20} className="text-blue-600" /> Lịch sử Request (Logs)
                </h2>
                <div className="flex flex-wrap items-center gap-3">
                    <input
                        type="text"
                        placeholder="Tìm theo Name / Email..."
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-48"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <select
                        className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={filterProvider}
                        onChange={(e) => setFilterProvider(e.target.value)}
                    >
                        <option value="all">Tất cả Provider</option>
                        <option value="gemini">Gemini</option>
                        <option value="openai">OpenAI</option>
                        <option value="stability">Stability</option>
                    </select>
                    <button onClick={loadLogs} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all text-slate-500">
                        <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tài khoản</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chức năng (Model & Endpoint)</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tokens & Chi phí</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {isLoading && logs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center">
                                    <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
                                </td>
                            </tr>
                        ) : filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                                    Không tìm thấy logs nào phù hợp.
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <React.Fragment key={log.id}>
                                    <tr className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all font-mono text-xs ${expandedLogId === log.id ? 'bg-slate-50/40 dark:bg-slate-800/10' : ''}`}>
                                        <td className="px-6 py-4 text-slate-500 min-w-[140px]">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={12} className="text-slate-400" />
                                                <span>{formatDate(log.created_at)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 min-w-[150px]">
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-blue-500" />
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200">
                                                        {log.profiles?.full_name || 'Ẩn danh'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400">
                                                        {log.profiles?.email || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mb-1 uppercase ${log.provider === 'gemini' ? 'bg-blue-100 text-blue-700' :
                                                    log.provider === 'openai' ? 'bg-green-100 text-green-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {log.provider}
                                                </span>
                                                <p className="font-bold text-slate-700 dark:text-slate-300">
                                                    {log.model}
                                                </p>
                                                <p className="text-[10px] text-slate-400">
                                                    Endpoint: {log.endpoint}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {log.status_code >= 200 && log.status_code < 300 ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-bold text-[10px]">
                                                    <CheckCircle2 size={12} /> {log.status_code}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-[10px]">
                                                    <AlertCircle size={12} /> {log.status_code}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[11px] font-black text-slate-700 dark:text-slate-200">
                                                    {log.token_count?.toLocaleString() || 0} <span className="text-[9px] text-slate-400">tk</span>
                                                </span>
                                                <span className="text-[9px] font-bold text-emerald-500 line-clamp-1">
                                                    ${log.estimated_cost?.toFixed(5) || '0.00000'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-left">
                                            <button
                                                onClick={() => toggleExpand(log.id)}
                                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-[10px] font-black text-slate-500 dark:text-slate-400 group"
                                            >
                                                {expandedLogId === log.id ? (
                                                    <><ChevronUp size={14} className="text-blue-500" /> Thu gọn</>
                                                ) : (
                                                    <><ChevronDown size={14} className="group-hover:text-blue-500 transition-colors" /> Xem chi tiết</>
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                    {expandedLogId === log.id && (
                                        <tr className="bg-slate-50/80 dark:bg-slate-800/20 border-l-4 border-blue-500 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <td colSpan={6} className="px-6 py-4">
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                                                            <Maximize2 size={12} /> Chi tiết nội dung Request & Response
                                                        </h4>
                                                        <span className="text-[10px] font-bold text-slate-400">ID: {log.id}</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <p className="text-[10px] font-bold text-slate-500 italic">Prompt Gửi đi:</p>
                                                            <pre className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-all shadow-inner leading-relaxed overflow-y-auto max-h-[300px]">
                                                                {log.prompt_preview || 'Không có dữ liệu prompt.'}
                                                            </pre>
                                                        </div>
                                                        <div className="flex flex-col gap-4">
                                                            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-800/20">
                                                                <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-2">Thông số Kỹ thuật</p>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <p className="text-[9px] text-slate-400 mb-1">Thời gian thực thi</p>
                                                                        <p className="text-xs font-black text-slate-700 dark:text-slate-300">{log.duration_ms} ms</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[9px] text-slate-400 mb-1">Mã trạng thái HTTP</p>
                                                                        <p className={`text-xs font-black ${log.status_code === 200 ? 'text-emerald-500' : 'text-red-500'}`}>{log.status_code}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[9px] text-slate-400 mb-1">Tiêu tốn tài nguyên</p>
                                                                        <p className="text-xs font-black text-slate-700 dark:text-slate-300">{log.token_count?.toLocaleString()} tk</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[9px] text-slate-400 mb-1">Chi phí ước tính</p>
                                                                        <p className="text-xs font-black text-emerald-500">${log.estimated_cost?.toFixed(5)}</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="p-4 bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700">
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Model sử dụng</p>
                                                                <p className="text-xs font-black text-slate-700 dark:text-slate-300 capitalize">{log.provider} — {log.model}</p>
                                                                <p className="text-[9px] text-slate-400 mt-2 italic">Endpoint: {log.endpoint}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
