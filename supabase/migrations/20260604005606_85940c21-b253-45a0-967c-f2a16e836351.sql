
-- Quiz publishing
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;

-- Quiz attempts (scoring)
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL,
  score int NOT NULL DEFAULT 0,
  total int NOT NULL DEFAULT 0,
  passed boolean NOT NULL DEFAULT false,
  answers jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.quiz_attempts TO authenticated;
GRANT ALL ON public.quiz_attempts TO service_role;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all attempts" ON public.quiz_attempts FOR SELECT TO authenticated USING (private.has_role(auth.uid(),'admin'::app_role));

-- Enrollment requests
CREATE TABLE IF NOT EXISTS public.enrollment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  email text NOT NULL,
  full_name text,
  course_id uuid,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.enrollment_requests TO anon, authenticated;
GRANT ALL ON public.enrollment_requests TO service_role;
ALTER TABLE public.enrollment_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can request" ON public.enrollment_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users view own requests" ON public.enrollment_requests FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);
CREATE POLICY "Admins manage requests" ON public.enrollment_requests FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (private.has_role(auth.uid(),'admin'::app_role));

-- Certificates: allow admins to insert/update/delete manually
CREATE POLICY "Admins manage certificates" ON public.certificates FOR ALL TO authenticated USING (private.has_role(auth.uid(),'admin'::app_role)) WITH CHECK (private.has_role(auth.uid(),'admin'::app_role));
