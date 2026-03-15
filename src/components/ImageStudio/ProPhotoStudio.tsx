import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, RefreshCw, ChevronLeft, Camera, UserCircle, Building2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { geminiGenerateImage } from '../../services/aiProxy';
import { refundCredits } from '../../services/aiService';
import { getAppSetting } from '../../services/settingsService';
import { useCreditGate } from '../../hooks/useCreditGate';
import { CreditGateModal } from '../../components/CreditGateModal';
import { optimizeImage } from '../../utils/imageUtils';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const COST_PER_USE = 10;

const DEFAULT_PROFILE_PROMPT = `Bạn là nhiếp ảnh gia chuyên nghiệp với 20 năm kinh nghiệm chụp ảnh chân dung doanh nhân.
Nhiệm vụ: Biến bức ảnh chân dung này thành ảnh profile chuẩn doanh nhân bất động sản.

PHONG CÁCH: {style}

QUY TẮC CHỤP ẢNH (BẮT BUỘC):
1. KHUÔN MẶT: GIỮ NGUYÊN 100% đặc điểm nhận dạng, cấu trúc xương, mắt, mũi, miệng. Chỉ cải thiện da (mịn tự nhiên, KHÔNG bóng nhẵn như nhựa).
2. TRANG PHỤC: Vest hoặc áo sơ mi cổ đứng, chỉnh tề. Vải phải có VÂN VẢI thật (không trơn bóng).
3. ÁNH SÁNG: Setup 3-point lighting studio — key light 45° bên phải, fill light nhẹ bên trái, rim light phía sau tạo viền sáng tóc/vai. Tạo catchlight tự nhiên trong mắt.
4. BACKGROUND CỰC KỲ QUAN TRỌNG:
   - PHẢI là background THẬT, có CHIỀU SÂU, có ĐỒ VẬT nhận diện được (cửa kính, kệ sách, cây xanh mờ, tòa nhà xa xa...)
   - Bokeh tự nhiên f/1.8-2.8 — các điểm sáng tròn mềm, lan ra tự nhiên, KHÔNG đều như pattern
   - TUYỆT ĐỐI KHÔNG dùng gradient đơn sắc, nền trơn, hay nền mờ không có chi tiết gì cả
   - Background phải nhìn như CHỤP THẬT bằng ống kính 85mm f/1.8 Canon
5. TEXTURE: Da có lỗ chân lông nhẹ, tóc có sợi rõ, mắt có mạch máu li ti. KHÔNG được mịn như sáp.
6. ANTI-AI: Tuyệt đối KHÔNG có vết lạ trên da, ngón tay bị méo, răng bất thường, background bị warp. Kết quả PHẢI 100% trông như ẢNH CHỤP THẬT.
7. Tỉ lệ 1:1 vuông, chất lượng cao.`;

const DEFAULT_COMPOSITE_PROMPT = `Bạn là chuyên gia ghép ảnh bất động sản chuyên nghiệp.
Hãy tạo một bức ảnh composite chuyên nghiệp: người trong ảnh chân dung ĐỨNG TRƯỚC dự án bất động sản trong ảnh nền.

QUY TẮC BẮT BUỘC:
1. GIỮ NGUYÊN khuôn mặt và đặc điểm nhận dạng của người trong ảnh chân dung.
2. Đặt người ở vị trí 1/3 bên trái hoặc phải khung hình, hơi quay người về phía dự án.
3. Trang phục: vest/áo sơ mi chuyên nghiệp, tay cầm tài liệu hoặc đang giới thiệu.
4. Dự án bất động sản làm nền phía sau, hơi blur nhẹ để tạo chiều sâu.
5. Ánh sáng tự nhiên, hài hòa giữa người và nền.
6. Kết quả trông như ẢNH CHỤP THẬT tại công trường, KHÔNG giống ghép photoshop.
7. Tỉ lệ 4:3 landscape, chất lượng cao.

PHÂN TÍCH BẮT BUỘC TRƯỚC KHI TẠO ẢNH:
1. PHÂN TÍCH ẢNH DỰ ÁN (ảnh thứ 2): Xác định góc chụp (tầm mắt/từ dưới lên/flycam), hướng ánh sáng (trái/phải/trước/sau), thời điểm (sáng/chiều/tối), và vị trí tự nhiên nhất để một người đứng.
2. PHÂN TÍCH ẢNH CHÂN DUNG (ảnh thứ 1): Xác định hướng mặt, góc nhìn, trang phục hiện tại.
3. GHÉP THÔNG MINH:
   - Đặt người ở vị trí 1/3 khung hình, ĐÚNG TỶ LỆ so với tòa nhà/công trình trong ảnh dự án.
   - CHIỀU SÁNG phải KHỚP: Nếu ánh sáng trong ảnh dự án chiếu từ trái → bóng người cũng đổ sang phải.
   - PHỐI CẢNH phải KHỚP: Nếu ảnh dự án chụp từ dưới lên → người phải nhìn hơi từ dưới lên.
   - Thêm BÓNG ĐỔ tự nhiên dưới chân người trên mặt đất.
   - Người ĐỨNG TRÊN MẶT ĐẤT/VỈA HÈ thực tế trong ảnh, KHÔNG lơ lửng.
4. TƯ THẾ: Người đang giới thiệu dự án — một tay hướng về phía công trình hoặc cầm tài liệu, đứng tự tin, hơi nghiêng người về phía dự án.
5. KẾT QUẢ phải trông như ẢNH CHỤP THẬT bằng DSLR tại công trường, KHÔNG giống ghép Photoshop.
6. Tỉ lệ 4:3 landscape, chất lượng cao, sắc nét.`;

const STUDIO_POSTURES = [
    { id: 'p1', image: '/images/studio/postures/p1.png', name: 'Khoanh tay tự tin', prompt: 'Đứng vắt chéo tay trước ngực, phong thái tự tin uy quyền, mắt nhìn thẳng.' },
    { id: 'p2', image: '/images/studio/postures/p2.png', name: 'Chỉ tay giới thiệu', prompt: 'Đứng một tay hướng về phía trước như đang giới thiệu dự án hoặc tư vấn.' },
    { id: 'p3', image: '/images/studio/postures/p3.png', name: 'Cầm tài liệu/cặp', prompt: 'Một tay cầm cặp xách da hoặc kẹp tài liệu ngân hàng, phong cách doanh nhân bận rộn.' },
    { id: 'p4', image: '/images/studio/postures/p4.png', name: 'Ngồi sofa sảnh', prompt: 'Ngồi vắt chéo chân thả lỏng trên ghế sofa, phong thái sang trọng đẳng cấp.' },
    { id: 'p5', image: '/images/studio/postures/p5.png', name: 'Bỏ tay túi quần', prompt: 'Đứng thẳng, một tay đút túi quần, phong cách thoải mái, thanh lịch, mỉm cười.' },
    { id: 'p6', image: '/images/studio/postures/p6.png', name: 'Đưa tay bắt tay', prompt: 'Đứng hướng người về phía trước, một tay đưa ra chuẩn bị bắt tay khách hàng.' },
    { id: 'p7', image: '/images/studio/postures/p7.png', name: 'Tựa mép bàn', prompt: 'Ngồi tựa nhẹ hông vào mép bàn làm việc, tự tin.' },
    { id: 'p8', image: '/images/studio/postures/p8.png', name: 'Nghe điện thoại', prompt: 'Một tay đang cầm điện thoại áp vào tai nghe, dáng vẻ đang xử lý giao dịch.' },
    { id: 'p9', image: '/images/studio/postures/p9.png', name: 'Cầm ly cafe', prompt: 'Một tay cầm tách trà hoặc ly cafe, phong cách trò chuyện tư vấn gần gũi.' },
    { id: 'p10', image: '/images/studio/postures/p10.png', name: 'Sải bước đi', prompt: 'Tư thế đang sải bước đi tới, áo vest bay nhẹ theo gió, tác phong người dẫn đầu.' },
];

const STUDIO_BACKGROUNDS = [
    { id: 'b1', image: '/images/studio/backgrounds/b1.png', name: 'Văn phòng Cao cấp', prompt: 'Văn phòng làm việc sang trọng, tường kính trong suốt, có thể thấy view toàn thành phố từ trên cao.' },
    { id: 'b2', image: '/images/studio/backgrounds/b2.png', name: 'Khách sạn hạng sang', prompt: 'Sảnh khách sạn hạng sang, đèn chùm rực rỡ, nội thất tông vàng/beige cực kỳ cao cấp.' },
    { id: 'b3', image: '/images/studio/backgrounds/b3.png', name: 'Công trường dự án', prompt: 'Công trường xây dựng hiện đại, có cần cẩu và cấu trúc tòa nhà đang xây phía xa, bầu trời xanh trong.' },
    { id: 'b4', image: '/images/studio/backgrounds/b4.png', name: 'Biệt thự sân vườn', prompt: 'Khuôn viên biệt thự sang trọng, có cây cảnh, hồ bơi nước trong xanh, ánh nắng đẹp rực rỡ.' },
    { id: 'b5', image: '/images/studio/backgrounds/b5.png', name: 'Cafe Doanh nhân', prompt: 'Không gian góc quán cafe sang trọng, tông màu gỗ ấm áp, ánh sáng đèn vàng tinh tế.' },
];

type ProPhotoMode = 'profile' | 'composite' | 'studio';
type ProfileStyle = 'energetic' | 'professional';

const ProPhotoStudio = ({ onBack }: { onBack: () => void }) => {
    const { refreshProfile } = useAuth();
    const { gateState, dismissGate, attemptAction } = useCreditGate();
    const isMounted = useRef(true);
    const processingRef = useRef(false);

    useEffect(() => { return () => { isMounted.current = false; }; }, []);

    const [mode, setMode] = useState<ProPhotoMode>('profile');
    const [processing, setProcessing] = useState(false);
    const [status, setStatus] = useState('');

    // Profile mode state
    const [profileStyle, setProfileStyle] = useState<ProfileStyle>('professional');
    const [portraitImage, setPortraitImage] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);

    // Composite mode state
    const [selfieImage, setSelfieImage] = useState<string | null>(null);
    const [projectImage, setProjectImage] = useState<string | null>(null);
    const [compositeResult, setCompositeResult] = useState<string | null>(null);

    // Studio mode state
    const [studioImage, setStudioImage] = useState<string | null>(null);
    const [studioResult, setStudioResult] = useState<string | null>(null);
    const [selectedPosture, setSelectedPosture] = useState(STUDIO_POSTURES[0].id);
    const [selectedBg, setSelectedBg] = useState(STUDIO_BACKGROUNDS[0].id);

    const portraitInputRef = useRef<HTMLInputElement>(null);
    const selfieInputRef = useRef<HTMLInputElement>(null);
    const projectInputRef = useRef<HTMLInputElement>(null);
    const studioInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: (val: string | null) => void
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const optimized = await optimizeImage(file, 1500, 1500, 0.85);
            setter(optimized);
        } catch (err) {
            toast.error('Lỗi khi xử lý ảnh: ' + (err as Error).message);
        }
    };

    const getCleanBase64 = (dataUrl: string) => {
        const match = dataUrl.match(/^data:[^;]+;base64,(.+)$/);
        return match ? match[1] : dataUrl;
    };

    const runProfileGenerate = async () => {
        if (!portraitImage || processingRef.current) return;

        const deduction = await attemptAction(COST_PER_USE, 'Ảnh Profile Sales Pro');
        if (!deduction.success) return;

        processingRef.current = true;
        setProcessing(true);
        setResultImage(null);
        setStatus('📸 AI đang phân tích khuôn mặt...');

        try {
            const styleDesc = profileStyle === 'energetic'
                ? 'NĂNG LƯỢNG: Nụ cười tươi tắn rạng rỡ, mắt sáng tự tin. BỐI CẢNH: Ngoài trời — công viên xanh mát hoặc sảnh tòa nhà kính hiện đại. Ánh nắng tự nhiên golden hour, có flare nhẹ. Cây xanh thật có lá rõ ràng phía sau. Tông ấm vàng cam nhẹ.'
                : 'CHUYÊN NGHIỆP: Biểu cảm tự tin, ánh mắt sắc bén nhưng thân thiện. BỐI CẢNH: Văn phòng CEO hoặc sảnh khách sạn 5 sao — tường kính, đèn trần sang trọng, ghế da mờ phía sau. Có chi tiết nhận diện được như bình hoa, tranh treo tường, kệ sách. Tông trung tính xám-be-navy.';

            const basePrompt = await getAppSetting('ai_pro_photo_profile_prompt') || DEFAULT_PROFILE_PROMPT;
            const prompt = basePrompt.replace('{style}', styleDesc);
            const modelId = await getAppSetting('ai_model_pro_photo') || 'gemini-3.1-flash-image-preview';

            if (!isMounted.current) return;
            setStatus('🎨 AI đang tạo ảnh profile...');
            const data = await geminiGenerateImage({
                prompt,
                model: modelId,
                aspectRatio: '1:1',
                baseImage: getCleanBase64(portraitImage)
            });

            if (data.predictions?.[0]?.bytesBase64Encoded) {
                if (isMounted.current) setResultImage(`data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`);
                toast.success('Ảnh profile đã sẵn sàng!');
                await refreshProfile?.();
            } else {
                const errMsg = data.error?.message || 'Không thể tạo ảnh';
                toast.error(errMsg + '. Hoàn lại Xu...');
                await refundCredits(COST_PER_USE, `Profile failed: ${errMsg}`);
                await refreshProfile?.();
            }
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown';
            toast.error('Lỗi: ' + errMsg + '. Hoàn lại Xu...');
            await refundCredits(COST_PER_USE, `Profile exception: ${errMsg}`);
            await refreshProfile?.();
        } finally {
            processingRef.current = false;
            if (isMounted.current) setProcessing(false);
        }
    };

    const runCompositeGenerate = async () => {
        if (!selfieImage || !projectImage || processingRef.current) return;

        const deduction = await attemptAction(COST_PER_USE, 'Ghép ảnh Sales + Dự án');
        if (!deduction.success) return;

        processingRef.current = true;
        setProcessing(true);
        setCompositeResult(null);
        setStatus('📸 AI đang phân tích 2 bức ảnh...');

        try {
            const basePrompt = await getAppSetting('ai_pro_photo_composite_prompt') || DEFAULT_COMPOSITE_PROMPT;
            const modelId = await getAppSetting('ai_model_pro_photo') || 'gemini-3.1-flash-image-preview';

            if (!isMounted.current) return;
            setStatus('🎨 AI đang ghép ảnh chuyên nghiệp...');
            const data = await geminiGenerateImage({
                prompt: basePrompt,
                model: modelId,
                aspectRatio: '4:3',
                baseImage: getCleanBase64(selfieImage),
                extraImages: [getCleanBase64(projectImage)]
            });

            if (data.predictions?.[0]?.bytesBase64Encoded) {
                if (isMounted.current) setCompositeResult(`data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`);
                toast.success('Ảnh ghép đã sẵn sàng!');
                await refreshProfile?.();
            } else {
                const errMsg = data.error?.message || 'Không thể tạo ảnh ghép';
                toast.error(errMsg + '. Hoàn lại Xu...');
                await refundCredits(COST_PER_USE, `Composite failed: ${errMsg}`);
                await refreshProfile?.();
            }
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown';
            toast.error('Lỗi: ' + errMsg + '. Hoàn lại Xu...');
            await refundCredits(COST_PER_USE, `Composite exception: ${errMsg}`);
            await refreshProfile?.();
        } finally {
            processingRef.current = false;
            if (isMounted.current) setProcessing(false);
        }
    };

    const runStudioGenerate = async () => {
        if (!studioImage || processingRef.current) return;

        const deduction = await attemptAction(COST_PER_USE, 'Ảnh Sale Studio 3D');
        if (!deduction.success) return;

        processingRef.current = true;
        setProcessing(true);
        setStudioResult(null);
        setStatus('📸 AI đang phân tích yêu cầu...');

        try {
            const posture = STUDIO_POSTURES.find(p => p.id === selectedPosture);
            const bg = STUDIO_BACKGROUNDS.find(b => b.id === selectedBg);

            const defaultStudioPrompt = `Bạn là chuyên gia thiết kế và chỉnh sửa ảnh doanh nhân bất động sản.
Nhiệm vụ: Tạo một bức ảnh MỚI TỪ ĐẦU dựa trên nét mặt của người trong ảnh gốc. 
TUYỆT ĐỐI GIỮ NGUYÊN HOÀN TOÀN 100% tỷ lệ khuôn mặt, đặc điểm nhận dạng của người trong ảnh chân dung.

YÊU CẦU:
- TƯ THẾ (POSTURE): {posture}. Đứng ở vị trí nổi bật.
- TRANG PHỤC: Vest/Suit nam/nữ cực kỳ sang trọng, phẳng phiu, form dáng chuẩn chuyên nghiệp.
- BỐI CẢNH (BACKGROUND): {background}
- ÁNH SÁNG: Sáng rõ mặt, ánh sáng studio chuẩn, như chụp bằng máy ảnh cơ cao cấp DSLR 85mm. Bóng đổ tự nhiên.
- CHẤT LƯỢNG: Sắc nét 8k, CỰC KỲ THẬT, không giống ghép, không giống tranh vẽ hoạt hình. Tỉ lệ khung hình dọc 3:4.`;

            const basePrompt = await getAppSetting('ai_pro_photo_studio_prompt') || defaultStudioPrompt;
            const prompt = basePrompt
                .replace('{posture}', posture?.prompt || '')
                .replace('{background}', bg?.prompt || '');

            const modelId = await getAppSetting('ai_model_pro_photo_studio') || 'gemini-3.1-flash-image-preview';

            if (!isMounted.current) return;
            setStatus('🎨 AI đang tạo ảnh Studio...');
            const data = await geminiGenerateImage({
                prompt,
                model: modelId,
                aspectRatio: '3:4',
                baseImage: getCleanBase64(studioImage)
            });

            if (data.predictions?.[0]?.bytesBase64Encoded) {
                if (isMounted.current) setStudioResult(`data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`);
                toast.success('Ảnh Studio đã sẵn sàng!');
                await refreshProfile?.();
            } else {
                const errMsg = data.error?.message || 'Không thể tạo ảnh';
                toast.error(errMsg + '. Hoàn lại Xu...');
                await refundCredits(COST_PER_USE, `Studio failed: ${errMsg}`);
                await refreshProfile?.();
            }
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : 'Unknown';
            toast.error('Lỗi: ' + errMsg + '. Hoàn lại Xu...');
            await refundCredits(COST_PER_USE, `Studio exception: ${errMsg}`);
            await refreshProfile?.();
        } finally {
            processingRef.current = false;
            if (isMounted.current) setProcessing(false);
        }
    };

    const currentResult = mode === 'profile' ? resultImage : mode === 'composite' ? compositeResult : studioResult;

    return (
        <div className="h-[calc(100vh-80px)] md:h-full flex flex-col overflow-hidden">
            <CreditGateModal state={gateState} onDismiss={dismissGate} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 shrink-0 gap-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-gold transition-colors font-black uppercase tracking-widest text-[10px]"
                >
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <ChevronLeft size={16} />
                    </div>
                    Quay lại
                </button>

                <div className="flex gap-2 bg-[#1a2332] p-2 rounded-[1.2rem] border border-white/5 shadow-2xl items-center px-5">
                    <Camera size={16} className="text-gold" strokeWidth={2.5} />
                    <span className="text-xs font-black text-gold uppercase tracking-widest leading-none">Ảnh Chuyên Nghiệp</span>
                </div>
            </div>

            {/* Mode Tabs */}
            <div className="flex bg-white/5 p-1.5 rounded-2xl w-fit gap-1.5 border border-white/10 shadow-lg mb-5 shrink-0">
                <button
                    onClick={() => { setMode('profile'); setCompositeResult(null); }}
                    className={`py-2.5 px-5 rounded-xl font-black text-[10px] flex items-center gap-2.5 transition-all uppercase tracking-widest ${mode === 'profile' ? 'bg-gold text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <UserCircle size={14} strokeWidth={3} /> Ảnh Profile
                </button>
                <button
                    onClick={() => { setMode('composite'); setResultImage(null); }}
                    className={`py-2.5 px-5 rounded-xl font-black text-[10px] flex items-center gap-2.5 transition-all uppercase tracking-widest ${mode === 'composite' ? 'bg-gold text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <Building2 size={14} strokeWidth={3} /> Ghép Ảnh Dự Án
                </button>
                <button
                    onClick={() => { setMode('studio'); setStudioResult(null); }}
                    className={`py-2.5 px-5 rounded-xl font-black text-[10px] flex items-center gap-2.5 transition-all uppercase tracking-widest ${mode === 'studio' ? 'bg-gold text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <UserCircle size={14} strokeWidth={3} /> Studio Toàn Thân
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                {mode === 'profile' ? (
                    /* ═══════════ PROFILE MODE ═══════════ */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[500px]">
                        {/* Left: Upload + Settings */}
                        <div className="space-y-4">
                            {/* Upload Zone */}
                            <div
                                onClick={() => portraitInputRef.current?.click()}
                                className="bg-[#1a2332] border-2 border-dashed border-white/10 hover:border-gold/30 rounded-[2.5rem] h-72 flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-500 shadow-2xl cursor-pointer p-2"
                            >
                                {portraitImage ? (
                                    <img src={portraitImage} className="w-full h-full object-contain rounded-3xl" alt="Portrait" />
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-3xl flex items-center justify-center border border-white/20 mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                                            <Upload size={36} className="text-[#131b2e]" strokeWidth={2.5} />
                                        </div>
                                        <p className="font-black text-white uppercase tracking-widest text-sm">Tải ảnh chân dung</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Selfie hoặc ảnh thẻ đều được</p>
                                    </>
                                )}
                                <input
                                    ref={portraitInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => { handleImageUpload(e, setPortraitImage); setResultImage(null); }}
                                    accept="image/*"
                                />
                            </div>

                            {/* Style Selection */}
                            <div className="p-5 bg-[#1a2332] rounded-[1.8rem] border border-white/5 shadow-xl space-y-4">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block px-1">Phong cách ảnh Profile</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setProfileStyle('energetic')}
                                        className={`p-4 rounded-2xl border-2 transition-all text-center group ${profileStyle === 'energetic'
                                            ? 'bg-gold/10 border-gold shadow-lg shadow-gold/10'
                                            : 'bg-black/20 border-white/5 hover:border-gold/30'}`}
                                    >
                                        <div className="text-2xl mb-2">😄</div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${profileStyle === 'energetic' ? 'text-gold' : 'text-slate-400'}`}>
                                            Năng Lượng
                                        </p>
                                        <p className="text-[8px] text-slate-500 font-bold mt-0.5">Vui vẻ, tự tin, năng động</p>
                                    </button>
                                    <button
                                        onClick={() => setProfileStyle('professional')}
                                        className={`p-4 rounded-2xl border-2 transition-all text-center group ${profileStyle === 'professional'
                                            ? 'bg-gold/10 border-gold shadow-lg shadow-gold/10'
                                            : 'bg-black/20 border-white/5 hover:border-gold/30'}`}
                                    >
                                        <div className="text-2xl mb-2">🤵</div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${profileStyle === 'professional' ? 'text-gold' : 'text-slate-400'}`}>
                                            Chuyên Nghiệp
                                        </p>
                                        <p className="text-[8px] text-slate-500 font-bold mt-0.5">Lịch lãm, uy tín, đẳng cấp</p>
                                    </button>
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={runProfileGenerate}
                                disabled={!portraitImage || processing}
                                className={`w-full py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl flex items-center justify-center gap-3 transition-all duration-500 relative overflow-hidden group ${(!portraitImage || processing) ? 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed' : 'bg-gradient-to-r from-[#d4af37] via-[#fcf6ba] to-[#aa771c] text-black hover:brightness-105 shadow-gold/30 hover:shadow-[0_15px_40px_-15px_rgba(212,175,55,0.7)]'}`}
                            >
                                {processing ? (
                                    <><RefreshCw className="animate-spin" /> {status}</>
                                ) : (
                                    <><Camera size={20} className="group-hover:rotate-12 transition-transform" /> TẠO ẢNH PROFILE (-{COST_PER_USE} XU)</>
                                )}
                            </button>
                        </div>

                        {/* Right: Result */}
                        <div className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden relative min-h-[400px] flex items-center justify-center border border-white/5 shadow-inner group">
                            {resultImage ? (
                                <div className="relative w-full h-full">
                                    <img src={resultImage} className="w-full h-full object-contain" alt="AI Profile" />
                                    <div className="absolute bottom-4 right-4 flex gap-3 z-50">
                                        <a href={resultImage} download="profile_pro.png" className="bg-gold text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-110 transition-all border-2 border-black/20">
                                            <Download size={14} /> Tải ảnh
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-12">
                                    {processing ? (
                                        <div className="relative">
                                            <div className="w-16 h-16 border-2 border-gold/20 border-t-gold rounded-full animate-spin mb-6 mx-auto" />
                                            <p className="text-gold font-black animate-pulse uppercase tracking-[0.2em] text-sm">{status}</p>
                                            <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-3">Thời gian dự kiến: ~15s</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-6 opacity-40">
                                                <UserCircle size={40} className="text-slate-500" />
                                            </div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1 opacity-60">Ảnh Profile AI</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-40 italic max-w-[200px]">Upload ảnh chân dung và chọn phong cách</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : mode === 'composite' ? (
                    /* ═══════════ COMPOSITE MODE ═══════════ */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[500px]">
                        {/* Left: Two Upload Zones */}
                        <div className="space-y-4">
                            {/* Selfie Upload */}
                            <div
                                onClick={() => selfieInputRef.current?.click()}
                                className="bg-[#1a2332] border-2 border-dashed border-white/10 hover:border-gold/30 rounded-[2rem] h-44 flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-500 shadow-xl cursor-pointer p-2"
                            >
                                {selfieImage ? (
                                    <img src={selfieImage} className="w-full h-full object-contain rounded-2xl" alt="Selfie" />
                                ) : (
                                    <>
                                        <div className="w-14 h-14 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-2xl flex items-center justify-center border border-white/20 mb-3 group-hover:scale-110 transition-transform shadow-lg">
                                            <UserCircle size={28} className="text-[#131b2e]" strokeWidth={2.5} />
                                        </div>
                                        <p className="font-black text-white uppercase tracking-widest text-xs">Ảnh chân dung của bạn</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Selfie, ảnh thẻ hoặc ảnh nửa người</p>
                                    </>
                                )}
                                <input
                                    ref={selfieInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => { handleImageUpload(e, setSelfieImage); setCompositeResult(null); }}
                                    accept="image/*"
                                />
                            </div>

                            {/* Project Upload */}
                            <div
                                onClick={() => projectInputRef.current?.click()}
                                className="bg-[#1a2332] border-2 border-dashed border-white/10 hover:border-gold/30 rounded-[2rem] h-44 flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-500 shadow-xl cursor-pointer p-2"
                            >
                                {projectImage ? (
                                    <img src={projectImage} className="w-full h-full object-contain rounded-2xl" alt="Project" />
                                ) : (
                                    <>
                                        <div className="w-14 h-14 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-2xl flex items-center justify-center border border-white/20 mb-3 group-hover:scale-110 transition-transform shadow-lg">
                                            <Building2 size={28} className="text-[#131b2e]" strokeWidth={2.5} />
                                        </div>
                                        <p className="font-black text-white uppercase tracking-widest text-xs">Ảnh dự án / Công trình</p>
                                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Ảnh phối cảnh hoặc ảnh thực tế</p>
                                    </>
                                )}
                                <input
                                    ref={projectInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => { handleImageUpload(e, setProjectImage); setCompositeResult(null); }}
                                    accept="image/*"
                                />
                            </div>

                            {/* Info */}
                            <div className="bg-gold/5 p-4 rounded-2xl border border-gold/10 flex items-start gap-3">
                                <Sparkles size={16} className="text-gold shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                    <strong className="text-gold">Mẹo:</strong> AI sẽ ghép bạn vào trước dự án như đang đứng giới thiệu tại hiện trường. Ảnh chân dung nên có nền đơn giản để AI tách người dễ hơn.
                                </p>
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={runCompositeGenerate}
                                disabled={!selfieImage || !projectImage || processing}
                                className={`w-full py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl flex items-center justify-center gap-3 transition-all duration-500 relative overflow-hidden group ${(!selfieImage || !projectImage || processing) ? 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed' : 'bg-gradient-to-r from-[#d4af37] via-[#fcf6ba] to-[#aa771c] text-black hover:brightness-105 shadow-gold/30 hover:shadow-[0_15px_40px_-15px_rgba(212,175,55,0.7)]'}`}
                            >
                                {processing ? (
                                    <><RefreshCw className="animate-spin" /> {status}</>
                                ) : (
                                    <><ImageIcon size={20} className="group-hover:rotate-12 transition-transform" /> GHÉP ẢNH CHUYÊN NGHIỆP (-{COST_PER_USE} XU)</>
                                )}
                            </button>
                        </div>

                        {/* Right: Result */}
                        <div className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden relative min-h-[400px] flex items-center justify-center border border-white/5 shadow-inner group">
                            {compositeResult ? (
                                <div className="relative w-full h-full">
                                    <img src={compositeResult} className="w-full h-full object-contain" alt="Composite" />
                                    <div className="absolute bottom-4 right-4 flex gap-3 z-50">
                                        <a href={compositeResult} download="composite_pro.png" className="bg-gold text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-110 transition-all border-2 border-black/20">
                                            <Download size={14} /> Tải ảnh
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-12">
                                    {processing ? (
                                        <div className="relative">
                                            <div className="w-16 h-16 border-2 border-gold/20 border-t-gold rounded-full animate-spin mb-6 mx-auto" />
                                            <p className="text-gold font-black animate-pulse uppercase tracking-[0.2em] text-sm">{status}</p>
                                            <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-3">Thời gian dự kiến: ~20s</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-6 opacity-40">
                                                <Building2 size={40} className="text-slate-500" />
                                            </div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1 opacity-60">Ảnh Ghép AI</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-40 italic max-w-[200px]">Upload ảnh bạn + ảnh dự án để AI ghép</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : mode === 'studio' ? (
                    /* ═══════════ STUDIO MODE ═══════════ */
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[500px]">
                        {/* Left: Settings */}
                        <div className="space-y-4">
                            {/* Upload Zone */}
                            <div
                                onClick={() => studioInputRef.current?.click()}
                                className="bg-[#1a2332] border-2 border-dashed border-white/10 hover:border-gold/30 rounded-[2.5rem] h-36 flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-500 shadow-xl cursor-pointer p-2"
                            >
                                {studioImage ? (
                                    <img src={studioImage} className="w-full h-full object-contain rounded-3xl" alt="Portrait" />
                                ) : (
                                    <>
                                        <div className="w-12 h-12 bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] rounded-2xl flex items-center justify-center border border-white/20 mb-2 group-hover:scale-110 transition-transform shadow-lg">
                                            <Upload size={24} className="text-[#131b2e]" strokeWidth={2.5} />
                                        </div>
                                        <p className="font-black text-white uppercase tracking-widest text-xs">Tải ảnh mặt của bạn</p>
                                    </>
                                )}
                                <input
                                    ref={studioInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => { handleImageUpload(e, setStudioImage); setStudioResult(null); }}
                                    accept="image/*"
                                />
                            </div>

                            {/* Select Posture */}
                            <div className="bg-[#1a2332] p-4 rounded-[1.8rem] border border-white/5 shadow-xl">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block px-1 mb-2">1. Chọn Dáng Người (Tư Thế)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
                                    {STUDIO_POSTURES.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedPosture(p.id)}
                                            className={`p-1 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-1.5 overflow-hidden group ${selectedPosture === p.id ? 'bg-gold/10 border-gold shadow-md' : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}`}
                                        >
                                            <div className="w-full h-20 rounded-lg overflow-hidden relative">
                                                <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} />
                                                {selectedPosture === p.id && <div className="absolute inset-0 bg-gold/20 mix-blend-overlay"></div>}
                                            </div>
                                            <span className={`text-[9px] font-bold leading-tight line-clamp-1 w-full px-1 ${selectedPosture === p.id ? 'text-gold' : 'text-slate-300 group-hover:text-white'}`}>{p.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Select Background */}
                            <div className="bg-[#1a2332] p-4 rounded-[1.8rem] border border-white/5 shadow-xl">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block px-1 mb-2">2. Chọn Bối Cảnh (Background)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {STUDIO_BACKGROUNDS.map(b => (
                                        <button
                                            key={b.id}
                                            onClick={() => setSelectedBg(b.id)}
                                            className={`p-1 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-1.5 overflow-hidden group ${selectedBg === b.id ? 'bg-gold/10 border-gold shadow-md' : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}`}
                                        >
                                            <div className="w-full h-16 rounded-lg overflow-hidden relative">
                                                <img src={b.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={b.name} />
                                                {selectedBg === b.id && <div className="absolute inset-0 bg-gold/20 mix-blend-overlay"></div>}
                                            </div>
                                            <span className={`text-[9px] font-bold leading-tight line-clamp-1 w-full px-1 ${selectedBg === b.id ? 'text-gold' : 'text-slate-300 group-hover:text-white'}`}>{b.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button
                                onClick={runStudioGenerate}
                                disabled={!studioImage || processing}
                                className={`w-full py-5 rounded-[1.8rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl flex items-center justify-center gap-3 transition-all duration-500 relative overflow-hidden group ${(!studioImage || processing) ? 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed' : 'bg-gradient-to-r from-[#d4af37] via-[#fcf6ba] to-[#aa771c] text-black hover:brightness-105 shadow-gold/30 hover:shadow-[0_15px_40px_-15px_rgba(212,175,55,0.7)]'}`}
                            >
                                {processing ? (
                                    <><RefreshCw className="animate-spin" /> {status}</>
                                ) : (
                                    <><Camera size={20} className="group-hover:rotate-12 transition-transform" /> TẠO ẢNH SALE (-{COST_PER_USE} XU)</>
                                )}
                            </button>
                        </div>

                        {/* Right: Result */}
                        <div className="bg-[#0f172a] rounded-[2.5rem] overflow-hidden relative min-h-[400px] flex items-center justify-center border border-white/5 shadow-inner group">
                            {studioResult ? (
                                <div className="relative w-full h-full">
                                    <img src={studioResult} className="w-full h-full object-contain" alt="Studio Result" />
                                    <div className="absolute bottom-4 right-4 flex gap-3 z-50">
                                        <a href={studioResult} download="sale_pro.png" className="bg-gold text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-110 transition-all border-2 border-black/20">
                                            <Download size={14} /> Tải ảnh
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-12">
                                    {processing ? (
                                        <div className="relative">
                                            <div className="w-16 h-16 border-2 border-gold/20 border-t-gold rounded-full animate-spin mb-6 mx-auto" />
                                            <p className="text-gold font-black animate-pulse uppercase tracking-[0.2em] text-sm">{status}</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 mb-6 opacity-40">
                                                <UserCircle size={40} className="text-slate-500" />
                                            </div>
                                            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1 opacity-60">Studio 3D AI</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest opacity-40 italic max-w-[200px]">Chọn dáng và bối cảnh để tạo ảnh</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default ProPhotoStudio;
