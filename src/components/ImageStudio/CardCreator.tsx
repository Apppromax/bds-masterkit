import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, ArrowRight, RefreshCw, Smartphone, Mail, MapPin, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';

const CARD_WIDTH = 1050;
const CARD_HEIGHT = 600;

const CardCreator = ({ onBack }: { onBack: () => void }) => {
    const { profile } = useAuth();
    const [activeTemplate, setActiveTemplate] = useState<'orange_waves' | 'luxury_gold' | 'blue_geo'>('orange_waves');
    const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        name: profile?.full_name || 'TRẦN HỮU CHIẾN',
        title: 'GIÁM ĐỐC KINH DOANH',
        phone: profile?.phone || '0988 226 493',
        email: (profile as any)?.email || 'chien.tran@cenland.vn',
        company: profile?.agency || 'CENLAND GROUP',
        tagline: 'YOUR TAGLINE GOES HERE',
        address: 'Tháp Thành Công, Cầu Giấy, Hà Nội',
        website: 'www.cenland.vn',
        avatarUrl: (profile as any)?.avatar_url || (profile as any)?.avatar || "https://i.pravatar.cc/300?img=11"
    });

    const initCanvas = useCallback(() => {
        if (!canvasRef.current) return;
        if (fabricCanvasRef.current) fabricCanvasRef.current.dispose();

        const canvas = new fabric.Canvas(canvasRef.current, {
            preserveObjectStacking: true,
            selection: false,
            backgroundColor: '#ffffff'
        });

        const updateScale = () => {
            if (!containerRef.current) return;
            const scale = Math.min(
                (containerRef.current.clientWidth - 40) / CARD_WIDTH,
                (containerRef.current.clientHeight - 40) / CARD_HEIGHT
            );
            canvas.setDimensions({ width: CARD_WIDTH * scale, height: CARD_HEIGHT * scale });
            canvas.setZoom(scale);
        };

        fabricCanvasRef.current = canvas;
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    useEffect(() => {
        const cleanup = initCanvas();
        renderTemplate();
        return cleanup;
    }, [initCanvas, formData, activeTemplate, activeSide]);

    const renderTemplate = async () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;
        canvas.clear();

        if (activeTemplate === 'orange_waves') await renderOrangeWaves(canvas);
        else if (activeTemplate === 'luxury_gold') await renderLuxuryGold(canvas);
        else if (activeTemplate === 'blue_geo') await renderBlueGeo(canvas);

        canvas.renderAll();
    };

    const loadImg = (url: string): Promise<fabric.Image> => new Promise(r => fabric.Image.fromURL(url, img => r(img), { crossOrigin: 'anonymous' }));

    const setupClippedAvatar = async (imgUrl: string, size: number, x: number, y: number, canvas: fabric.Canvas, circle: boolean = true) => {
        const img = await loadImg(imgUrl);
        const scale = size / Math.min(img.width || 1, img.height || 1);

        img.set({
            scaleX: scale, scaleY: scale,
            left: x, top: y,
            originX: 'center', originY: 'center',
            selectable: false
        });

        const clip = circle
            ? new fabric.Circle({ radius: size / 2, left: x, top: y, originX: 'center', originY: 'center', absolutePositioned: true })
            : new fabric.Rect({ width: size, height: size, rx: 40, ry: 40, left: x, top: y, originX: 'center', originY: 'center', absolutePositioned: true });

        img.clipPath = clip;
        canvas.add(img);
    };

    const renderOrangeWaves = async (canvas: fabric.Canvas) => {
        const orange = '#f39c12';
        if (activeSide === 'front') {
            canvas.add(new fabric.Path('M 0 0 Q 300 0 450 300 T 200 600 L 0 600 Z', { fill: orange, opacity: 0.1 }));
            canvas.add(new fabric.Path('M 0 600 Q 400 580 700 400 T 1050 500 L 1050 600 Z', { fill: orange }));
            await setupClippedAvatar(formData.avatarUrl, 300, CARD_WIDTH * 0.7, CARD_HEIGHT * 0.35, canvas, true);
            canvas.add(new fabric.Text(formData.company, { left: CARD_WIDTH * 0.7, top: CARD_HEIGHT * 0.65, originX: 'center', fontSize: 44, fontWeight: 'bold' }));
        } else {
            await setupClippedAvatar(formData.avatarUrl, 200, 150, 200, canvas, true);
            canvas.add(new fabric.Text(formData.name, { left: 300, top: 150, fontSize: 50, fontWeight: 'bold', fill: orange }));
            canvas.add(new fabric.Text(`📞 ${formData.phone}\n✉️ ${formData.email}\n📍 ${formData.address}`, { left: 300, top: 220, fontSize: 20, lineHeight: 1.5 }));
        }
    };

    const renderLuxuryGold = async (canvas: fabric.Canvas) => {
        const darkBlue = '#061a29';
        const gold = '#c5a059';
        if (activeSide === 'front') {
            canvas.setBackgroundColor(darkBlue, () => { });
            canvas.add(new fabric.Rect({ width: CARD_WIDTH, height: 15, fill: gold }));
            canvas.add(new fabric.Rect({ width: CARD_WIDTH, height: 15, top: CARD_HEIGHT - 15, fill: gold }));

            // AVATAR MUST BE CLIPPED INSIDE GOLD BOX
            const avatarSize = 280;
            const x = CARD_WIDTH * 0.25;
            const y = CARD_HEIGHT / 2;
            await setupClippedAvatar(formData.avatarUrl, avatarSize, x, y, canvas, false);
            canvas.add(new fabric.Rect({ width: avatarSize + 10, height: avatarSize + 10, left: x, top: y, originX: 'center', originY: 'center', fill: 'transparent', stroke: gold, strokeWidth: 4, rx: 45, ry: 45 }));

            canvas.add(new fabric.Text(formData.name, { left: CARD_WIDTH * 0.45, top: 220, fontSize: 60, fontWeight: '900', fill: gold }));
            canvas.add(new fabric.Text(formData.title, { left: CARD_WIDTH * 0.45, top: 290, fontSize: 22, fill: '#fff', charSpacing: 100 }));
            canvas.add(new fabric.Text(`M: ${formData.phone}`, { left: CARD_WIDTH * 0.45, top: 380, fontSize: 28, fontWeight: 'bold', fill: '#fff' }));
        } else {
            canvas.setBackgroundColor('#fdfcf0', () => { });
            canvas.add(new fabric.Path('M 0 0 L 400 0 Q 360 300 400 600 L 0 600 Z', { fill: darkBlue }));
            await setupClippedAvatar(formData.avatarUrl, 220, 160, 200, canvas, true);
            canvas.add(new fabric.Text(formData.name, { left: 450, top: 150, fontSize: 54, fontWeight: 'bold', fill: darkBlue }));
            canvas.add(new fabric.Text(formData.title, { left: 450, top: 215, fontSize: 20, fill: '#666' }));
            canvas.add(new fabric.Rect({ left: 450, top: 250, width: 400, height: 2, fill: darkBlue }));
            canvas.add(new fabric.Text(`Hotline: ${formData.phone}\n${formData.email}\n${formData.address}`, { left: 450, top: 280, fontSize: 18, lineHeight: 1.8 }));
        }
    };

    const renderBlueGeo = async (canvas: fabric.Canvas) => {
        const blue = '#00aae4';
        const grey = '#2c3e50';
        if (activeSide === 'front') {
            canvas.add(new fabric.Rect({ left: 0, top: CARD_HEIGHT - 100, width: CARD_WIDTH, height: 100, fill: grey }));
            canvas.add(new fabric.Path('M 800 500 L 950 300 L 1100 500 Z', { fill: blue }));
            await setupClippedAvatar(formData.avatarUrl, 320, CARD_WIDTH / 2, CARD_HEIGHT / 2 - 40, canvas, true);
            canvas.add(new fabric.Text(formData.name, { left: CARD_WIDTH / 2, top: CARD_HEIGHT - 60, originX: 'center', fontSize: 44, fontWeight: '900', fill: '#fff' }));
        } else {
            await setupClippedAvatar(formData.avatarUrl, 180, 150, 150, canvas, false);
            canvas.add(new fabric.Text(formData.name, { left: 280, top: 120, fontSize: 40, fontWeight: 'bold', fill: grey }));
            canvas.add(new fabric.Rect({ left: 0, top: CARD_HEIGHT - 40, width: CARD_WIDTH, height: 40, fill: grey }));
        }
    };

    const handleDownload = () => {
        if (!fabricCanvasRef.current) return;
        const dataURL = fabricCanvasRef.current.toDataURL({ format: 'png', multiplier: 3, quality: 1.0 });
        const link = document.createElement('a');
        link.download = `NameCard_${activeSide}_${Date.now()}.png`;
        link.href = dataURL;
        link.click();
        toast.success(`Đã tải HD 3x Mặt ${activeSide === 'front' ? 'Trước' : 'Sau'}!`);
    };

    return (
        <div className="h-full flex flex-col bg-[#050505]">
            <div className="flex items-center justify-between p-4 bg-[#080808] border-b border-white/10">
                <button onClick={onBack} className="text-slate-500 hover:text-white flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all"><ArrowRight className="rotate-180" size={14} /> Studio</button>
                <div className="flex bg-white/5 p-1 rounded-2xl gap-1">
                    <button onClick={() => setActiveSide('front')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeSide === 'front' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-slate-500 hover:text-slate-300'}`}>Mặt Trước</button>
                    <button onClick={() => setActiveSide('back')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeSide === 'back' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-slate-500 hover:text-slate-300'}`}>Mặt Sau</button>
                </div>
                <button onClick={handleDownload} className="bg-white text-black px-8 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-gold transition-all">Tải Ảnh HD 3x</button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-[380px] bg-[#050505] border-r border-white/10 p-8 overflow-y-auto no-scrollbar space-y-10">
                    <section>
                        <header className="flex items-center gap-2 mb-6"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Chọn Mẫu Thiết Kế</h3></header>
                        <div className="grid grid-cols-1 gap-4">
                            {[{ id: 'orange_waves', label: '1. Orange Wave', style: 'bg-yellow-500' }, { id: 'luxury_gold', label: '2. Professional Luxury', style: 'bg-slate-900 border border-gold/50' }, { id: 'blue_geo', label: '3. Modern Geometric', style: 'bg-white border-2 border-blue-400' }].map(t => (
                                <button key={t.id} onClick={() => setActiveTemplate(t.id as any)} className={`p-4 rounded-3xl border-2 transition-all flex items-center gap-4 text-left ${activeTemplate === t.id ? 'border-gold bg-gold/5 shadow-lg' : 'border-white/5 bg-white/[0.02]'}`}>
                                    <div className={`w-16 h-10 rounded-lg shrink-0 ${t.style}`}></div>
                                    <div className={`text-[10px] font-black uppercase ${activeTemplate === t.id ? 'text-gold' : 'text-white'}`}>{t.label}</div>
                                </button>
                            ))}
                        </div>
                    </section>
                    <section className="space-y-4">
                        <header className="flex items-center gap-2 mb-2"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identity Profile</h3></header>
                        <div className="relative group w-24 h-24 mx-auto mb-4">
                            <img src={formData.avatarUrl} className="w-full h-full rounded-[2.5rem] object-cover border-2 border-white/10" />
                            <label className="absolute inset-0 bg-black/80 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                                <RefreshCw size={20} className="text-gold" />
                                <input type="file" className="hidden" onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) setFormData({ ...formData, avatarUrl: URL.createObjectURL(f) });
                                }} />
                            </label>
                        </div>
                        <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-white uppercase font-black" />
                        <input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-gold font-bold" />
                    </section>
                </div>

                <div ref={containerRef} className="flex-1 bg-black flex flex-col items-center justify-center p-20 relative overflow-hidden">
                    <header className="absolute top-10 flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] flex items-center gap-3"><div className="h-px w-10 bg-gold/20"></div> Identity Suite <div className="h-px w-10 bg-gold/20"></div></span>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 font-black"><Zap size={10} className="text-gold" /> SVG Absolute Matrix Clipping</p>
                    </header>
                    <div className="shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] rounded-sm overflow-hidden border border-white/10"><canvas ref={canvasRef} /></div>
                    <div className="mt-12 flex items-center gap-3 px-6 py-2.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-xl">
                        <ShieldCheck className="text-gold" size={14} /><span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">300 DPI • {activeSide === 'front' ? 'MẶT TRƯỚC' : 'MẶT SAU'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardCreator;
