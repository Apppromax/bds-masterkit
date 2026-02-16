import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Upload, Download, Type, Layers, Wand2, X, Sparkles, AlertCircle, Phone, Building2 } from 'lucide-react';
import { generateImageWithAI } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';

export default function ImageStudio() {
    const { profile } = useAuth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [text, setText] = useState('');
    const [watermark, setWatermark] = useState(false);
    const [frame, setFrame] = useState<'none' | 'simple' | 'modern'>('none');
    const [aiProcessing, setAiProcessing] = useState(false);
    const [aiEffect, setAiEffect] = useState<'none' | 'stage' | 'sky'>('none');

    // AI Generation state
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
                };
                img.src = base64Image;
            } else {
                setAiError('Không thể tạo ảnh. Vui lòng kiểm tra API Key trong Admin.');
                setIsGenerating(false);
            }
        } catch (err) {
            setAiError('Lỗi kết nối AI.');
            setIsGenerating(false);
        }
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas || !image) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas dimensions to match image
        canvas.width = image.width;
        canvas.height = image.height;

        // Draw base image
        ctx.drawImage(image, 0, 0);

        // Apply AI Effect (Mockup - just a filter for now)
        if (aiEffect === 'stage') {
            ctx.filter = 'contrast(1.2) saturate(1.2)';
            ctx.drawImage(image, 0, 0);
            ctx.filter = 'none';

            // Simulate adding furniture
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(canvas.width * 0.2, canvas.height * 0.6, canvas.width * 0.6, canvas.height * 0.3);
            ctx.fillStyle = '#fff';
            ctx.font = `${canvas.width * 0.05}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('✨ AI Virtual Staging Applied', canvas.width / 2, canvas.height * 0.75);
        } else if (aiEffect === 'sky') {
            ctx.fillStyle = '#87CEEB'; // Sky Blue
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4);
            ctx.globalCompositeOperation = 'source-over';
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

        // Draw Watermark
        if (watermark) {
            ctx.save();
            ctx.globalAlpha = 0.4;

            // For Pro users, use their personal brand info
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
    };

    useEffect(() => {
        drawCanvas();
    }, [image, text, watermark, frame, aiEffect, profile]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'masterkit-ai-edited.png';
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Editor Controls */}
                <div className="lg:col-span-1 space-y-6">
                    {/* AI Generation Box */}
                    <div className="p-1 rounded-3xl bg-gradient-to-br from-purple-500 via-blue-500 to-purple-500 animate-gradient-x">
                        <div className="bg-white dark:bg-slate-900 rounded-[22px] p-6 shadow-xl">
                            <h3 className="font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2 uppercase text-xs tracking-widest">
                                <Sparkles size={18} className="text-purple-500" /> AI Image Generator
                            </h3>
                            <textarea
                                className="w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm h-28 mb-4 outline-none focus:ring-4 focus:ring-purple-500/10 transition-all font-medium"
                                placeholder="VD: Biệt thự vườn phong cách Địa Trung Hải, hồ bơi tràn viền..."
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
                        </div>
                    </div>

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

                            {/* Tools */}
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
                                            onClick={() => setFrame(f as any)}
                                            className={`py-2 px-1 text-[10px] font-black border-2 rounded-xl transition-all ${frame === f ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-400'}`}
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
                </div>

                {/* Canvas Preview */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-100 dark:bg-slate-950 rounded-[40px] border-4 border-white dark:border-slate-900 flex items-center justify-center relative overflow-hidden min-h-[600px] shadow-2xl">
                        {!image && !isGenerating && (
                            <div className="text-slate-300 flex flex-col items-center">
                                <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-sm">
                                    <ImageIcon size={40} className="opacity-20" />
                                </div>
                                <p className="text-sm font-black uppercase tracking-widest">Ảnh xem trước sẽ hiện ở đây</p>
                            </div>
                        )}

                        {isGenerating && (
                            <div className="flex flex-col items-center gap-6">
                                <div className="w-20 h-20 border-8 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <div className="text-center">
                                    <p className="text-xl font-black text-blue-600 animate-pulse uppercase tracking-tighter">MasterKit AI is Painting...</p>
                                    <p className="text-xs text-slate-400 mt-1 font-bold">Vui lòng chờ trong giây lát (khoảng 10-20s)</p>
                                </div>
                            </div>
                        )}

                        <canvas
                            ref={canvasRef}
                            className={`max-w-full max-h-[750px] shadow-2xl rounded-2xl ${(!image || isGenerating) ? 'hidden' : ''}`}
                        />

                        {aiProcessing && (
                            <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center text-white backdrop-blur-md z-20 animate-in fade-in duration-300">
                                <div className="relative">
                                    <Wand2 size={64} className="animate-bounce mb-4 text-purple-400" />
                                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-white rounded-full animate-ping"></div>
                                </div>
                                <p className="text-2xl font-black tracking-tighter italic">AI MAGIC PROCESSING...</p>
                                <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest">Đang áp dụng nội thất ảo</p>
                            </div>
                        )}
                    </div>

                    {image && !isGenerating && (
                        <div className="mt-8 flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl">
                            <div className="flex items-center gap-4 mb-4 md:mb-0">
                                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                                    <Layers size={20} className="text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kích thước xuất ảnh</p>
                                    <p className="text-sm font-black text-slate-700 dark:text-white">{image.width} × {image.height} px (High Quality)</p>
                                </div>
                            </div>
                            <button
                                onClick={handleDownload}
                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-2xl font-black shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-3 hover:scale-[1.05] active:scale-95 transition-all text-lg"
                            >
                                <Download size={24} /> TẢI ẢNH VỀ MÁY
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
