-- Add the dedicated suspension state to databases created before the column
-- was added to the canonical schema. Safe to run repeatedly.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_users_is_suspended
  ON public.users (is_suspended);

-- Older schemas named the notification body `message`; the application uses
-- `description`. Preserve existing text and allow both schema generations to
-- converge without deleting notifications.
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS description TEXT;

DO $compat$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'notifications'
      AND column_name = 'message'
  ) THEN
    EXECUTE 'UPDATE public.notifications
             SET description = COALESCE(description, message)
             WHERE description IS NULL';
    EXECUTE 'ALTER TABLE public.notifications ALTER COLUMN message DROP NOT NULL';
  END IF;
END
$compat$;

UPDATE public.notifications
SET description = 'System notification'
WHERE description IS NULL;

ALTER TABLE public.notifications
  ALTER COLUMN description SET NOT NULL;

-- Some deployed databases predate the audit table. Creating it restores the
-- Admin Console audit view and keeps future privileged actions traceable.
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id VARCHAR(255),
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON public.audit_logs (created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

NOTIFY pgrst, 'reload schema';
