import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PenTool, Calculator, Compass, Image, MessageSquare, Search, Bell, User, Star, ChevronRight, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
    const { user, profile, loading } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const userName = loading ? '...' : (profile?.full_name || 'Khách');
    const isPro = profile?.tier === 'pro' || profile?.role === 'admin';
    const displayRole = loading ? '...' : (profile?.role === 'admin' ? 'ADMIN' : (isPro ? 'PRO' : 'FREE'));

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
        <div className="pb-24 pt-4 px-4 bg-slate-50 dark:bg-slate-900 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Zap className="text-white" size={20} fill="currentColor" />
                    </div>
                    <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">HOMESPRO AI</h1>
                </div>

                <div className="flex items-center gap-3">
                    {user ? (
                        <div
                            onClick={handleUserClick}
                            className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 pl-1 pr-3 py-1 rounded-full cursor-pointer hover:bg-slate-300 transition-colors"
                        >
                            <img
                                src={`https://ui-avatars.com/api/?name=${userName}&background=random`}
                                alt="Avatar"
                                className="w-6 h-6 rounded-full"
                            />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {displayRole}
                            </span>
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="text-xs font-bold bg-slate-800 text-white px-3 py-1.5 rounded-full"
                        >
                            Đăng nhập
                        </button>
                    )}
                    <button className="relative">
                        <Bell size={24} className="text-slate-600 dark:text-slate-300" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-50"></span>
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Tìm kiếm nhanh tính năng, hoặc kịch bản..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-none bg-white dark:bg-slate-800 shadow-sm focus:ring-2 focus:ring-blue-500 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 border-l border-slate-200 pl-3">
                    <Bell size={18} />
                </button>
            </div>

            {/* Daily Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border border-blue-100 dark:border-slate-700 p-5 rounded-3xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Star size={80} fill="currentColor" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white mb-2 flex items-center gap-2">
                    Daily Card <div className="flex gap-1"><div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div><div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div></div>
                </h3>
                <div className="flex gap-4 items-start">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-2xl text-blue-600">
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            Chào <span className="font-bold text-slate-900 dark:text-white">{userName}</span>, hôm nay ngày 16/02, hướng Đông Nam tốt. Thích hợp đi gặp khách, ký cọc.
                        </p>
                    </div>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-2 gap-4">
                {tools.filter(t => t.label.toLowerCase().includes(searchTerm.toLowerCase())).map((tool, index) => (
                    <Link
                        to={tool.to}
                        key={index}
                        className={`relative p-5 rounded-3xl text-white ${tool.bg} shadow-lg shadow-blue-500/10 hover:scale-[1.02] active:scale-95 transition-all duration-200 flex flex-col justify-between h-36 overflow-hidden group`}
                    >
                        {/* Background Decoration */}
                        <div className="absolute -right-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full blur-xl group-hover:bg-white/20 transition-all"></div>

                        <div className="flex justify-between items-start relative z-10">
                            <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl w-fit">
                                <tool.icon size={22} className="text-white" />
                            </div>
                            {tool.badge && (
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-white/90 ${tool.badge === 'VIP' ? 'text-purple-600' : 'text-slate-600'}`}>
                                    {tool.badge}
                                </span>
                            )}
                        </div>

                        <div className="relative z-10">
                            <h3 className="font-bold text-lg leading-tight mb-1">{tool.label}</h3>
                            {/* <p className="text-[10px] opacity-90 line-clamp-1">{tool.desc}</p> */}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
