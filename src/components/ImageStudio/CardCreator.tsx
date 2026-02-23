import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, ArrowRight, RefreshCw, Zap, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

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
        title: profile?.job_title || 'GIÁM ĐỐC KINH DOANH',
        phone1: profile?.phone || '0988 226 493',
        email: profile?.business_email || (profile as any)?.email || 'chien.tran@gmail.com',
        company: profile?.agency || 'CENLAND GROUP',
        tagline: 'YOUR TAGLINE GOES HERE',
        address: profile?.company_address || 'Tháp Thành Công, Cầu Giấy, Hà Nội',
        website: profile?.website || 'www.cenland.vn',
        avatarUrl: (profile as any)?.avatar_url || (profile as any)?.avatar || "https://i.pravatar.cc/300?img=11"
    });

    const [companyLogo, setCompanyLogo] = useState<string | null>(null);
    const [showQRCode, setShowQRCode] = useState(true);
    const [showTagline, setShowTagline] = useState(true);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setCompanyLogo(event.target?.result as string);
                toast.success('Đã tải logo công ty');
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                name: profile.full_name || prev.name,
                phone1: profile.phone || prev.phone1,
                company: profile.agency || prev.company,
                title: profile.job_title || prev.title,
                address: profile.company_address || prev.address,
                website: profile.website || prev.website,
                email: profile.business_email || prev.email,
            }));
        }
    }, [profile]);

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

    const fontsLoadedRef = useRef(false);

    useEffect(() => {
        const cleanup = initCanvas();
        const triggerRender = async () => {
            if (document.fonts && !fontsLoadedRef.current) {
                await document.fonts.ready;
                // Add a small delay for extra safety ONLY on first load
                await new Promise(resolve => setTimeout(resolve, 500));
                fontsLoadedRef.current = true;
            }
            renderTemplate();
        };
        triggerRender();
        return cleanup;
    }, [initCanvas, formData, activeTemplate, activeSide, companyLogo, showQRCode, showTagline]);

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

    const drawCompanyLogo = async (canvas: fabric.Canvas, x: number, y: number, size: number) => {
        if (companyLogo) {
            try {
                const img = await loadImg(companyLogo);
                const scale = size / Math.max(img.width || 1, img.height || 1);
                img.set({
                    left: x, top: y,
                    originX: 'center', originY: 'center',
                    scaleX: scale, scaleY: scale,
                    selectable: false
                });
                canvas.add(img);
            } catch (e) {
                await drawHexLogo('#f39c12', x, y, size / 100, canvas);
            }
        } else {
            await drawHexLogo('#f39c12', x, y, size / 100, canvas);
        }
    };

    const renderOrangeWaves = async (canvas: fabric.Canvas) => {
        const primary = '#f6b21b';
        const secondary = '#ffe082';
        const accent = '#e67e22';

        if (activeSide === 'front') {
            canvas.setBackgroundColor('#ffffff', () => { });

            // Top left wave (light)
            canvas.add(new fabric.Path('M 0 0 L 700 0 C 600 250 350 350 0 350 Z', { fill: secondary, opacity: 0.5, selectable: false }));
            // Top left wave (main)
            canvas.add(new fabric.Path('M 0 0 L 500 0 C 400 200 200 250 0 450 Z', { fill: primary, selectable: false }));

            // Bottom wave area
            canvas.add(new fabric.Path('M 0 600 L 1050 600 L 1050 300 C 850 450 500 650 0 500 Z', { fill: primary, selectable: false }));
            canvas.add(new fabric.Path('M 400 600 L 1050 600 L 1050 450 C 900 550 700 600 400 600 Z', { fill: accent, opacity: 0.3, selectable: false }));

            // Logo & Brand (Top Right)
            await drawCompanyLogo(canvas, 750, 150, 120);
            canvas.add(new fabric.Text(formData.company || 'TÊN CÔNG TY', {
                left: 750, top: 250, originX: 'center',
                fontSize: 48, fontWeight: '900', fill: '#1a1a1a',
                fontFamily: 'Montserrat'
            }));
            if (showTagline) {
                canvas.add(new fabric.Text(formData.tagline || 'YOUR TAGLINE', {
                    left: 750, top: 310, originX: 'center',
                    fontSize: 22, fill: '#64748b', charSpacing: 150,
                    fontFamily: 'Inter', fontWeight: '600'
                }));
            }

            // Website (Bottom Left)
            canvas.add(new fabric.Text(formData.website, {
                left: 80, top: 540, fontSize: 24, fill: '#1a1a1a',
                fontWeight: '800', fontFamily: 'Inter'
            }));
        } else {
            canvas.setBackgroundColor('#ffffff', () => { });

            // Curves for back side
            // Top right wave
            canvas.add(new fabric.Path('M 700 0 L 1050 0 L 1050 400 C 900 250 850 150 700 0 Z', { fill: secondary, opacity: 0.4, selectable: false }));
            // Bottom left wave
            canvas.add(new fabric.Path('M 0 600 L 500 600 C 350 500 150 450 0 350 Z', { fill: primary, selectable: false }));
            // Bottom decorative wave
            canvas.add(new fabric.Path('M 0 600 L 800 600 C 600 550 300 600 0 500 Z', { fill: primary, opacity: 0.6, selectable: false }));

            // Left Side Info
            const nameText = new fabric.Text(formData.name.toUpperCase(), {
                left: 80, top: 150, fontSize: 44, fontWeight: '900',
                fill: '#1a1a1a', fontFamily: 'Montserrat', charSpacing: 50
            });
            const titleText = new fabric.Text(formData.title.toUpperCase() || 'CHUYÊN VIÊN KINH DOANH', {
                left: 80, top: 205, fontSize: 18, fill: '#64748b',
                charSpacing: 200, fontWeight: '800', fontFamily: 'Inter'
            });
            canvas.add(nameText, titleText);

            // Vertical bar
            canvas.add(new fabric.Rect({ left: 30, top: 150, width: 12, height: 85, fill: primary, rx: 6, ry: 6 }));

            const info = new fabric.Text(`${formData.phone1}\n\n${formData.address}\n${formData.email}\n${formData.website}`, {
                left: 80,
                top: 280,
                fontSize: 20,
                lineHeight: 1.6,
                fill: '#334155',
                fontWeight: '500',
                fontFamily: 'Inter'
            });
            canvas.add(info);

            // QR Code Rendering
            if (showQRCode) {
                try {
                    // Create Zalo Link: https://zalo.me/phone
                    // Remove dots, spaces, leadings if necessary, but zalo.me/0988... usually works
                    const cleanPhone = formData.phone1.replace(/[^0-9]/g, '');
                    const zaloLink = `https://zalo.me/${cleanPhone}`;

                    const qrDataUrl = await QRCode.toDataURL(zaloLink, {
                        margin: 1,
                        width: 160,
                        color: {
                            dark: '#000000',
                            light: '#ffffff'
                        }
                    });

                    fabric.Image.fromURL(qrDataUrl, (img) => {
                        img.set({
                            left: 805, // Adjusted to center precisely in the box
                            top: 360,
                            scaleX: 1,
                            scaleY: 1,
                            originX: 'center',
                            originY: 'center',
                        });

                        // QR Code Outer Box with highlighted background and border
                        const qrBox = new fabric.Rect({
                            left: 805,
                            top: 360, // Moved up from 410
                            width: 200,
                            height: 200,
                            fill: '#fffef0', // Light yellow background
                            stroke: primary,  // Border to make it pop
                            strokeWidth: 4,
                            rx: 30,
                            ry: 30,
                            originX: 'center',
                            originY: 'center',
                            shadow: new fabric.Shadow({
                                color: 'rgba(246, 178, 27, 0.2)', // Tinted shadow
                                blur: 30,
                                offsetX: 0,
                                offsetY: 10
                            })
                        });

                        canvas.add(qrBox);
                        canvas.add(img);
                        canvas.renderAll();
                    });
                } catch (err) {
                    console.error('QR Generation Error:', err);
                }
            }

            // Bottom Right Logo & Brand
            await drawCompanyLogo(canvas, 600, 520, 60);
            canvas.add(new fabric.Text(formData.company || 'TÊN CÔNG TY', {
                left: 650, top: 512, originY: 'center',
                fontSize: 32, fontWeight: '800', fill: '#1a1a1a',
                fontFamily: 'Montserrat'
            }));
            if (showTagline) {
                canvas.add(new fabric.Text(formData.tagline || 'YOUR TAGLINE GOES HERE', {
                    left: 650, top: 540, originY: 'center',
                    fontSize: 12, fill: '#94a3b8', charSpacing: 80,
                    fontWeight: '800', fontFamily: 'Inter'
                }));
            }
        }
    };

    const drawHexLogo = async (color: string, x: number, y: number, scale: number, canvas: fabric.Canvas) => {
        const hex = new fabric.Path('M 50 0 L 93.3 25 L 93.3 75 L 50 100 L 6.7 75 L 6.7 25 Z', { fill: 'transparent', stroke: color, strokeWidth: 8 });
        const hexSmall = new fabric.Path('M 50 25 L 71.6 37.5 L 71.6 62.5 L 50 75 L 28.4 62.5 L 28.4 37.5 Z', { fill: 'transparent', stroke: color, strokeWidth: 4 });
        const group = new fabric.Group([hex, hexSmall], { left: x, top: y, originX: 'center', originY: 'center', scaleX: scale, scaleY: scale, selectable: false });
        canvas.add(group);
    };

    const renderLuxuryGold = async (canvas: fabric.Canvas) => {
        const navy = '#061a29';
        const gold = '#c5a059';
        const lightGold = '#fdfcf0';

        if (activeSide === 'front') {
            canvas.setBackgroundColor(navy, () => { });
            canvas.add(new fabric.Rect({ width: CARD_WIDTH, height: 12, fill: gold, selectable: false }));
            canvas.add(new fabric.Rect({ width: CARD_WIDTH, height: 12, top: CARD_HEIGHT - 12, fill: gold, selectable: false }));
            const logo = new fabric.Path('M 50 0 L 0 60 L 40 60 L 50 40 L 60 60 L 100 60 Z', { fill: gold, scaleX: 2.2, scaleY: 2.2, left: CARD_WIDTH / 2 - 110, top: 150 });
            canvas.add(logo);
            canvas.add(new fabric.Text(formData.name.toUpperCase(), { left: CARD_WIDTH / 2, top: 340, originX: 'center', fontSize: 64, fontWeight: '900', fill: gold, charSpacing: 100 }));
            canvas.add(new fabric.Text(formData.title.toUpperCase(), { left: CARD_WIDTH / 2, top: 410, originX: 'center', fontSize: 22, fill: '#fff', opacity: 0.6, charSpacing: 200 }));
        } else {
            canvas.setBackgroundColor(lightGold, () => { });
            const navyWave = new fabric.Path('M 0 0 L 450 0 C 350 200 350 400 450 600 L 0 600 Z', { fill: navy, selectable: false });
            canvas.add(navyWave);
            await setupClippedAvatar(formData.avatarUrl, 180, 180, 180, canvas, 'circle');

            const brand = new fabric.Text('MARTIN SAENZ', { left: 80, top: 350, fontSize: 32, fontWeight: 'bold', fill: gold });
            canvas.add(brand);

            const name = new fabric.Text(formData.name, { left: 560, top: 140, fontSize: 58, fontWeight: '900', fill: navy });
            const titleArea = new fabric.Text('CREATIVE DIRECTOR', { left: 590, top: 205, fontSize: 20, fill: '#64748b', charSpacing: 100 });
            canvas.add(name, titleArea);
            canvas.add(new fabric.Rect({ left: 540, top: 240, width: 380, height: 2, fill: navy }));

            [
                { icon: '📞', text: formData.phone1 },
                { icon: '✉️', text: `${formData.email}\n${formData.website}` },
                { icon: '📍', text: formData.address }
            ].forEach((ctx, i) => {
                const iconCircle = new fabric.Circle({ radius: 25, fill: navy, left: 910, top: 280 + i * 85 });
                canvas.add(iconCircle);
                canvas.add(new fabric.Text(ctx.text, { left: 560, top: 285 + i * 85, fontSize: 18, fill: '#333', textAlign: 'right' }));
            });
        }
    };

    const renderBlueGeo = async (canvas: fabric.Canvas) => {
        const blue = '#00aae4';
        const dark = '#2d3436';
        if (activeSide === 'front') {
            canvas.setBackgroundColor('#ffffff', () => { });
            canvas.add(new fabric.Rect({ left: 0, top: 480, width: CARD_WIDTH, height: 120, fill: dark }));
            canvas.add(new fabric.Path('M 700 480 L 850 320 L 1000 480 Z', { fill: blue, opacity: 0.8, selectable: false }));
            canvas.add(new fabric.Path('M 800 480 L 950 380 L 1100 480 Z', { fill: blue, opacity: 0.4, selectable: false }));
            await setupClippedAvatar(formData.avatarUrl, 300, CARD_WIDTH / 2, 230, canvas, 'circle');
            canvas.add(new fabric.Text('IDENTITY BRAND', { left: CARD_WIDTH / 2, top: 410, originX: 'center', fontSize: 44, fontWeight: '900', fill: '#1d1d1d' }));
        } else {
            canvas.setBackgroundColor('#ffffff', () => { });
            await setupClippedAvatar(formData.avatarUrl, 180, 150, 150, canvas, 'rect');
            canvas.add(new fabric.Text(formData.name, { left: 300, top: 120, fontSize: 48, fontWeight: 'bold', fill: dark }));
            canvas.add(new fabric.Rect({ left: 200, top: 520, width: 850, height: 40, fill: dark }));
        }
    };

    const handleDownload = () => {
        if (!fabricCanvasRef.current) return;
        const dataURL = fabricCanvasRef.current.toDataURL({ format: 'png', multiplier: 3, quality: 1.0 });
        const link = document.createElement('a');
        link.download = `NameCard_${activeSide}_${activeTemplate}.png`;
        link.href = dataURL;
        link.click();
    };

    return (
        <div className="h-full flex flex-col bg-[#050505]">
            {/* Font Preloader for Canvas */}
            <div style={{ fontFamily: 'Montserrat', fontWeight: 900, visibility: 'hidden', position: 'absolute' }}>Font Preloader - Việt Nam</div>
            <div style={{ fontFamily: 'Inter', fontWeight: 800, visibility: 'hidden', position: 'absolute' }}>Font Preloader - Việt Nam</div>

            <div className="flex items-center justify-between p-4 bg-[#080808] border-b border-white/10">
                <button onClick={onBack} className="text-slate-500 hover:text-white flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all"><ArrowRight className="rotate-180" size={14} /> Back</button>
                <div className="flex bg-white/5 p-1 rounded-2xl gap-1">
                    <button onClick={() => setActiveSide('front')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeSide === 'front' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-slate-500 hover:text-slate-300'}`}>Mặt Trước</button>
                    <button onClick={() => setActiveSide('back')} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeSide === 'back' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-slate-500 hover:text-slate-300'}`}>Mặt Sau</button>
                </div>
                <button onClick={handleDownload} className="bg-white text-black px-8 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-gold transition-all">Tải HD 3x</button>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="w-[380px] bg-[#050505] border-r border-white/10 p-8 overflow-y-auto no-scrollbar space-y-8">
                    <section>
                        <header className="flex items-center gap-2 mb-6"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Mẫu thiết kế (3 Options)</h3></header>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'orange_waves', label: '1. Orange Wave (Richard)', style: 'bg-yellow-500' },
                                { id: 'luxury_gold', label: '2. Luxury Gold (Saenz)', style: 'bg-slate-900 border border-gold/50' },
                                { id: 'blue_geo', label: '3. Professional Blue', style: 'bg-white border-2 border-blue-400' }
                            ].map(t => (
                                <button key={t.id} onClick={() => setActiveTemplate(t.id as any)} className={`p-4 rounded-3xl border-2 transition-all flex items-center gap-4 text-left ${activeTemplate === t.id ? 'border-gold bg-gold/5 shadow-lg' : 'border-white/5 bg-white/[0.02]'}`}>
                                    <div className={`w-16 h-10 rounded-lg shrink-0 ${t.style}`}></div>
                                    <div className={`text-[10px] font-black uppercase ${activeTemplate === t.id ? 'text-gold' : 'text-white'}`}>{t.label}</div>
                                </button>
                            ))}
                        </div>
                    </section>
                    <section className="pt-6 border-t border-white/5">
                        <header className="flex items-center gap-2 mb-6"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Cấu hình Logo & Thương hiệu</h3></header>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">Logo Công Ty</label>
                                <div className="relative group">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="p-6 border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.02] group-hover:bg-white/[0.05] group-hover:border-gold/50 transition-all flex flex-col items-center justify-center gap-3">
                                        {companyLogo ? (
                                            <img src={companyLogo} alt="Logo" className="w-16 h-16 object-contain rounded-lg shadow-lg" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold"><Download size={24} /></div>
                                        )}
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-white uppercase italic">Click để tải logo</p>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">PNG, JPG (Trong suốt là tốt nhất)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Tên Công Ty</label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[12px] font-bold text-white focus:outline-none focus:border-gold transition-all"
                                        placeholder="Tên công ty..."
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/10 mt-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Zap size={14} className="text-gold" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">QR Code liên hệ Zalo</span>
                                        </div>
                                        <button
                                            onClick={() => setShowQRCode(!showQRCode)}
                                            className={`transition-all ${showQRCode ? 'text-gold' : 'text-slate-600'}`}
                                        >
                                            {showQRCode ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-slate-500 mt-1 italic leading-relaxed">* Tự động tạo mã QR quét số điện thoại 1 để kết bạn Zalo nhanh.</p>
                                </div>

                                <div className="pt-4 border-t border-white/10 mt-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Zap size={14} className="text-gold" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hiển thị Câu Tagline</span>
                                        </div>
                                        <button
                                            onClick={() => setShowTagline(!showTagline)}
                                            className={`transition-all ${showTagline ? 'text-gold' : 'text-slate-600'}`}
                                        >
                                            {showTagline ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        disabled={!showTagline}
                                        value={formData.tagline}
                                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                        className={`w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[12px] font-bold text-white focus:outline-none focus:border-gold transition-all mt-2 ${!showTagline ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        placeholder="Câu slogan / tagline..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Họ & Tên</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[12px] font-bold text-white focus:outline-none focus:border-gold transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Chức danh</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[12px] font-bold text-white focus:outline-none focus:border-gold transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Địa chỉ</label>
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[12px] font-bold text-white focus:outline-none focus:border-gold transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Email</label>
                                    <input
                                        type="text"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[12px] font-bold text-white focus:outline-none focus:border-gold transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">Website</label>
                                    <input
                                        type="text"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-[12px] font-bold text-white focus:outline-none focus:border-gold transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div ref={containerRef} className="flex-1 bg-black flex flex-col items-center justify-center p-20 relative overflow-hidden">
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
