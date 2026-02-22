import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, ArrowRight, UserSquare2, RefreshCw, Upload, Smartphone, Mail, Briefcase, MapPin, QrCode, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';

const CARD_WIDTH = 1050;
const CARD_HEIGHT = 600;
const TAG_WIDTH = 600;
const TAG_HEIGHT = 200;

const CardCreator = ({ onBack, onAttachToPhoto }: { onBack: () => void, onAttachToPhoto?: (tagDataUrl: string) => void }) => {
    const { profile } = useAuth();
    const [subMode, setSubMode] = useState<'card' | 'tag'>('card');
    const [activeTemplate, setActiveTemplate] = useState<'modern' | 'luxury' | 'creative'>('modern');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        name: profile?.full_name || 'NGUYỄN VĂN A',
        title: profile?.role === 'admin' ? 'GIÁM ĐỐC KINH DOANH' : 'CHUYÊN VIÊN TƯ VẤN BĐS',
        phone: profile?.phone || '0901.234.567',
        email: (profile as any)?.email || 'contact@agency.com',
        company: profile?.agency || 'PHÒNG KINH DOANH BĐS',
        address: 'Quận 1, TP. Hồ Chí Minh',
        zalo: profile?.phone ? `https://zalo.me/${profile.phone.replace(/[^0-9]/g, '')}` : 'https://zalo.me/',
        avatarUrl: (profile as any)?.avatar_url || (profile as any)?.avatar || "https://i.pravatar.cc/300?img=11"
    });

    const initCanvas = useCallback(() => {
        if (!canvasRef.current) return;
        if (fabricCanvasRef.current) fabricCanvasRef.current.dispose();

        const canvas = new fabric.Canvas(canvasRef.current, {
            preserveObjectStacking: true,
            selection: false,
            backgroundColor: subMode === 'card' ? '#ffffff' : 'transparent'
        });

        const updateScale = () => {
            if (!containerRef.current) return;
            const targetW = subMode === 'card' ? CARD_WIDTH : TAG_WIDTH;
            const targetH = subMode === 'card' ? CARD_HEIGHT : TAG_HEIGHT;

            const scale = Math.min(
                (containerRef.current.clientWidth - 80) / targetW,
                (containerRef.current.clientHeight - 80) / targetH
            );

            canvas.setDimensions({ width: targetW * scale, height: targetH * scale });
            canvas.setZoom(scale);
        };

        fabricCanvasRef.current = canvas;
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [subMode]);

    useEffect(() => {
        const cleanup = initCanvas();
        renderTemplate();
        return cleanup;
    }, [initCanvas, formData, activeTemplate]);

    const renderTemplate = async () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;
        canvas.clear();

        if (subMode === 'card') {
            await renderCard(canvas);
        } else {
            await renderTag(canvas);
        }
        canvas.renderAll();
    };

    const loadImg = (url: string): Promise<fabric.Image> => new Promise(r => fabric.Image.fromURL(url, img => r(img), { crossOrigin: 'anonymous' }));

    const setupSmartAvatar = async (imgUrl: string, targetSize: number, posX: number, posY: number, canvas: fabric.Canvas, type: 'circle' | 'rect' | 'creative') => {
        const avatar = await loadImg(imgUrl);
        const imgW = avatar.width || 1;
        const imgH = avatar.height || 1;

        const scale = targetSize / Math.min(imgW, imgH);

        avatar.set({
            scaleX: scale,
            scaleY: scale,
            left: posX,
            top: posY,
            originX: 'center',
            originY: 'center',
            selectable: false
        });

        if (type === 'circle') {
            avatar.set({
                clipPath: new fabric.Circle({ radius: Math.min(imgW, imgH) / 2, originX: 'center', originY: 'center' })
            });
        } else if (type === 'rect') {
            avatar.set({
                clipPath: new fabric.Rect({ width: imgW, height: imgH, rx: 50, ry: 50, originX: 'center', originY: 'center' })
            });
        } else {
            // Creative - Octagon-ish or custom shape clip
            avatar.set({
                clipPath: new fabric.Rect({ width: imgW, height: imgH, rx: 200, ry: 50, originX: 'center', originY: 'center' })
            });
        }
        canvas.add(avatar);
        return avatar;
    };

    const renderCard = async (canvas: fabric.Canvas) => {
        if (activeTemplate === 'modern') {
            // Template 1: MODERN CORPORATE
            canvas.setBackgroundColor('#ffffff', () => { });
            const sidebar = new fabric.Rect({ width: CARD_WIDTH * 0.35, height: CARD_HEIGHT, fill: '#1e3a8a', selectable: false });
            canvas.add(sidebar);

            const avatarSize = 340;
            await setupSmartAvatar(formData.avatarUrl, avatarSize, CARD_WIDTH * 0.175, CARD_HEIGHT / 2, canvas, 'circle');

            canvas.add(new fabric.Circle({
                radius: avatarSize / 2 + 10, fill: 'transparent', stroke: '#ffffff', strokeWidth: 8,
                left: CARD_WIDTH * 0.175, top: CARD_HEIGHT / 2, originX: 'center', originY: 'center'
            }));

            const name = new fabric.Text(formData.name.toUpperCase(), { left: CARD_WIDTH * 0.42, top: 120, fontSize: 56, fontWeight: '900', fill: '#1e293b', fontFamily: 'Be Vietnam Pro' });
            const title = new fabric.Text(formData.title.toUpperCase(), { left: CARD_WIDTH * 0.42, top: 190, fontSize: 24, fontWeight: '700', fill: '#3b82f6', charSpacing: 50 });
            canvas.add(name, title);
            canvas.add(new fabric.Rect({ left: CARD_WIDTH * 0.42, top: 235, width: 300, height: 4, fill: '#e2e8f0' }));

            const phone = new fabric.Text(`📲 Hotline: ${formData.phone}`, { left: CARD_WIDTH * 0.42, top: 290, fontSize: 26, fontWeight: '900', fill: '#1e293b' });
            const email = new fabric.Text(`📧 Email: ${formData.email}`, { left: CARD_WIDTH * 0.42, top: 350, fontSize: 22, fill: '#475569' });
            const company = new fabric.Text(`🏢 ${formData.company.toUpperCase()}`, { left: CARD_WIDTH * 0.42, top: 410, fontSize: 20, fontWeight: '800', fill: '#1e3a8a' });
            canvas.add(phone, email, company);

        } else if (activeTemplate === 'luxury') {
            // Template 2: LUXURY GOLD
            canvas.setBackgroundColor('#080808', () => { });
            const gradient = new fabric.Gradient({
                type: 'linear', coords: { x1: 0, y1: 0, x2: CARD_WIDTH, y2: 0 },
                colorStops: [{ offset: 0, color: '#bf953f' }, { offset: 1, color: '#aa771c' }]
            });

            canvas.add(new fabric.Rect({ width: CARD_WIDTH, height: 15, fill: gradient }));
            canvas.add(new fabric.Rect({ width: CARD_WIDTH, height: 15, top: CARD_HEIGHT - 15, fill: gradient }));

            const avatarSize = 300;
            await setupSmartAvatar(formData.avatarUrl, avatarSize, CARD_WIDTH * 0.2, CARD_HEIGHT / 2, canvas, 'rect');

            canvas.add(new fabric.Rect({
                width: avatarSize + 20, height: avatarSize + 20, rx: 60, ry: 60,
                left: CARD_WIDTH * 0.2, top: CARD_HEIGHT / 2, originX: 'center', originY: 'center',
                fill: 'transparent', stroke: '#bf953f', strokeWidth: 4
            }));

            const name = new fabric.Text(formData.name.toUpperCase(), { left: CARD_WIDTH * 0.42, top: 150, fontSize: 62, fontWeight: '900', fill: '#bf953f' });
            const title = new fabric.Text(formData.title.toUpperCase(), { left: CARD_WIDTH * 0.42, top: 225, fontSize: 20, fontWeight: '400', fill: '#ffffff', charSpacing: 300 });
            canvas.add(name, title);

            const phone = new fabric.Text(`M: ${formData.phone}`, { left: CARD_WIDTH * 0.42, top: 320, fontSize: 28, fill: '#ffffff', fontWeight: '900' });
            const company = new fabric.Text(formData.company, { left: CARD_WIDTH * 0.42, top: 375, fontSize: 20, fill: '#666', fontWeight: '600' });
            canvas.add(phone, company);

        } else if (activeTemplate === 'creative') {
            // Template 3: CREATIVE DYNAMIC
            canvas.setBackgroundColor('#f8fafc', () => { });
            const decor = new fabric.Polygon([
                { x: CARD_WIDTH, y: 0 },
                { x: CARD_WIDTH * 0.6, y: 0 },
                { x: CARD_WIDTH, y: CARD_HEIGHT * 0.8 }
            ], { fill: '#ef4444', opacity: 0.1, selectable: false });
            canvas.add(decor);

            const avatarSize = 400;
            await setupSmartAvatar(formData.avatarUrl, avatarSize, CARD_WIDTH * 0.75, CARD_HEIGHT / 2, canvas, 'creative');

            const name = new fabric.Text(formData.name.toUpperCase(), { left: 80, top: 140, fontSize: 72, fontWeight: '900', fill: '#1e293b' });
            const title = new fabric.Text(formData.title, { left: 80, top: 220, fontSize: 24, fontWeight: 'bold', fill: '#ef4444' });
            canvas.add(name, title);

            const infoBox = new fabric.Group([
                new fabric.Text(formData.phone, { fontSize: 32, fontWeight: '900', fill: '#1e293b', top: 0 }),
                new fabric.Text(formData.email, { fontSize: 20, fill: '#64748b', top: 45 }),
                new fabric.Text(formData.company, { fontSize: 18, fontWeight: '700', fill: '#ef4444', top: 80 })
            ], { left: 80, top: 320 });
            canvas.add(infoBox);
        }
    };

    const renderTag = async (canvas: fabric.Canvas) => {
        const isDark = activeTemplate === 'luxury';
        const accent = activeTemplate === 'creative' ? '#ef4444' : (isDark ? '#bf953f' : '#3b82f6');

        const pill = new fabric.Rect({
            width: TAG_WIDTH - 20, height: TAG_HEIGHT - 40, rx: 80, ry: 80,
            left: 10, top: 20, fill: isDark ? '#111' : '#ffffff',
            stroke: accent, strokeWidth: 2,
            shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 20, offsetY: 10 })
        });
        canvas.add(pill);

        const avatarSize = 130;
        await setupSmartAvatar(formData.avatarUrl, avatarSize, 80, TAG_HEIGHT / 2, canvas, 'circle');

        canvas.add(new fabric.Circle({
            radius: 65, fill: 'transparent', stroke: accent, strokeWidth: 4,
            left: 80, top: TAG_HEIGHT / 2, originX: 'center', originY: 'center'
        }));

        const name = new fabric.Text(formData.name, { left: 165, top: TAG_HEIGHT / 2 - 25, fontSize: 32, fontWeight: '900', fill: isDark ? '#bf953f' : '#1e293b' });
        const phone = new fabric.Text(formData.phone, { left: 165, top: TAG_HEIGHT / 2 + 10, fontSize: 24, fontWeight: '700', fill: isDark ? '#ffffff' : accent });
        canvas.add(name, phone);
    };

    const handleExport = () => {
        if (!fabricCanvasRef.current) return;
        const dataURL = fabricCanvasRef.current.toDataURL({ format: 'png', multiplier: 3, quality: 1.0 });

        if (subMode === 'tag' && onAttachToPhoto) {
            onAttachToPhoto(dataURL);
            toast.success("Ready! Redirecting to Photo Editor...");
        } else {
            const link = document.createElement('a');
            link.download = `NameCard_${activeTemplate}_${Date.now()}.png`;
            link.href = dataURL;
            link.click();
            toast.success("Đã tải bản HD 3x sắc nét!");
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-950">
            <div className="flex items-center justify-between p-4 bg-[#080808] border-b border-white/10">
                <button onClick={onBack} className="text-slate-500 hover:text-white flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all">
                    <ArrowRight className="rotate-180" size={14} /> Back to Studio
                </button>

                <div className="flex bg-white/5 p-1 rounded-2xl gap-1">
                    <button onClick={() => setSubMode('card')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${subMode === 'card' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-slate-500 hover:text-slate-300'}`}>Name Card</button>
                    <button onClick={() => setSubMode('tag')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${subMode === 'tag' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-slate-500 hover:text-slate-300'}`}>Name Tag</button>
                </div>

                <button onClick={handleExport} className="group bg-white text-black px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold transition-all flex items-center gap-2">
                    <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                    {subMode === 'card' ? 'Tải Card HD' : 'Gắn vào ảnh'}
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-[380px] bg-[#050505] border-r border-white/10 p-8 overflow-y-auto no-scrollbar space-y-10">
                    <section>
                        <header className="flex items-center gap-2 mb-6"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Mẫu thiết kế (3 Options)</h3></header>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'modern', label: '1. Modern Corporate', desc: 'Chuyên nghiệp, tin cậy', style: 'bg-blue-600' },
                                { id: 'luxury', label: '2. Luxury Gold', desc: 'Đẳng cấp, sang trọng', style: 'bg-[#111] border border-gold/50' },
                                { id: 'creative', label: '3. Creative Dynamic', desc: 'Đột phá, ấn tượng', style: 'bg-red-500' }
                            ].map(t => (
                                <button key={t.id} onClick={() => setActiveTemplate(t.id as any)} className={`p-4 rounded-3xl border-2 transition-all flex items-center gap-4 text-left ${activeTemplate === t.id ? 'border-gold bg-gold/5 shadow-lg shadow-gold/5' : 'border-white/5 bg-white/[0.02]'}`}>
                                    <div className={`w-16 h-10 rounded-lg shrink-0 ${t.style}`}></div>
                                    <div>
                                        <div className={`text-[10px] font-black uppercase ${activeTemplate === t.id ? 'text-gold' : 'text-white'}`}>{t.label}</div>
                                        <div className="text-[8px] font-bold text-slate-500 uppercase">{t.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-5">
                        <header className="flex items-center gap-2 mb-2"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identity Profile</h3></header>
                        <div className="relative group w-24 h-24 mx-auto mb-4">
                            <img src={formData.avatarUrl} className="w-full h-full rounded-[2.5rem] object-cover border-2 border-white/10" alt="Profile" />
                            <label className="absolute inset-0 bg-black/80 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                                <RefreshCw size={20} className="text-gold" />
                                <input type="file" className="hidden" onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) setFormData({ ...formData, avatarUrl: URL.createObjectURL(f) });
                                }} />
                            </label>
                        </div>
                        <div className="space-y-4">
                            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-white font-black" placeholder="Họ và tên" />
                            <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-gold font-bold" placeholder="SĐT liên hệ" />
                            <input value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-[10px] text-slate-400" placeholder="Tên đơn vị / Công ty" />
                        </div>
                    </section>
                </div>

                <div ref={containerRef} className="flex-1 bg-black flex flex-col items-center justify-center p-20 relative overflow-hidden">
                    <header className="absolute top-10 flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] italic flex items-center gap-3"><div className="h-px w-10 bg-gold/20"></div> Smart Identity Suite <div className="h-px w-10 bg-gold/20"></div></span>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 font-black"><Zap size={10} className="text-gold" /> SVG High-Precision Rendering</p>
                    </header>
                    <div className="shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] rounded-sm overflow-hidden border border-white/10"><canvas ref={canvasRef} /></div>
                    <div className="mt-12 flex items-center gap-3 px-6 py-2.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-xl">
                        <ShieldCheck className="text-gold" size={14} /><span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">{subMode === 'card' ? '300 DPI Institutional Print Grade' : 'Dynamic Overlay Identity Tag'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardCreator;
