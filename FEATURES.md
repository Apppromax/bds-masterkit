# Tài Liệu Tính Năng Ứng Dụng (App BĐS MasterKit)

> 🚀 **Slogan**: Trợ thủ đắc lực cho Môi giới Bất động sản chuyên nghiệp.

Tài liệu này tổng hợp toàn bộ các tính năng hiện có trong ứng dụng, được cập nhật theo phiên bản mới nhất (Tháng 3/2026).

---

## 1. Tính Năng Cốt Lõi

Dành cho tất cả người dùng (Sử dụng hệ thống Xu - Credits).

### 🤖 Chốt Sale Hộ Bạn (Sales Hooks AI)
AI phân tích tình huống khách hàng và gợi ý cách xử lý chốt sale.
- **Thẻ Kỹ Năng**: Phá băng, Hẹn xem, Chốt cọc, Xử lý từ chối.
- **Soạn tin nhắn**: AI tự động chuyển kịch bản thành đoạn chat Zalo/Facebook mượt mà.
- **Quản trị**: Kịch bản (Hooks) được Admin quản trị động trên hệ thống.

### 👥 CRM Mini (Quản Lý Khách Hàng)
Quản lý danh sách khách hàng tinh gọn, hiệu quả.
- **Phễu trạng thái**: Mới, Đang tư vấn, Đã xem nhà, Chốt, Hủy.
- **Thao tác nhanh**: Gọi điện, Zalo trực tiếp từ danh sách.

### 🧮 Tính Lãi Suất Vay (Loan Calculator)
Công cụ tính toán tài chính giúp khách hàng hình dung phương án trả nợ.
- **2 Phương thức**: Dư nợ giảm dần, Dư nợ cố định (EMI).
- **Lịch trả nợ**: Chi tiết 12 tháng đầu tiền gốc/lãi.

### 💼 Quản Lý Kho Dự Án (Projects)
Sổ tay điện tử lưu trữ danh sách hàng hóa của môi giới.

### 🌓 Lịch Âm Dương & Phong Thủy (Thước Lỗ Ban)
Tra cứu ngày tốt xấu, giờ hoàng đạo chuẩn xác, thước Lỗ Ban đo cửa/ban thờ.

---

## 2. Tính Năng AI Cao Cấp (Dùng Xu) 👑

### ✍️ AI Content Creator (Siêu Trí Tuệ Viết Bài)
Tự động viết bài đăng bán nhà đất chuẩn SEO chỉ trong 1 click.
- **Tùy biến**: Đối tượng (Khách mua ở / Đầu tư), Kênh (Facebook / Zalo).
- **Kết quả**: 3 phương án nội dung, chèn sẵn Emoji, Tên và SĐT môi giới.

### 🎨 Pro Photo Studio (Ảnh Sale & Bất Động Sản)
Công cụ đỉnh cao giúp tạo thương hiệu cá nhân uy tín.
- **Ảnh Profile Chuyên Nghiệp**: AI biến ảnh selfie thường thành ảnh doanh nhân mặc vest, background văn phòng thực tế, ánh sáng chuẩn studio không bị "giả trân".
- **Ghép Ảnh Dự Án (Composite)**: AI ghép ảnh Khách/Sale đứng trước dự án. Tự động nhận diện ánh sáng, phối cảnh (perspective), đổ bóng để tạo ra bức ảnh như chụp thực tế tại công trường.
- **Studio 3D Toàn Thân**: AI tái tạo tư thế 3D trọn vẹn (Ngồi sofa, Cầm tài liệu, Giao tiếp...) kết hợp với bối cảnh thực tế sang trọng, giúp tạo ra bộ nhận diện thương hiệu doanh nhân hoàn hảo.

### 🪄 Quick Editor (Chỉnh Sửa Nhanh)
- Dán Sticker (HOT, Đã chốt), Watermark, Tên/SĐT lên ảnh nhanh chóng.

---

## 3. Quản Trị Hệ Thống (Admin Dashboard) 🛡️

Dashboard toàn diện gồm 6 Tabs mạnh mẽ:
1. **Tổng quan**: Thống kê Nạp Xu, Sử dụng, Top AI Models.
2. **Người dùng & Credits**: Quản lý accounts, Nạp/Trừ Xu thủ công, Xem lịch sử (Credit Logs).
3. **Doanh thu & Giao dịch**: Theo dõi chi phí thật API so với doanh thu.
4. **Cài đặt Hệ thống**: Cấu hình mô hình AI, Prompt gốc (Profile/Composite), UI/UX config.
5. **AI & API Keys**: Quản lý nhiều Pool API Keys (Auto-rotation), Logs API chi tiết, Auto-retry.
6. **Sales Hooks (CMS)**: Quản lý thư viện kịch bản Chốt Sale.

---

## 4. Hệ Sinh Thái & Bảo Mật

- **Hệ thống Xu (Credits)**: Mọi thao tác AI trả phí bằng Xu (Pay-as-you-go). Tránh thất thoát. Tặng 25 Xu khi đăng ký.
- **Hoàn Xu Tự Động (Auto Refund)**: Nếu API AI bị lỗi/timeout hoặc "Quá nhiều yêu cầu", hệ thống tự động hoàn lại số Xu đã trừ của người dùng kèm thông báo rõ ràng.
- **Bảo Mật Cơ Sở Dữ Liệu**:
    - Supabase Row Level Security (RLS) bảo vệ từng User.
    - SQL RPC (Remote Procedure Call) chạy ẩn danh (Security Definer) đảm bảo User không bao giờ tự "hack" được số Xu.
- **Performance**: Lazy loading, Retry/Exponential Backoff cho API, chống Double-click cho mọi nút bấm Submit.

---

> *Tài liệu cập nhật mới nhất: 15/03/2026*
