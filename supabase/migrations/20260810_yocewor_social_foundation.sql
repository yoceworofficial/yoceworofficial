-- YOCEWOR social foundation
-- Run in Supabase SQL editor after reviewing against the live project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  display_name text,
  bio text,
  avatar_url text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy if not exists "profiles public read" on public.profiles for select using (true);
create policy if not exists "profiles own insert" on public.profiles for insert with check (auth.uid() = id);
create policy if not exists "profiles own update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create index if not exists profiles_username_idx on public.profiles (lower(username));

alter table public.posts enable row level security;
create policy if not exists "posts authenticated read" on public.posts for select to authenticated using (true);
create policy if not exists "posts own insert" on public.posts for insert to authenticated with check (auth.uid() = user_id);
create policy if not exists "posts own update" on public.posts for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "posts own delete" on public.posts for delete to authenticated using (auth.uid() = user_id);
create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_user_created_at_idx on public.posts (user_id, created_at desc);

create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
alter table public.follows enable row level security;
create policy if not exists "follows authenticated read" on public.follows for select to authenticated using (true);
create policy if not exists "follows own insert" on public.follows for insert to authenticated with check (auth.uid() = follower_id);
create policy if not exists "follows own delete" on public.follows for delete to authenticated using (auth.uid() = follower_id);
create index if not exists follows_following_idx on public.follows (following_id);

create table if not exists public.likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);
alter table public.likes enable row level security;
create policy if not exists "likes authenticated read" on public.likes for select to authenticated using (true);
create policy if not exists "likes own insert" on public.likes for insert to authenticated with check (auth.uid() = user_id);
create policy if not exists "likes own delete" on public.likes for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
alter table public.comments enable row level security;
create policy if not exists "comments authenticated read" on public.comments for select to authenticated using (true);
create policy if not exists "comments own insert" on public.comments for insert to authenticated with check (auth.uid() = user_id);
create policy if not exists "comments own update" on public.comments for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy if not exists "comments own delete" on public.comments for delete to authenticated using (auth.uid() = user_id);
create index if not exists comments_post_created_idx on public.comments (post_id, created_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  type text not null check (type in ('like','comment','follow','verification')),
  post_id uuid references public.posts(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create policy if not exists "notifications own read" on public.notifications for select to authenticated using (auth.uid() = user_id);
create policy if not exists "notifications own update" on public.notifications for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);

create table if not exists public.verification_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active','cancelled','expired')),
  amount_inr integer not null default 75 check (amount_inr = 75),
  provider text,
  provider_reference text,
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.verification_subscriptions enable row level security;
create policy if not exists "verification own read" on public.verification_subscriptions for select to authenticated using (auth.uid() = user_id);
create index if not exists verification_user_status_idx on public.verification_subscriptions (user_id, status);

-- Never let a browser mark itself verified. The service role/payment webhook must do that securely.
revoke insert, update, delete on public.verification_subscriptions from anon, authenticated;
