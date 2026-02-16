import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import {
    Plus,
    Search,
    Briefcase,
    MapPin,
    Tag,
    Trash2,
    Edit3,
    ExternalLink,
    Filter,
    PlusCircle,
    Loader2
} from 'lucide-react';

interface Project {
    id: string;
    title: string;
    price: string;
    location: string;
    description: string;
    status: string;
    created_at: string;
}

export default function Projects() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModaling, setIsModaling] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        location: '',
        description: '',
        status: 'available'
    });

    const fetchProjects = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setProjects(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProjects();
    }, [user]);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const { error } = await supabase
            .from('projects')
            .insert([{ ...formData, user_id: user.id }]);

        if (!error) {
            setIsModaling(false);
            setFormData({ title: '', price: '', location: '', description: '', status: 'available' });
            fetchProjects();
        } else {
            alert('Lỗi: ' + error.message);
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (!window.confirm('Bạn có chắc muốn xóa dự án này?')) return;

        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (!error) {
            fetchProjects();
        }
    };

    const filteredProjects = projects.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="pb-20 md:pb-0">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Briefcase className="text-blue-600" /> Quản Lý Dự Án
                    </h1>
                    <p className="text-slate-500 text-sm">Lưu trữ và quản lý danh sách BĐS của bạn</p>
                </div>
                <button
                    onClick={() => setIsModaling(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-500/20 transition-all w-fit"
                >
                    <Plus size={20} /> Thêm Dự Án Mới
                </button>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="md:col-span-3 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm dự án, địa chỉ..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Tổng cộng</span>
                    <span className="font-bold text-blue-600 text-lg">{projects.length}</span>
                </div>
            </div>

            {/* Project Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Loader2 className="animate-spin mb-2" size={32} />
                    <p>Đang tải danh sách...</p>
                </div>
            ) : filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div key={project.id} className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                            <div className="h-3 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                                        {project.title}
                                    </h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${project.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {project.status === 'available' ? 'CÒN HÀNG' : 'ĐÃ BÁN'}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <MapPin size={14} className="text-slate-400" />
                                        <span className="truncate">{project.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <Tag size={14} className="text-slate-400" />
                                        <span className="font-bold text-blue-600">{project.price}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-slate-50 dark:border-slate-800">
                                    <button className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-300 hover:text-blue-600 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1">
                                        <Edit3 size={14} /> Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProject(project.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <PlusCircle size={48} className="mx-auto mb-4 text-slate-300" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Chưa có dự án nào</h3>
                    <p className="text-slate-500 text-sm mb-6">Bắt đầu lưu trữ danh sách hàng hóa của sếp tại đây!</p>
                    <button
                        onClick={() => setIsModaling(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-500/20"
                    >
                        Tạo dự án đầu tiên
                    </button>
                </div>
            )}

            {/* Modal */}
            {isModaling && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModaling(false)}></div>
                    <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                            <h2 className="font-bold text-lg">Thêm Dự Án Mới</h2>
                            <button onClick={() => setIsModaling(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateProject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Tên dự án / Tiêu đề</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="VD: Đất nền mặt tiền đường 3/2"
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Giá bán</label>
                                    <input
                                        type="text"
                                        placeholder="VD: 2.5 Tỷ"
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Trạng thái</label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="available">Còn hàng</option>
                                        <option value="sold">Đã bán</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Địa chỉ / Vị trí</label>
                                <input
                                    type="text"
                                    placeholder="Quận 10, TP. HCM"
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Mô tả thêm</label>
                                <textarea
                                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none h-24"
                                    placeholder="Sổ hồng riêng, ngân hàng hỗ trợ 70%..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all mt-4"
                            >
                                LƯU DỰ ÁN
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
