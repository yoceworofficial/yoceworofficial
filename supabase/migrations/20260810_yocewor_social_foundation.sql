-- YOCEWOR social foundation
-- Review against the live Supabase schema before applying.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade
);
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists display_name text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists is_verified boolean not null default false;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();
create unique index if not exists profiles_username_unique_idx on public.profiles (lower(username)) where username is not null;
create index if not exists profiles_username_idx on public.profiles (lower(username));
alter table public.profiles enable row level security;

create or replace function public.yocewor_policy(p_table text,p_name text,p_command text,p_role text,p_using text,p_check text default null)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename=p_table and policyname=p_name) then
    execute format('create policy %I on public.%I as permissive for %s to %s using (%s)%s',p_name,p_table,p_command,p_role,p_using,case when p_check is null then '' else format(' with check (%s)',p_check) end);
  end if;
end $$;

select public.yocewor_policy('profiles','profiles public read','select','public','true');
select public.yocewor_policy('profiles','profiles own insert','insert','authenticated','auth.uid() = id','auth.uid() = id');
select public.yocewor_policy('profiles','profiles own update','update','authenticated','auth.uid() = id','auth.uid() = id');

alter table public.posts enable row level security;
select public.yocewor_policy('posts','posts authenticated read','select','authenticated','true');
select public.yocewor_policy('posts','posts own insert','insert','authenticated','auth.uid() = user_id','auth.uid() = user_id');
select public.yocewor_policy('posts','posts own update','update','authenticated','auth.uid() = user_id','auth.uid() = user_id');
select public.yocewor_policy('posts','posts own delete','delete','authenticated','auth.uid() = user_id');
create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_user_created_at_idx on public.posts (user_id, created_at desc);

create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id), check (follower_id <> following_id)
);
alter table public.follows enable row level security;
select public.yocewor_policy('follows','follows authenticated read','select','authenticated','true');
select public.yocewor_policy('follows','follows own insert','insert','authenticated','auth.uid() = follower_id','auth.uid() = follower_id');
select public.yocewor_policy('follows','follows own delete','delete','authenticated','auth.uid() = follower_id');
create index if not exists follows_following_idx on public.follows (following_id);

create table if not exists public.likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (post_id,user_id)
);
alter table public.likes enable row level security;
select public.yocewor_policy('likes','likes authenticated read','select','authenticated','true');
select public.yocewor_policy('likes','likes own insert','insert','authenticated','auth.uid() = user_id','auth.uid() = user_id');
select public.yocewor_policy('likes','likes own delete','delete','authenticated','auth.uid() = user_id');

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, body text not null check (char_length(body) between 1 and 2000), created_at timestamptz not null default now()
);
alter table public.comments enable row level security;
select public.yocewor_policy('comments','comments authenticated read','select','authenticated','true');
select public.yocewor_policy('comments','comments own insert','insert','authenticated','auth.uid() = user_id','auth.uid() = user_id');
select public.yocewor_policy('comments','comments own update','update','authenticated','auth.uid() = user_id','auth.uid() = user_id');
select public.yocewor_policy('comments','comments own delete','delete','authenticated','auth.uid() = user_id');
create index if not exists comments_post_created_idx on public.comments (post_id,created_at desc);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null, type text not null check (type in ('like','comment','follow','verification')),
  post_id uuid references public.posts(id) on delete cascade, read_at timestamptz, created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
select public.yocewor_policy('notifications','notifications own read','select','authenticated','auth.uid() = user_id');
select public.yocewor_policy('notifications','notifications own update','update','authenticated','auth.uid() = user_id','auth.uid() = user_id');
create index if not exists notifications_user_created_idx on public.notifications (user_id,created_at desc);

create table if not exists public.verification_subscriptions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active','cancelled','expired')),
  amount_inr integer not null default 75 check (amount_inr=75), provider text, provider_reference text,
  started_at timestamptz, expires_at timestamptz, created_at timestamptz not null default now()
);
alter table public.verification_subscriptions enable row level security;
select public.yocewor_policy('verification_subscriptions','verification own read','select','authenticated','auth.uid() = user_id');
create index if not exists verification_user_status_idx on public.verification_subscriptions (user_id,status);
revoke insert,update,delete on public.verification_subscriptions from anon,authenticated;

-- Browser clients can never self-award verification. A trusted payment webhook/service role must update profiles.is_verified.
drop function if exists public.yocewor_policy(text,text,text,text,text,text);
