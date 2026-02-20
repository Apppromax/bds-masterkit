# Image Studio Refactor Plan

## Goal
Tối ưu hóa và chuẩn hóa tính năng chỉnh sửa ảnh (Image Studio) để đạt mức độ chuyên nghiệp hơn về cả Kiến trúc, Giải pháp AI, và UI/UX.

## Tasks

### 1. Nâng cấp Thư viện Tối thiểu
- [ ] Cài đặt `react-hot-toast` để thay thế cho `alert(...)` mặc định.
- [ ] Cài đặt `react-dropzone` (tuỳ chọn) hoặc code Native HTML5 Drag and Drop để hỗ trợ thả file ảnh. (Quyết định: dùng custom drag/drop bằng HTML5/React cho nhẹ).

### 2. Tái cấu trúc (Refactoring) Code `src/pages/ImageStudio.tsx`
Tách các components đang phình to ra các file riêng biệt:
- [ ] `src/components/ImageStudio/QuickEditor.tsx`: Xử lý đóng dấu, layout (Canvas). Tích hợp Drag & Drop. Thêm các font đẹp.
- [ ] `src/components/ImageStudio/AiStudio.tsx`: Giao diện Enhance & Creator. Tích hợp Toast notification.
- [ ] `src/components/ImageStudio/BeforeAfterSlider.tsx`: Component kéo để xem trước/sau khi Enhance.

### 3. Tối ưu hoá AI & Image Handling (`src/services/aiService.ts`)
- [ ] **Image Compression**: Thêm hàm nén ảnh trước khi chuyển sang Base64 để gọi API (tránh lỗi payload too large).
- [ ] **JSON Schema Return**: Sửa đổi System Prompt trong hàm `analyzeImageWithGemini` để áp dụng cấu trúc trả về JSON rõ ràng (tránh việc parse chuỗi thủ công bị lỗi).

### 4. UI/UX "Pro Max"
- [ ] Bỏ `<select>` trong Creator Studio thay bằng các Custom Cards / Grid layout cực đẹp (ảnh minh hoạ hoặc grid icon).
- [ ] Tích hợp Toast notification cho các hoạt động: đang xử lý, lỗi AI, tải ảnh thành công.

## Tiến độ
- [x] Lập Plan
- [ ] Tiến hành Code
