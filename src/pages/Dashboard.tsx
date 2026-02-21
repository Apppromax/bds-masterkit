import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenTool, Calculator, Compass, Image, MessageSquare, Search, Bell, User, Star, ChevronRight, Zap, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
    const { user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const isInternalLoading = authLoading || (user && !profile);
    const userName = isInternalLoading ? '...' : (profile?.full_name || 'Khách');
    const isPro = profile?.tier === 'pro' || profile?.role === 'admin';
    const displayRole = isInternalLoading ? '...' : (profile?.role === 'admin' ? 'ADMIN' : (isPro ? 'PRO' : 'FREE'));

    const tools = [
        {
            to: '/content',
            icon: PenTool,
            label: 'Kho Nội Dung',
            badge: 'Miễn phí',
            badgeColor: 'bg-green-100 text-green-700',
            bg: 'bg-teal-500',
            desc: 'Tạo caption đăng tin'
        },
        {
            to: '/image-studio',
            icon: Image,
            label: 'Tạo Ảnh AI',
            badge: 'VIP',
            badgeColor: 'bg-purple-100 text-purple-700',
            bg: 'bg-violet-600',
            desc: 'Xử lý hình ảnh BĐS'
        },
        {
            to: '/loan',
            icon: Calculator,
            label: 'Tính Lãi Vay',
            badge: 'Miễn phí',
            badgeColor: 'bg-green-100 text-green-700',
            bg: 'bg-blue-500',
            desc: 'Dự toán khoản vay'
        },
        {
            to: '/scripts',
            icon: MessageSquare,
            label: 'Kịch Bản Chốt Sale',
            badge: 'VIP',
            badgeColor: 'bg-amber-100 text-amber-700',
            bg: 'bg-amber-500',
            desc: 'Xử lý từ chối'
        },
        {
            to: '/feng-shui',
            icon: Compass,
            label: 'Tra Hướng Nhà',
            badge: 'Miễn phí',
            badgeColor: 'bg-green-100 text-green-700',
            bg: 'bg-orange-500',
            desc: 'Phong thủy theo tuổi'
        },
        {
            to: '/lunar',
            icon: Calendar,
            label: 'Lịch Âm Dương',
            badge: 'Miễn phí',
            badgeColor: 'bg-green-100 text-green-700',
            bg: 'bg-red-500',
            desc: 'Tra cứu ngày tốt xấu'
        }
    ];

    const handleUserClick = () => {
        if (user) {
            navigate('/profile');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="pb-24 min-h-screen bg-black overflow-x-hidden">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#bf953f] to-[#aa771c] rounded-xl flex items-center justify-center shadow-lg shadow-[#bf953f]/20">
                        <Zap className="text-black" size={20} strokeWidth={3} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white tracking-widest leading-none">HOMESPRO AI</h1>
                        <span className="text-[9px] font-bold text-[#bf953f] tracking-[0.2em] uppercase">The Elite Real Estate Agent</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div
                            onClick={handleUserClick}
                            className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 pl-1.5 pr-4 py-1.5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group"
                        >
                            <img
                                src={`https://ui-avatars.com/api/?name=${userName}&background=bf953f&color=fff`}
                                alt="Avatar"
                                className="w-7 h-7 rounded-lg shadow-md group-hover:scale-110 transition-transform"
                            />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white leading-tight uppercase">
                                    {userName.split(' ').pop()}
                                </span>
                                <span className="text-[8px] font-bold text-[#bf953f] tracking-widest">
                                    {displayRole} MEMBER
                                </span>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="text-xs font-black bg-gradient-to-r from-[#bf953f] to-[#aa771c] text-black px-5 py-2 rounded-xl uppercase tracking-widest"
                        >
                            Đăng nhập
                        </button>
                    )}
                    <button className="relative w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl border border-white/10">
                        <Bell size={20} className="text-slate-400" />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#bf953f] rounded-full border-2 border-black"></span>
                    </button>
                </div>
            </div>

            {/* Daily Card - Premium Glass Design */}
            <div className="relative mb-10 group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#bf953f]/10 to-transparent rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="glass-card p-1 relative overflow-hidden">
                    <div className="p-8 flex flex-col md:flex-row gap-8 items-center bg-black/40 rounded-[1.4rem]">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#bf953f] to-[#aa771c] rounded-3xl flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(191,149,63,0.3)]">
                            <Star size={36} className="text-black" fill="currentColor" />
                        </div>
                        <div className="text-center md:text-left">
                            <h3 className="text-white text-2xl font-black mb-2 flex items-center justify-center md:justify-start gap-4 uppercase tracking-tighter">
                                Daily Card.
                                <div className="flex gap-1.5"><div className="w-1.5 h-1.5 bg-[#bf953f] rounded-full animate-pulse"></div><div className="w-1.5 h-1.5 bg-[#bf953f]/40 rounded-full"></div></div>
                            </h3>
                            <p className="text-slate-400 text-lg leading-relaxed font-medium">
                                Chào <span className="text-white font-black">{userName}</span>, hôm nay ngày 16/02, hướng Đông Nam tốt. Thích hợp đi gặp khách, ký cọc.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool, index) => (
                    <Link
                        to={tool.to}
                        key={index}
                        className="glass-card group p-8 flex flex-col justify-between h-56 relative overflow-hidden"
                    >
                        {/* Interactive Background Glow */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#bf953f]/5 rounded-full blur-[60px] group-hover:bg-[#bf953f]/15 transition-all"></div>

                        <div className="flex justify-between items-start relative z-10">
                            <div className="w-14 h-14 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-[#bf953f]/50 transition-colors shadow-lg shadow-black/50">
                                <tool.icon size={28} className="text-[#bf953f] group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                            </div>
                            {tool.badge && (
                                <span className={`text-[9px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase border ${tool.badge === 'VIP'
                                        ? 'bg-[#bf953f]/10 text-[#bf953f] border-[#bf953f]/20'
                                        : 'bg-white/5 text-slate-400 border-white/10'
                                    }`}>
                                    {tool.badge}
                                </span>
                            )}
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-white leading-tight mb-2 tracking-tight group-hover:text-[#fcf6ba] transition-colors uppercase">{tool.label}</h3>
                            <div className="flex items-center gap-2">
                                <span className="h-[2px] w-4 bg-[#bf953f]/40 group-hover:w-12 transition-all duration-500 rounded-full"></span>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest group-hover:text-slate-400 transition-colors">Khám phá ngay</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );

}
