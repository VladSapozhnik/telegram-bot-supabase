-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id BIGINT PRIMARY KEY, -- Telegram user id
    first_name TEXT,
    last_name TEXT,
    username TEXT,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('client', 'bot')),
    text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_messages_created_at_desc ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_last_activity_at_desc ON public.clients(last_activity_at DESC);

-- Enable RLS (and allow full access to service_role / anon if needed, but functions will use SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow anon and service_role read/write for now
CREATE POLICY "Allow anon all on clients" ON public.clients FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role all on clients" ON public.clients FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon all on messages" ON public.messages FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow service_role all on messages" ON public.messages FOR ALL TO service_role USING (true) WITH CHECK (true);
