import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { extractLeadFromImage } from '../services/aiService';
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
    Building2,
    Search,
    Filter,
    ExternalLink
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
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.interested_property?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        try {
            const data = await extractLeadFromImage(base64);

            if (data) {
                setNewLead(prev => ({
                    ...prev,
                    name: data.name || prev.name,
                    phone: data.phone || prev.phone
                }));
            }
        } catch (err) {
            console.error('AI Data Extraction failed:', err);
        } finally {
            setExtracting(false);
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
        <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-10">
            {/* Dashboard Style Header */}
            <div className="flex justify-between items-center shrink-0 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#d4af37] via-[#fcf6ba] to-[#aa771c] rounded-xl flex items-center justify-center shadow-[0_10px_20px_-5px_rgba(191,149,63,0.4)] transform rotate-3 shrink-0">
                        <Users className="text-[#131b2e]" size={20} strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-widest leading-none uppercase italic">
                            QUẢN LÝ <span className="text-gold">KHÁCH HÀNG</span>
                        </h1>
                        <p className="text-[8px] font-black text-slate-500 tracking-[0.4em] uppercase mt-1">Smart CRM for Professionals</p>
                    </div>
                </div>

                {/* Tabs Control */}
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 backdrop-blur-md">
                    <button
                        onClick={() => setActiveTab('add')}
                        className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'add'
                            ? 'bg-gradient-to-r from-gold to-[#aa771c] text-black shadow-lg shadow-gold/20'
                            : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        Thêm khách
                    </button>
                    <button
                        onClick={() => setActiveTab('manage')}
                        className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'manage'
                            ? 'bg-gradient-to-r from-gold to-[#aa771c] text-black shadow-lg shadow-gold/20'
                            : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        Danh sách
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-10">
                {activeTab === 'add' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* OCR Section */}
                        <div className="group relative p-8 flex flex-col gap-6 rounded-[2.5rem] bg-[#1a2332] border border-white/[0.05] shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-30"></div>

                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-gold via-[#fcf6ba] to-[#aa771c] rounded-2xl flex items-center justify-center shadow-md border border-white/20">
                                    <Camera size={28} className="text-[#131b2e]" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white italic tracking-tight uppercase">QUÉT ẢNH CHAT</h3>
                                    <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Tự nhặt tên & SĐT thần tốc</p>
                                </div>
                            </div>

                            <div className="relative aspect-video rounded-[2rem] bg-black/40 border-2 border-dashed border-white/10 overflow-hidden flex flex-col items-center justify-center group-hover:border-gold/30 transition-all">
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                                        <button
                                            onClick={() => setImagePreview(null)}
                                            className="absolute top-4 right-4 p-2 bg-black/60 text-gold rounded-xl hover:bg-black/80 transition-all border border-gold/20 backdrop-blur-md"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                        {extracting && (
                                            <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
                                                <div className="w-12 h-12 rounded-full border-4 border-gold/20 border-t-gold animate-spin mb-4"></div>
                                                <p className="text-gold font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">AI ĐANG BÓC TÁCH DỮ LIỆU...</p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <input type="file" id="image-upload" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center p-10 text-center w-full h-full">
                                            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-gold/20">
                                                <Camera size={32} className="text-gold" />
                                            </div>
                                            <p className="text-white font-black text-xs uppercase tracking-widest mb-1">Tải ảnh Messenger/Zalo</p>
                                            <p className="text-slate-500 text-[9px] font-bold uppercase tracking-tight italic">Ưu tiên nhặt tên ở dòng đầu tiên</p>
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Form Section */}
                        <div className="relative p-8 flex flex-col gap-6 rounded-[2.5rem] bg-[#1a2332] border border-white/[0.05] shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-30"></div>

                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-14 h-14 bg-gradient-to-br from-[#3b82f6] to-[#1e40af] rounded-2xl flex items-center justify-center shadow-md border border-white/20">
                                    <UserPlus size={28} className="text-white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white italic tracking-tight uppercase">LƯU THÔNG TIN KHÁCH HÀNG</h3>
                                    <p className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">Kiểm tra thông tin trước khi lưu</p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveLead} className="relative z-10 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tên khách hàng</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50"><User size={16} /></div>
                                            <input
                                                type="text" required value={newLead.name}
                                                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 text-sm font-bold placeholder-slate-700"
                                                placeholder="Họ và tên..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Số điện thoại</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50"><Phone size={16} /></div>
                                            <input
                                                type="text" value={newLead.phone}
                                                onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 text-sm font-bold"
                                                placeholder="..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">BĐS quan tâm</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50"><Building2 size={16} /></div>
                                            <input
                                                type="text" value={newLead.interested_property}
                                                onChange={(e) => setNewLead({ ...newLead, interested_property: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 text-sm font-bold"
                                                placeholder="Dự án/Địa chỉ..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Trạng thái chăm sóc</label>
                                        <select
                                            value={newLead.status}
                                            onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-4 text-gold font-black uppercase text-xs focus:outline-none appearance-none"
                                        >
                                            {STATUS_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-[#1a2332]">{opt}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nhắc hẹn Recall</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50"><Calendar size={16} /></div>
                                            <input
                                                type="date" value={newLead.reminder_at ? newLead.reminder_at.split('T')[0] : ''}
                                                onChange={(e) => setNewLead({ ...newLead, reminder_at: e.target.value })}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 text-[11px] font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ghi chú nhu cầu</label>
                                        <textarea
                                            rows={1} value={newLead.notes}
                                            onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 px-4 text-white focus:outline-none focus:border-gold/50 text-sm font-medium"
                                            placeholder="..."
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit" disabled={loading}
                                    className="w-full bg-gradient-to-r from-gold via-[#fcf6ba] to-[#aa771c] text-black font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {loading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div> : <Save size={18} strokeWidth={3} />}
                                    LƯU XUỐNG DATABASE
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* Manage Tab - Responsive List/Table View */
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Search Bar Area */}
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                            <div className="relative w-full md:max-w-md group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gold group-focus-within:scale-110 transition-transform">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Tìm tên, SĐT hoặc dự án..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-gold/50 text-sm font-bold shadow-2xl transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-gold/5 border border-gold/10 rounded-xl">
                                <Users size={14} className="text-gold" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{filteredLeads.length} KHÁCH HÀNG</span>
                            </div>
                        </div>

                        {fetchingLeads ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-gold/10 border-t-gold rounded-full animate-spin mb-4"></div>
                                <p className="text-gold font-black uppercase text-[10px] tracking-widest">Đang tải data...</p>
                            </div>
                        ) : filteredLeads.length === 0 ? (
                            <div className="p-20 text-center rounded-[2.5rem] bg-[#1a2332] border border-white/5">
                                <Users size={64} className="mx-auto text-slate-800 mb-6" />
                                <h3 className="text-xl font-black text-white italic uppercase mb-2">Không tìm thấy khách</h3>
                                <p className="text-slate-500 text-xs font-bold uppercase mb-8 tracking-widest">Thử đổi từ khóa hoặc quét thêm khách mới sếp ơi!</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {/* Desktop Tablet Header - Hidden on small mobile */}
                                <div className="hidden md:grid grid-cols-12 px-6 py-4 bg-black/30 rounded-2xl border border-white/5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                    <div className="col-span-3">Khách hàng</div>
                                    <div className="col-span-3">BĐS Quan tâm</div>
                                    <div className="col-span-2">Trạng thái chăm sóc</div>
                                    <div className="col-span-3">Nhắc hẹn</div>
                                    <div className="col-span-1 text-right">Lệnh</div>
                                </div>

                                {/* Dense List Items */}
                                {filteredLeads.map((lead) => (
                                    <div key={lead.id} className="group relative bg-[#1a2332] hover:bg-[#1e293b] border border-white/[0.05] hover:border-gold/50 rounded-2xl md:rounded-[1.2rem] p-4 md:p-0 md:px-6 md:py-4 transition-all duration-300 md:grid md:grid-cols-12 md:items-center gap-4">

                                        {/* Name & Contact */}
                                        <div className="col-span-3 flex items-center gap-3 mb-3 md:mb-0">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#bf953f] to-[#aa771c] rounded-xl flex items-center justify-center shrink-0 shadow-md">
                                                <User size={18} className="text-black" strokeWidth={3} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-black text-white italic truncate uppercase">{lead.name}</h4>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] text-gold font-bold">{lead.phone || '---'}</span>
                                                    {lead.phone && (
                                                        <a href={`tel:${lead.phone}`} className="text-gold/40 hover:text-gold transition-colors">
                                                            <Phone size={10} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Property */}
                                        <div className="col-span-3 flex items-center gap-2 mb-3 md:mb-0">
                                            <Building2 size={12} className="text-slate-600 shrink-0" />
                                            <span className="text-[11px] font-bold text-slate-300 truncate tracking-tight">{lead.interested_property || 'Chưa định ví'}</span>
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-2 mb-3 md:mb-0">
                                            <select
                                                value={lead.status}
                                                onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                                                className={`text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest italic border appearance-none transition-all focus:outline-none ${lead.status === 'Chốt' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    lead.status === 'Hủy' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-gold/10 text-gold border-gold/20'
                                                    }`}
                                            >
                                                {STATUS_OPTIONS.map(o => <option key={o} value={o} className="bg-[#1a2332] text-white">{o}</option>)}
                                            </select>
                                        </div>

                                        {/* Reminder */}
                                        <div className="col-span-3 flex items-center gap-2 mb-3 md:mb-0">
                                            <Calendar size={12} className="text-slate-600 shrink-0" />
                                            <span className={`text-[10px] font-black uppercase tracking-tight ${lead.reminder_at && new Date(lead.reminder_at) < new Date(new Date().setHours(0, 0, 0, 0)) ? 'text-red-400' : 'text-slate-400'}`}>
                                                {lead.reminder_at ? new Date(lead.reminder_at).toLocaleDateString('vi-VN') : 'KHÔNG NHẮC'}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-1 flex items-center justify-end gap-2 border-t md:border-none border-white/5 pt-3 md:pt-0">
                                            <button onClick={() => handleDeleteLead(lead.id)} className="p-2 text-slate-700 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
          .text-gold { color: #bf953f; }
          .bg-gold { background: linear-gradient(to bottom right, #bf953f, #fcf6ba, #aa771c); }
        `}} />
        </div>
    );
};

export default MiniCRM;
