import React from 'react';
import { Sparkles, TrendingUp, CheckCircle, Flame } from 'lucide-react';

const TICKER_MESSAGES = [
    { text: 'Anh Tuấn (CenLand) vừa chốt 1 căn sơ cấp nhờ Kịch Bản AI', icon: <Flame size={12} className="text-orange-500" /> },
    { text: 'Hệ thống vừa xử lý 500+ ảnh nhà phố trong 24h qua', icon: <Sparkles size={12} className="text-gold" /> },
    { text: 'Chị Mai (Đất Xanh) đã nâng cấp Gói PRO thành công', icon: <CheckCircle size={12} className="text-green-500" /> },
    { text: 'BĐS MasterKit - Trợ lý dòng tiền & pháp lý số 1 Môi giới', icon: <TrendingUp size={12} className="text-blue-500" /> }
];

export function LiveTicker() {
    return (
        <div className="w-full bg-black/40 border-y border-white/[0.05] overflow-hidden flex items-center h-8 relative z-10 shrink-0">
            <div className="flex animate-ticker whitespace-nowrap gap-12 text-[10px] font-medium tracking-wide">
                {/* Double the messages to create a seamless infinite loop */}
                {[...TICKER_MESSAGES, ...TICKER_MESSAGES, ...TICKER_MESSAGES].map((msg, i) => (
                    <div key={i} className="flex items-center gap-2 text-slate-300">
                        {msg.icon}
                        <span>{msg.text}</span>
                    </div>
                ))}
            </div>
            {/* Fade edges */}
            <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/80 to-transparent pointer-events-none"></div>
            <div className="absolute top-0 bottom-0 right-0 w-8 bg-gradient-to-l from-black/80 to-transparent pointer-events-none"></div>
        </div>
    );
}
