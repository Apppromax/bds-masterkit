# Kế hoạch Triển khai BĐS MasterKit AI Super Assistant (Web App)

## Thông tin Dự án
- **Tên Dự án**: BĐS MasterKit AI Super Assistant
- **Mục tiêu**: Cung cấp bộ công cụ "All-in-One" cho Sale Bất động sản, bao gồm công cụ tạo nội dung, tính toán vay, phong thủy, và chỉnh sửa ảnh/AI nâng cao.
- **Đối tượng**: Sale BĐS, Nhà đầu tư, Người mua nhà tiềm năng.
- **Sản phẩm đầu ra**: Web App (Vite + React + Vanilla CSS) tối ưu hóa trải nghiệm người dùng (UX) và hiệu năng (Performance).

## Công nghệ Sử dụng
- **Core**: Vite, React (Single Page Application - SPA).
- **Styling**: Vanilla CSS (CSS Modules hoặc CSS-in-JS nếu cần thiết), không dùng TailwindCSS trừ khi yêu cầu (nhưng khuyến khích sử dụng Tailwind để custom nhanh hơn nếu muốn, hiện tại sẽ dùng Vanilla CSS theo tiêu chuẩn).
- **State Management**: React Context / Hooks.
- **Icons**: Phosphor Icons / Lucide React.
- **Fonts**: Google Fonts (Inter, Outfit).
- **Other Libs**: 
    - `html2canvas` (Xuất ảnh báo giá, ảnh phong thủy).
    - `chart.js` / `recharts` (Biểu đồ trả nợ).
    - `canvas-confetti` (Hiệu ứng chúc mừng).

## Lộ trình Triển khai

### Giai đoạn 1: Khởi tạo & Giao diện Cơ bản (Project Setup & Base UI)
- [ ] Khởi tạo dự án Vite + React.
- [ ] Thiết lập cấu trúc thư mục (components, content, assets, hooks, utils).
- [ ] Xây dựng Design System cơ bản:
    -   Color Palette (Brand Colors, Dark Mode colors).
    -   Typography Scale.
    -   Base Components (Button, Card, Input, Slider, Modal).
- [ ] Xây dựng Layout chính (Sidebar Navigation, Header, Main Content Area).

### Giai đoạn 2: Tính năng Miễn phí (Core Free Features)
#### 2.1. Nội dung Đăng tin (Content Idea Generator)
- [ ] Xây dựng UI Form: Kênh đăng, Thông tin BĐS (Diện tích, Giá, Vị trí...), Phong cách (Hài hước, Chuyên nghiệp...).
- [ ] Xây dựng Logic Template Engine: Hàm generate nội dung dựa trên input.
- [ ] Tính năng Copy to Clipboard.
- [ ] Lưu lịch sử tạo nội dung (Local Storage).

#### 2.2. Tính Lãi Vay (Loan Calculator)
- [ ] Xây dựng UI Slider Input (Số tiền, Thời gian).
- [ ] Xây dựng Logic tính PMT (Gốc + Lãi hàng tháng).
- [ ] Hiển thị Bảng chi tiết trả nợ (Table View) & Biểu đồ (Chart View).
- [ ] Tính năng "Xuất ảnh báo giá" (Export to Image) với Watermark Sale.

#### 2.3. Tra Cứu Hướng Nhà (Feng Shui Compass)
- [ ] Xây dựng Database Phong thủy (Bát trạch, Ngũ hành, Màu sắc).
- [ ] Xây dựng Form Tra cứu: Năm sinh, Giới tính -> Kết quả (Hướng tốt/xấu, Màu hợp).
- [ ] Hiển thị la bàn phong thủy trực quan (CSS/SVG Animation).
- [ ] Tính năng "Lưu khách hàng" (CRM Mini - Local Storage).

### Giai đoạn 3: Tính năng Trả phí & Nâng cao (Premium Features)
#### 3.1. Xử lý Ảnh & Watermark (Image Studio)
- [ ] Xây dựng Image Uploader (Multiple files).
- [ ] Xây dựng Canvas Editor:
    -   Thêm Frame/Khung ảnh (Overlay).
    -   Thêm thông tin BĐS tự động vào vị trí cố định.
    -   Thêm Logo/SĐT cá nhân (Watermark).
- [ ] Xây dựng Batch Process Logic: Áp dụng chỉnh sửa cho hàng loạt ảnh.

#### 3.2. AI Virtual Staging (Mockup / Integration Ready)
- [ ] Xây dựng giao diện chọn "Style nội thất" (Hiện đại, Cổ điển...).
- [ ] Tích hợp API (Placeholder): Chuẩn bị sẵn hàm gọi API (OpenAI DALL-E / Stability AI) để generate ảnh mới từ ảnh thô. *Lưu ý: Cần API Key thực tế để hoạt động*.
- [ ] Tính năng so sánh Before/After (Slider compare).

#### 3.3. Kịch bản Sales (Script Library)
- [ ] Xây dựng Database Kịch bản mẫu (JSON).
- [ ] Xây dựng Giao diện Tìm kiếm & Filter theo tình huống.
- [ ] Tính năng "Quick Send" qua Zalo/SMS (Deep Link Integration).

### Giai đoạn 4: Hoàn thiện & Optimisation
- [ ] Review UI/UX: Micro-interactions, Loading states, Error handling.
- [ ] Responsive Design: Kiểm tra trên Mobile View (quan trọng nhất cho Sale).
- [ ] SEO Basics: Title, Meta tags.
- [ ] Deployment Guide.

## Ghi chú
- Tất cả dữ liệu người dùng tạm thời sẽ được lưu ở `localStorage` để đảm bảo tính riêng tư và không cần Backend phức tạp ở giai đoạn 1.
- Giao diện sẽ ưu tiên Dark Mode / Glassmorphism để tạo cảm giác "Premium" và "Công nghệ".
