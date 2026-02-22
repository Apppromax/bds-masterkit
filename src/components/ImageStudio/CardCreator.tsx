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

    const drawHexLogo = async (color: string, x: number, y: number, canvas: fabric.Canvas, scale: number = 1) => {
        const path = new fabric.Path('M 50 0 L 93.3 25 L 93.3 75 L 50 100 L 6.7 75 L 6.7 25 Z', {
            fill: 'transparent', stroke: color, strokeWidth: 8, originX: 'center', originY: 'center'
        });
        const inner = new fabric.Path('M 50 25 L 71.6 37.5 L 71.6 62.5 L 50 75 L 28.4 62.5 L 28.4 37.5 Z', {
            fill: 'transparent', stroke: color, strokeWidth: 4, originX: 'center', originY: 'center'
        });
        const group = new fabric.Group([path, inner], { left: x, top: y, originX: 'center', originY: 'center', scaleX: scale, scaleY: scale });
        canvas.add(group);
    };

    const renderOrangeWaves = async (canvas: fabric.Canvas) => {
        const primary = '#f1c40f';
        const accent = '#e67e22';

        if (activeSide === 'front') {
            canvas.setBackgroundColor('#ffffff', () => { });
            // Top wave
            canvas.add(new fabric.Path('M 0 0 C 150 0 350 80 420 350 C 450 600 200 600 0 600 Z', { fill: primary, opacity: 0.2, selectable: false }));
            // Bottom waves
            canvas.add(new fabric.Path('M 0 600 C 400 580 650 420 1050 480 L 1050 600 Z', { fill: accent, selectable: false }));
            canvas.add(new fabric.Path('M 0 600 C 500 600 800 380 1050 400 L 1050 600 Z', { fill: primary, selectable: false }));

            await drawHexLogo(accent, CARD_WIDTH * 0.72, 180, canvas, 1.2);
            canvas.add(new fabric.Text(formData.company, { left: CARD_WIDTH * 0.72, top: 300, originX: 'center', fontSize: 52, fontWeight: '900', fill: '#1a1a1a' }));
            canvas.add(new fabric.Text('YOUR TAGLINE', { left: CARD_WIDTH * 0.72, top: 360, originX: 'center', fontSize: 24, fill: '#666', charSpacing: 150 }));
            canvas.add(new fabric.Text(formData.website, { left: 80, top: 540, fontSize: 22, fill: '#333' }));
        } else {
            // BACK
            canvas.setBackgroundColor('#ffffff', () => { });
            canvas.add(new fabric.Path('M 550 0 C 750 20 950 350 1050 600 L 1050 0 Z', { fill: primary, opacity: 0.1, selectable: false }));
            canvas.add(new fabric.Path('M 0 600 C 500 580 750 350 1050 400 L 1050 600 Z', { fill: accent, selectable: false }));
            canvas.add(new fabric.Path('M 0 600 C 350 550 600 450 1050 550 L 1050 600 Z', { fill: primary, selectable: false }));

            await setupClippedAvatar(formData.avatarUrl, 120, 110, 110, canvas, 'circle'); // Small avatar for back
            const name = new fabric.Text(formData.name, { left: 80, top: 200, fontSize: 44, fontWeight: 'bold', fill: accent });
            const title = new fabric.Text(formData.title.toUpperCase(), { left: 80, top: 260, fontSize: 18, fill: '#666', charSpacing: 100 });
            canvas.add(name, title);
            canvas.add(new fabric.Rect({ left: 80, top: 295, width: 40, height: 4, fill: accent }));

            const info = new fabric.Text(`${formData.phone1}\n${formData.phone2}\n\n${formData.email}\n${formData.address}`, { left: 80, top: 320, fontSize: 18, lineHeight: 1.5, fill: '#333' });
            canvas.add(info);

            // QR Box
            canvas.add(new fabric.Rect({ left: CARD_WIDTH - 240, top: 250, width: 160, height: 160, fill: '#fff', stroke: '#eee', strokeWidth: 2, rx: 15 }));
            const logoColor = accent;
            await drawHexLogo(logoColor, CARD_WIDTH - 280, CARD_HEIGHT - 100, canvas, 0.6);
            canvas.add(new fabric.Text(formData.company, { left: CARD_WIDTH - 245, top: CARD_HEIGHT - 105, fontSize: 32, fontWeight: 'bold', fill: logoColor }));
        }
    };

    const renderLuxuryGold = async (canvas: fabric.Canvas) => {
        const navy = '#061a29';
        const gold = '#c5a059';
        const lightGold = '#e8d2a6';

        if (activeSide === 'front') {
            canvas.setBackgroundColor(navy, () => { });
            canvas.add(new fabric.Rect({ width: CARD_WIDTH, height: 15, fill: gold }));
            canvas.add(new fabric.Rect({ width: CARD_WIDTH, height: 15, top: CARD_HEIGHT - 15, fill: gold }));

            // Triangle logo mark
            const logomark = new fabric.Path('M 50 0 L 0 60 L 40 60 L 50 40 L 60 60 L 100 60 Z', { fill: gold, scaleX: 2, scaleY: 2, left: CARD_WIDTH / 2 - 100, top: 180 });
            canvas.add(logomark);

            canvas.add(new fabric.Text(formData.company, { left: CARD_WIDTH / 2, top: 350, originX: 'center', fontSize: 60, fontWeight: 'bold', fill: gold, charSpacing: 100 }));
            canvas.add(new fabric.Text('YOUR SLOGAN HERE', { left: CARD_WIDTH / 2, top: 420, originX: 'center', fontSize: 20, fill: '#fff', opacity: 0.6, charSpacing: 200 }));
            canvas.add(new fabric.Text(formData.website, { left: CARD_WIDTH / 2, top: 540, originX: 'center', fontSize: 18, fill: gold, opacity: 0.8 }));
        } else {
            canvas.setBackgroundColor(lightGold, () => { });
            const wave = new fabric.Path('M 0 0 L 480 0 C 350 200 350 400 480 600 L 0 600 Z', { fill: navy });
            canvas.add(wave);

            await setupClippedAvatar(formData.avatarUrl, 160, 180, 180, canvas, 'circle'); // Avatar on left side

            const logomark = new fabric.Path('M 50 0 L 0 60 L 40 60 L 50 40 L 60 60 L 100 60 Z', { fill: gold, scaleX: 1, scaleY: 1, left: 130, top: 300 });
            canvas.add(logomark);

            const brand = new fabric.Text(formData.company, { left: 80, top: 380, fontSize: 32, fontWeight: 'bold', fill: gold });
            const slogan = new fabric.Text('YOUR SLOGAN', { left: 135, top: 415, fontSize: 10, fill: '#fff', opacity: 0.5 });
            canvas.add(brand, slogan);

            // Right side info
            const name = new fabric.Text(formData.name, { left: 600, top: 120, fontSize: 52, fontWeight: '900', fill: navy });
            const title = new fabric.Text(formData.title.toUpperCase(), { left: 630, top: 185, fontSize: 18, fill: '#555', charSpacing: 100 });
            canvas.add(name, title);
            canvas.add(new fabric.Rect({ left: 580, top: 220, width: 380, height: 2, fill: navy }));

            const contacts = [
                { icon: '📞', text: `+098 8226 493\n+098 8226 493` },
                { icon: '✉️', text: `${formData.email}\n${formData.website}` },
                { icon: '📍', text: `Tháp Thành Công\nCầu Giấy, Hà Nội` }
            ];

            contacts.forEach((ctx, i) => {
                const iconBg = new fabric.Rect({ width: 54, height: 54, rx: 27, ry: 27, fill: navy });
                const iconTxt = new fabric.Text(ctx.icon, { fontSize: 20, left: 14, top: 15 });
                const group = new fabric.Group([iconBg, iconTxt], { left: 900, top: 260 + i * 85 });
                const label = new fabric.Text(ctx.text, { left: 600, top: 265 + i * 85, fontSize: 18, fill: '#222', textAlign: 'right' });
                canvas.add(group, label);
            });
        }
    };

    const renderBlueGeo = async (canvas: fabric.Canvas) => {
        const blue = '#00aae4';
        const dark = '#2c3e50';
        if (activeSide === 'front') {
            canvas.setBackgroundColor('#ffffff', () => { });
            canvas.add(new fabric.Rect({ left: 0, top: 480, width: CARD_WIDTH, height: 120, fill: dark }));
            // Mountain shapes
            canvas.add(new fabric.Path('M 700 480 L 850 300 L 1000 480 Z', { fill: blue, opacity: 0.8 }));
            canvas.add(new fabric.Path('M 800 480 L 950 350 L 1100 480 Z', { fill: blue, opacity: 0.5 }));

            await setupClippedAvatar(formData.avatarUrl, 300, CARD_WIDTH / 2, 220, canvas, 'circle');
            canvas.add(new fabric.Text('IDENTITY BRAND', { left: CARD_WIDTH / 2, top: 380, originX: 'center', fontSize: 32, fontWeight: 'bold' }));
        } else {
            // BACK
            canvas.setBackgroundColor('#ffffff', () => { });
            await setupClippedAvatar(formData.avatarUrl, 180, 150, 150, canvas, 'rect');
            const name = new fabric.Text(formData.name, { left: 300, top: 120, fontSize: 44, fontWeight: 'bold', fill: dark });
            canvas.add(name);
            canvas.add(new fabric.Rect({ left: 180, top: 480, width: 870, height: 60, fill: dark }));
            canvas.add(new fabric.Path('M 750 480 L 850 380 L 950 480 Z', { fill: blue, left: 750, top: 380 }));
        }
    };

    const handleDownload = () => {
        if (!fabricCanvasRef.current) return;
        const dataURL = fabricCanvasRef.current.toDataURL({ format: 'png', multiplier: 3, quality: 1.0 });
        const link = document.createElement('a');
        link.download = `Card_${activeTemplate}_${activeSide}.png`;
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
                <div className="w-[380px] bg-[#050505] border-r border-white/10 p-8 overflow-y-auto no-scrollbar space-y-8">
                    <section>
                        <header className="flex items-center gap-2 mb-6"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Mẫu thiết kế (3 Options)</h3></header>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'orange_waves', label: '1. Orange Wave (Mẫu 1)', style: 'bg-yellow-500' },
                                { id: 'luxury_gold', label: '2. Professional Luxury (Mẫu 2)', style: 'bg-slate-900 border border-gold/50' },
                                { id: 'blue_geo', label: '3. Modern Geometric (Mẫu 3)', style: 'bg-white border-2 border-blue-400' }
                            ].map(t => (
                                <button key={t.id} onClick={() => setActiveTemplate(t.id as any)} className={`p-4 rounded-3xl border-2 transition-all flex items-center gap-4 text-left ${activeTemplate === t.id ? 'border-gold bg-gold/5 shadow-lg' : 'border-white/5 bg-white/[0.02]'}`}>
                                    <div className={`w-16 h-10 rounded-lg shrink-0 ${t.style}`}></div>
                                    <div className={`text-[10px] font-black uppercase ${activeTemplate === t.id ? 'text-gold' : 'text-white'}`}>{t.label}</div>
                                </button>
                            ))}
                        </div>
                    </section>
                    <section className="space-y-4">
                        <header className="flex items-center gap-2 mb-2"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Thông tin cá nhân</h3></header>
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
                            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-white uppercase font-black" placeholder="HỌ VÀ TÊN" />
                            <input value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-slate-300 font-bold" placeholder="TÊN CÔNG TY" />
                            <input value={formData.phone1} onChange={e => setFormData({ ...formData, phone1: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-gold font-bold" placeholder="SỐ ĐIỆN THOẠI" />
                        </div>
                    </section>
                </div>

                <div ref={containerRef} className="flex-1 bg-black flex flex-col items-center justify-center p-20 relative overflow-hidden">
                    <header className="absolute top-10 flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] flex items-center gap-3"><div className="h-px w-10 bg-gold/20"></div> Identity Pixel-Perfect Engine <div className="h-px w-10 bg-gold/20"></div></span>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 font-black"><Zap size={10} className="text-gold" /> SVG High-Precision Vector Rendering</p>
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
