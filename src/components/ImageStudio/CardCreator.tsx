import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, ArrowRight, UserSquare2, RefreshCw, Upload, Smartphone, Mail, Briefcase, MapPin, QrCode } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';

const MOCK_AVATAR = "https://i.pravatar.cc/300?img=11";
const CARD_WIDTH = 1050; // 3.5 inches at 300DPI
const CARD_HEIGHT = 600; // 2 inches at 300DPI

const CardCreator = ({ onBack }: { onBack: () => void }) => {
    const { profile } = useAuth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [activeTemplate, setActiveTemplate] = useState<'modern' | 'luxury'>('modern');
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: profile?.full_name || 'Nguyễn Văn A',
        title: 'Chuyên Viên Tư Vấn BĐS',
        phone: profile?.phone || '0901 234 567',
        email: (profile as any)?.email || 'nguyenvana@gmail.com',
        zalo: profile?.phone ? `https://zalo.me/${profile.phone}` : 'https://zalo.me/0901234567',
        company: 'CÔNG TY CP BẤT ĐỘNG SẢN',
        address: 'Quận 1, TP. Hồ Chí Minh',
        avatarUrl: (profile as any)?.avatar_url || (profile as any)?.avatar || MOCK_AVATAR
    });

    const initCanvas = useCallback(() => {
        if (!canvasRef.current) return;
        if (fabricCanvasRef.current) {
            fabricCanvasRef.current.dispose();
        }

        const canvas = new fabric.Canvas(canvasRef.current, {
            preserveObjectStacking: true,
            selection: false,
            backgroundColor: '#ffffff'
        });

        // Set dimensions logic (scale for view, export full)
        const updateScale = () => {
            if (!containerRef.current) return;
            const containerWidth = containerRef.current.clientWidth;
            const containerHeight = containerRef.current.clientHeight;

            // Calculate scale to fit
            const scaleX = (containerWidth - 40) / CARD_WIDTH;
            const scaleY = (containerHeight - 40) / CARD_HEIGHT;
            const scale = Math.min(scaleX, scaleY);

            canvas.setDimensions({
                width: CARD_WIDTH * scale,
                height: CARD_HEIGHT * scale
            });

            setCanvasZoom(scale);
        };

        setFabricCanvas(canvas);
        updateScale();
        window.addEventListener('resize', updateScale);

        return () => window.removeEventListener('resize', updateScale);
    }, []);

    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
    const [canvasZoom, setCanvasZoom] = useState(1);

    useEffect(() => {
        const cleanup = initCanvas();
        return cleanup;
    }, [initCanvas]);

    useEffect(() => {
        if (fabricCanvas) {
            fabricCanvas.setZoom(canvasZoom);
            renderTemplate();
        }
    }, [fabricCanvas, canvasZoom, formData, activeTemplate]);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setFormData({ ...formData, avatarUrl: url });
        }
    };

    const renderTemplate = async () => {
        if (!fabricCanvas) return;
        setIsLoading(true);
        fabricCanvas.clear();

        if (activeTemplate === 'modern') {
            await renderModernTemplate(fabricCanvas);
        } else {
            await renderLuxuryTemplate(fabricCanvas);
        }

        fabricCanvas.renderAll();
        setIsLoading(false);
    };

    const loadQR = async (): Promise<fabric.Image | null> => {
        return new Promise((resolve) => {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(formData.zalo)}`;
            fabric.Image.fromURL(qrUrl, (img) => {
                if (img) resolve(img); else resolve(null);
            }, { crossOrigin: 'anonymous' });
        });
    };

    const loadAvatar = async (): Promise<fabric.Image | null> => {
        return new Promise((resolve) => {
            fabric.Image.fromURL(formData.avatarUrl, (img) => {
                if (img) resolve(img); else resolve(null);
            }, { crossOrigin: 'anonymous' });
        });
    };

    const loadIcon = async (type: 'phone' | 'mail' | 'map' | 'global'): Promise<fabric.Path> => {
        // SVG paths for simple icons
        const paths = {
            phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
            mail: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
            map: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
            global: "M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM2.05 13H21.95 M2.05 11H21.95 M12 2C15 2 17 6.47715 17 12C17 17.5228 15 22 12 22C9 22 7 17.5228 7 12C7 6.47715 9 2 12 2Z"
        };
        const path = new fabric.Path(paths[type], {
            fill: 'transparent',
            stroke: activeTemplate === 'modern' ? '#3b82f6' : '#bf953f',
            strokeWidth: 2,
            scaleX: 1,
            scaleY: 1
        });
        return path;
    };

    const renderModernTemplate = async (canvas: fabric.Canvas) => {
        canvas.setBackgroundColor('#ffffff', () => { });

        // Background Blue shape
        const bgPoly = new fabric.Polygon([
            { x: 0, y: 0 },
            { x: CARD_WIDTH * 0.45, y: 0 },
            { x: CARD_WIDTH * 0.35, y: CARD_HEIGHT },
            { x: 0, y: CARD_HEIGHT }
        ], {
            fill: '#1e3a8a', // Dark Navy Blue
            selectable: false,
        });

        const accentPoly = new fabric.Polygon([
            { x: CARD_WIDTH * 0.45, y: 0 },
            { x: CARD_WIDTH * 0.48, y: 0 },
            { x: CARD_WIDTH * 0.38, y: CARD_HEIGHT },
            { x: CARD_WIDTH * 0.35, y: CARD_HEIGHT }
        ], {
            fill: '#3b82f6', // Bright Blue
            selectable: false,
        });

        canvas.add(bgPoly, accentPoly);

        // Name & Title
        const nameText = new fabric.Text(formData.name.toUpperCase(), {
            left: CARD_WIDTH * 0.45, top: 120,
            fontSize: 56, fontWeight: '900', fontFamily: 'Inter, sans-serif',
            fill: '#1e293b', selectable: false
        });

        const titleText = new fabric.Text(formData.title.toUpperCase(), {
            left: CARD_WIDTH * 0.45, top: 190,
            fontSize: 24, fontWeight: 'bold', fontFamily: 'Inter, sans-serif',
            fill: '#3b82f6', selectable: false, charSpacing: 100
        });

        // Line under title
        const line = new fabric.Line([CARD_WIDTH * 0.45, 230, CARD_WIDTH * 0.65, 230], {
            stroke: '#cbd5e1', strokeWidth: 3, selectable: false
        });

        canvas.add(nameText, titleText, line);

        // Contact Info
        const iconInfoOptions = { left: CARD_WIDTH * 0.45, fontSize: 22, fontFamily: 'Inter, sans-serif', fill: '#475569', selectable: false };

        const [phoneIco, mailIco, mapIco] = await Promise.all([loadIcon('phone'), loadIcon('mail'), loadIcon('map')]);

        phoneIco.set({ left: CARD_WIDTH * 0.45 - 35, top: 290, scaleX: 0.8, scaleY: 0.8 });
        const phoneTxt = new fabric.Text(formData.phone, { ...iconInfoOptions, top: 290, fontWeight: 'bold' });

        mailIco.set({ left: CARD_WIDTH * 0.45 - 35, top: 350, scaleX: 0.8, scaleY: 0.8 });
        const mailTxt = new fabric.Text(formData.email, { ...iconInfoOptions, top: 350 });

        mapIco.set({ left: CARD_WIDTH * 0.45 - 35, top: 410, scaleX: 0.8, scaleY: 0.8 });
        const mapTxt = new fabric.Text(formData.address, { ...iconInfoOptions, top: 410 });

        canvas.add(phoneIco, phoneTxt, mailIco, mailTxt, mapIco, mapTxt);

        // Avatar
        const avatar = await loadAvatar();
        if (avatar) {
            const size = 320;
            const scale = size / Math.min(avatar.width || 1, avatar.height || 1);
            avatar.set({
                scaleX: scale, scaleY: scale,
                originX: 'center', originY: 'center',
                left: CARD_WIDTH * 0.18, top: CARD_HEIGHT / 2,
                clipPath: new fabric.Circle({ radius: size / 2, originX: 'center', originY: 'center' })
            });

            const avatarBorder = new fabric.Circle({
                radius: size / 2 + 10, fill: 'transparent',
                stroke: '#ffffff', strokeWidth: 8,
                originX: 'center', originY: 'center',
                left: CARD_WIDTH * 0.18, top: CARD_HEIGHT / 2,
            });

            canvas.add(avatarBorder, avatar);
        }

        // QR Code
        const qr = await loadQR();
        if (qr) {
            qr.set({
                scaleX: 180 / (qr.width || 1), scaleY: 180 / (qr.height || 1),
                left: CARD_WIDTH - 220, top: CARD_HEIGHT - 220, selectable: false
            });

            const qrText = new fabric.Text('Quét mã kết nối', {
                left: CARD_WIDTH - 180, top: CARD_HEIGHT - 35,
                fontSize: 14, fontFamily: 'Inter, sans-serif', fill: '#64748b', selectable: false
            });
            canvas.add(qr, qrText);
        }

        // Brand Name (Top Right)
        const brandText = new fabric.Text(formData.company.toUpperCase(), {
            left: CARD_WIDTH - 40, top: 40, originX: 'right',
            fontSize: 28, fontWeight: '900', fontFamily: 'Inter, sans-serif', fill: '#1e3a8a', selectable: false
        });
        canvas.add(brandText);
    };

    const renderLuxuryTemplate = async (canvas: fabric.Canvas) => {
        canvas.setBackgroundColor('#111827', () => { }); // Slate-900 Dark BG

        // Gold Gradient Accent
        const gradient = new fabric.Gradient({
            type: 'linear', coords: { x1: 0, y1: 0, x2: CARD_WIDTH, y2: 0 },
            colorStops: [
                { offset: 0, color: '#bf953f' },
                { offset: 0.25, color: '#fcf6ba' },
                { offset: 0.5, color: '#b38728' },
                { offset: 0.75, color: '#fbf5b7' },
                { offset: 1, color: '#aa771c' }
            ]
        });

        // Top line
        const topBar = new fabric.Rect({ left: 0, top: 0, width: CARD_WIDTH, height: 10, fill: gradient, selectable: false });

        // Left side divider
        const divLine = new fabric.Rect({ left: CARD_WIDTH * 0.35, top: 100, width: 2, height: CARD_HEIGHT - 200, fill: gradient, selectable: false });

        canvas.add(topBar, divLine);

        // Avatar
        const avatar = await loadAvatar();
        if (avatar) {
            const size = 260;
            const scale = size / Math.min(avatar.width || 1, avatar.height || 1);
            avatar.set({
                scaleX: scale, scaleY: scale,
                originX: 'center', originY: 'center',
                left: CARD_WIDTH * 0.18, top: CARD_HEIGHT / 2,
                clipPath: new fabric.Rect({
                    width: size, height: size * 1.2, rx: 20, ry: 20,
                    originX: 'center', originY: 'center'
                })
            });

            const avatarBorder = new fabric.Rect({
                width: size + 8, height: size * 1.2 + 8, rx: 24, ry: 24,
                fill: 'transparent', stroke: gradient as any, strokeWidth: 4,
                originX: 'center', originY: 'center',
                left: CARD_WIDTH * 0.18, top: CARD_HEIGHT / 2,
            });
            canvas.add(avatarBorder, avatar);
        }

        // Company
        const brandText = new fabric.Text(formData.company.toUpperCase(), {
            left: CARD_WIDTH * 0.42, top: 80,
            fontSize: 22, fontWeight: 'bold', fontFamily: 'Inter, sans-serif', fill: '#bf953f', selectable: false, charSpacing: 100
        });

        // Name
        const nameText = new fabric.Text(formData.name.toUpperCase(), {
            left: CARD_WIDTH * 0.42, top: 140,
            fontSize: 52, fontWeight: '900', fontFamily: 'serif', fill: '#ffffff', selectable: false
        });

        // Title
        const titleText = new fabric.Text(formData.title.toUpperCase(), {
            left: CARD_WIDTH * 0.42, top: 210,
            fontSize: 18, fontWeight: 'normal', fontFamily: 'Inter, sans-serif', fill: '#fcf6ba', selectable: false, charSpacing: 300
        });

        canvas.add(brandText, nameText, titleText);

        // Contact Info (Gold Version)
        const iconInfoOptions = { left: CARD_WIDTH * 0.42, fontSize: 20, fontFamily: 'Inter, sans-serif', fill: '#cbd5e1', selectable: false };

        const [phoneIco, mailIco, mapIco] = await Promise.all([loadIcon('phone'), loadIcon('mail'), loadIcon('map')]);

        phoneIco.set({ left: CARD_WIDTH * 0.42 - 35, top: 290, scaleX: 0.8, scaleY: 0.8, stroke: '#bf953f' });
        const phoneTxt = new fabric.Text(formData.phone, { ...iconInfoOptions, top: 290, fontWeight: 'bold' });

        mailIco.set({ left: CARD_WIDTH * 0.42 - 35, top: 350, scaleX: 0.8, scaleY: 0.8, stroke: '#bf953f' });
        const mailTxt = new fabric.Text(formData.email, { ...iconInfoOptions, top: 350 });

        mapIco.set({ left: CARD_WIDTH * 0.42 - 35, top: 410, scaleX: 0.8, scaleY: 0.8, stroke: '#bf953f' });
        const mapTxt = new fabric.Text(formData.address, { ...iconInfoOptions, top: 410 });

        canvas.add(phoneIco, phoneTxt, mailIco, mailTxt, mapIco, mapTxt);

        // QR Code
        const qr = await loadQR();
        if (qr) {
            // Add white bg for QR code readability
            const qrBg = new fabric.Rect({
                left: CARD_WIDTH - 195, top: CARD_HEIGHT - 195,
                width: 170, height: 170, fill: '#ffffff', rx: 10, ry: 10, selectable: false
            });

            qr.set({
                scaleX: 150 / (qr.width || 1), scaleY: 150 / (qr.height || 1),
                left: CARD_WIDTH - 185, top: CARD_HEIGHT - 185, selectable: false
            });

            canvas.add(qrBg, qr);
        }
    };

    const handleDownload = () => {
        if (!fabricCanvas) return;

        // Export with 1.0 zoom (real pixels)
        fabricCanvas.setZoom(1);
        fabricCanvas.setWidth(CARD_WIDTH);
        fabricCanvas.setHeight(CARD_HEIGHT);

        const dataURL = fabricCanvas.toDataURL({ format: 'jpeg', quality: 1.0 });

        // Restore zoom
        fabricCanvas.setDimensions({
            width: CARD_WIDTH * canvasZoom,
            height: CARD_HEIGHT * canvasZoom
        });
        fabricCanvas.setZoom(canvasZoom);

        const link = document.createElement('a');
        link.download = `NameCard_${formData.name.replace(/\s+/g, '_')}_${Date.now()}.jpg`;
        link.href = dataURL;
        link.click();

        toast.success("Bấm Lưu Về Máy Thành Công!");
    };


    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
                <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 font-bold transition-colors">
                    <ArrowRight className="rotate-180" size={20} /> Studio Photo
                </button>
                <div className="font-black text-slate-800 text-lg flex items-center gap-2">
                    <UserSquare2 className="text-blue-500" /> TẠO NAMECARD DIGITAL
                </div>
                <div className="flex gap-3">
                    <button onClick={handleDownload} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-500 transition-all flex items-center gap-2 shadow-md shadow-blue-500/20">
                        <Download size={16} /> LƯU CARD (HD)
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Tools Sidebar */}
                <div className="w-[400px] bg-white border-r border-slate-200 overflow-y-auto flex flex-col shadow-xl z-10 custom-scrollbar">
                    <div className="p-6 space-y-6">

                        {/* Template Selector */}
                        <div>
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-3">Mẫu Thiết Kế</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setActiveTemplate('modern')}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${activeTemplate === 'modern' ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-300'}`}
                                >
                                    <div className="w-full h-12 bg-white border border-slate-200 rounded flex overflow-hidden">
                                        <div className="w-1/3 h-full bg-blue-800"></div>
                                        <div className="w-2/3 h-full px-2 py-1"><div className="h-1 w-1/2 bg-slate-300 mb-1"></div><div className="h-0.5 w-1/3 bg-slate-200"></div></div>
                                    </div>
                                    <span className={`text-xs font-bold ${activeTemplate === 'modern' ? 'text-blue-700' : 'text-slate-500'}`}>Hiện đại (Modern)</span>
                                </button>
                                <button
                                    onClick={() => setActiveTemplate('luxury')}
                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${activeTemplate === 'luxury' ? 'border-yellow-500 bg-yellow-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-300'}`}
                                >
                                    <div className="w-full h-12 bg-slate-900 border border-slate-700 rounded p-1 flex items-center justify-center">
                                        <div className="w-8 h-8 rounded border border-yellow-500"></div>
                                    </div>
                                    <span className={`text-xs font-bold ${activeTemplate === 'luxury' ? 'text-yellow-700' : 'text-slate-500'}`}>Sang trọng (Luxury)</span>
                                </button>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Form Inputs */}
                        <div className="space-y-4">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-wider block mb-2">Thông tin Cá nhân</label>

                            {/* Avatar */}
                            <div className="flex gap-4 items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-300 shadow-inner shrink-0 bg-white">
                                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-slate-500 block">ĐỔI ẢNH CHÂN DUNG</label>
                                    <label className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1 mt-1">
                                        <Upload size={14} /> Tải ảnh lên
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Họ và Tên</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold outline-none uppercase text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Chức danh</label>
                                    <div className="flex items-center gap-2 border border-slate-200 rounded-lg focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 px-2.5 bg-white">
                                        <Briefcase size={16} className="text-slate-400 shrink-0" />
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full p-2.5 outline-none font-medium text-sm bg-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Tên Công Ty / Sàn Giao Dịch</label>
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-bold outline-none uppercase text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Số Điện Thoại</label>
                                        <div className="flex items-center gap-2 border border-slate-200 rounded-lg focus-within:border-blue-500 px-2.5 bg-white">
                                            <Smartphone size={16} className="text-slate-400 shrink-0" />
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full py-2 outline-none font-medium text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Email liên hệ</label>
                                        <div className="flex items-center gap-2 border border-slate-200 rounded-lg focus-within:border-blue-500 px-2.5 bg-white">
                                            <Mail size={16} className="text-slate-400 shrink-0" />
                                            <input
                                                type="text"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full py-2 outline-none font-medium text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Link Zalo (Tạo mã QR)</label>
                                    <div className="flex items-center gap-2 border border-slate-200 rounded-lg focus-within:border-blue-500 px-2.5 bg-white bg-blue-50/50">
                                        <QrCode size={16} className="text-blue-500 shrink-0" />
                                        <input
                                            type="text"
                                            value={formData.zalo}
                                            onChange={(e) => setFormData({ ...formData, zalo: e.target.value })}
                                            className="w-full py-2 outline-none font-medium text-sm bg-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Địa chỉ văn phòng / Khu vực</label>
                                    <div className="flex items-center gap-2 border border-slate-200 rounded-lg focus-within:border-blue-500 px-2.5 bg-white">
                                        <MapPin size={16} className="text-slate-400 shrink-0" />
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full py-2 outline-none font-medium text-sm bg-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Main Workspace */}
                <div className="flex-1 bg-slate-900 border-l border-slate-800 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                    <div className="flex items-center gap-2 mb-6 pointer-events-none">
                        {isLoading && <RefreshCw size={20} className="text-white animate-spin" />}
                        <p className="text-slate-400 font-medium">Bản xem trước Real-time • Tỷ lệ chuẩn In ấn 3.5 x 2 in</p>
                    </div>

                    <div
                        ref={containerRef}
                        className="w-full h-full max-w-[1050px] max-h-[600px] relative flex shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] bg-slate-800 rounded-sm"
                        style={{ aspectRatio: '1050 / 600' }}
                    >
                        {/* Auto-scales to fit container using JS */}
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                            <canvas ref={canvasRef} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardCreator;
