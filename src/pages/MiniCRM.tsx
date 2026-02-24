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
    Building2
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

    // 1. Regex for VN Phone numbers
    const phoneRegex = /(?:\+84|0)(?:3|5|7|8|9|1[2689])(?:\d{8}|(?:\s\d{3}){2,3}|(?:\.\d{3}){2,3}|(?:-\d{3}){2,3})/g;
    const foundPhones = text.match(phoneRegex) || [];
    const phone = foundPhones[0] ? foundPhones[0].replace(/[\s\.\-]/g, '') : '';

    // 2. Refined Name Detection (Messenger Context)
    const lines = text.split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 2);

    let name = '';
    const systemNoise = [
        'Messenger', 'Active', 'Facebook', 'Online', 'Tin nhắn', 'Zalo',
        'AM', 'PM', 'hôm qua', 'vừa xong', '4G', '5G', 'LTE', 'Wi-Fi',
        'Đang hoạt động', 'Cuộc gọi', 'Video', 'nhắn tin', 'tìm kiếm', 'phút'
    ];

    for (let i = 0; i < Math.min(lines.length, 15); i++) {
        let line = lines[i];

        // Clean weird symbols often found at line start (back arrows, icons)
        line = line.replace(/^[^a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯ]*/, '').trim();

        if (line.length < 3 || line.length > 30) continue;

        // A name should have at least 2 words and be mostly capitalized
        const words = line.split(/\s+/);
        const isNameLike = words.length >= 2 && words.every(word =>
            /^[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯ]/.test(word) || word.length <= 1
        );

        const hasNoise = systemNoise.some(word => line.toLowerCase().includes(word.toLowerCase()));

        if (isNameLike && !hasNoise) {
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
            const result = await Tesseract.recognize(
                base64,
                'vie+eng',
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
                    <div className="w-10 h-10 bg-gradient-to-br from-[#bf953f] to-[#aa771c] rounded-xl flex items-center justify-center shadow-lg transform rotate-3">
                        <Users className="text-black" size={20} strokeWidth={3} />
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
                                                <p className="text-gold font-black text-xs uppercase tracking-widest animate-pulse">ĐANG PHÂN TÍCH: {ocrProgress}%</p>
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
                                    <h3 className="text-lg font-black text-white italic tracking-tight uppercase">XÁC NHẬN TIN</h3>
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
                                                placeholder="MasterKit User..."
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
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Trạng thái</label>
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
                                                type="datetime-local" value={newLead.reminder_at}
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
                    /* Manage Tab */
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {fetchingLeads ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="w-12 h-12 border-4 border-gold/10 border-t-gold rounded-full animate-spin mb-4"></div>
                                <p className="text-gold font-black uppercase text-[10px] tracking-widest">Đang tải data...</p>
                            </div>
                        ) : leads.length === 0 ? (
                            <div className="p-20 text-center rounded-[2.5rem] bg-[#1a2332] border border-white/5">
                                <Users size={64} className="mx-auto text-slate-800 mb-6" />
                                <h3 className="text-xl font-black text-white italic uppercase mb-2">Trống danh sách</h3>
                                <p className="text-slate-500 text-xs font-bold uppercase mb-8 tracking-widest">Hãy bắt đầu bằng việc quét ảnh khách hàng</p>
                                <button onClick={() => setActiveTab('add')} className="px-10 py-4 bg-gold text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all">THÊM NGAY</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {leads.map((lead) => (
                                    <div key={lead.id} className="group relative p-6 flex flex-col gap-4 rounded-[2.2rem] bg-[#1a2332] border border-white/[0.05] hover:border-gold/50 transition-all duration-500 shadow-xl overflow-hidden">
                                        <div className="absolute top-4 right-4 z-20">
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest italic flex items-center border ${lead.status === 'Chốt' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                lead.status === 'Hủy' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-gold/10 text-gold border-gold/20'
                                                }`}>
                                                {lead.status}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-[#bf953f] to-[#aa771c] rounded-xl flex items-center justify-center shrink-0">
                                                <User size={24} className="text-black" strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-black text-white uppercase italic truncate">{lead.name}</h3>
                                                <p className="text-[10px] text-gold font-black tracking-widest">{lead.phone || '---'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-3 border-t border-white/5">
                                            <div className="flex items-center gap-3">
                                                <Building2 size={12} className="text-slate-500" />
                                                <span className="text-[11px] font-bold text-slate-300 truncate">{lead.interested_property || 'Chưa rõ nhu cầu'}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Calendar size={12} className="text-slate-500" />
                                                <span className={`text-[11px] font-bold ${lead.reminder_at && new Date(lead.reminder_at) < new Date() ? 'text-red-400' : 'text-slate-400'}`}>
                                                    Hẹn sếp: {lead.reminder_at ? new Date(lead.reminder_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                </span>
                                            </div>
                                        </div>

                                        {lead.notes && (
                                            <p className="text-[10px] text-slate-500 italic line-clamp-2 leading-relaxed mt-1">"{lead.notes}"</p>
                                        )}

                                        <div className="flex justify-between items-center mt-auto pt-4">
                                            <select
                                                value={lead.status}
                                                onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                                                className="bg-black/40 border border-white/5 text-[9px] font-black uppercase text-slate-400 py-1.5 px-3 rounded-lg focus:outline-none"
                                            >
                                                {STATUS_OPTIONS.map(o => <option key={o} value={o} className="bg-[#1a2332] text-white">{o}</option>)}
                                            </select>
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
