-- =============================================================================
-- Cuadrilla — schema inicial
-- Pegar en SQL Editor de Supabase y ejecutar (Run).
-- Idempotente: se puede correr varias veces sin romper nada.
-- =============================================================================

-- Extensiones
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- =============================================================================
-- 1. PROFILES — extiende auth.users de Supabase
-- =============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tipo text not null default 'persona' check (tipo in ('persona','empresa')),
  nombre text not null,
  apellido text,
  razon_social text,
  giro text,
  rut text unique,
  telefono text,
  email text,
  foto_perfil text,
  region text,
  comuna text,
  direccion text,
  bio text,
  roles text[] default array['cliente']::text[],
  verif_rut text default 'pendiente' check (verif_rut in ('pendiente','validada','rechazada','no_aplica')),
  verif_cedula text default 'pendiente' check (verif_cedula in ('pendiente','validada','rechazada','no_aplica')),
  verif_antecedentes text default 'no_aplica' check (verif_antecedentes in ('pendiente','validada','rechazada','no_aplica')),
  verif_certificaciones text default 'no_aplica' check (verif_certificaciones in ('pendiente','validada','rechazada','no_aplica')),
  calificacion_promedio numeric(3,2) default 0,
  total_resenas int default 0,
  idiomas text[],
  respuesta_promedio_hrs numeric,
  tasa_respuesta numeric,
  tasa_cumplimiento numeric,
  tasa_puntualidad numeric,
  tasa_recomendacion numeric,
  total_trabajos_completados int default 0,
  total_arriendos_completados int default 0,
  representante_legal text,
  faq jsonb,
  nuevo_en_plataforma boolean default true,
  fecha_registro timestamptz default now()
);
create index if not exists profiles_comuna_idx on public.profiles(comuna);
create index if not exists profiles_roles_idx on public.profiles using gin (roles);

-- Trigger: cuando se crea un usuario en auth.users, crear su profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre','Usuario nuevo'), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =============================================================================
-- 2. SERVICIOS_OFICIOS
-- =============================================================================
create table if not exists public.servicios_oficios (
  id uuid primary key default gen_random_uuid(),
  trabajador_id uuid not null references public.profiles(id) on delete cascade,
  oficio text not null,
  categorias text[] default '{}'::text[],
  descripcion text,
  experiencia_anios int,
  tarifa_tipo text check (tarifa_tipo in ('hora','dia','visita','a_convenir')),
  tarifa_monto int,
  zonas_cobertura text[] default '{}'::text[],
  disponibilidad text default 'agendada' check (disponibilidad in ('inmediata','agendada','ocupado')),
  galeria_trabajos text[] default '{}'::text[],
  total_trabajos_realizados int default 0,
  calificacion numeric(3,2) default 0,
  faq jsonb,
  vistas int default 0,
  estado text default 'activo' check (estado in ('activo','pausado','eliminado')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists servicios_trabajador_idx on public.servicios_oficios(trabajador_id);
create index if not exists servicios_oficio_idx on public.servicios_oficios(oficio);
create index if not exists servicios_estado_idx on public.servicios_oficios(estado);

-- =============================================================================
-- 3. HERRAMIENTAS
-- =============================================================================
create table if not exists public.herramientas (
  id uuid primary key default gen_random_uuid(),
  propietario_id uuid not null references public.profiles(id) on delete cascade,
  titulo text not null,
  categoria text not null,
  subcategoria text,
  marca text,
  modelo text,
  descripcion text,
  fotos text[] default '{}'::text[],
  estado_fisico text check (estado_fisico in ('nueva','buena','aceptable')),
  tarifa_hora int,
  tarifa_dia int,
  tarifa_semana int,
  deposito_garantia int default 0,
  requiere_entrega boolean default false,
  comuna_ubicacion text,
  retiro text default 'ambos' check (retiro in ('domicilio_propietario','delivery','ambos')),
  disponibilidad jsonb default '[]'::jsonb,
  total_arriendos int default 0,
  calificacion numeric(3,2) default 0,
  estado_operacional text default 'disponible' check (estado_operacional in ('disponible','arrendada','mantenimiento','pausada')),
  vistas int default 0,
  estado text default 'activo' check (estado in ('activo','pausado','eliminado')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists herramientas_propietario_idx on public.herramientas(propietario_id);
create index if not exists herramientas_categoria_idx on public.herramientas(categoria);
create index if not exists herramientas_comuna_idx on public.herramientas(comuna_ubicacion);
create index if not exists herramientas_estado_idx on public.herramientas(estado);

-- =============================================================================
-- 4. CERTIFICACIONES de servicios
-- =============================================================================
create table if not exists public.certificaciones (
  id uuid primary key default gen_random_uuid(),
  servicio_id uuid not null references public.servicios_oficios(id) on delete cascade,
  nombre text not null,
  institucion text,
  anio int,
  archivo text,
  estado text default 'pendiente' check (estado in ('pendiente','validada','rechazada','no_aplica'))
);

-- =============================================================================
-- 5. CONTRATACIONES
-- =============================================================================
create table if not exists public.contrataciones (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('servicio','arriendo')),
  cliente_id uuid not null references public.profiles(id),
  ofertante_id uuid not null references public.profiles(id),
  servicio_id uuid references public.servicios_oficios(id),
  herramienta_id uuid references public.herramientas(id),
  fecha_solicitud timestamptz default now(),
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  monto int not null,
  comision int not null default 0,
  deposito int default 0,
  total int not null,
  estado text not null default 'solicitada' check (estado in (
    'solicitada','cotizada','aceptada_cliente','pago_en_escrow','en_ejecucion',
    'finalizada_pendiente_aprobacion','liberado','cancelada','en_disputa'
  )),
  descripcion_trabajo text,
  notas text,
  adjuntos jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists contrataciones_cliente_idx on public.contrataciones(cliente_id);
create index if not exists contrataciones_ofertante_idx on public.contrataciones(ofertante_id);
create index if not exists contrataciones_estado_idx on public.contrataciones(estado);

create table if not exists public.contratacion_historial (
  id uuid primary key default gen_random_uuid(),
  contratacion_id uuid not null references public.contrataciones(id) on delete cascade,
  estado text not null,
  fecha timestamptz default now()
);

-- =============================================================================
-- 6. RESENAS
-- =============================================================================
create table if not exists public.resenas (
  id uuid primary key default gen_random_uuid(),
  contratacion_id uuid not null references public.contrataciones(id),
  autor_id uuid not null references public.profiles(id),
  destino_id uuid not null references public.profiles(id),
  estrellas int not null check (estrellas between 1 and 5),
  sub_puntualidad int check (sub_puntualidad between 1 and 5),
  sub_calidad int check (sub_calidad between 1 and 5),
  sub_comunicacion int check (sub_comunicacion between 1 and 5),
  sub_precio int check (sub_precio between 1 and 5),
  sub_estado_entrega int check (sub_estado_entrega between 1 and 5),
  comentario text,
  recomienda boolean default true,
  utiles int default 0,
  respuesta text,
  respuesta_fecha timestamptz,
  created_at timestamptz default now()
);
create index if not exists resenas_destino_idx on public.resenas(destino_id);
create index if not exists resenas_autor_idx on public.resenas(autor_id);

create table if not exists public.resenas_utiles (
  id uuid primary key default gen_random_uuid(),
  resena_id uuid not null references public.resenas(id) on delete cascade,
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  unique (resena_id, usuario_id)
);

-- =============================================================================
-- 7. CONVERSACIONES + MENSAJES (chat 1:1)
-- =============================================================================
create table if not exists public.conversaciones (
  id uuid primary key default gen_random_uuid(),
  participante_a uuid not null references public.profiles(id),
  participante_b uuid not null references public.profiles(id),
  contratacion_id uuid references public.contrataciones(id),
  ultimo_mensaje text,
  ultimo_mensaje_fecha timestamptz,
  no_leidos_a int default 0,
  no_leidos_b int default 0,
  created_at timestamptz default now(),
  check (participante_a <> participante_b)
);
create index if not exists conv_part_a_idx on public.conversaciones(participante_a);
create index if not exists conv_part_b_idx on public.conversaciones(participante_b);

create table if not exists public.mensajes_chat (
  id uuid primary key default gen_random_uuid(),
  conversacion_id uuid not null references public.conversaciones(id) on delete cascade,
  emisor_id uuid not null references public.profiles(id),
  texto text not null,
  adjuntos jsonb,
  fecha timestamptz default now(),
  leido boolean default false
);
create index if not exists mensajes_conv_idx on public.mensajes_chat(conversacion_id, fecha);

-- =============================================================================
-- 8. NOTIFICACIONES
-- =============================================================================
create table if not exists public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null,
  titulo text not null,
  texto text,
  link text,
  fecha timestamptz default now(),
  leida boolean default false
);
create index if not exists notif_usuario_idx on public.notificaciones(usuario_id, leida, fecha desc);

-- =============================================================================
-- 9. AGENDA — horarios + bloqueos
-- =============================================================================
create table if not exists public.horarios_laborales (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  dia text not null check (dia in ('lun','mar','mie','jue','vie','sab','dom')),
  abierto boolean default true,
  desde time,
  hasta time,
  unique (usuario_id, dia)
);

create table if not exists public.bloqueos_calendario (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  herramienta_id uuid references public.herramientas(id) on delete cascade,
  desde date not null,
  hasta date not null,
  motivo text
);

-- =============================================================================
-- 10. MOVIMIENTOS FINANCIEROS
-- =============================================================================
create table if not exists public.movimientos_financieros (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.profiles(id) on delete cascade,
  fecha timestamptz default now(),
  tipo text not null check (tipo in ('ingreso','retiro','comision','deposito_entrada','deposito_liberado')),
  monto int not null,
  contratacion_id uuid references public.contrataciones(id),
  descripcion text,
  estado text default 'liquidado' check (estado in ('liquidado','en_escrow','procesando'))
);
create index if not exists mov_usuario_idx on public.movimientos_financieros(usuario_id, fecha desc);

-- =============================================================================
-- 11. CHATBOT — historial de conversaciones con IA
-- =============================================================================
create table if not exists public.chatbot_conversaciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references public.profiles(id) on delete cascade,
  titulo text default 'Nueva conversación',
  created_at timestamptz default now()
);

create table if not exists public.chatbot_mensajes (
  id uuid primary key default gen_random_uuid(),
  conversacion_id uuid not null references public.chatbot_conversaciones(id) on delete cascade,
  rol text not null check (rol in ('user','bot')),
  texto text not null,
  componentes jsonb,
  fecha timestamptz default now()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.servicios_oficios enable row level security;
alter table public.herramientas enable row level security;
alter table public.certificaciones enable row level security;
alter table public.contrataciones enable row level security;
alter table public.contratacion_historial enable row level security;
alter table public.resenas enable row level security;
alter table public.resenas_utiles enable row level security;
alter table public.conversaciones enable row level security;
alter table public.mensajes_chat enable row level security;
alter table public.notificaciones enable row level security;
alter table public.horarios_laborales enable row level security;
alter table public.bloqueos_calendario enable row level security;
alter table public.movimientos_financieros enable row level security;
alter table public.chatbot_conversaciones enable row level security;
alter table public.chatbot_mensajes enable row level security;

-- Helper: drop policies si existen (idempotencia)
do $$
declare r record;
begin
  for r in select schemaname, tablename, policyname from pg_policies where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- PROFILES — todos pueden ver, solo el dueño edita
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- SERVICIOS — todos pueden ver activos, solo dueño edita
create policy "servicios_select_all" on public.servicios_oficios for select using (estado = 'activo' or trabajador_id = auth.uid());
create policy "servicios_insert_own" on public.servicios_oficios for insert with check (auth.uid() = trabajador_id);
create policy "servicios_update_own" on public.servicios_oficios for update using (auth.uid() = trabajador_id);
create policy "servicios_delete_own" on public.servicios_oficios for delete using (auth.uid() = trabajador_id);

-- HERRAMIENTAS — idem
create policy "herr_select_all" on public.herramientas for select using (estado = 'activo' or propietario_id = auth.uid());
create policy "herr_insert_own" on public.herramientas for insert with check (auth.uid() = propietario_id);
create policy "herr_update_own" on public.herramientas for update using (auth.uid() = propietario_id);
create policy "herr_delete_own" on public.herramientas for delete using (auth.uid() = propietario_id);

-- CERTIFICACIONES — visibles si el servicio lo es; solo dueño edita
create policy "cert_select_all" on public.certificaciones for select using (true);
create policy "cert_insert_own" on public.certificaciones for insert with check (
  exists (select 1 from public.servicios_oficios s where s.id = servicio_id and s.trabajador_id = auth.uid())
);
create policy "cert_update_own" on public.certificaciones for update using (
  exists (select 1 from public.servicios_oficios s where s.id = servicio_id and s.trabajador_id = auth.uid())
);

-- CONTRATACIONES — solo cliente y ofertante
create policy "contr_select_parties" on public.contrataciones for select using (
  auth.uid() = cliente_id or auth.uid() = ofertante_id
);
create policy "contr_insert_cliente" on public.contrataciones for insert with check (auth.uid() = cliente_id);
create policy "contr_update_parties" on public.contrataciones for update using (
  auth.uid() = cliente_id or auth.uid() = ofertante_id
);

-- HISTORIAL — solo partes involucradas
create policy "hist_select_parties" on public.contratacion_historial for select using (
  exists (select 1 from public.contrataciones c where c.id = contratacion_id and (c.cliente_id = auth.uid() or c.ofertante_id = auth.uid()))
);
create policy "hist_insert_parties" on public.contratacion_historial for insert with check (
  exists (select 1 from public.contrataciones c where c.id = contratacion_id and (c.cliente_id = auth.uid() or c.ofertante_id = auth.uid()))
);

-- RESENAS — todos ven, solo autor crea sobre contratación propia
create policy "resenas_select_all" on public.resenas for select using (true);
create policy "resenas_insert_autor" on public.resenas for insert with check (
  auth.uid() = autor_id and exists (
    select 1 from public.contrataciones c
    where c.id = contratacion_id and (c.cliente_id = auth.uid() or c.ofertante_id = auth.uid())
  )
);
create policy "resenas_update_autor" on public.resenas for update using (auth.uid() = autor_id);
-- destino_id puede agregar respuesta
create policy "resenas_respuesta_destino" on public.resenas for update using (auth.uid() = destino_id) with check (auth.uid() = destino_id);

-- RESENAS_UTILES — cualquiera puede marcar útil; solo el dueño quitar
create policy "utiles_select_all" on public.resenas_utiles for select using (true);
create policy "utiles_insert_own" on public.resenas_utiles for insert with check (auth.uid() = usuario_id);
create policy "utiles_delete_own" on public.resenas_utiles for delete using (auth.uid() = usuario_id);

-- CONVERSACIONES — solo participantes
create policy "conv_select_parties" on public.conversaciones for select using (
  auth.uid() = participante_a or auth.uid() = participante_b
);
create policy "conv_insert_parties" on public.conversaciones for insert with check (
  auth.uid() = participante_a or auth.uid() = participante_b
);
create policy "conv_update_parties" on public.conversaciones for update using (
  auth.uid() = participante_a or auth.uid() = participante_b
);

-- MENSAJES — solo participantes de la conversación
create policy "msg_select_parties" on public.mensajes_chat for select using (
  exists (select 1 from public.conversaciones c where c.id = conversacion_id and (c.participante_a = auth.uid() or c.participante_b = auth.uid()))
);
create policy "msg_insert_emisor" on public.mensajes_chat for insert with check (
  auth.uid() = emisor_id and exists (
    select 1 from public.conversaciones c where c.id = conversacion_id and (c.participante_a = auth.uid() or c.participante_b = auth.uid())
  )
);
create policy "msg_update_parties" on public.mensajes_chat for update using (
  exists (select 1 from public.conversaciones c where c.id = conversacion_id and (c.participante_a = auth.uid() or c.participante_b = auth.uid()))
);

-- NOTIFICACIONES — solo dueño
create policy "notif_select_own" on public.notificaciones for select using (auth.uid() = usuario_id);
create policy "notif_update_own" on public.notificaciones for update using (auth.uid() = usuario_id);
create policy "notif_insert_own" on public.notificaciones for insert with check (auth.uid() = usuario_id);

-- HORARIOS / BLOQUEOS — solo dueño
create policy "horarios_all_own" on public.horarios_laborales for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);
create policy "bloqueos_all_own" on public.bloqueos_calendario for all using (auth.uid() = usuario_id) with check (auth.uid() = usuario_id);

-- MOVIMIENTOS FINANCIEROS — solo dueño
create policy "mov_select_own" on public.movimientos_financieros for select using (auth.uid() = usuario_id);
create policy "mov_insert_own" on public.movimientos_financieros for insert with check (auth.uid() = usuario_id);

-- CHATBOT — solo dueño
create policy "bot_conv_all_own" on public.chatbot_conversaciones for all using (auth.uid() = usuario_id or usuario_id is null) with check (auth.uid() = usuario_id or usuario_id is null);
create policy "bot_msg_all_parties" on public.chatbot_mensajes for all using (
  exists (select 1 from public.chatbot_conversaciones c where c.id = conversacion_id and (c.usuario_id = auth.uid() or c.usuario_id is null))
);

-- =============================================================================
-- STORAGE BUCKETS (avatars, gallery, tools, documents)
-- =============================================================================
insert into storage.buckets (id, name, public)
values
  ('avatars',   'avatars',   true),
  ('gallery',   'gallery',   true),
  ('tools',     'tools',     true),
  ('documents', 'documents', false)
on conflict (id) do nothing;

-- Storage policies — avatars/gallery/tools son lectura pública
do $$
begin
  -- avatars
  drop policy if exists "avatars_public_read" on storage.objects;
  create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');
  drop policy if exists "avatars_owner_write" on storage.objects;
  create policy "avatars_owner_write" on storage.objects for insert
    with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
  drop policy if exists "avatars_owner_update" on storage.objects;
  create policy "avatars_owner_update" on storage.objects for update
    using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

  -- gallery
  drop policy if exists "gallery_public_read" on storage.objects;
  create policy "gallery_public_read" on storage.objects for select using (bucket_id = 'gallery');
  drop policy if exists "gallery_owner_write" on storage.objects;
  create policy "gallery_owner_write" on storage.objects for insert
    with check (bucket_id = 'gallery' and auth.uid()::text = (storage.foldername(name))[1]);

  -- tools
  drop policy if exists "tools_public_read" on storage.objects;
  create policy "tools_public_read" on storage.objects for select using (bucket_id = 'tools');
  drop policy if exists "tools_owner_write" on storage.objects;
  create policy "tools_owner_write" on storage.objects for insert
    with check (bucket_id = 'tools' and auth.uid()::text = (storage.foldername(name))[1]);

  -- documents — privado, solo dueño
  drop policy if exists "documents_owner_all" on storage.objects;
  create policy "documents_owner_all" on storage.objects for all
    using (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1])
    with check (bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]);
end $$;

-- =============================================================================
-- UPDATED_AT TRIGGER (genérico)
-- =============================================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tr_servicios_updated on public.servicios_oficios;
create trigger tr_servicios_updated before update on public.servicios_oficios
for each row execute function public.touch_updated_at();

drop trigger if exists tr_herramientas_updated on public.herramientas;
create trigger tr_herramientas_updated before update on public.herramientas
for each row execute function public.touch_updated_at();

drop trigger if exists tr_contrataciones_updated on public.contrataciones;
create trigger tr_contrataciones_updated before update on public.contrataciones
for each row execute function public.touch_updated_at();

-- =============================================================================
-- LISTO. Schema, RLS, storage y triggers creados.
-- =============================================================================
