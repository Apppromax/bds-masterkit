
# Hướng Dẫn Sửa Lỗi Tính Năng AI

Hiện tại tính năng AI có thể không hoạt động do hệ thống chưa tìm thấy hàm lấy API Key trong cơ sở dữ liệu Supabase. Bạn vui lòng làm theo các bước sau để khắc phục:

## Bước 1: Chạy Script SQL sửa lỗi

1. Mở trang quản trị Supabase của dự án (https://supabase.com/dashboard/project/...).
2. Vào mục **SQL Editor** (biểu tượng trang giấy bút ở menu bên trái).
3. Nhấn **New Query**.
4. Copy toàn bộ nội dung file `fix_api_issue.sql` trong thư mục gốc của dự án.
5. Dán vào SQL Editor và nhấn **RUN** (nút màu xanh lá).

> **Lưu ý:** Script này sẽ tạo bảng `api_keys` (nếu chưa có) và quan trọng nhất là tạo hàm `get_best_api_key` giúp ứng dụng lấy được key một cách bảo mật.

## Bước 2: Thêm API Key vào hệ thống

Sau khi chạy script trên, bạn cần thêm ít nhất 1 API Key vào bảng `api_keys`.

1. Vẫn trong SQL Editor, chạy lệnh sau (thay thế bằng key thật của bạn):

```sql
INSERT INTO public.api_keys (provider, key_value, name, is_active)
VALUES 
('gemini', 'AIzaYourRealGeminiKeyHere...', 'Gemini Pro 1', true);
```

2. Hoặc nếu bạn đã xây dựng trang Admin Dashboard, hãy vào đó để thêm key.

## Bước 3: Kiểm tra lại

1. Quay lại ứng dụng, tải lại trang (F5).
2. Thử dùng tính năng "Tạo nội dung chiến lược" hoặc "Image Studio AI".
3. Nếu vẫn lỗi, hãy mở Console (F12) để xem thông báo chi tiết.

---

### Giải thích kỹ thuật

Lỗi "Không thể gọi AI" thường xuất hiện khi hàm `generateContentWithAI` trả về `null`. Điều này xảy ra khi:
1. Không có API Key nào trong database.
2. Hàm RPC `get_best_api_key` chưa được tạo (cần chạy script ở Bước 1).
3. Tài khoản của bạn không phải là Admin hoặc PRO (nhưng code đã xử lý trường hợp này).

Nếu bạn gặp khó khăn, vui lòng kiểm tra lại log trong Console của trình duyệt.
