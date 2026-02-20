import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Stamp, LayoutTemplate, ArrowRight, Grid, Type, Brush, PlusCircle, Trash2 } from 'lucide-react';
import { generateId } from '../../utils/idGenerator';
import { useAuth } from '../../contexts/AuthContext';
import { optimizeImage } from '../../utils/imageUtils';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';

const MOCK_AVATAR = "https://i.pravatar.cc/150?img=11";

const QuickEditor = ({ onBack }: { onBack: () => void }) => {
    const { profile } = useAuth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [images, setImages] = useState<{ id: string, file: File, url: string }[]>([]);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [editMode, setEditMode] = useState<'watermark' | 'layout'>('watermark');
    const [isLoading, setIsLoading] = useState(false);

    // Active Selection State
    const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
    const [activeText, setActiveText] = useState("");
    const [activeColor, setActiveColor] = useState("#ffffff");
    const [activeFontSize, setActiveFontSize] = useState(24);

    // Watermark State (Global to all images if we do bulk export)
    const [watermark, setWatermark] = useState({
        text: profile?.phone ? `${profile.phone} - CHÍNH CHỦ` : 'BĐS CHÍNH CHỦ',
        opacity: 0.7,
        position: 'center' as 'center' | 'tl' | 'tr' | 'bl' | 'br' | 'tiled',
        color: '#ffffff',
        showBackground: true,
        bgColor: '#ef4444' // Red bg for strong CTA
    });

    const stickerPresets = [
        { label: '🔥 HOT', text: '🔥 HÀNG HOT DẬP LỬA', color: '#ffffff', bgColor: '#ef4444' },
        { label: '🏷️ CẮT LỖ', text: '🏷️ CẮT LỖ 30%', color: '#ffffff', bgColor: '#eab308' },
        { label: '📜 SỔ ĐỎ', text: '📜 SỔ HỒNG TRAO TAY', color: '#ffffff', bgColor: '#22c55e' },
        { label: '⚡ GẤP', text: '⚡ CHỦ CẦN TIỀN GẤP', color: '#ffffff', bgColor: '#f97316' },
        { label: '🏢 MẶT TIỀN', text: '🏢 MẶT TIỀN KINH DOANH', color: '#ffffff', bgColor: '#3b82f6' },
        { label: '💰 NGỘP', text: '💰 HÀNG NGỘP BANK', color: '#ffffff', bgColor: '#1e293b' },
    ];

    const initCanvas = useCallback(() => {
        if (!canvasRef.current) return;
        if (fabricCanvasRef.current) {
            fabricCanvasRef.current.dispose();
        }

        const canvas = new fabric.Canvas(canvasRef.current, {
            preserveObjectStacking: true,
            selection: true,
            backgroundColor: '#1e293b'
        });

        // Add Delete controls
        fabric.Object.prototype.controls.deleteControl = new fabric.Control({
            x: 0.5,
            y: -0.5,
            offsetY: -16,
            offsetX: 16,
            cursorStyle: 'pointer',
            mouseUpHandler: (eventData, transform) => {
                const target = transform.target;
                if (!target.canvas) return false;

                // If it's a group (like Avatar + Name), delete the whole group
                const parent = target.group || target;
                target.canvas.remove(parent);
                target.canvas.requestRenderAll();
                setActiveObject(null);
                return true;
            },
            render: (ctx, left, top, styleOverride, fabricObject) => {
                const size = 24;
                ctx.save();
                ctx.translate(left, top);
                ctx.beginPath();
                ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                ctx.fillStyle = '#ef4444';
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Draw X
                ctx.beginPath();
                ctx.moveTo(-4, -4);
                ctx.lineTo(4, 4);
                ctx.moveTo(4, -4);
                ctx.lineTo(-4, 4);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
            },
        });

        canvas.on('selection:created', (e) => handleSelection(e.selected?.[0]));
        canvas.on('selection:updated', (e) => handleSelection(e.selected?.[e.selected.length - 1]));
        canvas.on('selection:cleared', () => {
            setActiveObject(null);
        });

        // Key bindings for delete
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (canvas.getActiveObject()) {
                    // check if we are typing inside a textbox
                    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

                    const activeObjects = canvas.getActiveObjects();
                    if (activeObjects.length) {
                        canvas.discardActiveObject();
                        activeObjects.forEach((object) => {
                            canvas.remove(object);
                        });
                    }
                }
            }
        });

        fabricCanvasRef.current = canvas;
    }, []);

    const handleSelection = (obj: fabric.Object | undefined) => {
        if (!obj) return;
        setActiveObject(obj);

        if (obj.type === 'textbox' || obj.type === 'i-text') {
            setActiveText((obj as fabric.IText).text || "");
            setActiveColor((obj as fabric.IText).fill as string || "#ffffff");
            setActiveFontSize((obj as fabric.IText).fontSize || 24);
        } else if (obj.type === 'group') {
            // Find text inside group to edit
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const textObj = (obj as fabric.Group).getObjects().find((o: any) => o.type === 'textbox' || o.type === 'i-text');
            if (textObj) {
                setActiveText((textObj as fabric.IText).text || "");
                setActiveColor((textObj as fabric.IText).fill as string || "#ffffff");
            }
        }
    };

    // Initialize and resize canvas
    useEffect(() => {
        if (images.length > 0) {
            initCanvas();

            const handleResize = () => {
                if (containerRef.current && fabricCanvasRef.current) {
                    const { clientWidth, clientHeight } = containerRef.current;
                    if (clientWidth > 0 && clientHeight > 0) {
                        fabricCanvasRef.current.setDimensions({
                            width: clientWidth,
                            height: clientHeight
                        });
                        renderCurrentImage();
                    }
                }
            };

            window.addEventListener('resize', handleResize);
            // Initial setup - wait for DOM to settle
            const timeoutId = setTimeout(handleResize, 150);

            return () => {
                window.removeEventListener('resize', handleResize);
                clearTimeout(timeoutId);
            };
        }
    }, [initCanvas, images.length > 0]);

    // Render image khi có ảnh được chọn hoặc data ảnh thay đổi
    useEffect(() => {
        if (selectedImageId && fabricCanvasRef.current) {
            renderCurrentImage();
        }
    }, [selectedImageId, images]);

    const renderCurrentImage = () => {
        const canvas = fabricCanvasRef.current;
        const selectedImg = images.find(img => img.id === selectedImageId);

        if (!canvas || !selectedImg) return;
        setIsLoading(true);

        fabric.Image.fromURL(selectedImg.url, (img) => {
            if (!img) {
                console.error("Failed to load image");
                setIsLoading(false);
                return;
            }

            // Determine scale to fit canvas
            const canvasWidth = canvas.getWidth();
            const canvasHeight = canvas.getHeight();

            if (canvasWidth === 0 || canvasHeight === 0) {
                const container = containerRef.current;
                if (container && container.clientWidth > 0) {
                    canvas.setDimensions({
                        width: container.clientWidth,
                        height: container.clientHeight
                    });
                } else {
                    setIsLoading(false);
                    return;
                }
            }

            const currentCanvasWidth = canvas.getWidth();
            const currentCanvasHeight = canvas.getHeight();

            const scaleX = currentCanvasWidth / (img.width || 1);
            const scaleY = currentCanvasHeight / (img.height || 1);
            const scale = Math.min(scaleX, scaleY) * 0.95;

            img.set({
                scaleX: scale,
                scaleY: scale,
                originX: 'center',
                originY: 'center',
                left: currentCanvasWidth / 2,
                top: currentCanvasHeight / 2,
                selectable: false,
                evented: false
            });

            canvas.clear();
            canvas.setBackgroundColor('#1e293b', () => {
                canvas.add(img);
                img.sendToBack();

                if (editMode === 'watermark') {
                    applyWatermark(canvas, img);
                }

                canvas.renderAll();
                setIsLoading(false);
            });
        }, { crossOrigin: 'anonymous' });
    };

    // Auto-apply watermark when settings change
    useEffect(() => {
        if (editMode === 'watermark' && selectedImageId) {
            renderCurrentImage();
        }
    }, [watermark, editMode]);

    const applyWatermark = (canvas: fabric.Canvas, bgImg: fabric.Image) => {
        if (!bgImg.width || !bgImg.height || !bgImg.scaleX) return;

        const actualWidth = bgImg.width * bgImg.scaleX;
        const actualHeight = bgImg.height * (bgImg.scaleY || bgImg.scaleX);
        const originLeft = bgImg.left! - actualWidth / 2;
        const originTop = bgImg.top! - actualHeight / 2;

        if (watermark.position === 'tiled') {
            // Tiled Logic
            const textObj = new fabric.Text(watermark.text, {
                fontSize: actualWidth * 0.05,
                fill: watermark.color,
                opacity: watermark.opacity,
                fontWeight: 'bold',
                fontFamily: 'system-ui, sans-serif'
            });

            const patternSourceCanvas = new fabric.StaticCanvas(null, {
                width: textObj.width! * 1.5,
                height: textObj.height! * 2
            });
            textObj.set({ left: textObj.width! * 0.25, top: textObj.height! * 0.5, angle: -30 });
            patternSourceCanvas.add(textObj);
            patternSourceCanvas.renderAll();

            const patternCanvasEl = patternSourceCanvas.getElement() as HTMLCanvasElement;
            const imgEl = new Image();
            imgEl.src = patternCanvasEl.toDataURL('image/png');

            imgEl.onload = () => {
                const pattern = new fabric.Pattern({
                    source: imgEl,
                    repeat: 'repeat'
                });

                const overlay = new fabric.Rect({
                    left: originLeft,
                    top: originTop,
                    width: actualWidth,
                    height: actualHeight,
                    fill: pattern,
                    selectable: false,
                    evented: false,
                    opacity: watermark.opacity
                });
                canvas.add(overlay);
                canvas.renderAll();
            };

        } else {
            // Background capsule for better visibility
            const fontSize = actualWidth * 0.04;

            const textObj = new fabric.Text(watermark.text, {
                fontSize: fontSize,
                fill: watermark.color,
                fontWeight: 'bold',
                fontFamily: 'Inter, system-ui, sans-serif',
                originX: 'center',
                originY: 'center',
            });

            const padding = fontSize * 0.8;
            const bgRect = new fabric.Rect({
                width: textObj.width! + padding * 2,
                height: textObj.height! + padding,
                fill: watermark.bgColor,
                rx: fontSize * 0.5,
                ry: fontSize * 0.5,
                originX: 'center',
                originY: 'center',
                visible: watermark.showBackground
            });

            const group = new fabric.Group([bgRect, textObj], {
                opacity: watermark.opacity,
                selectable: true // Let them move it if they want
            });

            let left = originLeft;
            let top = originTop;
            const margin = actualWidth * 0.05;

            switch (watermark.position) {
                case 'center':
                    left = bgImg.left!;
                    top = bgImg.top!;
                    break;
                case 'tl':
                    left = originLeft + group.width! / 2 + margin;
                    top = originTop + group.height! / 2 + margin;
                    break;
                case 'tr':
                    left = originLeft + actualWidth - group.width! / 2 - margin;
                    top = originTop + group.height! / 2 + margin;
                    break;
                case 'bl':
                    left = originLeft + group.width! / 2 + margin;
                    top = originTop + actualHeight - group.height! / 2 - margin;
                    break;
                case 'br':
                    left = originLeft + actualWidth - group.width! / 2 - margin;
                    top = originTop + actualHeight - group.height! / 2 - margin;
                    break;
            }

            group.set({ left, top });
            canvas.add(group);
            canvas.bringToFront(group);
        }
    };

    // Feature: Add Frame
    const addFrame = (frameType: 'modern' | 'minimal') => {
        const canvas = fabricCanvasRef.current;
        const bgImg = canvas?.getObjects().find(o => o.type === 'image' && !o.selectable);
        if (!canvas || !bgImg) {
            toast.error('Vui lòng chọn ảnh trước');
            return;
        }

        const actualWidth = bgImg.width! * bgImg.scaleX!;
        const actualHeight = bgImg.height! * bgImg.scaleY!;
        const originLeft = bgImg.left! - actualWidth / 2;
        const originTop = bgImg.top! - actualHeight / 2;

        if (frameType === 'modern') {
            // Modern bottom gradient frame
            const gradient = new fabric.Gradient({
                type: 'linear',
                coords: { x1: 0, y1: 0, x2: 0, y2: actualHeight * 0.35 },
                colorStops: [
                    { offset: 0, color: 'transparent' },
                    { offset: 0.5, color: 'rgba(0,0,0,0.5)' },
                    { offset: 1, color: 'rgba(0,0,0,0.9)' }
                ]
            });

            const footer = new fabric.Rect({
                left: originLeft,
                top: originTop + actualHeight - (actualHeight * 0.35),
                width: actualWidth,
                height: actualHeight * 0.35,
                fill: gradient,
                selectable: false,
                evented: false
            });

            const title = new fabric.Textbox('Tiêu đề BĐS (Bấm để sửa)', {
                left: originLeft + 40,
                top: originTop + actualHeight - 120,
                width: actualWidth - 80,
                fontSize: actualWidth * 0.06,
                fill: '#ffffff',
                fontWeight: 'bold',
                fontFamily: 'Inter, sans-serif',
                shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 4, offsetX: 2, offsetY: 2 })
            });

            const price = new fabric.Textbox('Giá: 5.2 TỶ', {
                left: originLeft + 40,
                top: originTop + actualHeight - 50,
                fontSize: actualWidth * 0.05,
                fill: '#FFD700',
                fontWeight: '900',
                fontFamily: 'Inter, sans-serif',
                shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 4, offsetX: 2, offsetY: 2 })
            });

            canvas.add(footer, title, price);

        } else if (frameType === 'minimal') {
            // Minimalist border frame
            const border = new fabric.Rect({
                left: originLeft + 20,
                top: originTop + 20,
                width: actualWidth - 40,
                height: actualHeight - 40,
                fill: 'transparent',
                stroke: '#ffffff',
                strokeWidth: 4,
                selectable: false,
                evented: false,
                shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 4 })
            });

            const badge = new fabric.Rect({
                left: originLeft + 20,
                top: originTop + 20,
                width: actualWidth * 0.4,
                height: actualHeight * 0.1,
                fill: '#df1b1b',
                selectable: false
            });

            const text = new fabric.Textbox('CHÍNH CHỦ', {
                left: originLeft + 40,
                top: originTop + 20 + (actualHeight * 0.1) / 2 - (actualWidth * 0.04) / 2,
                fontSize: actualWidth * 0.04,
                fill: '#ffffff',
                fontWeight: 'bold',
                fontFamily: 'Inter, sans-serif'
            });

            canvas.add(border, badge, text);
        }

        canvas.renderAll();
        toast.success('Đã áp dụng mẫu Layout');
    };

    // Feature: Add Sticker
    const addSticker = (preset: typeof stickerPresets[0]) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const fontSize = 32;
        const text = new fabric.Text(preset.text, {
            fontSize: fontSize,
            fill: preset.color,
            fontWeight: 'bold',
            fontFamily: 'Inter, sans-serif',
            originX: 'center',
            originY: 'center',
        });

        const padding = 20;
        const bg = new fabric.Rect({
            width: text.width! + padding * 2,
            height: text.height! + padding,
            fill: preset.bgColor,
            rx: 8,
            ry: 8,
            originX: 'center',
            originY: 'center',
            shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.3)', blur: 10, offsetY: 4 })
        });

        const group = new fabric.Group([bg, text], {
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() / 2,
            originX: 'center',
            originY: 'center',
        });

        canvas.add(group);
        canvas.setActiveObject(group);
        canvas.renderAll();
    };

    // Feature: Add Realtor Avatar Badge
    const addAvatarBadge = () => {
        const canvas = fabricCanvasRef.current;
        const bgImg = canvas?.getObjects().find(o => o.type === 'image' && !o.selectable);
        if (!canvas || !bgImg) return;

        // @ts-ignore
        fabric.Image.fromURL(profile?.avatar_url || profile?.avatar || MOCK_AVATAR, (img) => {
            const avatarSize = 100;
            const scale = avatarSize / (img.width || 1);

            img.set({
                scaleX: scale,
                scaleY: scale,
                originX: 'center',
                originY: 'center',
                clipPath: new fabric.Circle({
                    radius: (img.width || 1) / 2,
                    originX: 'center',
                    originY: 'center',
                })
            });

            const border = new fabric.Circle({
                radius: avatarSize / 2 + 4,
                fill: 'transparent',
                stroke: '#ffffff',
                strokeWidth: 4,
                originX: 'center',
                originY: 'center',
                shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.3)', blur: 5 })
            });

            const nameCard = new fabric.Rect({
                width: 200,
                height: 50,
                fill: 'rgba(255, 255, 255, 0.95)',
                rx: 25,
                ry: 25,
                originX: 'left',
                originY: 'center',
                left: avatarSize / 2 - 20, // Overlap slightly
                shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.2)', blur: 5 })
            });

            const nameText = new fabric.Text(profile?.full_name || 'Đại lý BĐS', {
                fontSize: 16,
                fontWeight: 'bold',
                fill: '#1e293b',
                originX: 'left',
                originY: 'bottom',
                left: avatarSize / 2 + 10,
                top: 0
            });

            const phoneText = new fabric.Text(profile?.phone || '0909.xxx.xxx', {
                fontSize: 14,
                fontWeight: '600',
                fill: '#2563eb', // Trust blue
                originX: 'left',
                originY: 'top',
                left: avatarSize / 2 + 10,
                top: 2
            });

            const group = new fabric.Group([nameCard, nameText, phoneText, border, img], {
                left: bgImg.left! - (bgImg.width! * bgImg.scaleX!) / 2 + 40,
                top: bgImg.top! + (bgImg.height! * bgImg.scaleY!) / 2 - 80,
            });

            canvas.add(group);
            canvas.setActiveObject(group);
            canvas.renderAll();
            toast.success('Đã chèn Namecard');
        }, { crossOrigin: 'anonymous' });
    };

    // Update object property
    const updateActiveObject = (prop: string, value: any) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas || !activeObject) return;

        if (activeObject.type === 'textbox' || activeObject.type === 'i-text') {
            activeObject.set(prop as keyof fabric.Object, value);
        } else if (activeObject.type === 'group') {
            // Advanced: If it's a group (like a sticker), and we are editing text
            if (prop === 'text') {
                const textObj = (activeObject as fabric.Group).getObjects().find(o => o.type === 'textbox' || o.type === 'i-text' || o.type === 'text');
                if (textObj) {
                    textObj.set('text' as keyof fabric.Object, value);
                }
            } else if (prop === 'fill') {
                const bgObj = (activeObject as fabric.Group).getObjects().find(o => o.type === 'rect');
                if (bgObj) {
                    bgObj.set('fill', value);
                }
            }
        }

        canvas.requestRenderAll();
    };

    // Upload & Add 
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const toastId = toast.loading('Đang xử lý ảnh...');
        const newImages: Array<{ id: string, file: File, url: string }> = [];

        for (const file of Array.from(e.target.files)) {
            try {
                // Resize for UI performance
                const optUrl = await optimizeImage(file, 1920, 1920, 0.9);
                newImages.push({
                    id: Math.random().toString(36).substr(2, 9),
                    file,
                    url: optUrl
                });
            } catch (err) {
                console.error(err);
            }
        }

        if (newImages.length > 0) {
            setImages(prev => [...prev, ...newImages]);
            if (!selectedImageId) {
                setSelectedImageId(newImages[0].id);
            }
            toast.success(`Đã thêm ${newImages.length} ảnh`, { id: toastId });
        } else {
            toast.error('Lỗi khi tải ảnh', { id: toastId });
        }
    };

    const handleDownloadCurrent = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        // Find the background image to know crop bounds
        const bgImg = canvas.getObjects().find(o => o.type === 'image' && !o.selectable);
        if (!bgImg) return;

        const width = bgImg.width! * bgImg.scaleX!;
        const height = bgImg.height! * bgImg.scaleY!;
        const left = bgImg.left! - width / 2;
        const top = bgImg.top! - height / 2;

        const dataURL = canvas.toDataURL({
            format: 'jpeg',
            quality: 0.9,
            left,
            top,
            width,
            height
        });

        const link = document.createElement('a');
        link.download = `bds_pro_${Date.now()}.jpg`;
        link.href = dataURL;
        link.click();
        toast.success('Đã lưu ảnh sắc nét!');
    };

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
                <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 font-bold transition-colors">
                    <ArrowRight className="rotate-180" size={20} /> Studio Photo
                </button>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                        onClick={() => { setEditMode('watermark'); setActiveObject(null); }}
                        className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${editMode === 'watermark' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Stamp size={16} /> Đóng dấu Auto
                    </button>
                    <button
                        onClick={() => { setEditMode('layout'); renderCurrentImage(); }} // Re-render to clear pattern if switching
                        className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${editMode === 'layout' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Brush size={16} /> Thiết kế Tự do (Canva)
                    </button>
                </div>
                <div className="flex gap-3">
                    <label className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-blue-100 transition-all flex items-center gap-2 shadow-sm border border-blue-100">
                        <Upload size={16} /> Thêm ảnh
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                    </label>
                    <button onClick={handleDownloadCurrent} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-md">
                        <Download size={16} /> Lưu máy
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar Tools */}
                <div className="w-80 bg-white border-r border-slate-200 overflow-y-auto flex flex-col shadow-xl z-10">
                    {editMode === 'watermark' ? (
                        <div className="p-6 space-y-8">
                            <div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Stamp size={16} /> Chữ đóng dấu (Hàng loạt)
                                </h3>
                                <input
                                    type="text"
                                    value={watermark.text}
                                    onChange={(e) => setWatermark({ ...watermark, text: e.target.value })}
                                    className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all"
                                    placeholder="Ví dụ: BĐS CHÍNH CHỦ"
                                />
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <label className="text-sm font-bold text-slate-600">Độ mờ</label>
                                        <span className="text-blue-600 font-black">{(watermark.opacity * 100).toFixed(0)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.1" max="1" step="0.1"
                                        value={watermark.opacity}
                                        onChange={(e) => setWatermark({ ...watermark, opacity: parseFloat(e.target.value) })}
                                        className="w-full accent-blue-600"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-600 block mb-3">Vị trí chèn</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'tl', label: 'Góc Trái Trên' },
                                        { id: 'center', label: 'Chính Giữa' },
                                        { id: 'tr', label: 'Góc Phải Trên' },
                                        { id: 'bl', label: 'Góc Trái Dưới' },
                                        { id: 'tiled', label: 'Lặp Kín Ảnh' },
                                        { id: 'br', label: 'Góc Phải Dưới' },
                                    ].map(pos => (
                                        <button
                                            key={pos.id}
                                            onClick={() => setWatermark({ ...watermark, position: pos.id as any })}
                                            className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${watermark.position === pos.id ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-100 text-slate-500 hover:border-slate-300'}`}
                                        >
                                            {pos.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={watermark.showBackground} onChange={(e) => setWatermark({ ...watermark, showBackground: e.target.checked })} />
                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                                <span className="text-sm font-bold text-slate-700 mt-0.5">Hiển thị viền nền (Khuyên dùng cho ảnh rối)</span>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 space-y-8">
                            {/* Object Properties Panel (Shows when an object is selected) */}
                            {activeObject ? (
                                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 shadow-inner">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xs font-black text-purple-700 uppercase">Thuộc tính Object</h3>
                                        <button
                                            onClick={() => {
                                                fabricCanvasRef.current?.remove(activeObject);
                                                setActiveObject(null);
                                            }}
                                            className="text-red-500 p-1 hover:bg-red-100 rounded" title="Xóa"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {(activeObject.type === 'textbox' || activeObject.type === 'i-text' || activeObject.type === 'group') && (
                                            <>
                                                <div>
                                                    <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Nội dung Chữ</label>
                                                    <input
                                                        type="text"
                                                        value={activeText}
                                                        onChange={(e) => {
                                                            setActiveText(e.target.value);
                                                            updateActiveObject('text', e.target.value);
                                                        }}
                                                        className="w-full text-sm p-2 rounded border border-slate-300 outline-none focus:border-purple-500"
                                                    />
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Màu sắc</label>
                                                        <div className="flex shadow-sm rounded border border-slate-300 overflow-hidden bg-white p-1">
                                                            <input
                                                                type="color"
                                                                value={activeColor}
                                                                onChange={(e) => {
                                                                    setActiveColor(e.target.value);
                                                                    updateActiveObject('fill', e.target.value);
                                                                }}
                                                                className="w-8 h-8 rounded border-none cursor-pointer p-0"
                                                            />
                                                        </div>
                                                    </div>
                                                    {activeObject.type !== 'group' && (
                                                        <div className="flex-[2]">
                                                            <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Cỡ chữ: {activeFontSize}</label>
                                                            <input
                                                                type="range" min="10" max="120"
                                                                value={activeFontSize}
                                                                onChange={(e) => {
                                                                    setActiveFontSize(parseInt(e.target.value));
                                                                    updateActiveObject('fontSize', parseInt(e.target.value));
                                                                }}
                                                                className="w-full mt-2 accent-purple-600"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                        <p className="text-[10px] text-slate-400 italic text-center mt-2">Dùng phím Delete để xóa nhanh</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center">
                                    <p className="text-sm font-medium text-slate-400">👆 Chọn một thành phần trên ảnh để chỉnh sửa</p>
                                </div>
                            )}

                            <hr className="border-slate-100" />

                            {/* Templates */}
                            <div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <LayoutTemplate size={16} /> Bố cục Form (Templates)
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => addFrame('modern')}
                                        className="p-3 bg-white border border-slate-200 rounded-xl hover:border-purple-500 hover:shadow-md transition-all text-left group"
                                    >
                                        <div className="h-16 bg-slate-100 rounded-lg mb-2 relative overflow-hidden group-hover:bg-purple-50 transition-colors">
                                            <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-slate-800 to-transparent"></div>
                                            <div className="absolute bottom-1 left-2 w-2/3 h-1.5 bg-white/80 rounded"></div>
                                            <div className="absolute bottom-4 left-2 w-1/2 h-2 bg-white rounded"></div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">Footer Hiện đại</span>
                                    </button>
                                    <button
                                        onClick={() => addFrame('minimal')}
                                        className="p-3 bg-white border border-slate-200 rounded-xl hover:border-purple-500 hover:shadow-md transition-all text-left group"
                                    >
                                        <div className="h-16 bg-slate-100 rounded-lg mb-2 relative p-2 group-hover:bg-purple-50 transition-colors">
                                            <div className="w-full h-full border-2 border-slate-400 rounded"></div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">Khung Viền Nổi</span>
                                    </button>
                                </div>
                            </div>

                            {/* Pro Elements */}
                            <div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <PlusCircle size={16} /> Chèn Thành Phần Sale
                                </h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={addAvatarBadge}
                                        className="w-full p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl flex flex-col items-center justify-center hover:bg-blue-100 transition-colors"
                                    >
                                        <span className="font-bold text-sm">🪪 Chèn Namecard Môi Giới</span>
                                        <span className="text-xs opacity-70">Lấy Auto từ Profile của bạn</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            const canvas = fabricCanvasRef.current;
                                            if (!canvas) return;
                                            const text = new fabric.Textbox('DOUBLE CLICK ĐỂ SỬA', {
                                                left: canvas.getWidth() / 2, top: canvas.getHeight() / 2,
                                                fontSize: 40, fill: '#ffffff',
                                                fontFamily: 'Inter, sans-serif', fontWeight: 'bold',
                                                originX: 'center', originY: 'center',
                                                shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.8)', blur: 4 })
                                            });
                                            canvas.add(text);
                                            canvas.setActiveObject(text);
                                        }}
                                        className="w-full p-3 bg-white border border-slate-200 text-slate-700 rounded-xl flex items-center justify-center gap-2 hover:border-slate-400 transition-colors shadow-sm"
                                    >
                                        <Type size={16} /> <span className="font-bold text-sm">Thêm Tiêu Đề</span>
                                    </button>
                                </div>
                            </div>

                            {/* Stickers */}
                            <div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Grid size={16} /> Hút Mắt Client (Stickers)
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {stickerPresets.map((sticker, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => addSticker(sticker)}
                                            style={{ backgroundColor: sticker.bgColor }}
                                            className="p-3 border-none rounded-xl text-white hover:opacity-90 transition-opacity transform hover:scale-[1.02] active:scale-95 text-left shadow-sm"
                                        >
                                            <span className="font-black text-xs block truncate">{sticker.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                {/* Main Canvas Workspace */}
                <div className="flex-1 bg-slate-900 border-l border-slate-800 flex flex-col items-center justify-center p-8 relative">
                    {images.length === 0 ? (
                        <div className="text-center p-12 bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-700 max-w-md w-full">
                            <Upload size={64} className="mx-auto mb-6 text-slate-500" />
                            <h2 className="text-xl font-bold text-white mb-2">Workspace trống</h2>
                            <p className="text-slate-400 mb-8">Tải ảnh bất động sản lên để bắt đầu thiết kế ấn tượng</p>
                            <label className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/50">
                                Chọn ảnh từ máy tính
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                            </label>
                        </div>
                    ) : (
                        <div ref={containerRef} className="w-full h-full relative flex items-center justify-center bg-slate-800/30 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
                            {/* Fabric Canvas container */}
                            <canvas ref={canvasRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Thumbnail Strip (Bottom) */}
            {images.length > 0 && (
                <div className="h-28 bg-white border-t border-slate-200 flex items-center px-6 gap-4 overflow-x-auto select-none">
                    {images.map(img => (
                        <button
                            key={img.id}
                            onClick={() => setSelectedImageId(img.id)}
                            className={`relative min-w-[5rem] w-20 h-20 rounded-xl overflow-hidden transition-all shadow-sm group ${selectedImageId === img.id ? 'ring-4 ring-blue-500 ring-offset-2 scale-95 opacity-100 z-10' : 'opacity-60 hover:opacity-100 hover:scale-105'}`}
                        >
                            <img src={img.url} className="w-full h-full object-cover" alt="" />
                            {selectedImageId !== img.id && (
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                            )}
                        </button>
                    ))}
                    <label className="min-w-[5rem] w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer bg-slate-50">
                        <PlusCircle size={24} />
                        <span className="text-[10px] font-bold mt-1">Thêm</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                    </label>
                </div>
            )}
        </div>
    );
};

export default QuickEditor;
