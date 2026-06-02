
CREATE POLICY "Lesson media readable" ON storage.objects FOR SELECT USING (bucket_id = 'lesson-media');
CREATE POLICY "Staff upload lesson media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'lesson-media' AND (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'instructor'::app_role))
);
CREATE POLICY "Staff update lesson media" ON storage.objects FOR UPDATE TO authenticated USING (
  bucket_id = 'lesson-media' AND (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'instructor'::app_role))
);
CREATE POLICY "Staff delete lesson media" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'lesson-media' AND (private.has_role(auth.uid(), 'admin'::app_role) OR private.has_role(auth.uid(), 'instructor'::app_role))
);
