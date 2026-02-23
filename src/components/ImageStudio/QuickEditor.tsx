import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Stamp, LayoutTemplate, ArrowRight, Grid, Type, Brush, PlusCircle, Trash2, Sparkles } from 'lucide-react';
import { generateId } from '../../utils/idGenerator';
import { useAuth } from '../../contexts/AuthContext';
import { optimizeImage } from '../../utils/imageUtils';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';

const MOCK_AVATAR = "https://i.pravatar.cc/150?img=11";

const QuickEditor = ({ onBack, initialTag }: { onBack: () => void, initialTag?: string | null }) => {
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
        bgColor: '#ef4444',
        logoUrl: null as string | null,
        layout: 'nametag' as 'classic' | 'modern_pill' | 'pro_banner' | 'nametag' | 'tag_orange' | 'tag_luxury' | 'tag_blue',
        manualScale: 1, // New: to remember manual scaling
    });

    const [manualObjects, setManualObjects] = useState<any[]>([]);

    const stickerPresets = [
        { label: '🔥 HOT', text: '🔥 HÀNG HOT DẬP LỬA', color: '#ffffff', bgColor: '#ef4444' },
        { label: '🏷️ CẮT LỖ', text: '🏷️ CẮT LỖ 30%', color: '#ffffff', bgColor: '#eab308' },
        { label: '📜 SỔ ĐỎ', text: '📜 SỔ HỒNG TRAO TAY', color: '#ffffff', bgColor: '#22c55e' },
        { label: '⚡ GẤP', text: '⚡ CHỦ CẦN TIỀN GẤP', color: '#ffffff', bgColor: '#f97316' },
        { label: '🏢 MẶT TIỀN', text: '🏢 MẶT TIỀN KINH DOANH', color: '#ffffff', bgColor: '#3b82f6' },
        { label: '💰 NGỘP', text: '💰 HÀNG NGỘP BANK', color: '#ffffff', bgColor: '#1e293b' },
    ];

    const adHeadlines = [
        { label: '3D Gold', style: 'gold_3d', text: 'SỞ HỮU NGAY CĂN HỘ BIỂN' },
        { label: 'Modern', style: 'modern_bold', text: 'CHIẾT KHẤU KHỦNG 30%' },
        { label: 'Urgent', style: 'urgent_red', text: 'CHỈ CÒN DUY NHẤT 2 CĂN' }
    ];

    const ctaButtons = [
        { label: 'Gold Pill', style: 'gold_pill', text: 'ĐĂNG KÝ NGAY!' },
        { label: 'Glass Pro', style: 'glass_pro', text: 'XEM CHI TIẾT' },
        { label: 'Call Now', style: 'call_red', text: 'GỌI NGAY: 0909...' }
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

        // Refine global selection handles (corners)
        fabric.Object.prototype.set({
            transparentCorners: false,
            cornerColor: '#f6b21b', // Gold theme
            cornerStrokeColor: '#ffffff',
            borderColor: '#f6b21b',
            cornerSize: 8,
            cornerStyle: 'circle',
            borderDashArray: [4, 4],
            padding: 5
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
                const size = 20; // Slightly smaller and cleaner
                ctx.save();
                ctx.translate(left, top);
                ctx.beginPath();
                ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                ctx.fillStyle = '#ef4444';
                ctx.fill();
                ctx.shadowBlur = 4;
                ctx.shadowColor = 'rgba(0,0,0,0.3)';
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Draw X
                ctx.beginPath();
                ctx.moveTo(-3, -3);
                ctx.lineTo(3, 3);
                ctx.moveTo(3, -3);
                ctx.lineTo(-3, 3);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
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

    const saveCanvasDecorations = useCallback(() => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const bgImg = canvas.getObjects().find(o => o.type === 'image' && !o.selectable);
        if (!bgImg) return;

        const actualWidth = bgImg.getScaledWidth();
        const actualHeight = bgImg.getScaledHeight();
        const originLeft = bgImg.left! - actualWidth / 2;
        const originTop = bgImg.top! - actualHeight / 2;

        const objectsToSave = canvas.getObjects().filter(o => o.selectable && !o.get('isWatermark' as any)).map(o => {
            const json = o.toObject(['id', 'isFrame']);
            // Normalize coordinates relative to background top-left
            return {
                ...json,
                relLeft: (o.left! - originLeft) / actualWidth,
                relTop: (o.top! - originTop) / actualHeight,
                relScaleX: o.scaleX! / actualWidth,
                relScaleY: o.scaleY! / actualWidth // Scale relative to width for proportionality
            };
        });

        // Also save watermark manual scale if any
        const wm = canvas.getObjects().find((o: any) => o.isWatermark) as fabric.Group;
        if (wm) {
            setWatermark(prev => ({ ...prev, manualScale: wm.scaleX || 1 }));
        }

        setManualObjects(objectsToSave);
    }, []);

    // Initialize and resize canvas
    useEffect(() => {
        if (images.length > 0) {
            initCanvas();

            const canvas = fabricCanvasRef.current;
            if (canvas) {
                const handleUpdate = () => {
                    // Update watermark global position if moved to extreme corners
                    // For now just triggered save on any modification
                    saveCanvasDecorations();
                };
                canvas.on('object:modified', handleUpdate);
                canvas.on('object:added', handleUpdate);
                canvas.on('object:removed', handleUpdate);
            }

            const handleResize = () => {
                if (containerRef.current && fabricCanvasRef.current) {
                    renderCurrentImage();
                }
            };

            window.addEventListener('resize', handleResize);
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

    // Handle initial tag from Identity module
    useEffect(() => {
        if (initialTag && fabricCanvasRef.current && selectedImageId) {
            const canvas = fabricCanvasRef.current;
            fabric.Image.fromURL(initialTag, (img) => {
                const scale = 300 / (img.width || 1);
                img.set({
                    scaleX: scale,
                    scaleY: scale,
                    left: canvas.getWidth() / 2,
                    top: canvas.getHeight() / 2,
                    originX: 'center',
                    originY: 'center',
                    shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.3)', blur: 15, offsetY: 5 })
                });
                canvas.add(img);
                canvas.setActiveObject(img);
                canvas.renderAll();
                toast.success('Đã gắn Thẻ định danh!');
            }, { crossOrigin: 'anonymous' });
        }
    }, [initialTag, selectedImageId]);

    const renderCurrentImage = () => {
        const canvas = fabricCanvasRef.current;
        const container = containerRef.current;
        const selectedImg = images.find(img => img.id === selectedImageId);

        if (!canvas || !selectedImg || !container) return;
        setIsLoading(true);

        fabric.Image.fromURL(selectedImg.url, (img) => {
            if (!img) {
                console.error("Failed to load image");
                setIsLoading(false);
                return;
            }

            // Determine scale to fit container bounds
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;

            if (containerWidth === 0 || containerHeight === 0) {
                setIsLoading(false);
                return;
            }

            const scaleX = containerWidth / (img.width || 1);
            const scaleY = containerHeight / (img.height || 1);
            const scale = Math.min(scaleX, scaleY); // 1.0 to fit exactly

            const finalWidth = (img.width || 1) * scale;
            const finalHeight = (img.height || 1) * scale;

            // Set canvas size to exactly match scaled image
            canvas.setDimensions({
                width: finalWidth,
                height: finalHeight
            });

            img.set({
                scaleX: scale,
                scaleY: scale,
                originX: 'center',
                originY: 'center',
                left: finalWidth / 2,
                top: finalHeight / 2,
                selectable: false,
                evented: false
            });

            canvas.clear();
            // Optional: transparent or matching background
            canvas.setBackgroundColor('transparent', async () => {
                canvas.add(img);
                img.sendToBack();

                const watermarkGroup = await generateWatermarkGroup(canvas, img);
                if (watermarkGroup) {
                    // @ts-ignore
                    if (watermark.manualScale && watermark.manualScale !== 1) {
                        watermarkGroup.scale(watermark.manualScale);
                    }
                    canvas.add(watermarkGroup);
                    canvas.bringToFront(watermarkGroup);
                }

                // Re-apply manual objects (stickers, headlines)
                if (manualObjects.length > 0) {
                    const actualWidth = img.getScaledWidth();
                    const actualHeight = img.getScaledHeight();
                    const originLeft = img.left! - actualWidth / 2;
                    const originTop = img.top! - actualHeight / 2;

                    fabric.util.enlivenObjects(manualObjects, (enlivened: fabric.Object[]) => {
                        enlivened.forEach((obj, idx) => {
                            const data = manualObjects[idx];
                            obj.set({
                                left: originLeft + (data.relLeft || 0) * actualWidth,
                                top: originTop + (data.relTop || 0) * actualHeight,
                                scaleX: (data.relScaleX || 1) * actualWidth,
                                scaleY: (data.relScaleY || 1) * actualWidth
                            });
                            canvas.add(obj);
                        });
                        canvas.renderAll();
                    }, 'fabric');
                }

                canvas.renderAll();
                setIsLoading(false);
            });
        }, { crossOrigin: 'anonymous' });
    };

    const generateWatermarkGroup = async (canvas: fabric.Canvas, bgImg: fabric.Image): Promise<fabric.Group | null> => {
        if (!bgImg.width || !bgImg.height || !bgImg.scaleX) return null;

        const actualWidth = bgImg.width! * bgImg.scaleX!;
        const actualHeight = bgImg.height! * (bgImg.scaleY || bgImg.scaleX!);
        const originLeft = bgImg.left! - actualWidth / 2;
        const originTop = bgImg.top! - actualHeight / 2;

        const fontSize = actualWidth * 0.035;
        const elements: fabric.Object[] = [];

        if (watermark.layout === 'nametag') {
            const avatarSize = actualWidth * 0.14;
            const cardWidth = avatarSize * 2.8;
            const cardHeight = avatarSize * 0.52;

            const nameCard = new fabric.Rect({
                width: cardWidth,
                height: cardHeight,
                fill: 'rgba(255, 255, 255, 0.98)',
                rx: cardHeight / 2,
                ry: cardHeight / 2,
                originX: 'left',
                originY: 'center',
                left: 0,
                top: 0,
                shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.2)', blur: 15, offsetY: 5 }),
                visible: watermark.showBackground
            });

            const accent = new fabric.Rect({
                width: 6,
                height: cardHeight * 0.6,
                fill: '#f6b21b',
                rx: 3,
                ry: 3,
                left: avatarSize * 0.65,
                top: 0,
                originX: 'center',
                originY: 'center'
            });

            const nameText = new fabric.Text((profile?.full_name || 'Đại lý BĐS').toUpperCase(), {
                fontSize: cardHeight * 0.35,
                fontWeight: '900',
                fontFamily: 'Be Vietnam Pro',
                fill: '#1e293b',
                originX: 'left',
                originY: 'bottom',
                left: avatarSize * 0.8,
                top: -2
            });

            const phoneText = new fabric.Text(profile?.phone || '09xx.xxx.xxx', {
                fontSize: cardHeight * 0.32,
                fontWeight: '900',
                fontFamily: 'Be Vietnam Pro',
                fill: '#2563eb',
                originX: 'left',
                originY: 'top',
                left: avatarSize * 0.8,
                top: 2
            });

            const avatarImg: fabric.Image | null = await new Promise((resolve) => {
                fabric.Image.fromURL(profile?.avatar_url || profile?.avatar || MOCK_AVATAR, (img) => {
                    const scale = avatarSize / (img.width || 1);
                    img.set({
                        scaleX: scale, scaleY: scale,
                        originX: 'center', originY: 'center',
                        left: 10, top: 0,
                        clipPath: new fabric.Circle({
                            radius: (img.width || 1) / 2,
                            originX: 'center', originY: 'center',
                        })
                    });
                    resolve(img);
                }, { crossOrigin: 'anonymous' });
            });

            elements.push(nameCard, accent, nameText, phoneText);
            if (avatarImg) {
                const border = new fabric.Circle({
                    radius: avatarSize / 2 + 2,
                    left: 10, top: 0,
                    fill: 'transparent',
                    stroke: '#ffffff', strokeWidth: 3,
                    originX: 'center', originY: 'center',
                    shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.2)', blur: 5 })
                });
                elements.unshift(border, avatarImg);
            }
        } else if (watermark.layout.startsWith('tag_')) {
            const tagW = 450;
            const tagH = 130;
            const tagScale = (actualWidth * 0.35) / tagW;
            const tagElements: fabric.Object[] = [];

            if (watermark.layout === 'tag_orange') {
                const primary = '#f6b21b';
                tagElements.push(new fabric.Rect({ width: tagW, height: tagH, fill: '#ffffff', rx: tagH / 2, ry: tagH / 2, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.15)', blur: 20, offsetY: 8 }), originX: 'center', originY: 'center', left: 0, top: 0 }));
                tagElements.push(new fabric.Circle({ radius: 55, fill: primary, left: 65 - tagW / 2, top: 65 - tagH / 2, originX: 'center', originY: 'center' }));
                const avatar: fabric.Image | null = await new Promise((resolve) => {
                    fabric.Image.fromURL(profile?.avatar_url || profile?.avatar || MOCK_AVATAR, (img) => {
                        const s = 104 / (img.width || 1);
                        img.set({ scaleX: s, scaleY: s, left: 65 - tagW / 2, top: 65 - tagH / 2, originX: 'center', originY: 'center', clipPath: new fabric.Circle({ radius: (img.width || 1) / 2, originX: 'center', originY: 'center' }) });
                        resolve(img);
                    }, { crossOrigin: 'anonymous' });
                });
                if (avatar) tagElements.push(avatar);
                const textLeft = 145 - tagW / 2;
                tagElements.push(new fabric.Text((profile?.full_name || 'ĐẠI LÝ BĐS').toUpperCase(), { left: textLeft, top: 22 - tagH / 2, fontSize: 24, fontWeight: '900', fill: '#1a1a1a', fontFamily: 'Montserrat' }));
                tagElements.push(new fabric.Text((profile?.job_title || 'MÔI GIỚI TẬN TÂM').toUpperCase(), { left: textLeft, top: 52 - tagH / 2, fontSize: 13, fill: '#64748b', fontWeight: '800', fontFamily: 'Inter', charSpacing: 50 }));
                tagElements.push(new fabric.Text('HOTLINE: ' + (profile?.phone || '09xx.xxx.xxx'), { left: textLeft, top: 72 - tagH / 2, fontSize: 15, fill: '#1a1a1a', fontWeight: '800', fontFamily: 'Inter' }));
                tagElements.push(new fabric.Text((profile?.agency || 'CENLAND GROUP').toUpperCase(), { left: textLeft, top: 96 - tagH / 2, fontSize: 10, fill: primary, fontWeight: '900', fontFamily: 'Inter', charSpacing: 100 }));
            }
            else if (watermark.layout === 'tag_luxury') {
                const gold = '#c5a059';
                tagElements.push(new fabric.Rect({ width: tagW, height: tagH, fill: '#0a0a0a', rx: 12, ry: 12, stroke: gold, strokeWidth: 2, shadow: new fabric.Shadow({ color: 'rgba(197, 160, 89, 0.4)', blur: 30, offsetY: 10 }), originX: 'center', originY: 'center', left: 0, top: 0 }));
                tagElements.push(new fabric.Rect({ width: tagW - 40, height: 3, fill: gold, left: 20 - tagW / 2, top: (tagH - 15) - tagH / 2, rx: 1.5, originX: 'left' }));
                tagElements.push(new fabric.Path('M 75 25 L 110 45 L 110 85 L 75 105 L 40 85 L 40 45 Z', { fill: 'transparent', stroke: gold, strokeWidth: 1.5, left: 75 - tagW / 2, top: 65 - tagH / 2, originX: 'center', originY: 'center' }));
                const avatar: fabric.Image | null = await new Promise((resolve) => {
                    fabric.Image.fromURL(profile?.avatar_url || profile?.avatar || MOCK_AVATAR, (img) => {
                        const s = 104 / (img.width || 1);
                        img.set({ scaleX: s, scaleY: s, left: 75 - tagW / 2, top: 65 - tagH / 2, originX: 'center', originY: 'center', clipPath: new fabric.Circle({ radius: (img.width || 1) / 2, originX: 'center', originY: 'center' }) });
                        resolve(img);
                    }, { crossOrigin: 'anonymous' });
                });
                if (avatar) tagElements.push(avatar);
                const textLeft = 160 - tagW / 2;
                tagElements.push(new fabric.Text((profile?.full_name || 'ĐẠI LÝ BĐS').toUpperCase(), { left: textLeft, top: 22 - tagH / 2, fontSize: 24, fontWeight: '900', fill: gold, fontFamily: 'Montserrat', charSpacing: 50 }));
                tagElements.push(new fabric.Text((profile?.job_title || 'MÔI GIỚI TẬN TÂM').toUpperCase(), { left: textLeft, top: 52 - tagH / 2, fontSize: 10, fill: gold, fontWeight: '800', fontFamily: 'Inter', charSpacing: 100, opacity: 0.7 }));
                tagElements.push(new fabric.Rect({ left: textLeft, top: 70 - tagH / 2, width: tagW - (textLeft + tagW / 2) - 40, height: 1, fill: gold, opacity: 0.2 }));
                tagElements.push(new fabric.Text('HOTLINE: ' + (profile?.phone || '09xx.xxx.xxx'), { left: textLeft, top: 80 - tagH / 2, fontSize: 15, fill: '#ffffff', fontWeight: '800', fontFamily: 'Inter', charSpacing: 50 }));
            }
            else if (watermark.layout === 'tag_blue') {
                const primaryBlue = '#0984e3';
                tagElements.push(new fabric.Rect({ width: tagW, height: tagH, fill: '#ffffff', rx: 65, ry: 65, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.1)', blur: 15, offsetY: 5 }), originX: 'center', originY: 'center', left: 0, top: 0 }));
                tagElements.push(new fabric.Rect({ width: 4, height: 60, fill: primaryBlue, left: 140 - tagW / 2, top: 35 - tagH / 2, rx: 2, ry: 2, originX: 'left' }));
                const avatar: fabric.Image | null = await new Promise((resolve) => {
                    fabric.Image.fromURL(profile?.avatar_url || profile?.avatar || MOCK_AVATAR, (img) => {
                        const s = 110 / (img.width || 1);
                        img.set({ scaleX: s, scaleY: s, left: 75 - tagW / 2, top: 65 - tagH / 2, originX: 'center', originY: 'center', clipPath: new fabric.Circle({ radius: (img.width || 1) / 2, originX: 'center', originY: 'center' }) });
                        resolve(img);
                    }, { crossOrigin: 'anonymous' });
                });
                if (avatar) tagElements.push(avatar);
                const textLeft = 165 - tagW / 2;
                tagElements.push(new fabric.Text((profile?.full_name || 'ĐẠI LÝ BĐS').toUpperCase(), { left: textLeft, top: 18 - tagH / 2, fontSize: 24, fontWeight: '900', fill: '#2d3436', fontFamily: 'Montserrat' }));
                tagElements.push(new fabric.Text((profile?.job_title || 'MÔI GIỚI TẬN TÂM').toUpperCase(), { left: textLeft, top: 50 - tagH / 2, fontSize: 12, fill: '#636e72', fontWeight: '800', fontFamily: 'Inter', charSpacing: 50 }));
                tagElements.push(new fabric.Text('Zalo: ' + (profile?.phone || '09xx.xxx.xxx'), { left: textLeft, top: 72 - tagH / 2, fontSize: 18, fill: '#2d3436', fontWeight: '800', fontFamily: 'Inter' }));
                tagElements.push(new fabric.Text((profile?.agency || 'CENLAND GROUP').toUpperCase(), { left: textLeft, top: 100 - tagH / 2, fontSize: 9, fill: primaryBlue, fontWeight: '900', charSpacing: 100 }));
            }

            tagElements.forEach(obj => {
                obj.set({ scaleX: (obj.scaleX || 1) * tagScale, scaleY: (obj.scaleY || 1) * tagScale, left: (obj.left || 0) * tagScale, top: (obj.top || 0) * tagScale });
                elements.push(obj);
            });


            const textObj = new fabric.Text(watermark.text, {
                fontSize: fontSize,
                fill: watermark.color,
                fontWeight: 'bold',
                fontFamily: 'Be Vietnam Pro',
                originX: 'center',
                originY: 'center',
            });

            if (watermark.layout === 'modern_pill') {
                const padding = fontSize * 0.8;
                const totalWidth = textObj.width! + padding * 2;
                const totalHeight = textObj.height! + padding;
                const bgRect = new fabric.Rect({
                    width: totalWidth, height: totalHeight,
                    fill: watermark.bgColor, rx: totalHeight / 2, ry: totalHeight / 2,
                    originX: 'center', originY: 'center',
                    visible: watermark.showBackground
                });
                elements.push(bgRect, textObj);
            } else if (watermark.layout === 'pro_banner') {
                const bannerHeight = actualHeight * 0.08;
                const bgRect = new fabric.Rect({
                    width: actualWidth, height: bannerHeight,
                    fill: watermark.bgColor, opacity: 0.8,
                    originX: 'center', originY: 'center',
                    left: 0, top: 0
                });
                textObj.set({ fontSize: bannerHeight * 0.4, fill: '#ffffff' });
                elements.push(bgRect, textObj);
            } else {
                const padding = fontSize * 0.5;
                const bgRect = new fabric.Rect({
                    width: textObj.width! + padding * 2, height: textObj.height! + padding,
                    fill: watermark.bgColor, rx: 4, ry: 4,
                    originX: 'center', originY: 'center',
                    visible: watermark.showBackground
                });
                elements.push(bgRect, textObj);
            }
        }

        const group = new fabric.Group(elements, {
            opacity: watermark.opacity,
            selectable: true,
            originX: 'center',
            originY: 'center',
            // @ts-ignore
            isWatermark: true
        });

        group.setCoords();
        const gw = group.getScaledWidth();
        const gh = group.getScaledHeight();

        let left = bgImg.left!;
        let top = bgImg.top!;
        const margin = actualWidth * 0.05;

        switch (watermark.position) {
            case 'tl': left = originLeft + gw / 2 + margin; top = originTop + gh / 2 + margin; break;
            case 'tr': left = originLeft + actualWidth - gw / 2 - margin; top = originTop + gh / 2 + margin; break;
            case 'bl': left = originLeft + gw / 2 + margin; top = originTop + actualHeight - gh / 2 - margin; break;
            case 'br': left = originLeft + actualWidth - gw / 2 - margin; top = originTop + actualHeight - gh / 2 - margin; break;
        }

        group.set({ left, top });
        return group;
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
            // Create gradient
            const gradient = new fabric.Gradient({
                type: 'linear',
                coords: { x1: 0, y1: 0, x2: 0, y2: actualHeight * 0.35 },
                colorStops: [
                    { offset: 0, color: 'rgba(0,0,0,0.8)' },
                    { offset: 1, color: 'rgba(0,0,0,0)' }
                ]
            });

            const overlay = new fabric.Rect({
                left: originLeft,
                top: originTop,
                width: actualWidth,
                height: actualHeight * 0.35,
                fill: gradient,
                selectable: false,
                evented: false,
                // @ts-ignore
                isFrame: true
            });

            const bar = new fabric.Rect({
                left: originLeft,
                top: originTop + actualHeight - 80,
                width: actualWidth,
                height: 80,
                fill: '#1e293b',
                selectable: false,
                // @ts-ignore
                isFrame: true
            });

            const title = new fabric.Textbox('Tiêu đề BĐS (Bấm để sửa)', {
                left: originLeft + 40,
                top: originTop + actualHeight - 120,
                width: actualWidth - 80,
                fontSize: actualWidth * 0.06,
                fill: '#ffffff',
                fontWeight: 'bold',
                fontFamily: 'Be Vietnam Pro, sans-serif',
                shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 4, offsetX: 2, offsetY: 2 }),
                // @ts-ignore
                isFrame: true
            });

            const price = new fabric.Textbox('Giá: 5.2 TỶ', {
                left: originLeft + 40,
                top: originTop + actualHeight - 50,
                fontSize: actualWidth * 0.05,
                fill: '#FFD700',
                fontWeight: '900',
                fontFamily: 'Be Vietnam Pro, sans-serif',
                shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 4, offsetX: 2, offsetY: 2 }),
                // @ts-ignore
                isFrame: true
            });

            canvas.add(overlay, bar, title, price);

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
                fontFamily: 'Be Vietnam Pro, sans-serif'
            });

            // Mark as frame
            border.set('isFrame' as any, true);
            badge.set('isFrame' as any, true);
            text.set('isFrame' as any, true);

            canvas.add(border, badge, text);
        }

        canvas.renderAll();
        toast.success('Đã áp dụng mẫu Layout');
    };

    const removeFrame = () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;
        const objects = canvas.getObjects().filter((o: any) => o.isFrame);
        objects.forEach(o => canvas.remove(o));
        canvas.renderAll();
        toast.success("Đã gỡ bỏ bố cục");
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
            fontFamily: 'Be Vietnam Pro, sans-serif',
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

    const addAdHeadline = (preset: typeof adHeadlines[0]) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        let options: any = {
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() * 0.2,
            width: Math.min(600, canvas.getWidth() * 0.8),
            fontSize: 56,
            fontWeight: '900',
            fontFamily: 'Be Vietnam Pro',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
            charSpacing: -20
        };

        if (preset.style === 'gold_3d') {
            options = {
                ...options,
                fill: new fabric.Gradient({
                    type: 'linear',
                    coords: { x1: 0, y1: 0, x2: 0, y2: 60 },
                    colorStops: [
                        { offset: 0, color: '#FFF2B2' }, // Bright highlight
                        { offset: 0.5, color: '#FFD700' }, // Vibrant gold
                        { offset: 1, color: '#B8860B' }   // Rich shadow
                    ]
                }),
                stroke: '#5c4416',
                strokeWidth: 2,
                shadow: new fabric.Shadow({
                    color: 'rgba(0,0,0,0.8)',
                    blur: 15,
                    offsetX: 6,
                    offsetY: 6
                })
            };
        } else if (preset.style === 'urgent_red') {
            options = {
                ...options,
                fill: '#ffffff',
                backgroundColor: '#ef4444',
                padding: 10
            };
        } else {
            options = {
                ...options,
                fill: '#ffffff',
                shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 10 })
            };
        }

        const text = new fabric.Textbox(preset.text, options);
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
    };

    const addAdCTA = (preset: typeof ctaButtons[0]) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;

        const fontSize = 24;
        const text = new fabric.Text(preset.text, {
            fontSize,
            fontWeight: '900',
            fontFamily: 'Be Vietnam Pro',
            fill: preset.style === 'gold_pill' ? '#4a3712' : '#ffffff',
            originX: 'center',
            originY: 'center'
        });

        const paddingH = 40;
        const paddingV = 20;
        const rectOptions: any = {
            width: text.width! + paddingH * 2,
            height: text.height! + paddingV * 2,
            rx: 30, ry: 30,
            originX: 'center', originY: 'center',
            shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.3)', blur: 20, offsetY: 10 })
        };

        if (preset.style === 'gold_pill') {
            rectOptions.fill = new fabric.Gradient({
                type: 'linear',
                coords: { x1: 0, y1: 0, x2: rectOptions.width, y2: 0 },
                colorStops: [
                    { offset: 0, color: '#B8860B' },
                    { offset: 0.5, color: '#FFF2B2' }, // Bright shine
                    { offset: 1, color: '#B8860B' }
                ]
            });
            rectOptions.stroke = '#ffffff33';
            rectOptions.strokeWidth = 2;
        } else if (preset.style === 'glass_pro') {
            rectOptions.fill = 'rgba(255, 255, 255, 0.1)';
            rectOptions.stroke = 'rgba(255,255,255,0.4)';
            rectOptions.strokeWidth = 2;
        } else {
            rectOptions.fill = '#ef4444';
        }

        const bg = new fabric.Rect(rectOptions);
        const group = new fabric.Group([bg, text], {
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() * 0.8,
            originX: 'center',
            originY: 'center'
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
                fontFamily: 'Be Vietnam Pro, sans-serif',
                fill: '#1e293b',
                originX: 'left',
                originY: 'bottom',
                left: avatarSize / 2 + 10,
                top: 0
            });

            const phoneText = new fabric.Text(profile?.phone || '0909.xxx.xxx', {
                fontSize: 14,
                fontWeight: '600',
                fontFamily: 'Be Vietnam Pro, sans-serif',
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
        <div className="h-screen max-h-screen flex flex-col bg-slate-50 overflow-hidden">
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

            <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Left Sidebar Tools */}
                <div className="w-80 h-full bg-white border-r border-slate-200 overflow-y-auto flex flex-col shadow-xl z-20 custom-scrollbar">
                    {editMode === 'watermark' ? (
                        <div className="p-6 space-y-8">
                            <div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Stamp size={16} /> Chữ đóng dấu (Hàng loạt)
                                </h3>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={watermark.text}
                                        onChange={(e) => setWatermark({ ...watermark, text: e.target.value })}
                                        className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-bold text-slate-700 transition-all shadow-sm"
                                        placeholder="Ví dụ: BĐS CHÍNH CHỦ"
                                    />

                                    <div className="flex items-center gap-2">
                                        <label className="flex-1 flex items-center justify-center gap-2 p-3 bg-white border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
                                            <Upload size={16} className="text-slate-400 group-hover:text-blue-500" />
                                            <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600">
                                                {watermark.logoUrl ? 'Đổi Logo' : 'Tải Logo'}
                                            </span>
                                            <input type="file" accept="image/*" className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (ev) => setWatermark({ ...watermark, logoUrl: ev.target?.result as string });
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                        {watermark.logoUrl && (
                                            <button
                                                onClick={() => setWatermark({ ...watermark, logoUrl: null })}
                                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl border-2 border-transparent hover:border-red-100 transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-600 block mb-3">Mẫu đóng dấu (Pro Layouts)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'tag_orange', label: 'Mẫu 1: Cam' },
                                        { id: 'tag_luxury', label: 'Mẫu 2: Gold' },
                                        { id: 'tag_blue', label: 'Mẫu 3: Blue' },
                                        { id: 'nametag', label: 'Mẫu 4: Pill' },
                                        { id: 'modern_pill', label: 'Viên thuốc' },
                                        { id: 'pro_banner', label: 'Banner' },
                                    ].map(lay => (
                                        <button
                                            key={lay.id}
                                            onClick={() => setWatermark({ ...watermark, layout: lay.id as any })}
                                            className={`p-2 rounded-xl border-2 text-[10px] font-black transition-all ${watermark.layout === lay.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-slate-100 text-slate-500 hover:border-slate-300'}`}
                                        >
                                            {lay.label.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
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

                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center gap-3">
                                <div className="flex-shrink-0 flex items-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={watermark.showBackground} onChange={(e) => setWatermark({ ...watermark, showBackground: e.target.checked })} />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 shadow-inner"></div>
                                    </label>
                                </div>
                                <span className="text-xs font-bold text-slate-700 leading-tight">Hiển thị viền nền (Khuyên dùng cho ảnh rối)</span>
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
                                        onClick={removeFrame}
                                        className="w-full p-2 bg-slate-100 border border-slate-200 text-slate-500 rounded-lg text-xs font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all flex items-center justify-center gap-2 mb-3"
                                    >
                                        <Trash2 size={14} /> Gỡ bỏ Layout hiện tại
                                    </button>

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
                                                fontFamily: 'Be Vietnam Pro, sans-serif', fontWeight: 'bold',
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

                            {/* Marketing Ad Creator */}
                            <div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Sparkles size={16} className="text-amber-500" /> Quảng Cáo Chuyên Nghiệp (Pro Ad)
                                </h3>

                                <div className="space-y-4">
                                    {/* Ad Headlines */}
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase mb-2">1. Chọn mẫu Tiêu đề</p>
                                        <div className="grid grid-cols-1 gap-2">
                                            {adHeadlines.map((h, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => addAdHeadline(h)}
                                                    className={`p-3 rounded-xl border-2 text-left transition-all hover:scale-[1.02] flex items-center justify-between ${h.style === 'gold_3d' ? 'bg-[#1a1a1a] border-[#FFD700]/30' : 'bg-white border-slate-100'}`}
                                                >
                                                    <span className={`font-black text-[11px] ${h.style === 'gold_3d' ? 'text-[#FFD700]' : 'text-slate-800'}`}>{h.label}</span>
                                                    <PlusCircle size={14} className={h.style === 'gold_3d' ? 'text-[#FFD700]' : 'text-slate-400'} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CTA Buttons */}
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase mb-2">2. Chèn nút kêu gọi (CTA)</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {ctaButtons.map((b, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => addAdCTA(b)}
                                                    className="p-3 bg-slate-900 border border-slate-700 rounded-xl text-white hover:bg-black transition-all text-center flex flex-col items-center gap-1 shadow-lg"
                                                >
                                                    <span className="font-black text-[10px] text-amber-500 uppercase">{b.label}</span>
                                                    <span className="text-[8px] font-bold opacity-70">"{b.text}"</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Stickers */}
                            <div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Grid size={16} /> Nhãn Sale (Stickers)
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
                <div className={`flex-1 bg-slate-900 border-l border-slate-800 flex flex-col items-center px-8 pb-8 pt-0 relative ${images.length === 0 ? 'justify-center' : 'justify-start'}`}>
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
                        <div ref={containerRef} className="w-full h-full relative flex items-start justify-center bg-slate-800/30 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 pt-4">
                            {/* Fabric Canvas container */}
                            <canvas ref={canvasRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Thumbnail Strip (Bottom) */}
            {images.length > 0 && (
                <div className="h-28 flex-shrink-0 bg-white border-t border-slate-200 flex items-center px-6 gap-4 overflow-x-auto select-none z-30">
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
