import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, ArrowRight, UserSquare2, RefreshCw, Upload, Smartphone, Mail, Briefcase, MapPin, QrCode, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';

const CARD_WIDTH = 1050; // 3.5" at 300DPI
const CARD_HEIGHT = 600; // 2" at 300DPI
const TAG_WIDTH = 600;
const TAG_HEIGHT = 200;

const CardCreator = ({ onBack, onAttachToPhoto }: { onBack: () => void, onAttachToPhoto?: (tagDataUrl: string) => void }) => {
    const { profile } = useAuth();
    const [subMode, setSubMode] = useState<'card' | 'tag'>('card');
    const [activeTemplate, setActiveTemplate] = useState<'modern' | 'luxury' | 'elite'>('modern');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        name: profile?.full_name || 'NGUYỄN VĂN A',
        title: profile?.role === 'admin' ? 'GIÁM ĐỐC KINH DOANH' : 'CHUYÊN VIÊN TƯ VẤN BĐS',
        phone: profile?.phone || '0901.234.567',
        email: (profile as any)?.email || 'contact@agency.com',
        company: profile?.agency || 'CÔNG TY BẤT ĐỘNG SẢN',
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
                (containerRef.current.clientWidth - 60) / targetW,
                (containerRef.current.clientHeight - 60) / targetH
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

    const setupAvatar = async (imgUrl: string, targetSize: number, posX: number, posY: number, canvas: fabric.Canvas, isCircle: boolean = true) => {
        const avatar = await loadImg(imgUrl);
        const imgW = avatar.width || 1;
        const imgH = avatar.height || 1;

        // Smart Cover Logic: Scale to minimum dimension
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

        if (isCircle) {
            // Clip to circle relative to object image dimensions
            avatar.set({
                clipPath: new fabric.Circle({
                    radius: Math.min(imgW, imgH) / 2,
                    originX: 'center',
                    originY: 'center'
                })
            });
        } else {
            // Clip to rounded rect
            avatar.set({
                clipPath: new fabric.Rect({
                    width: Math.min(imgW, imgH),
                    height: Math.min(imgW, imgH),
                    rx: 40, ry: 40,
                    originX: 'center',
                    originY: 'center'
                })
            });
        }
        canvas.add(avatar);
        return avatar;
    };

    const renderCard = async (canvas: fabric.Canvas) => {
        const isElite = activeTemplate === 'elite';
        const isLuxury = activeTemplate === 'luxury';

        if (activeTemplate === 'modern') {
            canvas.setBackgroundColor('#ffffff', () => { });
            const bg = new fabric.Rect({ width: CARD_WIDTH * 0.38, height: CARD_HEIGHT, fill: '#1e3a8a', selectable: false });
            const accent = new fabric.Rect({ width: 15, height: CARD_HEIGHT, left: CARD_WIDTH * 0.38, fill: '#3b82f6', selectable: false });
            canvas.add(bg, accent);

            const avatarSize = 320;
            await setupAvatar(formData.avatarUrl, avatarSize, CARD_WIDTH * 0.19, CARD_HEIGHT / 2, canvas, true);

            // Border
            canvas.add(new fabric.Circle({
                radius: avatarSize / 2 + 8, fill: 'transparent',
                stroke: '#ffffff', strokeWidth: 6,
                left: CARD_WIDTH * 0.19, top: CARD_HEIGHT / 2, originX: 'center', originY: 'center'
            }));

            const name = new fabric.Text(formData.name.toUpperCase(), { left: CARD_WIDTH * 0.45, top: 120, fontSize: 58, fontWeight: '900', fill: '#1e293b', fontFamily: 'Be Vietnam Pro' });
            const title = new fabric.Text(formData.title.toUpperCase(), { left: CARD_WIDTH * 0.45, top: 195, fontSize: 22, fontWeight: '700', fill: '#3b82f6', charSpacing: 100 });
            canvas.add(name, title);
            canvas.add(new fabric.Rect({ left: CARD_WIDTH * 0.45, top: 240, width: 250, height: 4, fill: '#cbd5e1' }));

            const phone = new fabric.Text(`📞 ${formData.phone}`, { left: CARD_WIDTH * 0.45, top: 290, fontSize: 26, fontWeight: '900', fill: '#1e293b' });
            const email = new fabric.Text(`✉️ ${formData.email}`, { left: CARD_WIDTH * 0.45, top: 350, fontSize: 22, fill: '#475569' });
            const company = new fabric.Text(formData.company.toUpperCase(), { left: CARD_WIDTH * 0.45, top: 410, fontSize: 20, fontWeight: '800', fill: '#1e3a8a', charSpacing: 50 });
            canvas.add(phone, email, company);

        } else if (isLuxury || isElite) {
            canvas.setBackgroundColor('#050505', () => { });
            const primaryColor = isElite ? '#bf953f' : '#bf953f';

            const gradient = new fabric.Gradient({
                type: 'linear', coords: { x1: 0, y1: 0, x2: CARD_WIDTH, y2: 0 },
                colorStops: [{ offset: 0, color: primaryColor }, { offset: 1, color: '#aa771c' }]
            });

            const topBorder = new fabric.Rect({ width: CARD_WIDTH, height: 12, fill: gradient });
            const botBorder = new fabric.Rect({ width: CARD_WIDTH, height: 12, top: CARD_HEIGHT - 12, fill: gradient });
            canvas.add(topBorder, botBorder);

            const avatarSize = 250;
            await setupAvatar(formData.avatarUrl, avatarSize, CARD_WIDTH * 0.18, CARD_HEIGHT / 2, canvas, false);

            // Border for avatar
            canvas.add(new fabric.Rect({
                width: avatarSize + 10, height: avatarSize + 10, rx: 45, ry: 45,
                left: CARD_WIDTH * 0.18, top: CARD_HEIGHT / 2, originX: 'center', originY: 'center',
                fill: 'transparent', stroke: primaryColor, strokeWidth: 3
            }));

            const name = new fabric.Text(formData.name.toUpperCase(), { left: CARD_WIDTH * 0.38, top: 160, fontSize: 64, fontWeight: '900', fill: '#ffffff' });
            const title = new fabric.Text(formData.title.toUpperCase(), { left: CARD_WIDTH * 0.38, top: 235, fontSize: 20, fontWeight: '400', fill: primaryColor, charSpacing: 200 });
            canvas.add(name, title);

            const phone = new fabric.Text(`HOTLINE: ${formData.phone}`, { left: CARD_WIDTH * 0.38, top: 320, fontSize: 24, fill: '#ffffff', fontWeight: '900' });
            const company = new fabric.Text(formData.company, { left: CARD_WIDTH * 0.38, top: 365, fontSize: 18, fill: '#ffffff', opacity: 0.5 });
            canvas.add(phone, company);

            // Decoration
            const decor = new fabric.Rect({ left: CARD_WIDTH - 60, top: 100, width: 2, height: CARD_HEIGHT - 200, fill: primaryColor, opacity: 0.3 });
            canvas.add(decor);
        }
    };

    const renderTag = async (canvas: fabric.Canvas) => {
        const isLuxury = activeTemplate === 'luxury' || activeTemplate === 'elite';
        canvas.setBackgroundColor('transparent', () => { });

        const pill = new fabric.Rect({
            width: TAG_WIDTH - 20, height: TAG_HEIGHT - 40, rx: 80, ry: 80,
            left: 10, top: 20, fill: isLuxury ? '#111' : '#ffffff',
            stroke: isLuxury ? '#bf953f' : '#3b82f6', strokeWidth: 2,
            shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 25, offsetY: 12 })
        });
        canvas.add(pill);

        const avatarSize = 130;
        await setupAvatar(formData.avatarUrl, avatarSize, 80, TAG_HEIGHT / 2, canvas, true);

        const border = new fabric.Circle({
            radius: 65, fill: 'transparent',
            stroke: isLuxury ? '#bf953f' : '#3b82f6', strokeWidth: 4,
            left: 80, top: TAG_HEIGHT / 2, originX: 'center', originY: 'center'
        });
        canvas.add(border);

        const name = new fabric.Text(formData.name, { left: 165, top: TAG_HEIGHT / 2 - 28, fontSize: 32, fontWeight: '900', fill: isLuxury ? '#bf953f' : '#1e3a8a' });
        const phone = new fabric.Text(formData.phone, { left: 165, top: TAG_HEIGHT / 2 + 10, fontSize: 24, fontWeight: '700', fill: isLuxury ? '#ffffff' : '#3b82f6' });
        canvas.add(name, phone);
    };

    const handleExport = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const dataURL = canvas.toDataURL({
            format: 'png',
            multiplier: 3,
            quality: 1.0
        });

        if (subMode === 'tag' && onAttachToPhoto) {
            onAttachToPhoto(dataURL);
            toast.success("Ready! Redirecting to Photo Editor...");
        } else {
            const link = document.createElement('a');
            link.download = `NameCard_${formData.name.replace(/\s+/g, '_')}_3x.png`;
            link.href = dataURL;
            link.click();
            toast.success("Đã tải bản HD 3x nét căng!");
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
                    {subMode === 'card' ? 'Tải Card HD 3x' : 'Gắn vào ảnh ngay'}
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-[380px] bg-[#050505] border-r border-white/10 p-8 overflow-y-auto no-scrollbar space-y-10">
                    <section>
                        <header className="flex items-center gap-2 mb-6"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Template Selection</h3></header>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: 'modern', label: 'Modern Blue', color: 'bg-blue-800' },
                                { id: 'luxury', label: 'Luxury Gold', color: 'bg-[#111] border-gold/30' },
                                { id: 'elite', label: 'Elite Pro', color: 'bg-gradient-to-br from-gold/40 to-black' }
                            ].map(t => (
                                <button key={t.id} onClick={() => setActiveTemplate(t.id as any)} className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${activeTemplate === t.id ? 'border-gold bg-gold/5' : 'border-white/5 bg-white/[0.02]'}`}>
                                    <div className={`w-full aspect-[1.75/1] rounded-xl border ${t.color}`}></div>
                                    <span className={`text-[8px] font-black uppercase ${activeTemplate === t.id ? 'text-gold' : 'text-slate-500'}`}>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section>
                        <header className="flex items-center gap-2 mb-6"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identity Profile</h3></header>
                        <div className="space-y-5">
                            <div className="relative group w-24 h-24 mx-auto mb-8">
                                <img src={formData.avatarUrl} className="w-full h-full rounded-[2rem] object-cover border-2 border-white/10" alt="Profile" />
                                <label className="absolute inset-0 bg-black/80 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                                    <RefreshCw size={20} className="text-gold" />
                                    <input type="file" className="hidden" onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) setFormData({ ...formData, avatarUrl: URL.createObjectURL(f) });
                                    }} />
                                </label>
                            </div>
                            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-white font-black" placeholder="Họ và tên" />
                            <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-slate-200" placeholder="Chức danh" />
                            <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-gold font-bold" placeholder="Hotline" />
                            <input value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-[10px] text-slate-500" placeholder="Công ty" />
                        </div>
                    </section>
                </div>

                <div ref={containerRef} className="flex-1 bg-black flex flex-col items-center justify-center p-16 relative overflow-hidden">
                    <header className="absolute top-10 flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] italic flex items-center gap-3">
                            <div className="h-px w-8 bg-gold/20"></div> Smart-Cover Scaling <div className="h-px w-8 bg-gold/20"></div>
                        </span>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2"><Zap size={10} className="text-gold" /> SVG Vector Engine • 3x Precise Alignment</p>
                    </header>
                    <div className="shadow-[0_80px_160px_-40px_rgba(0,0,0,1)] rounded-sm overflow-hidden border border-white/10"><canvas ref={canvasRef} /></div>
                    <div className="mt-12 flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                        <ShieldCheck className="text-gold" size={12} /><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{subMode === 'card' ? 'Institutional Grade Name Card' : 'Dynamic Identity Tag'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardCreator;
