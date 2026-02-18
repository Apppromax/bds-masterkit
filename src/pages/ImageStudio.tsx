
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Wand2, Sparkles, Stamp, Palette, ArrowRight, LayoutTemplate, RefreshCw } from 'lucide-react';
import { generateImageWithAI, analyzeImageWithGemini, generateContentWithAI } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import { generateId } from '../utils/idGenerator';

// --- SUB-COMPONENTS ---

const QuickEditor = ({ onBack }: { onBack: () => void }) => {
    const { profile } = useAuth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<{ id: string, file: File, url: string }[]>([]);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

    // Modes
    const [editMode, setEditMode] = useState<'watermark' | 'layout'>('watermark');

    // Watermark State
    const [watermark, setWatermark] = useState({
        text: profile?.phone || 'CHÍNH CHỦ',
        opacity: 0.5,
        position: 'center' as 'center' | 'tl' | 'tr' | 'bl' | 'br' | 'tiled',
        color: '#ffffff'
    });

    // Layout Elements State (Enhanced)
    type LayoutElement = {
        id: string;
        label: string;
        text: string;
        x: number; // percentage 0-1
        y: number; // percentage 0-1
        fontSize: number; // base size reference
        color: string;
        align: 'left' | 'center' | 'right';
        rotation: number; // degrees
        backgroundColor?: string;
        padding?: number;
        borderRadius?: number;
    };

    const presetLayouts: { id: string, name: string, elements: LayoutElement[] }[] = [
        {
            id: 'modern',
            name: 'Hiện đại (Góc dưới)',
            elements: [
                { id: 'title', label: 'Tiêu đề', text: 'BÁN GẤP / CHO THUÊ', x: 0.05, y: 0.8, fontSize: 6, color: '#ffffff', align: 'left', rotation: 0 },
                { id: 'price', label: 'Giá', text: 'GIÁ THỎA THUẬN', x: 0.95, y: 0.82, fontSize: 7, color: '#FFD700', align: 'right', rotation: 0 },
                { id: 'location', label: 'Địa chỉ', text: 'Vị trí đắc địa', x: 0.05, y: 0.86, fontSize: 4, color: '#ffffff', align: 'left', rotation: 0 },
                { id: 'area', label: 'Diện tích', text: '100m²', x: 0.95, y: 0.88, fontSize: 4, color: '#ffffff', align: 'right', rotation: 0 },
            ]
        },
        {
            id: 'center-focus',
            name: 'Tập trung (Giữa ảnh)',
            elements: [
                { id: 'title', label: 'Tiêu đề', text: 'SIÊU PHẨM MỚI', x: 0.5, y: 0.5, fontSize: 10, color: '#ffffff', align: 'center', rotation: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: 20, borderRadius: 10 },
                { id: 'price', label: 'Giá', text: 'LIÊN HỆ NGAY', x: 0.5, y: 0.65, fontSize: 8, color: '#FFD700', align: 'center', rotation: 0, backgroundColor: 'rgba(0,0,0,0.6)', padding: 15, borderRadius: 10 },
            ]
        },
        {
            id: 'minimal',
            name: 'Tối giản (Góc trên)',
            elements: [
                { id: 'price', label: 'Giá', text: '5 TỶ 200', x: 0.05, y: 0.1, fontSize: 8, color: '#FFD700', align: 'left', rotation: 0 },
                { id: 'area', label: 'Diện tích', text: '80m² - SỔ HỒNG RIÊNG', x: 0.05, y: 0.18, fontSize: 5, color: '#ffffff', align: 'left', rotation: 0 },
            ]
        }
    ];

    const ctaPresets = [
        { label: '📞 Gọi Ngay', text: `📞 ${profile?.phone || '0909.xxx.xxx'}`, color: '#ffffff', backgroundColor: '#ef4444', borderRadius: 20, padding: 12 }, // Red rounded
        { label: '💬 Zalo', text: `💬 Zalo: ${profile?.phone || '0909...'}`, color: '#0068ff', backgroundColor: '#ffffff', borderRadius: 20, padding: 12 }, // Zalo style
        { label: '🏠 Xem Nhà', text: '🏠 ĐĂNG KÝ XEM NHÀ', color: '#ffffff', backgroundColor: '#2563eb', borderRadius: 5, padding: 15 }, // Blue rect
        { label: '⚡ Chốt Cọc', text: '⚡ CHỐT CỌC NGAY', color: '#ffffff', backgroundColor: '#f59e0b', borderRadius: 50, padding: 15 }, // Orange pill
    ];

    const stickerPresets = [
        { label: '🔥 HOT', text: '🔥 HÀNG HOT', color: '#ffffff', backgroundColor: '#ef4444' }, // Red
        { label: '🏷️ GIẢM', text: '🏷️ GIẢM SỐC', color: '#ffffff', backgroundColor: '#eab308' }, // Yellow
        { label: '📜 SỔ', text: '📜 SỔ HỒNG RIÊNG', color: '#ffffff', backgroundColor: '#22c55e' }, // Green
        { label: '💎 VIP', text: '💎 VIP', color: '#ffffff', backgroundColor: '#a855f7' }, // Purple
        { label: '⚡ GẤP', text: '⚡ BÁN GẤP', color: '#ffffff', backgroundColor: '#f97316' }, // Orange
        { label: '🏫 TRƯỜNG', text: '🏫 GẦN TRƯỜNG', color: '#1e293b', backgroundColor: '#f1f5f9' }, // Slate
        { label: '🛒 CHỢ', text: '🛒 GẦN CHỢ', color: '#1e293b', backgroundColor: '#f1f5f9' },
        { label: '📞 LH', text: '📞 LH: 09...', color: '#ffffff', backgroundColor: '#2563eb' }, // Blue
    ];

    const [activeLayoutId, setActiveLayoutId] = useState<string>('modern');
    const [layoutElements, setLayoutElements] = useState<LayoutElement[]>(presetLayouts[0].elements);

    const applyLayout = (layoutId: string) => {
        const layout = presetLayouts.find(l => l.id === layoutId);
        if (layout) {
            setActiveLayoutId(layoutId);
            setLayoutElements(layout.elements.map(el => ({ ...el }))); // Copy elements
        }
    };


    const [selectedElId, setSelectedElId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    // Handle Upload
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files).map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                file,
                url: URL.createObjectURL(file)
            }));
            setImages(prev => [...prev, ...newImages]);
            if (!selectedImageId && newImages.length > 0) {
                setSelectedImageId(newImages[0].id);
            }
        }
    };

    useEffect(() => {
        const drawCanvas = () => {
            const canvas = canvasRef.current;
            const selectedImage = images.find(img => img.id === selectedImageId);
            if (!canvas || !selectedImage) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const img = new Image();
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // 1. Watermark Logic
                if (editMode === 'watermark') {
                    ctx.save();
                    ctx.globalAlpha = watermark.opacity;
                    ctx.fillStyle = watermark.color;
                    ctx.font = `bold ${canvas.width * 0.05}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const text = watermark.text;

                    if (watermark.position === 'center') {
                        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
                    } else if (watermark.position === 'tl') {
                        ctx.fillText(text, canvas.width * 0.15, canvas.height * 0.1);
                    } else if (watermark.position === 'tr') {
                        ctx.fillText(text, canvas.width * 0.85, canvas.height * 0.1);
                    } else if (watermark.position === 'bl') {
                        ctx.fillText(text, canvas.width * 0.15, canvas.height * 0.9);
                    } else if (watermark.position === 'br') {
                        ctx.fillText(text, canvas.width * 0.85, canvas.height * 0.9);
                    } else if (watermark.position === 'tiled') {
                        ctx.rotate(-Math.PI / 4);
                        for (let x = -canvas.width; x < canvas.width * 2; x += canvas.width * 0.3) {
                            for (let y = -canvas.height; y < canvas.height * 2; y += canvas.height * 0.2) {
                                ctx.fillText(text, x, y);
                            }
                        }
                    }
                    ctx.restore();
                }

                // 2. Layout Logic (Enhanced)
                if (editMode === 'layout') {
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

                    layoutElements.forEach(el => {
                        ctx.save();
                        const fontSize = (canvas.width * el.fontSize) / 100;
                        ctx.font = `bold ${fontSize}px Arial`;
                        ctx.fillStyle = el.color;
                        ctx.textAlign = el.align;
                        ctx.textBaseline = 'middle';

                        const x = el.x * canvas.width;
                        const y = el.y * canvas.height;

                        ctx.translate(x, y);
                        ctx.rotate((el.rotation * Math.PI) / 180);

                        // Draw Background if exists
                        if (el.backgroundColor) {
                            const metrics = ctx.measureText(el.text);
                            const textHeight = fontSize; // Approx
                            const padding = el.padding || 10;
                            const bgWidth = metrics.width + (padding * 2);
                            const bgHeight = textHeight + (padding * 1.5);

                            ctx.fillStyle = el.backgroundColor;

                            // Calculate centered bg position
                            let bgX = 0;
                            if (el.align === 'center') bgX = -bgWidth / 2;
                            if (el.align === 'right') bgX = -bgWidth;
                            if (el.align === 'left') bgX = 0;

                            const bgY = -bgHeight / 2;

                            // Rounded Rect
                            const r = el.borderRadius || 0;
                            ctx.beginPath();
                            ctx.roundRect(bgX, bgY, bgWidth, bgHeight, r);
                            ctx.fill();
                        }

                        ctx.shadowColor = 'rgba(0,0,0,0.5)';
                        ctx.shadowBlur = 4;
                        ctx.shadowOffsetX = 2;
                        ctx.shadowOffsetY = 2;

                        ctx.fillStyle = el.color; // Text color last
                        ctx.fillText(el.text, 0, 0);

                        if (selectedElId === el.id) {
                            const metrics = ctx.measureText(el.text);
                            ctx.strokeStyle = '#00ff00';
                            ctx.lineWidth = 2;
                            let textX = 0;
                            if (el.align === 'center') textX = -metrics.width / 2;
                            if (el.align === 'right') textX = -metrics.width;

                            ctx.strokeRect(textX - 5, -fontSize / 2 - 5, metrics.width + 10, fontSize + 10);
                        }
                        ctx.restore();
                    });
                }
            };
            img.src = selectedImage.url;
        };
        drawCanvas();
    }, [selectedImageId, watermark, layoutElements, editMode, images, selectedElId]);

    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (editMode !== 'layout') return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;

        const hitThreshold = 0.1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let clickedEl: any = null;
        let minDist = hitThreshold;

        layoutElements.forEach(el => {
            const dist = Math.sqrt(Math.pow(el.x - x, 2) + Math.pow(el.y - y, 2));
            if (dist < minDist) {
                minDist = dist;
                clickedEl = el;
            }
        });

        if (clickedEl) {
            setSelectedElId((clickedEl as { id: string }).id);
            setIsDragging(true);
            dragStart.current = { x, y };
        } else {
            setSelectedElId(null);
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDragging || !selectedElId || editMode !== 'layout') return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        const x = (clientX - rect.left) / rect.width;
        const y = (clientY - rect.top) / rect.height;

        setLayoutElements(prev => prev.map(el => {
            if (el.id === selectedElId) {
                return { ...el, x, y };
            }
            return el;
        }));
    };

    const handleCanvasMouseUp = () => { setIsDragging(false); };

    // Helper to update specific element
    const addSticker = (preset: typeof stickerPresets[0]) => {
        // eslint-disable-next-line react-hooks/purity
        const newId = generateId();
        const newElement: LayoutElement = {
            id: newId,
            label: 'Nhãn dán',
            text: preset.text,
            x: 0.5,
            y: 0.5,
            fontSize: 5,
            color: preset.color,
            align: 'center',
            rotation: 0,
            backgroundColor: preset.backgroundColor,
            padding: 15,
            borderRadius: 8
        };
        setLayoutElements(prev => [...prev, newElement]);
        setSelectedElId(newId);
    };

    const addCTA = (preset: typeof ctaPresets[0]) => {
        // eslint-disable-next-line react-hooks/purity
        const newId = generateId();
        const newElement: LayoutElement = {
            id: newId,
            label: 'Nút CTA',
            text: preset.text,
            x: 0.5,
            y: 0.9, // Bottom position
            fontSize: 6,
            color: preset.color,
            align: 'center',
            rotation: 0,
            backgroundColor: preset.backgroundColor,
            padding: preset.padding,
            borderRadius: preset.borderRadius
        };
        setLayoutElements(prev => [...prev, newElement]);
        setSelectedElId(newId);
    };

    const updateElement = (id: string, updates: Partial<LayoutElement>) => {
        setLayoutElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const removeElement = (id: string) => {
        setLayoutElements(prev => prev.filter(el => el.id !== id));
        if (selectedElId === id) setSelectedElId(null);
    };

    const activeElement = layoutElements.find(el => el.id === selectedElId);

    const handleDownloadCurrent = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = `edited_image_${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={onBack} className="text-slate-500 hover:text-slate-700 flex items-center gap-2">
                    <ArrowRight className="rotate-180" size={20} /> Quay lại
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => setEditMode('watermark')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${editMode === 'watermark' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                        <Stamp size={16} /> Đóng dấu
                    </button>
                    <button
                        onClick={() => setEditMode('layout')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${editMode === 'layout' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                    >
                        <LayoutTemplate size={16} /> Layout
                    </button>
                </div>
                <label className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-blue-100 transition-all flex items-center gap-2">
                    <Upload size={16} /> Thêm ảnh
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                {/* Controls */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-y-auto">
                    {editMode === 'watermark' ? (
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Nội dung đóng dấu</label>
                                <input
                                    type="text"
                                    value={watermark.text}
                                    onChange={(e) => setWatermark({ ...watermark, text: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Độ mờ: {(watermark.opacity * 100).toFixed(0)}%</label>
                                <input
                                    type="range"
                                    min="0.1" max="1" step="0.1"
                                    value={watermark.opacity}
                                    onChange={(e) => setWatermark({ ...watermark, opacity: parseFloat(e.target.value) })}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Vị trí</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['tl', 'center', 'tr', 'bl', 'tiled', 'br'].map(pos => (
                                        <button
                                            key={pos}
                                            onClick={() => setWatermark({ ...watermark, position: pos as 'center' | 'tl' | 'tr' | 'bl' | 'br' | 'tiled' })}
                                            className={`p-2 rounded-lg border text-xs font-bold capitalize ${watermark.position === pos ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-500'}`}
                                        >
                                            {pos}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Preset Selector */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Mẫu Layout có sẵn</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {presetLayouts.map(layout => (
                                        <button
                                            key={layout.id}
                                            onClick={() => applyLayout(layout.id)}
                                            className={`p-3 rounded-xl border text-left transition-all ${activeLayoutId === layout.id ? 'bg-purple-100 border-purple-500 ring-1 ring-purple-500' : 'bg-slate-50 border-slate-200 hover:border-purple-300'}`}
                                        >
                                            <span className={`block text-xs font-bold ${activeLayoutId === layout.id ? 'text-purple-700' : 'text-slate-600'}`}>{layout.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Sticker Selector */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Thêm nhãn dán HOT</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {stickerPresets.map((sticker, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => addSticker(sticker)}
                                            className="p-2 rounded-lg border border-slate-200 bg-white hover:border-purple-300 hover:bg-purple-50 transition-all text-xs font-bold text-slate-700 active:scale-95"
                                        >
                                            {sticker.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* CTA Selector */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Nút Kêu Gọi (CTA)</label>
                                    <span className="text-[10px] text-blue-500 bg-blue-50 px-2 py-1 rounded-full font-bold">Auto SĐT</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {ctaPresets.map((cta, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => addCTA(cta)}
                                            className="p-3 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            <span
                                                className="w-full text-center text-xs font-bold py-1.5 rounded"
                                                style={{ color: cta.color, backgroundColor: cta.backgroundColor, borderRadius: cta.borderRadius / 2 }}
                                            >
                                                {cta.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {!activeElement ? (
                                <div className="p-4 bg-purple-50 rounded-xl text-purple-700 text-sm font-medium text-center border border-purple-100">
                                    👆 Chọn thành phần trên ảnh để chỉnh sửa
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="text-xs font-black text-purple-600 uppercase">Đang chỉnh: {activeElement.label}</label>
                                        <div className="flex gap-2">
                                            <button onClick={() => removeElement(activeElement.id)} className="text-xs text-red-400 font-bold hover:text-red-600">Xóa lớp</button>
                                            <button onClick={() => setSelectedElId(null)} className="text-xs text-slate-400 font-bold hover:text-slate-600">Đóng</button>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <input
                                                type="text"
                                                value={activeElement.text}
                                                onChange={(e) => updateElement(activeElement.id, { text: e.target.value })}
                                                className="w-full p-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-bold block mb-1">Cỡ chữ</label>
                                                <input
                                                    type="range"
                                                    min="1" max="15" step="0.5"
                                                    value={activeElement.fontSize}
                                                    onChange={(e) => updateElement(activeElement.id, { fontSize: parseFloat(e.target.value) })}
                                                    className="w-full accent-purple-600"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] text-slate-400 font-bold block mb-1">Màu sắc</label>
                                                <input
                                                    type="color"
                                                    value={activeElement.color}
                                                    onChange={(e) => updateElement(activeElement.id, { color: e.target.value })}
                                                    className="w-full h-8 rounded border-none p-0 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-400 font-bold block mb-1">Xoay: {activeElement.rotation}°</label>
                                            <input
                                                type="range"
                                                min="-180" max="180" step="5"
                                                value={activeElement.rotation}
                                                onChange={(e) => updateElement(activeElement.id, { rotation: parseInt(e.target.value) })}
                                                className="w-full accent-purple-600"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="text-[10px] text-slate-400 font-bold">Nền chữ</label>
                                                {activeElement.backgroundColor && (
                                                    <button
                                                        onClick={() => updateElement(activeElement.id, { backgroundColor: undefined })}
                                                        className="text-[10px] text-red-500 hover:text-red-700"
                                                    >
                                                        Xóa nền
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={activeElement.backgroundColor || '#ffffff'}
                                                    onChange={(e) => updateElement(activeElement.id, { backgroundColor: e.target.value, padding: activeElement.padding || 10, borderRadius: activeElement.borderRadius || 5 })}
                                                    className="h-8 w-12 rounded border cursor-pointer"
                                                />
                                                {activeElement.backgroundColor && (
                                                    <input
                                                        type="range"
                                                        min="0" max="30"
                                                        value={activeElement.borderRadius || 0}
                                                        onChange={(e) => updateElement(activeElement.id, { borderRadius: parseInt(e.target.value) })}
                                                        className="flex-1 accent-purple-600"
                                                        title="Bo góc"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-100">
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Danh sách lớp</label>
                                <div className="space-y-2">
                                    {layoutElements.map(el => (
                                        <div
                                            key={el.id}
                                            onClick={() => setSelectedElId(el.id)}
                                            className={`p-3 rounded-lg border cursor-pointer flex justify-between items-center group ${selectedElId === el.id ? 'bg-purple-50 border-purple-300' : 'bg-white border-slate-200 hover:border-purple-300'}`}
                                        >
                                            <span className="text-sm font-medium text-slate-700">{el.label}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{el.id}</span>
                                            </div>
                                        </div>
                                    ))}

                                    {layoutElements.length === 0 && (
                                        <div className="text-center py-4 text-sm text-slate-400 italic">
                                            Chưa có thành phần nào. Chọn mẫu layout ở trên.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <button
                            onClick={handleDownloadCurrent}
                            className={`w-full py-4 rounded-xl font-black text-white shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all ${editMode === 'watermark' ? 'bg-blue-600 shadow-blue-500/30' : 'bg-purple-600 shadow-purple-500/30'}`}
                        >
                            <Download size={20} /> LƯU ẢNH VỀ MÁY
                        </button>
                    </div>
                </div>

                {/* Main Canvas Area */}
                <div className="lg:col-span-2 flex flex-col bg-slate-100 rounded-2xl p-4 overflow-hidden relative">
                    {images.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <Upload size={48} className="mb-4 text-slate-300" />
                            <p className="font-bold">Chưa có ảnh nào được chọn</p>
                            <label className="mt-4 bg-white text-slate-600 px-6 py-2 rounded-xl font-bold border border-slate-200 cursor-pointer hover:bg-slate-50 transition-all">
                                Tải ảnh lên ngay
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                            </label>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                                <canvas
                                    ref={canvasRef}
                                    className={`max-w-full max-h-full shadow-2xl rounded-lg ${editMode === 'layout' ? 'cursor-move' : ''}`}
                                    onMouseDown={handleCanvasMouseDown}
                                    onTouchStart={handleCanvasMouseDown}
                                    onMouseMove={handleCanvasMouseMove}
                                    onTouchMove={handleCanvasMouseMove}
                                    onMouseUp={handleCanvasMouseUp}
                                    onTouchEnd={handleCanvasMouseUp}
                                    onMouseLeave={handleCanvasMouseUp}
                                />
                            </div>
                            {/* Thumbnails */}
                            <div className="h-20 mt-4 flex gap-2 overflow-x-auto pb-2 px-2 scrollbar-hide">
                                {images.map(img => (
                                    <button
                                        key={img.id}
                                        onClick={() => setSelectedImageId(img.id)}
                                        className={`relative min-w-[3rem] w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImageId === img.id ? (editMode === 'watermark' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-purple-500 ring-2 ring-purple-200') : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={img.url} className="w-full h-full object-cover" alt="" />
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const AiStudio = ({ onBack }: { onBack: () => void }) => {
    // const { profile } = useAuth();
    const [mode, setMode] = useState<'enhance' | 'creator'>('enhance');
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState('');

    // Enhance State
    const [enhanceImage, setEnhanceImage] = useState<string | null>(null);
    const [enhancedResult, setEnhancedResult] = useState<string | null>(null);

    // Creator State
    const [creatorForm, setCreatorForm] = useState({
        type: 'Biệt thự hiện đại',
        context: 'Mặt tiền đường lớn, có vỉa hè rộng',
        lighting: 'Nắng sớm rực rỡ, bầu trời trong xanh',
        style: 'Hiện đại, sang trọng',
        extras: [] as string[]
    });
    const [createdImages, setCreatedImages] = useState<string[]>([]);

    const handleEnhanceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setEnhanceImage(ev.target?.result as string);
                setEnhancedResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const runEnhance = async () => {
        if (!enhanceImage) return;
        setProcessing(true);
        setStatus('Gemini đang phân tích bối cảnh...');

        try {
            // Updated logic to use Vision analysis first
            const prompt = await analyzeImageWithGemini(
                enhanceImage
            );

            if (prompt) {
                setStatus('Đang kiến tạo không gian sống mơ ước...');
                const newImg = await generateImageWithAI(prompt);
                if (newImg) {
                    setEnhancedResult(newImg);
                } else {
                    alert('Không thể tạo ảnh. Vui lòng thử lại.');
                }
            } else {
                alert('Không thể phân tích ảnh.');
            }
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra.');
        } finally {
            setProcessing(false);
        }
    };

    const runCreator = async () => {
        setProcessing(true);
        setStatus('Gemini đang phác thảo ý tưởng...');

        try {
            // Step 1: Generate Enhanced Prompt with AI
            let structuralFocus = "";
            const propertyType = creatorForm.type.toLowerCase();

            if (propertyType.includes('đất nền')) {
                structuralFocus = "Đây là DỰ ÁN ĐẤT NỀN PHÂN LÔ CHUYÊN NGHIỆP. Thể hiện rõ các lô đất trống đã được chia nhỏ theo ô bàn cờ. Phải có ranh giới rõ ràng giữa các lô bằng vỉa hè, vạch kẻ hoặc cọc mốc bê tông. Đất đã được san lấp bằng phẳng, sạch sẽ. Hạ tầng hoàn thiện gồm đường nhựa nội khu, bó vỉa hè, cột điện và hệ thống thoát nước. TUYỆT ĐỐI KHÔNG vẽ nhà cửa.";
            } else if (propertyType.includes('shophouse') || propertyType.includes('nhà phố')) {
                structuralFocus = "Tập trung vào mặt tiền kinh doanh (storefront) tầng trệt với kính cường lực lớn, biển hiệu sang trọng (nhưng không có chữ), vỉa hè rộng có người đi lại mua sắm. Kiến trúc đồng bộ, hiện đại và sầm uất.";
            } else if (propertyType.includes('căn hộ') || propertyType.includes('chung cư')) {
                structuralFocus = "Tập trung vào góc nhìn từ ban công hoặc phối cảnh tòa nhà cao tầng hiện đại. Sử dụng nhiều kính, ban công có cây xanh, ánh sáng ấm áp từ bên trong hắt ra. Thể hiện sự tiện nghi, cao cấp và view nhìn thoáng đạt.";
            } else if (propertyType.includes('biệt thự')) {
                structuralFocus = "Thể hiện sự sang trọng, đẳng cấp với cổng vào hoành tráng, sân vườn rộng rãi, sử dụng vật liệu đá và gỗ cao cấp. Nếu có hồ bơi, hãy làm nó trông thật trong xanh và lấp lánh.";
            } else if (propertyType.includes('resort')) {
                structuralFocus = "Không gian mở, hòa quyện với thiên nhiên. Tập trung vào các khu vực thư giãn ngoài trời, ánh sáng hoàng hôn lãng mạn, hồ bơi vô cực và cảnh quan xanh mát đặc thù.";
            }

            const contextPrompt = `
Bạn là một phóng viên ảnh bất động sản chuyên nghiệp, chuyên chụp ảnh thực tế hiện trường. Hãy tạo một Prompt tiếng Anh để mô tả bức ảnh chụp thực tế dựa trên:
- Loại hình: ${creatorForm.type} (Phong cách: ${creatorForm.style})
- Bối cảnh: ${creatorForm.context}
- Ánh sáng: ${creatorForm.lighting}
- Yếu tố bổ sung: ${creatorForm.extras.join(', ')}

Yêu cầu về phong cách báo chí:
${structuralFocus}
- Kỹ thuật chụp: Chụp bằng máy ảnh DSLR, ống kính góc rộng (wide-angle lens), độ nét cao nhưng tự nhiên. 
- Chất liệu: Bề mặt bê tông, đất, đá, gỗ phải có vân nhám thực tế. Cỏ cây có độ thưa thớt tự nhiên, không quá mượt mà.
- Ánh sáng: Sử dụng ánh sáng tự nhiên, đổ bóng thực (real shadows), không dùng hiệu ứng lấp lánh (bloom/glow) hay màu sắc quá bão hòa (oversaturated).
- Tuyệt đối TRÁNH: Tránh nhìn như render 3D, tránh nhìn như nhựa (plastic look), tránh hoạt hình hay tranh vẽ.

Yêu cầu kỹ thuật:
Trả về Prompt tiếng Anh gồm các từ khóa: 'raw photo', '8k uhd', 'natural texture', 'architectural photography', 'unprocessed', 'high dynamic range'. Chỉ trả về Prompt, không giải thích gì thêm.`;

            const enhancedPrompt = await generateContentWithAI(contextPrompt) || `Real estate photography of a ${creatorForm.type}, ${creatorForm.style} style. Context: ${creatorForm.context}. Lighting: ${creatorForm.lighting}. ${creatorForm.extras.join(', ')}. Photorealistic, 8k, high detail, architectural photography.`;

            // Step 2: Generate Images
            setStatus('Đang kiến tạo tổ ấm phù hợp phong thủy...');
            const results = [];
            // Generate 2 images for demo
            for (let i = 0; i < 2; i++) {
                const img = await generateImageWithAI(enhancedPrompt);
                if (img) results.push(img);
            }
            setCreatedImages(results);
        } catch (error) {
            console.error(error);
            alert('Lỗi tạo ảnh: ' + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setProcessing(false);
        }
    };

    // Toggle extra helper
    const toggleExtra = (item: string) => {
        if (creatorForm.extras.includes(item)) {
            setCreatorForm({ ...creatorForm, extras: creatorForm.extras.filter(i => i !== item) });
        } else {
            setCreatorForm({ ...creatorForm, extras: [...creatorForm.extras, item] });
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <button onClick={onBack} className="text-slate-500 hover:text-slate-700 flex items-center gap-2">
                    <ArrowRight className="rotate-180" size={20} /> Quay lại
                </button>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => setMode('enhance')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'enhance' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <Wand2 size={16} /> Nâng cấp ảnh (Enhance)
                    </button>
                    <button
                        onClick={() => setMode('creator')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'creator' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <Sparkles size={16} /> Sáng tạo mới (Creator)
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {mode === 'enhance' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-200 rounded-3xl h-64 flex flex-col items-center justify-center relative overflow-hidden group">
                                {enhanceImage ? (
                                    <img src={enhanceImage} className="w-full h-full object-cover" alt="Original" />
                                ) : (
                                    <>
                                        <Upload size={48} className="text-indigo-300 mb-4" />
                                        <p className="font-bold text-indigo-900">Tải ảnh thô / Đất nền</p>
                                        <p className="text-sm text-indigo-400">Hỗ trợ JPG, PNG</p>
                                    </>
                                )}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleEnhanceUpload} accept="image/*" />
                            </div>

                            <button
                                onClick={runEnhance}
                                disabled={!enhanceImage || processing}
                                className={`w-full py-4 rounded-2xl font-black text-white text-lg shadow-xl flex items-center justify-center gap-3 transition-all ${!enhanceImage || processing ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] shadow-indigo-500/30'}`}
                            >
                                {processing ? (
                                    <><RefreshCw className="animate-spin" /> {status}</>
                                ) : (
                                    <><Wand2 /> MAGIC ENHANCE - BIẾN ẢNH ĂN KHÁCH</>
                                )}
                            </button>

                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-700">
                                <strong>💡 Mẹo:</strong> Tải lên ảnh đất trống, nhà xây thô hoặc căn phòng cũ. AI sẽ tự động "trang điểm", thêm nội thất và tạo bối cảnh lung linh để thu hút khách hàng.
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-3xl overflow-hidden relative min-h-[400px] flex items-center justify-center border border-slate-800">
                            {enhancedResult ? (
                                <div className="relative w-full h-full">
                                    <img src={enhancedResult} className="w-full h-full object-contain" alt="Enhanced" />
                                    <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">AFTER</div>
                                    <a href={enhancedResult} download="enhanced_ai.png" className="absolute bottom-4 right-4 bg-white text-slate-900 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
                                        <Download size={16} /> Tải về
                                    </a>
                                </div>
                            ) : (
                                <div className="text-center">
                                    {processing ? (
                                        <div className="relative">
                                            <div className="w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                                            <p className="text-white font-bold animate-pulse text-lg">{status}</p>
                                        </div>
                                    ) : (
                                        <div className="text-slate-600">
                                            <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                                            <p>Kết quả sẽ hiển thị tại đây</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Loại hình BĐS</label>
                                <select
                                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                                    value={creatorForm.type}
                                    onChange={(e) => setCreatorForm({ ...creatorForm, type: e.target.value })}
                                >
                                    <option>Biệt thự sân vườn hiện đại</option>
                                    <option>Nhà phố thương mại (Shophouse)</option>
                                    <option>Căn hộ chung cư cao cấp</option>
                                    <option>Biệt thự nghỉ dưỡng (Resort)</option>
                                    <option>Đất nền phân lô</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Bối cảnh xung quanh</label>
                                <select
                                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                                    value={creatorForm.context}
                                    onChange={(e) => setCreatorForm({ ...creatorForm, context: e.target.value })}
                                >
                                    <option>Mặt tiền đường lớn sầm uất</option>
                                    <option>Ven sông thoáng mát, yên bình</option>
                                    <option>Cạnh công viên nhiều cây xanh</option>
                                    <option>Khu đô thị mới hiện đại</option>
                                    <option>Giữa rừng thông đồi dốc</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Phong cách kiến trúc</label>
                                <select
                                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-pink-500 bg-white font-bold text-indigo-600"
                                    value={creatorForm.style}
                                    onChange={(e) => setCreatorForm({ ...creatorForm, style: e.target.value })}
                                >
                                    <option>Hiện đại (Modern Luxury)</option>
                                    <option>Tân cổ điển (Neo-Classical)</option>
                                    <option>Tối giản (Minimalist)</option>
                                    <option>Indochine (Đông Dương)</option>
                                    <option>Địa Trung Hải (Mediterranean)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Thời điểm & Ánh sáng</label>
                                <select
                                    className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                                    value={creatorForm.lighting}
                                    onChange={(e) => setCreatorForm({ ...creatorForm, lighting: e.target.value })}
                                >
                                    <option>Nắng sớm rực rỡ (Morning)</option>
                                    <option>Hoàng hôn lãng mạn (Golden Hour)</option>
                                    <option>Ban đêm lung linh (Night)</option>
                                    <option>Trời nhiều mây nhẹ nhàng (Overcast)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Yếu tố bổ sung</label>
                                <div className="space-y-2">
                                    {['Xe hơi sang trọng', 'Hồ bơi vô cực', 'Sân vườn nhiều cây', 'Người đang đi dạo'].map(item => (
                                        <label key={item} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg">
                                            <input
                                                type="checkbox"
                                                checked={creatorForm.extras.includes(item)}
                                                onChange={() => toggleExtra(item)}
                                                className="rounded text-pink-500 focus:ring-pink-500"
                                            />
                                            <span className="text-sm font-medium">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={runCreator}
                                disabled={processing}
                                className={`w-full py-4 rounded-2xl font-black text-white text-lg shadow-xl flex items-center justify-center gap-3 transition-all ${processing ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:scale-[1.02] shadow-pink-500/30'}`}
                            >
                                {processing ? (
                                    <><RefreshCw className="animate-spin" /> {status}</>
                                ) : (
                                    <><Sparkles /> KHỞI TẠO PHỐI CẢNH AI</>
                                )}
                            </button>
                        </div>

                        {/* Results Grid */}
                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-[300px]">
                            {createdImages.length > 0 ? (
                                createdImages.map((img, idx) => (
                                    <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                                        <img src={img} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={`Result ${idx}`} />
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <a href={img} download={`ai_render_${idx}.png`} className="w-full py-2 bg-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-slate-100">
                                                <Download size={14} /> Tải ảnh
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full h-full border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                                    {processing ? (
                                        <div className="text-center">
                                            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                                            <p className="font-bold text-slate-600 animate-pulse">{status}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Palette size={48} className="mb-4 opacity-30" />
                                            <p>Nhập thông tin và nhấn "Khởi tạo" để xem kết quả</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function ImageStudio() {
    const [mode, setMode] = useState<'home' | 'quick' | 'ai'>('home');

    if (mode === 'home') {
        return (
            <div className="h-full flex items-center justify-center p-6 bg-slate-50/50">
                <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Mode 1 */}
                    <button
                        onClick={() => setMode('quick')}
                        className="group relative bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 border border-slate-100 transition-all duration-300 hover:-translate-y-2 text-left overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Stamp size={120} className="text-blue-600 rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                <StickerIcon size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Đóng Dấu & Layout</h2>
                            <p className="text-slate-500 font-medium leading-relaxed">
                                Xử lý hàng loạt ảnh nhanh chóng. Chèn logo, số điện thoại, thông số kỹ thuật (Giá, Diện tích) chuyên nghiệp.
                            </p>
                            <div className="mt-8 flex items-center gap-2 text-sm font-bold text-blue-600">
                                BẮT ĐẦU NGAY <ArrowRight size={16} />
                            </div>
                        </div>
                    </button>

                    {/* Mode 2 */}
                    <button
                        onClick={() => setMode('ai')}
                        className="group relative bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-purple-900/20 hover:shadow-2xl hover:shadow-purple-900/30 border border-slate-800 transition-all duration-300 hover:-translate-y-2 text-left overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles size={120} className="text-purple-400 -rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                                <Wand2 size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2 group-hover:text-purple-400 transition-colors">Sáng Tạo Phối Cảnh AI</h2>
                            <p className="text-slate-400 font-medium leading-relaxed">
                                Biến ảnh chụp thô thành tuyệt phẩm "ăn khách". Nâng cấp ánh sáng, thêm nội thất hoặc vẽ phối cảnh mới từ Zero.
                            </p>
                            <div className="mt-8 flex items-center gap-2 text-sm font-bold text-purple-400">
                                KHÁM PHÁ AI MAGIC <ArrowRight size={16} />
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'quick') return <QuickEditor onBack={() => setMode('home')} />;
    if (mode === 'ai') return <AiStudio onBack={() => setMode('home')} />;

    return null;
}

// Icon helper
const StickerIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
        <path d="M15 3v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h8" />
        <path d="M8 9h2" />
    </svg>
);
