# 🗄️ SQL Security Changes Log

> **Ngày thực hiện:** 2026-02-28  
> **Database:** Supabase PostgreSQL (`bqbywxhkifuwjutswsta`)

---

## SQL Đã Chạy Trên Production

### 1. Trigger Bảo Vệ Role & Tier

**File:** `security_fix_role_trigger.sql`  
**Mục đích:** Ngăn user tự đổi `role` (thành admin) hoặc `tier` (để tăng credit)

```sql
CREATE OR REPLACE FUNCTION public.protect_role_column()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'Bạn không có quyền thay đổi role.';
        END IF;
    END IF;
    
    IF OLD.tier IS DISTINCT FROM NEW.tier THEN
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        ) THEN
            RAISE EXCEPTION 'Bạn không có quyền thay đổi tier.';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_protect_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_role_column();
```

**Trạng thái:** ✅ Chạy thành công

---

### 2. RLS Policy Profile

**File:** `security_audit_fixes.sql`  
**Mục đích:** User chỉ xem được profile của chính mình

```sql
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);
```

**Trạng thái:** ✅ Đã tồn tại (confirm lại thành công)

---

### 3. Triggers Đã Có Sẵn (Không cần thêm)

| Trigger | Bảng | Chức năng |
|---------|------|-----------|
| `protect_credits_column` | `profiles` | Chặn user tự sửa credit |
| `deduct_credits_secure` | RPC | Trừ credit atomic server-side |
| `get_best_api_key` | RPC | Lấy API key (giờ chỉ Edge Function dùng) |

---

## Kiểm Tra Triggers Hiện Tại

```sql
-- Xem tất cả triggers trên bảng profiles
SELECT tgname, tgtype FROM pg_trigger 
WHERE tgrelid = 'profiles'::regclass;

-- Xem tất cả RLS policies
SELECT policyname, cmd, qual FROM pg_policies 
WHERE tablename = 'profiles';
```
