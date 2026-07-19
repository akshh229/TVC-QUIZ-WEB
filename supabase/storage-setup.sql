-- supabase/storage-setup.sql
-- Storage bucket for Guess the Leader portraits.

insert into storage.buckets (id, name, public)
values ('leader-images', 'leader-images', true)
on conflict (id) do nothing;

-- Public read; anon upload/delete so the client-gated admin panel works.
drop policy if exists "leader_images_read" on storage.objects;
create policy "leader_images_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'leader-images');

drop policy if exists "leader_images_insert" on storage.objects;
create policy "leader_images_insert" on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'leader-images');

drop policy if exists "leader_images_update" on storage.objects;
create policy "leader_images_update" on storage.objects
  for update to anon, authenticated
  using (bucket_id = 'leader-images')
  with check (bucket_id = 'leader-images');

drop policy if exists "leader_images_delete" on storage.objects;
create policy "leader_images_delete" on storage.objects
  for delete to anon, authenticated
  using (bucket_id = 'leader-images');
