import React from 'react';

export const COMPANY_LOGOS = [
    {
        id: 'vinhomes',
        name: 'Vinhomes',
        render: ({ className }: { className?: string }) => (
            <svg viewBox="0 0 300 100" className={className} xmlns="http://www.w3.org/2000/svg">
                <path d="M30 20 L55 80 L80 20 L65 20 L55 50 L45 20 Z" fill="#d4af37" />
                <text x="90" y="65" fontFamily="Arial, sans-serif" fontWeight="900" fill="#1d3f7f" fontSize="48" letterSpacing="-1">VINHOMES</text>
            </svg>
        )
    },
    {
        id: 'novaland',
        name: 'Novaland',
        render: ({ className }: { className?: string }) => (
            <svg viewBox="0 0 300 100" className={className} xmlns="http://www.w3.org/2000/svg">
                <rect x="20" y="25" width="40" height="40" fill="#00a651" rx="5" transform="rotate(25 40 45)" />
                <rect x="40" y="15" width="40" height="40" fill="#8bc53f" rx="5" transform="rotate(45 60 35)" />
                <rect x="35" y="45" width="40" height="40" fill="#007236" rx="5" transform="rotate(15 55 65)" />
                <text x="100" y="65" fontFamily="Arial, sans-serif" fontWeight="900" fill="#00a651" fontSize="46" letterSpacing="1">NOVALAND</text>
            </svg>
        )
    },
    {
        id: 'datxanh',
        name: 'Đất Xanh',
        render: ({ className }: { className?: string }) => (
            <svg viewBox="0 0 300 100" className={className} xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="30" fill="#0072bc" />
                <path d="M20 50 Q 50 10 80 50 Q 50 90 20 50" fill="#8cc63f" opacity="0.9" />
                <text x="95" y="65" fontFamily="Arial, sans-serif" fontWeight="900" fill="#0072bc" fontSize="44" letterSpacing="-1">DAT XANH GROUP</text>
            </svg>
        )
    },
    {
        id: 'masterise',
        name: 'Masterise Homes',
        render: ({ className }: { className?: string }) => (
            <svg viewBox="0 0 300 100" className={className} xmlns="http://www.w3.org/2000/svg">
                <text x="20" y="55" fontFamily="Georgia, serif" fontWeight="bold" fill="#d4af37" fontSize="32" letterSpacing="2">MASTERISE</text>
                <text x="25" y="80" fontFamily="Arial, sans-serif" fontWeight="bold" fill="#1a1a1a" fontSize="16" letterSpacing="8">HOMES</text>
            </svg>
        )
    },
    {
        id: 'sungroup',
        name: 'Sun Group',
        render: ({ className }: { className?: string }) => (
            <svg viewBox="0 0 300 100" className={className} xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="25" fill="#e3000f" />
                <path d="M50 10 L50 20 M50 80 L50 90 M10 50 L20 50 M80 50 L90 50 M22 22 L29 29 M78 78 L71 71 M22 78 L29 71 M78 22 L71 29" stroke="#e3000f" strokeWidth="6" strokeLinecap="round" />
                <text x="110" y="65" fontFamily="Arial, sans-serif" fontWeight="900" fill="#e3000f" fontSize="48" letterSpacing="-1">SUN GROUP</text>
            </svg>
        )
    },
    {
        id: 'vingroup',
        name: 'Vingroup',
        render: ({ className }: { className?: string }) => (
            <svg viewBox="0 0 300 100" className={className} xmlns="http://www.w3.org/2000/svg">
                <path d="M50 20 L20 40 L30 70 L50 90 L70 70 L80 40 Z" fill="#e3000f" />
                <path d="M50 20 L20 40 L50 50 Z" fill="#d4af37" />
                <text x="100" y="65" fontFamily="Arial, sans-serif" fontWeight="900" fill="#e3000f" fontSize="48" letterSpacing="-1">VINGROUP</text>
            </svg>
        )
    },
    {
        id: 'cenland',
        name: 'Cen Land',
        render: ({ className }: { className?: string }) => (
            <svg viewBox="0 0 300 100" className={className} xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="30" fill="#e3000f" />
                <text x="32" y="60" fontFamily="Arial, sans-serif" fontWeight="900" fill="white" fontSize="26">cen</text>
                <text x="95" y="65" fontFamily="Arial, sans-serif" fontWeight="900" fill="#e3000f" fontSize="46" letterSpacing="-1">CEN LAND</text>
            </svg>
        )
    },
    {
        id: 'namlong',
        name: 'Nam Long',
        render: ({ className }: { className?: string }) => (
            <svg viewBox="0 0 300 100" className={className} xmlns="http://www.w3.org/2000/svg">
                <path d="M50 20 L80 70 L20 70 Z" fill="#e3000f" />
                <path d="M50 35 L68 65 L32 65 Z" fill="white" />
                <text x="100" y="65" fontFamily="Arial, sans-serif" fontWeight="900" fill="#e3000f" fontSize="48" letterSpacing="-1">NAM LONG</text>
            </svg>
        )
    },
    {
        id: 'khangdien',
        name: 'Khang Điền',
        render: ({ className }: { className?: string }) => (
            <svg viewBox="0 0 300 100" className={className} xmlns="http://www.w3.org/2000/svg">
                <path d="M20 70 L50 30 L80 70 L65 70 L65 80 L35 80 L35 70 Z" fill="#e3000f" />
                <text x="95" y="65" fontFamily="Arial, sans-serif" fontWeight="900" fill="#e3000f" fontSize="42" letterSpacing="-1">KHANG DIEN</text>
            </svg>
        )
    },
    {
        id: 'ecopark',
        name: 'Ecopark',
        render: ({ className }: { className?: string }) => (
            <svg viewBox="0 0 300 100" className={className} xmlns="http://www.w3.org/2000/svg">
                <path d="M50 80 Q 80 80 80 40 Q 50 10 20 40 Q 20 80 50 80" fill="#78b943" />
                <path d="M50 80 Q 20 80 20 40 Q 50 20 80 40 Q 80 80 50 80" fill="#007836" opacity="0.6" />
                <text x="100" y="65" fontFamily="Arial, sans-serif" fontWeight="900" fill="#007836" fontSize="48" letterSpacing="-1">ECOPARK</text>
            </svg>
        )
    }
];
