-- CampusArchive production security hardening
-- Safe to run repeatedly after schema.sql and the interaction migration.

-- Browser clients use the anon key only for Realtime invalidation events.
-- All application reads and writes otherwise pass through the Express API.
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

GRANT SELECT ON public.resource_ratings TO anon, authenticated;
GRANT SELECT ON public.resource_comments TO anon, authenticated;
GRANT SELECT ON public.comment_likes TO anon, authenticated;

-- RLS remains a second layer if table grants are changed later.
-- audit_logs was introduced after some existing CampusArchive databases were
-- created, so harden it only when it is present. The application already treats
-- audit logging as non-blocking on installations that do not have this table.
DO $security$
BEGIN
  IF to_regclass('public.audit_logs') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY';
  END IF;
END
$security$;

ALTER TABLE public.resource_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Resource Ratings" ON public.resource_ratings;
CREATE POLICY "Public Read Resource Ratings"
  ON public.resource_ratings FOR SELECT TO anon, authenticated USING (TRUE);

DROP POLICY IF EXISTS "Public Read Resource Comments" ON public.resource_comments;
CREATE POLICY "Public Read Resource Comments"
  ON public.resource_comments FOR SELECT TO anon, authenticated USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Public Read Comment Likes" ON public.comment_likes;
CREATE POLICY "Public Read Comment Likes"
  ON public.comment_likes FOR SELECT TO anon, authenticated USING (TRUE);

-- Resource files must only be delivered through short-lived signed URLs.
UPDATE storage.buckets
SET
  public = FALSE,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ]
WHERE id = 'academic_resources';

NOTIFY pgrst, 'reload schema';
