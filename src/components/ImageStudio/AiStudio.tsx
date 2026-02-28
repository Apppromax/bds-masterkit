import React, { useState } from 'react';
import { Upload, Download, Wand2, Sparkles, RefreshCw, Palette, ArrowRight, Save, Camera, ChevronLeft, ShieldCheck } from 'lucide-react';
import { enhanceImageWithAI, analyzeImageWithGemini, generateImageWithAI, generateContentWithAI } from '../../services/aiService';
import { getAppSetting } from '../../services/settingsService';
import toast from 'react-hot-toast';
import { optimizeImage } from '../../utils/imageUtils';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

const AiStudio = ({ onBack }: { onBack: () => void }) => {
    const { profile, refreshProfile } = useAuth();
    const [mode, setMode] = useState<'enhance' | 'creator'>('enhance');
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState('');
    const [lastPrompt, setLastPrompt] = useState<string | null>(null);

    // Enhance State
    const [enhanceImage, setEnhanceImage] = useState<string | null>(null);
    const [enhancedResults, setEnhancedResults] = useState<string[]>([]);
    const [selectedEnhancedIdx, setSelectedEnhancedIdx] = useState(0);
    const [isWideAngle, setIsWideAngle] = useState(false);
    const [enhanceAspectRatio, setEnhanceAspectRatio] = useState<'1:1' | '16:9' | '3:4' | '4:3'>('1:1');
    const [enhanceVariants, setEnhanceVariants] = useState<number>(1);

    // Creator State
    const [creatorForm, setCreatorForm] = useState({
        type: 'Biệt thự hiện đại',
        context: 'Mặt tiền đường lớn, có vỉa hè rộng',
        lighting: 'Nắng sớm rực rỡ, bầu trời trong xanh',
        style: 'Hiện đại, sang trọng',
        aspectRatio: '1:1' as '1:1' | '16:9',
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
            setStatus('🔍 AI đang tìm khuyết điểm ảnh...');
            const fixPrompt = await analyzeImageWithGemini(enhanceImage);

            if (!fixPrompt) {
                toast.error('Không thể phân tích ảnh. Vui lòng thử lại.');
                return;
            }

            setLastPrompt(fixPrompt);
            const results: string[] = [];

            for (let i = 0; i < enhanceVariants; i++) {
                if (enhanceVariants > 1) {
                    setStatus(`🎨 Đang thiết kế phương án ${i + 1}/${enhanceVariants}...`);
                } else {
                    setStatus('🎨 Đang thiết kế lại không gian...');
                }

                const newImg = await enhanceImageWithAI(
                    enhanceImage,
                    fixPrompt,
                    enhanceAspectRatio,
                    (statusMsg) => setStatus(statusMsg)
                );

                if (newImg) {
                    results.push(newImg);
                    setEnhancedResults([...results]);
                    setSelectedEnhancedIdx(results.length - 1);

                    if (isWideAngle) {
                        setStatus(enhanceVariants > 1 ? `📐 Mở rộng không gian PA ${i + 1}...` : '📐 Đang phân tích để mở rộng không gian...');
                        const baseFlycamPrompt = await getAppSetting('ai_flycam_prompt') || `Đây là một bức ảnh bất động sản đã được nâng cấp. Hãy phân tích phong cách, màu sắc và nội dung của nó.
Tạo một yêu cầu cụ thể bằng tiếng Việt để MỞ RỘNG khung cảnh này thành một góc nhìn flycam/drone CAO hơn và RỘNG hơn.
Giữ nguyên phong cách. Trả về định dạng JSON: {"geometry": "Mô tả góc rộng...", "fixPrompt": "Yêu cầu mở rộng chi tiết..."}`;

                        const wideFixPrompt = await analyzeImageWithGemini(newImg, baseFlycamPrompt);
                        if (wideFixPrompt) {
                            setStatus(enhanceVariants > 1 ? `📸 Kiến tạo Flycam PA ${i + 1}...` : '📸 Đang kiến tạo góc nhìn toàn cảnh...');
                            const wideImg = await enhanceImageWithAI(
                                newImg,
                                wideFixPrompt,
                                enhanceAspectRatio,
                                (statusMsg) => setStatus(statusMsg)
                            );
                            if (wideImg) {
                                results.push(wideImg);
                                setEnhancedResults([...results]);
                                setSelectedEnhancedIdx(results.length - 1);
                            }
                        }
                    }
                }
            }

            if (results.length > 0) {
                setSliderPos(50);
                refreshProfile();
            } else {
                toast.error('Không thể tạo ảnh nâng cấp. Vui lòng thử lại.');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setProcessing(false);
        }
    };

    const runCreator = async () => {
        setProcessing(true);
        setStatus('Gemini đang phác thảo ý tưởng...');

        try {
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

            setStatus('Đang kiến tạo tổ ấm phù hợp phong thủy...');
            const results = [];
            const img = await generateImageWithAI(enhancedPrompt, creatorForm.aspectRatio);
            if (img) results.push(img);

            setCreatedImages(results);
            toast.success('Mời bạn xem thành quả!');
            refreshProfile();

        } catch (error) {
            toast.error('Lỗi tạo ảnh: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setProcessing(false);
        }
    };

    const toggleExtra = (item: string) => {
        if (creatorForm.extras.includes(item)) {
            setCreatorForm({ ...creatorForm, extras: creatorForm.extras.filter(i => i !== item) });
        } else {
            setCreatorForm({ ...creatorForm, extras: [...creatorForm.extras, item] });
        }
    };

    // Removed savePromptToAdmin

    return (
        <div className="h-[calc(100vh-80px)] md:h-full flex flex-col overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 shrink-0 gap-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-gold transition-colors font-black uppercase tracking-widest text-[10px]"
                >
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <ChevronLeft size={16} />
                    </div>
                    Quay lại
                </button>

                <div className="flex gap-2 bg-[#1a2332] p-1.5 rounded-[1.2rem] border border-white/5 shadow-2xl">
                    <button
                        onClick={() => setMode('enhance')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${mode === 'enhance' ? 'bg-gradient-to-r from-gold to-[#aa771c] text-black shadow-lg shadow-gold/20 scale-105' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Wand2 size={16} strokeWidth={2.5} /> Nâng cấp ảnh
                    </button>
                    <button
                        onClick={() => setMode('creator')}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${mode === 'creator' ? 'bg-gradient-to-r from-gold to-[#aa771c] text-black shadow-lg shadow-gold/20 scale-105' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Sparkles size={16} strokeWidth={2.5} /> Sáng tạo mới
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                {mode === 'enhance' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[500px]">
                        <div className="space-y-4">
                            <div className="bg-[#1a2332] border-2 border-dashed border-white/10 hover:border-gold/30 rounded-[2.5rem] min-h-[300px] lg:h-80 flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-500 shadow-2xl">
                                {enhanceImage ? (
                                    <img src={enhanceImage} className="w-full h-full object-cover" alt="Original" />
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-3xl flex items-center justify-center border border-white/20 mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                                            <Upload size={36} className="text-[#131b2e]" strokeWidth={2.5} />
                                        </div>
                                        <p className="font-black text-white uppercase tracking-widest text-sm">Tải ảnh thô / Đất nền</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Hỗ trợ JPG, PNG</p>
                                    </>
                                )}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleEnhanceUpload} accept="image/*" />
                            </div>

                            <div className="p-5 bg-[#1a2332] rounded-[1.8rem] border border-white/5 shadow-xl space-y-4">
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 px-1">Tỉ lệ khung hình</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(['1:1', '16:9', '3:4', '4:3'] as const).map(ratio => (
                                            <button
                                                key={ratio}
                                                onClick={() => setEnhanceAspectRatio(ratio)}
                                                className={`py-2 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest ${enhanceAspectRatio === ratio ? 'bg-gold/10 border-gold text-gold' : 'bg-black/20 border-white/5 text-slate-500 hover:text-slate-300'}`}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 px-1 text-right">Số lượng phương án</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[1, 2, 3].map(num => (
                                            <button
                                                key={num}
                                                onClick={() => setEnhanceVariants(num)}
                                                className={`py-2 rounded-xl border transition-all text-[10px] uppercase font-black tracking-widest ${enhanceVariants === num ? 'bg-white/10 border-gold text-gold shadow-lg' : 'bg-black/20 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-black/30'}`}
                                            >
                                                {num} ẢNH
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <label className="flex items-center gap-4 cursor-pointer w-full group pt-2 border-t border-white/5">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={isWideAngle}
                                            onChange={() => setIsWideAngle(!isWideAngle)}
                                        />
                                        <div className="w-12 h-6 bg-[#2a3547] rounded-full peer peer-checked:bg-gold transition-all duration-300 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-6"></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black text-white uppercase tracking-widest group-hover:text-gold transition-colors">Flycam Mode (V2)</span>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Góc chụp cao & rộng hơn</span>
                                    </div>
                                </label>
                            </div>

                            <button
                                onClick={runEnhance}
                                disabled={!enhanceImage || processing}
                                className={`w-full py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl flex items-center justify-center gap-3 transition-all duration-500 relative overflow-hidden group ${(!enhanceImage || processing) ? 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed' : 'bg-gradient-to-r from-[#d4af37] via-[#fcf6ba] to-[#aa771c] text-black hover:scale-[1.03] shadow-gold/30'}`}
                            >
                                {processing ? (
                                    <><RefreshCw className="animate-spin" /> {status}</>
                                ) : (
                                    <><Wand2 size={20} className="group-hover:rotate-12 transition-transform" /> PHÙ PHÉP (-{enhanceVariants * (isWideAngle ? 10 : 5)} CREDITS)</>
                                )}
                            </button>

                            <div className="bg-gold/5 p-4 rounded-3xl border border-gold/10 flex items-start gap-3">
                                <ShieldCheck size={18} className="text-gold shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">
                                    <strong>Mẹo:</strong> AI sẽ tự động "trang điểm", thêm nội thất và tạo bối cảnh lung linh để thu hút khách hàng.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 h-full">
                            <div className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden relative min-h-[400px] flex items-center justify-center border border-white/5 flex-1 shadow-inner group">
                                {enhancedResults.length > 0 && enhanceImage ? (
                                    <div className="relative w-full h-full select-none">
                                        <div
                                            className="relative w-full overflow-hidden transition-all duration-500 bg-black/20"
                                            style={{
                                                aspectRatio: enhanceAspectRatio.replace(':', '/'),
                                            }}
                                        >
                                            <img src={enhancedResults[selectedEnhancedIdx]} className="w-full h-full object-contain object-center absolute inset-0 transition-opacity duration-1000" alt="After" />
                                            <div
                                                className="absolute inset-0 z-20"
                                                style={{
                                                    clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                                                    WebkitClipPath: `inset(0 ${100 - sliderPos}% 0 0)`
                                                }}
                                            >
                                                <img src={enhanceImage} className="w-full h-full object-contain object-center pointer-events-none" alt="Before" />
                                            </div>
                                            <div
                                                className="absolute top-0 bottom-0 w-[1px] bg-gold/50 shadow-[0_0_15px_rgba(191,149,63,0.5)] z-30 pointer-events-none"
                                                style={{ left: `${sliderPos}%` }}
                                            >
                                                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 bg-gold rounded-full shadow-2xl flex items-center justify-center border border-black/20">
                                                    <span className="text-black text-[10px] font-black">⟷</span>
                                                </div>
                                            </div>
                                            <input
                                                type="range"
                                                min="0" max="100" value={sliderPos}
                                                onChange={(e) => setSliderPos(Number(e.target.value))}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40"
                                            />
                                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10 z-30 pointer-events-none">TRƯỚC (ORIGINAL)</div>
                                            <div className="absolute top-4 right-4 bg-gradient-to-r from-[#d4af37] to-[#aa771c] text-black px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg z-30 pointer-events-none">SAU (AI IMPROVED)</div>
                                        </div>
                                        <div className="absolute bottom-4 right-4 flex gap-3 z-50">
                                            <a href={enhancedResults[selectedEnhancedIdx]} download={`enhanced_ai_${selectedEnhancedIdx}.png`} className="bg-gold text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-110 transition-all border-2 border-black/20">
                                                <Download size={14} /> Tải ảnh
                                            </a>
                                        </div>
                                        {processing && (
                                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-gold/30 text-gold px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2 z-50">
                                                <div className="w-3 h-3 border-2 border-gold/30 border-t-gold rounded-full animate-spin"></div>
                                                {status}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center p-12">
                                        {processing ? (
                                            <div className="relative">
                                                <div className="w-16 h-16 border-2 border-gold/20 border-t-gold rounded-full animate-spin mb-6 mx-auto"></div>
                                                <p className="text-gold font-black uppercase tracking-[0.2em] text-sm animate-pulse">{status}</p>
                                                <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-3">Thời gian chờ dự kiến: {isWideAngle ? '25' : '15'}s</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-6 opacity-40">
                                                    <Sparkles size={40} className="text-slate-500" />
                                                </div>
                                                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1 opacity-60">Kết quả so sánh</h3>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-40 italic">Kết quả AI hiển thị tại đây</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {(enhancedResults.length > 1 || (processing && enhanceVariants > 1)) && (
                                <div className="flex gap-3 p-3 bg-[#1a2332] rounded-[1.8rem] border border-white/5 overflow-x-auto no-scrollbar shrink-0">
                                    {enhancedResults.map((img, idx) => {
                                        let label = '';
                                        if (isWideAngle) {
                                            const variant = Math.floor(idx / 2) + 1;
                                            label = idx % 2 === 0 ? `PA ${variant}` : `Mở rộng ${variant}`;
                                        } else {
                                            label = `Phương án ${idx + 1}`;
                                        }

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedEnhancedIdx(idx)}
                                                className={`relative min-w-[100px] h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${selectedEnhancedIdx === idx ? 'border-gold shadow-lg shadow-gold/10' : 'border-transparent opacity-40 hover:opacity-80'}`}
                                            >
                                                <img src={img} className="w-full h-full object-cover" alt={`Result ${idx}`} />
                                                <div className="absolute inset-x-0 bottom-0 bg-black/60 text-[7px] text-white font-black py-0.5 uppercase text-center tracking-tighter">
                                                    {label}
                                                </div>
                                            </button>
                                        );
                                    })}
                                    {processing && Array.from({ length: Math.max(0, (enhanceVariants * (isWideAngle ? 2 : 1)) - enhancedResults.length) }).map((_, idx) => (
                                        <div key={`loading-${idx}`} className="relative min-w-[100px] h-14 rounded-xl overflow-hidden border-2 border-dashed border-white/10 opacity-50 shrink-0 flex flex-col items-center justify-center gap-1 bg-black/20">
                                            <div className="w-4 h-4 border-2 border-gold/40 border-t-gold rounded-full animate-spin"></div>
                                            <span className="text-[7px] font-black uppercase text-gold/60 tracking-tighter">Đang xử lý</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
                        {/* Selector Form */}
                        <div className="bg-[#1a2332] p-7 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 px-1">Loại hình BĐS</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {['Biệt thự sân vườn', 'Nhà phố thương mại', 'Căn hộ cao cấp', 'Đất nền phân lô'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => setCreatorForm({ ...creatorForm, type: t })}
                                                className={`text-left p-3.5 rounded-xl border-2 transition-all flex items-center justify-between group ${creatorForm.type.includes(t) ? 'bg-gold border-gold text-black' : 'bg-[#212b3d] border-white/5 text-slate-300 hover:border-gold/30'}`}
                                            >
                                                <span className="text-xs font-black uppercase tracking-tight">{t}</span>
                                                {creatorForm.type.includes(t) && <ShieldCheck size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 px-1 text-right">Phong cách kiến trúc</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Hiện đại (Luxury)', 'Tân cổ điển', 'Tối giản', 'Địa Trung Hải'].map(style => (
                                            <button
                                                key={style}
                                                onClick={() => setCreatorForm({ ...creatorForm, style })}
                                                className={`p-3 text-center rounded-xl border transition-all text-[10px] uppercase font-black tracking-widest ${creatorForm.style === style ? 'bg-white/10 border-gold text-gold shadow-lg' : 'bg-black/20 border-white/5 text-slate-500 hover:text-slate-300 hover:bg-black/30'}`}
                                            >
                                                {style.split(' (')[0]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 px-1">Thời điểm & Ánh sáng</label>
                                    <select
                                        className="w-full p-4 rounded-xl border border-white/5 outline-none focus:border-gold bg-[#212b3d] text-white text-xs font-bold uppercase tracking-widest appearance-none cursor-pointer"
                                        value={creatorForm.lighting}
                                        onChange={(e) => setCreatorForm({ ...creatorForm, lighting: e.target.value })}
                                    >
                                        <option>Nắng sớm rực rỡ</option>
                                        <option>Hoàng hôn lãng mạn</option>
                                        <option>Ban đêm lung linh</option>
                                        <option>Trời nhiều mây</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 px-1">Khung hình (Aspect Ratio)</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { id: '1:1', label: '1:1 (Vuông)', desc: 'Post FB/Zalo' },
                                            { id: '16:9', label: '16:9 (Rộng)', desc: 'Cinematic' }
                                        ].map(ratio => (
                                            <button
                                                key={ratio.id}
                                                onClick={() => setCreatorForm({ ...creatorForm, aspectRatio: ratio.id as any })}
                                                className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-0.5 ${creatorForm.aspectRatio === ratio.id ? 'bg-gold/10 border-gold text-gold shadow-lg' : 'bg-black/20 border-white/5 text-slate-500 hover:text-slate-300'}`}
                                            >
                                                <span className="text-[10px] font-black uppercase tracking-widest">{ratio.label}</span>
                                                <span className="text-[7px] font-bold opacity-50 uppercase">{ratio.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={runCreator}
                                        disabled={processing}
                                        className={`w-full py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl flex items-center justify-center gap-3 transition-all duration-500 ${processing ? 'bg-white/5 text-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-[#d4af37] via-[#fcf6ba] to-[#aa771c] text-black hover:scale-[1.03] shadow-gold/30'}`}
                                    >
                                        {processing ? (
                                            <><RefreshCw className="animate-spin" /> {status}</>
                                        ) : (
                                            <><Sparkles size={20} /> TẠO PHỐI CẢNH (-5 CREDITS)</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5 min-h-[500px]">
                            {createdImages.length > 0 ? (
                                createdImages.map((img, idx) => (
                                    <div key={idx} className={`relative group rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#1a2332] shadow-2xl ${creatorForm.aspectRatio === '16:9' ? 'col-span-full aspect-video' : 'aspect-square'}`}>
                                        <img src={img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={`Result ${idx}`} />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                                            <div className="flex gap-2">
                                                <a
                                                    href={img}
                                                    download={`ai_render_${idx}.png`}
                                                    className="bg-gold text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-2xl hover:scale-105 transition-all"
                                                >
                                                    <Download size={16} /> Tải ảnh
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full h-full border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center bg-white/[0.02] relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-30"></div>
                                    {processing ? (
                                        <div className="text-center relative z-10 p-10">
                                            <div className="w-16 h-16 border-2 border-gold/20 border-t-gold rounded-full animate-spin mb-6 mx-auto"></div>
                                            <p className="font-black text-gold animate-pulse uppercase tracking-[0.2em]">{status}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center relative z-10 p-10 group cursor-default">
                                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/5 mb-6 mx-auto group-hover:border-gold/30 transition-all duration-700">
                                                <Palette size={40} className="text-slate-700 group-hover:text-gold/50 transition-colors duration-700" />
                                            </div>
                                            <h3 className="text-white/60 font-black uppercase tracking-widest mb-2">Trung tâm sáng tạo AI</h3>
                                            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">Nhập thông tin và nhấn "Khởi tạo" để xem tổ ấm tương lai</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }` }} />
        </div >
    );
};

export default AiStudio;
