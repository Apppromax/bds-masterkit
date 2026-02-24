import React, { useEffect, useRef, useState } from 'react';
import { X, PlayCircle, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DemoVideoOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    videoUrl: string;
    targetRoute: string;
    title: string;
}

export function DemoVideoOverlay({ isOpen, onClose, videoUrl, targetRoute, title }: DemoVideoOverlayProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const navigate = useNavigate();
    const [isVideoEnded, setIsVideoEnded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Reset state when opened
    useEffect(() => {
        if (isOpen) {
            setIsVideoEnded(false);
            setIsLoading(true);
            setHasError(false);
            document.body.style.overflow = 'hidden';

            // Auto play if available
            if (videoRef.current) {
                videoRef.current.play().catch(e => {
                    console.error("Auto-play failed:", e);
                    // Might be muted policy
                });
            }
        } else {
            document.body.style.overflow = 'unset';
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleVideoEnd = () => {
        setIsVideoEnded(true);
    };

    const handleActionClick = () => {
        onClose();
        navigate(targetRoute);
    };

    // Note: User requested 9:16 vertical video fullscreen with blurred background
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-50 p-3 bg-white/10 hover:bg-gold hover:text-black rounded-full transition-colors backdrop-blur-md"
            >
                <X size={24} />
            </button>

            {/* Video Container (Vertical 9:16 aspect ratio roughly limit to screen height) */}
            <div className="relative w-full h-full md:w-auto md:h-[90vh] md:aspect-[9/16] bg-black shadow-2xl overflow-hidden rounded-none md:rounded-[2rem] border-0 md:border md:border-white/10 flex items-center justify-center">

                {isLoading && !hasError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a2332] z-10">
                        <Loader2 className="animate-spin text-gold mb-4" size={40} />
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Khởi tạo Demo...</p>
                    </div>
                )}

                {hasError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1a2332] p-8 text-center z-10">
                        <PlayCircle className="text-slate-500 mb-4" size={48} strokeWidth={1.5} />
                        <p className="text-sm font-bold text-white mb-2">Video Demo đang được cập nhật</p>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black mb-8">Vui lòng thử tính năng trực tiếp</p>

                        <button
                            onClick={handleActionClick}
                            className="px-6 py-3 bg-white/10 rounded-xl text-white font-black uppercase tracking-widest text-xs hover:bg-white/20 transition-all flex items-center gap-2"
                        >
                            <ArrowRight size={16} /> TRẢI NGHIỆM THỰC TẾ
                        </button>
                    </div>
                )}

                <video
                    ref={videoRef}
                    src={videoUrl}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    autoPlay
                    playsInline
                    muted={true}
                    onEnded={handleVideoEnd}
                    onPlay={() => setIsLoading(false)}
                    onTimeUpdate={(e) => {
                        const video = e.target as HTMLVideoElement;
                        // Limit dummy sintel video to 5 seconds for testing purposes
                        if (videoUrl.includes('sintel') && video.currentTime >= 5 && !isVideoEnded) {
                            video.pause();
                            handleVideoEnd();
                        }
                    }}
                    onError={() => {
                        setIsLoading(false);
                        setHasError(true);
                    }}
                    controls={false}
                />

                {/* End Card Overlay */}
                {isVideoEnded && !hasError && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500 backdrop-blur-sm z-20">
                        <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mb-6 animate-pulse border-2 border-gold/40">
                            <PlayCircle className="text-gold" size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">
                            {title}
                        </h3>
                        <p className="text-slate-300 text-xs font-medium max-w-[250px] mx-auto mb-10 leading-relaxed">
                            Trải nghiệm sức mạnh thực sự của Trí Tuệ Nhân Tạo dành riêng cho Bất Động Sản.
                        </p>

                        <button
                            onClick={handleActionClick}
                            className="w-full py-5 bg-gradient-to-r from-gold to-[#aa771c] rounded-2xl text-black font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_40px_rgba(191,149,63,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            TÔI MUỐN THỬ NGAY <ArrowRight size={20} strokeWidth={3} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
