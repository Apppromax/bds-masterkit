export type Gender = 'male' | 'female';
export type Direction = 'Bắc' | 'Đông Bắc' | 'Đông' | 'Đông Nam' | 'Nam' | 'Tây Nam' | 'Tây' | 'Tây Bắc';
export type BatTrachGroup = 'Đông Tứ Trạch' | 'Tây Tứ Trạch';

interface FengShuiResult {
    cung: string;
    menh: string;
    nhom: BatTrachGroup;
    tot: { dir: Direction; ynghia: string }[];
    xau: { dir: Direction; ynghia: string }[];
}

const BAT_QUAI = [
    'Khảm', 'Khôn', 'Chấn', 'Tốn', 'Trung Cung', 'Càn', 'Đoài', 'Cấn', 'Ly'
];

// Simplified mapping for demo purposes
// In reality, calculation is more complex involving lunar calendar
// Here we use solar year as approximation for simplicity
export const calculateFengShui = (year: number, gender: Gender): FengShuiResult => {
    let sum = 0;
    const yearStr = year.toString();
    // Sum last 2 digits
    sum = parseInt(yearStr[2]) + parseInt(yearStr[3]);
    // Reduce to single digit
    while (sum > 9) {
        sum = Math.floor(sum / 10) + (sum % 10);
    }

    let quaiNumber = 0;
    if (gender === 'male') {
        quaiNumber = 10 - sum;
    } else {
        quaiNumber = 5 + sum;
    }

    // Reduce again if > 9
    while (quaiNumber > 9) {
        quaiNumber = Math.floor(quaiNumber / 10) + (quaiNumber % 10);
    }

    // Special case: 5 (Trung Cung) -> Nam: Khôn (2), Nữ: Cấn (8)
    if (quaiNumber === 5) {
        quaiNumber = gender === 'male' ? 2 : 8;
    }

    // Mapping Quai Number to Name and Group
    // 1: Khảm (Đông), 2: Khôn (Tây), 3: Chấn (Đông), 4: Tốn (Đông)
    // 6: Càn (Tây), 7: Đoài (Tây), 8: Cấn (Tây), 9: Ly (Đông)

    const cungNames: Record<number, string> = {
        1: 'Khảm (Thủy)', 2: 'Khôn (Thổ)', 3: 'Chấn (Mộc)', 4: 'Tốn (Mộc)',
        6: 'Càn (Kim)', 7: 'Đoài (Kim)', 8: 'Cấn (Thổ)', 9: 'Ly (Hỏa)'
    };

    const isDongTuTrach = [1, 3, 4, 9].includes(quaiNumber);
    const nhom = isDongTuTrach ? 'Đông Tứ Trạch' : 'Tây Tứ Trạch';
    const cung = cungNames[quaiNumber] || 'Unknown';

    // Define directions
    // Dong Tu Trach: Bac, Dong, Dong Nam, Nam (Good)
    // Tay Tu Trach: Tay Bac, Dong Bac, Tay Nam, Tay (Good)

    let tot: { dir: Direction; ynghia: string }[] = [];
    let xau: { dir: Direction; ynghia: string }[] = [];

    if (isDongTuTrach) {
        tot = [
            { dir: 'Bắc', ynghia: 'Sinh Khí / Phục Vị' },
            { dir: 'Đông', ynghia: 'Phục Vị / Sinh Khí' },
            { dir: 'Đông Nam', ynghia: 'Diên Niên / Thiên Y' },
            { dir: 'Nam', ynghia: 'Thiên Y / Diên Niên' }
        ];
        xau = [
            { dir: 'Tây Bắc', ynghia: 'Tuyệt Mệnh' },
            { dir: 'Đông Bắc', ynghia: 'Ngũ Quỷ' },
            { dir: 'Tây Nam', ynghia: 'Lục Sát' },
            { dir: 'Tây', ynghia: 'Họa Hại' }
        ];
    } else {
        tot = [
            { dir: 'Đông Bắc', ynghia: 'Sinh Khí / Phục Vị' },
            { dir: 'Tây Bắc', ynghia: 'Phục Vị / Sinh Khí' },
            { dir: 'Tây', ynghia: 'Diên Niên / Thiên Y' },
            { dir: 'Tây Nam', ynghia: 'Thiên Y / Diên Niên' }
        ];
        xau = [
            { dir: 'Bắc', ynghia: 'Tuyệt Mệnh' },
            { dir: 'Đông', ynghia: 'Ngũ Quỷ' },
            { dir: 'Đông Nam', ynghia: 'Lục Sát' },
            { dir: 'Nam', ynghia: 'Họa Hại' }
        ];
    }

    // Simplified Metal calculation (Ngu Hanh)
    // Can/Doai: Kim; Chan/Ton: Moc; Kham: Thuy; Ly: Hoa; Khon/Can: Tho
    // ... this needs elaborate mapping, simplfying for now

    return {
        cung,
        menh: cung.split('(')[1]?.replace(')', '') || '',
        nhom,
        tot,
        xau
    };
};
