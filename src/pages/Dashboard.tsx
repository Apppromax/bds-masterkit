import React from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Calculator, Compass, Image, MessageSquare, TrendingUp, Users, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
    const { profile } = useAuth();
    const userName = profile?.full_name || 'Bạn';

    const tools = [
        {
            to: '/content',
            icon: PenTool,
            label: 'Kho Ý Tưởng',
            desc: 'Tạo caption đăng tin cực chất',
            color: 'bg-blue-500',
            textColor: 'text-blue-500'
        },
        {
            to: '/loan',
            icon: Calculator,
            label: 'Tính Lãi Vay',
            desc: 'Bảng tính dòng tiền cho khách',
            color: 'bg-green-500',
            textColor: 'text-green-500'
        },
        {
            to: '/feng-shui',
            icon: Compass,
            label: 'Phong Thủy',
            desc: 'Tra cứu hướng nhà hợp tuổi',
            color: 'bg-amber-500',
            textColor: 'text-amber-500'
        },
        {
            to: '/image-studio',
            icon: Image,
            label: 'Studio Ảnh',
            desc: 'Chèn khung, watermark, AI',
            color: 'bg-purple-500',
            textColor: 'text-purple-500'
        },
        {
            to: '/scripts',
            icon: MessageSquare,
            label: 'Kịch Bản Sales',
            desc: 'Xử lý từ chối & tin nhắn mẫu',
            color: 'bg-pink-500',
            textColor: 'text-pink-500'
        }
    ];

    return (
        <div className="pb-20 md:pb-0">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-8 shadow-lg shadow-blue-500/20">
                <h1 className="text-2xl font-bold mb-2">Xin chào, {userName}! 👋</h1>
                <p className="opacity-90">Chúc bạn một ngày chốt thật nhiều deal thành công.</p>

                <div className="mt-6 flex flex-wrap gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full"><TrendingUp size={16} /></div>
                        <div>
                            <p className="text-xs opacity-80">Doanh số tháng</p>
                            <p className="font-bold">12.5 Tỷ</p>
                        </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full"><Users size={16} /></div>
                        <div>
                            <p className="text-xs opacity-80">Khách hàng mới</p>
                            <p className="font-bold">24</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tools Grid */}
            <div className="mb-8">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Bộ công cụ quyền năng</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tools.map((tool) => (
                        <Link
                            key={tool.to}
                            to={tool.to}
                            className="glass p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-700 flex items-center gap-4 group"
                        >
                            <div className={`p-4 rounded-xl ${tool.color} bg-opacity-10 dark:bg-opacity-20`}>
                                <tool.icon className={`${tool.textColor}`} size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                                    {tool.label}
                                </h3>
                                <p className="text-sm text-slate-500">{tool.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Activity / News */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Calendar size={18} className="text-blue-500" /> Lịch hẹn hôm nay
                        </h3>
                        <span className="text-xs text-blue-600 font-medium cursor-pointer">Xem tất cả</span>
                    </div>
                    <div className="space-y-4">
                        {[
                            { time: '09:00', task: 'Dẫn khách xem đất nền Long An', status: 'done' },
                            { time: '14:30', task: 'Ký hợp đồng cọc căn hộ', status: 'pending' },
                            { time: '16:00', task: 'Họp team sales hàng tuần', status: 'pending' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                                <span className="text-sm font-semibold text-slate-500">{item.time}</span>
                                <div>
                                    <p className={`text-sm font-medium ${item.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                        {item.task}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Tin tức thị trường</h3>
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <div className="w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&q=80)' }}></div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-800 dark:text-white line-clamp-2">Lãi suất vay mua nhà tiếp tục giảm nhẹ trong tháng này</h4>
                                <p className="text-xs text-slate-400 mt-1">2 giờ trước • CafeF</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-16 h-16 bg-slate-200 rounded-lg flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1448630360428-65456885c650?w=100&q=80)' }}></div>
                            <div>
                                <h4 className="text-sm font-medium text-slate-800 dark:text-white line-clamp-2">Bất động sản công nghiệp phía Nam đón làn sóng đầu tư mới</h4>
                                <p className="text-xs text-slate-400 mt-1">5 giờ trước • VnExpress</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
