import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Upload, Download, Type, Layers, Wand2, X } from 'lucide-react';

export default function ImageStudio() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [text, setText] = useState('');
    const [watermark, setWatermark] = useState(false);
    const [frame, setFrame] = useState<'none' | 'simple' | 'modern'>('none');
    const [aiProcessing, setAiProcessing] = useState(false);
    const [aiEffect, setAiEffect] = useState<'none' | 'stage' | 'sky'>('none');

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    setImage(img);
                    setAiEffect('none');
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
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

            // Simulate adding furniture (draw a rectangle/text as placeholder)
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(canvas.width * 0.2, canvas.height * 0.6, canvas.width * 0.6, canvas.height * 0.3);
            ctx.fillStyle = '#fff';
            ctx.font = `${canvas.width * 0.05}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('✨ AI Virtual Staging Applied', canvas.width / 2, canvas.height * 0.75);
        } else if (aiEffect === 'sky') {
            // Mock Sky Replacement
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
            // Bottom Banner
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, canvas.height * 0.85, canvas.width, canvas.height * 0.15);

            ctx.fillStyle = '#FFD700'; // Gold
            ctx.font = `bold ${canvas.width * 0.04}px sans-serif`;
            ctx.textAlign = 'left';
            ctx.fillText('HOT DEAL', canvas.width * 0.05, canvas.height * 0.92);

            ctx.fillStyle = '#fff';
            ctx.font = `${canvas.width * 0.03}px sans-serif`;
            ctx.fillText('0909.123.456', canvas.width * 0.05, canvas.height * 0.96);
        }

        // Draw Watermark
        if (watermark) {
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(-Math.PI / 4);
            ctx.fillStyle = 'white';
            ctx.font = `bold ${canvas.width * 0.08}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText('CHÍNH CHỦ', 0, 0);
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
    }, [image, text, watermark, frame, aiEffect]);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'edited-image.png';
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    const applyAiEffect = (effect: 'stage' | 'sky') => {
        setAiProcessing(true);
        // Simulate AI processing delay
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
                <p className="text-slate-500 text-sm">Chỉnh sửa ảnh BĐS chuyên nghiệp</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Editor Controls */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Upload */}
                    <div className="glass p-6 rounded-2xl shadow-sm">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="text-slate-400 mb-2" size={24} />
                                <p className="text-sm text-slate-500">Click để tải ảnh lên</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>

                    {image && (
                        <>
                            {/* Tools */}
                            <div className="glass p-6 rounded-2xl shadow-sm space-y-4">
                                <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    <Type size={18} /> Chèn chữ & Watermark
                                </h3>

                                <div>
                                    <label className="block text-xs font-medium mb-1">Số điện thoại / Giá</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                                        placeholder="VD: 0909.xxx.xxx - 5 Tỷ"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                    />
                                </div>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={watermark}
                                        onChange={(e) => setWatermark(e.target.checked)}
                                        className="rounded text-blue-600"
                                    />
                                    <span className="text-sm">Đóng dấu "CHÍNH CHỦ"</span>
                                </label>
                            </div>

                            <div className="glass p-6 rounded-2xl shadow-sm space-y-4">
                                <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    <Layers size={18} /> Khung ảnh (Frame)
                                </h3>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => setFrame('none')}
                                        className={`p-2 text-xs border rounded-lg ${frame === 'none' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-slate-50'}`}
                                    >
                                        None
                                    </button>
                                    <button
                                        onClick={() => setFrame('simple')}
                                        className={`p-2 text-xs border rounded-lg ${frame === 'simple' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-slate-50'}`}
                                    >
                                        Simple
                                    </button>
                                    <button
                                        onClick={() => setFrame('modern')}
                                        className={`p-2 text-xs border rounded-lg ${frame === 'modern' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'hover:bg-slate-50'}`}
                                    >
                                        Modern
                                    </button>
                                </div>
                            </div>

                            <div className="glass p-6 rounded-2xl shadow-sm space-y-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">PRO</div>
                                <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                                    <Wand2 size={18} className="text-purple-500" /> AI Magic
                                </h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => applyAiEffect('stage')}
                                        disabled={aiProcessing}
                                        className="w-full py-2 px-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {aiProcessing && aiEffect === 'none' ? 'Processing...' : '🏠 Virtual Staging (Thêm nội thất)'}
                                    </button>
                                    <button
                                        onClick={() => applyAiEffect('sky')}
                                        disabled={aiProcessing}
                                        className="w-full py-2 px-3 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-sm hover:bg-sky-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        ☁️ Thay trời xanh
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Canvas Preview */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-center relative overflow-hidden min-h-[400px]">
                        {!image && (
                            <div className="text-slate-400 flex flex-col items-center">
                                <ImageIcon size={48} className="mb-2 opacity-20" />
                                <p>Preview ảnh sẽ hiện ở đây</p>
                            </div>
                        )}

                        <canvas
                            ref={canvasRef}
                            className={`max-w-full max-h-[600px] shadow-lg ${!image ? 'hidden' : ''}`}
                        />

                        {aiProcessing && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                                <Wand2 size={32} className="animate-spin mb-2 text-purple-400" />
                                <p>AI đang xử lý phép thuật...</p>
                            </div>
                        )}
                    </div>

                    {image && (
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={handleDownload}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all"
                            >
                                <Download size={20} /> Tải Ảnh Về
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
