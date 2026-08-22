-- Fix email verification claim flow.
-- Email verification must activate the profile without inventing an unsupported verification_type.
-- Also allow the internal claim operation to pass the verification protection trigger.

create or replace function public.lock_verification_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  role_name text := current_setting('request.jwt.claim.role', true);
  internal_claim boolean := current_setting('yocewor.internal_claim', true) = '1';
begin
  if internal_claim or coalesce(role_name,'') = 'service_role' then return new; end if;
  if tg_op = 'INSERT' then
    if coalesce(new.is_verified,false) then
      new.is_verified := false;
      new.verified_at := null;
      new.verification_type := null;
    end if;
    return new;
  end if;
  if coalesce(new.is_verified,false) <> coalesce(old.is_verified,false)
     or new.verified_at is distinct from old.verified_at
     or new.verification_type is distinct from old.verification_type then
    new.is_verified := old.is_verified;
    new.verified_at := old.verified_at;
    new.verification_type := old.verification_type;
  end if;
  return new;
end;
$$;

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
    values (p_user_id, v_username, coalesce(nullif(trim(p_display_name), ''), v_username), true, 'active', now(), 'personal')
    on conflict (id) do update set username = excluded.username,
      display_name = coalesce(nullif(excluded.display_name, ''), public.profiles.display_name),
      is_verified = true, account_status = 'active', verified_at = coalesce(public.profiles.verified_at, excluded.verified_at),
      verification_type = coalesce(public.profiles.verification_type, excluded.verification_type), updated_at = now();
  exception when unique_violation then return 'taken';
  end;
  return 'ok';
end;
$$;
revoke all on function public.yocewor_claim_verified_username(uuid,text,text) from public;
grant execute on function public.yocewor_claim_verified_username(uuid,text,text) to service_role;
