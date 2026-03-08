# Kế hoạch & Phân tích Phát triển Phiên bản Android

## 1. Tổng quan Hiện trạng (Current State)
Dự án hiện đang là một Web App xây dựng bằng:
- **Ngôn ngữ/Framework:** React (Vite), TypeScript
- **State/Data:** Supabase
- **Styling:** Tailwind CSS
- **Các tính năng phụ trợ:** Đã có plugin `vite-plugin-pwa` (thấy trong `package.json`), tức là ứng dụng đã hỗ trợ PWA (Progressive Web App).

## 2. Các phương án xây dựng App Android
Với nền tảng web React sẵn có, dưới đây là phân tích 3 hướng tiếp cận khả thi nhất để có phiên bản Android.

### Phương án A: Đóng gói PWA thành APK (TWA - Trusted Web Activity)
Biến chính Web App hiện tại (đã bật PWA) thành một file APK để có thể up lên Google Play Store. Công cụ thường dùng: **Bubblewrap** hoặc **PWABuilder**.
* **Ưu điểm:**
  * **Cực nhanh:** Gần như không mất thời gian code lại giao diện.
  * **Cập nhật realtime:** Không cần đẩy bản update lên Store khi sửa code (do nó load web trực tiếp).
  * **Chi phí siêu thấp:** Sử dụng lại 100% codebase hiện tại.
* **Nhược điểm:**
  * Phụ thuộc hoàn toàn vào tốc độ mạng (như web).
  * Khó tận dụng sâu phần cứng thiết bị (ví dụ: chạy ngầm thuần túy, truy cập module hệ thống như native).
  * Trải nghiệm ứng dụng phụ thuộc vào Engine trình duyệt của máy (Chrome).
* **Đánh giá & Nỗ lực:** Nên dùng nếu ưu tiên thời gian ra mắt (time-to-market). Nỗ lực: Rất thấp (1-3 ngày thiết lập).

### Phương án B: Sử dụng CapacitorJS (Web Wrapper)
Biến codebase React thuần hiện tại thành giao diện Native bằng CapacitorJS.
* **Ưu điểm:**
  * Giữ nguyên 95% codebase React, Tailwind, Supabase hiện có.
  * Hỗ trợ gọi các API Native của điện thoại (Camera, GPS, file system, Push Notifications) thông qua plugin của Capacitor.
  * Khả năng export chung mã nguồn ra cả iOS và Android dễ dàng.
* **Nhược điểm:**
  * Vẫn là môi trường Webview, performance (tốc độ render, cuộn trang...) đôi khi không mượt bằng Native 100%, nhưng ở năm 2026 thì rất khó nhận ra sự khác biệt với các app thông thường.
  * Cần cấu hình luồng UI phù hợp hơn với Mobile (Navigation trượt ngang thay vì load page).
* **Đánh giá & Nỗ lực:** Hướng đi **TỐI ƯU NHẤT** cho dự án ở thời điểm này. Vừa giữ được codebase vừa có app "xịn". Nỗ lực: Trung bình (1-2 tuần).

### Phương án C: Chuyển đổi mã nguồn sang React Native (Expo)
Sử dụng công nghệ React Native để viết App. React Native compile ra code native thực sự.
* **Ưu điểm:**
  * Trải nghiệm mượt mà 100% native (các hiệu ứng animation, vuốt trang, performance tối đa).
  * Cộng đồng lớn, tương thích sâu hệ điều hành.
* **Nhược điểm:**
  * **Phải đập đi xây lại giao diện:** React Native dùng `<View>`, `<Text>` chứ không dùng `<div>`, `<span>`, CSS thông thường.
  * Không dùng được Tailwind Web (phải chuyển sang NativeWind).
  * Tốn rất nhiều công sức.
* **Đánh giá & Nỗ lực:** Chỉ nên làm khi công ty muốn tách team làm app riêng, với yêu cầu trải nghiệm đỉnh cao tuyệt đối. Nỗ lực: Cực cao (1-3 tháng code lại toàn bộ front-end).

---

## 3. Khuyến nghị Kế hoạch Thực thi (Khuyên dùng: Phương án B - CapacitorJS)

Vì ứng dụng hiện tại phục vụ công tác Môi giới BĐS (với nhiều thao tác nội dung, form, và cần ảnh/camera), dùng **CapacitorJS** là một nước cờ khôn ngoan nhất để vừa giữ độ linh hoạt của Vite/React, vừa tạo ra được gói Native.

### Lộ trình 4 Giai đoạn:

#### Giai đoạn 1: Chuẩn bị & Cấu hình môi trường (1-2 ngày)
1. Cài đặt các thư viện cần thiết:
   ```bash
   npm install @capacitor/core @capacitor/android
   npm install -D @capacitor/cli
   npx cap init
   ```
2. Thư mục build trong Vite `dist` sẽ được trỏ cho Capacitor. Cấu hình `capacitor.config.ts`.
3. Add nền tảng Android:
   ```bash
   npx cap add android
   ```

#### Giai đoạn 2: Điều chỉnh UI/UX cho Mobile Screen (3-4 ngày)
Vì ứng dụng hiện tại đang là Web, khi chuyển qua App, chúng ta cần:
1. **Tinh chỉnh Layout:** Đảm bảo các bảng dữ liệu (như API Logs, Auth table) không bị tràn ngang trên màn hình dt.
2. **Safe Area (Tai thỏ/Notch):** Bổ sung CSS `padding-top: env(safe-area-inset-top)` để app không bị lẹm vào phần tai thỏ.
3. **Thay thế tương tác Web thành Mobile:** (Click thả chuột -> Chạm, vuốt).
4. Config phím ảo (Keyboard) trên điện thoại không che mất các input quan trọng.

#### Giai đoạn 3: Tích hợp Supabase & Native Plugin (3-5 ngày)
1. **Xử lý Supabase Auth:** Chỉnh sửa Auth callback URL. Trên web dùng link localhost/domain, còn trên Mobile phải dùng Deep Link (ví dụ: `apppromax://login-callback`).
2. **Camera & Hình ảnh:** Dùng plugin `@capacitor/camera` để mở camera trực tiếp khi user cần upload ảnh BDS hay lấy file base64 cho module Gemini Vision.
3. **Local Storage:** Thay thế `localStorage` trình duyệt bằng plugin Preferences của Capacitor để đảm bảo dữ liệu (Credits, Preferences) được mã hóa an toàn trên máy khách.

#### Giai đoạn 4: Đóng gói, Test & Release (2-3 ngày)
1. Cài đặt Android Studio.
2. Mở dự án Capacitor trên Android Studio để test Emulator / Device thật.
   ```bash
   npx cap open android
   ```
3. Generate file APK (dùng cho test nội bộ) và file AAB (Android App Bundle - để đẩy lên Play Store).
4. Tạo tài khoản Google Play Console và chuẩn bị ảnh Screenshot, Metadata quảng bá ứng dụng.

## 4. Tổng kết
Để đưa Web App lên Android, **CapacitorJS** là vũ khí nhanh, nguy hiểm và hiệu quả nhất cho stack React+Vite hiện nay. Nó giảm thiểu rủi ro code lại (như React Native) trong khi vẫn cung cấp khả năng chạm sâu vào thiết bị hơn hẳn (so với PWA). Đội ngũ sẽ chỉ tốn khoảng 2-3 tuần để tinh chỉnh UI và xuất bản một phiên bản hoàn chỉnh cho Sale BĐS mang đi chốt deal.
