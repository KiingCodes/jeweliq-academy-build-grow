
-- Modules within a course
CREATE TABLE public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.modules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.modules TO authenticated;
GRANT ALL ON public.modules TO service_role;

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Modules public read" ON public.modules
  FOR SELECT USING (true);

CREATE POLICY "Admins manage modules" ON public.modules
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

-- Add module_id to lessons (nullable so existing lessons keep working)
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS module_id uuid REFERENCES public.modules(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_lessons_module ON public.lessons(module_id);
