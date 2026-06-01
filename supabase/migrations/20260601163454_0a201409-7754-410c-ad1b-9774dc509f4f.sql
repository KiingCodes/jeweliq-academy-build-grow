REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM service_role;

REVOKE EXECUTE ON FUNCTION public.maybe_issue_certificate() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.maybe_issue_certificate() FROM anon;
REVOKE EXECUTE ON FUNCTION public.maybe_issue_certificate() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.maybe_issue_certificate() FROM service_role;

DROP POLICY IF EXISTS "Published courses are viewable" ON public.courses;
DROP POLICY IF EXISTS "Lessons viewable when course published" ON public.lessons;

CREATE POLICY "Published lessons are viewable"
ON public.lessons
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.courses c
    WHERE c.id = lessons.course_id
      AND c.is_published = true
  )
);

CREATE POLICY "Admins can view all lessons"
ON public.lessons
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));