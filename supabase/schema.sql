-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> Run

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  thumbnail_url text,
  hero_image_url text,
  body_html text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_settings (
  id int primary key default 1 check (id = 1),
  header_image_url text,
  heading text not null default 'Blog',
  description text not null default ''
);

insert into public.blog_settings (id) values (1) on conflict (id) do nothing;

alter table public.posts enable row level security;
alter table public.blog_settings enable row level security;

-- Visitors can read published posts only. Drafts are invisible to them.
create policy "public reads published posts"
  on public.posts for select
  using (status = 'published');

-- Only the admin account can read drafts, create, edit and delete posts.
create policy "admin manages posts"
  on public.posts for all
  to authenticated
  using (auth.jwt() ->> 'email' = 'vowsoflove.in@gmail.com')
  with check (auth.jwt() ->> 'email' = 'vowsoflove.in@gmail.com');

create policy "public reads blog settings"
  on public.blog_settings for select
  using (true);

create policy "admin edits blog settings"
  on public.blog_settings for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'vowsoflove.in@gmail.com')
  with check (auth.jwt() ->> 'email' = 'vowsoflove.in@gmail.com');
