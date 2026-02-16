import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, CreditCard, Activity } from 'lucide-react';

export default function AdminDashboard() {
    const { profile } = useAuth();

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Xin chào, {profile?.full_name} ({profile?.role})
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tổng User</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">1,234</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Doanh thu tháng</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">45.2M</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Giao dịch chờ duyệt</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Giao dịch gần đây</h2>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Xem tất cả</button>
                </div>
                <div className="p-6 text-center text-slate-500">
                    Chưa có dữ liệu thực tế
                </div>
            </div>
        </div>
    );
}
