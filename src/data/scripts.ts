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
    { id: 'all', name: 'Tất cả', icon: 'LayoutGrid' },
    { id: 'intro', name: 'Mở đầu (Cold Call)', icon: 'PhoneIncoming' },
    { id: 'objection', name: 'Xử lý Từ chối', icon: 'ShieldAlert' },
    { id: 'closing', name: 'Kỹ thuật Chốt Deal', icon: 'CheckCircle' },
    { id: 'psychology', name: 'Tâm lý & Thuyết phục', icon: 'Brain' },
    { id: 'followup', name: 'Chăm sóc (Follow-up)', icon: 'Clock' },
    { id: 'legal', name: 'Pháp lý & Quy hoạch', icon: 'FileText' },
];

export const SCRIPTS: ScriptItem[] = [
    // --- INTRO / COLD CALL ---
    {
        id: 'cold-open-10s',
        categoryId: 'intro',
        title: '10 Giây Vàng (Gây tò mò)',
        situation: 'Gọi cho data lạnh, cần giữ khách không dập máy ngay.',
        content: `Alo anh [Tên] ạ? Em là [Tên], gọi cho anh từ dự án [Tên_DA] đây ạ.

Em biết anh đang bận, em chỉ xin đúng 30 giây để chia sẻ một thông tin cực kỳ quan trọng về quy hoạch mới nhất tại khu vực [Vị_trí] mà có thể ảnh hưởng trực tiếp đến giá đất quanh đây. 

Thông tin này chỉ vừa mới được công bố sáng nay thôi. Anh có tiện nghe nhanh không ạ?`,
        tags: ['gây tò mò', 'cấp bách', 'lịch sự']
    },
    {
        id: 'cold-reference',
        categoryId: 'intro',
        title: 'Mượn danh người quen (Referral)',
        situation: 'Gọi cho khách được giới thiệu.',
        content: `Chào anh [Tên_khách], em là [Tên] đây ạ.

Em gọi cho anh là do anh [Tên_người_giới_thiệu] có nhắc đến anh, bảo là anh đang quan tâm tìm hiểu khu vực [Khu_vực] để đầu tư đường dài. 

Anh [Tên_người_GT] khen anh có gu đầu tư rất tinh tường nên bảo em phải gọi ngay cho anh để gửi thông tin lô góc 2 mặt tiền này trước khi bên em công bố ra thị trường.`,
        tags: ['người quen', 'khen ngợi', 'kết nối']
    },

    // --- OBJECTION HANDLING ---
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
        id: 'price-high-feel-felt-found',
        categoryId: 'objection',
        title: 'Công thức 3F (Feel - Felt - Found)',
        situation: 'Khách chê giá cao. Sử dụng chiến thuật Đồng cảm - Từng cảm thấy - Đã nhận ra.',
        content: `Dạ, em hoàn toàn hiểu cảm giác của anh/chị lúc này (Feel).

Thực ra tuần trước em cũng có một khách hàng là anh Nam ở Hà Nội, lúc đầu cũng y chang anh, thấy giá này "giật mình" so với mặt bằng chung (Felt).

Nhưng sau khi anh ấy trực tiếp xuống xem hạ tầng và phân tích kỹ về tiềm năng tăng giá khi đường Vành đai 4 thông xe vào năm sau, anh ấy đã nhận ra (Found) đây lại là mức giá "hời" nhất để bắt đáy lúc này.

Anh/chị có muốn em chỉ ra 3 điểm then chốt mà anh Nam đã nhìn thấy không ạ?`,
        tags: ['đồng cảm', '3F', 'thuyết phục']
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
        id: 'isolate-objection',
        categoryId: 'objection',
        title: 'Cô lập vấn đề (Isolate)',
        situation: 'Khách đưa ra nhiều lý do để từ chối.',
        content: `Ngoài vấn đề về Giá ra, thì anh/chị còn băn khoăn gì khác về Vị trí hay Pháp lý của dự án không ạ?

(Nếu khách nói "Không")

=> Dạ vậy nếu như em có thể giải quyết bài toán về Giá này hợp lý cho mình, ví dụ như xin giãn tiến độ thanh toán hoặc hỗ trợ vay ngân hàng ân hạn gốc lãi, thì anh/chị sẽ sẵn sàng sở hữu lô đất này ngay hôm nay chứ ạ?`,
        tags: ['cô lập', 'chốt thử', 'đàm phán']
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

    // --- CLOSING TECHNIQUES ---
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
        id: 'alternative-close',
        categoryId: 'closing',
        title: 'Chốt giả định (Câu hỏi lựa chọn)',
        situation: 'Đừng hỏi Có/Không. Hãy cho khách chọn A hoặc B.',
        content: `Vậy để tiện cho anh chị, thì sáng Thứ 7 hay chiều Chủ Nhật tuần này em qua đón mình đi xem thực tế dự án là tốt nhất ạ?

(Hoặc)

Về phương thức thanh toán, anh/chị muốn chọn gói thanh toán nhanh 95% để nhận chiết khấu 10% hay mình chọn gói thong thả thanh toán theo tiến độ 12 tháng ạ?`,
        tags: ['lựa chọn', 'thúc đẩy', 'dẫn dắt']
    },
    {
        id: 'ben-franklin-close',
        categoryId: 'closing',
        title: 'Chiến thuật Ben Franklin (Cân đo đong đếm)',
        situation: 'Khách do dự, liệt kê Ưu/Nhược điểm.',
        content: `Em thấy mình vẫn còn chút phân vân. Hay là thế này, mình cùng nhau liệt kê ra nhé.

Bên trái là những gì anh chị NHẬN ĐƯỢC: Vị trí độc tôn, Pháp lý an toàn, Chiết khấu 5% ngay hôm nay.
Bên phải là RỦI RO: ...Thực ra rủi ro lớn nhất là nếu mình không chốt hôm nay, ngày mai lô này có thể bị người khác cọc mất, và giá đợt sau chắc chắn sẽ tăng ít nhất 3-5%.

Vậy tính ra, cơ hội lớn hơn rủi ro rất nhiều đúng không ạ?`,
        tags: ['so sánh', 'logical', 'lý trí']
    },
    {
        id: 'silence-close',
        categoryId: 'closing',
        title: 'Quyền lực của sự im lặng',
        situation: 'Sau khi đưa ra giá và ưu đãi cuối cùng.',
        content: `(Sau khi trình bày xong mức giá 3.5 tỷ và chiết khấu 200 triệu)

Dạ, tổng số tiền mình cần thanh toán đợt 1 chỉ là 500 triệu thôi ạ.

(IM LẶNG TUYỆT ĐỐI - Đừng nói gì thêm. Người nói trước sẽ là người thua cuộc. Hãy để khách hàng tự suy nghĩ và lên tiếng).`,
        tags: ['tâm lý', 'im lặng', 'áp lực']
    },

    // --- PSYCHOLOGY ---
    {
        id: 'fomo-scarcity',
        categoryId: 'psychology',
        title: 'Tạo khan hiếm (FOMO)',
        situation: 'Khách thích nhưng cứ lần lữa.',
        content: `Anh ơi, em vừa check lại bảng hàng. Căn góc view hồ này hiện tại chỉ còn ĐÚNG 1 CĂN duy nhất thôi ạ.

Lúc nãy có bạn môi giới sàn bên kia vừa xin giữ chỗ căn này cho khách của bạn ấy. Nếu anh không quyết định giữ chỗ thiện chí (booking) ngay bây giờ, khả năng cao là chiều nay sẽ "bay" mất đấy ạ.

Booking có hoàn lại, mình cứ cọc giữ chỗ trước để em khóa căn lại cho anh, anh suy nghĩ thêm 1-2 hôm nếu không ưng em làm thủ tục hoàn tiền 100% cho anh trong 5 phút.`,
        tags: ['khan hiếm', 'cấp bách', 'giữ chỗ']
    },
    {
        id: 'storytelling-success',
        categoryId: 'psychology',
        title: 'Kể chuyện thành công (Storytelling)',
        situation: 'Truyền cảm hứng bằng câu chuyện thật.',
        content: `Cách đây 2 năm, em có tư vấn cho chú Hùng ở lô J24 dự án bên kia. Lúc đó chú cũng chê đất hoang vu, giá 15 triệu/m2 là đắt.

Em phải thuyết phục mãi chú mới mua ủng hộ 1 lô. 
Anh biết sao không? Vừa rồi đường cao tốc thông xe, giá lô đó giờ giao dịch 45 triệu/m2, chú Hùng bán chốt lời lãi gấp 3 lần luôn.

Hôm qua chú vừa gọi em mời cafe và bảo "Biết thế hồi đó chú nghe mày mua 2 lô". Cơ hội như vậy giờ đang lặp lại ở dự án này đây anh ạ.`,
        tags: ['kể chuyện', 'bằng chứng', 'lợi nhuận']
    },

    // --- FOLLOW UP ---
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
        id: 'birthday-wishes',
        categoryId: 'followup',
        title: 'Chúc mừng sinh nhật (Cá nhân hóa)',
        situation: 'Chăm sóc khách hàng nhân dịp đặc biệt.',
        content: `Chúc mừng sinh nhật anh [Tên]! 🎂

Em chúc anh tuổi mới luôn mạnh khỏe, hạnh phúc và gặt hái được nhiều thành công rực rỡ trong công việc đầu tư.
Cảm ơn anh đã luôn tin tưởng và đồng hành cùng em trong suốt thời gian qua.

P/s: Bên em đang có chính sách quà tặng sinh nhật đặc biệt giảm ngay 1% cho khách hàng có sinh nhật trong tháng này. Anh xem thử có căn nào ưng ý để em apply ưu đãi này luôn cho anh nhé!`,
        tags: ['tình cảm', 'quan tâm', 'quà tặng']
    },
    {
        id: 'market-update',
        categoryId: 'followup',
        title: 'Cập nhật thị trường (Chuyên gia)',
        situation: 'Gửi thông tin định kỳ để khách nhớ đến mình.',
        content: `Chào anh [Tên], 

Em gửi anh báo cáo nhanh về thị trường BĐS khu vực [Tên_khu_vực] Quý 1/2026:
- Lượng giao dịch tăng 20% so với cùng kỳ.
- Giá đất nền có xu hướng nhích nhẹ 5-7% do thông tin huyện sắp lên quận.
- Nguồn cung dự án mới đang khan hiếm.

Anh cần em phân tích sâu hơn về phân khúc nào thì nhắn em nhé. Chúc anh tuần mới năng lượng!`,
        tags: ['chuyên gia', 'thông tin', 'tin cậy']
    },

    // --- LEGAL ---
    {
        id: 'legal-pink-book',
        categoryId: 'legal',
        title: 'Giải đáp về Sổ hồng/Pháp lý',
        situation: 'Khách lo lắng về việc khi nào có sổ.',
        content: `Dạ, về vấn đề pháp lý anh chị cứ hoàn toàn yên tâm. Dự án [Tên_dự_án] đã có đầy đủ Quy hoạch 1/500 và giấy phép xây dựng. 

Lộ trình ra sổ dự kiến là trong vòng [12-18] tháng kể từ ngày bàn giao. Bên em có cam kết rõ ràng trong hợp đồng, nếu chậm trễ sẽ chịu phạt lãi suất [Lãi_suất]% trên tổng giá trị. 

Em gửi anh chị xem bộ hồ sơ pháp lý hiện tại của dự án qua Zalo để mình check trước nhé?`,
        tags: ['sổ hồng', 'an toàn', 'pháp lý']
    },
    // --- NEW SCRIPTS ---
    {
        id: 'wait-for-bottom',
        categoryId: 'objection',
        title: 'Khách chờ "đáy" thị trường',
        situation: 'Khách hàng nghĩ giá sẽ còn giảm thêm nữa.',
        content: `Dạ, em hiểu tâm lý chờ đợi của anh/chị. Tuy nhiên, thị trường BĐS không bao giờ có một "cái đáy" rõ ràng như sàn chứng khoán để mình bắt kịp đâu ạ. 

Thực tế là khi mọi người nhận ra đó là đáy thì giá đã nhích lên 5-10% rồi. Hiện tại thanh khoản đang bắt đầu quay lại, các chính sách gỡ khó của chính phủ đã có tác dụng. 

Đây chính là giai đoạn "vùng đáy" - thời điểm vàng để chọn được những căn đẹp nhất với giá gốc từ chủ đầu tư. Khi thị trường sôi động lại, những căn đẹp như này sẽ không còn dành cho người mua chậm chân đâu ạ. Anh/chị nghĩ sao nếu mình vào booking trước để giữ vị trí đẹp nhất?`,
        tags: ['bắt đáy', 'thị trường', 'cơ hội']
    },
    {
        id: 'location-too-far',
        categoryId: 'objection',
        title: 'Khách chê "Vị trí quá xa"',
        situation: 'Dự án ở vùng ven, khách ngại di chuyển.',
        content: `Dạ em đồng ý là hiện tại nhìn bản đồ thì thấy hơi xa trung tâm một chút. Nhưng anh/chị nhìn lại Phú Mỹ Hưng 20 năm trước hay Thủ Thiêm 10 năm trước cũng từng bị coi là xa và hẻo lánh ạ.

Bản chất của đầu tư BĐS là "mua sự kỳ vọng". Dự án này xa trung tâm hiện tại nhưng lại nằm đúng điểm rơi của Tuyến đường [Tên_đường] và Cầu [Tên_cầu] sắp khởi công. Khi hạ tầng kết nối xong, khoảng cách sẽ không còn tính bằng km mà tính bằng phút di chuyển.

Lúc đó giá sẽ không còn ở mức [Giá_hiện_tại] nữa đâu ạ. Mình mua lúc người ta còn sợ xa, bán lúc người ta thấy gần mới là cách đầu tư thông minh nhất anh/chị ạ.`,
        tags: ['vị trí', 'xa trung tâm', 'kỳ vọng']
    },
    {
        id: 'spouse-disagreement',
        categoryId: 'objection',
        title: 'Hỏi ý kiến vợ/chồng',
        situation: 'Khách dùng lý do gia đình để trì hoãn.',
        content: `Dạ tuyệt vời quá, việc lớn như mua nhà mà anh/chị bàn bạc kỹ với gia đình là rất chuẩn ạ. Tuy nhiên, em tin là anh/chị là người có tầm nhìn và hiểu rõ giá trị của căn này nhất lúc này.

Hay là thế này ạ, chiều mai em mời cả anh và chị cùng qua xem thực tế một lần nữa. Em sẽ chuẩn bị sẵn bản phân tích dòng tiền và tiềm năng để giải trình luôn cho chị nhà yên tâm. 

Anh cũng biết là căn này chỉ có một, nếu mình chần chừ thì khách khác cọc mất thì rất tiếc cho chị nhà. Mình cứ đặt cọc giữ chỗ thiện chí trước để giữ căn, tối về bàn bạc, nếu chị không ưng em hoàn lại tiền ngay ngày mai mà anh?`,
        tags: ['vợ chồng', 'gia đình', 'giữ căn']
    },
    {
        id: 'interest-rate-fear',
        categoryId: 'objection',
        title: 'Sợ lãi suất ngân hàng cao',
        situation: 'Khách ngại vay do biến động lãi suất.',
        content: `Dạ em hiểu nỗi lo này của anh/chị. Nhưng hiện tại các ngân hàng đang có gói vay cực kỳ ưu đãi cho dự án này: 0% lãi suất trong [18-24] tháng đầu tiên.

Điều đó có nghĩa là anh/chị có ít nhất 2 năm không phải lo lắng về lãi suất. Đến lúc đó, dự án đã bàn giao, giá trị BĐS đã gia tăng đáng kể so với hiện nay. Nếu anh/chị lo lắng lãi suất thả nổi sau này, mình có thể chọn phương án trả nợ trước hạn khi đến hạn hết ưu đãi lãi suất.

Tính ra, anh/chị dùng đòn bẩy ngân hàng để sở hữu tài sản giá trị lớn mà không mất chi phí vốn trong 2 năm. Đây là bài toán tài chính cực kỳ thông minh lúc này ạ.`,
        tags: ['lãi suất', 'ngân hàng', 'đòn bẩy']
    },
    {
        id: 'vip-cold-call',
        categoryId: 'intro',
        title: 'Mở đầu cho khách VIP (Data nóng)',
        situation: 'Khách có tầm vóc, cần cách tiếp cận đẳng cấp.',
        content: `Chào anh [Tên_VIP], em là [Tên] - Chuyên viên tư vấn cấp cao từ [Tên_Sàn].

Em gọi vì biết anh là một nhà đầu tư có khẩu vị đặc biệt với những bất động sản "Hàng Hiệu" và có giá trị khan hiếm cao. Hiện bên em đang có một suất ngoại giao duy nhất cho căn Penthouse/Lô góc 3 mặt tiền tại [Dự_án] - sản phẩm này chưa từng xuất hiện trên truyền thông.

Vì số lượng cực kỳ giới hạn, em muốn gửi thông tin sơ bộ qua Zalo để anh xem trước. Nếu anh thấy khớp với gu đầu tư của mình, em xin phép đặt một lịch hẹn 15 phút tại văn phòng của anh để trình bày chi tiết ạ?`,
        tags: ['khách VIP', 'đẳng cấp', 'ngoại giao']
    },
    {
        id: 'close-fear-loss',
        categoryId: 'closing',
        title: 'Chốt bằng nỗi sợ mất mát (Fear of Loss)',
        situation: 'Dùng đòn bẩy tâm lý mất cơ hội.',
        content: `Anh [Tên] ơi, em vừa nhận được tin sàn bên đối tác đã có khách đang check quy hoạch để vào cọc lô này.

Lô này vị trí đẹp nhất đường [Tên_đường], lại có giá rẻ hơn mặt bằng chung 150 triệu. Em thực sự không muốn anh bị hụt mất cơ hội tốt như vậy.

Hay là anh chuyển cọc thiện chí [Số_tiền] triệu ngay bây giờ để em báo sếp khóa bảng hàng lại luôn cho anh. Chỉ cần trễ 5 phút thôi là có thể mọi chuyện đã khác rồi ạ. Anh gửi em xin ảnh CMND/CCCD để em làm thủ tục ngay nhé?`,
        tags: ['mất mát', 'thúc giục', 'vào cọc']
    }
];
