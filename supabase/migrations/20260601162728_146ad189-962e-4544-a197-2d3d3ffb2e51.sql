-- Allow admins to manage enrollments for any user
CREATE POLICY "Admins manage enrollments"
ON public.enrollments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));