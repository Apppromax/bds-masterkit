import React, { useState } from 'react';
import { Upload, Download, Wand2, Sparkles, RefreshCw, Palette, ArrowRight, Save } from 'lucide-react';
import { enhanceImageWithAI, analyzeImageWithGemini, generateImageWithAI, generateContentWithAI } from '../../services/aiService';
import toast from 'react-hot-toast';
import { optimizeImage } from '../../utils/imageUtils';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

const AiStudio = ({ onBack }: { onBack: () => void }) => {
    const { profile } = useAuth();
    const [mode, setMode] = useState<'enhance' | 'creator'>('enhance');
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState('');
    const [lastPrompt, setLastPrompt] = useState<string | null>(null);

    // Enhance State
    const [enhanceImage, setEnhanceImage] = useState<string | null>(null);
    const [enhancedResults, setEnhancedResults] = useState<string[]>([]);
    const [selectedEnhancedIdx, setSelectedEnhancedIdx] = useState(0);
    const [isWideAngle, setIsWideAngle] = useState(false);

    // Creator State
    const [creatorForm, setCreatorForm] = useState({
        type: 'Biệt thự hiện đại',
        context: 'Mặt tiền đường lớn, có vỉa hè rộng',
        lighting: 'Nắng sớm rực rỡ, bầu trời trong xanh',
        style: 'Hiện đại, sang trọng',
        extras: [] as string[]
    });
    const [createdImages, setCreatedImages] = useState<string[]>([]);

    const handleEnhanceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const optimizedUrl = await optimizeImage(file, 1500, 1500, 0.85);
                setEnhanceImage(optimizedUrl);
                setEnhancedResults([]);
                setSelectedEnhancedIdx(0);
            } catch (err) {
                toast.error('Lỗi khi nén ảnh: ' + (err as Error).message);
            }
        }
    };

    const [sliderPos, setSliderPos] = useState(50);

    const runEnhance = async () => {
        if (!enhanceImage) return;
        setProcessing(true);
        setEnhancedResults([]);
        setSelectedEnhancedIdx(0);

        try {
            // Phase 1: Pain-point Detection via Gemini Vision
            setStatus('🔍 AI đang tìm khuyết điểm ảnh...');
            const fixPrompt = await analyzeImageWithGemini(enhanceImage);

            if (!fixPrompt) {
                toast.error('Không thể phân tích ảnh. Vui lòng thử lại.');
                return;
            }

            console.log('[Enhance] Phase 1 complete. Fix prompt:', fixPrompt.substring(0, 200));
            setLastPrompt(fixPrompt);

            // Phase 2: Image-to-Image Enhancement
            setStatus('🎨 Đang phủ xanh không gian...');
            const newImg = await enhanceImageWithAI(
                enhanceImage,
                fixPrompt,
                (statusMsg) => setStatus(statusMsg)
            );

            if (newImg) {
                const results = [newImg];

                // Extra Wide Angle Phase - Based on the FIRST enhanced image for consistency
                if (isWideAngle) {
                    setStatus('📐 Đang phân tích để mở rộng không gian...');

                    // Step 2.1: Analyze the FIRST result to get a contextual outpainting prompt
                    const wideAnalysisPrompt = `Đây là một bức ảnh bất động sản đã được nâng cấp. Hãy phân tích phong cách, màu sắc và nội dung của nó.
Tạo một yêu cầu cụ thể bằng tiếng Việt để MỞ RỘNG khung cảnh này thành một góc nhìn flycam/drone CAO hơn và RỘNG hơn.
Giữ nguyên phong cách. Trả về định dạng JSON: {"geometry": "Mô tả góc rộng...", "fixPrompt": "Yêu cầu mở rộng chi tiết..."}`;

                    const wideFixPrompt = await analyzeImageWithGemini(newImg, wideAnalysisPrompt);

                    if (wideFixPrompt) {
                        setStatus('📸 Đang kiến tạo góc nhìn toàn cảnh...');
                        const wideImg = await enhanceImageWithAI(
                            newImg, // Use the FIRST enhanced result as the base image
                            wideFixPrompt,
                            (statusMsg) => setStatus(statusMsg)
                        );
                        if (wideImg) results.push(wideImg);
                    }
                }

                setEnhancedResults(results);
                setSelectedEnhancedIdx(0);
                setSliderPos(50);
            } else {
                toast.error('Không thể tạo ảnh nâng cấp. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('[Enhance] Error:', error);
            toast.error('Có lỗi xảy ra: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
Bạn là một phóng viên ảnh bất động sản chuyên nghiệp, chuyên chụp ảnh thực tế hiện trường. Hãy tạo một bản mô tả chi tiết bằng tiếng Việt để AI có thể vẽ lại bức ảnh chụp thực tế dựa trên:
- Loại hình: ${creatorForm.type} (Phong cách: ${creatorForm.style})
- Bối cảnh: ${creatorForm.context}
- Ánh sáng: ${creatorForm.lighting}
- Yếu tố bổ sung: ${creatorForm.extras.join(', ')}

Yêu cầu về phong cách báo chí:
${structuralFocus}
- Kỹ thuật chụp: Chụp bằng máy ảnh DSLR, ống kính góc rộng (wide-angle lens), độ nét cao nhưng tự nhiên. 
- Chất liệu: Bề mặt bê tông, đất, đá, gỗ phải có vân nhám thực tế. Cỏ cây có độ thưa thớt tự nhiên, không quá mượt mà.
- Ánh sáng: Sử dụng ánh sáng tự nhiên, đổ bóng thực, không dùng hiệu ứng lấp lánh (bloom/glow) hay màu sắc quá rực rỡ.
- Tuyệt đối TRÁNH: Tránh nhìn như render 3D, tránh nhìn như nhựa, tránh hoạt hình hay tranh vẽ.

Yêu cầu kỹ thuật:
Trả về bản mô tả bằng tiếng Việt gồm các ý chính về: ảnh thô, độ nét 8k, kết cấu thực tế, nhiếp ảnh kiến trúc. Hãy viết mô tả này để bộ máy tạo ảnh hiểu rõ nhất. Chỉ trả về kết quả, không giải thích gì thêm.`;

            const enhancedPrompt = await generateContentWithAI(contextPrompt) || `Ảnh chụp thực tế ${creatorForm.type}, phong cách ${creatorForm.style}. Bối cảnh: ${creatorForm.context}. Ánh sáng: ${creatorForm.lighting}. ${creatorForm.extras.join(', ')}. Chân thực, sắc nét, 8k.`;
            setLastPrompt(enhancedPrompt);

            // Step 2: Generate Images
            setStatus('Đang kiến tạo tổ ấm phù hợp phong thủy...');
            const results = [];
            // Generate 2 images for demo
            for (let i = 0; i < 2; i++) {
                const img = await generateImageWithAI(enhancedPrompt);
                if (img) results.push(img);
            }
            setCreatedImages(results);
            toast.success('Mời bạn xem thành quả!');

        } catch (error) {
            console.error(error);
            toast.error('Lỗi tạo ảnh: ' + (error instanceof Error ? error.message : 'Unknown error'));
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

    const savePromptToAdmin = async () => {
        if (!lastPrompt || !profile || profile.role !== 'admin') return;

        const name = window.prompt('Nhập tên gợi nhớ cho Prompt này:', mode === 'enhance' ? `Mẫu sửa ảnh ${new Date().toLocaleTimeString()}` : `Mẫu tạo ảnh ${new Date().toLocaleTimeString()}`);
        if (!name) return;

        const { error } = await supabase.from('ai_prompts').insert({
            name,
            prompt_text: lastPrompt,
            category: mode === 'enhance' ? 'enhance' : 'creator'
        });

        if (error) toast.error('Lỗi lưu prompt: ' + error.message);
        else toast.success('Đã lưu vào Thư viện Prompt Admin!');
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

                            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <label className="flex items-center gap-3 cursor-pointer w-full">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={isWideAngle}
                                            onChange={() => setIsWideAngle(!isWideAngle)}
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">Tạo thêm góc chụp cao & rộng hơn (Flycam mode)</span>
                                </label>
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

                        <div className="flex flex-col gap-4">
                            <div className="bg-slate-900 rounded-3xl overflow-hidden relative min-h-[400px] flex items-center justify-center border border-slate-800 flex-1">
                                {enhancedResults.length > 0 && enhanceImage ? (
                                    <div className="relative w-full h-full select-none">
                                        {/* Before/After Slider */}
                                        <div className="relative w-full h-full overflow-hidden" style={{ minHeight: '400px' }}>
                                            {/* AFTER layer (full) */}
                                            <img src={enhancedResults[selectedEnhancedIdx]} className="w-full h-full object-contain absolute inset-0" alt="After" />
                                            {/* BEFORE layer (clipped) */}
                                            <div
                                                className="absolute inset-0"
                                                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                                            >
                                                <img src={enhanceImage} className="w-full h-full object-contain" alt="Before" />
                                            </div>
                                            {/* Slider line */}
                                            <div
                                                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
                                                style={{ left: `${sliderPos}%` }}
                                            >
                                                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center cursor-ew-resize border-2 border-slate-300">
                                                    <span className="text-slate-500 text-xs font-black">⟷</span>
                                                </div>
                                            </div>
                                            {/* Slider input (invisible, captures drag) */}
                                            <input
                                                type="range"
                                                min="0" max="100" value={sliderPos}
                                                onChange={(e) => setSliderPos(Number(e.target.value))}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                                            />
                                            {/* Labels */}
                                            <div className="absolute top-4 left-4 bg-red-500/80 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg z-10">GỐC (BEFORE)</div>
                                            <div className="absolute top-4 right-4 bg-green-500/80 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-lg z-10">{selectedEnhancedIdx === 0 ? 'MA thuật (AFTER)' : 'GÓC RỘNG (WIDE)'}</div>
                                        </div>
                                        {/* Download */}
                                        <div className="absolute bottom-4 right-4 flex gap-2 z-30">
                                            {profile?.role === 'admin' && lastPrompt && (
                                                <button
                                                    onClick={savePromptToAdmin}
                                                    className="bg-purple-600 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
                                                >
                                                    <Save size={16} /> Lưu Prompt
                                                </button>
                                            )}
                                            <a href={enhancedResults[selectedEnhancedIdx]} download={`enhanced_ai_${selectedEnhancedIdx}.png`} className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
                                                <Download size={16} /> Tải về
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        {processing ? (
                                            <div className="relative p-8">
                                                <div className="w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
                                                <p className="text-white font-bold animate-pulse text-lg">{status}</p>
                                                <p className="text-slate-500 text-xs mt-2">Dự kiến: {isWideAngle ? '20-25' : '10-15'} giây</p>
                                            </div>
                                        ) : (
                                            <div className="text-slate-600 p-8 text-center">
                                                <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                                                <p>Trước & Sau sẽ hiển thị tại đây</p>
                                                <p className="text-xs opacity-50 mt-2">Kéo thanh trượt để so sánh hiệu quả Magic</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Gallery (if multiple) */}
                            {enhancedResults.length > 1 && (
                                <div className="flex gap-4 p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-x-auto no-scrollbar">
                                    {enhancedResults.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedEnhancedIdx(idx)}
                                            className={`relative min-w-[120px] h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${selectedEnhancedIdx === idx ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                        >
                                            <img src={img} className="w-full h-full object-cover" alt={`Result ${idx}`} />
                                            <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[8px] text-white font-bold py-1 uppercase text-center">
                                                {idx === 0 ? 'Standard' : 'Wide Angle'}
                                            </div>
                                        </button>
                                    ))}
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
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {['Hiện đại (Modern Luxury)', 'Tân cổ điển (Neo-Classical)', 'Tối giản (Minimalist)', 'Indochine (Đông Dương)', 'Địa Trung Hải (Mediterranean)'].map(style => (
                                        <button
                                            key={style}
                                            onClick={() => setCreatorForm({ ...creatorForm, style })}
                                            className={`p-3 text-left rounded-xl transition-all border-2 flex items-center justify-between group h-full ${creatorForm.style === style ? 'border-pink-500 bg-pink-50 shadow-md ring-2 ring-pink-500/20' : 'border-slate-100 bg-white hover:border-pink-200'}`}
                                        >
                                            <span className={`text-sm font-bold block ${creatorForm.style === style ? 'text-pink-700' : 'text-slate-600 group-hover:text-pink-500'}`}>{style.split(' (')[0]}</span>
                                        </button>
                                    ))}
                                </div>
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
                                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
                                            {profile?.role === 'admin' && lastPrompt && (
                                                <button
                                                    onClick={savePromptToAdmin}
                                                    className="w-full py-2 bg-purple-600 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-purple-700"
                                                >
                                                    <Save size={14} /> Lưu Prompt Admin
                                                </button>
                                            )}
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


export default AiStudio;
