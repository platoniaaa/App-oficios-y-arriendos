-- ============================================================================
-- Storage: buckets + RLS policies para Cuadrilla
-- ============================================================================
-- Cómo aplicar:
--  1. Supabase Dashboard → tu proyecto → SQL Editor → New query
--  2. Pega todo este archivo
--  3. Click "Run"
--
-- Es idempotente: puedes correrlo varias veces sin problema.
-- ============================================================================

-- 1) Asegurar que los buckets existen
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars',   'avatars',   true,  5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('gallery',   'gallery',   true,  5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('tools',     'tools',     true,  5242880, array['image/jpeg','image/png','image/webp','image/gif']),
  ('documents', 'documents', false, 10485760, null)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2) RLS policies
-- Limpia las viejas (si existen) para que esto sea idempotente
drop policy if exists "avatars_public_read"  on storage.objects;
drop policy if exists "avatars_owner_write"  on storage.objects;
drop policy if exists "avatars_owner_update" on storage.objects;
drop policy if exists "avatars_owner_delete" on storage.objects;

drop policy if exists "gallery_public_read"  on storage.objects;
drop policy if exists "gallery_owner_write"  on storage.objects;
drop policy if exists "gallery_owner_update" on storage.objects;
drop policy if exists "gallery_owner_delete" on storage.objects;

drop policy if exists "tools_public_read"    on storage.objects;
drop policy if exists "tools_owner_write"    on storage.objects;
drop policy if exists "tools_owner_update"   on storage.objects;
drop policy if exists "tools_owner_delete"   on storage.objects;

drop policy if exists "documents_owner_all"  on storage.objects;

-- Buckets públicos: lectura para todos, escritura solo del dueño
-- avatars
create policy "avatars_public_read"  on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_owner_write"  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars_owner_update" on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatars_owner_delete" on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- gallery
create policy "gallery_public_read"  on storage.objects for select using (bucket_id = 'gallery');
create policy "gallery_owner_write"  on storage.objects for insert
  with check (bucket_id = 'gallery' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "gallery_owner_update" on storage.objects for update
  using (bucket_id = 'gallery' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "gallery_owner_delete" on storage.objects for delete
  using (bucket_id = 'gallery' and auth.uid()::text = (storage.foldername(name))[1]);

-- tools
create policy "tools_public_read"    on storage.objects for select using (bucket_id = 'tools');
create policy "tools_owner_write"    on storage.objects for insert
  with check (bucket_id = 'tools' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "tools_owner_update"   on storage.objects for update
  using (bucket_id = 'tools' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "tools_owner_delete"   on storage.objects for delete
  using (bucket_id = 'tools' and auth.uid()::text = (storage.foldername(name))[1]);

-- documents (privado, todo restringido al dueño)
create policy "documents_owner_all"  on storage.objects for all
  using       (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1])
  with check  (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);

-- 3) Verificación rápida (output del query)
select
  b.id as bucket,
  b.public,
  b.file_size_limit,
  (select count(*) from pg_policies p
     where p.schemaname = 'storage'
       and p.tablename  = 'objects'
       and p.policyname like b.id || '%') as policies_count
from storage.buckets b
where b.id in ('avatars','gallery','tools','documents')
order by b.id;
