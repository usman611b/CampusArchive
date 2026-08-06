-- CampusArchive persistent contact/support inbox. Safe to run repeatedly.
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(254) NOT NULL,
  category VARCHAR(40) NOT NULL CHECK (category IN ('GENERAL','TECHNICAL','CONTENT_REPORT','COPYRIGHT','PARTNERSHIP','FEATURE_REQUEST','ACCOUNT_HELP')),
  subject VARCHAR(150) NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) BETWEEN 10 AND 3000),
  resource_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','IN_PROGRESS','RESOLVED','SPAM')),
  email_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (email_status IN ('PENDING','SENT','FAILED','NOT_CONFIGURED')),
  email_sent_at TIMESTAMPTZ,
  ip_hash VARCHAR(64) NOT NULL,
  user_agent VARCHAR(255),
  resolved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_status_created ON public.contact_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_requests_email ON public.contact_requests(email);
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.contact_requests FROM anon, authenticated;
GRANT ALL ON public.contact_requests TO service_role;
NOTIFY pgrst, 'reload schema';
