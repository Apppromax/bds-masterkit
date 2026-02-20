import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, RefreshCw, AlertCircle, CheckCircle2, Clock, Terminal, User, Calendar } from 'lucide-react';

interface ApiLog {
    id: string;
    provider: string;
    model: string;
    endpoint: string;
    status_code: number;
    duration_ms: number;
    prompt_preview: string;
    created_at: string;
    profiles?: {
        full_name: string;
        email: string;
    };
}

export default function ApiLogsTable() {
    const [logs, setLogs] = useState<ApiLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadLogs = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('api_logs')
                .select(`
                    id, provider, model, endpoint, status_code, duration_ms, prompt_preview, created_at,
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

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                <h2 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-3">
                    <Terminal size={20} className="text-blue-600" /> Lịch sử Request (Logs)
                </h2>
                <button onClick={loadLogs} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all text-slate-500">
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tài khoản</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Chức năng (Model & Endpoint)</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tốc độ / Preview</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {isLoading && logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center">
                                    <Loader2 className="animate-spin text-blue-500 mx-auto" size={32} />
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400 font-bold">
                                    Chưa có logs nào trong hệ thống.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all font-mono text-xs">
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
                                                        'bg-purple-100 text-purple-700'
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
                                                <CheckCircle2 size={12} /> {log.status_code} OK
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-[10px]">
                                                <AlertCircle size={12} /> Lỗi {log.status_code}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right min-w-[200px]">
                                        <div className="flex flex-col items-end">
                                            <span className="flex items-center gap-1 text-[10px] font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                                <Clock size={12} /> {log.duration_ms} ms
                                            </span>
                                            <p className="mt-2 text-[10px] text-slate-400 truncate w-[200px] text-right" title={log.prompt_preview}>
                                                "{log.prompt_preview}"
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
