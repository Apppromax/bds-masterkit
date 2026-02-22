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
    const [activeTemplate, setActiveTemplate] = useState<'modern' | 'luxury'>('modern');

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

    const renderCard = async (canvas: fabric.Canvas) => {
        if (activeTemplate === 'modern') {
            canvas.setBackgroundColor('#ffffff', () => { });

            // Decorative background
            const bg = new fabric.Rect({ width: CARD_WIDTH * 0.38, height: CARD_HEIGHT, fill: '#1e3a8a', selectable: false });
            const accent = new fabric.Rect({ width: 15, height: CARD_HEIGHT, left: CARD_WIDTH * 0.38, fill: '#3b82f6', selectable: false });
            canvas.add(bg, accent);

            const avatar = await loadImg(formData.avatarUrl);
            const size = 320;
            const scale = size / Math.min(avatar.width || 1, avatar.height || 1);
            avatar.set({
                scaleX: scale, scaleY: scale,
                left: CARD_WIDTH * 0.19, top: CARD_HEIGHT / 2,
                originX: 'center', originY: 'center',
                clipPath: new fabric.Circle({ radius: (avatar.width || 1) / 2, originX: 'center', originY: 'center' })
            });

            const border = new fabric.Circle({
                radius: size / 2 + 8, fill: 'transparent',
                stroke: '#ffffff', strokeWidth: 6,
                left: CARD_WIDTH * 0.19, top: CARD_HEIGHT / 2,
                originX: 'center', originY: 'center'
            });
            canvas.add(border, avatar);

            const name = new fabric.Text(formData.name.toUpperCase(), {
                left: CARD_WIDTH * 0.45, top: 120,
                fontSize: 58, fontWeight: '900', fill: '#1e293b',
                fontFamily: 'Be Vietnam Pro'
            });

            const title = new fabric.Text(formData.title.toUpperCase(), {
                left: CARD_WIDTH * 0.45, top: 195,
                fontSize: 22, fontWeight: '700', fill: '#3b82f6',
                charSpacing: 100
            });

            const line = new fabric.Rect({
                left: CARD_WIDTH * 0.45, top: 240,
                width: 250, height: 4, fill: '#cbd5e1'
            });
            canvas.add(name, title, line);

            const phone = new fabric.Text(`Phone: ${formData.phone}`, { left: CARD_WIDTH * 0.45, top: 290, fontSize: 26, fontWeight: '700', fill: '#1e293b' });
            const email = new fabric.Text(`Email: ${formData.email}`, { left: CARD_WIDTH * 0.45, top: 340, fontSize: 22, fill: '#475569' });
            const company = new fabric.Text(formData.company.toUpperCase(), { left: CARD_WIDTH * 0.45, top: 400, fontSize: 20, fontWeight: '800', fill: '#1e3a8a', charSpacing: 50 });
            canvas.add(phone, email, company);

            // QR Placeholder
            const qrText = new fabric.Text('ZALO QR', { left: CARD_WIDTH - 150, top: CARD_HEIGHT - 60, fontSize: 14, fontWeight: 'bold', fill: '#94a3b8', originX: 'center' });
            const qrBox = new fabric.Rect({ left: CARD_WIDTH - 225, top: CARD_HEIGHT - 225, width: 150, height: 150, fill: '#f8fafc', stroke: '#e2e8f0', rx: 12 });
            canvas.add(qrBox, qrText);

        } else if (activeTemplate === 'luxury') {
            canvas.setBackgroundColor('#050505', () => { });

            const gradient = new fabric.Gradient({
                type: 'linear', coords: { x1: 0, y1: 0, x2: CARD_WIDTH, y2: 0 },
                colorStops: [{ offset: 0, color: '#bf953f' }, { offset: 1, color: '#aa771c' }]
            });

            const topBorder = new fabric.Rect({ width: CARD_WIDTH, height: 12, fill: gradient });
            const botBorder = new fabric.Rect({ width: CARD_WIDTH, height: 12, top: CARD_HEIGHT - 12, fill: gradient });
            canvas.add(topBorder, botBorder);

            const name = new fabric.Text(formData.name.toUpperCase(), {
                left: CARD_WIDTH / 2, top: CARD_HEIGHT / 2 - 40,
                originX: 'center', fontSize: 68, fontWeight: '900',
                fill: '#bf953f', fontFamily: 'serif'
            });

            const title = new fabric.Text(formData.title.toUpperCase(), {
                left: CARD_WIDTH / 2, top: CARD_HEIGHT / 2 + 30,
                originX: 'center', fontSize: 20, fontWeight: '400',
                fill: '#ffffff', charSpacing: 300
            });
            canvas.add(name, title);

            const phone = new fabric.Text(formData.phone, { left: 50, top: CARD_HEIGHT - 60, fontSize: 20, fill: '#bf953f', fontWeight: 'bold' });
            const company = new fabric.Text(formData.company, { left: CARD_WIDTH - 50, top: 40, originX: 'right', fontSize: 18, fill: '#ffffff', opacity: 0.6 });
            canvas.add(phone, company);
        }
    };

    const renderTag = async (canvas: fabric.Canvas) => {
        const isLuxury = activeTemplate === 'luxury';
        canvas.setBackgroundColor('transparent', () => { });

        const pill = new fabric.Rect({
            width: TAG_WIDTH - 20, height: TAG_HEIGHT - 40, rx: 80, ry: 80,
            left: 10, top: 20, fill: isLuxury ? '#111' : '#ffffff',
            stroke: isLuxury ? '#bf953f' : '#e2e8f0', strokeWidth: 2,
            shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.4)', blur: 20, offsetY: 10 })
        });
        canvas.add(pill);

        const avatar = await loadImg(formData.avatarUrl);
        const size = 110;
        const scale = size / Math.min(avatar.width || 1, avatar.height || 1);
        avatar.set({
            scaleX: scale, scaleY: scale, left: 80, top: TAG_HEIGHT / 2,
            originX: 'center', originY: 'center',
            clipPath: new fabric.Circle({ radius: (avatar.width || 1) / 2, originX: 'center', originY: 'center' })
        });

        const border = new fabric.Circle({
            radius: 60, fill: 'transparent',
            stroke: isLuxury ? '#bf953f' : '#3b82f6', strokeWidth: 4,
            left: 80, top: TAG_HEIGHT / 2, originX: 'center', originY: 'center'
        });
        canvas.add(border, avatar);

        const name = new fabric.Text(formData.name, {
            left: 160, top: TAG_HEIGHT / 2 - 25,
            fontSize: 28, fontWeight: '900', fill: isLuxury ? '#bf953f' : '#1e293b'
        });

        const phone = new fabric.Text(formData.phone, {
            left: 160, top: TAG_HEIGHT / 2 + 10,
            fontSize: 20, fontWeight: '700', fill: isLuxury ? '#ffffff' : '#3b82f6'
        });
        canvas.add(name, phone);
    };

    const handleExport = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const dataURL = canvas.toDataURL({
            format: 'png',
            multiplier: 3, // 3x Quality
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
            toast.success("Exported HD (3x Color Profile)");
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-950">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-[#080808] border-b border-white/10">
                <button onClick={onBack} className="text-slate-500 hover:text-white flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all">
                    <ArrowRight className="rotate-180" size={14} /> Back to Studio
                </button>

                <div className="flex bg-white/5 p-1 rounded-2xl gap-1">
                    <button
                        onClick={() => setSubMode('card')}
                        className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${subMode === 'card' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Display Card
                    </button>
                    <button
                        onClick={() => setSubMode('tag')}
                        className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${subMode === 'tag' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Photo Tag
                    </button>
                </div>

                <button
                    onClick={handleExport}
                    className="group bg-white text-black px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold transition-all flex items-center gap-2"
                >
                    <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                    {subMode === 'card' ? 'Save Card HD (3x)' : 'Attach to Photo'}
                </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Profile & Templates */}
                <div className="w-[380px] bg-[#050505] border-r border-white/10 p-8 overflow-y-auto no-scrollbar space-y-10">
                    <section>
                        <header className="flex items-center gap-2 mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Template Selection</h3>
                        </header>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setActiveTemplate('modern')}
                                className={`group p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${activeTemplate === 'modern' ? 'border-gold bg-gold/5' : 'border-white/5 hover:border-white/10 bg-white/[0.02]'}`}
                            >
                                <div className="w-full aspect-[1.75/1] bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl"></div>
                                <span className={`text-[9px] font-black uppercase tracking-tighter ${activeTemplate === 'modern' ? 'text-gold' : 'text-slate-500'}`}>Modern Corporate</span>
                            </button>
                            <button
                                onClick={() => setActiveTemplate('luxury')}
                                className={`group p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${activeTemplate === 'luxury' ? 'border-gold bg-gold/5' : 'border-white/5 hover:border-white/10 bg-white/[0.02]'}`}
                            >
                                <div className="w-full aspect-[1.75/1] bg-[#0a0a0a] border border-gold/30 rounded-xl flex items-center justify-center">
                                    <div className="w-8 h-px bg-gold/50"></div>
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-tighter ${activeTemplate === 'luxury' ? 'text-gold' : 'text-slate-500'}`}>Elite Black/Gold</span>
                            </button>
                        </div>
                    </section>

                    <section>
                        <header className="flex items-center gap-2 mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-gold"></div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identity Profile</h3>
                        </header>
                        <div className="space-y-5">
                            <div className="relative group w-24 h-24 mx-auto mb-8">
                                <img src={formData.avatarUrl} className="w-full h-full rounded-[2rem] object-cover border-2 border-white/10 shadow-2xl group-hover:border-gold/50 transition-all duration-500" alt="Profile" />
                                <label className="absolute inset-0 bg-black/80 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                                    <RefreshCw size={20} className="text-gold animate-spin-slow" />
                                    <input type="file" className="hidden" onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) setFormData({ ...formData, avatarUrl: URL.createObjectURL(f) });
                                    }} />
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[8px] font-black text-slate-600 uppercase ml-2 tracking-widest">Full Name</label>
                                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-white font-black tracking-tight focus:border-gold/50 outline-none transition-all" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[8px] font-black text-slate-600 uppercase ml-2 tracking-widest">Professional Title</label>
                                <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-slate-200 font-bold focus:border-gold/50 outline-none transition-all" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-slate-600 uppercase ml-2 tracking-widest">Hotline</label>
                                    <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-gold font-black focus:border-gold/50 outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black text-slate-600 uppercase ml-2 tracking-widest">Office</label>
                                    <input value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-[10px] text-slate-400 font-bold focus:border-gold/50 outline-none transition-all" />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Main Viewport */}
                <div ref={containerRef} className="flex-1 bg-black flex flex-col items-center justify-center p-16 relative overflow-hidden">
                    {/* Background decor */}
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/5 to-transparent pointer-events-none"></div>

                    <header className="absolute top-10 flex flex-col items-center gap-2 pointer-events-none">
                        <div className="flex items-center gap-4">
                            <div className="h-px w-8 bg-gold/30"></div>
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] italic">Real-Time Preview</span>
                            <div className="h-px w-8 bg-gold/30"></div>
                        </div>
                        <p className="text-[8px] font-medium text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <Zap size={10} className="text-gold" /> SVG Vector Engine • Zero Blur Technology
                        </p>
                    </header>

                    <div className="relative z-10">
                        {/* Shadow box for the card */}
                        <div className="shadow-[0_80px_160px_-40px_rgba(0,0,0,1)] rounded-sm overflow-hidden border border-white/10 group transition-all duration-700 hover:scale-[1.02]">
                            <canvas ref={canvasRef} />
                        </div>

                        {/* Info badge */}
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-xl">
                            <ShieldCheck className="text-gold" size={12} />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                {subMode === 'card' ? 'Standard 3.5 x 2 in' : 'Standard Photo Overlay Tag'}
                            </span>
                        </div>
                    </div>

                    <footer className="absolute bottom-10 opacity-20 hover:opacity-100 transition-opacity">
                        <p className="text-[7px] font-black text-white uppercase tracking-[0.4em]">Homespro Financial & Identity Suite</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default CardCreator;
