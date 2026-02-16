export type ContentStyle = 'funny' | 'urgent' | 'sincere' | 'story' | 'professional';
export type PropertyType = 'land' | 'apartment' | 'house' | 'villa';

interface ContentParams {
    type: PropertyType;
    area: string;
    location: string;
    price: string;
    frontage?: string;
    features: string;
    style: ContentStyle;
    custom?: string;
}

const templates: Record<ContentStyle, (params: ContentParams) => string[]> = {
    professional: (p) => [
        `🏢 BÁN ${p.type.toUpperCase()} VỊ TRÍ ĐẮC ĐỊA TẠI ${p.location.toUpperCase()}\n\n✅ Diện tích: ${p.area}m2\n✅ Giá bán: ${p.price}\n${p.frontage ? `✅ Mặt tiền: ${p.frontage}\n` : ''}💎 Điểm nổi bật: ${p.features}\n\n${p.custom ? `📌 Lưu ý: ${p.custom}\n\n` : ''}☎️ Liên hệ ngay để xem nhà/đất chính chủ!`,
        `🔥 CƠ HỘI ĐẦU TƯ ${p.type.toUpperCase()} SIÊU LỢI NHUẬN\n📍 Vị trí: ${p.location}\n📐 Diện tích: ${p.area}m2 - Pháp lý chuẩn chỉnh\n💰 Giá cực tốt: ${p.price}\n\n✨ Tiện ích: ${p.features}\n\n📞 Gọi ngay hotline để ép giá!`,
        `📣 CHÍNH CHỦ CẦN BÁN GẤP ${p.type.toUpperCase()} - ${p.location}\n\n- Diện tích rộng rãi: ${p.area}m2\n- Giá công khai: ${p.price} (có thương lượng)\n- ${p.features}\n\n${p.custom || ''}\n\nLiên hệ xem nhà 24/7.`
    ],
    urgent: (p) => [
        `🆘 CẮT LỖ SÂU! BÁN GẤP ${p.type.toUpperCase()} TẠI ${p.location}\n\nChủ nhà cần tiền bán gấp! Giá chỉ ${p.price} cho ${p.area}m2.\nCơ hội bắt đáy thị trường. ${p.features}.\n\n⏳ Gọi ngay kẻo lỡ!`,
        `🔥 GIẢM KỊCH SÀN - CHỈ ${p.price} SỞ HỮU NGAY ${p.area}m2 Ở ${p.location}\n\nKhông mua bây giờ thì bao giờ mua? ${p.features}.\n${p.custom || ''}\n\n📞 Alo em xem ngay!`
    ],
    funny: (p) => [
        `😍 YÊU LÀ PHẢI NÓI - ĐÓI LÀ PHẢI ĂN - MUA ${p.type.toUpperCase()} THÌ GỌI EM!\n\n🏠 ${p.location}, ${p.area}m2 chỉ ${p.price}.\nĐẹp như hoa hậu: ${p.features}.\n\n${p.custom || ''}\n\nChốt đơn ngay kẻo vợ người ta mua mất! 😂`,
        `🚀 TÊN LỬA CŨNG KHÔNG NHANH BẰNG TỐC ĐỘ TĂNG GIÁ CỦA LÔ NÀY\n\n${p.type.toUpperCase()} ${p.location} siêu đẹp.\nDiện tích: ${p.area}m2 - Giá hạt dẻ ${p.price}.\n\nAi chốt nhanh em tặng ngay... lời cảm ơn chân thành! 😊`
    ],
    sincere: (p) => [
        `💌 Một căn ${p.type} tâm huyết tại ${p.location} cần tìm chủ mới.\nDiện tích ${p.area}m2, giá rất hợp lý: ${p.price}.\nĐây thực sự là nơi an cư lý tưởng vì ${p.features}.\n\n${p.custom || ''}\nHy vọng hữu duyên với anh chị thiện chí.`
    ],
    story: (p) => [
        `📖 CÂU CHUYỆN VỀ NGÔI NHÀ HẠNH PHÚC\n\nSáng nay đi khảo sát căn ${p.type} ở ${p.location}, tự nhiên thấy bình yên lạ thường.\nVới ${p.area}m2, giá chỉ ${p.price}, không gian ở đây thật sự đáng sống: ${p.features}.\n\n${p.custom || ''}\nAnh chị nào đang tìm chốn đi về bình yên thì nhắn em nhé.`
    ]
};

export const generateContent = (params: ContentParams): string[] => {
    const templateFn = templates[params.style];
    return templateFn ? templateFn(params) : [];
};
