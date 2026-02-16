import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Upload, Download, Type, Layers, Wand2, X, Sparkles, AlertCircle, Phone, Building2, MousePointer2, UserCircle2, Trash2, BedDouble, Bath, Maximize, Compass, Sun, Palette, Stamp, Tag } from 'lucide-react';
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
        features: [] as string[],
        price: '',
        cta: 'LIÊN HỆ TƯ VẤN'
    });

    // Templates State
    const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

    const templates = [
        { id: 'luxury', name: 'Biệt Thự Sang Trọng', icon: '💎', desc: 'Khung vàng, thẻ tên Pro, phong cách thượng lưu' },
        { id: 'urgent', name: 'Bán Gấp - Chốt Nhanh', icon: '🔥', desc: 'Tone đỏ, nhãn Giảm sốc, cực kỳ nổi bật' },
        { id: 'clean', name: 'Minimalist Clean', icon: '✨', desc: 'Tối giản, tập trung vào hình ảnh và thông số' },
        { id: 'facebook', name: 'Quảng Cáo FB/Zalo', icon: '📱', desc: 'Thông tin to rõ, sticker Hot, thu hút click' },
        { id: 'pro', name: 'Professional Report', icon: '📊', desc: 'Đầy đủ thông số, watermark chính chủ' },
    ];

    const applyTemplate = (id: string) => {
        if (id === activeTemplate) {
            applyTemplate('none' as any); // Toggle off if same template is clicked
            return;
        }

        setActiveTemplate(id === 'none' ? null : id);
        switch (id) {
            case 'luxury':
                setFrame('modern');
                setSticker('none');
                setShowSalesInfo(true);
                setWatermark(false);
                setAdContent({
                    title1: 'BIỆT THỰ',
                    title2: 'SANG TRỌNG',
                    subtitle: 'VỊ TRÍ ĐẮC ĐỊA - ĐẲNG CẤP THƯỢNG LƯU',
                    features: ['Nội thất cao cấp', 'Hồ bơi vô cực', 'View panorama'],
                    price: 'GIÁ THỎA THUẬN',
                    cta: 'NHẬN BÁO GIÁ'
                });
                setEnhancements({ brightness: 105, contrast: 110, saturation: 110 });
                break;
            case 'urgent':
                setFrame('simple');
                setSticker('deal');
                setShowSalesInfo(false);
                setWatermark(false);
                setAdContent({
                    title1: 'BÁN GẤP',
                    title2: 'CẮT LỖ',
                    subtitle: 'CHỦ NHÀ CẦN TIỀN - CHỐT NHANH TRONG TUẦN',
                    features: ['Sổ đỏ chính chủ', 'Hạ tầng hoàn thiện', 'Dân cư đông đúc'],
                    price: 'GIÁ SỐC 3.x TỶ',
                    cta: 'GỌI NGAY'
                });
                setEnhancements({ brightness: 100, contrast: 120, saturation: 100 });
                break;
            case 'clean':
                setFrame('none');
                setSticker('none');
                setShowSalesInfo(true);
                setWatermark(true);
                setAdContent({
                    title1: 'CĂN HỘ',
                    title2: 'CAO CẤP',
                    subtitle: 'KHÔNG GIAN SỐNG XANH - HIÊN ĐẠI',
                    features: ['Full thổ cư', 'Gần trường học', 'Tiện ích 5 sao'],
                    price: 'TRẢ TRƯỚC 30%',
                    cta: 'XEM NHÀ NGAY'
                });
                setEnhancements({ brightness: 100, contrast: 105, saturation: 95 });
                break;
            case 'facebook':
                setFrame('none');
                setSticker('hot');
                setShowSalesInfo(true);
                setAdContent({
                    title1: 'ĐẤT NỀN',
                    title2: 'GIÁ TỐT',
                    subtitle: 'SỔ ĐỎ TRAO TAY - NHẬN NỀN NGAY',
                    features: ['Full Thổ Cư 100%', 'Mặt Tiền Đường Nhựa', 'Pháp Lý Minh Bạch'],
                    price: 'CHỈ TỪ 2.x TỶ',
                    cta: 'LIÊN HỆ TƯ VẤN'
                });
                setEnhancements({ brightness: 110, contrast: 110, saturation: 120 });
                break;
            case 'pro':
                setFrame('simple');
                setSticker('new');
                setShowSalesInfo(true);
                setWatermark(true);
                setAdContent({
                    title1: 'CƠ HỘI',
                    title2: 'ĐẦU TƯ',
                    subtitle: 'SINH LỜI CỰC TỐT - THANH KHOẢN CAO',
                    features: ['Vị trí vàng', 'Pháp lý sạch', 'Hỗ trợ vay 70%'],
                    price: 'SUẤT NGOẠI GIAO',
                    cta: 'XEM THÔNG TIN'
                });
                setEnhancements({ brightness: 100, contrast: 100, saturation: 100 });
                break;
            case 'none': // Reset to default state
            default:
                setAdContent({ title1: '', title2: '', subtitle: '', features: [], price: '', cta: 'LIÊN HỆ TƯ VẤN' });
                setFrame('none');
                setSticker('none');
                setShowSalesInfo(false);
                setWatermark(false);
                setText('');
                setEnhancements({ brightness: 100, contrast: 100, saturation: 100 });
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
                    setActiveTab('editing');
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
            const pad = canvas.width * 0.05;

            // 1. Shadow overlay for text readability
            const grad = ctx.createLinearGradient(0, 0, canvas.width * 0.6, 0);
            grad.addColorStop(0, 'rgba(0,0,0,0.7)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width * 0.6, canvas.height);

            // 2. Titles
            ctx.save();
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.shadowBlur = 10;
            ctx.shadowColor = 'rgba(0,0,0,0.5)';

            // Line 1
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `900 ${canvas.width * 0.07}px system-ui, sans-serif`;
            ctx.fillText(adContent.title1, pad, pad);

            // Line 2 (Highlight - Yellow)
            ctx.fillStyle = '#FFD700'; // Gold/Yellow like the example
            ctx.font = `900 ${canvas.width * 0.09}px system-ui, sans-serif`;
            const title1Height = canvas.width * 0.08;
            ctx.fillText(adContent.title2, pad, pad + title1Height);

            // Subtitle
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `bold ${canvas.width * 0.035}px system-ui, sans-serif`;
            const title2Height = canvas.width * 0.1;
            ctx.fillText(adContent.subtitle, pad, pad + title1Height + title2Height);

            // Features List with Checkmarks
            const listYStart = pad + title1Height + title2Height + canvas.width * 0.06;
            adContent.features.forEach((feature, i) => {
                const itemY = listYStart + (i * canvas.width * 0.05);

                // Checkmark Circle
                ctx.beginPath();
                ctx.arc(pad + 15, itemY + 12, 12, 0, Math.PI * 2);
                ctx.fillStyle = '#FFFFFF';
                ctx.fill();

                ctx.fillStyle = '#22c55e'; // Green
                ctx.font = `bold ${canvas.width * 0.02}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.fillText('✓', pad + 15, itemY + 2);

                // Feature Text
                ctx.textAlign = 'left';
                ctx.fillStyle = '#FFFFFF';
                ctx.font = `bold ${canvas.width * 0.03}px system-ui, sans-serif`;
                ctx.fillText(feature, pad + 40, itemY);
            });

            // Price Badge (Yellow Angled Tag)
            if (adContent.price) {
                const badgeW = canvas.width * 0.35;
                const badgeH = canvas.width * 0.08;
                const badgeX = pad;
                const badgeY = canvas.height - pad - (showSalesInfo ? canvas.height * 0.15 : 0) - badgeH - canvas.width * 0.05;

                ctx.save();
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.moveTo(badgeX, badgeY);
                ctx.lineTo(badgeX + badgeW, badgeY);
                ctx.lineTo(badgeX + badgeW - 20, badgeY + badgeH);
                ctx.lineTo(badgeX, badgeY + badgeH);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.fillStyle = '#000000';
                ctx.font = `900 ${canvas.width * 0.04}px system-ui, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(adContent.price, badgeX + badgeW / 2 - 10, badgeY + badgeH / 2);
                ctx.restore();
            }

            // CTA Ribbon (Red Button)
            if (profile?.phone || adContent.cta) {
                const ctaText = adContent.cta;
                const btnW = canvas.width * 0.38;
                const btnH = canvas.width * 0.07;
                const btnX = canvas.width - btnW - pad;
                const btnY = canvas.height - btnH - pad;

                // Gradient background for button
                const btnGrad = ctx.createLinearGradient(btnX, 0, btnX + btnW, 0);
                btnGrad.addColorStop(0, '#ef4444');
                btnGrad.addColorStop(1, '#f87171');

                ctx.fillStyle = btnGrad;
                ctx.beginPath();
                const r = btnH / 2;
                ctx.roundRect(btnX, btnY, btnW, btnH, [r]);
                ctx.fill();

                // Border
                ctx.strokeStyle = 'rgba(255,255,255,0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Icon + Text
                ctx.fillStyle = '#FFFFFF';
                ctx.font = `bold ${canvas.width * 0.03}px system-ui, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`📞 ${ctaText}`, btnX + btnW / 2, btnY + btnH / 2);
            }

            ctx.restore();
        }

        // Draw Frame
        if (frame === 'simple') {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = canvas.width * 0.02;
            ctx.strokeRect(canvas.width * 0.05, canvas.height * 0.05, canvas.width * 0.9, canvas.height * 0.9);
        } else if (frame === 'modern') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, canvas.height * 0.85, canvas.width, canvas.height * 0.15);
            ctx.fillStyle = '#FFD700';
            ctx.font = `bold ${canvas.width * 0.04}px sans-serif`;
            ctx.textAlign = 'left';
            ctx.fillText('HOT DEAL', canvas.width * 0.05, canvas.height * 0.92);
            ctx.fillStyle = '#fff';
            ctx.font = `${canvas.width * 0.03}px sans-serif`;
            ctx.fillText('LIÊN HỆ XEM NHÀ NGAY', canvas.width * 0.05, canvas.height * 0.96);
        }

        // Draw Sales Info Card (Moved to Top Right to avoid title overlap)
        if (showSalesInfo && profile) {
            const cardWidth = canvas.width * 0.35;
            const cardHeight = canvas.height * 0.12;
            const cardX = canvas.width - cardWidth - (canvas.width * 0.05); // Top Right
            const cardY = canvas.height * 0.05;
            const padding = cardWidth * 0.05;

            ctx.save();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 10;
            ctx.beginPath();

            const r = 15;
            ctx.roundRect(cardX, cardY, cardWidth, cardHeight, [r]);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#1e293b';
            ctx.textAlign = 'left';

            const nameText = profile.full_name || profile.agency || "Môi giới BĐS";
            ctx.font = `bold ${cardHeight * 0.25}px sans-serif`;
            ctx.fillText(nameText, cardX + padding + 10, cardY + cardHeight * 0.35);

            ctx.fillStyle = '#2563eb';
            const phoneText = profile.phone || profile.agency || "Liên hệ ngay";
            ctx.font = `bold ${cardHeight * 0.3}px sans-serif`;
            ctx.fillText(phoneText, cardX + padding + 10, cardY + cardHeight * 0.75);

            // Left accent bar
            ctx.fillStyle = '#2563eb';
            ctx.fillRect(cardX + 2, cardY + cardHeight * 0.15, 6, cardHeight * 0.7);
            ctx.restore();
        }

        // Draw Property Specs Bar
        const hasSpecs = propertySpecs.area || propertySpecs.bed || propertySpecs.bath || propertySpecs.direction;
        if (hasSpecs) {
            const barHeight = canvas.height * 0.08;
            const barY = canvas.height - barHeight - (frame === 'modern' ? canvas.height * 0.15 : canvas.height * 0.05);
            const barWidth = canvas.width * 0.9;
            const barX = (canvas.width - barWidth) / 2;

            // Bar Background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            ctx.beginPath();

            const r = barHeight / 2;
            ctx.moveTo(barX + r, barY);
            ctx.lineTo(barX + barWidth - r, barY);
            ctx.quadraticCurveTo(barX + barWidth, barY, barX + barWidth, barY + r);
            ctx.lineTo(barX + barWidth, barY + barHeight - r);
            ctx.quadraticCurveTo(barX + barWidth, barY + barHeight, barX + barWidth - r, barY + barHeight);
            ctx.lineTo(barX + r, barY + barHeight);
            ctx.quadraticCurveTo(barX, barY + barHeight, barX, barY + barHeight - r);
            ctx.lineTo(barX, barY + r);
            ctx.quadraticCurveTo(barX, barY, barX + r, barY);

            ctx.closePath();
            ctx.fill();

            // Draw Icons & Text
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${barHeight * 0.4}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const items = [];
            if (propertySpecs.area) items.push(`📐 ${propertySpecs.area}m²`);
            if (propertySpecs.bed) items.push(`🛏️ ${propertySpecs.bed}`);
            if (propertySpecs.bath) items.push(`🚿 ${propertySpecs.bath}`);
            if (propertySpecs.direction) items.push(`🧭 ${propertySpecs.direction}`);

            const segmentWidth = barWidth / items.length;
            const centerY = barY + barHeight / 2;

            items.forEach((item, index) => {
                const centerX = barX + (segmentWidth * index) + (segmentWidth / 2);
                ctx.fillText(item, centerX, centerY);
                // Vertical divider
                if (index < items.length - 1) {
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.fillRect(barX + (segmentWidth * (index + 1)), barY + barHeight * 0.2, 1, barHeight * 0.6);
                    ctx.fillStyle = '#fff';
                }
            });
        }

        // Draw Sticker
        if (sticker !== 'none') {
            const size = canvas.width * 0.25;
            const x = canvas.width - size - size * 0.2;
            const y = size * 0.2;

            ctx.save();
            ctx.translate(x + size / 2, y + size / 2);
            ctx.rotate(Math.PI / 6); // 30 deg

            if (sticker === 'sold') {
                ctx.strokeStyle = '#ef4444'; // Red-500
                ctx.lineWidth = size * 0.05;
                ctx.strokeRect(-size / 2, -size / 4, size, size / 2);
                ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
                ctx.fillRect(-size / 2, -size / 4, size, size / 2);

                ctx.fillStyle = '#ef4444';
                ctx.font = `900 ${size * 0.25}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('ĐÃ BÁN', 0, 0);
            } else if (sticker === 'hot') {
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#fff';
                ctx.font = `900 ${size * 0.3}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('HOT 🔥', 0, 0);
            } else if (sticker === 'new') {
                ctx.fillStyle = '#22c55e'; // Green-500
                ctx.beginPath();
                ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#fff';
                ctx.font = `900 ${size * 0.3}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('MỚI', 0, 0);
            } else if (sticker === 'deal') {
                ctx.fillStyle = '#eab308'; // Yellow-500
                ctx.beginPath();
                // Star shape approx
                for (let i = 0; i < 5; i++) {
                    ctx.lineTo(Math.cos((18 + i * 72) / 180 * Math.PI) * size / 2, -Math.sin((18 + i * 72) / 180 * Math.PI) * size / 2);
                    ctx.lineTo(Math.cos((54 + i * 72) / 180 * Math.PI) * size / 4, -Math.sin((54 + i * 72) / 180 * Math.PI) * size / 4);
                }
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = '#854d0e'; // Dark yellow
                ctx.font = `900 ${size * 0.2}px sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('GIẢM SỐC', 0, 0);
            }
            ctx.restore();
        }

        // Draw Custom Text
        if (text) {
            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = canvas.width * 0.005;
            ctx.font = `bold ${canvas.width * 0.05}px sans-serif`;
            ctx.textAlign = 'right';
            ctx.strokeText(text, canvas.width * 0.95, canvas.height * 0.1);
            ctx.fillText(text, canvas.width * 0.95, canvas.height * 0.1);
        }

        // Draw Watermark
        if (watermark) {
            ctx.save();
            ctx.globalAlpha = 0.4;
            const isPro = profile?.tier === 'pro' || profile?.role === 'admin';
            const watermarkText = isPro && (profile?.phone || profile?.agency)
                ? `${profile.agency ? profile.agency.toUpperCase() + ' - ' : ''}${profile.phone || 'CHÍNH CHỦ'}`
                : 'CHÍNH CHỦ';

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(-Math.PI / 4);
            ctx.fillStyle = 'white';
            ctx.font = `bold ${canvas.width * 0.06}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 10;
            ctx.fillText(watermarkText, 0, 0);
            ctx.restore();
        }
    };

    useEffect(() => {
        drawCanvas();
    }, [image, text, watermark, frame, aiEffect, profile, landPoints, showSalesInfo, sticker, propertySpecs, enhancements, activeTemplate, adContent]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = `masterkit-property-${Date.now()}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    const applyAiEffect = (effect: 'stage' | 'sky') => {
        setAiProcessing(true);
        setTimeout(() => {
            setAiEffect(effect);
            setAiProcessing(false);
        }, 2000);
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
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl shrink-0">
                                                        {t.icon}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-slate-800 uppercase">{t.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">{t.desc}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

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
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1">Giá / Hotline hiển thị góc</label>
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
                            onClick={handleCanvasClick}
                            className={`max-w-full max-h-[85vh] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] rounded-2xl ${(!image || isGenerating) ? 'hidden' : ''} transition-all duration-500 transform hover:scale-[1.01]`}
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
