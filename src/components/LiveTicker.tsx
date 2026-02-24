import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, CheckCircle, Flame, BellRing } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const STATIC_MESSAGES = [
    { text: 'Anh Tuấn (CenLand) vừa chốt 1 căn sơ cấp nhờ Kịch Bản AI', icon: <Flame size={12} className="text-orange-500" /> },
    { text: 'Hệ thống vừa xử lý 500+ ảnh nhà phố trong 24h qua', icon: <Sparkles size={12} className="text-gold" /> },
    { text: 'Chị Mai (Đất Xanh) đã nâng cấp Gói PRO thành công', icon: <CheckCircle size={12} className="text-green-500" /> },
    { text: 'BĐS MasterKit - Trợ lý dòng tiền & pháp lý số 1 Môi giới', icon: <TrendingUp size={12} className="text-blue-500" /> }
];

export function LiveTicker() {
    const [messages, setMessages] = useState(STATIC_MESSAGES);

    useEffect(() => {
        const fetchReminders = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) return;

                const { data, error } = await supabase
                    .from('leads')
                    .select('name, reminder_at')
                    .not('reminder_at', 'is', null)
                    .order('reminder_at', { ascending: true })
                    .limit(5);

                if (error) throw error;

                if (data && data.length > 0) {
                    const reminders = data.map(lead => ({
                        text: `NHẮC HẸN: Chăm sóc khách ${lead.name} (${new Date(lead.reminder_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })})`,
                        icon: <BellRing size={12} className="text-amber-500 animate-pulse" />
                    }));
                    setMessages([...reminders, ...STATIC_MESSAGES]);
                }
            } catch (err) {
                console.error('Error fetching reminders for ticker:', err);
            }
        };

        fetchReminders();
    }, []);

    return (
        <div className="w-full bg-black/40 border-y border-white/[0.05] overflow-hidden flex items-center h-8 relative z-10 shrink-0">
            <div className="flex animate-ticker whitespace-nowrap gap-12 text-[10px] font-medium tracking-wide">
                {/* Double the messages to create a seamless infinite loop */}
                {[...messages, ...messages, ...messages].map((msg, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300">
                        {msg.icon}
                        <span className={msg.text.includes('NHẮC HẸN') ? 'text-amber-400 font-black tracking-tighter' : ''}>
                            {msg.text}
                        </span>
                    </div>
                ))}
            </div>
            {/* Fade edges */}
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/80 to-transparent pointer-events-none"></div>
            <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-black/80 to-transparent pointer-events-none"></div>
        </div>
    );
}

