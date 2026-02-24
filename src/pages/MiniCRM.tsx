import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Tesseract from 'tesseract.js';
import {
    UserPlus,
    Users,
    Camera,
    Save,
    Trash2,
    Calendar,
    Phone,
    User,
    Clock,
    Loader2,
    BellRing,
    Building2,
    FileText
} from 'lucide-react';

interface Lead {
    id: string;
    name: string;
    phone: string;
    status: string;
    interested_property: string;
    notes: string;
    reminder_at: string | null;
    created_at: string;
}

const STATUS_OPTIONS = ['Mới', 'Đang tư vấn', 'Đã xem nhà', 'Chốt', 'Hủy'];

// Local algorithm to parse phone numbers and names from raw text
const parseTextForLead = (text: string) => {
    console.log('[OCR Raw Text]:', text);

    // 1. Regex for VN Phone numbers (detects 09x, 03x, 08x, 05x, 07x)
    const phoneRegex = /(?:\+84|0)(?:3|5|7|8|9|1[2689])(?:\d{8}|(?:\s\d{3}){2,3}|(?:\.\d{3}){2,3}|(?:-\d{3}){2,3})/g;
    const foundPhones = text.match(phoneRegex) || [];

    // Clean phone: remove spaces/dots and take the first one
    const phone = foundPhones[0] ? foundPhones[0].replace(/[\s\.\-]/g, '') : '';

    // 2. Simple Heuristic for Name: First capitalized line that isn't too long or standard keywords
    const lines = text.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 2 && l.length < 30);

    let name = '';
    const noiseKeywords = ['Messenger', 'Active', 'Facebook', 'Online', 'Tin nhắn', 'Zalo', 'AM', 'PM', 'hôm qua', 'vừa xong'];

    for (const line of lines) {
        // Check if line contains Vietnamese characters and is capitalized
        const isCapitalized = /^[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯ]/.test(line);
        const hasNoise = noiseKeywords.some(word => line.toLowerCase().includes(word.toLowerCase()));

        if (isCapitalized && !hasNoise) {
            name = line;
            break;
        }
    }

    return { name, phone };
};

const MiniCRM = () => {
    const [activeTab, setActiveTab] = useState<'add' | 'manage'>('add');
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingLeads, setFetchingLeads] = useState(true);

    // Add Lead Form State
    const [newLead, setNewLead] = useState({
        name: '',
        phone: '',
        interested_property: '',
        status: 'Mới',
        notes: '',
        reminder_at: ''
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [extracting, setExtracting] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            setFetchingLeads(true);
            const { data, error } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (err) {
            console.error('Error fetching leads:', err);
        } finally {
            setFetchingLeads(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setImagePreview(base64);
                handleExtractOCR(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleExtractOCR = async (base64: string) => {
        setExtracting(true);
        setOcrProgress(0);
        try {
            // Use Tesseract.js for client-side OCR (No API Cost)
            const result = await Tesseract.recognize(
                base64,
                'vie+eng', // Scan both Vietnamese and English
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setOcrProgress(Math.floor(m.progress * 100));
                        }
                    }
                }
            );

            const { name, phone } = parseTextForLead(result.data.text);

            setNewLead(prev => ({
                ...prev,
                name: name || prev.name,
                phone: phone || prev.phone
            }));

        } catch (err) {
            console.error('Tesseract OCR failed:', err);
        } finally {
            setExtracting(false);
            setOcrProgress(0);
        }
    };

    const handleSaveLead = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLead.name) return;

        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) return;

            const { error } = await supabase.from('leads').insert({
                user_id: session.user.id,
                name: newLead.name,
                phone: newLead.phone,
                interested_property: newLead.interested_property,
                status: newLead.status,
                notes: newLead.notes,
                reminder_at: newLead.reminder_at || null
            });

            if (error) throw error;

            // Reset form
            setNewLead({
                name: '',
                phone: '',
                interested_property: '',
                status: 'Mới',
                notes: '',
                reminder_at: ''
            });
            setImagePreview(null);
            fetchLeads();
            setActiveTab('manage');
        } catch (err) {
            console.error('Error saving lead:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLead = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) return;

        try {
            const { error } = await supabase.from('leads').delete().eq('id', id);
            if (error) throw error;
            fetchLeads();
        } catch (err) {
            console.error('Error deleting lead:', err);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({ status: newStatus })
                .eq('id', id);
            if (error) throw error;
            fetchLeads();
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900/20 p-8 border border-amber-500/20 shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent mb-2">
                        Mini CRM Pro
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl font-light">
                        Quản lý khách hàng offline thông minh. Tự động tìm SĐT bằng thuật toán OCR không tốn phí API.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full -mr-20 -mt-20"></div>
            </div>

            {/* Tabs Control */}
            <div className="flex space-x-2 mb-8 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl w-fit">
                <button
                    onClick={() => setActiveTab('add')}
                    className={`px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 ${activeTab === 'add'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20 active-tab-scale'
                        : 'text-slate-400 hover:text-amber-200 hover:bg-white/5'
                        }`}
                >
                    <UserPlus size={18} />
                    <span className="font-medium">Thêm khách</span>
                </button>
                <button
                    onClick={() => setActiveTab('manage')}
                    className={`px-6 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 ${activeTab === 'manage'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/20 active-tab-scale'
                        : 'text-slate-400 hover:text-amber-200 hover:bg-white/5'
                        }`}
                >
                    <Users size={18} />
                    <span className="font-medium">Quản lý khách</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {activeTab === 'add' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* OCR Offline Section */}
                        <div className="glass-card rounded-3xl p-8 border border-white/10 relative group">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                                    <Camera size={24} />
                                </div>
                                <h2 className="text-xl font-semibold text-white">Quét ảnh (Offline)</h2>
                            </div>

                            <div className="relative aspect-[4/3] rounded-2xl bg-slate-950/50 border-2 border-dashed border-amber-500/20 overflow-hidden flex flex-col items-center justify-center transition-all group-hover:border-amber-500/40">
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                        <button
                                            onClick={() => setImagePreview(null)}
                                            className="absolute top-4 right-4 p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors backdrop-blur-md"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        {extracting && (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center">
                                                <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                                                <p className="text-amber-200 font-medium">Bóc tách dữ liệu: {ocrProgress}%</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <input
                                            type="file"
                                            id="image-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="cursor-pointer flex flex-col items-center justify-center p-8 text-center"
                                        >
                                            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <Camera size={32} className="text-amber-500" />
                                            </div>
                                            <p className="text-amber-100 font-medium mb-1">Tải ảnh Messenger/Zalo</p>
                                            <p className="text-slate-500 text-sm">Thuật toán tự tìm SĐT & Tên</p>
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="glass-card rounded-3xl p-8 border border-white/10">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                    <UserPlus size={24} />
                                </div>
                                <h2 className="text-xl font-semibold text-white">Xác nhận thông tin</h2>
                            </div>

                            <form onSubmit={handleSaveLead} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400 ml-1">Tên khách hàng</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <input
                                                type="text"
                                                required
                                                value={newLead.name}
                                                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                                placeholder="Họ và tên..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-400 ml-1">Số điện thoại</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                            <input
                                                type="text"
                                                value={newLead.phone}
                                                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                                                className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                                placeholder="Số điện thoại..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">BĐS quan tâm</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type="text"
                                            value={newLead.interested_property}
                                            onChange={(e) => setNewLead({ ...newLead, interested_property: e.target.value })}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                            placeholder="Dự án, địa chỉ hoặc loại hình..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Trạng thái</label>
                                    <select
                                        value={newLead.status}
                                        onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none appearance-none"
                                    >
                                        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Nhắc hẹn chăm sóc</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input
                                            type="datetime-local"
                                            value={newLead.reminder_at}
                                            onChange={(e) => setNewLead({ ...newLead, reminder_at: e.target.value })}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-400 ml-1">Ghi chú nhu cầu</label>
                                    <textarea
                                        rows={3}
                                        value={newLead.notes}
                                        onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none"
                                        placeholder="Khách cần tìm nhà khu vực nào..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-amber-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    <span>Lưu vào danh sách</span>
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {fetchingLeads ? (
                            <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                                <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                                <p className="text-amber-200">Đang tải danh sách...</p>
                            </div>
                        ) : leads.length === 0 ? (
                            <div className="glass-card rounded-3xl p-16 text-center border border-white/5">
                                <Users size={64} className="mx-auto text-slate-700 mb-6" />
                                <h3 className="text-2xl font-semibold text-white mb-2">Trống danh sách</h3>
                                <p className="text-slate-500 mb-8">Dữ liệu được lưu trữ an toàn trong Database của sếp.</p>
                                <button
                                    onClick={() => setActiveTab('add')}
                                    className="px-8 py-3 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500/20 transition-all border border-amber-500/20"
                                >
                                    Thêm khách ngay
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Desktop List */}
                                <div className="hidden md:block overflow-hidden rounded-3xl border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 border-b border-white/5 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                                            <tr>
                                                <th className="px-6 py-5">Tên Khách Hàng</th>
                                                <th className="px-6 py-5">Liên Hệ</th>
                                                <th className="px-6 py-5">BĐS Quan Tâm</th>
                                                <th className="px-6 py-5">Trạng Thái</th>
                                                <th className="px-6 py-5">Nhắc Hẹn</th>
                                                <th className="px-6 py-5 text-right">Hành Động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {leads.map((lead) => (
                                                <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-white font-bold">{lead.name}</span>
                                                            <span className="text-[10px] text-slate-500 mt-1 line-clamp-1 italic">{lead.notes || 'Không ghi chú'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-slate-300 flex items-center text-sm">
                                                            <Phone size={14} className="mr-2 text-amber-500/50" />
                                                            {lead.phone || '---'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-slate-300 flex items-center text-sm truncate max-w-[150px]">
                                                            <Building2 size={14} className="mr-2 text-blue-500/50" />
                                                            {lead.interested_property || '---'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            value={lead.status}
                                                            onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                                                            className={`text-[10px] font-black px-3 py-1.5 rounded-lg bg-black border border-white/10 focus:outline-none appearance-none cursor-pointer uppercase tracking-wider
                                ${lead.status === 'Chốt' ? 'text-green-400' :
                                                                    lead.status === 'Hủy' ? 'text-red-400' :
                                                                        'text-amber-500'}`}
                                                        >
                                                            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                        </select>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`text-xs flex items-center ${lead.reminder_at && new Date(lead.reminder_at) < new Date() ? 'text-red-400 animate-pulse' : 'text-slate-400'}`}>
                                                            <BellRing size={12} className="mr-2" />
                                                            {lead.reminder_at ? new Date(lead.reminder_at).toLocaleString('vi-VN', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            }) : '--:--'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleDeleteLead(lead.id)}
                                                            className="p-2 text-slate-600 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="md:hidden space-y-4">
                                    {leads.map((lead) => (
                                        <div key={lead.id} className="glass-card p-5 rounded-2xl border border-white/5 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-white font-bold">{lead.name}</h4>
                                                    <span className="text-amber-500/70 text-sm block mt-0.5">{lead.phone || '---'}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteLead(lead.id)}
                                                    className="p-2 text-slate-600 hover:text-red-500"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>

                                            {lead.interested_property && (
                                                <div className="flex items-center text-sm text-slate-300">
                                                    <Building2 size={14} className="mr-2 text-blue-500/50" />
                                                    <span>{lead.interested_property}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between py-2 border-y border-white/5">
                                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Trạng thái:</span>
                                                <select
                                                    value={lead.status}
                                                    onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                                                    className="bg-transparent text-amber-500 text-xs font-bold focus:outline-none uppercase"
                                                >
                                                    {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            </div>

                                            {lead.reminder_at && (
                                                <div className="flex items-center text-xs text-slate-400">
                                                    <Clock size={12} className="mr-2 text-amber-500" />
                                                    <span>Hẹn: {new Date(lead.reminder_at).toLocaleString('vi-VN')}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
        .glass-card {
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        .active-tab-scale {
          transform: translateY(-2px);
        }
      `}</style>
        </div>
    );
};

export default MiniCRM;
