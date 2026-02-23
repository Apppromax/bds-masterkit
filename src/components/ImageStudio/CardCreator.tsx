import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Download, ArrowRight, RefreshCw, Zap, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fabric } from 'fabric';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

const CARD_WIDTH = 1050;
const CARD_HEIGHT = 600;
const TAG_WIDTH = 600;
const TAG_HEIGHT = 130;

const CardCreator = ({ onBack, onAttachToPhoto }: { onBack: () => void, onAttachToPhoto?: (tagDataUrl: string) => void }) => {
    const { profile } = useAuth();
    const [activeMode, setActiveMode] = useState<'card' | 'tag'>('card');
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
            const currentW = activeMode === 'card' ? CARD_WIDTH : TAG_WIDTH;
            const currentH = activeMode === 'card' ? CARD_HEIGHT : TAG_HEIGHT;

            const scale = Math.min(
                (containerRef.current.clientWidth - 40) / currentW,
                (containerRef.current.clientHeight - 40) / currentH
            );
            canvas.setDimensions({ width: currentW * scale, height: currentH * scale });
            canvas.setZoom(scale);
        };

        fabricCanvasRef.current = canvas;
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [activeMode]);

    const fontsLoadedRef = useRef(false);
    const imageCache = useRef<Record<string, fabric.Image>>({});

    const loadImg = (url: string): Promise<fabric.Image> => {
        if (imageCache.current[url]) return Promise.resolve(imageCache.current[url]);
        return new Promise(r => {
            fabric.Image.fromURL(url, img => {
                imageCache.current[url] = img;
                r(img);
            }, { crossOrigin: 'anonymous' });
        });
    };

    useEffect(() => {
        const cleanup = initCanvas();
        const triggerRender = async () => {
            if (document.fonts && !fontsLoadedRef.current) {
                await document.fonts.ready;
                await new Promise(resolve => setTimeout(resolve, 500));
                fontsLoadedRef.current = true;
            }

            // Pre-load essential assets to prevent flickering
            if (formData.avatarUrl) await loadImg(formData.avatarUrl);
            if (companyLogo) await loadImg(companyLogo);

            renderTemplate();
        };
        triggerRender();
        return cleanup;
    }, [initCanvas, formData, activeTemplate, activeSide, activeMode, companyLogo, showQRCode, showTagline]);

    const renderTemplate = async () => {
        const canvas = fabricCanvasRef.current;
        if (!canvas) return;
        canvas.clear();

        if (activeMode === 'card') {
            if (activeTemplate === 'orange_waves') await renderOrangeWaves(canvas);
            else if (activeTemplate === 'luxury_gold') await renderLuxuryGold(canvas);
            else if (activeTemplate === 'blue_geo') await renderBlueGeo(canvas);
        } else {
            if (activeTemplate === 'orange_waves') await renderOrangeWavesTag(canvas);
            else if (activeTemplate === 'luxury_gold') await renderLuxuryGoldTag(canvas);
            else if (activeTemplate === 'blue_geo') await renderBlueGeoTag(canvas);
        }
        canvas.renderAll();
    };

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

    const renderOrangeWavesTag = async (canvas: fabric.Canvas) => {
        const primary = '#f6b21b';
        canvas.setBackgroundColor('transparent', () => { });
        const bg = new fabric.Rect({ width: TAG_WIDTH, height: TAG_HEIGHT, fill: '#ffffff', rx: 20, ry: 20, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.15)', blur: 15, offsetX: 0, offsetY: 5 }) });
        canvas.add(bg);

        // Sleeker wave
        canvas.add(new fabric.Path('M 0 0 L 140 0 C 110 40 110 90 140 130 L 0 130 Z', { fill: primary, selectable: false }));
        await drawCompanyLogo(canvas, 55, 65, 60);

        canvas.add(new fabric.Text(formData.name.toUpperCase(), { left: 160, top: 30, fontSize: 28, fontWeight: '900', fill: '#1a1a1a', fontFamily: 'Montserrat' }));
        canvas.add(new fabric.Text('CALL: ' + formData.phone1, { left: 160, top: 68, fontSize: 20, fill: '#64748b', fontWeight: '800', fontFamily: 'Inter' }));
        canvas.add(new fabric.Text(formData.company.toUpperCase(), { left: 160, top: 96, fontSize: 13, fill: primary, fontWeight: '900', fontFamily: 'Inter', charSpacing: 100 }));
    };

    const renderLuxuryGoldTag = async (canvas: fabric.Canvas) => {
        const gold = '#c5a059';
        canvas.setBackgroundColor('transparent', () => { });
        const bg = new fabric.Rect({ width: TAG_WIDTH, height: TAG_HEIGHT, fill: '#0a0a0a', rx: 20, ry: 20, stroke: gold, strokeWidth: 1.5, shadow: new fabric.Shadow({ color: 'rgba(197, 160, 89, 0.25)', blur: 20, offsetX: 0, offsetY: 8 }) });
        canvas.add(bg);

        await drawCompanyLogo(canvas, 65, 65, 70);

        canvas.add(new fabric.Text(formData.name.toUpperCase(), { left: 150, top: 30, fontSize: 28, fontWeight: '900', fill: gold, fontFamily: 'Montserrat' }));
        canvas.add(new fabric.Rect({ left: 150, top: 65, width: 320, height: 1, fill: gold, opacity: 0.3 }));
        canvas.add(new fabric.Text('HOTLINE: ' + formData.phone1, { left: 150, top: 75, fontSize: 18, fill: '#ffffff', fontWeight: '800', fontFamily: 'Inter', charSpacing: 50 }));
        canvas.add(new fabric.Text(formData.company.toUpperCase(), { left: 150, top: 102, fontSize: 12, fill: gold, fontWeight: '900', fontFamily: 'Inter', charSpacing: 150, opacity: 0.8 }));
    };

    const renderBlueGeoTag = async (canvas: fabric.Canvas) => {
        const primaryBlue = '#0984e3';
        canvas.setBackgroundColor('transparent', () => { });
        const bg = new fabric.Rect({ width: TAG_WIDTH, height: TAG_HEIGHT, fill: '#ffffff', rx: 20, ry: 20, shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.08)', blur: 12, offsetX: 0, offsetY: 4 }) });
        canvas.add(bg);

        canvas.add(new fabric.Rect({ width: 10, height: TAG_HEIGHT, fill: primaryBlue, left: 0, rx: 0, ry: 0 }));
        await drawCompanyLogo(canvas, 80, 65, 80);

        canvas.add(new fabric.Text(formData.name.toUpperCase(), { left: 170, top: 30, fontSize: 28, fontWeight: '900', fill: '#2d3436', fontFamily: 'Montserrat' }));
        canvas.add(new fabric.Text('Zalo: ' + formData.phone1, { left: 170, top: 68, fontSize: 22, fill: '#2d3436', fontWeight: '800', fontFamily: 'Inter' }));
        canvas.add(new fabric.Text('CHUYÊN VIÊN TƯ VẤN BẤT ĐỘNG SẢN', { left: 170, top: 98, fontSize: 11, fill: primaryBlue, fontWeight: '900', charSpacing: 100 }));
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

            // Website (Aligned with brand info)
            canvas.add(new fabric.Text(formData.website, {
                left: 750, top: (showTagline ? 360 : 320), originX: 'center',
                fontSize: 16, fill: '#64748b',
                fontWeight: '600', fontFamily: 'Inter'
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

            // Decorative borders
            canvas.add(new fabric.Rect({ width: CARD_WIDTH, height: 12, fill: gold, selectable: false }));
            canvas.add(new fabric.Rect({ width: CARD_WIDTH, height: 12, top: CARD_HEIGHT - 12, fill: gold, selectable: false }));

            // Company Branding
            await drawCompanyLogo(canvas, CARD_WIDTH / 2, 180, 100);

            canvas.add(new fabric.Text(formData.company.toUpperCase() || 'CÔNG TY CỦA BẠN', {
                left: CARD_WIDTH / 2, top: 250, originX: 'center',
                fontSize: 24, fontWeight: '800', fill: gold,
                charSpacing: 200, fontFamily: 'Montserrat'
            }));

            // Main Name & Title
            canvas.add(new fabric.Text(formData.name.toUpperCase(), {
                left: CARD_WIDTH / 2, top: 340, originX: 'center',
                fontSize: 64, fontWeight: '900', fill: 'white',
                charSpacing: 50, fontFamily: 'Montserrat'
            }));

            canvas.add(new fabric.Text(formData.title.toUpperCase(), {
                left: CARD_WIDTH / 2, top: 410, originX: 'center',
                fontSize: 20, fill: gold,
                charSpacing: 150, fontWeight: '700', fontFamily: 'Inter'
            }));

            // Tagline on front
            if (showTagline) {
                canvas.add(new fabric.Text(formData.tagline.toUpperCase(), {
                    left: CARD_WIDTH / 2, top: 460, originX: 'center',
                    fontSize: 14, fill: '#ffffff', opacity: 0.5,
                    charSpacing: 100, fontWeight: '600', fontFamily: 'Inter'
                }));
            }
        } else {
            canvas.setBackgroundColor(lightGold, () => { });

            // Navy Wave background on the left
            const navyWave = new fabric.Path('M 0 0 L 450 0 C 350 200 350 400 450 600 L 0 600 Z', {
                fill: navy, selectable: false
            });
            canvas.add(navyWave);

            // Avatar
            await setupClippedAvatar(formData.avatarUrl, 180, 180, 180, canvas, 'circle');

            // Brand name on the wave
            canvas.add(new fabric.Text(formData.company.toUpperCase() || 'YOUR BRAND', {
                left: 180, top: 380, originX: 'center',
                fontSize: 22, fontWeight: '900', fill: gold,
                charSpacing: 100, fontFamily: 'Montserrat'
            }));

            // Personal Info (Right Side)
            const name = new fabric.Text(formData.name.toUpperCase(), {
                left: 540, top: 120, fontSize: 48, fontWeight: '900',
                fill: navy, fontFamily: 'Montserrat'
            });
            const title = new fabric.Text(formData.title.toUpperCase(), {
                left: 540, top: 175, fontSize: 16, fill: gold,
                charSpacing: 150, fontWeight: '800', fontFamily: 'Inter'
            });
            canvas.add(name, title);

            // Divider line
            canvas.add(new fabric.Rect({
                left: 540, top: 210, width: 400, height: 2, fill: navy, opacity: 0.1
            }));

            // Contact Details with Icons
            const contactItems = [
                { icon: '📞', text: formData.phone1 },
                { icon: '✉️', text: formData.email },
                { icon: '🌐', text: formData.website },
                { icon: '📍', text: formData.address }
            ];

            contactItems.forEach((item, i) => {
                const yPos = 260 + (i * 55);

                // Icon Circle
                canvas.add(new fabric.Circle({
                    radius: 18, fill: navy, left: 540, top: yPos, originX: 'center', originY: 'center'
                }));
                // Icon text (using emoji for now as icons)
                canvas.add(new fabric.Text(item.icon, {
                    left: 540, top: yPos, originX: 'center', originY: 'center',
                    fontSize: 16, fill: '#fff'
                }));
                // Detail text
                canvas.add(new fabric.Text(item.text, {
                    left: 575, top: yPos, originY: 'center',
                    fontSize: 16, fill: '#334155', fontWeight: '600', fontFamily: 'Inter'
                }));
            });

            // QR Code Rendering (Bottom Right)
            if (showQRCode) {
                try {
                    const cleanPhone = formData.phone1.replace(/[^0-9]/g, '');
                    const zaloLink = `https://zalo.me/${cleanPhone}`;
                    const qrDataUrl = await QRCode.toDataURL(zaloLink, { margin: 1, width: 120 });

                    fabric.Image.fromURL(qrDataUrl, (img) => {
                        img.set({
                            left: 880, top: 480, originX: 'center', originY: 'center',
                            shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.1)', blur: 10, offsetX: 0, offsetY: 5 })
                        });

                        // QR Box
                        canvas.add(new fabric.Rect({
                            left: 880, top: 480, width: 140, height: 140,
                            fill: 'white', rx: 20, ry: 20,
                            originX: 'center', originY: 'center',
                            stroke: gold, strokeWidth: 2,
                            shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.05)', blur: 20, offsetX: 0, offsetY: 10 })
                        }));
                        canvas.add(img);
                        canvas.renderAll();
                    });
                } catch (err) { console.error(err); }
            }
        }
    };

    const renderBlueGeo = async (canvas: fabric.Canvas) => {
        const primaryBlue = '#0984e3';
        const darkBlue = '#2d3436';
        const lightBg = '#f5f6fa';
        const white = '#ffffff';

        if (activeSide === 'front') {
            canvas.setBackgroundColor(darkBlue, () => { });

            // Geometric Abstract Shapes
            canvas.add(new fabric.Path('M 700 0 L 1050 0 L 1050 600 L 400 600 Z', {
                fill: primaryBlue, opacity: 0.8, selectable: false
            }));
            canvas.add(new fabric.Path('M 800 0 L 1050 0 L 1050 450 Z', {
                fill: white, opacity: 0.1, selectable: false
            }));

            // Brand Branding
            await drawCompanyLogo(canvas, 150, 80, 80);
            canvas.add(new fabric.Text(formData.company.toUpperCase() || 'IDENTITY BRAND', {
                left: 150, top: 150, originX: 'center',
                fontSize: 20, fontWeight: '900', fill: primaryBlue,
                charSpacing: 300, fontFamily: 'Montserrat'
            }));

            // Main Info
            canvas.add(new fabric.Text(formData.name.toUpperCase(), {
                left: 100, top: 300, fontSize: 68, fontWeight: '900',
                fill: white, fontFamily: 'Montserrat'
            }));

            const titleText = new fabric.Text(formData.title.toUpperCase(), {
                left: 100, top: 375, fontSize: 24, fill: white,
                charSpacing: 200, fontWeight: '800', fontFamily: 'Inter'
            });
            canvas.add(titleText);

            // Side Accent
            canvas.add(new fabric.Rect({ left: 100, top: 430, width: 80, height: 4, fill: primaryBlue }));

            if (showTagline) {
                canvas.add(new fabric.Text(formData.tagline, {
                    left: 100, top: 460, fontSize: 16, fill: white,
                    opacity: 0.6, fontStyle: 'italic', fontFamily: 'Inter'
                }));
            }
        } else {
            canvas.setBackgroundColor(white, () => { });

            // Side Header
            canvas.add(new fabric.Rect({ width: 350, height: 600, fill: darkBlue, selectable: false }));

            // Decorative background elements for side
            canvas.add(new fabric.Circle({ radius: 100, left: -40, top: 350, fill: primaryBlue, opacity: 0.05, selectable: false }));
            canvas.add(new fabric.Rect({ width: 2, height: 50, left: 30, top: 30, fill: primaryBlue, opacity: 0.3, selectable: false }));
            canvas.add(new fabric.Rect({ width: 50, height: 2, left: 30, top: 30, fill: primaryBlue, opacity: 0.3, selectable: false }));

            // Avatar in modern frame
            await setupClippedAvatar(formData.avatarUrl, 220, 175, 180, canvas, 'rect');

            // Brand Section
            await drawCompanyLogo(canvas, 175, 380, 80);

            canvas.add(new fabric.Text(formData.company.toUpperCase() || 'IDENTITY BRAND', {
                left: 175, top: 450, originX: 'center',
                fontSize: 22, fontWeight: '900', fill: white,
                charSpacing: 200, fontFamily: 'Montserrat'
            }));

            if (showTagline) {
                canvas.add(new fabric.Text(formData.tagline.toUpperCase(), {
                    left: 175, top: 490, originX: 'center',
                    fontSize: 10, fontWeight: '700', fill: primaryBlue,
                    charSpacing: 100, fontFamily: 'Inter'
                }));
            }

            // Personal Info Section
            canvas.add(new fabric.Text(formData.name.toUpperCase(), {
                left: 420, top: 100, fontSize: 44, fontWeight: '900',
                fill: darkBlue, fontFamily: 'Montserrat'
            }));
            canvas.add(new fabric.Text(formData.title.toUpperCase(), {
                left: 420, top: 155, fontSize: 18, fill: primaryBlue,
                charSpacing: 100, fontWeight: '800', fontFamily: 'Inter'
            }));

            // Contact Info
            const items = [
                { icon: '📱', val: formData.phone1 },
                { icon: '✉️', val: formData.email },
                { icon: '🌍', val: formData.website },
                { icon: '📍', val: formData.address }
            ];

            items.forEach((item, i) => {
                const y = 240 + (i * 60);
                canvas.add(new fabric.Circle({ radius: 20, fill: lightBg, left: 420, top: y, originX: 'center', originY: 'center' }));
                canvas.add(new fabric.Text(item.icon, { left: 420, top: y, originX: 'center', originY: 'center', fontSize: 18 }));
                canvas.add(new fabric.Text(item.val, {
                    left: 460, top: y, originY: 'center',
                    fontSize: 17, fill: '#455a64', fontWeight: '600', fontFamily: 'Inter'
                }));
            });

            // QR Code
            if (showQRCode) {
                try {
                    const cleanPhone = formData.phone1.replace(/[^0-9]/g, '');
                    const zaloLink = `https://zalo.me/${cleanPhone}`;
                    const qrDataUrl = await QRCode.toDataURL(zaloLink, { margin: 1, width: 140 });

                    fabric.Image.fromURL(qrDataUrl, (img) => {
                        img.set({
                            left: 880, top: 480, originX: 'center', originY: 'center',
                        });

                        const bg = new fabric.Rect({
                            left: 880, top: 480, width: 160, height: 160,
                            fill: '#fff', rx: 25, ry: 25,
                            originX: 'center', originY: 'center',
                            stroke: primaryBlue, strokeWidth: 2,
                            shadow: new fabric.Shadow({ color: 'rgba(9, 132, 227, 0.15)', blur: 20, offsetX: 0, offsetY: 10 })
                        });
                        canvas.add(bg, img);
                        canvas.renderAll();
                    });
                } catch (e) {
                    console.error(e);
                }
            }
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
        <div className="h-full flex flex-col bg-[#050505] overflow-hidden">
            {/* Font Preloader for Canvas */}
            <div style={{ fontFamily: 'Montserrat', fontWeight: 900, visibility: 'hidden', position: 'absolute' }}>Font Preloader - Việt Nam</div>
            <div style={{ fontFamily: 'Inter', fontWeight: 800, visibility: 'hidden', position: 'absolute' }}>Font Preloader - Việt Nam</div>

            <div className="flex flex-col sm:flex-row items-center justify-between p-3 bg-[#080808] border-b border-white/10 sticky top-0 z-50 backdrop-blur-md gap-3 sm:gap-0">
                <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <button onClick={onBack} className="text-slate-500 hover:text-white flex items-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all"><ArrowRight className="rotate-180" size={14} /> Back</button>

                    <div className="flex bg-white/5 p-1 rounded-xl">
                        <button onClick={() => setActiveMode('card')} className={`px-3 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all ${activeMode === 'card' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Business Card</button>
                        <button onClick={() => setActiveMode('tag')} className={`px-3 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all ${activeMode === 'tag' ? 'bg-white/10 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Name Tag</button>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {activeMode === 'tag' && onAttachToPhoto && (
                        <button
                            onClick={() => {
                                if (fabricCanvasRef.current) {
                                    const dataURL = fabricCanvasRef.current.toDataURL({ format: 'png', multiplier: 3, quality: 1.0 });
                                    onAttachToPhoto(dataURL);
                                    toast.success('Đã chuyển Tag vào ảnh!');
                                }
                            }}
                            className="flex-1 sm:flex-none justify-center bg-gold text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:brightness-110 transition-all flex items-center gap-2"
                        >
                            <Zap size={14} /> Dán ảnh
                        </button>
                    )}
                    <button onClick={handleDownload} className="flex-1 sm:flex-none justify-center bg-white text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-gold transition-all">Tải HD 3x</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="flex flex-col lg:flex-row p-3 sm:p-4 gap-4">
                    {/* Left Side: Navigation, Templates & Branding */}
                    <div className="w-full lg:w-[320px] space-y-4 shrink-0">
                        {activeMode === 'card' && (
                            <section className="bg-[#080808] border border-white/10 rounded-3xl p-4 space-y-4">
                                <header className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hiển thị</h3></header>
                                <div className="flex bg-white/5 p-1 rounded-2xl gap-1">
                                    <button onClick={() => setActiveSide('front')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeSide === 'front' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-slate-500'}`}>Mặt Trước</button>
                                    <button onClick={() => setActiveSide('back')} className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeSide === 'back' ? 'bg-gold text-black shadow-lg shadow-gold/20' : 'text-slate-500'}`}>Mặt Sau</button>
                                </div>
                                <div className="space-y-3 pt-2 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-slate-500 uppercase">QR Code Zalo</span>
                                        <button onClick={() => setShowQRCode(!showQRCode)} className={`transition-all ${showQRCode ? 'text-gold' : 'text-slate-600'}`}>{showQRCode ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}</button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black text-slate-500 uppercase">Hiện Tagline</span>
                                        <button onClick={() => setShowTagline(!showTagline)} className={`transition-all ${showTagline ? 'text-gold' : 'text-slate-600'}`}>{showTagline ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}</button>
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className="bg-[#080808] border border-white/10 rounded-3xl p-4 overflow-hidden">
                            <header className="flex items-center gap-2 mb-4"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mẫu {activeMode === 'card' ? 'Card' : 'Tag'}</h3></header>
                            <div className="flex lg:grid lg:grid-cols-1 gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                                {[
                                    { id: 'orange_waves', label: 'Orange', style: 'bg-yellow-500' },
                                    { id: 'luxury_gold', label: 'Luxury', style: 'bg-slate-900 border border-gold/50' },
                                    { id: 'blue_geo', label: 'Blue', style: 'bg-white border-2 border-blue-400' }
                                ].map(t => (
                                    <button key={t.id} onClick={() => setActiveTemplate(t.id as any)} className={`p-2 rounded-xl border transition-all flex items-center gap-3 text-left min-w-[120px] lg:min-w-0 ${activeTemplate === t.id ? 'border-gold bg-gold/5' : 'border-white/5 bg-white/[0.02]'}`}>
                                        <div className={`w-8 h-5 rounded-md shrink-0 ${t.style}`}></div>
                                        <div className={`text-[8px] font-black uppercase ${activeTemplate === t.id ? 'text-gold' : 'text-white'}`}>{t.label}</div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="bg-[#080808] border border-white/10 rounded-3xl p-4 space-y-4">
                            <header className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-gold"></div><h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thương hiệu</h3></header>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Tên Công Ty</label>
                                    <input type="text" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] font-bold text-white focus:outline-none focus:border-gold transition-all" />
                                </div>
                                {activeMode === 'card' && (
                                    <div className="sm:col-span-2 lg:col-span-1">
                                        <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Tagline</label>
                                        <input type="text" disabled={!showTagline} value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] font-bold text-white focus:outline-none focus:border-gold transition-all ${!showTagline ? 'opacity-30 cursor-not-allowed' : ''}`} placeholder="Slogan..." />
                                    </div>
                                )}
                                <div className="sm:col-span-2 lg:col-span-1">
                                    <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Logo Sàn</label>
                                    <div className="relative group">
                                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        <div className="flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-xl group-hover:border-gold/50 transition-all">
                                            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold shrink-0">{companyLogo ? <img src={companyLogo} className="w-full h-full object-contain rounded-lg" /> : <Download size={14} />}</div>
                                            <div className="overflow-hidden"><p className="text-[9px] font-bold text-white truncate uppercase">Tải Logo</p></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Area: Preview Canvas & Bottom Form */}
                    <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                        <div ref={containerRef} className="bg-[#080808] border border-white/10 rounded-[32px] flex-1 min-h-[250px] sm:min-h-[300px] flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden group">
                            <div className="shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] rounded-sm overflow-hidden border border-white/5 transition-transform duration-500 group-hover:scale-[1.01] max-w-full">
                                <canvas ref={canvasRef} />
                            </div>
                            <div className="mt-4 flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-white/5 rounded-full border border-white/5 backdrop-blur-xl">
                                <ShieldCheck className="text-gold" size={12} />
                                <span className="text-[7px] sm:text-[8px] font-black text-slate-300 uppercase tracking-widest text-center">300 DPI • {activeMode === 'card' ? (activeSide === 'front' ? 'FRONT' : 'BACK') : 'NAME TAG'}</span>
                            </div>
                        </div>

                        <div className="bg-[#080808] border border-white/10 rounded-[32px] p-4 sm:p-6 shrink-0">
                            <header className="flex items-center gap-3 mb-6">
                                <RefreshCw className="text-gold animate-spin-slow" size={16} />
                                <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Thông tin cá nhân</h3>
                            </header>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                                <div>
                                    <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Họ & Tên</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] font-bold text-white focus:outline-none focus:border-gold transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Chức danh</label>
                                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] font-bold text-white focus:outline-none focus:border-gold transition-all" />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Số Zalo</label>
                                    <input type="text" value={formData.phone1} onChange={(e) => setFormData({ ...formData, phone1: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] font-bold text-white focus:outline-none focus:border-gold transition-all" />
                                </div>
                                {activeMode === 'card' && (
                                    <>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Website</label>
                                            <input type="text" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] font-bold text-white focus:outline-none focus:border-gold transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Địa chỉ</label>
                                            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] font-bold text-white focus:outline-none focus:border-gold transition-all" />
                                        </div>
                                        <div>
                                            <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-widest">Email</label>
                                            <input type="text" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[12px] font-bold text-white focus:outline-none focus:border-gold transition-all" />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardCreator;
