-- Create leads table for Mini CRM
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'Mới', -- 'Mới', 'Đang tư vấn', 'Đã xem nhà', 'Chốt', 'Hủy'
  notes TEXT,
  reminder_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can CRUD own leads" ON public.leads;
CREATE POLICY "Users can CRUD own leads"
  ON public.leads FOR ALL
  USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_reminder_at ON public.leads(reminder_at);
