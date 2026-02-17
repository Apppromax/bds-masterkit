export type Gender = 'male' | 'female';
export type Direction = 'Bắc' | 'Đông Bắc' | 'Đông' | 'Đông Nam' | 'Nam' | 'Tây Nam' | 'Tây' | 'Tây Bắc';
export type BatTrachGroup = 'Đông Tứ Trạch' | 'Tây Tứ Trạch';

export interface FengShuiResult {
    cung: string;
    menh: string;
    nhom: BatTrachGroup;
    tot: { dir: string; ynghia: string }[];
    xau: { dir: string; ynghia: string }[];
}

export interface AgeCheckResult {
    age: number;
    tamTai: boolean;
    kimLau: boolean;
    hoangOc: boolean;
    conclusion: string; // "Tốt" | "Xấu"
    details: string[];
}

// --- BÁT TRẠCH ---
export const calculateFengShui = (year: number, gender: Gender): FengShuiResult => {
    // Simplified algorithm suitable for 1900-2099
    let sum = 0;
    const yearStr = year.toString();
    sum = parseInt(yearStr[2]) + parseInt(yearStr[3]);
    while (sum > 9) sum = Math.floor(sum / 10) + (sum % 10);

    let quaiNumber = gender === 'male' ? 10 - sum : 5 + sum;
    while (quaiNumber > 9) quaiNumber = Math.floor(quaiNumber / 10) + (quaiNumber % 10);

    // Trung Cung (5) -> Nam: Khôn (2), Nữ: Cấn (8)
    if (quaiNumber === 5) quaiNumber = gender === 'male' ? 2 : 8;

    const cungMap: Record<number, { name: string, menh: string, group: BatTrachGroup }> = {
        1: { name: 'Khảm', menh: 'Thủy', group: 'Đông Tứ Trạch' },
        2: { name: 'Khôn', menh: 'Thổ', group: 'Tây Tứ Trạch' },
        3: { name: 'Chấn', menh: 'Mộc', group: 'Đông Tứ Trạch' },
        4: { name: 'Tốn', menh: 'Mộc', group: 'Đông Tứ Trạch' },
        6: { name: 'Càn', menh: 'Kim', group: 'Tây Tứ Trạch' },
        7: { name: 'Đoài', menh: 'Kim', group: 'Tây Tứ Trạch' },
        8: { name: 'Cấn', menh: 'Thổ', group: 'Tây Tứ Trạch' },
        9: { name: 'Ly', menh: 'Hỏa', group: 'Đông Tứ Trạch' }
    };

    const info = cungMap[quaiNumber];
    if (!info) return { cung: 'Unknown', menh: '', nhom: 'Đông Tứ Trạch', tot: [], xau: [] };

    // Directions for East Group (1, 3, 4, 9)
    const dongTot = [
        { dir: 'Bắc', ynghia: info.name === 'Khảm' ? 'Phục Vị' : 'Sinh Khí/Thiên Y' },
        { dir: 'Đông', ynghia: 'Phục Vị/Sinh Khí' },
        { dir: 'Đông Nam', ynghia: 'Diên Niên/Thiên Y' },
        { dir: 'Nam', ynghia: 'Thiên Y/Diên Niên' }
    ];
    // Directions for West Group (2, 6, 7, 8)
    const tayTot = [
        { dir: 'Đông Bắc', ynghia: 'Sinh Khí/Phục Vị' },
        { dir: 'Tây Bắc', ynghia: 'Phục Vị/Sinh Khí' },
        { dir: 'Tây', ynghia: 'Diên Niên/Thiên Y' },
        { dir: 'Tây Nam', ynghia: 'Thiên Y/Diên Niên' }
    ];

    const tot = info.group === 'Đông Tứ Trạch' ? dongTot : tayTot;

    // Auto-generate bad directions (simplification)
    const allDirs = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'];
    const goodDirs = tot.map(t => t.dir);
    const xau = allDirs.filter(d => !goodDirs.includes(d)).map(d => ({ dir: d, ynghia: 'Họa Hại / Tuyệt Mệnh / Ngũ Quỷ / Lục Sát' }));

    return {
        cung: `${info.name} (${info.menh})`,
        menh: info.menh,
        nhom: info.group,
        tot,
        xau
    };
};

// --- XEM TUỔI LÀM NHÀ ---
export const checkAgeBuilding = (yearBorn: number, currentYear: number): AgeCheckResult => {
    const age = currentYear - yearBorn + 1; // Tuổi mụ
    const details: string[] = [];

    // 1. Kim Lâu
    // Lấy tuổi mụ chia 9, dư 1, 3, 6, 8 là phạm Kim Lâu
    const kimLauMod = age % 9;
    const isKimLau = [1, 3, 6, 8].includes(kimLauMod);
    if (isKimLau) {
        let type = '';
        if (kimLauMod === 1) type = 'Thân (Hại bản thân)';
        if (kimLauMod === 3) type = 'Thê (Hại vợ)';
        if (kimLauMod === 6) type = 'Tử (Hại con)';
        if (kimLauMod === 8) type = 'Súc (Hại vật nuôi/kinh tế)';
        details.push(`Phạm Kim Lâu ${type}`);
    }

    // 2. Hoang Ốc
    // 10: Nhất Cát, 20: Nhì Nghi, 30: Tam Địa Sát, 40: Tứ Tấn Tài, 50: Ngũ Thọ Tử, 60: Lục Hoang Ốc
    // Logic đơn giản:
    // Các tuổi phạm Hoang Ốc: 12, 14, 15, 18, 21, 23, 24, 27, 29, 30, 32, 33, 36, 38, 39, 41, 42, 45, 47, 48, 50, 51, 54, 56, 57, 60, 63, 65, 66, 69, 72, 74, 75
    // Cách tính nhanh:
    const hoangOcBad = [3, 5, 6]; // Địa Sát, Thọ Tử, Hoang Ốc
    // Tính cung Hoang Ốc: ...phức tạp, dùng lookup table cho nhanh và chuẩn
    // 1: Cát, 2: Nghi, 3: Địa Sát, 4: Tấn Tài, 5: Thọ Tử, 6: Hoang Ốc
    const startAge = 10;
    // ... Simplified logic usually done by lookup or iterating
    const hoangOcMap: Record<number, number> = {
        10: 1, 11: 2, 12: 3, 13: 4, 14: 5, 15: 6,
        20: 2, 21: 3, 22: 4, 23: 5, 24: 6, 25: 1,
        30: 3, 31: 4, 32: 5, 33: 6, 34: 1, 35: 2,
        40: 4, 41: 5, 42: 6, 43: 1, 44: 2, 45: 3,
        50: 5, 51: 6, 52: 1, 53: 2, 54: 3, 55: 4,
        60: 6, 61: 1, 62: 2, 63: 3, 64: 4, 65: 5
        // Logic is actually: 
        // Tens digit starts at index (1->1, 2->2, 3->3, 4->4, 5->5, 6->6)
        // Then increment for units digit
    };

    // Implement standard algorithm
    let hoangOcNode = 1;
    const tens = Math.floor(age / 10);
    const units = age % 10;

    if (tens === 1) hoangOcNode = 1;
    else if (tens === 2) hoangOcNode = 2;
    else if (tens === 3) hoangOcNode = 3;
    else if (tens === 4) hoangOcNode = 4;
    else if (tens === 5) hoangOcNode = 5;
    else if (tens >= 6) hoangOcNode = 6;

    // Increment for units
    for (let i = 0; i < units; i++) {
        hoangOcNode++;
        if (hoangOcNode > 6) hoangOcNode = 1;
    }

    const isHoangOc = [3, 5, 6].includes(hoangOcNode);
    if (isHoangOc) {
        let name = '';
        if (hoangOcNode === 3) name = 'Tam Địa Sát (Gây bệnh tật)';
        if (hoangOcNode === 5) name = 'Ngũ Thọ Tử (Ly biệt)';
        if (hoangOcNode === 6) name = 'Lục Hoang Ốc (Khó thành đạt)';
        details.push(`Phạm Hoang Ốc: ${name}`);
    }

    // 3. Tam Tai
    // Thân - Tý - Thìn phạm Dần - Mão - Thìn
    // Dần - Ngọ - Tuất phạm Thân - Dậu - Tuất
    // Tỵ - Dậu - Sửu phạm Hợi - Tý - Sửu
    // Hợi - Mão - Mùi phạm Tỵ - Ngọ - Mùi
    const conGiap = (yearBorn - 4) % 12; // 0: Tý, 1: Sửu... 
    // Wait, (year - 4) % 12 logic: 1984 (Giáp Tý) -> (1984-4)%12 = 0. Correct.
    // 0: Tý, 1: Sửu, 2: Dần, 3: Mão, 4: Thìn, 5: Tỵ, 6: Ngọ, 7: Mùi, 8: Thân, 9: Dậu, 10: Tuất, 11: Hợi

    const currentConGiap = (currentYear - 4) % 12;

    let isTamTai = false;
    const group1 = [8, 0, 4]; // Thân Tý Thìn
    const tamtai1 = [2, 3, 4]; // Dần Mão Thìn

    const group2 = [2, 6, 10]; // Dần Ngọ Tuất
    const tamtai2 = [8, 9, 10]; // Thân Dậu Tuất

    const group3 = [5, 9, 1]; // Tỵ Dậu Sửu
    const tamtai3 = [11, 0, 1]; // Hợi Tý Sửu

    const group4 = [11, 3, 7]; // Hợi Mão Mùi
    const tamtai4 = [5, 6, 7]; // Tỵ Ngọ Mùi

    if (group1.includes(conGiap) && tamtai1.includes(currentConGiap)) isTamTai = true;
    if (group2.includes(conGiap) && tamtai2.includes(currentConGiap)) isTamTai = true;
    if (group3.includes(conGiap) && tamtai3.includes(currentConGiap)) isTamTai = true;
    if (group4.includes(conGiap) && tamtai4.includes(currentConGiap)) isTamTai = true;

    if (isTamTai) details.push('Phạm Tam Tai');

    return {
        age,
        tamTai: isTamTai,
        kimLau: isKimLau,
        hoangOc: isHoangOc,
        conclusion: (!isTamTai && !isKimLau && !isHoangOc) ? 'Tốt' : 'Xấu',
        details
    };
};

// --- THƯỚC LỖ BAN (52.2cm) ---
// Simplified check
export const checkLuBan = (cm: number): { status: 'Tốt' | 'Xấu', cung: string, yNghia: string } => {
    // Chu kỳ 52.2cm
    // 8 Cung: Quý Nhân, Hiểm Họa, Thiên Tai, Thiên Tài, Nhân Lộc, Cô Độc, Thiên Tắc, Tể Tướng
    // Mỗi cung 6.525cm
    // Tốt: Quý Nhân (1), Thiên Tài (4), Nhân Lộc (5), Tể Tướng (8)
    // Xấu: Hiểm Họa (2), Thiên Tai (3), Cô Độc (6), Thiên Tắc (7)

    // Convert to index 0-7
    const cycle = 52.2;
    const pos = cm % cycle;
    const section = Math.floor(pos / (cycle / 8));

    // 0: Quý Nhân (Tốt), 1: Hiểm Họa (Xấu), 2: Thiên Tai (Xấu), 3: Thiên Tài (Tốt)
    // 4: Nhân Lộc (Tốt), 5: Cô Độc (Xấu), 6: Thiên Tắc (Xấu), 7: Tể Tướng (Tốt)

    const map = [
        { name: 'Quý Nhân', status: 'Tốt', desc: 'Gặp quý nhân, may mắn, làm ăn phát đạt' },
        { name: 'Hiểm Họa', status: 'Xấu', desc: 'Dễ gặp tai nạn, trôi dạt, con cháu hư hỏng' },
        { name: 'Thiên Tai', status: 'Xấu', desc: 'Bệnh tật, ốm đau, mất của' },
        { name: 'Thiên Tài', status: 'Tốt', desc: 'Tài lộc, may mắn, con cái hiếu thảo' },
        { name: 'Nhân Lộc', status: 'Tốt', desc: 'Phú quý, con cái thành đạt' },
        { name: 'Cô Độc', status: 'Xấu', desc: 'Hao người, hao của, ly biệt' },
        { name: 'Thiên Tắc', status: 'Xấu', desc: 'Tai họa, tù tội, kém may mắn' },
        { name: 'Tể Tướng', status: 'Tốt', desc: 'Hanh thông, con cái tấn tài, may mắn' },
    ];

    // @ts-ignore
    const res = map[section] || map[0];
    return { status: res.status as any, cung: res.name, yNghia: res.desc };
};

// --- MÀU SẮC ---
export const getColors = (menh: string) => {
    const data: Record<string, { hop: string, ky: string }> = {
        'Kim': { hop: 'Trắng, Xám, Ghi, Vàng, Nâu đất', ky: 'Đỏ, Hồng, Tím' },
        'Mộc': { hop: 'Xanh lục, Đen, Xanh dương', ky: 'Trắng, Xám, Ghi' },
        'Thủy': { hop: 'Đen, Xanh dương, Trắng, Xám', ky: 'Vàng, Nâu đất' },
        'Hỏa': { hop: 'Đỏ, Hồng, Tím, Xanh lục', ky: 'Đen, Xanh dương' },
        'Thổ': { hop: 'Vàng, Nâu đất, Đỏ, Hồng, Tím', ky: 'Xanh lục' }
    };
    return data[menh] || { hop: '', ky: '' };
};
