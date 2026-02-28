# 🚀 Hướng Dẫn Deploy Edge Function `ai-proxy`

> **Ngày tạo:** 2026-02-28  
> **Trạng thái:** ✅ Đã deploy thành công

---

## Kiến Trúc

```
TRƯỚC (Không an toàn):
Browser → fetch("https://gemini.googleapis.com?key=AIza...")
                                                ↑ User thấy key trong DevTools

SAU (An toàn):
Browser → supabase.functions.invoke('ai-proxy') → Edge Function → Gemini/OpenAI
                                                        ↑
                                               Key = Supabase Secret (encrypted)
                                               User KHÔNG BAO GIỜ thấy key
```

---

## Các Bước Deploy (Đã Hoàn Thành)

### 1. Cài Supabase CLI
```bash
npm install -g supabase   # v2.76.15
```

### 2. Đăng nhập & Link Project
```bash
supabase login
supabase link --project-ref bqbywxhkifuwjutswsta
```

### 3. Set API Key Secrets
```bash
supabase secrets set GEMINI_API_KEY=<key>
supabase secrets set OPENAI_API_KEY=<key>   # Optional - khi cần
```

### 4. Deploy Edge Function
```bash
supabase functions deploy ai-proxy --no-verify-jwt
```

### 5. Verify
```bash
supabase functions list
# Kết quả: ai-proxy | ACTIVE | v1
```

---

## Files Liên Quan

| File | Vai trò |
|------|---------|
| `supabase/functions/ai-proxy/index.ts` | Edge Function server-side proxy |
| `src/services/aiProxy.ts` | Client wrapper (`geminiGenerate`, `openaiChat`) |
| `src/services/aiService.ts` | Đã refactor, gọi qua proxy thay vì trực tiếp |

---

## Khi Cần Re-deploy

```bash
# Sửa code trong supabase/functions/ai-proxy/index.ts
# Sau đó:
npx supabase functions deploy ai-proxy --no-verify-jwt
```

## Khi Cần Đổi API Key

```bash
npx supabase secrets set GEMINI_API_KEY=<new-key>
# Function tự động dùng key mới, không cần re-deploy
```

## Dashboard Monitoring

https://supabase.com/dashboard/project/bqbywxhkifuwjutswsta/functions
