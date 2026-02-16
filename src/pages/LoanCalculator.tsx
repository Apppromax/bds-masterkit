import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { Calculator, Download, DollarSign, Calendar, Percent } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoanCalculator() {
    const { profile } = useAuth();
    const resultRef = useRef<HTMLDivElement>(null);

    const [amount, setAmount] = useState(2000000000); // 2 billion
    const [term, setTerm] = useState(20); // 20 years
    const [rate, setRate] = useState(8.5); // 8.5%

    const [schedule, setSchedule] = useState<{
        monthlyPayment: number;
        totalPayment: number;
        totalInterest: number;
    } | null>(null);

    // Format currency
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    const calculateLoan = () => {
        const principal = amount;
        const monthlyRate = rate / 100 / 12;
        const numberOfPayments = term * 12;

        // EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
        const monthlyPayment =
            (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
            (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        const totalPayment = monthlyPayment * numberOfPayments;
        const totalInterest = totalPayment - principal;

        setSchedule({
            monthlyPayment,
            totalPayment,
            totalInterest,
        });
    };

    // Run calculation initially and on change
    React.useEffect(() => {
        calculateLoan();
    }, [amount, term, rate]);

    const handleExport = async () => {
        if (resultRef.current) {
            try {
                const canvas = await html2canvas(resultRef.current, {
                    scale: 2, // High resolution
                    backgroundColor: '#ffffff',
                });

                const link = document.createElement('a');
                link.download = `Bang-tinh-lai-vay-${new Date().getTime()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                console.error('Error exporting image:', error);
                alert('Không thể xuất ảnh. Vui lòng thử lại.');
            }
        }
    };

    return (
        <div className="pb-20 md:pb-0">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                        <Calculator className="text-blue-600" /> Tính Lãi Vay
                    </h1>
                    <p className="text-slate-500 text-sm">Công cụ tư vấn tài chính cho khách hàng</p>
                </div>
                <button
                    onClick={handleExport}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium shadow-md shadow-blue-500/20 transition-all w-fit"
                >
                    <Download size={18} /> Xuất ảnh báo giá
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Controls */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass p-6 rounded-2xl shadow-sm">
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <DollarSign size={16} className="text-blue-600" /> Số tiền vay (VND)
                        </label>
                        <div className="text-2xl font-bold text-blue-600 mb-4">
                            {formatCurrency(amount)}
                        </div>
                        <input
                            type="range"
                            min="100000000"
                            max="10000000000"
                            step="10000000"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                            <span>100 Tr</span>
                            <span>10 Tỷ</span>
                        </div>
                    </div>

                    <div className="glass p-6 rounded-2xl shadow-sm">
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <Calendar size={16} className="text-green-600" /> Thời gian vay (Năm)
                        </label>
                        <div className="text-2xl font-bold text-green-600 mb-4">
                            {term} Năm
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="35"
                            step="1"
                            value={term}
                            onChange={(e) => setTerm(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                            <span>1 Năm</span>
                            <span>35 Năm</span>
                        </div>
                    </div>

                    <div className="glass p-6 rounded-2xl shadow-sm">
                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <Percent size={16} className="text-amber-500" /> Lãi suất (%/năm)
                        </label>
                        <div className="text-2xl font-bold text-amber-500 mb-4">
                            {rate}%
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            step="0.1"
                            value={rate}
                            onChange={(e) => setRate(Number(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-2">
                            <span>1%</span>
                            <span>20%</span>
                        </div>
                    </div>
                </div>

                {/* Result Card (This part will be exported as image) */}
                <div className="lg:col-span-2">
                    <div ref={resultRef} className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 relative overflow-hidden">
                        {/* Decoration for Export */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none"></div>

                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 border-b-2 border-blue-500 pb-1 inline-block">
                                    BẢNG TÍNH LÃI VAY MUA NHÀ
                                </h2>
                                <p className="text-slate-500 text-sm mt-2">Ước tính chi phí trả góp hàng tháng</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-slate-800">{profile?.full_name || 'Sale Consultant'}</p>
                                <p className="text-slate-500 text-sm">Chuyên viên tư vấn BĐS</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div className="space-y-4">
                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="text-slate-500">Số tiền vay</span>
                                    <span className="font-semibold">{formatCurrency(amount)}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="text-slate-500">Thời gian vay</span>
                                    <span className="font-semibold">{term} Năm</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                    <span className="text-slate-500">Lãi suất</span>
                                    <span className="font-semibold">{rate}%/năm</span>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-6 rounded-xl flex flex-col justify-center items-center text-center">
                                <p className="text-slate-600 font-medium mb-1">Số tiền trả hàng tháng:</p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {schedule ? formatCurrency(schedule.monthlyPayment) : '...'}
                                </p>
                                <p className="text-xs text-slate-400 mt-2">(Gốc + Lãi dự tính)</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4">
                            <h3 className="font-semibold text-slate-700 mb-3">Tổng quan khoản vay</h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Tổng Gốc</p>
                                    <p className="font-medium">{formatCurrency(amount)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Tổng Lãi</p>
                                    <p className="font-medium text-amber-600">
                                        {schedule ? formatCurrency(schedule.totalInterest) : '...'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Tổng Thanh Toán</p>
                                    <p className="font-medium text-blue-600">
                                        {schedule ? formatCurrency(schedule.totalPayment) : '...'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-center text-xs text-slate-400">
                            * Bảng tính chỉ mang tính chất tham khảo. Lãi suất thực tế phụ thuộc vào chính sách ngân hàng tại thời điểm vay.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
