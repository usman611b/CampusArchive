-- CampusArchive Resource Interaction System
-- Safe to run repeatedly. Existing resources, users, ratings, and comments are not deleted.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE public.resources
  ADD COLUMN IF NOT EXISTS comments_locked BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.resource_analytics
  ADD COLUMN IF NOT EXISTS rating_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.resource_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT resource_ratings_resource_user_unique UNIQUE (resource_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.resource_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.resource_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(btrim(content)) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES public.resource_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT comment_likes_comment_user_unique UNIQUE (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_resource_ratings_resource
  ON public.resource_ratings(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_comments_resource_created
  ON public.resource_comments(resource_id, created_at);
CREATE INDEX IF NOT EXISTS idx_resource_comments_parent
  ON public.resource_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment
  ON public.comment_likes(comment_id);

ALTER TABLE public.resource_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Resource Ratings" ON public.resource_ratings;
CREATE POLICY "Public Read Resource Ratings"
  ON public.resource_ratings FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Public Read Resource Comments" ON public.resource_comments;
CREATE POLICY "Public Read Resource Comments"
  ON public.resource_comments FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Public Read Comment Likes" ON public.comment_likes;
CREATE POLICY "Public Read Comment Likes"
  ON public.comment_likes FOR SELECT USING (TRUE);

-- Browser clients only read and subscribe. Express performs all writes with its service role.
GRANT SELECT ON public.resource_ratings, public.resource_comments, public.comment_likes TO anon, authenticated;
GRANT ALL ON public.resource_ratings, public.resource_comments, public.comment_likes TO service_role;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'resource_ratings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.resource_ratings;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'resource_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.resource_comments;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'comment_likes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comment_likes;
  END IF;
END $$;

-- Refresh existing aggregates so cards start with correct persisted values.
INSERT INTO public.resource_analytics (resource_id, rating_avg, rating_count, comments_count, updated_at)
SELECT
  r.id,
  COALESCE(rr.average_rating, 0),
  COALESCE(rr.rating_count, 0),
  COALESCE(rc.comments_count, 0),
  CURRENT_TIMESTAMP
FROM public.resources r
LEFT JOIN (
  SELECT resource_id, ROUND(AVG(rating)::numeric, 2) AS average_rating, COUNT(*)::integer AS rating_count
  FROM public.resource_ratings GROUP BY resource_id
) rr ON rr.resource_id = r.id
LEFT JOIN (
  SELECT resource_id, COUNT(*)::integer AS comments_count
  FROM public.resource_comments WHERE deleted_at IS NULL GROUP BY resource_id
) rc ON rc.resource_id = r.id
ON CONFLICT (resource_id) DO UPDATE SET
  rating_avg = EXCLUDED.rating_avg,
  rating_count = EXCLUDED.rating_count,
  comments_count = EXCLUDED.comments_count,
  updated_at = EXCLUDED.updated_at;

NOTIFY pgrst, 'reload schema';
