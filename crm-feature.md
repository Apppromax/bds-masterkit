# Mini CRM Pro Feature

## Goal
Implement a lightweight CRM for real estate sales with AI-powered data extraction from screenshots and a reminder system integrated into the dashboard.

## Tasks
- [x] Task 1: Create `leads` table in Supabase → Verify: Table exists in DB.
- [x] Task 2: Implement `extractLeadFromImage` in `aiService.ts` → Verify: Function uses Gemini Vision API.
- [x] Task 3: Create `MiniCRM.tsx` page with Add/Manage tabs → Verify: UI matches Black & Bronze theme.
- [x] Task 4: Integrate AI scanning into `MiniCRM.tsx` → Verify: Uploading image populates Name/Phone fields.
- [x] Task 5: Add CRM to Navigation and Dashboard grid → Verify: Links work correctly.
- [x] Task 6: Update `LiveTicker.tsx` to show User Reminders → Verify: Upcoming reminders appear in scrolling text.

## Done When
- [x] Users can upload a Messenger screenshot and have info extracted.
- [x] Users can manage many leads with different statuses.
- [x] Dashboard shows scrolling "News Ticker" with personalized reminders.
- [x] UI/UX feels premium and consistent with the existing app.
