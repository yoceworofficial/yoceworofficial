-- YOCEWOR production hardening: signup profile trigger + media storage policy.
-- Safe to run against the existing project; uses idempotent statements.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    nullif(lower(regexp_replace(coalesce(new.raw_user_meta_data->>'username',''), '[^a-z0-9_]', '', 'g')), ''),
    coalesce(nullif(new.raw_user_meta_data->>'display_name',''), split_part(new.email,'@',1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

update storage.buckets
set public = true,
    file_size_limit = 8388608,
    allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif']
where id = 'yocewor-media';

drop policy if exists "yocewor media public read" on storage.objects;
create policy "yocewor media public read"
on storage.objects for select
using (bucket_id = 'yocewor-media');

drop policy if exists "yocewor media user upload" on storage.objects;
create policy "yocewor media user upload"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'yocewor-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "yocewor media user delete" on storage.objects;
create policy "yocewor media user delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'yocewor-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists posts_user_created_at_idx on public.posts(user_id, created_at desc);
create index if not exists likes_post_idx on public.likes(post_id);
create index if not exists comments_post_created_idx on public.comments(post_id, created_at desc);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);
