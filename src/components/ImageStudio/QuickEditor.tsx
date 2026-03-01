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
    const isRenderingRef = useRef(false);

    const [images, setImages] = useState<{ id: string, file: File, url: string }[]>([]);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const [editMode, setEditMode] = useState<'watermark' | 'layout'>('watermark');
    const [isLoading, setIsLoading] = useState(false);

    // Active Selection State
    const [activeObject, setActiveObject] = useState<fabric.Object | null>(null);
    const [activeText, setActiveText] = useState("");
    const [activeColor, setActiveColor] = useState("#ffffff");
    const [activeFontSize, setActiveFontSize] = useState(24);
    const [activeFontFamily, setActiveFontFamily] = useState("Be Vietnam Pro");
    const [activeBgColor, setActiveBgColor] = useState("transparent");

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
        manualRelLeft: undefined as number | undefined,
        manualRelTop: undefined as number | undefined,
    });

    const [manualObjects, setManualObjects] = useState<any[]>([]);

    const stickerPresets = [
        { label: '✅ ĐÃ BÁN', text: '✅ ĐÃ BÁN', color: '#ffffff', bgColor: '#10b981' },
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

        canvas.on('mouse:dblclick', (e) => {
            const obj = e.target;
            if (!obj) return;

            if (obj.type === 'group') {
                const group = obj as fabric.Group;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const textObj = group.getObjects().find((o: any) => o.type === 'textbox' || o.type === 'i-text' || o.type === 'text') as fabric.IText;

                if (textObj) {
                    const matrix = textObj.calcTransformMatrix();
                    const options = fabric.util.qrDecompose(matrix);

                    const tempObj = new fabric.IText(textObj.text || '', {
                        fontFamily: textObj.fontFamily,
                        fontSize: textObj.fontSize,
                        fontWeight: textObj.fontWeight,
                        fill: textObj.fill,
                        shadow: textObj.shadow,
                        left: options.translateX,
                        top: options.translateY,
                        scaleX: options.scaleX,
                        scaleY: options.scaleY,
                        angle: options.angle,
                        originX: 'center',
                        originY: 'center',
                        textAlign: textObj.textAlign || 'center',
                    });

                    // Hide original text inside group temporarily
                    textObj.set('visible', false);
                    group.addWithUpdate();
                    canvas.add(tempObj);
                    canvas.setActiveObject(tempObj);
                    tempObj.enterEditing();
                    tempObj.selectAll();

                    tempObj.on('editing:exited', () => {
                        const newText = tempObj.text || '';
                        textObj.set({ text: newText, visible: true });

                        // Auto-resize background rect if it exists
                        const bgObj = group.getObjects().find((o: any) => o.type === 'rect') as fabric.Rect;
                        if (bgObj && textObj.width && textObj.height) {
                            bgObj.set({
                                width: textObj.width + 60,
                                height: textObj.height + 40
                            });
                        }

                        group.addWithUpdate();
                        canvas.remove(tempObj);
                        canvas.setActiveObject(group);
                        setActiveText(newText);
                        canvas.requestRenderAll();
                    });

                    canvas.requestRenderAll();
                }
            }
            // For normal un-grouped Textbox elements, Fabric handles double click naturally natively!
        });

        canvas.on('text:changed', (e) => {
            const obj = e.target as fabric.IText;
            if (obj && obj.text) {
                setActiveText(obj.text);
            }
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
            setActiveFontFamily((obj as fabric.IText).fontFamily || "Be Vietnam Pro");
            setActiveBgColor((obj as fabric.Textbox).backgroundColor as string || "transparent");
        } else if (obj.type === 'group') {
            const textObj = (obj as fabric.Group).getObjects().find((o: any) => o.type === 'textbox' || o.type === 'i-text' || o.type === 'text') as fabric.IText;
            if (textObj) {
                setActiveText(textObj.text || "");
                setActiveColor(textObj.fill as string || "#ffffff");
                setActiveFontSize(textObj.fontSize || 24);
                setActiveFontFamily(textObj.fontFamily || "Be Vietnam Pro");
            }
            const bgObj = (obj as fabric.Group).getObjects().find((o: any) => o.type === 'rect') as fabric.Rect;
            if (bgObj) {
                setActiveBgColor(bgObj.fill as string || "transparent");
            } else {
                setActiveBgColor("transparent");
            }
        }
    };

    const saveCanvasDecorations = useCallback(() => {
        if (isRenderingRef.current) return;
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

        // Also save watermark manual scale/position if any
        const wm = canvas.getObjects().find((o: any) => o.get('isWatermark')) as fabric.Group;
        if (wm) {
            setWatermark(prev => ({
                ...prev,
                manualScale: wm.scaleX || 1,
                manualRelLeft: (wm.left! - originLeft) / actualWidth,
                manualRelTop: (wm.top! - originTop) / actualHeight
            }));
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

    // Handle watermark live updates
    useEffect(() => {
        if (selectedImageId && fabricCanvasRef.current) {
            renderCurrentImage();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        selectedImageId,
        images,
        watermark.layout,
        watermark.position,
        watermark.showBackground,
        watermark.logoUrl
    ]);

    // Fast-path for opacity updates to prevent jitter and reset
    useEffect(() => {
        const canvas = fabricCanvasRef.current;
        if (canvas) {
            const wm = canvas.getObjects().find((o: any) => o.get('isWatermark')) as fabric.Group;
            if (wm) {
                wm.set({ opacity: watermark.opacity });
                canvas.requestRenderAll();
            }
        }
    }, [watermark.opacity]);

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
        isRenderingRef.current = true;

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
                    // @ts-ignore
                    if (watermark.manualRelLeft !== undefined && watermark.manualRelTop !== undefined) {
                        const actualWidth = img.getScaledWidth();
                        const actualHeight = img.getScaledHeight();
                        const originLeft = img.left! - actualWidth / 2;
                        const originTop = img.top! - actualHeight / 2;
                        watermarkGroup.set({
                            // @ts-ignore
                            left: originLeft + watermark.manualRelLeft * actualWidth,
                            // @ts-ignore
                            top: originTop + watermark.manualRelTop * actualHeight
                        });
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
                isRenderingRef.current = false;
            });
        }, { crossOrigin: 'anonymous' });
    };

    const generateWatermarkGroup = async (canvas: fabric.Canvas, bgImg: fabric.Image): Promise<fabric.Group | null> => {
        if (!bgImg.width || !bgImg.height || !bgImg.scaleX) return null;

        const actualWidth = bgImg.width! * bgImg.scaleX!;
        const actualHeight = bgImg.height! * (bgImg.scaleY || bgImg.scaleX!);
        const originLeft = bgImg.left! - actualWidth / 2;
        const originTop = bgImg.top! - actualHeight / 2;

        const elements: fabric.Object[] = [];
        const tagW = 450;
        const tagH = 130;
        const tagScale = (actualWidth * 0.35) / tagW;
        const tagElements: fabric.Object[] = [];

        const tagDisplayName = (profile?.full_name || 'ĐẠI LÝ BĐS').toUpperCase();
        const tagJobTitle = (profile?.job_title || 'MÔI GIỚI TẬN TÂM').toUpperCase();
        const tagPhone = profile?.phone || '09xx.xxx.xxx';

        if (watermark.layout === 'tag_orange' || watermark.layout === 'nametag' || watermark.layout === 'classic' || watermark.layout === 'modern_pill' || watermark.layout === 'pro_banner') {
            const primary = '#f6b21b';
            tagElements.push(new fabric.Rect({ width: tagW, height: tagH, fill: '#ffffff', rx: tagH / 2, ry: tagH / 2, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.15)', blur: 20, offsetY: 8 }), originX: 'center', originY: 'center', left: 0, top: 0, visible: watermark.showBackground }));
            if (watermark.showBackground) {
                tagElements.push(new fabric.Circle({ radius: 55, fill: primary, left: 65 - tagW / 2, top: 65 - tagH / 2, originX: 'center', originY: 'center' }));
            }
            const avatar: fabric.Image | null = await new Promise((resolve) => {
                fabric.Image.fromURL(profile?.avatar_url || profile?.avatar || MOCK_AVATAR, (img) => {
                    const s = 104 / (img.width || 1);
                    img.set({ scaleX: s, scaleY: s, left: 65 - tagW / 2, top: 65 - tagH / 2, originX: 'center', originY: 'center', clipPath: new fabric.Circle({ radius: (img.width || 1) / 2, originX: 'center', originY: 'center' }) });
                    resolve(img);
                }, { crossOrigin: 'anonymous' });
            });
            if (avatar) tagElements.push(avatar);

            if (watermark.logoUrl) {
                const logoImg: fabric.Image | null = await new Promise((resolve) => {
                    fabric.Image.fromURL(watermark.logoUrl!, (img) => {
                        const maxLogoH = 40;
                        const s = maxLogoH / (img.height || 1);
                        img.set({ scaleX: s, scaleY: s, left: tagW / 2 - 45, top: 65 - tagH / 2, originX: 'center', originY: 'center' });
                        resolve(img);
                    }, { crossOrigin: 'anonymous' });
                });
                if (logoImg) tagElements.push(logoImg);
            }

            const textLeft = 140 - tagW / 2;
            const nameText = new fabric.Text(tagDisplayName, { left: textLeft, top: 22 - tagH / 2, fontSize: 24, fontWeight: '900', fill: (!watermark.showBackground) ? '#ffffff' : '#1a1a1a', fontFamily: 'Montserrat', shadow: !watermark.showBackground ? new fabric.Shadow({ color: 'rgba(0,0,0,0.8)', blur: 4 }) : undefined });
            const titleText = new fabric.Text(tagJobTitle, { left: textLeft, top: 52 - tagH / 2, fontSize: 13, fill: primary, fontWeight: '800', fontFamily: 'Inter', shadow: !watermark.showBackground ? new fabric.Shadow({ color: 'rgba(0,0,0,0.8)', blur: 4 }) : undefined });
            const phoneText = new fabric.Text('HOTLINE: ' + tagPhone, { left: textLeft, top: 78 - tagH / 2, fontSize: 16, fill: !watermark.showBackground ? '#ffffff' : '#1a1a1a', fontWeight: '800', fontFamily: 'Inter', shadow: !watermark.showBackground ? new fabric.Shadow({ color: 'rgba(0,0,0,0.8)', blur: 4 }) : undefined });

            // Auto scale name if too long
            const maxTextW = tagW - (textLeft + tagW / 2) - (watermark.logoUrl ? 80 : 20);
            if (nameText.width! > maxTextW) nameText.scaleToWidth(maxTextW);
            if (titleText.width! > maxTextW) titleText.scaleToWidth(maxTextW);

            tagElements.push(nameText, titleText, phoneText);

            if (!watermark.logoUrl) {
                const agencyText = new fabric.Text((profile?.agency || 'CENLAND GROUP').toUpperCase(), { left: textLeft, top: 102 - tagH / 2, fontSize: 9, fill: '#64748b', fontWeight: '900', fontFamily: 'Inter', charSpacing: 100 });
                if (agencyText.width! > maxTextW) agencyText.scaleToWidth(maxTextW);
                tagElements.push(agencyText);
            }
        }
        else if (watermark.layout === 'tag_luxury') {
            const gold = '#c5a059';
            tagElements.push(new fabric.Rect({ width: tagW, height: tagH, fill: '#0a0a0a', rx: 12, ry: 12, stroke: gold, strokeWidth: 2, shadow: new fabric.Shadow({ color: 'rgba(197, 160, 89, 0.4)', blur: 30, offsetY: 10 }), originX: 'center', originY: 'center', left: 0, top: 0, visible: watermark.showBackground }));
            if (watermark.showBackground) {
                tagElements.push(new fabric.Rect({ width: tagW - 40, height: 3, fill: gold, left: 20 - tagW / 2, top: (tagH - 15) - tagH / 2, rx: 1.5, originX: 'left' }));
                tagElements.push(new fabric.Path('M 75 25 L 110 45 L 110 85 L 75 105 L 40 85 L 40 45 Z', { fill: 'transparent', stroke: gold, strokeWidth: 1.5, left: 75 - tagW / 2, top: 65 - tagH / 2, originX: 'center', originY: 'center' }));
            }
            if (watermark.logoUrl) {
                const logoImg: fabric.Image | null = await new Promise((resolve) => {
                    fabric.Image.fromURL(watermark.logoUrl!, (img) => {
                        const maxLogoSize = 40;
                        const s = maxLogoSize / Math.max(img.width || 1, img.height || 1);
                        img.set({ scaleX: s, scaleY: s, left: tagW / 2 - 45, top: 65 - tagH / 2, originX: 'center', originY: 'center' });
                        resolve(img);
                    }, { crossOrigin: 'anonymous' });
                });
                if (logoImg) tagElements.push(logoImg);
            } else {
                const avatar: fabric.Image | null = await new Promise((resolve) => {
                    fabric.Image.fromURL(profile?.avatar_url || profile?.avatar || MOCK_AVATAR, (img) => {
                        const s = 104 / (img.width || 1);
                        img.set({ scaleX: s, scaleY: s, left: 75 - tagW / 2, top: 65 - tagH / 2, originX: 'center', originY: 'center', clipPath: new fabric.Circle({ radius: (img.width || 1) / 2, originX: 'center', originY: 'center' }) });
                        resolve(img);
                    }, { crossOrigin: 'anonymous' });
                });
                if (avatar) tagElements.push(avatar);
            }

            const textLeft = 160 - tagW / 2;
            const nameText = new fabric.Text(tagDisplayName, { left: textLeft, top: 20 - tagH / 2, fontSize: 24, fontWeight: '900', fill: gold, fontFamily: 'Montserrat', charSpacing: 50 });
            const titleText = new fabric.Text(tagJobTitle, { left: textLeft, top: 50 - tagH / 2, fontSize: 13, fill: '#ffffff', opacity: 0.8, fontWeight: '700', fontFamily: 'Inter' });
            const phoneText = new fabric.Text('HOTLINE: ' + tagPhone, { left: textLeft, top: 78 - tagH / 2, fontSize: 16, fill: '#ffffff', fontWeight: '800', fontFamily: 'Inter', charSpacing: 50 });

            const maxTextW = tagW - (textLeft + tagW / 2) - (watermark.logoUrl ? 80 : 20);
            if (nameText.width! > maxTextW) nameText.scaleToWidth(maxTextW);
            if (titleText.width! > maxTextW) titleText.scaleToWidth(maxTextW);

            tagElements.push(nameText, titleText, phoneText);

            if (watermark.showBackground) {
                tagElements.push(new fabric.Rect({ left: textLeft, top: 70 - tagH / 2, width: tagW - (textLeft + tagW / 2) - 80, height: 1, fill: gold, opacity: 0.2 }));
            }
        }
        else if (watermark.layout === 'tag_blue') {
            const primaryBlue = '#0984e3';
            tagElements.push(new fabric.Rect({ width: tagW, height: tagH, fill: '#ffffff', rx: 65, ry: 65, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.1)', blur: 15, offsetY: 5 }), originX: 'center', originY: 'center', left: 0, top: 0, visible: watermark.showBackground }));
            if (watermark.showBackground) {
                tagElements.push(new fabric.Rect({ width: 4, height: 60, fill: primaryBlue, left: 140 - tagW / 2, top: 35 - tagH / 2, rx: 2, ry: 2, originX: 'left' }));
            }
            if (watermark.logoUrl) {
                const logoImg: fabric.Image | null = await new Promise((resolve) => {
                    fabric.Image.fromURL(watermark.logoUrl!, (img) => {
                        const maxLogoSize = 40;
                        const s = maxLogoSize / Math.max(img.width || 1, img.height || 1);
                        img.set({ scaleX: s, scaleY: s, left: tagW / 2 - 45, top: 65 - tagH / 2, originX: 'center', originY: 'center' });
                        resolve(img);
                    }, { crossOrigin: 'anonymous' });
                });
                if (logoImg) tagElements.push(logoImg);
            } else {
                const avatar: fabric.Image | null = await new Promise((resolve) => {
                    fabric.Image.fromURL(profile?.avatar_url || profile?.avatar || MOCK_AVATAR, (img) => {
                        const s = 110 / (img.width || 1);
                        img.set({ scaleX: s, scaleY: s, left: 75 - tagW / 2, top: 65 - tagH / 2, originX: 'center', originY: 'center', clipPath: new fabric.Circle({ radius: (img.width || 1) / 2, originX: 'center', originY: 'center' }) });
                        resolve(img);
                    }, { crossOrigin: 'anonymous' });
                });
                if (avatar) tagElements.push(avatar);
            }

            const textLeft = 165 - tagW / 2;
            const nameText = new fabric.Text(tagDisplayName, { left: textLeft, top: 18 - tagH / 2, fontSize: 24, fontWeight: '900', fill: (!watermark.showBackground) ? '#ffffff' : '#2d3436', fontFamily: 'Montserrat' });
            const titleText = new fabric.Text(tagJobTitle, { left: textLeft, top: 48 - tagH / 2, fontSize: 13, fill: primaryBlue, fontWeight: '700', fontFamily: 'Inter' });
            const phoneText = new fabric.Text('Zalo: ' + tagPhone, { left: textLeft, top: 76 - tagH / 2, fontSize: 18, fill: (!watermark.showBackground) ? '#ffffff' : '#2d3436', fontWeight: '800', fontFamily: 'Inter' });

            const maxTextW = tagW - (textLeft + tagW / 2) - (watermark.logoUrl ? 80 : 20);
            if (nameText.width! > maxTextW) nameText.scaleToWidth(maxTextW);
            if (titleText.width! > maxTextW) titleText.scaleToWidth(maxTextW);

            tagElements.push(nameText, titleText, phoneText);

            if (!watermark.logoUrl) {
                const agencyText = new fabric.Text((profile?.agency || 'CENLAND GROUP').toUpperCase(), { left: textLeft, top: 102 - tagH / 2, fontSize: 9, fill: '#64748b', fontWeight: '900', charSpacing: 100 });
                if (agencyText.width! > maxTextW) agencyText.scaleToWidth(maxTextW);
                tagElements.push(agencyText);
            }
        }

        tagElements.forEach(obj => {
            obj.set({ scaleX: (obj.scaleX || 1) * tagScale, scaleY: (obj.scaleY || 1) * tagScale, left: (obj.left || 0) * tagScale, top: (obj.top || 0) * tagScale });
            elements.push(obj);
        });

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
            case 'center': left = originLeft + actualWidth / 2; top = originTop + actualHeight / 2; break;
        }

        group.set({ left, top });
        return group;
    };


    // Feature: 5 Pre-built Scenarios
    const addLayoutTemplate = (type: 'ban_gap' | 'sang_trong' | 'uy_tin' | 'mat_tien' | 'gia_re' | 'nha_pho' | 'penthouse') => {
        const canvas = fabricCanvasRef.current;
        const bgImg = canvas?.getObjects().find(o => o.type === 'image' && !o.selectable);
        if (!canvas || !bgImg) {
            toast.error('Vui lòng chọn ảnh trước');
            return;
        }

        isRenderingRef.current = true;

        const actualWidth = bgImg.width! * bgImg.scaleX!;
        const actualHeight = bgImg.height! * bgImg.scaleY!;
        const originLeft = bgImg.left! - actualWidth / 2;
        const originTop = bgImg.top! - actualHeight / 2;

        removeFrame(true);

        const createSticker = (preset: any, left: number, top: number, scale: number = 1) => {
            const fontSize = 32 * scale;
            const text = new fabric.Text(preset.text, { fontSize: fontSize, fill: preset.color, fontWeight: 'bold', fontFamily: 'Be Vietnam Pro, sans-serif', originX: 'center', originY: 'center' });
            const padding = 20 * scale;
            const bg = new fabric.Rect({ width: text.width! + padding * 2, height: text.height! + padding, fill: preset.bgColor, rx: 8 * scale, ry: 8 * scale, originX: 'center', originY: 'center', shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.3)', blur: 10, offsetY: 4 }) });
            return new fabric.Group([bg, text], { left, top, originX: 'center', originY: 'center', isFrame: true } as any);
        };

        const createHeadline = (textStr: string, left: number, top: number, scale: number = 1, color: string = '#ffffff', shadowColor: string = 'rgba(0,0,0,0.8)', bgColor?: string) => {
            const text = new fabric.IText(textStr, {
                fontSize: 56 * scale, fontWeight: '900', fontFamily: 'Be Vietnam Pro', textAlign: 'center', originX: 'center', originY: 'center',
                fill: color, shadow: new fabric.Shadow({ color: shadowColor, blur: 10 })
            });
            const maxWidth = actualWidth * 0.9;
            if (text.width! > maxWidth) {
                text.set({ fontSize: (56 * scale) * (maxWidth / text.width!) });
                text.initDimensions();
            }
            if (bgColor) {
                const bg = new fabric.Rect({ width: text.width! + 60, height: text.height! + 30, fill: bgColor, rx: 8, ry: 8, originX: 'center', originY: 'center', shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.3)', blur: 10, offsetY: 4 }) });
                return new fabric.Group([bg, text], { left, top, originX: 'center', originY: 'center', isFrame: true } as any);
            }
            text.set({ left, top, isFrame: true } as any);
            return text;
        }

        const elements: any[] = [];

        if (type === 'ban_gap') {
            elements.push(new fabric.Rect({ left: originLeft, top: originTop, width: actualWidth, height: actualHeight * 0.15, fill: '#ef4444', selectable: false, isFrame: true } as any));
            elements.push(createHeadline('CHỦ CẦN BÁN GẤP', originLeft + actualWidth / 2, originTop + actualHeight * 0.075, 0.8));
            elements.push(createSticker(stickerPresets[1], originLeft + actualWidth / 2, originTop + actualHeight * 0.25, 1.2));
            elements.push(createHeadline('LH NGAY: ' + (profile?.phone || '09xx.xxx.xxx'), originLeft + actualWidth / 2, originTop + actualHeight - 80, 0.7, '#FFD700', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,0.6)'));
        }
        else if (type === 'sang_trong') {
            elements.push(new fabric.Rect({ left: originLeft + 20, top: originTop + 20, width: actualWidth - 40, height: actualHeight - 40, fill: 'transparent', stroke: '#FFD700', strokeWidth: 4, selectable: false, evented: false, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 4 }), isFrame: true } as any));
            elements.push(createHeadline('SỞ HỮU NGAY CHỈ TỪ', originLeft + actualWidth / 2, originTop + actualHeight * 0.15, 0.6, '#ffffff'));
            elements.push(createHeadline('5.5 TỶ', originLeft + actualWidth / 2, originTop + actualHeight * 0.25, 1.2, '#FFD700'));
            elements.push(createHeadline('PHÂN KHÚC VIP 🌟', originLeft + actualWidth / 2, originTop + actualHeight - 80, 0.6, '#ffffff', 'rgba(0,0,0,0.8)', 'rgba(255,215,0,0.2)'));
        }
        else if (type === 'uy_tin') {
            const sticker = createSticker(stickerPresets[3], originLeft, originTop + actualHeight * 0.15, 1.2);
            sticker.set({ left: originLeft + (sticker.width! * sticker.scaleX!) / 2 + 30 });
            elements.push(sticker);

            const gradient = new fabric.Gradient({ type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 250 }, colorStops: [{ offset: 0, color: 'rgba(0,0,0,0)' }, { offset: 1, color: 'rgba(0,0,0,0.8)' }] });
            elements.push(new fabric.Rect({ left: originLeft, top: originTop + actualHeight - 250, width: actualWidth, height: 250, fill: gradient, selectable: false, evented: false, isFrame: true } as any));
            elements.push(createHeadline('GIAO DỊCH CHÍNH CHỦ', originLeft + actualWidth / 2, originTop + actualHeight - 60, 0.8, '#ffffff'));
        }
        else if (type === 'mat_tien') {
            elements.push(createSticker(stickerPresets[5], originLeft + actualWidth / 2, originTop + actualHeight * 0.15, 1.1));
            elements.push(createHeadline('KINH DOANH SẦM UẤT', originLeft + actualWidth / 2, originTop + actualHeight * 0.85, 0.9, '#3b82f6', 'rgba(0,0,0,0.8)', '#ffffff'));
        }
        else if (type === 'gia_re') {
            const sticker = createSticker(stickerPresets[2], originLeft, originTop + actualHeight * 0.15, 1.2);
            sticker.set({ left: originLeft + actualWidth - (sticker.width! * sticker.scaleX!) / 2 - 30 });
            elements.push(sticker);

            elements.push(createHeadline('GIÁ CỰC TỐT', originLeft + actualWidth / 2, originTop + actualHeight / 2, 1.3, '#ef4444', 'rgba(255,255,255,0.8)', '#1a1a1a'));
        }
        else if (type === 'nha_pho') {
            elements.push(createHeadline('NHÀ PHỐ SIÊU THOÁNG', originLeft + actualWidth / 2, originTop + actualHeight * 0.1, 1, '#ffffff', 'rgba(0,0,0,0.8)'));
            elements.push(createSticker({ text: 'HOÀN THIỆN CHỈ 3 TỶ ĐỒNG', color: '#ffffff', bgColor: '#8b6f4e' }, originLeft + actualWidth / 2, originTop + actualHeight * 0.22, 1));
        }
        else if (type === 'penthouse') {
            elements.push(createHeadline('PENTHOUSE 500m²', originLeft + actualWidth / 2, originTop + actualHeight * 0.2, 1, '#FFD700', 'rgba(0,0,0,0.8)'));
            elements.push(createSticker({ text: 'trung tâm TP. HCM', color: '#000000', bgColor: '#facc15' }, originLeft + actualWidth / 2, originTop + actualHeight * 0.35, 1));
            const gradient = new fabric.Gradient({ type: 'linear', coords: { x1: 0, y1: 0, x2: 0, y2: 200 }, colorStops: [{ offset: 0, color: 'rgba(0,0,0,0)' }, { offset: 1, color: 'rgba(0,0,0,0.9)' }] });
            elements.push(new fabric.Rect({ left: originLeft, top: originTop + actualHeight - 200, width: actualWidth, height: 200, fill: gradient, selectable: false, evented: false, isFrame: true } as any));
            elements.push(createHeadline('Gia chủ NGHIỆN ĐÁ', originLeft + actualWidth / 2, originTop + actualHeight - 80, 1, '#22c55e', 'rgba(0,0,0,0.9)'));
        }

        canvas.add(...elements);
        canvas.renderAll();
        isRenderingRef.current = false;
        saveCanvasDecorations();
        toast.success('Đã áp dụng mẫu thiết kế!');
    };

    const removeFrame = (silent: boolean = false) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;
        isRenderingRef.current = true;
        const objects = canvas.getObjects().filter((o: any) => o.isFrame);
        objects.forEach(o => canvas.remove(o));
        canvas.renderAll();
        isRenderingRef.current = false;
        saveCanvasDecorations();

        if (!silent) {
            toast.success("Đã gỡ bỏ bố cục");
        }
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

    // Feature: Add Realtor Avatar Badge (Removed as per request)

    // Update object property
    const updateActiveObject = (prop: string, value: any) => {
        const canvas = fabricCanvasRef.current;
        if (!canvas || !activeObject) return;

        if (activeObject.type === 'textbox' || activeObject.type === 'i-text') {
            activeObject.set(prop as keyof fabric.Object, value);
        } else if (activeObject.type === 'group') {
            const group = activeObject as fabric.Group;
            const textObj = group.getObjects().find(o => o.type === 'textbox' || o.type === 'i-text' || o.type === 'text') as fabric.IText;
            const bgObj = group.getObjects().find(o => o.type === 'rect') as fabric.Rect;

            if (prop === 'text' || prop === 'fontFamily' || prop === 'fontSize' || prop === 'textFill') {
                if (textObj) {
                    if (prop === 'textFill') {
                        textObj.set('fill', value);
                    } else {
                        textObj.set(prop as keyof fabric.Object, value);
                    }

                    if (prop === 'text' || prop === 'fontFamily' || prop === 'fontSize') {
                        if (bgObj && textObj.width && textObj.height) {
                            bgObj.set({
                                width: textObj.width + 60,
                                height: textObj.height + 40
                            });
                        }
                    }
                    group.addWithUpdate();
                }
            } else if (prop === 'backgroundColor') {
                if (bgObj) {
                    bgObj.set('fill', value);
                    group.addWithUpdate();
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
        <div className="fixed inset-0 md:left-[280px] z-[60] flex flex-col bg-[#0b1121] overflow-hidden font-inter text-slate-300">
            {/* Header - Refined for Gilded Architecture */}
            <div className="flex flex-col md:flex-row items-center justify-between p-3 md:p-5 bg-[#1a2332]/80 backdrop-blur-xl border-b border-white/5 gap-3 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent"></div>

                <div className="flex items-center justify-between w-full md:w-auto z-10">
                    <button onClick={onBack} className="text-slate-400 hover:text-gold flex items-center gap-3 font-black uppercase tracking-[0.2em] transition-all italic text-xs">
                        <ArrowRight className="rotate-180" size={18} /> <span>Studio <span className="text-gold">Photo</span></span>
                    </button>
                    <div className="flex md:hidden gap-2">
                        <label className="bg-gold/10 text-gold px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-gold hover:text-black flex items-center gap-2 shadow-lg border border-gold/20 transition-all">
                            <Upload size={14} /> Tải ảnh
                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                        </label>
                        <button onClick={handleDownloadCurrent} className="bg-gold text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 flex items-center gap-2 shadow-xl transition-all">
                            <Download size={14} /> Lưu
                        </button>
                    </div>
                </div>

                <div className="flex w-full md:w-auto bg-black/40 p-1 rounded-2xl border border-white/5 z-10">
                    <button
                        onClick={() => { setEditMode('watermark'); setActiveObject(null); }}
                        className={`flex-1 md:flex-none px-6 py-2.5 flex justify-center rounded-xl text-[10px] font-black uppercase tracking-[0.2em] items-center gap-2 transition-all ${editMode === 'watermark' ? 'bg-gold text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Stamp size={14} /> Đóng dấu Auto
                    </button>
                    <button
                        onClick={() => { setEditMode('layout'); renderCurrentImage(); }}
                        className={`flex-1 md:flex-none px-6 py-2.5 flex justify-center rounded-xl text-[10px] font-black uppercase tracking-[0.2em] items-center gap-2 transition-all ${editMode === 'layout' ? 'bg-gold text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Brush size={14} /> Thiết kế Tự do
                    </button>
                </div>

                <div className="hidden md:flex gap-4 z-10">
                    <label className="bg-white/5 text-slate-300 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-white/10 transition-all flex items-center gap-2 border border-white/10">
                        <Upload size={16} /> Thêm ảnh
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                    </label>
                    <button onClick={handleDownloadCurrent} className="bg-gradient-to-r from-gold via-[#fcf6ba] to-gold text-black px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all flex items-center gap-2 shadow-[0_10px_30px_rgba(191,149,63,0.3)]">
                        <Download size={16} /> Lưu máy
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative">
                {/* Left Sidebar Tools - Gilded Architecture Style */}
                <div className="w-full md:w-80 h-[40vh] md:h-full bg-[#1a2332] border-t md:border-t-0 md:border-r border-white/5 overflow-y-auto flex flex-col shadow-2xl z-20 custom-scrollbar order-2 md:order-1 shrink-0">
                    {editMode === 'watermark' ? (
                        <div className="p-6 space-y-10">
                            <div>
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.34em] mb-5 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold border border-gold/20">
                                        <Stamp size={16} />
                                    </div>
                                    TẢI LOGO HỆ THỐNG
                                </h3>
                                <div className="space-y-4">

                                    <div className="flex items-center gap-3">
                                        <label className="flex-1 flex items-center justify-center gap-3 p-4 bg-black/40 border-2 border-dashed border-white/5 rounded-[1.5rem] cursor-pointer hover:border-gold/40 hover:bg-gold/5 transition-all group group/upload">
                                            <Upload size={18} className="text-slate-500 group-hover/upload:text-gold transition-colors" />
                                            <span className="text-[10px] font-black text-slate-400 group-hover/upload:text-gold uppercase tracking-widest">
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
                                                className="w-12 h-12 flex items-center justify-center text-red-400 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-[1.2rem] border border-red-500/20 transition-all shadow-lg"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-4 px-1">Mẫu đóng dấu (Pro Layouts)</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'tag_orange', label: 'Classic' },
                                        { id: 'tag_luxury', label: 'Luxury' },
                                        { id: 'tag_blue', label: 'Modern' },
                                    ].map(lay => (
                                        <button
                                            key={lay.id}
                                            onClick={() => setWatermark({ ...watermark, layout: lay.id as any })}
                                            className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${watermark.layout === lay.id ? 'bg-gold/10 border-gold shadow-[0_0_20px_rgba(191,149,63,0.3)]' : 'bg-black/20 border-white/5 opacity-50 hover:opacity-100 hover:border-white/20'}`}
                                        >
                                            <div className={`w-2 h-2 rounded-full ${watermark.layout === lay.id ? 'bg-gold animate-pulse' : 'bg-slate-600'}`}></div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${watermark.layout === lay.id ? 'text-gold' : 'text-slate-400'}`}>{lay.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-black/40 p-5 rounded-[1.5rem] border border-white/5 shadow-inner space-y-5">
                                <div>
                                    <div className="flex justify-between mb-3">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Độ mờ Logo</label>
                                        <span className="text-gold font-black text-[10px]">{(watermark.opacity * 100).toFixed(0)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.1" max="1" step="0.1"
                                        value={watermark.opacity}
                                        onChange={(e) => setWatermark({ ...watermark, opacity: parseFloat(e.target.value) })}
                                        className="w-full h-1.5 bg-[#2a3547] rounded-lg appearance-none cursor-pointer accent-gold"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-4 px-1">Vị trí chèn Logo</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'tl', label: 'Trên Trái' },
                                        { id: 'center', label: 'Ở Giữa' },
                                        { id: 'tr', label: 'Trên Phải' },
                                        { id: 'bl', label: 'Dưới Trái' },
                                        { id: 'tiled', label: 'Lặp Kín' },
                                        { id: 'br', label: 'Dưới Phải' },
                                    ].map(pos => (
                                        <button
                                            key={pos.id}
                                            onClick={() => setWatermark({ ...watermark, position: pos.id as any })}
                                            className={`p-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${watermark.position === pos.id ? 'bg-gold/10 border-gold text-gold shadow-lg' : 'bg-black/20 border-white/5 text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {pos.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gold/5 p-4 rounded-[1.5rem] border border-gold/10 flex items-center justify-between gap-4">
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-tight">Hiển thị viền nền Logo</span>
                                <div className="flex-shrink-0">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={watermark.showBackground} onChange={(e) => setWatermark({ ...watermark, showBackground: e.target.checked })} />
                                        <div className="w-11 h-6 bg-[#2a3547] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold shadow-inner"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 space-y-8">
                            {/* Object Properties Panel - Gilded Mode */}
                            {activeObject ? (
                                <div className="bg-white/5 p-5 rounded-[2rem] border border-white/5 shadow-2xl space-y-6">
                                    <div className="flex justify-between items-center px-1">
                                        <h3 className="text-[10px] font-black text-gold uppercase tracking-[0.2em] italic">Cấu hình Thành phần</h3>
                                        <button
                                            onClick={() => {
                                                fabricCanvasRef.current?.remove(activeObject);
                                                setActiveObject(null);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-lg transition-all" title="Xóa"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    <div className="space-y-5">
                                        {(activeObject.type === 'textbox' || activeObject.type === 'i-text' || activeObject.type === 'group') && (
                                            <>
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Nội dung Chữ</label>
                                                    <textarea
                                                        rows={2}
                                                        value={activeText}
                                                        onChange={(e) => {
                                                            setActiveText(e.target.value);
                                                            updateActiveObject('text', e.target.value);
                                                        }}
                                                        className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-gold/50 text-white placeholder-slate-600 resize-none"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Kiểu Font</label>
                                                        <select
                                                            value={activeFontFamily}
                                                            onChange={(e) => {
                                                                setActiveFontFamily(e.target.value);
                                                                updateActiveObject('fontFamily', e.target.value);
                                                            }}
                                                            className="w-full text-xs p-3 rounded-xl bg-black/40 border border-white/10 outline-none focus:border-gold/50 text-white appearance-none cursor-pointer"
                                                        >
                                                            <option value="Be Vietnam Pro">Be Vietnam Pro</option>
                                                            <option value="Montserrat">Montserrat (Modern)</option>
                                                            <option value="Inter">Inter (Clean)</option>
                                                            <option value="Roboto">Roboto</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="relative">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Màu Chữ</label>
                                                        <div className="flex bg-black/40 rounded-xl border border-white/10 overflow-hidden p-1 gap-2 items-center">
                                                            <input
                                                                type="color"
                                                                value={activeColor.length === 7 ? activeColor : '#ffffff'}
                                                                onChange={(e) => {
                                                                    setActiveColor(e.target.value);
                                                                    updateActiveObject(activeObject.type === 'group' ? 'textFill' : 'fill', e.target.value);
                                                                }}
                                                                className="w-10 h-8 rounded-lg border-none cursor-pointer bg-transparent"
                                                            />
                                                            <span className="text-[10px] uppercase font-black text-slate-400">{activeColor}</span>
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Màu Nền</label>
                                                        <div className="flex bg-black/40 rounded-xl border border-white/10 overflow-hidden p-1 gap-2 items-center">
                                                            <input
                                                                type="color"
                                                                value={activeBgColor.startsWith('#') && activeBgColor.length === 7 ? activeBgColor : '#ffffff'}
                                                                onChange={(e) => {
                                                                    setActiveBgColor(e.target.value);
                                                                    updateActiveObject('backgroundColor', e.target.value);
                                                                }}
                                                                className="w-10 h-8 rounded-lg border-none cursor-pointer bg-transparent"
                                                            />
                                                            <span className="text-[10px] uppercase font-black text-slate-400">{activeBgColor === 'transparent' ? 'None' : activeBgColor}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {activeObject.type !== 'group' && (
                                                    <div>
                                                        <div className="flex justify-between items-center mb-2 px-1">
                                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Cỡ chữ</label>
                                                            <span className="text-gold font-black text-[10px]">{Math.round(activeFontSize)}px</span>
                                                        </div>
                                                        <input
                                                            type="range" min="10" max="180"
                                                            value={Math.round(activeFontSize)}
                                                            onChange={(e) => {
                                                                setActiveFontSize(parseInt(e.target.value));
                                                                updateActiveObject('fontSize', parseInt(e.target.value));
                                                            }}
                                                            className="w-full h-1.5 bg-[#2a3547] rounded-lg appearance-none cursor-pointer accent-gold"
                                                        />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        <p className="text-[10px] text-slate-600 italic text-center mt-2 font-medium tracking-tight">Mẹo: Dập đúp chuột để sửa chữ nhanh trên ảnh</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 bg-black/20 border border-white/5 border-dashed rounded-[2rem] text-center group cursor-default shadow-inner">
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/5 mb-4 mx-auto group-hover:border-gold/30 transition-all duration-700">
                                        <ArrowRight className="text-slate-700 group-hover:text-gold/50 transition-colors duration-700 -rotate-90" size={20} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">Chọn một thành phần trên ảnh để tinh chỉnh chuyên sâu</p>
                                </div>
                            )}

                            <hr className="border-white/5 my-6" />

                            {/* Templates */}
                            <div className="pt-4">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                    <LayoutTemplate size={16} className="text-gold" /> Mẫu thiết kế BĐS (1-Click)
                                </h3>

                                <button
                                    onClick={() => removeFrame(false)}
                                    className="w-full p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2 mb-6"
                                >
                                    <Trash2 size={14} /> Dọn sạch Layout cũ
                                </button>

                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => addLayoutTemplate('ban_gap')} className="p-4 bg-red-500 border border-red-600 rounded-[1.5rem] hover:brightness-110 transition-all flex flex-col items-center gap-1 shadow-lg group">
                                        <span className="text-[9px] font-black text-white/60 uppercase tracking-widest group-hover:scale-105 transition-transform">Layout 01</span>
                                        <span className="text-[11px] font-black text-white uppercase italic">🔥 Bán Gấp</span>
                                    </button>
                                    <button onClick={() => addLayoutTemplate('sang_trong')} className="p-4 bg-[#1a1a1a] border border-gold/50 rounded-[1.5rem] hover:border-gold transition-all flex flex-col items-center gap-1 shadow-gold/10 shadow-xl group">
                                        <span className="text-[9px] font-black text-gold opacity-60 uppercase tracking-widest group-hover:scale-105 transition-transform">Layout 02</span>
                                        <span className="text-[11px] font-black text-gold uppercase italic">🌟 Luxury VIP</span>
                                    </button>
                                    <button onClick={() => addLayoutTemplate('uy_tin')} className="p-4 bg-green-600 border border-green-700 rounded-[1.5rem] hover:brightness-110 transition-all flex flex-col items-center gap-1 shadow-lg group">
                                        <span className="text-[9px] font-black text-white/60 uppercase tracking-widest group-hover:scale-105 transition-transform">Layout 03</span>
                                        <span className="text-[11px] font-black text-white uppercase italic">📜 Chủ Uy Tín</span>
                                    </button>
                                    <button onClick={() => addLayoutTemplate('mat_tien')} className="p-4 bg-blue-600 border border-blue-700 rounded-[1.5rem] hover:brightness-110 transition-all flex flex-col items-center gap-1 shadow-lg group">
                                        <span className="text-[9px] font-black text-white/60 uppercase tracking-widest group-hover:scale-105 transition-transform">Layout 04</span>
                                        <span className="text-[11px] font-black text-white uppercase italic">🏢 Mặt Tiền VIP</span>
                                    </button>
                                    <button onClick={() => addLayoutTemplate('gia_re')} className="p-4 bg-slate-800 border border-slate-700 rounded-[1.5rem] hover:border-slate-500 transition-all flex flex-col items-center gap-1 shadow-lg group">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:scale-105 transition-transform">Layout 05</span>
                                        <span className="text-[11px] font-black text-slate-300 uppercase italic">🏷️ Hàng Ngộp</span>
                                    </button>
                                    <button onClick={() => addLayoutTemplate('nha_pho')} className="p-4 bg-stone-700 border border-stone-600 rounded-[1.5rem] hover:border-stone-400 transition-all flex flex-col items-center gap-1 shadow-lg group">
                                        <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest group-hover:scale-105 transition-transform">Layout 06</span>
                                        <span className="text-[11px] font-black text-stone-200 uppercase italic">🏠 Nhà Phố</span>
                                    </button>
                                    <button onClick={() => addLayoutTemplate('penthouse')} className="col-span-2 p-4 bg-gradient-to-r from-black via-[#1a1a1a] to-black border border-gold rounded-[2rem] hover:scale-[1.02] transition-all flex items-center justify-center gap-4 shadow-gold/20 shadow-2xl group">
                                        <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 text-gold group-hover:rotate-12 transition-transform">
                                            <Sparkles size={20} />
                                        </div>
                                        <div className="flex flex-col items-start translate-y-0.5">
                                            <span className="text-[9px] font-black text-gold/60 uppercase tracking-[0.2em]">Premium Template</span>
                                            <span className="text-[13px] font-black text-gold uppercase italic tracking-[0.05em]">💎 Penthouse / Siêu Luxury</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Pro Elements */}
                            <div className="pt-4">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                    <PlusCircle size={16} className="text-gold" /> Chèn Thành Phần Sale
                                </h3>
                                <div className="space-y-3">
                                    {/* Removed Chèn Namecard Môi Giới here */}

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
                                        className="w-full p-4 bg-black/40 border border-white/10 text-slate-300 rounded-[1.5rem] flex items-center justify-center gap-3 hover:border-gold/30 hover:bg-gold/5 transition-all shadow-lg group"
                                    >
                                        <Type size={18} className="text-gold group-hover:scale-110 transition-transform" /> <span className="font-black text-[11px] uppercase tracking-widest">Thêm Tiêu Đề Tự Do</span>
                                    </button>
                                </div>
                            </div>

                            {/* Marketing Ad Creator */}
                            <div className="pt-4">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                    <Sparkles size={16} className="text-gold" /> Quảng Cáo Chuyên Nghiệp (Pro Ad)
                                </h3>

                                <div className="space-y-5">
                                    {/* Ad Headlines */}
                                    <div>
                                        <p className="text-[9px] font-black text-slate-600 uppercase mb-3 px-1 tracking-widest">1. Chọn mẫu Tiêu đề</p>
                                        <div className="grid grid-cols-1 gap-2">
                                            {adHeadlines.map((h, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => addAdHeadline(h)}
                                                    className={`p-4 rounded-[1.2rem] border transition-all hover:scale-[1.02] flex items-center justify-between group/aditem shadow-lg ${h.style === 'gold_3d' ? 'bg-[#1a1a1a] border-gold/30' : 'bg-black/40 border-white/5 opacity-60 hover:opacity-100'}`}
                                                >
                                                    <span className={`font-black text-[11px] uppercase tracking-tighter ${h.style === 'gold_3d' ? 'text-gold italic' : 'text-slate-200'}`}>{h.label}</span>
                                                    <PlusCircle size={16} className={h.style === 'gold_3d' ? 'text-gold' : 'text-slate-500 group-hover/aditem:text-gold transition-colors'} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CTA Buttons */}
                                    <div>
                                        <p className="text-[9px] font-black text-slate-600 uppercase mb-3 px-1 tracking-widest">2. Chèn nút kêu gọi (CTA)</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {ctaButtons.map((b, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => addAdCTA(b)}
                                                    className="p-4 bg-black/60 border border-white/10 rounded-[1.2rem] text-white hover:border-gold/30 transition-all text-center flex flex-col items-center gap-2 shadow-xl hover:bg-gold/5 group/cta"
                                                >
                                                    <span className="font-black text-[10px] text-gold uppercase tracking-tighter group-hover:scale-110 transition-transform">{b.label}</span>
                                                    <span className="text-[8px] font-bold text-slate-500 uppercase italic">"{b.text}"</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-white/5 my-6" />

                            {/* Stickers */}
                            <div className="pt-4">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                    <Grid size={16} className="text-gold" /> Nhãn Sale (Stickers)
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {stickerPresets.map((sticker, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => addSticker(sticker)}
                                            style={{ backgroundColor: sticker.bgColor }}
                                            className="p-4 border-none rounded-[1.2rem] text-white hover:brightness-110 transition-all transform hover:scale-[1.02] active:scale-95 text-center shadow-lg"
                                        >
                                            <span className="font-black text-[10px] uppercase tracking-tighter block truncate">{sticker.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>
                    )}
                </div>

                {/* Main Canvas Workspace */}
                <div className={`flex-1 min-h-[45vh] md:h-full bg-[#0b1121] md:border-l border-white/5 flex flex-col items-center px-4 md:px-8 pb-4 md:pb-8 pt-0 relative order-1 md:order-2 overflow-hidden ${images.length === 0 ? 'justify-center' : 'justify-start'}`}>
                    {images.length === 0 ? (
                        <div className="text-center p-12 bg-[#1a2332]/50 backdrop-blur-3xl rounded-[3rem] border-2 border-dashed border-white/5 max-w-md w-full shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent"></div>
                            <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center border border-gold/20 mx-auto mb-8 group-hover:scale-110 transition-transform duration-700">
                                <Upload size={40} className="text-gold" />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-widest italic">Workspace Trống</h2>
                            <p className="text-slate-500 mb-10 font-medium tracking-tight">Tải ảnh bất động sản lên để bắt đầu <br /> thiết kế ấn tượng ngay hôm nay</p>
                            <label className="bg-gradient-to-r from-gold via-[#fcf6ba] to-gold text-black px-10 py-4 rounded-2xl font-black uppercase tracking-[0.2em] cursor-pointer hover:brightness-110 transition-all shadow-[0_10px_40px_rgba(191,149,63,0.3)] inline-flex items-center gap-3">
                                <PlusCircle size={20} /> Chọn ảnh ngay
                                <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                            </label>
                        </div>
                    ) : (
                        <div ref={containerRef} className="w-full h-full relative flex items-start justify-center bg-black/20 rounded-2xl overflow-hidden border border-white/5 pt-4">
                            <canvas ref={canvasRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Thumbnail Strip (Bottom) - Gilded Style */}
            {images.length > 0 && (
                <div className="h-24 md:h-28 flex-shrink-0 bg-[#1a2332] border-t border-white/5 flex items-center px-4 md:px-8 gap-4 overflow-x-auto select-none z-30 no-scrollbar">
                    {images.map(img => (
                        <button
                            key={img.id}
                            onClick={() => setSelectedImageId(img.id)}
                            className={`relative min-w-[5.5rem] w-20 h-20 rounded-2xl overflow-hidden transition-all shadow-2xl group ${selectedImageId === img.id ? 'ring-[3px] ring-gold ring-offset-4 ring-offset-[#0b1121] scale-90 z-10' : 'opacity-40 hover:opacity-100 hover:scale-105'}`}
                        >
                            <img src={img.url} className="w-full h-full object-cover" alt="" />
                            {selectedImageId === img.id && (
                                <div className="absolute inset-0 bg-gold/5 blur-sm"></div>
                            )}
                        </button>
                    ))}
                    <label className="min-w-[5.5rem] w-20 h-20 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 hover:text-gold hover:border-gold/40 hover:bg-gold/5 transition-all cursor-pointer bg-black/40 shadow-inner group/add">
                        <PlusCircle size={28} className="group-hover/add:scale-110 transition-transform" />
                        <span className="text-[9px] font-black uppercase tracking-widest mt-2">{images.length === 0 ? 'Tải ảnh' : 'Thêm'}</span>
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                    </label>
                </div>
            )
            }
        </div >
    );
};

export default QuickEditor;
