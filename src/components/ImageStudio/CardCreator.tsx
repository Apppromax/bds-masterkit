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
        name: profile?.full_name || 'RICHARD MILES',
        title: profile?.role === 'admin' ? 'GIÁM ĐỐC KINH DOANH' : 'LANDSCAPE DESIGN',
        phone1: profile?.phone || '333 123 456 789',
        phone2: '444 123 456 789',
        email: (profile as any)?.email || 'yourmail@mail.com',
        company: profile?.agency || 'COMPANY LOGO',
        tagline: 'YOUR TAGLINE GOES HERE',
        address: '31 St. Rhode Island, City, Country',
        website: 'www.yourwebsite.com',
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
                (containerRef.current.clientWidth - 80) / CARD_WIDTH,
                (containerRef.current.clientHeight - 80) / CARD_HEIGHT
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

    const loadLogo = async (color: string = '#f39c12'): Promise<fabric.Group> => {
        const hex = new fabric.Path('M 50 0 L 93.3 25 L 93.3 75 L 50 100 L 6.7 75 L 6.7 25 Z', {
            fill: 'transparent',
            stroke: color,
            strokeWidth: 8,
            originX: 'center',
            originY: 'center'
        });
        const innerHex = new fabric.Path('M 50 20 L 76 35 L 76 65 L 50 80 L 24 65 L 24 35 Z', {
            fill: 'transparent',
            stroke: color,
            strokeWidth: 4,
            originX: 'center',
            originY: 'center'
        });
        return new fabric.Group([hex, innerHex], { scaleX: 0.8, scaleY: 0.8 });
    };

    const renderOrangeWaves = async (canvas: fabric.Canvas) => {
        const orange = '#f1c40f';
        const darkOrange = '#e67e22';

        if (activeSide === 'front') {
            canvas.setBackgroundColor('#ffffff', () => { });

            // Top wave
            const topWave = new fabric.Path('M 0 0 Q 300 0 400 300 Q 450 600 200 600 L 0 600 Z', {
                fill: orange,
                opacity: 0.1,
                left: 0,
                top: 0,
                selectable: false
            });
            const topWave2 = new fabric.Path('M 0 0 Q 250 0 350 250 L 0 500 Z', {
                fill: orange,
                opacity: 0.2,
                left: 0,
                top: 0,
                selectable: false
            });

            // Bottom complex waves
            const botWave = new fabric.Path('M 0 600 Q 300 600 600 400 Q 900 200 1050 450 L 1050 600 Z', {
                fill: darkOrange,
                selectable: false
            });
            const botWaveAccent = new fabric.Path('M 0 600 Q 400 550 700 380 Q 1000 250 1050 500 L 1050 600 Z', {
                fill: orange,
                selectable: false
            });

            canvas.add(topWave, topWave2, botWave, botWaveAccent);

            // Logo & Brand
            const logo = await loadLogo('#333');
            logo.set({ left: CARD_WIDTH * 0.7, top: CARD_HEIGHT * 0.35, originX: 'center' });

            const brand = new fabric.Text(formData.company, {
                left: CARD_WIDTH * 0.7, top: CARD_HEIGHT * 0.5, originX: 'center',
                fontSize: 54, fontWeight: 'bold', fill: '#222'
            });
            const tagline = new fabric.Text(formData.tagline.replace(' GOES HERE', ''), {
                left: CARD_WIDTH * 0.7, top: CARD_HEIGHT * 0.58, originX: 'center',
                fontSize: 24, fill: '#666', charSpacing: 100
            });

            canvas.add(logo, brand, tagline);

            const website = new fabric.Text(formData.website, {
                left: 80, top: CARD_HEIGHT - 60,
                fontSize: 24, fill: '#444'
            });
            canvas.add(website);

        } else {
            // BACK SIDE
            canvas.setBackgroundColor('#ffffff', () => { });

            // Waves
            const topWave = new fabric.Path('M 500 0 Q 700 0 850 300 Q 950 600 1050 600 L 1050 0 Z', {
                fill: orange,
                opacity: 0.1,
                selectable: false
            });
            const botWave = new fabric.Path('M 0 600 Q 200 580 500 450 Q 800 350 1050 500 L 1050 600 Z', {
                fill: orange,
                selectable: false
            });
            const botWave2 = new fabric.Path('M 0 600 Q 300 600 600 480 Q 900 350 1050 550 L 1050 600 Z', {
                fill: darkOrange,
                selectable: false
            });
            canvas.add(topWave, botWave, botWave2);

            // Left side info
            const name = new fabric.Text(formData.name, { left: 80, top: 180, fontSize: 48, fontWeight: 'bold', fill: darkOrange });
            const title = new fabric.Text(formData.title.toUpperCase(), { left: 80, top: 240, fontSize: 18, fill: '#888', charSpacing: 50 });
            canvas.add(name, title);
            canvas.add(new fabric.Rect({ left: 80, top: 275, width: 30, height: 4, fill: orange }));

            const info = new fabric.Text(`${formData.phone1}\n${formData.phone2}\n\n${formData.address}\n\n${formData.email}\n${formData.website}`, {
                left: 80, top: 310, fontSize: 20, fill: '#444', lineHeight: 1.4
            });
            canvas.add(info);

            // QR Code Placeholder
            const qrBox = new fabric.Rect({ left: CARD_WIDTH - 250, top: 250, width: 150, height: 150, fill: '#fff', stroke: '#ccc', strokeWidth: 2, rx: 10 });
            const qrPattern = new fabric.Path('M 20 20 L 40 20 L 40 40 L 20 40 Z M 60 20 L 80 20... ', { left: CARD_WIDTH - 235, top: 265, fill: '#333', scaleX: 1.5, scaleY: 1.5 });
            canvas.add(qrBox, qrPattern);

            // Bottom Logo
            const logo = await loadLogo(orange);
            logo.set({ left: CARD_WIDTH * 0.75, top: CARD_HEIGHT - 100, scaleX: 0.5, scaleY: 0.5 });
            const brand = new fabric.Text(formData.company, { left: CARD_WIDTH * 0.81, top: CARD_HEIGHT - 105, fontSize: 32, fontWeight: 'bold', fill: orange });
            const tag = new fabric.Text(formData.tagline, { left: CARD_WIDTH * 0.81, top: CARD_HEIGHT - 70, fontSize: 14, fill: '#666' });
            canvas.add(logo, brand, tag);
        }
    };

    const renderDarkGold = async (canvas: fabric.Canvas) => {
        const darkBlue = '#061a29';
        const gold = '#c5a059';
        const lightGold = '#e8d2a6';

        if (activeSide === 'front') {
            canvas.setBackgroundColor(darkBlue, () => { });

            const logo = new fabric.Path('M 50 0 L 0 50 L 30 50 L 50 20 L 70 50 L 100 50 Z', { fill: gold, scaleX: 2.5, scaleY: 2.5, left: CARD_WIDTH / 2 - 125, top: 120 });
            const triangle = new fabric.Path('M 0 100 L 100 100 L 50 150 Z', { fill: gold, scaleX: 1.5, scaleY: 1.5, left: CARD_WIDTH / 2 + 50, top: 200 });

            const brand = new fabric.Text(formData.company, {
                left: CARD_WIDTH / 2, top: 320, originX: 'center',
                fontSize: 68, fontWeight: 'bold', fill: gold, charSpacing: 100
            });
            const slogan = new fabric.Text('YOUR SLOGAN HERE', {
                left: CARD_WIDTH / 2, top: 400, originX: 'center',
                fontSize: 22, fill: '#ffffff', opacity: 0.8, charSpacing: 200
            });

            canvas.add(logo, triangle, brand, slogan);

            const websiteStrip = new fabric.Rect({ left: 0, top: CARD_HEIGHT - 80, width: CARD_WIDTH, height: 80, fill: lightGold, opacity: 0.1 });
            const website = new fabric.Text(formData.website.toUpperCase(), {
                left: CARD_WIDTH / 2, top: CARD_HEIGHT - 50, originX: 'center',
                fontSize: 22, fill: '#ffffff', charSpacing: 150
            });
            canvas.add(websiteStrip, website);
        } else {
            canvas.setBackgroundColor(lightGold, () => { });

            // Left dark area
            const path = new fabric.Path('M 0 0 L 400 0 Q 300 300 400 600 L 0 600 Z', { fill: darkBlue });
            canvas.add(path);

            const logo = new fabric.Path('M 50 0 L 0 50 L 30 50 L 50 20 L 70 50 L 100 50 Z', { fill: gold, scaleX: 1.2, scaleY: 1.2, left: 140, top: 180 });
            const triangle = new fabric.Path('M 0 100 L 100 100 L 50 150 Z', { fill: gold, scaleX: 0.8, scaleY: 0.8, left: 220, top: 220 });
            const brand = new fabric.Text(formData.company, { left: 50, top: 260, fontSize: 36, fontWeight: 'bold', fill: gold });
            const slogan = new fabric.Text('YOUR SLOGAN HERE', { left: 110, top: 300, fontSize: 12, fill: '#fff', charSpacing: 100 });
            canvas.add(logo, triangle, brand, slogan);

            const qr = new fabric.Rect({ left: 40, top: 400, width: 120, height: 120, fill: '#fff', stroke: gold, strokeWidth: 2 });
            canvas.add(qr);

            // Right Info
            const name = new fabric.Text(formData.name, { left: 650, top: 180, fontSize: 54, fontWeight: 'bold', fill: darkBlue });
            const title = new fabric.Text('Modeling Designer', { left: 690, top: 250, fontSize: 20, fill: '#555' });
            canvas.add(name, title);
            canvas.add(new fabric.Rect({ left: 630, top: 290, width: 320, height: 2, fill: darkBlue }));

            const contactInfo = [
                { icon: '📞', text: '+070 6754 76854\n+070 6754 76854' },
                { icon: '✉️', text: 'yourmail@gmail.com\nurwebsitename.com' },
                { icon: '📍', text: 'Your Street Address Here\nStreet Crossrad 123' }
            ];

            contactInfo.forEach((item, i) => {
                const group = new fabric.Group([
                    new fabric.Rect({ width: 60, height: 60, fill: darkBlue, rx: 30, ry: 30 }),
                    new fabric.Text(item.icon, { left: 18, top: 15, fontSize: 24 })
                ], { left: 880, top: 320 + i * 85 });
                const text = new fabric.Text(item.text, { left: 580, top: 330 + i * 85, fontSize: 18, fill: '#333', textAlign: 'right' });
                canvas.add(group, text);
            });
        }
    };

    const renderBlueGeometric = async (canvas: fabric.Canvas) => {
        const lightBlue = '#00aae4';
        const darkGrey = '#2c3e50';

        if (activeSide === 'front') {
            canvas.setBackgroundColor('#ffffff', () => { });

            // Bottom bar
            const bar = new fabric.Rect({ left: 0, top: CARD_HEIGHT - 100, width: CARD_WIDTH, height: 100, fill: darkGrey });
            const mountain = new fabric.Path('M 800 500 L 950 350 L 1100 500 Z', { fill: lightBlue });
            const mountain2 = new fabric.Path('M 700 500 L 850 300 L 1000 500 Z', { fill: '#fff' });
            canvas.add(bar, mountain, mountain2);

            const logoMark = new fabric.Group([
                new fabric.Rect({ width: 50, height: 50, stroke: lightBlue, strokeWidth: 4, fill: 'transparent' }),
                new fabric.Rect({ width: 50, height: 50, stroke: lightBlue, strokeWidth: 4, fill: 'transparent', left: 20, top: 20 })
            ], { left: CARD_WIDTH / 2 - 35, top: 180 });

            const brand = new fabric.Text('BRAND NAME', {
                left: CARD_WIDTH / 2, top: 300, originX: 'center',
                fontSize: 60, fontWeight: 'bold', fill: '#333'
            });
            const slogan = new fabric.Text('Your Slogan Here', {
                left: CARD_WIDTH / 2, top: 380, originX: 'center',
                fontSize: 24, fill: '#666', charSpacing: 100
            });
            canvas.add(logoMark, brand, slogan);
        } else {
            canvas.setBackgroundColor('#ffffff', () => { });

            // Top info
            const name = new fabric.Text('JONATHON DOE', { left: 220, top: 120, fontSize: 44, fontWeight: 'black', fill: '#333' });
            const title = new fabric.Text('Graphic Designer', { left: 220, top: 180, fontSize: 28, fill: '#555' });
            canvas.add(name, title);

            const contacts = [
                { icon: '📞', text: '(000) 0000 0000\n(000) 0000 0000' },
                { icon: '✉️', text: 'your email here\nyour website here' },
                { icon: '📍', text: 'your address here\nyour address here' }
            ];

            contacts.forEach((item, i) => {
                const group = new fabric.Group([
                    new fabric.Rect({ width: 50, height: 50, fill: lightBlue }),
                    new fabric.Text(item.icon, { left: 13, top: 10, fontSize: 24 })
                ], { left: 220, top: 250 + i * 75 });
                const text = new fabric.Text(item.text, { left: 290, top: 255 + i * 75, fontSize: 20, fill: '#444' });
                canvas.add(group, text);
            });

            // Right side Logo
            const logoMark = new fabric.Group([
                new fabric.Rect({ width: 50, height: 50, stroke: lightBlue, strokeWidth: 4, fill: 'transparent' }),
                new fabric.Rect({ width: 50, height: 50, stroke: lightBlue, strokeWidth: 4, fill: 'transparent', left: 20, top: 20 })
            ], { left: 620, top: 280 });
            const brand = new fabric.Text('BRAND NAME', { left: 550, top: 380, fontSize: 32, fontWeight: 'bold', fill: '#333' });
            const slogan = new fabric.Text('Your Slogan Here', { left: 560, top: 430, fontSize: 16, fill: '#666' });
            canvas.add(logoMark, brand, slogan);

            const bar = new fabric.Rect({ left: 180, top: CARD_HEIGHT - 120, width: 620, height: 50, fill: darkGrey });
            const mountain = new fabric.Path('M 700 500 L 800 400 L 900 500 Z', { fill: lightBlue, left: 680, top: CARD_HEIGHT - 170 });
            canvas.add(bar, mountain);
        }
    };

    const handleDownload = (side: 'front' | 'back') => {
        if (!fabricCanvasRef.current) return;
        // The current canvas already has the correct view rendered
        const dataURL = fabricCanvasRef.current.toDataURL({ format: 'png', multiplier: 3, quality: 1.0 });
        const link = document.createElement('a');
        link.download = `NameCard_${activeTemplate}_${side === 'front' ? 'MatTruoc' : 'MatSau'}_${Date.now()}.png`;
        link.href = dataURL;
        link.click();
        toast.success(`Đã tải Mặt ${side === 'front' ? 'Trước' : 'Sau'} sắc nét!`);
    };

    return (
        <div className="h-full flex flex-col bg-slate-950">
            <div className="flex items-center justify-between p-4 bg-[#080808] border-b border-white/10">
                <button onClick={onBack} className="text-slate-500 hover:text-white flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all">
                    <ArrowRight className="rotate-180" size={14} /> Studio Photo
                </button>

                <div className="flex bg-white/5 p-1 rounded-2xl gap-1">
                    <button onClick={() => setActiveSide('front')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeSide === 'front' ? 'bg-gold text-black' : 'text-slate-500'}`}>Mặt Trước</button>
                    <button onClick={() => setActiveSide('back')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeSide === 'back' ? 'bg-gold text-black' : 'text-slate-500'}`}>Mặt Sau</button>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => handleDownload('front')} className="bg-white/10 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                        Tải Mặt Trước HD
                    </button>
                    <button onClick={() => handleDownload('back')} className="bg-gold text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all flex items-center gap-2">
                        Tải Mặt Sau HD
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-[380px] bg-[#050505] border-r border-white/10 p-8 overflow-y-auto no-scrollbar space-y-10">
                    <section>
                        <header className="flex items-center gap-2 mb-6"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Chọn Mẫu Thiết Kế</h3></header>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'orange_waves', label: '1. Orange Wave', desc: 'Sáng tạo, rực rỡ', style: 'bg-yellow-500' },
                                { id: 'dark_gold', label: '2. Luxury Dark', desc: 'Đẳng cấp, huyền bí', style: 'bg-slate-900 border border-gold/50' },
                                { id: 'blue_geometric', label: '3. Modern Blue', desc: 'Tinh tế, chuyên nghiệp', style: 'bg-white border-2 border-blue-400' }
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
                        <header className="flex items-center gap-2 mb-2"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Chỉnh Sửa Thông Tin</h3></header>
                        <div className="space-y-4">
                            <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value.toUpperCase() })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-white font-black" placeholder="Họ và tên" />
                            <input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-slate-200" placeholder="Chức danh" />
                            <div className="grid grid-cols-2 gap-3">
                                <input value={formData.phone1} onChange={e => setFormData({ ...formData, phone1: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-[10px] text-white" placeholder="SĐT 1" />
                                <input value={formData.phone2} onChange={e => setFormData({ ...formData, phone2: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-[10px] text-white" placeholder="SĐT 2" />
                            </div>
                            <input value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs text-blue-400" placeholder="Email" />
                            <input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-[10px] text-slate-400" placeholder="Địa chỉ" />
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
                        <ShieldCheck className="text-gold" size={14} /><span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">300 DPI Export Grade • {activeSide === 'front' ? 'MẶT TRƯỚC' : 'MẶT SAU'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardCreator;
