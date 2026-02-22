import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, ArrowRight, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';

const CARD_WIDTH = 1050;
const CARD_HEIGHT = 600;

const CardCreator = ({ onBack, onAttachToPhoto }: { onBack: () => void, onAttachToPhoto?: (tagDataUrl: string) => void }) => {
    const { profile } = useAuth();
    const [activeTemplate, setActiveTemplate] = useState<'orange_waves' | 'luxury_gold' | 'blue_geo'>('orange_waves');
    const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState({
        name: profile?.full_name || 'TRẦN HỮU CHIẾN',
        title: 'GIÁM ĐỐC KINH DOANH',
        phone1: profile?.phone || '0988 226 493',
        phone2: '0988 226 493',
        email: (profile as any)?.email || 'chien.tran@cenland.vn',
        company: profile?.agency || 'CENLAND GROUP',
        tagline: 'CỘNG ĐỒNG BĐS THỊNH VƯỢNG',
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

    const setupClippedAvatar = async (imgUrl: string, size: number, x: number, y: number, canvas: fabric.Canvas, type: 'circle' | 'rect') => {
        try {
            const img = await loadImg(imgUrl);
            const scale = size / Math.min(img.width || 1, img.height || 1);
            img.set({
                scaleX: scale, scaleY: scale,
                left: x, top: y,
                originX: 'center', originY: 'center',
                selectable: false
            });

            const clipPath = type === 'circle'
                ? new fabric.Circle({ radius: size / 2, left: x, top: y, originX: 'center', originY: 'center', absolutePositioned: true })
                : new fabric.Rect({ width: size, height: size, rx: 40, ry: 40, left: x, top: y, originX: 'center', originY: 'center', absolutePositioned: true });

            img.clipPath = clipPath;
            canvas.add(img);
        } catch (e) { console.error(e); }
    };

    const renderOrangeWaves = async (canvas: fabric.Canvas) => {
        const orange = '#fdc400';
        const accent = '#f39c12';

        if (activeSide === 'front') {
            canvas.setBackgroundColor('#ffffff', () => { });
            // Top wave
            canvas.add(new fabric.Path('M 0 0 C 100 0 250 50 350 300 C 450 550 200 600 0 600 Z', { fill: orange, opacity: 0.15, selectable: false }));
            // Bottom waves
            canvas.add(new fabric.Path('M 0 600 C 300 550 600 400 1050 400 L 1050 600 Z', { fill: accent, selectable: false }));
            canvas.add(new fabric.Path('M 0 600 C 400 600 700 450 1050 500 L 1050 600 Z', { fill: orange, selectable: false }));

            // Logo & Brand (Right side)
            const brand = new fabric.Text(formData.company, { left: 750, top: 250, originX: 'center', fontSize: 52, fontWeight: 'bold', fill: '#1a1a1a' });
            const tag = new fabric.Text('YOUR TAGLINE', { left: 750, top: 310, originX: 'center', fontSize: 24, fill: '#666', charSpacing: 100 });
            canvas.add(brand, tag);
            canvas.add(new fabric.Text(formData.website, { left: 80, top: 540, fontSize: 22, fill: '#333' }));
        } else {
            // BACK
            canvas.setBackgroundColor('#ffffff', () => { });
            canvas.add(new fabric.Path('M 600 0 C 750 0 900 200 1050 600 L 1050 0 Z', { fill: orange, opacity: 0.1, selectable: false }));
            canvas.add(new fabric.Path('M 0 600 C 400 580 750 350 1050 420 L 1050 600 Z', { fill: orange, selectable: false }));
            canvas.add(new fabric.Path('M 0 600 C 350 600 650 450 1050 550 L 1050 600 Z', { fill: accent, selectable: false }));

            await setupClippedAvatar(formData.avatarUrl, 130, 110, 110, canvas, 'circle');
            const name = new fabric.Text(formData.name, { left: 80, top: 210, fontSize: 44, fontWeight: 'bold', fill: accent });
            const title = new fabric.Text(formData.title.toUpperCase(), { left: 80, top: 270, fontSize: 18, fill: '#888', charSpacing: 50 });
            canvas.add(name, title);
            canvas.add(new fabric.Rect({ left: 80, top: 300, width: 35, height: 4, fill: orange }));

            const info = new fabric.Text(`${formData.phone1}\n${formData.phone2}\n\n${formData.email}\n${formData.address}`, { left: 80, top: 320, fontSize: 18, lineHeight: 1.4, fill: '#444' });
            canvas.add(info);

            // QR Placeholder in the wave area
            canvas.add(new fabric.Rect({ left: 780, top: 240, width: 160, height: 160, fill: '#fff', rx: 15, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.1)', blur: 10 }) }));
        }
    };

    const renderLuxuryGold = async (canvas: fabric.Canvas) => {
        const navy = '#061a29';
        const gold = '#c5a059';
        const lightGold = '#e8d2a6';

        if (activeSide === 'front') {
            canvas.setBackgroundColor(navy, () => { });
            canvas.add(new fabric.Rect({ width: CARD_WIDTH, height: 12, fill: gold }));
            canvas.add(new fabric.Rect({ width: CARD_WIDTH, height: 12, top: CARD_HEIGHT - 12, fill: gold }));

            // Central Logo Mark (Triangle style from Saenz)
            const logomark = new fabric.Path('M 50 0 L 0 60 L 40 60 L 50 35 L 60 60 L 100 60 Z', { fill: gold, scaleX: 2.2, scaleY: 2.2, left: CARD_WIDTH / 2 - 110, top: 150 });
            canvas.add(logomark);

            canvas.add(new fabric.Text(formData.company, { left: CARD_WIDTH / 2, top: 340, originX: 'center', fontSize: 64, fontWeight: 'bold', fill: gold, charSpacing: 100 }));
            canvas.add(new fabric.Text('YOUR SLOGAN HERE', { left: CARD_WIDTH / 2, top: 410, originX: 'center', fontSize: 22, fill: '#fff', opacity: 0.5, charSpacing: 200 }));
            canvas.add(new fabric.Text(formData.website, { left: CARD_WIDTH / 2, top: CARD_HEIGHT - 60, originX: 'center', fontSize: 18, fill: gold, opacity: 0.8 }));
        } else {
            // BACK SAENZ
            canvas.setBackgroundColor(lightGold, () => { });
            // Curve on the left
            const curve = new fabric.Path('M 0 0 L 450 0 C 350 150 350 450 450 600 L 0 600 Z', { fill: navy });
            canvas.add(curve);

            await setupClippedAvatar(formData.avatarUrl, 180, 180, 180, canvas, 'circle');

            const brand = new fabric.Text(formData.company, { left: 60, top: 320, fontSize: 36, fontWeight: 'bold', fill: gold });
            canvas.add(brand);

            const name = new fabric.Text(formData.name, { left: 580, top: 130, fontSize: 56, fontWeight: '900', fill: navy });
            const title = new fabric.Text(formData.title.toUpperCase(), { left: 610, top: 195, fontSize: 20, fill: '#555', charSpacing: 80 });
            canvas.add(name, title);
            canvas.add(new fabric.Rect({ left: 560, top: 230, width: 380, height: 2, fill: navy }));

            const contacts = [
                { text: `+098 8226 493\n+098 8226 493` },
                { text: `${formData.email}\n${formData.website}` },
                { text: `Tháp Thành Công\nCầu Giấy, Hà Nội` }
            ];

            contacts.forEach((ctx, i) => {
                const iconBg = new fabric.Circle({ radius: 25, fill: navy, left: 900, top: 280 + i * 85 });
                canvas.add(iconBg);
                canvas.add(new fabric.Text(ctx.text, { left: 580, top: 285 + i * 85, fontSize: 18, fill: '#222', textAlign: 'right' }));
            });
        }
    };

    const renderBlueGeo = async (canvas: fabric.Canvas) => {
        const blue = '#00aae4';
        const dark = '#2c3e50';
        if (activeSide === 'front') {
            canvas.setBackgroundColor('#ffffff', () => { });
            canvas.add(new fabric.Rect({ left: 0, top: 480, width: CARD_WIDTH, height: 120, fill: dark }));
            // Mountains
            canvas.add(new fabric.Path('M 700 480 L 850 320 L 1000 480 Z', { fill: blue, opacity: 0.8 }));
            canvas.add(new fabric.Path('M 800 480 L 950 360 L 1100 480 Z', { fill: blue, opacity: 0.4 }));

            await setupClippedAvatar(formData.avatarUrl, 300, CARD_WIDTH / 2, 230, canvas, 'circle');
            canvas.add(new fabric.Text('BRAND NAME', { left: CARD_WIDTH / 2, top: 400, originX: 'center', fontSize: 32, fontWeight: 'bold' }));
        } else {
            // BACK GEO
            canvas.setBackgroundColor('#ffffff', () => { });
            await setupClippedAvatar(formData.avatarUrl, 180, 150, 150, canvas, 'rect');
            const name = new fabric.Text(formData.name, { left: 300, top: 120, fontSize: 44, fontWeight: 'bold', fill: dark });
            canvas.add(name);
            canvas.add(new fabric.Rect({ left: 180, top: 500, width: 870, height: 50, fill: dark }));
        }
    };

    const handleDownload = () => {
        if (!fabricCanvasRef.current) return;
        const dataURL = fabricCanvasRef.current.toDataURL({ format: 'png', multiplier: 3, quality: 1.0 });
        const link = document.createElement('a');
        link.download = `Card_Elite_${activeTemplate}_${activeSide}.png`;
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
                <button onClick={handleDownload} className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-gold transition-all">Tải Ảnh 3x HD</button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-[380px] bg-[#050505] border-r border-white/10 p-8 overflow-y-auto no-scrollbar space-y-8">
                    <section>
                        <header className="flex items-center gap-2 mb-6"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Chọn Mẫu (3 Options)</h3></header>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'orange_waves', label: '1. Orange Wave (Richard)', style: 'bg-yellow-500' },
                                { id: 'luxury_gold', label: '2. Luxury Gold (Saenz)', style: 'bg-slate-900 border border-gold/50' },
                                { id: 'blue_geo', label: '3. Modern Geometric', style: 'bg-white border-2 border-blue-400' }
                            ].map(t => (
                                <button key={t.id} onClick={() => setActiveTemplate(t.id as any)} className={`p-4 rounded-3xl border-2 transition-all flex items-center gap-4 text-left ${activeTemplate === t.id ? 'border-gold bg-gold/5 shadow-lg' : 'border-white/5 bg-white/[0.02]'}`}>
                                    <div className={`w-16 h-10 rounded-lg shrink-0 ${t.style}`}></div>
                                    <div className={`text-[10px] font-black uppercase ${activeTemplate === t.id ? 'text-gold' : 'text-white'}`}>{t.label}</div>
                                </button>
                            ))}
                        </div>
                    </section>
                    <section className="space-y-4">
                        <header className="flex items-center gap-2 mb-2"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Identity Hub</h3></header>
                        <div className="relative group w-24 h-24 mx-auto mb-4">
                            <img src={formData.avatarUrl} className="w-full h-full rounded-[2.5rem] object-cover border-2 border-white/10" />
                            <label className="absolute inset-0 bg-black/80 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                                <RefreshCw size={20} className="text-gold" /><input type="file" className="hidden" onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) setFormData({ ...formData, avatarUrl: URL.createObjectURL(f) });
                                }} />
                            </label>
                        </div>
                        <div className="space-y-3">
                            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-white uppercase font-black" />
                            <input value={formData.phone1} onChange={e => setFormData({ ...formData, phone1: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-gold font-bold" />
                        </div>
                    </section>
                </div>

                <div ref={containerRef} className="flex-1 bg-black flex flex-col items-center justify-center p-20 relative overflow-hidden">
                    <header className="absolute top-10 flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] flex items-center gap-3"><div className="h-px w-10 bg-gold/20"></div> Identity Pixel-Perfect Logic <div className="h-px w-10 bg-gold/20"></div></span>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 font-black"><Zap size={10} className="text-gold" /> SVG Precise Vector Rendering</p>
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
