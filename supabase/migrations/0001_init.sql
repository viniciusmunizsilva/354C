-- 3D Room Gallery — initial schema, RLS and storage setup.
--
-- Access model for this build: OPEN (no auth). The brief requested an open,
-- login-free gallery with no personal data, so the RLS policies below grant
-- the `anon` role full access to its own app data. Every table still has RLS
-- ENABLED (never disabled), and the commented "PER-USER" policies at the end
-- are the drop-in replacement for when Supabase Auth is turned on later.

-- Needed for gen_random_uuid() on older projects (no-op if already present).
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users (id) on delete cascade,
  title               text not null check (char_length(title) between 1 and 160),
  description         text check (description is null or char_length(description) <= 4000),
  category            text not null,
  model_format        text not null check (model_format in ('obj', 'fbx')),
  model_storage_path  text not null,
  cover_storage_path  text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists projects_updated_at_idx on public.projects (updated_at desc);
create index if not exists projects_category_idx   on public.projects (category);
create index if not exists projects_user_id_idx     on public.projects (user_id);

-- ---------------------------------------------------------------------------
-- project_assets  (primary model + its dependencies: MTL, textures, cover)
-- ---------------------------------------------------------------------------
create table if not exists public.project_assets (
  id                 uuid primary key default gen_random_uuid(),
  project_id         uuid not null references public.projects (id) on delete cascade,
  user_id            uuid references auth.users (id) on delete cascade,
  storage_path       text not null,
  original_filename  text not null,
  asset_type         text not null check (asset_type in ('model', 'mtl', 'texture', 'cover')),
  content_type       text,
  file_size          bigint check (file_size is null or file_size >= 0),
  created_at         timestamptz not null default now(),
  unique (project_id, storage_path)
);

create index if not exists project_assets_project_id_idx on public.project_assets (project_id);
create index if not exists project_assets_user_id_idx    on public.project_assets (user_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.projects       enable row level security;
alter table public.project_assets enable row level security;

-- OPEN policies (current build, no auth) -----------------------------------
drop policy if exists projects_open_select on public.projects;
drop policy if exists projects_open_insert on public.projects;
drop policy if exists projects_open_update on public.projects;
drop policy if exists projects_open_delete on public.projects;

create policy projects_open_select on public.projects
  for select to anon, authenticated using (true);
create policy projects_open_insert on public.projects
  for insert to anon, authenticated with check (true);
create policy projects_open_update on public.projects
  for update to anon, authenticated using (true) with check (true);
create policy projects_open_delete on public.projects
  for delete to anon, authenticated using (true);

drop policy if exists project_assets_open_select on public.project_assets;
drop policy if exists project_assets_open_insert on public.project_assets;
drop policy if exists project_assets_open_update on public.project_assets;
drop policy if exists project_assets_open_delete on public.project_assets;

create policy project_assets_open_select on public.project_assets
  for select to anon, authenticated using (true);
create policy project_assets_open_insert on public.project_assets
  for insert to anon, authenticated with check (true);
create policy project_assets_open_update on public.project_assets
  for update to anon, authenticated using (true) with check (true);
create policy project_assets_open_delete on public.project_assets
  for delete to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- Storage bucket (private) + open policies
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit)
values ('models', 'models', false, 67108864)  -- 64 MiB per object
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

drop policy if exists models_open_select on storage.objects;
drop policy if exists models_open_insert on storage.objects;
drop policy if exists models_open_update on storage.objects;
drop policy if exists models_open_delete on storage.objects;

create policy models_open_select on storage.objects
  for select to anon, authenticated using (bucket_id = 'models');
create policy models_open_insert on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'models');
create policy models_open_update on storage.objects
  for update to anon, authenticated using (bucket_id = 'models') with check (bucket_id = 'models');
create policy models_open_delete on storage.objects
  for delete to anon, authenticated using (bucket_id = 'models');

-- ===========================================================================
-- PER-USER policies — enable these (and drop the OPEN ones above) once
-- Supabase Auth is turned on. Object keys are laid out as
--   <owner>/<project_id>/<model|deps|cover>/<file>
-- so the first path segment carries the owner id.
-- ===========================================================================
--
-- alter table public.projects       alter column user_id set not null;
-- alter table public.project_assets alter column user_id set not null;
--
-- create policy projects_owner_rw on public.projects
--   for all to authenticated
--   using (auth.uid() = user_id) with check (auth.uid() = user_id);
--
-- create policy project_assets_owner_rw on public.project_assets
--   for all to authenticated
--   using (auth.uid() = user_id) with check (auth.uid() = user_id);
--
-- create policy models_owner_rw on storage.objects
--   for all to authenticated
--   using (bucket_id = 'models' and (storage.foldername(name))[1] = auth.uid()::text)
--   with check (bucket_id = 'models' and (storage.foldername(name))[1] = auth.uid()::text);
