-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query)

-- ============ contact_messages ============
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  created_at timestamptz not null default now(),
  read boolean not null default false
);

alter table public.contact_messages enable row level security;

-- No public policies are created on purpose: only the server, using the
-- service_role key, can read/write this table. The browser never talks
-- to Supabase directly for this table.

-- ============ projects ============
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  tags text[] default '{}',
  project_url text,
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

-- Projects are meant to be publicly readable (they power the "Mes projets
-- récents" section). If you'd rather keep this behind the Node API only
-- (as currently wired via the service_role key), you can skip this policy.
create policy "Public can read projects"
  on public.projects
  for select
  using (true);

-- Example seed data — replace with your real projects
insert into public.projects (title, description, tags, image_url) values
  ('Portfolio Personnel', 'Mon portfolio moderne et responsive.', array['HTML','CSS','JS'], null),
  ('Gestion de dépenses', 'Application de gestion de budget personnel.', array['HTML','CSS','JS'], null),
  ('Site Église', 'Site vitrine pour Worshipers Glory Ministry.', array['HTML','CSS','PHP'], null),
  ('OBS Streaming Setup', 'Configuration de scènes et diffusion en direct.', array['OBS'], null),
  ('Landing Page', 'Page d''atterrissage pour entreprise locale.', array['HTML','CSS','JS'], null)
on conflict do nothing;
