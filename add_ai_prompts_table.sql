
-- 9. AI Prompts (Prompt Library)
CREATE TABLE IF NOT EXISTS public.ai_prompts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  category TEXT, -- 'enhance', 'creator', 'content'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for AI Prompts
ALTER TABLE public.ai_prompts ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view active prompts
DROP POLICY IF EXISTS "Everyone can view active prompts" ON public.ai_prompts;
CREATE POLICY "Everyone can view active prompts"
  ON public.ai_prompts FOR SELECT
  USING (is_active = true);

-- Policy: Only Admins can manage prompts
DROP POLICY IF EXISTS "Admins can manage ai prompts" ON public.ai_prompts;
CREATE POLICY "Admins can manage ai prompts"
  ON public.ai_prompts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Seed some default prompts if needed
INSERT INTO public.ai_prompts (name, prompt_text, category)
VALUES 
('Enhance Vision Default', 'Bạn là CHUYÊN GIA MARKETING BẤT ĐỘNG SẢN...', 'enhance_vision'),
('Enhance Edit Default', 'You are a professional real estate photo editor...', 'enhance_edit'),
('Image Creator Default', 'Bạn là một phóng viên ảnh bất động sản chuyên nghiệp...', 'image_creator')
ON CONFLICT DO NOTHING;
