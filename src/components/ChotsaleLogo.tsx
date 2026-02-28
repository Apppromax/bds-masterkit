import React from 'react';

const ChotsaleLogo = ({ size = 24, className = "" }: { size?: number | string, className?: string }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {/* Ánh xạ dựa trên logo Chotsale */}
            {/* Mái trái */}
            <path d="M 20 50 L 50 25 L 65 35" />
            {/* Sợi uốn lượn thành mũi tên (Loops to arrow) */}
            <path d="M 35 50 C 10 75, 45 100, 60 70 L 85 20" />
            {/* Đầu mũi tên */}
            <polyline points="65 20 85 20 85 40" />
            {/* Tường và sàn nhà phải */}
            <polyline points="45 80 75 80 75 45" />
            {/* Hình tam giác nhỏ bên ngoài (nét đặc trưng) */}
            <path d="M 83 48 L 93 58 L 83 58 Z" fill="currentColor" stroke="none" />
        </svg>
    );
};

export default ChotsaleLogo;
