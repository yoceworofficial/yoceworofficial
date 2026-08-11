-- YOCEWOR FINAL MASTER AUTH HARDENING
-- Email verification is mandatory for profile creation and username claiming.
-- Unverified usernames live only in private pending metadata and never reserve public usernames.

create schema if not exists yocewor_private;

create table if not exists yocewor_private.signup_pending (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text,
  status text not null default 'pending' check (status in ('pending','conflict','claimed','expired')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '2 minutes'),
  updated_at timestamptz not null default now()
);
revoke all on schema yocewor_private from public, anon, authenticated;
revoke all on table yocewor_private.signup_pending from public, anon, authenticated;

create or replace function public.normalize_username(p_username text)
returns text language sql immutable set search_path = '' as $$
  select left(regexp_replace(replace(lower(coalesce(p_username, '')), ' ', '_'), '[^a-z0-9._]', '', 'g'), 30);
$$;
revoke all on function public.normalize_username(text) from public;
grant execute on function public.normalize_username(text) to anon, authenticated;

drop index if exists public.profiles_username_key;
drop index if exists public.profiles_username_unique_idx;
drop index if exists public.profiles_username_lower_unique;
create unique index if not exists profiles_verified_active_username_unique_idx
  on public.profiles (lower(trim(username)))
  where is_verified = true and account_status = 'active' and username is not null;
create index if not exists profiles_username_lookup_idx on public.profiles (lower(trim(username)));

drop policy if exists profiles_insert on public.profiles;
drop policy if exists profiles_select on public.profiles;
drop policy if exists profiles_update on public.profiles;
drop policy if exists "profiles public read" on public.profiles;
drop policy if exists "profiles public active read" on public.profiles;
drop policy if exists "profiles own read" on public.profiles;
drop policy if exists "profiles own insert" on public.profiles;
drop policy if exists "profiles own update" on public.profiles;
create policy "profiles public active read" on public.profiles for select to anon, authenticated
  using (is_verified = true and account_status = 'active');
create policy "profiles own read" on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "profiles own update" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create or replace function public.protect_profile_claim_fields()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  internal_claim boolean := current_setting('yocewor.internal_claim', true) = '1';
  jwt_role text := current_setting('request.jwt.claim.role', true);
begin
  if internal_claim or jwt_role = 'service_role' then return new; end if;
  if tg_op = 'INSERT' then
    raise exception 'Profile creation is available only after email verification' using errcode = '42501';
  end if;
  if new.username is distinct from old.username
     or new.is_verified is distinct from old.is_verified
     or new.account_status is distinct from old.account_status
     or new.verified_at is distinct from old.verified_at
     or new.verification_type is distinct from old.verification_type then
    new.username := old.username;
    new.is_verified := old.is_verified;
    new.account_status := old.account_status;
    new.verified_at := old.verified_at;
    new.verification_type := old.verification_type;
  end if;
  return new;
end;
$$;
drop trigger if exists protect_profile_claim_fields on public.profiles;
create trigger protect_profile_claim_fields before insert or update on public.profiles for each row execute function public.protect_profile_claim_fields();

create or replace function public.yocewor_claim_verified_username(p_user_id uuid, p_username text, p_display_name text default null)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_username text := public.normalize_username(p_username);
  v_email_confirmed_at timestamptz;
  v_existing_id uuid;
begin
  if p_user_id is null then return 'invalid_user'; end if;
  if char_length(v_username) < 3 or char_length(v_username) > 30 or v_username !~ '^[a-z0-9._]+$' then return 'invalid_username'; end if;
  select email_confirmed_at into v_email_confirmed_at from auth.users where id = p_user_id;
  if v_email_confirmed_at is null then return 'email_not_verified'; end if;
  select id into v_existing_id from public.profiles
    where lower(trim(username)) = lower(trim(v_username))
      and is_verified = true and account_status = 'active' and id <> p_user_id limit 1;
  if v_existing_id is not null then return 'taken'; end if;
  begin
    perform set_config('yocewor.internal_claim', '1', true);
    insert into public.profiles (id, username, display_name, is_verified, account_status, verified_at, verification_type)
    values (p_user_id, v_username, coalesce(nullif(trim(p_display_name), ''), v_username), true, 'active', now(), 'email')
    on conflict (id) do update set username = excluded.username,
      display_name = coalesce(nullif(excluded.display_name, ''), public.profiles.display_name),
      is_verified = true, account_status = 'active', verified_at = coalesce(public.profiles.verified_at, excluded.verified_at),
      verification_type = 'email', updated_at = now();
  exception when unique_violation then return 'taken';
  end;
  return 'ok';
end;
$$;
revoke all on function public.yocewor_claim_verified_username(uuid,text,text) from public;
grant execute on function public.yocewor_claim_verified_username(uuid,text,text) to service_role;

create or replace function public.claim_verified_username(p_username text, p_display_name text default null)
returns text language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := auth.uid(); v_result text;
begin
  if v_uid is null then return 'not_authenticated'; end if;
  v_result := public.yocewor_claim_verified_username(v_uid, p_username, p_display_name);
  if v_result = 'ok' then
    update yocewor_private.signup_pending set username = public.normalize_username(p_username), status = 'claimed', updated_at = now() where user_id = v_uid;
  end if;
  return v_result;
end;
$$;
revoke all on function public.claim_verified_username(text,text) from public;
grant execute on function public.claim_verified_username(text,text) to authenticated;

create or replace function public.check_username_available(p_username text)
returns table(normalized text, available boolean) language sql security definer set search_path = '' as $$
  select public.normalize_username(p_username), not exists (
    select 1 from public.profiles p where lower(trim(p.username)) = lower(trim(public.normalize_username(p_username)))
      and p.is_verified = true and p.account_status = 'active'
  );
$$;
revoke all on function public.check_username_available(text) from public;
grant execute on function public.check_username_available(text) to anon, authenticated;

create or replace function public.touch_pending_signup(p_email text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update yocewor_private.signup_pending s
  set expires_at = now() + interval '2 minutes', status = 'pending', updated_at = now()
  from auth.users u
  where u.id = s.user_id and lower(u.email) = lower(trim(p_email)) and u.email_confirmed_at is null;
end;
$$;
revoke all on function public.touch_pending_signup(text) from public;
grant execute on function public.touch_pending_signup(text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_username text := public.normalize_username(new.raw_user_meta_data->>'username');
  v_display_name text := nullif(trim(new.raw_user_meta_data->>'display_name'), '');
  v_result text;
begin
  if new.email_confirmed_at is not null then
    if coalesce(new.raw_app_meta_data->>'provider','') = 'email' then
      raise exception 'Email verification is required before the account can be activated' using errcode = 'P0001';
    end if;
    perform set_config('yocewor.internal_claim', '1', true);
    v_result := public.yocewor_claim_verified_username(new.id, v_username, v_display_name);
    if v_result = 'invalid_username' then
      raise exception 'Invalid username. Use 3-30 characters: a-z, 0-9, dot or underscore.' using errcode = '22023';
    end if;
    return new;
  end if;
  if char_length(v_username) < 3 or char_length(v_username) > 30 or v_username !~ '^[a-z0-9._]+$' then
    raise exception 'Invalid username. Use 3-30 characters: a-z, 0-9, dot or underscore.' using errcode = '22023';
  end if;
  insert into yocewor_private.signup_pending(user_id, username, display_name, status, expires_at)
  values (new.id, v_username, v_display_name, 'pending', now() + interval '2 minutes')
  on conflict (user_id) do update set username = excluded.username, display_name = excluded.display_name,
    status = 'pending', expires_at = excluded.expires_at, updated_at = now();
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.enforce_signup_verification_window()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_expires_at timestamptz;
begin
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    select expires_at into v_expires_at from yocewor_private.signup_pending where user_id = new.id;
    if v_expires_at is null or v_expires_at < now() then
      new.email_confirmed_at := null; new.confirmed_at := null;
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists enforce_signup_verification_window on auth.users;
create trigger enforce_signup_verification_window before update of email_confirmed_at on auth.users for each row execute function public.enforce_signup_verification_window();

create or replace function public.handle_confirmed_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_username text; v_display_name text; v_result text;
begin
  if old.email_confirmed_at is null and new.email_confirmed_at is not null then
    select username, display_name into v_username, v_display_name from yocewor_private.signup_pending where user_id = new.id;
    if v_username is not null then
      v_result := public.yocewor_claim_verified_username(new.id, v_username, v_display_name);
      if v_result = 'taken' then
        update yocewor_private.signup_pending set status = 'conflict', updated_at = now() where user_id = new.id;
      elsif v_result = 'ok' then
        delete from yocewor_private.signup_pending where user_id = new.id;
      end if;
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed after update of email_confirmed_at on auth.users for each row execute function public.handle_confirmed_user();

update yocewor_private.signup_pending set status = 'expired', updated_at = now() where expires_at < now() and status = 'pending';
comment on table yocewor_private.signup_pending is 'Private pending signup metadata. Never used as a username reservation.';
comment on index public.profiles_verified_active_username_unique_idx is 'Case-insensitive username uniqueness for verified active profiles only.';
