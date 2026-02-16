export interface ScriptCategory {
    id: string;
    name: string;
    icon: string;
}

export interface ScriptItem {
    id: string;
    categoryId: string;
    title: string;
    situation: string;
    content: string;
    tags: string[];
}

export const CATEGORIES: ScriptCategory[] = [
    { id: 'objection', name: 'Xử lý Từ chối', icon: 'ShieldAlert' },
    { id: 'closing', name: 'Chốt Deal', icon: 'CheckCircle' },
    { id: 'followup', name: 'Chăm sóc (Follow-up)', icon: 'Clock' },
    { id: 'cold', name: 'Cold Call/Message', icon: 'Phone' },
];

export const SCRIPTS: ScriptItem[] = [
    {
        id: 'price-high',
        categoryId: 'objection',
        title: 'Khách chê giá cao',
        situation: 'Khách hàng nói giá này cao hơn khu vực hoặc ngân sách dự kiến.',
        content: 'Dạ, em hiểu băn khoăn của anh/chị. Thực ra lúc đầu nhiều khách bên em cũng nghĩ vậy. Nhưng nếu mình chia nhỏ giá ra theo m2 sử dụng và tiện ích đi kèm (hồ bơi, gym, an ninh 24/7) thì thực tế lại rất cạnh tranh. Hơn nữa, tiềm năng tăng giá khu này đang [Lý_do_tăng_giá]. Anh/chị có muốn em gửi bảng so sánh chi tiết với các dự án lân cận không ạ?',
        tags: ['giá cao', 'so sánh', 'thuyết phục']
    },
    {
        id: 'think-about-it',
        categoryId: 'objection',
        title: 'Khách nói "Để suy nghĩ thêm"',
        situation: 'Khách hàng chưa ra quyết định ngay, muốn trì hoãn.',
        content: 'Dạ vâng, mua nhà là chuyện lớn nên mình cân nhắc kỹ là đúng ạ. Tuy nhiên, anh/chị đang băn khoăn chính ở điểm nào ạ? Về giá, vị trí hay pháp lý? Em hỏi để có thể hỗ trợ giải đáp rõ hơn thôi ạ, chứ anh/chị chưa mua ngay cũng không sao đâu ạ.',
        tags: ['trì hoãn', 'khai thác', 'tâm lý']
    },
    {
        id: 'deposit-urging',
        categoryId: 'closing',
        title: 'Thúc giục đặt cọc (Scarcity)',
        situation: 'Khách đã ưng, nhưng còn chần chừ chưa xuống tiền.',
        content: 'Anh/chị ơi, căn [Mã_căn] này hiện đang có 2 khách khác cũng đang quan tâm và hẹn xem chiều nay. Vì đây là căn góc/view đẹp, nếu anh/chị đã ưng rồi thì mình nên giữ chỗ thiện chí trước để ưu tiên quyền mua. Nếu sau này không mua thì bên em hoàn lại 100% tiền giữ chỗ mà không mất phí gì đâu ạ.',
        tags: ['khan hiếm', 'giữ chỗ', 'gấp']
    },
    {
        id: 'fomo-event',
        categoryId: 'followup',
        title: 'Mời đi sự kiện mở bán',
        situation: 'Mời khách cũ quay lại quan tâm dự án mới.',
        content: 'Chào anh [Tên_khách], cuối tuần này bên em có sự kiện công bố giỏ hàng độc quyền view sông. Chỉ duy nhất đợt này có chiết khấu 5% + tặng vàng SJC. Em mời anh ghé tham quan nhé, chỉ cần check-in là có quà mang về rồi ạ!',
        tags: ['sự kiện', 'khuyến mãi', 'mời khách']
    },
    {
        id: 'cold-zalo',
        categoryId: 'cold',
        title: 'Kết bạn Zalo lần đầu',
        situation: 'Gửi lời chào kết bạn để khách accept.',
        content: 'Em chào anh [Tên_khách], em thấy mình đang quan tâm BĐS khu vực [Khu_vực] trên group. Em có 1 lô ngộp giá cực tốt vừa mới về, em gửi anh tham khảo nhé. Em là [Tên_sale] bên [Tên_sàn].',
        tags: ['kết bạn', 'hàng ngộp', 'chào hỏi']
    }
];
