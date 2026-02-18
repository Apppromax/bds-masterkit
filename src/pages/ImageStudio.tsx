
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Wand2, Sparkles, Stamp, Palette, ArrowRight, LayoutTemplate, RefreshCw } from 'lucide-react';
import { generateImageWithAI, analyzeImageWithGemini, generateContentWithAI } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';

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

    // Layout State
    const [layout, setLayout] = useState({
        templateId: 'modern',
        title: 'BÁN GẤP / CHO THUÊ',
        price: 'GIÁ THỎA THUẬN',
        area: '100m²',
        location: 'Vị trí đắc địa'
    });

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

                // 2. Layout Logic
                if (editMode === 'layout') {
                    // Dim effect
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

                    // Text
                    ctx.fillStyle = '#fff';
                    ctx.font = `bold ${canvas.width * 0.06}px Arial`;
                    ctx.textAlign = 'left';
                    ctx.fillText(layout.title.toUpperCase(), canvas.width * 0.05, canvas.height * 0.8);

                    ctx.font = `${canvas.width * 0.04}px Arial`;
                    ctx.fillText(`📍 ${layout.location}`, canvas.width * 0.05, canvas.height * 0.86);

                    ctx.fillStyle = '#FFD700'; // Gold
                    ctx.font = `bold ${canvas.width * 0.07}px Arial`;
                    ctx.textAlign = 'right';
                    ctx.fillText(layout.price, canvas.width * 0.95, canvas.height * 0.82);

                    ctx.fillStyle = '#fff';
                    ctx.font = `${canvas.width * 0.04}px Arial`;
                    ctx.fillText(layout.area, canvas.width * 0.95, canvas.height * 0.88);
                }
            };
            img.src = selectedImage.url;
        };

        drawCanvas();
    }, [selectedImageId, watermark, layout, editMode, images]);

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
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Tiêu đề chính</label>
                                <input
                                    type="text"
                                    value={layout.title}
                                    onChange={(e) => setLayout({ ...layout, title: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Giá</label>
                                    <input
                                        type="text"
                                        value={layout.price}
                                        onChange={(e) => setLayout({ ...layout, price: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Diện tích</label>
                                    <input
                                        type="text"
                                        value={layout.area}
                                        onChange={(e) => setLayout({ ...layout, area: e.target.value })}
                                        className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Vị trí / Địa chỉ</label>
                                <input
                                    type="text"
                                    value={layout.location}
                                    onChange={(e) => setLayout({ ...layout, location: e.target.value })}
                                    className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                                />
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
                                <canvas ref={canvasRef} className="max-w-full max-h-full shadow-2xl rounded-lg" />
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
            const contextPrompt = `
Hãy tạo một Prompt tiếng Anh thật chân thực (photorealistic), hấp dẫn và gần gũi với thị trường Việt Nam để minh họa một bất động sản tiềm năng dựa trên các yếu tố sau:
- Loại hình: ${creatorForm.type}
- Bối cảnh: ${creatorForm.context}
- Ánh sáng: ${creatorForm.lighting}
- Yếu tố bổ sung: ${creatorForm.extras.join(', ')}

Hãy tập trung vào việc tạo ra cảm giác ấm cúng, tiện nghi hoặc giá trị đầu tư rõ ràng. Kết thúc Prompt bằng các từ khóa: 'photorealistic', 'realistic architectural photography', 'natural lighting', 'high detail', 'vibrant and inviting atmosphere'. Chỉ trả về nội dung Prompt tiếng Anh, không giải thích gì thêm.`;

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
