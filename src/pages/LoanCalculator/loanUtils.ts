export const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
        maximumFractionDigits: 0
    }).format(Math.round(val)) + ' đ';
};

export const formatNumber = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(val));
};

export const parseFormattedNumber = (val: string) => {
    return Number(val.replace(/\./g, '').replace(/,/g, '')) || 0;
};

export const formatNumberToVietnamese = (num: number): string => {
    if (num === 0) return '0 VNĐ';
    if (num >= 1000000000) {
        const billions = num / 1000000000;
        return billions.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' Tỷ';
    }
    if (num >= 1000000) {
        const millions = num / 1000000;
        return millions.toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' Triệu';
    }
    return new Intl.NumberFormat('vi-VN').format(num) + ' VNĐ';
};

export const BANK_LIST = [
    { name: 'Vietcombank', code: 'VCB', logo: 'https://api.vietqr.io/img/VCB.png', color: '#006633' },
    { name: 'Techcombank', code: 'TCB', logo: 'https://api.vietqr.io/img/TCB.png', color: '#E31837' },
    { name: 'BIDV', code: 'BIDV', logo: 'https://api.vietqr.io/img/BIDV.png', color: '#213A99' },
    { name: 'VietinBank', code: 'CTG', logo: 'https://api.vietqr.io/img/ICB.png', color: '#00AEEF' },
    { name: 'MB Bank', code: 'MB', logo: 'https://api.vietqr.io/img/MB.png', color: '#0033FF' },
    { name: 'Agribank', code: 'VBA', logo: 'https://api.vietqr.io/img/VBA.png', color: '#993333' },
    { name: 'VPBank', code: 'VPB', logo: 'https://api.vietqr.io/img/VPB.png', color: '#009966' },
    { name: 'TPBank', code: 'TPB', logo: 'https://api.vietqr.io/img/TPB.png', color: '#55288B' },
    { name: 'ACB', code: 'ACB', logo: 'https://api.vietqr.io/img/ACB.png', color: '#0070B8' },
    { name: 'Sacombank', code: 'STB', logo: 'https://api.vietqr.io/img/STB.png', color: '#1B365D' },
    { name: 'VIB', code: 'VIB', logo: 'https://api.vietqr.io/img/VIB.png', color: '#005DAB' },
    { name: 'HDBank', code: 'HDB', logo: 'https://api.vietqr.io/img/HDB.png', color: '#ED1C24' },
];
