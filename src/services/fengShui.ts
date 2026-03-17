export type Gender = 'male' | 'female';
export type Direction = 'Bắc' | 'Đông Bắc' | 'Đông' | 'Đông Nam' | 'Nam' | 'Tây Nam' | 'Tây' | 'Tây Bắc';
export type BatTrachGroup = 'Đông Tứ Trạch' | 'Tây Tứ Trạch';
export type Menh = 'Kim' | 'Mộc' | 'Thủy' | 'Hỏa' | 'Thổ';
export type GoodStar = 'Sinh Khí' | 'Thiên Y' | 'Diên Niên' | 'Phục Vị';
export type BadStar = 'Họa Hại' | 'Lục Sát' | 'Ngũ Quỷ' | 'Tuyệt Mệnh';
export type Star = GoodStar | BadStar;

export interface DirectionDetail {
    dir: Direction;
    star: Star;
    isGood: boolean;
    description: string;
    usage: string;
}

export interface FengShuiResult {
    quaiNumber: number;
    cung: string;
    menh: Menh;
    nhom: BatTrachGroup;
    napAm: NapAmResult;
    directions: DirectionDetail[];
    tot: DirectionDetail[];
    xau: DirectionDetail[];
}

export interface NapAmResult {
    canChi: string;
    napAm: string;
    menh: Menh;
    conGiap: string;
    conGiapEmoji: string;
}

export interface AgeCheckResult {
    age: number;
    tamTai: boolean;
    kimLau: boolean;
    hoangOc: boolean;
    conclusion: string;
    details: string[];
    yearAdvice: string;
}

export interface CoupleResult {
    person1: FengShuiResult;
    person2: FengShuiResult;
    compatibility: 'Đại Cát' | 'Tốt' | 'Trung Bình' | 'Cần Hóa Giải';
    score: number;
    sameGroup: boolean;
    nguHanhRelation: string;
    commonGoodDirs: Direction[];
    advice: string[];
    harmonyDirection: Direction | null;
}

export interface LuckyNumberResult {
    luckyDigits: number[];
    luckyFloors: number[];
    avoidFloors: number[];
    luckyHouseEndings: string[];
    explanation: string;
}

// ============================================================
// THIÊN CAN - ĐỊA CHI
// ============================================================
const THIEN_CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const DIA_CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
const CON_GIAP = ['Chuột', 'Trâu', 'Hổ', 'Mèo', 'Rồng', 'Rắn', 'Ngựa', 'Dê', 'Khỉ', 'Gà', 'Chó', 'Heo'];
const CON_GIAP_EMOJI = ['🐀', '🐃', '🐅', '🐈', '🐉', '🐍', '🐎', '🐐', '🐒', '🐓', '🐕', '🐷'];

export const getCanChi = (year: number) => {
    const canIdx = (year - 4) % 10;
    const chiIdx = (year - 4) % 12;
    return {
        can: THIEN_CAN[canIdx],
        chi: DIA_CHI[chiIdx],
        canChi: `${THIEN_CAN[canIdx]} ${DIA_CHI[chiIdx]}`,
        conGiap: CON_GIAP[chiIdx],
        conGiapEmoji: CON_GIAP_EMOJI[chiIdx],
        chiIdx,
    };
};

// ============================================================
// NẠP ÂM - 60 NĂM GIÁP TÝ (Bảng tra chính xác)
// ============================================================
const NAP_AM_TABLE: { name: string; menh: Menh; desc: string }[] = [
    { name: 'Hải Trung Kim', menh: 'Kim', desc: 'Vàng trong biển' },
    { name: 'Lô Trung Hỏa', menh: 'Hỏa', desc: 'Lửa trong lò' },
    { name: 'Đại Lâm Mộc', menh: 'Mộc', desc: 'Gỗ rừng lớn' },
    { name: 'Lộ Bàng Thổ', menh: 'Thổ', desc: 'Đất bên đường' },
    { name: 'Kiếm Phong Kim', menh: 'Kim', desc: 'Vàng mũi kiếm' },
    { name: 'Sơn Đầu Hỏa', menh: 'Hỏa', desc: 'Lửa đầu núi' },
    { name: 'Giản Hạ Thủy', menh: 'Thủy', desc: 'Nước dưới khe' },
    { name: 'Thành Đầu Thổ', menh: 'Thổ', desc: 'Đất đầu thành' },
    { name: 'Bạch Lạp Kim', menh: 'Kim', desc: 'Vàng trong nến' },
    { name: 'Dương Liễu Mộc', menh: 'Mộc', desc: 'Gỗ dương liễu' },
    { name: 'Tuyền Trung Thủy', menh: 'Thủy', desc: 'Nước trong suối' },
    { name: 'Ốc Thượng Thổ', menh: 'Thổ', desc: 'Đất trên nóc nhà' },
    { name: 'Tích Lịch Hỏa', menh: 'Hỏa', desc: 'Lửa sấm sét' },
    { name: 'Tùng Bách Mộc', menh: 'Mộc', desc: 'Gỗ tùng bách' },
    { name: 'Trường Lưu Thủy', menh: 'Thủy', desc: 'Nước sông dài' },
    { name: 'Sa Trung Kim', menh: 'Kim', desc: 'Vàng trong cát' },
    { name: 'Sơn Hạ Hỏa', menh: 'Hỏa', desc: 'Lửa chân núi' },
    { name: 'Bình Địa Mộc', menh: 'Mộc', desc: 'Gỗ đồng bằng' },
    { name: 'Bích Thượng Thổ', menh: 'Thổ', desc: 'Đất trên vách' },
    { name: 'Kim Bạch Kim', menh: 'Kim', desc: 'Vàng pha bạc' },
    { name: 'Phúc Đăng Hỏa', menh: 'Hỏa', desc: 'Lửa đèn Phật' },
    { name: 'Thiên Hà Thủy', menh: 'Thủy', desc: 'Nước ngân hà' },
    { name: 'Đại Dịch Thổ', menh: 'Thổ', desc: 'Đất bãi lớn' },
    { name: 'Thoa Xuyến Kim', menh: 'Kim', desc: 'Vàng trang sức' },
    { name: 'Tang Đố Mộc', menh: 'Mộc', desc: 'Gỗ cây dâu' },
    { name: 'Đại Khê Thủy', menh: 'Thủy', desc: 'Nước khe lớn' },
    { name: 'Sa Trung Thổ', menh: 'Thổ', desc: 'Đất trong cát' },
    { name: 'Thiên Thượng Hỏa', menh: 'Hỏa', desc: 'Lửa trên trời' },
    { name: 'Thạch Lựu Mộc', menh: 'Mộc', desc: 'Gỗ thạch lựu' },
    { name: 'Đại Hải Thủy', menh: 'Thủy', desc: 'Nước biển lớn' },
];

export const calculateNapAm = (year: number): NapAmResult => {
    const cc = getCanChi(year);
    const cycleIdx = ((year - 4) % 60 + 60) % 60;
    const napAmIdx = Math.floor(cycleIdx / 2);
    const entry = NAP_AM_TABLE[napAmIdx] || NAP_AM_TABLE[0];
    return {
        canChi: cc.canChi,
        napAm: entry.name,
        menh: entry.menh,
        conGiap: cc.conGiap,
        conGiapEmoji: cc.conGiapEmoji,
    };
};

// ============================================================
// BÁT TRẠCH — Bảng tra CHÍNH XÁC 8 Quái × 8 Hướng
// ============================================================
const STAR_DESCRIPTIONS: Record<Star, { desc: string; usage: string }> = {
    'Sinh Khí': { desc: 'Vượng khí nhất, mang lại tài lộc, sức khỏe, thăng tiến', usage: 'Đặt cửa chính, phòng khách, bàn làm việc' },
    'Thiên Y': { desc: 'Sức khỏe dồi dào, quý nhân phù trợ, bệnh tật tiêu tan', usage: 'Phòng ngủ chính, bếp, phòng nghỉ ngơi' },
    'Diên Niên': { desc: 'Hòa hợp gia đạo, vợ chồng hạnh phúc, trường thọ', usage: 'Phòng ngủ vợ chồng, phòng ăn' },
    'Phục Vị': { desc: 'Ổn định, bình an, tĩnh lặng, phù hợp tu dưỡng', usage: 'Phòng thờ, phòng đọc sách, kho' },
    'Họa Hại': { desc: 'Nhẹ nhất trong hung tinh, gây bất hòa, kiện tụng nhỏ', usage: 'Tránh đặt phòng ngủ, có thể dùng làm nhà vệ sinh' },
    'Lục Sát': { desc: 'Đào hoa, ngoại tình, gia đạo bất hòa, thị phi', usage: 'Tránh đặt phòng ngủ vợ chồng' },
    'Ngũ Quỷ': { desc: 'Hung tinh nặng, hỏa hoạn, trộm cắp, bệnh tật, tà khí', usage: 'Đặt bếp (hỏa áp chế quỷ), nhà vệ sinh' },
    'Tuyệt Mệnh': { desc: 'Hung nhất, phá sản, bệnh nặng, tai họa liên miên', usage: 'Đặt nhà vệ sinh, kho chứa đồ, tránh ngủ' },
};

// Bảng tra chính xác theo Dịch Lý Bát Trạch
// Key: quaiNumber, Value: array of [direction, star]
const BAT_TRACH_MAP: Record<number, [Direction, Star][]> = {
    1: [ // Khảm - Thủy - Bắc
        ['Bắc', 'Phục Vị'], ['Đông Nam', 'Sinh Khí'], ['Đông', 'Thiên Y'], ['Nam', 'Diên Niên'],
        ['Tây', 'Họa Hại'], ['Tây Bắc', 'Lục Sát'], ['Đông Bắc', 'Ngũ Quỷ'], ['Tây Nam', 'Tuyệt Mệnh'],
    ],
    2: [ // Khôn - Thổ - Tây Nam
        ['Tây Nam', 'Phục Vị'], ['Đông Bắc', 'Sinh Khí'], ['Tây', 'Thiên Y'], ['Tây Bắc', 'Diên Niên'],
        ['Đông', 'Họa Hại'], ['Nam', 'Lục Sát'], ['Đông Nam', 'Ngũ Quỷ'], ['Bắc', 'Tuyệt Mệnh'],
    ],
    3: [ // Chấn - Mộc - Đông
        ['Đông', 'Phục Vị'], ['Nam', 'Sinh Khí'], ['Bắc', 'Thiên Y'], ['Đông Nam', 'Diên Niên'],
        ['Tây Nam', 'Họa Hại'], ['Đông Bắc', 'Lục Sát'], ['Tây Bắc', 'Ngũ Quỷ'], ['Tây', 'Tuyệt Mệnh'],
    ],
    4: [ // Tốn - Mộc - Đông Nam
        ['Đông Nam', 'Phục Vị'], ['Bắc', 'Sinh Khí'], ['Nam', 'Thiên Y'], ['Đông', 'Diên Niên'],
        ['Tây Bắc', 'Họa Hại'], ['Tây', 'Lục Sát'], ['Tây Nam', 'Ngũ Quỷ'], ['Đông Bắc', 'Tuyệt Mệnh'],
    ],
    6: [ // Càn - Kim - Tây Bắc
        ['Tây Bắc', 'Phục Vị'], ['Tây', 'Sinh Khí'], ['Đông Bắc', 'Thiên Y'], ['Tây Nam', 'Diên Niên'],
        ['Đông Nam', 'Họa Hại'], ['Đông', 'Lục Sát'], ['Bắc', 'Ngũ Quỷ'], ['Nam', 'Tuyệt Mệnh'],
    ],
    7: [ // Đoài - Kim - Tây
        ['Tây', 'Phục Vị'], ['Tây Bắc', 'Sinh Khí'], ['Tây Nam', 'Thiên Y'], ['Đông Bắc', 'Diên Niên'],
        ['Nam', 'Họa Hại'], ['Đông Nam', 'Lục Sát'], ['Đông', 'Ngũ Quỷ'], ['Bắc', 'Tuyệt Mệnh'],
    ],
    8: [ // Cấn - Thổ - Đông Bắc
        ['Đông Bắc', 'Phục Vị'], ['Tây Nam', 'Sinh Khí'], ['Tây Bắc', 'Thiên Y'], ['Tây', 'Diên Niên'],
        ['Bắc', 'Họa Hại'], ['Nam', 'Lục Sát'], ['Đông', 'Ngũ Quỷ'], ['Đông Nam', 'Tuyệt Mệnh'],
    ],
    9: [ // Ly - Hỏa - Nam
        ['Nam', 'Phục Vị'], ['Đông', 'Sinh Khí'], ['Đông Nam', 'Thiên Y'], ['Bắc', 'Diên Niên'],
        ['Đông Bắc', 'Họa Hại'], ['Tây Nam', 'Lục Sát'], ['Tây', 'Ngũ Quỷ'], ['Tây Bắc', 'Tuyệt Mệnh'],
    ],
};

const CUNG_MAP: Record<number, { name: string; menh: Menh; group: BatTrachGroup }> = {
    1: { name: 'Khảm', menh: 'Thủy', group: 'Đông Tứ Trạch' },
    2: { name: 'Khôn', menh: 'Thổ', group: 'Tây Tứ Trạch' },
    3: { name: 'Chấn', menh: 'Mộc', group: 'Đông Tứ Trạch' },
    4: { name: 'Tốn', menh: 'Mộc', group: 'Đông Tứ Trạch' },
    6: { name: 'Càn', menh: 'Kim', group: 'Tây Tứ Trạch' },
    7: { name: 'Đoài', menh: 'Kim', group: 'Tây Tứ Trạch' },
    8: { name: 'Cấn', menh: 'Thổ', group: 'Tây Tứ Trạch' },
    9: { name: 'Ly', menh: 'Hỏa', group: 'Đông Tứ Trạch' },
};

// Tính Quái số (hỗ trợ trước & sau năm 2000)
export const getQuaiNumber = (year: number, gender: Gender): number => {
    const yearStr = year.toString();
    let sum = parseInt(yearStr[yearStr.length - 2]) + parseInt(yearStr[yearStr.length - 1]);
    while (sum > 9) sum = Math.floor(sum / 10) + (sum % 10);

    let q: number;
    if (year < 2000) {
        q = gender === 'male' ? 10 - sum : 5 + sum;
    } else {
        q = gender === 'male' ? 9 - sum : 6 + sum;
    }
    while (q > 9) q = Math.floor(q / 10) + (q % 10);
    if (q === 0) q = 9;
    if (q === 5) q = gender === 'male' ? 2 : 8;
    return q;
};

// ============================================================
// CALCULATE FENG SHUI (Enhanced)
// ============================================================
export const calculateFengShui = (year: number, gender: Gender): FengShuiResult => {
    const quaiNumber = getQuaiNumber(year, gender);
    const info = CUNG_MAP[quaiNumber];
    if (!info) {
        return { quaiNumber: 0, cung: 'Unknown', menh: 'Thổ', nhom: 'Đông Tứ Trạch', napAm: calculateNapAm(year), directions: [], tot: [], xau: [] };
    }

    const rawDirs = BAT_TRACH_MAP[quaiNumber] || [];
    const directions: DirectionDetail[] = rawDirs.map(([dir, star]) => {
        const isGood = ['Sinh Khí', 'Thiên Y', 'Diên Niên', 'Phục Vị'].includes(star);
        const meta = STAR_DESCRIPTIONS[star];
        return { dir, star, isGood, description: meta.desc, usage: meta.usage };
    });

    return {
        quaiNumber,
        cung: `${info.name} (${info.menh})`,
        menh: info.menh,
        nhom: info.group,
        napAm: calculateNapAm(year),
        directions,
        tot: directions.filter(d => d.isGood),
        xau: directions.filter(d => !d.isGood),
    };
};

// ============================================================
// XEM TUỔI LÀM NHÀ (Enhanced)
// ============================================================
export const checkAgeBuilding = (yearBorn: number, currentYear: number): AgeCheckResult => {
    const age = currentYear - yearBorn + 1;
    const details: string[] = [];

    // 1. Kim Lâu
    const kimLauMod = age % 9;
    const isKimLau = [1, 3, 6, 8].includes(kimLauMod);
    if (isKimLau) {
        const typeMap: Record<number, string> = {
            1: 'Kim Lâu Thân — Hại bản thân gia chủ',
            3: 'Kim Lâu Thê — Hại vợ/chồng',
            6: 'Kim Lâu Tử — Hại con cái',
            8: 'Kim Lâu Súc — Hại tài vận, kinh tế',
        };
        details.push(`⚠️ Phạm ${typeMap[kimLauMod]}`);
    }

    // 2. Hoang Ốc
    const tens = Math.floor(age / 10);
    const units = age % 10;
    let hoangOcNode = Math.min(tens, 6) || 1;
    for (let i = 0; i < units; i++) {
        hoangOcNode++;
        if (hoangOcNode > 6) hoangOcNode = 1;
    }
    const isHoangOc = [3, 5, 6].includes(hoangOcNode);
    if (isHoangOc) {
        const nameMap: Record<number, string> = {
            3: 'Tam Địa Sát — Gây bệnh tật, đau ốm',
            5: 'Ngũ Thọ Tử — Ly biệt, mất mát',
            6: 'Lục Hoang Ốc — Nhà hoang phế, khó thành đạt',
        };
        details.push(`⚠️ Phạm Hoang Ốc: ${nameMap[hoangOcNode]}`);
    }

    // 3. Tam Tai
    const conGiap = (yearBorn - 4) % 12;
    const currentConGiap = (currentYear - 4) % 12;
    let isTamTai = false;
    const tamTaiGroups: [number[], number[]][] = [
        [[8, 0, 4], [2, 3, 4]],   // Thân Tý Thìn → Dần Mão Thìn
        [[2, 6, 10], [8, 9, 10]], // Dần Ngọ Tuất → Thân Dậu Tuất
        [[5, 9, 1], [11, 0, 1]],  // Tỵ Dậu Sửu → Hợi Tý Sửu
        [[11, 3, 7], [5, 6, 7]],  // Hợi Mão Mùi → Tỵ Ngọ Mùi
    ];
    for (const [group, tai] of tamTaiGroups) {
        if (group.includes(conGiap) && tai.includes(currentConGiap)) {
            isTamTai = true;
            break;
        }
    }
    if (isTamTai) details.push('⚠️ Phạm Tam Tai — Nên tránh khởi công, động thổ');

    const isGood = !isTamTai && !isKimLau && !isHoangOc;
    let yearAdvice = '';
    if (isGood) {
        yearAdvice = `Năm ${currentYear} gia chủ ${age} tuổi (mụ), KHÔNG phạm Kim Lâu, Hoang Ốc, Tam Tai. Đại cát đại lợi, thuận lợi cho xây dựng, mua bán bất động sản.`;
    } else {
        yearAdvice = `Năm ${currentYear} gia chủ ${age} tuổi (mụ), phạm ${details.length} điều kiêng kỵ. Nên MƯỢN TUỔI người thân không phạm để đứng tên làm nhà, hoặc chờ năm khác.`;
    }

    return { age, tamTai: isTamTai, kimLau: isKimLau, hoangOc: isHoangOc, conclusion: isGood ? 'Tốt' : 'Xấu', details, yearAdvice };
};

// ============================================================
// THƯỚC LỖ BAN (52.2cm)
// ============================================================
export const checkLuBan = (cm: number): { status: 'Tốt' | 'Xấu'; cung: string; yNghia: string } => {
    const cycle = 52.2;
    const pos = ((cm % cycle) + cycle) % cycle;
    const section = Math.floor(pos / (cycle / 8));
    const map = [
        { name: 'Quý Nhân', status: 'Tốt' as const, desc: 'Gặp quý nhân phù trợ, tài lộc may mắn, làm ăn phát đạt' },
        { name: 'Hiểm Họa', status: 'Xấu' as const, desc: 'Dễ gặp tai nạn bất ngờ, trôi dạt, con cháu hư hỏng' },
        { name: 'Thiên Tai', status: 'Xấu' as const, desc: 'Bệnh tật ốm đau, hao tài tổn lộc, mất của' },
        { name: 'Thiên Tài', status: 'Tốt' as const, desc: 'Tài lộc dồi dào, may mắn, con cái hiếu thảo' },
        { name: 'Nhân Lộc', status: 'Tốt' as const, desc: 'Phú quý vinh hoa, con cái thành đạt, danh tiếng vang xa' },
        { name: 'Cô Độc', status: 'Xấu' as const, desc: 'Hao người hao của, ly biệt cô đơn' },
        { name: 'Thiên Tắc', status: 'Xấu' as const, desc: 'Tai họa tù tội, nhiều cản trở, kém may mắn' },
        { name: 'Tể Tướng', status: 'Tốt' as const, desc: 'Hanh thông mọi việc, con cái tấn tài, vạn sự như ý' },
    ];
    const res = map[section] || map[0];
    return { status: res.status, cung: res.name, yNghia: res.desc };
};

// ============================================================
// NGŨ HÀNH TƯƠNG SINH / TƯƠNG KHẮC
// ============================================================
const NGU_HANH_ORDER: Menh[] = ['Kim', 'Thủy', 'Mộc', 'Hỏa', 'Thổ'];

// Tương Sinh: Kim → Thủy → Mộc → Hỏa → Thổ → Kim
// Tương Khắc: Kim → Mộc → Thổ → Thủy → Hỏa → Kim
export const getNguHanhRelation = (menh1: Menh, menh2: Menh): { relation: string; quality: 'Tốt' | 'Trung bình' | 'Xấu'; detail: string } => {
    if (menh1 === menh2) return { relation: 'Tỷ Hòa', quality: 'Trung bình', detail: `${menh1} gặp ${menh2}: Cùng hành, hòa hợp ổn định nhưng không có sự hỗ trợ mạnh.` };

    const sinhMap: Record<Menh, Menh> = { Kim: 'Thủy', Thủy: 'Mộc', Mộc: 'Hỏa', Hỏa: 'Thổ', Thổ: 'Kim' };
    const khacMap: Record<Menh, Menh> = { Kim: 'Mộc', Mộc: 'Thổ', Thổ: 'Thủy', Thủy: 'Hỏa', Hỏa: 'Kim' };

    if (sinhMap[menh1] === menh2) return { relation: 'Tương Sinh (Sinh ra)', quality: 'Tốt', detail: `${menh1} SINH ${menh2}: Quan hệ nuôi dưỡng, hỗ trợ rất tốt.` };
    if (sinhMap[menh2] === menh1) return { relation: 'Tương Sinh (Được sinh)', quality: 'Tốt', detail: `${menh2} SINH ${menh1}: Được nuôi dưỡng, phù trợ sức mạnh.` };
    if (khacMap[menh1] === menh2) return { relation: 'Tương Khắc (Khắc)', quality: 'Xấu', detail: `${menh1} KHẮC ${menh2}: Xung đột, cần vật phẩm hóa giải.` };
    if (khacMap[menh2] === menh1) return { relation: 'Tương Khắc (Bị khắc)', quality: 'Xấu', detail: `${menh2} KHẮC ${menh1}: Bị áp chế, cần phong thủy hỗ trợ.` };

    return { relation: 'Trung tính', quality: 'Trung bình', detail: 'Không tương sinh, không tương khắc.' };
};

// Hành trung gian hóa giải
export const getMediator = (menh1: Menh, menh2: Menh): Menh | null => {
    const sinhMap: Record<Menh, Menh> = { Kim: 'Thủy', Thủy: 'Mộc', Mộc: 'Hỏa', Hỏa: 'Thổ', Thổ: 'Kim' };
    // Find element X where menh1 sinh X và X sinh menh2
    for (const m of NGU_HANH_ORDER) {
        const parent = Object.entries(sinhMap).find(([, v]) => v === m)?.[0] as Menh | undefined;
        if (parent === menh1 && sinhMap[m] === menh2) return m;
        if (parent === menh2 && sinhMap[m] === menh1) return m;
    }
    return null;
};

// ============================================================
// MÀU SẮC HỢP MỆNH (Enhanced with hex codes)
// ============================================================
export const getColors = (menh: string) => {
    const data: Record<string, { hop: { name: string; hex: string }[]; ky: { name: string; hex: string }[] }> = {
        Kim: {
            hop: [{ name: 'Trắng', hex: '#FFFFFF' }, { name: 'Bạc', hex: '#C0C0C0' }, { name: 'Xám', hex: '#808080' }, { name: 'Vàng đất', hex: '#D4A574' }, { name: 'Nâu nhạt', hex: '#C4A882' }],
            ky: [{ name: 'Đỏ', hex: '#DC2626' }, { name: 'Hồng', hex: '#EC4899' }, { name: 'Cam', hex: '#F97316' }],
        },
        Mộc: {
            hop: [{ name: 'Xanh lá', hex: '#22C55E' }, { name: 'Xanh ngọc', hex: '#14B8A6' }, { name: 'Đen', hex: '#1A1A1A' }, { name: 'Xanh dương', hex: '#3B82F6' }],
            ky: [{ name: 'Trắng', hex: '#FFFFFF' }, { name: 'Bạc', hex: '#C0C0C0' }, { name: 'Ghi', hex: '#9CA3AF' }],
        },
        Thủy: {
            hop: [{ name: 'Đen', hex: '#1A1A1A' }, { name: 'Xanh dương', hex: '#3B82F6' }, { name: 'Trắng', hex: '#FFFFFF' }, { name: 'Bạc', hex: '#C0C0C0' }],
            ky: [{ name: 'Vàng', hex: '#EAB308' }, { name: 'Nâu đất', hex: '#92400E' }, { name: 'Cam đất', hex: '#C2410C' }],
        },
        Hỏa: {
            hop: [{ name: 'Đỏ', hex: '#DC2626' }, { name: 'Hồng', hex: '#EC4899' }, { name: 'Cam', hex: '#F97316' }, { name: 'Xanh lá', hex: '#22C55E' }],
            ky: [{ name: 'Đen', hex: '#1A1A1A' }, { name: 'Xanh dương đậm', hex: '#1E3A8A' }, { name: 'Xám đậm', hex: '#374151' }],
        },
        Thổ: {
            hop: [{ name: 'Vàng', hex: '#EAB308' }, { name: 'Nâu đất', hex: '#92400E' }, { name: 'Be', hex: '#D4C5A9' }, { name: 'Đỏ', hex: '#DC2626' }, { name: 'Hồng', hex: '#EC4899' }],
            ky: [{ name: 'Xanh lá', hex: '#22C55E' }, { name: 'Xanh ngọc', hex: '#14B8A6' }],
        },
    };
    return data[menh] || data['Thổ'];
};

// ============================================================
// PHỐI HỢP TUỔI VỢ CHỒNG
// ============================================================
export const calculateCouple = (year1: number, gender1: Gender, year2: number, gender2: Gender): CoupleResult => {
    const p1 = calculateFengShui(year1, gender1);
    const p2 = calculateFengShui(year2, gender2);
    const sameGroup = p1.nhom === p2.nhom;
    const nguHanh = getNguHanhRelation(p1.menh, p2.menh);

    // Tìm hướng tốt chung
    const goodDirs1 = p1.tot.map(d => d.dir);
    const goodDirs2 = p2.tot.map(d => d.dir);
    const commonGoodDirs = goodDirs1.filter(d => goodDirs2.includes(d)) as Direction[];

    // Tính điểm
    let score = 50;
    if (sameGroup) score += 30;
    if (nguHanh.quality === 'Tốt') score += 20;
    else if (nguHanh.quality === 'Xấu') score -= 10;
    score += commonGoodDirs.length * 5;
    score = Math.min(100, Math.max(10, score));

    let compatibility: CoupleResult['compatibility'];
    if (score >= 85) compatibility = 'Đại Cát';
    else if (score >= 70) compatibility = 'Tốt';
    else if (score >= 50) compatibility = 'Trung Bình';
    else compatibility = 'Cần Hóa Giải';

    const advice: string[] = [];
    if (sameGroup) {
        advice.push(`✅ Cả hai cùng nhóm ${p1.nhom} — rất hòa hợp, dễ tìm hướng nhà chung.`);
    } else {
        advice.push(`⚠️ Hai người khác nhóm (${p1.nhom} & ${p2.nhom}). Nên ưu tiên hướng nhà theo người trụ cột gia đình.`);
    }
    if (nguHanh.quality === 'Tốt') {
        advice.push(`✅ ${nguHanh.detail}`);
    } else if (nguHanh.quality === 'Xấu') {
        const mediator = getMediator(p1.menh, p2.menh);
        advice.push(`⚠️ ${nguHanh.detail}`);
        if (mediator) advice.push(`💡 Hóa giải: Dùng vật phẩm/màu sắc hành ${mediator} làm trung gian hòa hợp.`);
    }
    if (commonGoodDirs.length > 0) {
        advice.push(`🏠 Hướng nhà hợp cả hai: ${commonGoodDirs.join(', ')}`);
    } else {
        const p1Best = p1.tot.find(d => d.star === 'Sinh Khí');
        advice.push(`💡 Không có hướng chung. Ưu tiên hướng ${p1Best?.dir || p1.tot[0]?.dir} (Sinh Khí của trụ cột).`);
    }

    return {
        person1: p1,
        person2: p2,
        compatibility,
        score,
        sameGroup,
        nguHanhRelation: nguHanh.relation,
        commonGoodDirs,
        advice,
        harmonyDirection: commonGoodDirs[0] || null,
    };
};

// ============================================================
// CON SỐ MAY MẮN / TẦNG HỢP MỆNH
// ============================================================
// Hà Đồ: Thủy=1,6 | Hỏa=2,7 | Mộc=3,8 | Kim=4,9 | Thổ=5,10(0)
const HA_DO: Record<Menh, number[]> = {
    Thủy: [1, 6], Hỏa: [2, 7], Mộc: [3, 8], Kim: [4, 9], Thổ: [5, 10],
};

const TUONG_SINH_MAP: Record<Menh, Menh> = { Kim: 'Thủy', Thủy: 'Mộc', Mộc: 'Hỏa', Hỏa: 'Thổ', Thổ: 'Kim' };
const PARENT_MAP: Record<Menh, Menh> = { Thủy: 'Kim', Mộc: 'Thủy', Hỏa: 'Mộc', Thổ: 'Hỏa', Kim: 'Thổ' };
const KHAC_MAP: Record<Menh, Menh> = { Kim: 'Mộc', Mộc: 'Thổ', Thổ: 'Thủy', Thủy: 'Hỏa', Hỏa: 'Kim' };

export const getLuckyNumbers = (menh: Menh): LuckyNumberResult => {
    const ownNums = HA_DO[menh];
    const parentMenh = PARENT_MAP[menh]; // hành sinh ra mình
    const parentNums = HA_DO[parentMenh];
    const luckyDigits = [...ownNums, ...parentNums].sort((a, b) => a - b);

    const khacMenh = KHAC_MAP[menh]; // hành mình khắc thì bị hại
    const biKhacMenh = Object.entries(KHAC_MAP).find(([, v]) => v as string === menh)?.[0] as Menh;
    const avoidNums = [...HA_DO[khacMenh], ...(biKhacMenh ? HA_DO[biKhacMenh] : [])];

    // Tầng hợp mệnh (lấy các tầng kết thúc bằng số hợp, trong khoảng 1-30)
    const luckyFloors: number[] = [];
    const avoidFloors: number[] = [];
    for (let i = 1; i <= 30; i++) {
        const lastDigit = i % 10;
        if (ownNums.includes(lastDigit) || parentNums.includes(lastDigit)) luckyFloors.push(i);
        if (avoidNums.includes(lastDigit)) avoidFloors.push(i);
    }

    // Số nhà
    const luckyHouseEndings = luckyDigits.map(String);

    return {
        luckyDigits,
        luckyFloors: luckyFloors.slice(0, 12),
        avoidFloors: avoidFloors.slice(0, 8),
        luckyHouseEndings,
        explanation: `Mệnh ${menh} (Hà Đồ số ${ownNums.join(',')}). Được ${parentMenh} tương sinh (số ${parentNums.join(',')}). Tránh số hành ${khacMenh} (${HA_DO[khacMenh].join(',')}).`,
    };
};

// ============================================================
// HƯỚNG BÀN LÀM VIỆC
// ============================================================
export const getDeskDirection = (result: FengShuiResult): { primary: DirectionDetail; secondary: DirectionDetail; advice: string } => {
    const sinhKhi = result.tot.find(d => d.star === 'Sinh Khí') || result.tot[0];
    const thienY = result.tot.find(d => d.star === 'Thiên Y') || result.tot[1];
    return {
        primary: sinhKhi,
        secondary: thienY,
        advice: `Ngồi QUAY MẶT về hướng ${sinhKhi.dir} (Sinh Khí) để tài lộc dồi dào, thăng tiến sự nghiệp. Hướng phụ: ${thienY.dir} (Thiên Y) cho sức khỏe và quý nhân.`,
    };
};
