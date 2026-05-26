
-- Certificates
CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL,
  cert_code text NOT NULL UNIQUE DEFAULT upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Certificates publicly verifiable" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Users insert own certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Auto-issue trigger
CREATE OR REPLACE FUNCTION public.maybe_issue_certificate()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_course_id uuid;
  v_total int;
  v_done int;
BEGIN
  IF NEW.completed IS NOT TRUE THEN RETURN NEW; END IF;
  SELECT course_id INTO v_course_id FROM public.lessons WHERE id = NEW.lesson_id;
  IF v_course_id IS NULL THEN RETURN NEW; END IF;
  SELECT count(*) INTO v_total FROM public.lessons WHERE course_id = v_course_id;
  SELECT count(*) INTO v_done FROM public.lesson_progress lp
    JOIN public.lessons l ON l.id = lp.lesson_id
    WHERE lp.user_id = NEW.user_id AND l.course_id = v_course_id AND lp.completed;
  IF v_total > 0 AND v_done >= v_total THEN
    INSERT INTO public.certificates (user_id, course_id) VALUES (NEW.user_id, v_course_id)
    ON CONFLICT (user_id, course_id) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_issue_certificate
AFTER INSERT OR UPDATE ON public.lesson_progress
FOR EACH ROW EXECUTE FUNCTION public.maybe_issue_certificate();

-- Discussions
CREATE TABLE public.discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Discussions readable" ON public.discussions FOR SELECT USING (true);
CREATE POLICY "Users create discussions" ON public.discussions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own discussions" ON public.discussions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own discussions" ON public.discussions FOR DELETE USING (auth.uid() = user_id);

-- Comments
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  discussion_id uuid NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments readable" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Reactions
CREATE TABLE public.reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  discussion_id uuid NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  emoji text NOT NULL DEFAULT '❤️',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, discussion_id, emoji)
);
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reactions readable" ON public.reactions FOR SELECT USING (true);
CREATE POLICY "Users manage own reactions" ON public.reactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Announcements
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Announcements readable" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Admins manage announcements" ON public.announcements FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
