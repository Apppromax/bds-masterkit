import React, { useState } from 'react';
import { Stamp, Sparkles, Wand2, ArrowRight, UserSquare2 } from 'lucide-react';
import QuickEditor from '../components/ImageStudio/QuickEditor';
import AiStudio from '../components/ImageStudio/AiStudio';
import CardCreator from '../components/ImageStudio/CardCreator';

const StickerIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
        <path d="M15 3v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h8" />
        <path d="M8 9h2" />
    </svg>
);

export default function ImageStudio() {
    const [mode, setMode] = useState<'home' | 'quick' | 'card' | 'ai'>('home');

    if (mode === 'home') {
        return (
            <div className="h-full flex items-center justify-center p-6 bg-slate-50/50">
                <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Mode 1 */}
                    <button
                        onClick={() => setMode('quick')}
                        className="group relative bg-white p-8 rounded-[2rem] shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 border border-slate-100 transition-all duration-300 hover:-translate-y-2 text-left overflow-hidden flex flex-col"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Stamp size={120} className="text-blue-600 rotate-12" />
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform duration-300">
                                <StickerIcon size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">Đóng Dấu & Layout</h2>
                            <p className="text-slate-500 font-medium leading-relaxed flex-1">
                                Xử lý hàng loạt ảnh nhanh chóng. Chèn logo, số điện thoại, thông số kỹ thuật (Giá, Diện tích) chuyên nghiệp.
                            </p>
                            <div className="mt-8 flex items-center gap-2 text-sm font-bold text-blue-600 mt-auto pt-4">
                                BẮT ĐẦU NGAY <ArrowRight size={16} />
                            </div>
                        </div>
                    </button>

                    {/* Mode 2 */}
                    <button
                        onClick={() => setMode('card')}
                        className="group relative bg-white p-8 rounded-[2rem] shadow-xl shadow-yellow-900/5 hover:shadow-2xl hover:shadow-yellow-900/10 border border-slate-100 transition-all duration-300 hover:-translate-y-2 text-left overflow-hidden flex flex-col"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <UserSquare2 size={120} className="text-yellow-600 -rotate-12" />
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6 text-yellow-600 group-hover:scale-110 transition-transform duration-300">
                                <UserSquare2 size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 mb-2 group-hover:text-yellow-600 transition-colors">Digital Namecard</h2>
                            <p className="text-slate-500 font-medium leading-relaxed flex-1">
                                Tạo danh thiếp điện tử siêu tốc chuẩn 3.5x2 inches dành riêng cho Sales BĐS. Tích hợp QR Code Auto.
                            </p>
                            <div className="mt-8 flex items-center gap-2 text-sm font-bold text-yellow-600 mt-auto pt-4">
                                TẠO NAMECARD <ArrowRight size={16} />
                            </div>
                        </div>
                    </button>

                    {/* Mode 3 */}
                    <button
                        onClick={() => setMode('ai')}
                        className="group relative bg-slate-900 p-8 rounded-[2rem] shadow-xl shadow-purple-900/20 hover:shadow-2xl hover:shadow-purple-900/30 border border-slate-800 transition-all duration-300 hover:-translate-y-2 text-left overflow-hidden flex flex-col"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles size={120} className="text-purple-400 -rotate-12" />
                        </div>
                        <div className="relative z-10 flex-1 flex flex-col">
                            <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400 group-hover:scale-110 transition-transform duration-300">
                                <Wand2 size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-white mb-2 group-hover:text-purple-400 transition-colors">Sáng Tạo Phối Cảnh AI</h2>
                            <p className="text-slate-400 font-medium leading-relaxed flex-1">
                                Biến ảnh chụp thô thành tuyệt phẩm "ăn khách". Nâng cấp ánh sáng, thêm nội thất hoặc vẽ phối cảnh mới từ Zero.
                            </p>
                            <div className="mt-8 flex items-center gap-2 text-sm font-bold text-purple-400 mt-auto pt-4">
                                KHÁM PHÁ AI MAGIC <ArrowRight size={16} />
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    if (mode === 'quick') return <QuickEditor onBack={() => setMode('home')} />;
    if (mode === 'card') return <CardCreator onBack={() => setMode('home')} />;
    if (mode === 'ai') return <AiStudio onBack={() => setMode('home')} />;

    return null;
}

