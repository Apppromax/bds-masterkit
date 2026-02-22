import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, ArrowRight, UserSquare2, RefreshCw, Smartphone, Mail, MapPin, QrCode, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';

const CARD_WIDTH = 1050;
const CARD_HEIGHT = 600;

const CardCreator = ({ onBack }: { onBack: () => void }) => {
    const { profile } = useAuth();
    const [activeTemplate, setActiveTemplate] = useState<'orange_waves' | 'dark_gold' | 'blue_geometric'>('orange_waves');
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

        if (activeTemplate === 'orange_waves') {
            await renderOrangeWaves(canvas);
        } else if (activeTemplate === 'dark_gold') {
            await renderDarkGold(canvas);
        } else if (activeTemplate === 'blue_geometric') {
            await renderBlueGeometric(canvas);
        }
        canvas.renderAll();
    };

    const loadImg = (url: string): Promise<fabric.Image> => new Promise(r => fabric.Image.fromURL(url, img => r(img), { crossOrigin: 'anonymous' }));

    const setupClippedAvatar = async (imgUrl: string, targetSize: number, posX: number, posY: number, canvas: fabric.Canvas, isCircle: boolean = true) => {
        try {
            const img = await loadImg(imgUrl);
            const imgW = img.width || 1;
            const imgH = img.height || 1;

            // Smart Cover Logic
            const scale = targetSize / Math.min(imgW, imgH);

            img.set({
                scaleX: scale,
                scaleY: scale,
                left: posX,
                top: posY,
                originX: 'center',
                originY: 'center',
                selectable: false
            });

            // FIXED: Using absolute positioned clip path to ensure it NEVER bleeds out
            const clipPath = isCircle
                ? new fabric.Circle({
                    radius: targetSize / 2,
                    left: posX,
                    top: posY,
                    originX: 'center',
                    originY: 'center',
                    absolutePositioned: true
                })
                : new fabric.Rect({
                    width: targetSize,
                    height: targetSize,
                    rx: 40, ry: 40,
                    left: posX,
                    top: posY,
                    originX: 'center',
                    originY: 'center',
                    absolutePositioned: true
                });

            img.clipPath = clipPath;
            canvas.add(img);
        } catch (e) {
            console.error("Avatar failed to load:", e);
        }
    };

    const renderOrangeWaves = async (canvas: fabric.Canvas) => {
        const orange = '#f39c12';
        const darkOrange = '#d35400';

        if (activeSide === 'front') {
            canvas.setBackgroundColor('#ffffff', () => { });
            // Top waves
            canvas.add(new fabric.Path('M 0 0 Q 300 0 450 300 T 200 600 L 0 600 Z', { fill: orange, opacity: 0.1, selectable: false }));
            // Bottom waves
            canvas.add(new fabric.Path('M 0 600 Q 300 550 500 450 T 1050 550 L 1050 600 Z', { fill: darkOrange, selectable: false }));
            canvas.add(new fabric.Path('M 0 600 Q 400 600 700 400 T 1050 450 L 1050 600 Z', { fill: orange, selectable: false }));

            const brandBox = new fabric.Group([
                new fabric.Text(formData.company, { fontSize: 48, fontWeight: 'bold', fill: '#333', top: 0, originX: 'center' }),
                new fabric.Text('SƠN HÀ LANDSCAPE', { fontSize: 20, fill: '#666', top: 60, originX: 'center', charSpacing: 100 })
            ], { left: CARD_WIDTH * 0.7, top: CARD_HEIGHT * 0.45, originX: 'center' });
            canvas.add(brandBox);
        } else {
            canvas.setBackgroundColor('#ffffff', () => { });
            await setupClippedAvatar(formData.avatarUrl, 260, 180, 240, canvas, true);
            const name = new fabric.Text(formData.name, { left: 340, top: 180, fontSize: 58, fontWeight: 'bold', fill: darkOrange });
            const title = new fabric.Text(formData.title, { left: 340, top: 250, fontSize: 22, fill: '#666' });
            canvas.add(name, title);
            canvas.add(new fabric.Rect({ left: 340, top: 290, width: 40, height: 4, fill: orange }));
            canvas.add(new fabric.Text(`${formData.phone1}\n${formData.email}\n${formData.address}`, { left: 340, top: 320, fontSize: 18, fill: '#444', lineHeight: 1.5 }));
        }
    };

    const renderDarkGold = async (canvas: fabric.Canvas) => {
        const darkBlue = '#061a29';
        const gold = '#c5a059';

        if (activeSide === 'front') {
            canvas.setBackgroundColor(darkBlue, () => { });
            canvas.add(new fabric.Rect({ width: CARD_WIDTH, height: 12, fill: gold }));
            canvas.add(new fabric.Rect({ width: CARD_WIDTH, height: 12, top: CARD_HEIGHT - 12, fill: gold }));

            const name = new fabric.Text(formData.name.toUpperCase(), { left: CARD_WIDTH / 2, top: 220, originX: 'center', fontSize: 68, fontWeight: '900', fill: gold });
            const title = new fabric.Text(formData.title, { left: CARD_WIDTH / 2, top: 300, originX: 'center', fontSize: 24, fill: '#fff', charSpacing: 200 });
            canvas.add(name, title);
            canvas.add(new fabric.Text(formData.website, { left: CARD_WIDTH / 2, top: CARD_HEIGHT - 60, originX: 'center', fontSize: 20, fill: '#fff', opacity: 0.7 }));
        } else {
            canvas.setBackgroundColor('#f8f5e9', () => { });
            const darkPart = new fabric.Path('M 0 0 L 420 0 Q 360 300 420 600 L 0 600 Z', { fill: darkBlue });
            canvas.add(darkPart);

            // Avatar MUST be inside this box
            const avatarSize = 250;
            const avatarX = 210;
            const avatarY = 240;

            await setupClippedAvatar(formData.avatarUrl, avatarSize, avatarX, avatarY, canvas, false);

            // Gold Border for Avatar
            canvas.add(new fabric.Rect({
                width: avatarSize + 10, height: avatarSize + 10, rx: 45, ry: 45,
                left: avatarX, top: avatarY, originX: 'center', originY: 'center',
                fill: 'transparent', stroke: gold, strokeWidth: 4
            }));

            const name = new fabric.Text(formData.name, { left: 480, top: 180, fontSize: 60, fontWeight: 'bold', fill: darkBlue });
            const title = new fabric.Text(formData.title, { left: 480, top: 250, fontSize: 22, fill: '#555' });
            canvas.add(name, title);
            canvas.add(new fabric.Rect({ left: 480, top: 290, width: 400, height: 2, fill: darkBlue }));

            const contact = new fabric.Text(`📞 ${formData.phone1}\n✉️ ${formData.email}\n📍 ${formData.address}`, { left: 480, top: 330, fontSize: 18, fill: '#333', lineHeight: 1.8 });
            canvas.add(contact);
        }
    };

    const renderBlueGeometric = async (canvas: fabric.Canvas) => {
        const lightBlue = '#00aae4';
        const grey = '#2c3e50';

        if (activeSide === 'front') {
            canvas.setBackgroundColor('#ffffff', () => { });
            canvas.add(new fabric.Rect({ left: 0, top: CARD_HEIGHT - 120, width: CARD_WIDTH, height: 120, fill: grey }));
            canvas.add(new fabric.Path('M 800 480 L 1050 200 L 1050 480 Z', { fill: lightBlue }));

            const name = new fabric.Text(formData.name.toUpperCase(), { left: CARD_WIDTH / 2, top: 250, originX: 'center', fontSize: 64, fontWeight: '900', fill: grey });
            canvas.add(name);
        } else {
            canvas.setBackgroundColor('#ffffff', () => { });
            await setupClippedAvatar(formData.avatarUrl, 200, 150, 150, canvas, true);
            const name = new fabric.Text(formData.name, { left: 300, top: 130, fontSize: 44, fontWeight: 'bold', fill: grey });
            canvas.add(name);
            canvas.add(new fabric.Rect({ left: 0, top: CARD_HEIGHT - 50, width: CARD_WIDTH, height: 50, fill: grey }));
        }
    };

    const handleDownload = (side: 'front' | 'back') => {
        if (!fabricCanvasRef.current) return;
        const dataURL = fabricCanvasRef.current.toDataURL({ format: 'png', multiplier: 3, quality: 1.0 });
        const link = document.createElement('a');
        link.download = `NameCard_${activeTemplate}_${side}.png`;
        link.href = dataURL;
        link.click();
        toast.success(`Đã tải HD Mặt ${side === 'front' ? 'Trước' : 'Sau'}!`);
    };

    return (
        <div className="h-full flex flex-col bg-[#050505]">
            <div className="flex items-center justify-between p-4 bg-[#080808] border-b border-white/10">
                <button onClick={onBack} className="text-slate-500 hover:text-white flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"><ArrowRight className="rotate-180" size={14} /> Back</button>
                <div className="flex bg-white/5 p-1 rounded-2xl gap-1">
                    <button onClick={() => setActiveSide('front')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeSide === 'front' ? 'bg-gold text-black' : 'text-slate-500'}`}>Mặt Trước</button>
                    <button onClick={() => setActiveSide('back')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeSide === 'back' ? 'bg-gold text-black' : 'text-slate-500'}`}>Mặt Sau</button>
                </div>
                <button onClick={() => handleDownload(activeSide)} className="bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gold transition-all">Tải Ảnh 3x HD</button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-[380px] bg-[#050505] border-r border-white/10 p-8 overflow-y-auto no-scrollbar space-y-10">
                    <section>
                        <header className="flex items-center gap-2 mb-6"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Chọn Mẫu (3 Options)</h3></header>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'orange_waves', label: '1. Orange Wave', style: 'bg-yellow-500' },
                                { id: 'dark_gold', label: '2. Luxury Gold', style: 'bg-slate-900 border border-gold/50' },
                                { id: 'blue_geometric', label: '3. Professional Blue', style: 'bg-white border-2 border-blue-400' }
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
                            <img src={formData.avatarUrl} className="w-full h-full rounded-[2.5rem] object-cover border-2 border-white/10 shadow-2xl" />
                            <label className="absolute inset-0 bg-black/80 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-all">
                                <RefreshCw size={20} className="text-gold" />
                                <input type="file" className="hidden" onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) setFormData({ ...formData, avatarUrl: URL.createObjectURL(f) });
                                }} />
                            </label>
                        </div>
                        <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-white uppercase font-black" />
                        <input value={formData.phone1} onChange={e => setFormData({ ...formData, phone1: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-gold font-bold" />
                    </section>
                </div>

                <div ref={containerRef} className="flex-1 bg-black flex flex-col items-center justify-center p-20 relative overflow-hidden">
                    <header className="absolute top-10 flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] flex items-center gap-3"><div className="h-px w-10 bg-gold/20"></div> Smart Identity Suite <div className="h-px w-10 bg-gold/20"></div></span>
                        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2 font-black"><Zap size={10} className="text-gold" /> SVG Precise Matrix Clipping</p>
                    </header>
                    <div className="shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] rounded-sm overflow-hidden border border-white/10"><canvas ref={canvasRef} /></div>
                    <div className="mt-12 flex items-center gap-3 px-6 py-2.5 bg-white/5 rounded-full border border-white/10">
                        <ShieldCheck className="text-gold" size={14} /><span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">300 DPI - {activeSide === 'front' ? 'MẶT TRƯỚC' : 'MẶT SAU'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardCreator;
