import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Upload, Download, Type, Layers, Wand2, X, Sparkles, AlertCircle, Phone, Building2, MousePointer2, CheckCircle2, Trash2, Maximize, BedDouble, Bath, Compass, UserCircle2, Stamp, Palette, Sliders, Crown } from 'lucide-react';
import { generateImageWithAI } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';

export default function ImageStudio() {
    const { profile } = useAuth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [activeTab, setActiveTab] = useState<'generation' | 'editing'>('generation');

    // Editor State
    const [text, setText] = useState('');
    const [watermark, setWatermark] = useState(false);
    const [frame, setFrame] = useState<'none' | 'simple' | 'modern'>('none');
    const [watermarkOpacity, setWatermarkOpacity] = useState(0.4);

    // Land Selection State
    const [isSelectingLand, setIsSelectingLand] = useState(false);
    const [landPoints, setLandPoints] = useState<{ x: number, y: number }[]>([]);

    // Sales Info State
    const [showSalesInfo, setShowSalesInfo] = useState(false);

    // New Features for Real Estate
    const [sticker, setSticker] = useState<'none' | 'sold' | 'hot' | 'new' | 'deal'>('none');
    const [propertySpecs, setPropertySpecs] = useState({
        area: '',
        bed: '',
        bath: '',
        direction: '' // Compass
    });
    const [enhancements, setEnhancements] = useState({
        brightness: 100, // %
        contrast: 100,   // %
        saturation: 100  // %
    });

    // Ad Content State
    const [adContent, setAdContent] = useState({
        title1: '',
        title2: '',
        subtitle: '',
        features: '',
        price: '',
        cta: 'LIÊN HỆ TƯ VẤN'
    });
    const [adScale, setAdScale] = useState(1);

    // Templates State
    const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

    // Interactive Elements State
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [elementStates, setElementStates] = useState<Record<string, { x: number, y: number, scale: number }>>({
        sticker: { x: 0.7, y: 0.1, scale: 1 },
        salesInfo: { x: 0.6, y: 0.05, scale: 1 },
        propertySpecs: { x: 0.05, y: 0.85, scale: 1 },
        customText: { x: 0.95, y: 0.1, scale: 1 },
        adOverlay: { x: 0.05, y: 0.05, scale: 1 }
    });

    // Overlay Background State
    const [showAdBackground, setShowAdBackground] = useState(true);

    const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault(); // Prevent scrolling
        const touch = e.touches[0];
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();

        // Create a synthetic event
        const syntheticEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            target: e.target,
            preventDefault: () => { },
            currentTarget: e.currentTarget
        };
        handleCanvasMouseDown(syntheticEvent as any);
    };

    const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
        e.preventDefault();
        const touch = e.touches[0];
        const syntheticEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            target: e.target,
            preventDefault: () => { },
            currentTarget: e.currentTarget
        };
        handleCanvasMouseMove(syntheticEvent as any);
    };

    const handleCanvasTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
        handleCanvasMouseUp();
    };

    const templates = [
        { id: 'luxury', name: 'Biệt Thự Sang Trọng', icon: '💎', desc: 'Khung vàng, thẻ tên Pro, phong cách thượng lưu', isPro: true },
        { id: 'urgent', name: 'Bán Gấp - Chốt Nhanh', icon: '🔥', desc: 'Tone đỏ, nhãn Giảm sốc, cực kỳ nổi bật', isPro: true },
        { id: 'clean', name: 'Minimalist Clean', icon: '✨', desc: 'Tối giản, tập trung vào hình ảnh và thông số', isPro: true },
        { id: 'facebook', name: 'Quảng Cáo FB/Zalo', icon: '📱', desc: 'Thông tin to rõ, sticker Hot, thu hút click', isPro: false },
        { id: 'pro', name: 'Professional Report', icon: '📊', desc: 'Đầy đủ thông số, watermark chính chủ', isPro: true },
    ];

    const applyTemplate = (id: string) => {
        if (id === activeTemplate) {
            applyTemplate('none' as any); // Toggle off if same template is clicked
            return;
        }

        setActiveTemplate(id === 'none' ? null : id);

        // Reset positions when applying template for consistency
        setElementStates({
            sticker: { x: 0.7, y: 0.1, scale: 1 },
            salesInfo: { x: 0.6, y: 0.05, scale: 1 },
            propertySpecs: { x: 0.05, y: 0.85, scale: 1 },
            customText: { x: 0.95, y: 0.1, scale: 1 },
            adOverlay: { x: 0.05, y: 0.05, scale: 1 }
        });

        // Clear manual overrides when applying any template
        setText('');

        switch (id) {
            case 'luxury':
                setFrame('none');
                setSticker('none');
                setShowSalesInfo(false);
                setWatermark(false);
                setAdContent({
                    title1: 'BIỆT THỰ',
                    title2: 'SANG TRỌNG',
                    subtitle: 'VỊ TRÍ ĐẮC ĐỊA - ĐẲNG CẤP THƯỢNG LƯU',
                    features: 'Nội thất cao cấp, Hồ bơi vô cực, View panorama',
                    price: 'GIÁ THỎA THUẬN',
                    cta: 'NHẬN BÁO GIÁ'
                });
                setEnhancements({ brightness: 105, contrast: 110, saturation: 110 });
                break;
            case 'urgent':
                setFrame('none');
                setSticker('deal');
                setShowSalesInfo(false);
                setWatermark(false);
                setAdContent({
                    title1: 'BÁN GẤP',
                    title2: 'CẮT LỖ',
                    subtitle: 'CHỦ NHÀ CẦN TIỀN - CHỐT NHANH TRONG TUẦN',
                    features: 'Sổ đỏ chính chủ, Hạ tầng hoàn thiện, Dân cư đông đúc',
                    price: 'GIÁ SỐC 3.x TỶ',
                    cta: 'GỌI NGAY'
                });
                setEnhancements({ brightness: 100, contrast: 120, saturation: 100 });
                break;
            case 'facebook':
                setFrame('modern');
                setSticker('hot');
                setShowSalesInfo(true);
                setWatermark(false);
                setAdContent({
                    title1: 'CƠ HỘI HIẾM',
                    title2: 'ĐẦU TƯ SINH LỜI',
                    subtitle: 'PHÁP LÝ MINH BẠCH - CHIẾT KHẤU CỰC KHỦNG',
                    features: 'Gần trung tâm, Tiện ích hoàn hảo, Pháp lý an toàn',
                    price: 'GIÁ CHỈ TỪ 2 TỶ',
                    cta: 'LIÊN HỆ XEM NHÀ'
                });
                setEnhancements({ brightness: 100, contrast: 100, saturation: 100 });
                break;
            case 'clean':
                setFrame('simple');
                setSticker('new');
                setShowSalesInfo(false);
                setWatermark(true);
                setAdContent({
                    title1: 'CĂN HỘ',
                    title2: 'CAO CẤP',
                    subtitle: 'KHÔNG GIAN SỐNG XANH - HIỆN ĐẠI',
                    features: 'Công viên rộng 2ha, Khu vui chơi trẻ em, An ninh 24/7',
                    price: 'GIÁ TỪ 3.5 TỶ',
                    cta: 'XEM THỰC TẾ'
                });
                setEnhancements({ brightness: 102, contrast: 105, saturation: 105 });
                break;
            case 'pro':
                setFrame('none');
                setSticker('none');
                setShowSalesInfo(true);
                setWatermark(true);
                setPropertySpecs({ ...propertySpecs, area: '100', bed: '3', bath: '2', direction: 'Đông Nam' });
                setAdContent({
                    title1: 'BÁO CÁO',
                    title2: 'THÔNG TIN BĐS',
                    subtitle: 'CHI TIẾT VỀ DIỆN TÍCH, THÔNG SỐ VÀ TIỆN ÍCH',
                    features: 'Sổ hồng sẵn sàng, Hỗ trợ vay 70%, Giao dịch an toàn',
                    price: '4.2 TỶ',
                    cta: 'NHẬN TƯ VẤN'
                });
                setEnhancements({ brightness: 100, contrast: 100, saturation: 100 });
                break;
            case 'none':
            default:
                setAdContent({ title1: '', title2: '', subtitle: '', features: '', price: '', cta: 'LIÊN HỆ TƯ VẤN' });
                setActiveTemplate(null);
                setFrame('none');
                setSticker('none');
                setShowSalesInfo(false);
                setWatermark(false);
                setText('');
                setEnhancements({ brightness: 100, contrast: 100, saturation: 100 });
                setAdScale(1);
                break;
        }
    };

    // AI Generation state
    const [aiProcessing, setAiProcessing] = useState(false);
    const [aiEffect, setAiEffect] = useState<'none' | 'stage' | 'sky'>('none');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    setImage(img);
                    setAiEffect('none');
                    setAiError(null);
                    setLandPoints([]);
                    // Reset enhancements on new image
                    setEnhancements({ brightness: 100, contrast: 100, saturation: 100 });
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAiGenerate = async () => {
        if (!prompt) return;
        if (profile?.tier !== 'pro' && profile?.role !== 'admin') {
            alert('Tính năng này chỉ dành cho tài khoản PRO!');
            return;
        }

        setIsGenerating(true);
        setAiError(null);

        try {
            const base64Image = await generateImageWithAI(prompt);
            if (base64Image) {
                const img = new Image();
                img.onload = () => {
                    setImage(img);
                    setAiEffect('none');
                    setIsGenerating(false);
                    // Reset editing states
                    setActiveTab('editing');
                    setAdContent({
                        title1: 'TIÊU ĐỀ BĐS',
                        title2: 'ĐIỂM NỔI BẬT',
                        subtitle: prompt.substring(0, 50) + '...',
                        features: 'Vị trí đẹp, Pháp lý chuẩn, Giá tốt',
                        price: 'LIÊN HỆ',
                        cta: 'GỌI NGAY'
                    });
                };
                img.src = base64Image;
            } else {
                setAiError('Không thể tạo ảnh. Sếp kiểm tra lại API Key nhé!');
                setIsGenerating(false);
            }
        } catch (err: any) {
            setAiError(err.message || 'Lỗi kết nối AI.');
            setIsGenerating(false);
        }
    };

    const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (isSelectingLand || !image || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        // Hit Detection for Elements
        const elementsOrder = ['sticker', 'salesInfo', 'propertySpecs', 'customText', 'adOverlay'];
        for (const id of elementsOrder.reverse()) {
            const state = elementStates[id];
            let boxW = 0, boxH = 0;
            let boxX = state.x * canvas.width;
            let boxY = state.y * canvas.height;

            if (id === 'sticker' && sticker !== 'none') {
                boxW = canvas.width * 0.25 * state.scale;
                boxH = boxW;
            } else if (id === 'salesInfo' && showSalesInfo) {
                boxW = canvas.width * 0.35 * state.scale;
                boxH = canvas.height * 0.12 * state.scale;
            } else if (id === 'propertySpecs' && (propertySpecs.area || propertySpecs.bed)) {
                boxW = canvas.width * 0.9 * state.scale;
                boxH = canvas.height * 0.08 * state.scale;
            } else if (id === 'customText' && text) {
                boxW = canvas.width * 0.4 * state.scale;
                boxH = canvas.height * 0.08 * state.scale;
                boxX = boxX - boxW; // Right aligned
            } else if (id === 'adOverlay' && activeTemplate) {
                boxW = canvas.width * 0.6 * state.scale;
                boxH = canvas.height * 0.7 * state.scale;
            }

            if (x >= boxX && x <= boxX + boxW && y >= boxY && y <= boxY + boxH) {
                setSelectedElement(id);
                // Check for resize handle (bottom-right corner)
                const handleSize = 40 * state.scale;
                if (x >= boxX + boxW - handleSize && y >= boxY + boxH - handleSize) {
                    setIsResizing(true);
                } else {
                    setIsDragging(true);
                }
                setDragStart({
                    x: e.clientX, // Use screen coordinates for simpler delta calculation
                    y: e.clientY
                });
                return;
            }
        }
        setSelectedElement(null);
    };

    const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!selectedElement || !canvasRef.current) return;
        if (!isDragging && !isResizing) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const state = elementStates[selectedElement];

        if (isDragging) {
            // Delta in screen pixels
            const deltaX = (e.clientX - dragStart.x);
            const deltaY = (e.clientY - dragStart.y);

            // Convert delta to percentage of canvas
            // We need to account for canvas scale on screen

            const pDeltaX = deltaX * scaleX / canvas.width;
            const pDeltaY = deltaY * scaleY / canvas.height;

            let newX = state.x + pDeltaX;
            let newY = state.y + pDeltaY;

            setElementStates({
                ...elementStates,
                [selectedElement]: { ...state, x: newX, y: newY }
            });

            // Update drag start to current for next frame
            setDragStart({
                x: e.clientX,
                y: e.clientY
            });
        } else if (isResizing) {
            const boxX = state.x * canvas.width;
            const currentW = (x - boxX);
            // Rough estimation of scale based on width change
            let baseW = 0;
            if (selectedElement === 'sticker') baseW = canvas.width * 0.25;
            else if (selectedElement === 'salesInfo') baseW = canvas.width * 0.35;
            else if (selectedElement === 'propertySpecs') baseW = canvas.width * 0.9;
            else baseW = canvas.width * 0.4;

            const newScale = Math.max(0.5, Math.min(3, currentW / baseW));
            setElementStates({
                ...elementStates,
                [selectedElement]: { ...state, scale: newScale }
            });
        }
    };

    const handleCanvasMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isSelectingLand || !image || !canvasRef.current || landPoints.length >= 4) return;

        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        setLandPoints([...landPoints, { x, y }]);
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || !image) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set dimensions
        canvas.width = image.width;
        canvas.height = image.height;

        // Apply Image Filters (Brightness/Contrast)
        ctx.filter = `brightness(${enhancements.brightness}%) contrast(${enhancements.contrast}%) saturate(${enhancements.saturation}%)`;

        // Draw base image
        ctx.drawImage(image, 0, 0);
        ctx.filter = 'none'; // Reset filter for overlays

        // AI Effect Mockup
        if (aiEffect === 'stage') {
            ctx.save();
            ctx.filter = 'contrast(1.2) saturate(1.2)';
            ctx.drawImage(image, 0, 0);
            ctx.restore();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(canvas.width * 0.2, canvas.height * 0.6, canvas.width * 0.6, canvas.height * 0.3);
            ctx.fillStyle = '#fff';
            ctx.font = `${canvas.width * 0.05}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('✨ AI Virtual Staging Applied', canvas.width / 2, canvas.height * 0.75);
        } else if (aiEffect === 'sky') {
            ctx.fillStyle = '#87CEEB';
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);
            ctx.globalCompositeOperation = 'source-over';
        }

        // Draw Land Selection (Polygon with Glow)
        if (landPoints.length > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(landPoints[0].x, landPoints[0].y);
            landPoints.forEach((point, index) => {
                if (index > 0) ctx.lineTo(point.x, point.y);
            });

            if (landPoints.length === 4) {
                ctx.closePath();
                // Outer Glow effect
                ctx.shadowBlur = 30;
                ctx.shadowColor = 'rgba(255, 255, 0, 0.8)';
                ctx.strokeStyle = '#FFFF00';
                ctx.lineWidth = canvas.width * 0.008;
                ctx.stroke();

                // Animated-like pulse fill
                const gradient = ctx.createLinearGradient(
                    landPoints[0].x, landPoints[0].y,
                    landPoints[2].x, landPoints[2].y
                );
                gradient.addColorStop(0, 'rgba(255, 255, 0, 0.15)');
                gradient.addColorStop(1, 'rgba(255, 255, 0, 0.4)');
                ctx.fillStyle = gradient;
                ctx.fill();
            } else {
                ctx.strokeStyle = '#FFFF00';
                ctx.setLineDash([10, 5]);
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.setLineDash([]);

                landPoints.forEach(p => {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
                    ctx.fillStyle = '#fff';
                    ctx.fill();
                    ctx.strokeStyle = 'yellow';
                    ctx.stroke();
                });
            }
            ctx.restore();
        }

        // --- NEW PREMIUM AD OVERLAY ENGINE ---
        if (activeTemplate) {
            const state = elementStates.adOverlay;
            const drawX = state.x * canvas.width;
            const drawY = state.y * canvas.height;
            const sizeW = canvas.width * 0.6 * state.scale; // Width for text wrapping

            // Text Wrapping Helper
            const wrapText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
                const words = text.split(' ');
                let line = '';
                let currentY = y;

                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = context.measureText(testLine);
                    const testWidth = metrics.width;
                    if (testWidth > maxWidth && n > 0) {
                        context.fillText(line, x, currentY);
                        line = words[n] + ' ';
                        currentY += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                context.fillText(line, x, currentY);
                return currentY + lineHeight;
            };

            ctx.save();
            ctx.translate(drawX, drawY);
            ctx.scale(state.scale, state.scale);

            // Shadow overlay for readability
            // Shadow overlay for readability
            if (showAdBackground) {
                // User requested full image overlay
                ctx.save();
                ctx.globalCompositeOperation = 'source-over'; // Normal blending
                ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to draw full canvas

                const grad = ctx.createLinearGradient(0, canvas.height, 0, 0); // Bottom to Top
                grad.addColorStop(0, 'rgba(0,0,0,0.9)');
                grad.addColorStop(0.4, 'rgba(0,0,0,0.6)');
                grad.addColorStop(0.7, 'rgba(0,0,0,0.2)');
                grad.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.restore();
            }

            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(0,0,0,0.8)';

            let currentY = 20;

            // Line 1: Main Topic
            // Line 1: Main Topic
            ctx.fillStyle = '#FFFFFF';
            const f1Size = canvas.width * 0.05 * adScale; // Reduced size
            ctx.font = `900 ${f1Size}px 'Be Vietnam Pro', sans-serif`;
            // Wrap text logic
            currentY = wrapText(ctx, adContent.title1, 20, currentY, sizeW, f1Size * 1.2);
            currentY += f1Size * 0.2; // Extra padding

            // Line 2: Highlighted Title (Yellow)
            ctx.fillStyle = '#FFD700';
            const f2Size = canvas.width * 0.07 * adScale;
            ctx.font = `900 ${f2Size}px 'Be Vietnam Pro', sans-serif`;
            currentY = wrapText(ctx, adContent.title2, 20, currentY, sizeW, f2Size * 1.2);
            currentY += f2Size * 0.2;

            // Subtitle
            ctx.fillStyle = '#FFFFFF';
            const f3Size = canvas.width * 0.03 * adScale; // Smaller subtitle
            ctx.font = `bold ${f3Size}px 'Be Vietnam Pro', sans-serif`;
            currentY = wrapText(ctx, adContent.subtitle, 20, currentY, sizeW, f3Size * 1.3);
            currentY += f3Size * 1.0;

            // Features List
            const featureList = adContent.features ? adContent.features.split(',').map(s => s.trim()).filter(Boolean) : [];
            featureList.forEach((feature, i) => {
                const itemSize = canvas.width * 0.032 * adScale;
                ctx.fillStyle = '#22c55e'; // Green check
                ctx.font = `bold ${itemSize}px sans-serif`;
                ctx.fillText('✓', 20, currentY);
                ctx.fillStyle = '#FFFFFF';
                ctx.font = `600 ${itemSize}px 'Be Vietnam Pro', sans-serif`;
                ctx.fillText(feature, 20 + itemSize * 1.5, currentY);
                currentY += itemSize * 1.6;
            });

            // Price Badge (Absolute positioned in its own coordinate space)
            // Price Badge (Flow Layout)
            if (adContent.price) {
                currentY += 20 * adScale;
                const badgeW = canvas.width * 0.38 * adScale;
                const badgeH = canvas.width * 0.09 * adScale;

                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.roundRect(20, currentY, badgeW, badgeH, [8]);
                ctx.fill();

                ctx.fillStyle = '#000';
                ctx.font = `900 ${canvas.width * 0.045 * adScale}px 'Be Vietnam Pro', sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(adContent.price, 20 + badgeW / 2, currentY + badgeH / 2);

                currentY += badgeH;
            }

            // CTA Button Drawing
            if (adContent.cta) {
                currentY += 20 * state.scale;
                const ctaH = canvas.width * 0.06 * adScale;
                const ctaW = canvas.width * 0.25 * adScale; // Dynamic width based on text could be better but fixed is safe

                // Button Shadow
                ctx.shadowColor = 'rgba(37, 99, 235, 0.5)';
                ctx.shadowBlur = 10;

                // Button Rect
                ctx.fillStyle = '#2563eb';
                ctx.beginPath();
                ctx.roundRect(20, currentY, ctaW, ctaH, [ctaH / 2]);
                ctx.fill();

                // Button Text
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#ffffff';
                ctx.font = `800 ${ctaH * 0.45}px 'Be Vietnam Pro', sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(adContent.cta.toUpperCase(), 20 + ctaW / 2, currentY + ctaH / 2);

                // Reset align
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
            }

            // Draw Property Specs INSIDE Overlay if enabled within template
            if (activeTemplate && (propertySpecs.area || propertySpecs.bed)) {
                currentY += 30 * adScale;

                const pItemW = canvas.width * 0.15 * adScale;
                const pItemH = canvas.width * 0.08 * adScale;
                let pX = 20;

                ctx.fillStyle = 'rgba(255,255,255,0.2)';

                const specs = [
                    { icon: '📐', val: propertySpecs.area, unit: 'm²' },
                    { icon: '🛏️', val: propertySpecs.bed, unit: 'PN' },
                    { icon: '🚿', val: propertySpecs.bath, unit: 'WC' },
                ].filter(s => s.val);

                specs.forEach((s) => {
                    // Draw spec box
                    ctx.fillStyle = 'rgba(255,255,255,0.15)';
                    ctx.beginPath();
                    ctx.roundRect(pX, currentY, pItemW, pItemH, [8]);
                    ctx.fill();

                    // Text
                    ctx.fillStyle = '#fff';
                    ctx.font = `bold ${pItemH * 0.4}px 'Be Vietnam Pro'`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(`${s.val}${s.unit}`, pX + pItemW / 2, currentY + pItemH / 2);

                    pX += pItemW + 10;
                });

                // Reset
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
            }

            // Selection indicator & Resize handle
            if (selectedElement === 'adOverlay') {
                ctx.strokeStyle = '#2563eb';
                ctx.lineWidth = 5;
                ctx.setLineDash([10, 5]);
                // Restore relative size for border
                ctx.strokeRect(0, 0, canvas.width * 0.6, canvas.height * 0.7);
                ctx.setLineDash([]);

                // Handle
                ctx.fillStyle = '#2563eb';
                const hSize = 40;
                ctx.fillRect(canvas.width * 0.6 - hSize, canvas.height * 0.7 - hSize, hSize, hSize);
            }

            ctx.restore();
        }

        // --- IMPROVED PREMIUM STICKER ENGINE ---
        if (sticker !== 'none') {
            const state = elementStates.sticker;
            const size = canvas.width * 0.25 * state.scale;
            const x = state.x * canvas.width;
            const y = state.y * canvas.height;

            ctx.save();
            ctx.translate(x + size / 2, y + size / 2);
            ctx.rotate(Math.PI / 12); // Slightly less rotation for professional look

            // Premium Glow
            ctx.shadowBlur = 30 * state.scale;
            ctx.shadowColor = sticker === 'sold' || sticker === 'hot' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)';

            if (sticker === 'sold') {
                // Luxury Red Tag
                const grad = ctx.createLinearGradient(-size / 2, 0, size / 2, 0);
                grad.addColorStop(0, '#7f1d1d');
                grad.addColorStop(1, '#dc2626');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.roundRect(-size / 2, -size / 4, size, size / 2, [12 * state.scale]);
                ctx.fill();

                // Metallic Border
                ctx.strokeStyle = '#fca5a5';
                ctx.lineWidth = 3 * state.scale;
                ctx.stroke();

                ctx.fillStyle = '#FFFFFF';
                ctx.font = `900 ${size * 0.22}px 'Be Vietnam Pro', sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('ĐÃ CHỐT', 0, 0);
            } else if (sticker === 'hot') {
                // Glassmorphism Hot Badge
                ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
                ctx.beginPath();
                ctx.roundRect(-size / 2, -size / 4, size, size / 2, [50]);
                ctx.fill();

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 4 * state.scale;
                ctx.stroke();

                ctx.fillStyle = '#fff';
                ctx.font = `900 ${size * 0.2}px 'Be Vietnam Pro', sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('HOT TREND 🔥', 0, 0);
            } else if (sticker === 'new') {
                // Modern Green Badge
                const grad = ctx.createLinearGradient(-size / 2, 0, size / 2, 0);
                grad.addColorStop(0, '#14532d');
                grad.addColorStop(1, '#22c55e');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.roundRect(-size / 2, -size / 4, size, size / 2, [10]);
                ctx.fill();

                ctx.fillStyle = '#fff';
                ctx.font = `900 ${size * 0.22}px 'Be Vietnam Pro', sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('HÀNG MỚI 💎', 0, 0);
            } else if (sticker === 'deal') {
                // Premium Golden Tag
                const grad = ctx.createLinearGradient(-size / 2, -size / 4, size / 2, size / 4);
                grad.addColorStop(0, '#854d0e');
                grad.addColorStop(0.5, '#eab308');
                grad.addColorStop(1, '#854d0e');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.roundRect(-size / 2, -size / 4, size, size / 2, [8]);
                ctx.fill();

                ctx.strokeStyle = '#fef08a';
                ctx.lineWidth = 2 * state.scale;
                ctx.stroke();

                ctx.fillStyle = '#422006';
                ctx.font = `900 ${size * 0.2}px 'Be Vietnam Pro', sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('GIẢM SỐC 🏷️', 0, 0);
            }

            // Selection Box
            if (selectedElement === 'sticker') {
                ctx.restore();
                ctx.save();
                ctx.strokeStyle = '#2563eb';
                ctx.lineWidth = 3;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(x, y, size, size);
                // Resize handle
                ctx.fillStyle = '#2563eb';
                ctx.fillRect(x + size - 10, y + size - 10, 20, 20);
                ctx.restore();
            } else {
                ctx.restore();
            }
        }

        // Draw Sales Info Card
        if (showSalesInfo && profile) {
            const state = elementStates.salesInfo;
            const cardWidth = canvas.width * 0.35 * state.scale;
            const cardHeight = canvas.height * 0.12 * state.scale;
            const cardX = state.x * canvas.width;
            const cardY = state.y * canvas.height;
            const padding = cardWidth * 0.05;

            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 15 * state.scale;
            ctx.beginPath();
            ctx.roundRect(cardX, cardY, cardWidth, cardHeight, [15 * state.scale]);
            ctx.fill();

            if (selectedElement === 'salesInfo') {
                ctx.strokeStyle = '#2563eb';
                ctx.lineWidth = 3;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);
                ctx.setLineDash([]);
                ctx.fillStyle = '#2563eb';
                ctx.fillRect(cardX + cardWidth - 15, cardY + cardHeight - 15, 30, 30);
            }

            ctx.fillStyle = '#1e293b';
            ctx.textAlign = 'left';
            const nameText = profile.full_name || "Môi giới BĐS";
            ctx.font = `bold ${cardHeight * 0.25}px 'Be Vietnam Pro', sans-serif`;
            ctx.fillText(nameText, cardX + padding + 10, cardY + cardHeight * 0.35);

            ctx.fillStyle = '#2563eb';
            const phoneText = profile.phone || "Liên hệ ngay";
            ctx.font = `900 ${cardHeight * 0.3}px 'Be Vietnam Pro', sans-serif`;
            ctx.fillText(phoneText, cardX + padding + 10, cardY + cardHeight * 0.75);
            ctx.restore();
        }

        // Draw Property Specs Bar
        const hasSpecs = propertySpecs.area || propertySpecs.bed || propertySpecs.bath || propertySpecs.direction;
        if (hasSpecs) {
            const state = elementStates.propertySpecs;
            const barW = canvas.width * 0.9 * state.scale;
            const barH = canvas.height * 0.08 * state.scale;
            const barX = state.x * canvas.width;
            const barY = state.y * canvas.height;

            ctx.save();
            // Glass background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.beginPath();
            ctx.roundRect(barX, barY, barW, barH, [barH / 2]);
            ctx.fill();

            if (selectedElement === 'propertySpecs') {
                ctx.strokeStyle = '#2563eb';
                ctx.lineWidth = 3;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(barX, barY, barW, barH);
                ctx.setLineDash([]);
                ctx.fillStyle = '#2563eb';
                ctx.fillRect(barX + barW - 15, barY + barH - 15, 30, 30);
            }

            ctx.fillStyle = '#fff';
            ctx.font = `bold ${barH * 0.4}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const items = [];
            if (propertySpecs.area) items.push(`📐 ${propertySpecs.area}m²`);
            if (propertySpecs.bed) items.push(`🛏️ ${propertySpecs.bed}`);
            if (propertySpecs.bath) items.push(`🚿 ${propertySpecs.bath}`);
            if (propertySpecs.direction) items.push(`🧭 ${propertySpecs.direction}`);

            const segW = barW / items.length;
            items.forEach((item, i) => {
                ctx.fillText(item, barX + (segW * i) + (segW / 2), barY + barH / 2);
            });
            ctx.restore();
        }

        // Custom Text
        if (text) {
            const state = elementStates.customText;
            const cardW = canvas.width * 0.4 * state.scale;
            const cardH = canvas.height * 0.08 * state.scale;
            const tx = state.x * canvas.width;
            const ty = state.y * canvas.height;

            ctx.save();
            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = canvas.width * 0.005;
            ctx.font = `bold ${canvas.width * 0.05 * state.scale}px 'Be Vietnam Pro', sans-serif`;
            ctx.textAlign = 'right';
            ctx.strokeText(text, tx, ty + cardH / 2);
            ctx.fillText(text, tx, ty + cardH / 2);

            if (selectedElement === 'customText') {
                ctx.strokeStyle = '#2563eb';
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(tx - cardW, ty, cardW, cardH);
            }
            ctx.restore();
        }

        // Draw Watermark (Non-interactive)
        if (watermark) {
            ctx.save();
            ctx.globalAlpha = watermarkOpacity;
            const isProUser = profile?.tier === 'pro' || profile?.role === 'admin';
            const watermarkTxt = isProUser && (profile?.phone || profile?.agency)
                ? `${profile.agency ? profile.agency.toUpperCase() + ' - ' : ''}${profile.phone || 'CHÍNH CHỦ'}`
                : 'CHÍNH CHỦ';

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(-Math.PI / 4);
            ctx.fillStyle = 'white';
            ctx.font = `bold ${canvas.width * 0.06}px 'Be Vietnam Pro', sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(watermarkTxt, 0, 0);
            ctx.restore();
        }
    };

    useEffect(() => {
        drawCanvas();
    }, [image, text, watermark, watermarkOpacity, frame, aiEffect, profile, landPoints, showSalesInfo, sticker, propertySpecs, enhancements, activeTemplate, adContent, adScale, elementStates, selectedElement, showAdBackground]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = `masterkit-property-${Date.now()}.jpg`;
            // Use JPEG with 0.9 quality for professional compression (~5MB target for high-res)
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.click();
        }
    };

    const applyAiEffect = (effect: 'stage' | 'sky') => {
        // Mockup check - in real app, check for API key capability
        const isPro = profile?.tier === 'pro' || profile?.role === 'admin';
        if (!isPro) {
            alert('Tính năng AI nâng cao chỉ dành cho tài khoản PRO!');
            return;
        }

        if (confirm("Tính năng AI Magic hiện đang thử nghiệm (Beta). Bạn có muốn tiếp tục áp dụng hiệu ứng mẫu không?")) {
            setAiProcessing(true);
            setTimeout(() => {
                setAiEffect(effect);
                setAiProcessing(false);
            }, 2000);
        }
    };

    return (
        <div className="pb-20 md:pb-0">
            <div className="mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                    <ImageIcon className="text-blue-600" /> Image Studio (AI)
                </h1>
                <p className="text-slate-500 text-sm">Chỉnh sửa & Tạo ảnh BĐS chuyên nghiệp</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('generation')}
                    className={`pb-3 px-4 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'generation' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Crown size={14} className="text-amber-500" />
                    <Sparkles size={16} /> <span className="uppercase">Tạo ảnh AI</span>
                    {activeTab === 'generation' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('editing')}
                    className={`pb-3 px-4 font-bold text-sm transition-all relative flex items-center gap-2 ${activeTab === 'editing' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <ImageIcon size={16} /> <span className="uppercase">Chỉnh sửa ảnh</span>
                    {activeTab === 'editing' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start relative">

                {/* Editor Controls - LEFT COLUMN (Scrollable) */}
                <div className="w-full lg:w-[35%] space-y-6 order-2 lg:order-1">

                    {/* AI GENERATION TAB CONTENT */}
                    {activeTab === 'generation' && (
                        <div className="p-1 rounded-[32px] bg-gradient-to-br from-purple-500 via-blue-500 to-purple-500 shadow-2xl">
                            <div className="bg-white dark:bg-slate-900 rounded-[22px] p-6 shadow-xl">
                                <h3 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                                    <Sparkles size={18} className="text-purple-500" /> AI Image Generator
                                </h3>
                                <textarea
                                    className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm h-36 mb-4 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium resize-none"
                                    placeholder="Mô tả bất động sản bạn muốn tạo.&#10;VD: Biệt thự 2 tầng mái thái, sân vườn rộng, có hồ bơi, phong cách hiện đại..."
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                />
                                <button
                                    onClick={handleAiGenerate}
                                    disabled={isGenerating || !prompt}
                                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black rounded-2xl shadow-xl shadow-purple-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={20} />}
                                    {isGenerating ? 'AI ĐANG VẼ...' : 'TẠO ẢNH PHỐI CẢNH'}
                                </button>
                                {aiError && (
                                    <div className="mt-3 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2">
                                        <AlertCircle size={16} /> {aiError}
                                    </div>
                                )}
                                <p className="mt-4 text-[10px] text-slate-400 text-center">
                                    * Ảnh tạo ra sẽ tự động chuyển sang tab "Chỉnh sửa"
                                </p>
                            </div>
                        </div>
                    )}

                    {/* EDITING TAB CONTENT */}
                    {activeTab === 'editing' && (
                        <>
                            {/* Upload */}
                            {!image && (
                                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
                                    <label className="flex flex-col items-center justify-center w-full cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all rounded-2xl p-4">
                                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                            <Upload size={32} />
                                        </div>
                                        <p className="font-black text-sm text-slate-700 dark:text-slate-200 uppercase mb-1">Tải ảnh gốc lên</p>
                                        <p className="text-xs text-slate-400">Hỗ trợ JPG, PNG, WEBP</p>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </label>
                                </div>
                            )}

                            {image && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setImage(null)}
                                            className="py-3 text-xs font-black text-red-500 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 hover:bg-red-100 transition-all flex items-center justify-center gap-2"
                                        >
                                            <X size={16} /> XÓA ẢNH
                                        </button>
                                        <label className="py-3 text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 hover:bg-blue-100 transition-all cursor-pointer text-center flex items-center justify-center gap-2">
                                            <Upload size={16} /> THAY ẢNH
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                    </div>

                                    {/* Templates Shortcuts - NEW FEATURE */}
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase text-xs tracking-widest">
                                                <Palette size={18} className="text-purple-600" /> Template Quảng Cáo
                                            </h3>
                                            {activeTemplate && (
                                                <button
                                                    onClick={() => applyTemplate('none' as any)}
                                                    className="text-[10px] font-black text-red-500 bg-red-50 px-2 py-1 rounded-lg hover:bg-red-100 transition-all uppercase"
                                                >
                                                    Gỡ Bỏ
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {templates.map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => applyTemplate(t.id)}
                                                    className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center gap-4 text-left ${activeTemplate === t.id ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-200' : 'bg-white border-slate-50 hover:bg-slate-50 hover:border-slate-200'}`}
                                                >
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl shrink-0 relative">
                                                        {t.icon}
                                                        {t.isPro && (
                                                            <div className="absolute -top-1 -right-1">
                                                                <Crown size={10} className="text-amber-500 fill-amber-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800 uppercase">{t.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">{t.desc}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Template Content Editor - PREMIUM */}
                                    {activeTemplate && (
                                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-900/50 dark:to-slate-800/50 p-6 rounded-3xl shadow-sm border border-purple-100 dark:border-slate-800 space-y-4 animate-in slide-in-from-left-4 duration-300">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase text-[10px] tracking-widest text-purple-700">
                                                    <Sliders size={16} /> Tùy chỉnh nội dung mẫu (PRO)
                                                </h3>
                                                <Crown size={14} className="text-amber-500" />
                                            </div>

                                            <div className="space-y-3">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Tiêu đề 1</label>
                                                        <input
                                                            type="text"
                                                            className="w-full p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                                                            value={adContent.title1}
                                                            onChange={e => setAdContent({ ...adContent, title1: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Tiêu đề 2 (Vàng)</label>
                                                        <input
                                                            type="text"
                                                            className="w-full p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                                                            value={adContent.title2}
                                                            onChange={e => setAdContent({ ...adContent, title2: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Mô tả phụ</label>
                                                    <input
                                                        type="text"
                                                        className="w-full p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                                                        value={adContent.subtitle}
                                                        onChange={e => setAdContent({ ...adContent, subtitle: e.target.value })}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Giá hiển thị</label>
                                                        <input
                                                            type="text"
                                                            className="w-full p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                                                            value={adContent.price}
                                                            onChange={e => setAdContent({ ...adContent, price: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Nút Gọi (CTA)</label>
                                                        <input
                                                            type="text"
                                                            className="w-full p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                                                            value={adContent.cta}
                                                            onChange={e => setAdContent({ ...adContent, cta: e.target.value })}
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Danh sách đặc điểm (Phân tách bằng dấu phẩy)</label>
                                                    <textarea
                                                        className="w-full p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs font-bold focus:ring-2 focus:ring-purple-500 outline-none h-20 resize-none"
                                                        value={adContent.features}
                                                        onChange={e => setAdContent({ ...adContent, features: e.target.value })}
                                                    />
                                                </div>

                                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                                    <div className="flex justify-between text-[10px] font-black text-slate-500 mb-2">
                                                        <span className="uppercase tracking-widest">Kích thước nội dung</span>
                                                        <span className="text-purple-600">{(adScale * 100).toFixed(0)}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0.5" max="1.5" step="0.1"
                                                        value={adScale}
                                                        onChange={e => setAdScale(parseFloat(e.target.value))}
                                                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* New Real Estate Utilities */}
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                                        <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase text-xs tracking-widest">
                                            <MousePointer2 size={18} className="text-green-600" /> Tiện ích BĐS
                                        </h3>

                                        {/* Land Selection (Existing) */}
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">1. Khoanh vùng lô đất (4 góc)</p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setIsSelectingLand(!isSelectingLand);
                                                        if (landPoints.length === 4) setLandPoints([]); // Reset if re-starting
                                                    }}
                                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${isSelectingLand ? 'bg-green-600 text-white border-green-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                                >
                                                    {isSelectingLand ? 'Đang chọn (Click 4 điểm)' : 'Bắt đầu chọn đất'}
                                                </button>
                                                {landPoints.length > 0 && (
                                                    <button
                                                        onClick={() => setLandPoints([])}
                                                        className="p-2 text-red-500 bg-red-50 rounded-xl hover:bg-red-100"
                                                        title="Xóa vùng chọn"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Stickers (New) */}
                                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">2. Nhãn Trạng Thái (Sticker)</p>
                                            <div className="grid grid-cols-4 gap-2">
                                                {[
                                                    { id: 'none', label: 'None', icon: <X size={14} /> },
                                                    { id: 'sold', label: 'ĐÃ BÁN', color: 'text-red-600' },
                                                    { id: 'hot', label: 'HOT 🔥', color: 'text-orange-500' },
                                                    { id: 'new', label: 'MỚI', color: 'text-green-600' },
                                                    { id: 'deal', label: 'GIẢM', color: 'text-yellow-600' },
                                                ].map((s: any) => (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => setSticker(sticker === s.id ? 'none' : s.id)}
                                                        className={`p-2 rounded-xl text-[10px] font-bold border transition-all flex flex-col items-center gap-1 ${sticker === s.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-blue-200'}`}
                                                    >
                                                        {s.icon || <Stamp size={14} className={s.color} />}
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Property Specs (New) */}
                                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">3. Thanh thông số (Thông tin dưới ảnh)</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="relative">
                                                    <Maximize size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="DT (m2)"
                                                        className="w-full pl-8 p-2 rounded-xl text-xs bg-slate-50 border border-slate-200 outline-none focus:border-blue-500"
                                                        value={propertySpecs.area}
                                                        onChange={e => setPropertySpecs({ ...propertySpecs, area: e.target.value })}
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <BedDouble size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Hợp ngủ"
                                                        className="w-full pl-8 p-2 rounded-xl text-xs bg-slate-50 border border-slate-200 outline-none focus:border-blue-500"
                                                        value={propertySpecs.bed}
                                                        onChange={e => setPropertySpecs({ ...propertySpecs, bed: e.target.value })}
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <Bath size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="WC"
                                                        className="w-full pl-8 p-2 rounded-xl text-xs bg-slate-50 border border-slate-200 outline-none focus:border-blue-500"
                                                        value={propertySpecs.bath}
                                                        onChange={e => setPropertySpecs({ ...propertySpecs, bath: e.target.value })}
                                                    />
                                                </div>
                                                <div className="relative">
                                                    <Compass size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Hướng"
                                                        className="w-full pl-8 p-2 rounded-xl text-xs bg-slate-50 border border-slate-200 outline-none focus:border-blue-500"
                                                        value={propertySpecs.direction}
                                                        onChange={e => setPropertySpecs({ ...propertySpecs, direction: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Sales Info (Existing) */}
                                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <p className="text-[10px] font-black text-slate-400 uppercase">4. Thẻ thông tin Sale</p>
                                            <button
                                                onClick={() => setShowSalesInfo(!showSalesInfo)}
                                                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${showSalesInfo ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                                            >
                                                <UserCircle2 size={16} />
                                                {showSalesInfo ? 'Đang hiện thông tin' : 'Hiện thông tin Sale'}
                                            </button>
                                            {showSalesInfo && (
                                                <p className="text-[10px] text-slate-400">
                                                    Đang hiện: <span className="font-bold text-blue-500">{profile?.full_name}</span> - {profile?.phone}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Image Enhancements (New) */}
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                                        <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase text-xs tracking-widest">
                                            <Palette size={18} className="text-pink-500" /> Bộ Lọc Ảnh
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                                                    <span>Độ sáng</span>
                                                    <span>{enhancements.brightness}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="50" max="150"
                                                    value={enhancements.brightness}
                                                    onChange={e => setEnhancements({ ...enhancements, brightness: parseInt(e.target.value) })}
                                                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                                                    <span>Độ tương phản</span>
                                                    <span>{enhancements.contrast}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="50" max="150"
                                                    value={enhancements.contrast}
                                                    onChange={e => setEnhancements({ ...enhancements, contrast: parseInt(e.target.value) })}
                                                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Standard Tools (Existing) */}
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
                                        <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase text-xs tracking-widest">
                                            <Type size={18} className="text-blue-500" /> Branding Tools
                                        </h3>
                                        <div className="flex items-center justify-between mb-6 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded-full ${showAdBackground ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Nền mờ overlay</span>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={showAdBackground} onChange={() => setShowAdBackground(!showAdBackground)} className="sr-only peer" />
                                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">Tiêu đề chính</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="VD: 0909.xxx.xxx - 2.5 Tỷ"
                                                    value={text}
                                                    onChange={(e) => setText(e.target.value)}
                                                />
                                            </div>
                                            <label className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 cursor-pointer group transition-all">
                                                <input
                                                    type="checkbox"
                                                    checked={watermark}
                                                    onChange={(e) => setWatermark(e.target.checked)}
                                                    className="w-5 h-5 rounded-md text-blue-600 border-slate-200 focus:ring-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">Đóng dấu bản quyền</p>
                                                    <p className="text-[10px] text-slate-400">
                                                        {profile?.tier === 'pro' || profile?.role === 'admin'
                                                            ? `Dùng: ${profile?.agency ? profile.agency + ' - ' : ''}${profile?.phone || 'Chính Chủ'}`
                                                            : 'Dùng text mặc định "CHÍNH CHỦ"'}
                                                    </p>
                                                </div>
                                            </label>

                                            {watermark && (
                                                <div className="px-3">
                                                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                                                        <span>Độ trong suốt</span>
                                                        <span>{(watermarkOpacity * 100).toFixed(0)}%</span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0.1" max="1" step="0.05"
                                                        value={watermarkOpacity}
                                                        onChange={e => setWatermarkOpacity(parseFloat(e.target.value))}
                                                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                                        <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase text-xs tracking-widest">
                                            <Layers size={18} className="text-blue-500" /> Khung ảnh (Frame)
                                        </h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['none', 'simple', 'modern'].map(f => (
                                                <button
                                                    key={f}
                                                    onClick={() => setFrame(frame === f ? 'none' : f as any)}
                                                    className={`py-2 px-1 text-[10px] font-black border-2 rounded-xl transition-all ${frame === f ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-blue-400'}`}
                                                >
                                                    {f.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-sm z-10">PRO</div>
                                        <h3 className="font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase text-xs tracking-widest">
                                            <Wand2 size={18} className="text-purple-500" /> AI Magic Effects
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            <button
                                                onClick={() => applyAiEffect('stage')}
                                                disabled={aiProcessing}
                                                className="w-full py-3 px-4 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30 rounded-2xl text-xs font-black hover:bg-purple-100 transition-all flex items-center justify-center gap-3"
                                            >
                                                🏠 VIRTUAL STAGING (AI)
                                            </button>
                                            <button
                                                onClick={() => applyAiEffect('sky')}
                                                disabled={aiProcessing}
                                                className="w-full py-3 px-4 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 border border-sky-100 dark:border-sky-900/30 rounded-2xl text-xs font-black hover:bg-sky-100 transition-all flex items-center justify-center gap-3"
                                            >
                                                ☁️ THAY BẦU TRỜI XANH
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Canvas Preview - RIGHT COLUMN (Sticky) */}
                <div className="w-full lg:w-[65%] lg:sticky lg:top-6 order-1 lg:order-2">
                    <div className={`bg-slate-100 dark:bg-slate-950 rounded-[40px] border-4 border-white dark:border-slate-900 flex items-center justify-center relative overflow-hidden min-h-[500px] lg:min-h-[700px] shadow-2xl ${isSelectingLand ? 'cursor-crosshair' : 'cursor-default'}`}>
                        {!image && !isGenerating && (
                            <div className="text-slate-300 flex flex-col items-center">
                                <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                    <ImageIcon size={40} className="opacity-20" />
                                </div>
                                <p className="text-sm font-black uppercase tracking-widest text-center px-6">
                                    {activeTab === 'generation' ? 'Nhập mô tả để AI vẽ phối cảnh' : 'Tải ảnh của bạn lên để bắt đầu Design'}
                                </p>
                            </div>
                        )}

                        {isGenerating && (
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-20 h-20 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <div className="text-center">
                                    <p className="text-xl font-black text-blue-600 animate-pulse uppercase tracking-tighter">AI Đang Vẽ Phối Cảnh...</p>
                                    <p className="text-xs text-slate-400 mt-1 font-bold italic">Sếp vui lòng đợi trong giây lát</p>
                                </div>
                            </div>
                        )}

                        <canvas
                            ref={canvasRef}
                            onMouseDown={handleCanvasMouseDown}
                            onMouseMove={handleCanvasMouseMove}
                            onMouseUp={handleCanvasMouseUp}
                            onMouseLeave={handleCanvasMouseUp}
                            onTouchStart={handleCanvasTouchStart}
                            onTouchMove={handleCanvasTouchMove}
                            onTouchEnd={handleCanvasTouchEnd}
                            onClick={handleCanvasClick}
                            className={`max-w-full max-h-[85vh] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] rounded-2xl ${(!image || isGenerating) ? 'hidden' : ''} transition-all duration-300 ${selectedElement ? 'cursor-move' : (isSelectingLand ? 'cursor-crosshair' : 'cursor-default')}`}
                        />

                        {aiProcessing && (
                            <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white backdrop-blur-md z-20 animate-in fade-in duration-300">
                                <div className="relative">
                                    <Wand2 size={64} className="animate-bounce mb-4 text-purple-400" />
                                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full animate-ping"></div>
                                </div>
                                <p className="text-2xl font-black tracking-tighter italic uppercase">AI MAGIC PROCESSING...</p>
                                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Đang tối ưu hóa hình ảnh</p>
                            </div>
                        )}
                    </div>

                    {image && !isGenerating && (
                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <Layers size={18} className="text-blue-500" />
                                <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">Studio Quality: {image.width}×{image.height}px</span>
                            </div>
                            <button
                                onClick={handleDownload}
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 hover:to-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 hover:scale-[1.03] active:scale-95 transition-all text-lg"
                            >
                                <Download size={24} /> TẢI ẢNH CHẤT LƯỢNG CAO
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
