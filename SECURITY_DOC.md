# 🛡️ SECURITY_DOC.md - Hồ sơ Bảo mật Hệ thống

Tài liệu này ghi lại các biện pháp bảo mật đã được triển khai cho hệ thống MasterKit (Supabase + React).

---

## 🔒 1. Bảo vệ Tầng Dữ liệu (Supabase RLS)

Toàn bộ các bảng trong schema `public` đều được bật **Row Level Security (RLS)**.

### Quy tắc chung:
- **KHÔNG** cho phép truy cập ẩn danh (`anon`/`public`) vào các bảng nhạy cảm.
- Mọi truy cập dữ liệu cá nhân yêu cầu role `authenticated` (đã đăng nhập).
- Các dữ liệu quản trị yêu cầu quyền `admin` (kiểm tra qua cột `role` trong bảng `profiles`).

### Chi tiết các bảng nhạy cảm:
| Bảng | Quyền truy cập | Mô tả |
| :--- | :--- | :--- |
| `profiles` | `authenticated` | Người dùng chỉ xem/sửa profile của chính mình (`auth.uid() = id`). Admin xem được tất cả. |
| `api_keys` | `authenticated (Admin)` | Chỉ Admin mới có quyền SELECT/INSERT/UPDATE/DELETE. |
| `ai_prompts` | `authenticated (Admin)` | Chỉ Admin mới có quyền quản lý Prompt. Hệ thống lấy qua Service Key. |
| `sales_scripts` | `authenticated` | Phải đăng nhập mới được xem kịch bản bán hàng. |
| `api_logs` | `authenticated (Admin)` | Chỉ Admin mới được xem nhật ký cuộc gọi API. |

---

## 🛡️ 2. Chống Chiếm Quyền (Database Triggers)

Hệ thống sử dụng **Database Triggers** để ngăn chặn việc người dùng tự nâng cấp quyền hạn qua API/Console.

- **Trigger `on_profile_protect`**: 
    - Khi người dùng mới đăng ký (`INSERT`): Cột `role` luôn bị ép về `'user'`, `tier` về `'free'`.
    - Khi người dùng cập nhật thông tin (`UPDATE`): Không cho phép thay đổi các cột `role`, `tier`, `credits` từ phía Client. 
    - Chỉ có **Admin** hoặc **Service Role** (Backend/Dashboard) mới có quyền thay đổi các giá trị này.

---

## 🔑 3. Quản lý API Keys & AI Proxy

- **Bảo mật phía Client**: Ẩn toàn bộ API Keys của Gemini/OpenAI khỏi mã nguồn React.
- **AI Proxy (Edge Functions)**: Mọi yêu cầu xử lý AI phải đi qua Supabase Edge Function.
- **Service Key**: Proxy sử dụng `service_role` key để truy cập thông tin bảo mật (Prompts/Keys) một cách an toàn trên Server, không thông qua trình duyệt người dùng.

---

## 🚨 4. Lưu ý cho Nhà phát triển

1. **KHÔNG** bao giờ tắt RLS cho bất kỳ bảng nào trong `public`.
2. **KHÔNG** nhúng `SERVICE_ROLE_KEY` vào mã nguồn React (chỉ dùng trong Edge Functions hoặc script quản trị nội bộ).
3. Luôn sử dụng `auth.uid()` khi viết Policy để đảm bảo tính riêng tư của dữ liệu người dùng.

---
*Cập nhật lần cuối: 28/02/2026*
