import React, { useState, useEffect, useCallback } from 'react';
import { Compass, AlertTriangle, ShieldCheck } from 'lucide-react';

interface CompassProps {
    userKua?: string; // e.g. "Khảm", "Càn", ...
    userGroup?: string; // "Đông Tứ Trạch" | "Tây Tứ Trạch"
}

export default function CompassLuopan({ userKua, userGroup }: CompassProps) {
    const [heading, setHeading] = useState<number | null>(null);
    const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Direction labels based on heading
    const getDirectionLabel = (deg: number) => {
        const val = Math.floor((deg / 22.5) + 0.5);
        const arr = ["Bắc", "Đông Bắc", "Đông Bắc", "Đông", "Đông", "Đông Nam", "Đông Nam", "Nam", "Nam", "Tây Nam", "Tây Nam", "Tây", "Tây", "Tây Bắc", "Tây Bắc", "Bắc"];
        const battrachArr = ["Khảm", "Cấn", "Cấn", "Chấn", "Chấn", "Tốn", "Tốn", "Ly", "Ly", "Khôn", "Khôn", "Đoài", "Đoài", "Càn", "Càn", "Khảm"];
        return {
            dir: arr[(val % 16)],
            cung: battrachArr[(val % 16)]
        };
    };

    const lastHeadingRef = React.useRef<number | null>(null);

    const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
        let h: number | null = null;
        // iOS
        if ((event as any).webkitCompassHeading !== undefined) {
            h = (event as any).webkitCompassHeading;
        } else if (event.alpha !== null) {
            // Android
            // On some Android devices, alpha is absolute, on others relative.
            // deviceorientationabsolute event is preferred for absolute heading.
            h = 360 - event.alpha;
        }

        if (h !== null) {
            // Smoothing logic (Exponential Moving Average)
            // This reduces jitter while maintaining responsiveness
            if (lastHeadingRef.current === null) {
                lastHeadingRef.current = h;
                setHeading(h);
            } else {
                // Handle the 0/360 wrap-around for smoothing
                let diff = h - lastHeadingRef.current;
                if (diff > 180) diff -= 360;
                if (diff < -180) diff += 360;

                // Adjust lerp factor (0.1 to 0.2 is usually good)
                // Lower = smoother but slower, Higher = more responsive but more jitter
                const lerpFactor = 0.15;
                const nextHeading = lastHeadingRef.current + diff * lerpFactor;

                // Keep heading within 0-360 range
                const normalizedHeading = (nextHeading + 360) % 360;

                lastHeadingRef.current = normalizedHeading;
                setHeading(normalizedHeading);
            }
        }
    }, []);

    const activateCompass = () => {
        setPermissionGranted(true);
        setError(null);
        lastHeadingRef.current = null; // Reset smoothing

        // Some Chrome Android devices require absolute, others relative
        if (typeof (window as any).ondeviceorientationabsolute !== 'undefined') {
            window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        } else {
            window.addEventListener('deviceorientation', handleOrientation, true);
        }

        // Check hardware support after 3 seconds
        setTimeout(() => {
            setHeading((current) => {
                if (current === null) {
                    setError('Trình duyệt hoặc thiết bị của bạn không có phần cứng cảm biến La Bàn.');
                    setPermissionGranted(false);
                }
                return current;
            });
        }, 3000);
    };

    const requestPermission = async () => {
        if (typeof window.DeviceOrientationEvent !== 'undefined' && typeof (window.DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const permissionState = await (window.DeviceOrientationEvent as any).requestPermission();
                if (permissionState === 'granted') {
                    activateCompass();
                } else {
                    setError('Từ chối quyền truy cập la bàn.');
                    setPermissionGranted(false);
                }
            } catch (err: any) {
                setError(err.message);
                setPermissionGranted(false);
            }
        } else {
            // Android or normal desktop
            activateCompass();
        }
    };

    useEffect(() => {
        // Cleanup if component unmounts
        return () => {
            window.removeEventListener('deviceorientation', handleOrientation, true);
            window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
        };
    }, [handleOrientation]);

    const isGoodDirection = (cung: string) => {
        if (!userGroup) return null;
        const dongCung = ["Khảm", "Chấn", "Tốn", "Ly"];
        const tayCung = ["Càn", "Khôn", "Cấn", "Đoài"];

        if (userGroup === "Đông Tứ Trạch") {
            return dongCung.includes(cung);
        } else {
            return tayCung.includes(cung);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-[#0c0c0c] border border-gold/20 rounded-[2.5rem] shadow-2xl relative overflow-hidden h-full min-h-[450px]">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent"></div>

            {heading === null && permissionGranted !== true ? (
                <div className="text-center relative z-10 flex flex-col items-center max-w-xs mx-auto">
                    <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center border border-gold/30 mb-5 shadow-[0_0_30px_rgba(191,149,63,0.2)]">
                        <Compass className="text-gold" size={40} />
                    </div>
                    <h3 className="font-black text-white text-lg uppercase tracking-tight mb-2">La Bàn Phong Thủy</h3>
                    <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">Đo độ hiển thị hướng nhà và cung tài lộc. Cần cấp quyền truy cập cảm biến để hoạt động.</p>

                    {error ? (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2">
                            <AlertTriangle size={14} /> {error}
                        </div>
                    ) : (
                        <button
                            onClick={requestPermission}
                            className="w-full py-4 bg-gradient-to-r from-gold to-[#aa771c] text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
                        >
                            Kích hoạt La Bàn
                        </button>
                    )}
                </div>
            ) : (
                <div className="relative z-10 w-full flex flex-col items-center">
                    {/* Compass Ring UI */}
                    <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-[8px] border-white/5 shadow-inner"></div>
                        <div className="absolute inset-2 rounded-full border-2 border-gold/30 border-dashed animate-[spin_60s_linear_infinite]"></div>

                        {/* The Luopan Graphics rotating inverse to heading */}
                        <div
                            className="absolute inset-4 rounded-full border-4 border-[#bf953f] bg-[#1a1a1a] flex items-center justify-center shadow-[0_0_50px_rgba(191,149,63,0.3)]"
                            style={{ transform: `rotate(${- (heading || 0)}deg)`, transition: 'transform 0.05s linear' }}
                        >

                            {/* N / S / E / W Marks */}
                            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-gold font-black text-xl">B</div>
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/50 font-black text-sm">N</div>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 font-black text-sm">Đ</div>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 font-black text-sm">T</div>

                            {/* Inner rings (simulating Luopan) */}
                            <div className="absolute w-[80%] h-[80%] rounded-full border border-gold/20"></div>
                            <div className="absolute w-[60%] h-[60%] rounded-full border border-gold/20 bg-gold/5 backdrop-blur-sm"></div>
                        </div>

                        {/* Static Center Pointer */}
                        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-4 h-8 bg-red-600 shadow-xl" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)', zIndex: 20 }}></div>
                        <div className="w-6 h-6 bg-red-600 rounded-full shadow-[0_0_15px_rgba(255,0,0,0.5)] z-20 border-2 border-white/20"></div>

                        {/* Crosshairs */}
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-30">
                            <div className="w-[1px] h-full bg-red-500"></div>
                            <div className="w-full h-[1px] bg-red-500 absolute"></div>
                        </div>
                    </div>

                    {/* Info Card */}
                    {heading !== null && (
                        <div className="mt-8 bg-[#1a1a1a] border border-white/5 rounded-3xl p-6 w-full max-w-sm text-center shadow-xl">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Tọa độ vi tinh</p>
                            <h2 className="text-4xl font-black text-white italic tracking-tighter mb-4">
                                {Math.round(heading)}<span className="text-gold text-2xl">°</span>
                            </h2>

                            {userGroup && (
                                <>
                                    <div className="h-px w-1/2 mx-auto bg-gradient-to-r from-transparent via-gold/30 to-transparent my-4"></div>
                                    <div className="flex flex-col items-center">
                                        <p className="text-xs text-white/60 uppercase tracking-widest mb-2">Hướng nhà</p>
                                        <p className="text-2xl font-black text-gold uppercase">{getDirectionLabel(heading).dir}</p>
                                        <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/50 border border-white/10">
                                            {isGoodDirection(getDirectionLabel(heading).cung) ? (
                                                <><ShieldCheck size={14} className="text-green-500" /> <span className="text-[10px] font-black text-green-500 uppercase">Hợp Tuổi Đại Cát</span></>
                                            ) : (
                                                <><AlertTriangle size={14} className="text-red-500" /> <span className="text-[10px] font-black text-red-500 uppercase">Hướng Không Hợp</span></>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
