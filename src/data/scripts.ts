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
    { id: 'legal', name: 'Pháp lý & Quy hoạch', icon: 'FileText' },
];

export const SCRIPTS: ScriptItem[] = [
    {
        id: 'price-high',
        categoryId: 'objection',
        title: 'Khách chê giá cao',
        situation: 'Khách hàng nói giá này cao hơn khu vực hoặc ngân sách dự kiến.',
        content: `Dạ, em hiểu băn khoăn của anh/chị. Thực ra lúc đầu nhiều khách bên em cũng nghĩ vậy. 

Nhưng nếu mình chia nhỏ giá ra theo m2 sử dụng và tiện ích đi kèm (hồ bơi, gym, an ninh 24/7) thì thực tế lại rất cạnh tranh. Hơn nữa, tiềm năng tăng giá khu này đang rất tốt nhờ [Tên_dự_án_hạ_tầng] sắp khởi công. 

Anh/chị có muốn em gửi bảng so sánh chi tiết với các dự án lân cận để mình có cái nhìn khách quan nhất không ạ?`,
        tags: ['giá cao', 'so sánh', 'thuyết phục']
    },
    {
        id: 'think-about-it',
        categoryId: 'objection',
        title: 'Khách nói "Để suy nghĩ thêm"',
        situation: 'Khách hàng chưa ra quyết định ngay, muốn trì hoãn.',
        content: `Dạ vâng, mua nhà là chuyện lớn nên mình cân nhắc kỹ là đúng ạ. 

Tuy nhiên, kinh nghiệm của em là thường có 3 vấn đề chính khiến mình còn lăn tăn: là về Giá, về Vị trí hay là về Pháp lý ạ? 

Em hỏi để có thể hỗ trợ giải đáp rõ hơn ngay bây giờ thôi ạ, chứ anh/chị chưa mua ngay cũng không sao đâu ạ, em muốn anh/chị chọn được căn ưng ý nhất.`,
        tags: ['trì hoãn', 'khai thác', 'tâm lý']
    },
    {
        id: 'cut-loss-verify',
        categoryId: 'objection',
        title: 'Xử lý nghi ngờ "Hàng ngộp giá ảo"',
        situation: 'Khách không tin giá rẻ là thật, sợ lừa đảo.',
        content: `Dạ em hiểu tâm lý này của anh/chị. Hiện tại thị trường đang thanh lọc mạnh nên mới có những "Deal" thực sự tốt như thế này. 

Lô này chủ cần tiền xử lý công việc gấp trong tuần nên mới chấp nhận bán dưới giá thị trường 20%. Em cam kết sổ hồng riêng, không tranh chấp, không quy hoạch. 

Anh/chị rảnh lúc nào em mời mình đi xem thực tế và kiểm tra pháp lý trực tiếp tại văn phòng công chứng luôn cho yên tâm ạ?`,
        tags: ['hàng ngộp', 'uy tín', 'cam kết']
    },
    {
        id: 'deposit-urging',
        categoryId: 'closing',
        title: 'Thúc giục đặt cọc (Scarcity)',
        situation: 'Khách đã ưng, nhưng còn chần chừ chưa xuống tiền.',
        content: `Anh/chị ơi, căn [Mã_căn] này hiện đang có 2 khách khác cũng đang quan tâm và hẹn xem lại trong hôm nay. 

Vì đây là căn góc/view đẹp nhất giỏ hàng, nếu anh/chị đã thực sự ưng rồi thì mình nên giữ chỗ thiện chí trước để ưu tiên quyền mua. 

Nếu trong vòng [Số_ngày] ngày anh chị đổi ý không mua nữa, bên em hoàn lại 100% tiền giữ chỗ mà không mất bất kỳ khoản phí nào. Mình cứ giữ chỗ để chắc chắn không mất căn đẹp anh chị ạ.`,
        tags: ['khan hiếm', 'giữ chỗ', 'gấp']
    },
    {
        id: 'close-now-bonus',
        categoryId: 'closing',
        title: 'Chốt bằng quà tặng/chiết khấu',
        situation: 'Khách cần thêm một chút động lực cuối cùng.',
        content: `Sếp ơi, em vừa xin được sếp bên em một suất ưu đãi đặc biệt: Nếu anh/chị chốt cọc trong ngày hôm nay, em sẽ tặng thêm [Gói_nội_thất/Vàng_SJC] trị giá [Số_tiền]. 

Đây là suất ngoại giao em dành riêng cho anh/chị vì thấy anh/chị rất thiện chí. Mình chốt sớm để nhận ngay lộc đầu năm này sếp nhé?`,
        tags: ['quà tặng', 'chiết khấu', 'đặc quyền']
    },
    {
        id: 'fomo-event',
        categoryId: 'followup',
        title: 'Mời đi sự kiện mở bán',
        situation: 'Mời khách cũ quay lại quan tâm dự án mới.',
        content: `Chào anh [Tên_khách], cuối tuần này bên em có sự kiện công bố giỏ hàng độc quyền view sông cực đẹp. 

Chỉ duy nhất đợt này có chính sách ưu đãi khủng: Chiết khấu lên đến 5% + tặng vàng SJC. Em mời anh ghé tham quan, cảm nhận không khí và xem thực tế dự án nhé. 

Chỉ cần mình có mặt check-in là đã có quà mang về rồi ạ! Em đăng ký cho mình một suất VIP nhé?`,
        tags: ['sự kiện', 'khuyến mãi', 'mời khách']
    },
    {
        id: 'update-infrastructure',
        categoryId: 'followup',
        title: 'Thông báo tin vui hạ tầng',
        situation: 'Gửi tin tức mới để khách thấy tiềm năng tăng giá.',
        content: `Anh [Tên_khách] ơi, sáng nay báo vừa đưa tin: Tuyến đường [Tên_đường] chạy qua dự án [Tên_dự_án] chính thức được phê duyệt tiến độ khởi công vào tháng sau rồi ạ! 

Đây là đòn bẩy cực lớn giúp giá BĐS khu này bùng nổ trong thời gian tới. Em nhắn để anh nắm thông tin kịp thời. Anh có muốn em cập nhật bảng giá mới nhất của các lô/căn xung quanh cho mình tham khảo không?`,
        tags: ['hạ tầng', 'tin tức', 'gia tăng giá trị']
    },
    {
        id: 'cold-zalo',
        categoryId: 'cold',
        title: 'Chào hỏi Zalo (Professional)',
        situation: 'Gửi lời chào kết bạn để khách accept.',
        content: `Em chào anh [Tên_khách], em là [Tên_sale] chuyên viên tư vấn BĐS tại khu vực [Khu_vực]. 

Em thấy anh có quan tâm đến dự án [Tên_dự_án] trên [Kênh_biết]. Em xin phép kết bạn để gửi anh các thông tin pháp lý chính thống và bảng giá cập nhật nhất để anh tham khảo cho tiện ạ. Chúc anh một ngày làm việc hiệu quả!`,
        tags: ['kết bạn', 'chào hỏi', 'zalo']
    },
    {
        id: 'legal-pink-book',
        categoryId: 'legal',
        title: 'Giải đáp về Sổ hồng/Pháp lý',
        situation: 'Khách lo lắng về việc khi nào có sổ.',
        content: `Dạ, về vấn đề pháp lý anh chị cứ hoàn toàn yên tâm. Dự án [Tên_dự_án] đã có đầy đủ Quy hoạch 1/500 và giấy phép xây dựng. 

Lộ trình ra sổ dự kiến là trong vòng [12-18] tháng kể từ ngày bàn giao. Bên em có cam kết rõ ràng trong hợp đồng, nếu chậm trễ sẽ chịu phạt lãi suất [Lãi_suất]% trên tổng giá trị. 

Em gửi anh chị xem bộ hồ sơ pháp lý hiện tại của dự án qua Zalo để mình check trước nhé?`,
        tags: ['sổ hồng', 'an toàn', 'pháp lý']
    }
];
