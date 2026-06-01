CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT USAGE ON SCHEMA private TO service_role;
REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO service_role;

DROP POLICY IF EXISTS "Admins manage announcements" ON public.announcements;
CREATE POLICY "Admins manage announcements"
ON public.announcements
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage courses" ON public.courses;
CREATE POLICY "Admins manage courses"
ON public.courses
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage enrollments" ON public.enrollments;
CREATE POLICY "Admins manage enrollments"
ON public.enrollments
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins manage lessons" ON public.lessons;
CREATE POLICY "Admins manage lessons"
ON public.lessons
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can view all lessons" ON public.lessons;
CREATE POLICY "Admins can view all lessons"
ON public.lessons
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Instructors manage quizzes" ON public.quizzes;
CREATE POLICY "Instructors manage quizzes"
ON public.quizzes
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'instructor'::public.app_role) OR private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'instructor'::public.app_role) OR private.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM service_role;