-- ============================================================================
-- Triggers automáticos para Cuadrilla
-- ============================================================================
-- Cómo aplicar:
--  Supabase Dashboard → SQL Editor → New query → pega todo → Run
-- Es idempotente.
-- ============================================================================

-- =========================================================================
-- 1. Notificación al crear una contratación
--    Se dispara en INSERT y notifica al "ofertante" (trabajador o arrendador)
-- =========================================================================

create or replace function public.notify_on_new_contratacion()
returns trigger
language plpgsql
security definer
as $$
declare
  v_titulo text;
  v_texto text;
  v_link text := '/panel/contratacion/' || new.id;
begin
  if new.tipo = 'servicio' then
    v_titulo := 'Nueva solicitud de servicio';
    v_texto := 'Un cliente quiere contratarte. Revísalo y envía una cotización.';
  else
    v_titulo := 'Nueva solicitud de arriendo';
    v_texto := 'Alguien quiere arrendar tu herramienta. Revisa los detalles.';
  end if;

  insert into public.notificaciones (usuario_id, tipo, titulo, texto, link)
  values (new.ofertante_id, 'nueva_solicitud', v_titulo, v_texto, v_link);

  return new;
end $$;

drop trigger if exists trg_notify_new_contratacion on public.contrataciones;
create trigger trg_notify_new_contratacion
after insert on public.contrataciones
for each row execute function public.notify_on_new_contratacion();


-- =========================================================================
-- 2. Notificación al cambiar el estado de una contratación
--    Notifica a la contraparte (no al que hizo el cambio)
-- =========================================================================

create or replace function public.notify_on_estado_change()
returns trigger
language plpgsql
security definer
as $$
declare
  v_destinatario uuid;
  v_titulo text;
  v_texto text;
  v_tipo text := 'recordatorio';
  v_link text := '/panel/contratacion/' || new.id;
begin
  if new.estado is null or old.estado = new.estado then
    return new;
  end if;

  case new.estado
    when 'cotizada' then
      v_destinatario := new.cliente_id;
      v_titulo := 'Cotización recibida';
      v_texto := 'El profesional te envió una cotización.';
      v_tipo := 'nueva_solicitud';
    when 'aceptada_cliente' then
      v_destinatario := new.ofertante_id;
      v_titulo := 'Cliente aceptó la cotización';
      v_texto := 'Está esperando que confirmes y comiences el trabajo.';
    when 'pago_en_escrow' then
      v_destinatario := new.ofertante_id;
      v_titulo := 'Pago en escrow';
      v_texto := 'El cliente realizó el pago. Puedes comenzar el trabajo.';
      v_tipo := 'pago_liberado';
    when 'en_ejecucion' then
      v_destinatario := new.cliente_id;
      v_titulo := 'Trabajo en ejecución';
      v_texto := 'El profesional comenzó tu trabajo.';
    when 'finalizada_pendiente_aprobacion' then
      v_destinatario := new.cliente_id;
      v_titulo := 'Trabajo finalizado';
      v_texto := 'Revisa el resultado y libera el pago si todo está bien.';
    when 'liberado' then
      v_destinatario := new.ofertante_id;
      v_titulo := 'Pago liberado';
      v_texto := 'El cliente liberó el pago. ¡Buen trabajo!';
      v_tipo := 'pago_liberado';
    when 'cancelada' then
      -- Notifica a la contraparte de quien cancela (asumimos cancela cliente; ajustar si trabajamos con campo cancelled_by)
      v_destinatario := new.ofertante_id;
      v_titulo := 'Contratación cancelada';
      v_texto := 'La contratación fue cancelada.';
    when 'en_disputa' then
      v_destinatario := new.ofertante_id;
      v_titulo := 'Disputa abierta';
      v_texto := 'Se abrió una disputa sobre esta contratación. Nuestro equipo la revisará.';
    else
      return new;
  end case;

  if v_destinatario is not null then
    insert into public.notificaciones (usuario_id, tipo, titulo, texto, link)
    values (v_destinatario, v_tipo, v_titulo, v_texto, v_link);
  end if;

  return new;
end $$;

drop trigger if exists trg_notify_estado_change on public.contrataciones;
create trigger trg_notify_estado_change
after update of estado on public.contrataciones
for each row execute function public.notify_on_estado_change();


-- =========================================================================
-- 3. Notificación al recibir una reseña
-- =========================================================================

create or replace function public.notify_on_resena()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.notificaciones (usuario_id, tipo, titulo, texto, link)
  values (
    new.destino_id,
    'resena_recibida',
    'Nueva reseña',
    'Te dejaron una calificación de ' || new.estrellas || ' estrellas.',
    '/panel/resenas'
  );
  return new;
end $$;

drop trigger if exists trg_notify_resena on public.resenas;
create trigger trg_notify_resena
after insert on public.resenas
for each row execute function public.notify_on_resena();


-- =========================================================================
-- 4. Actualizar calificación promedio + total reseñas del destinatario
--    Re-calcula al insertar/actualizar/eliminar una reseña
-- =========================================================================

create or replace function public.recalc_calificacion_usuario()
returns trigger
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_promedio numeric;
  v_total int;
begin
  v_user_id := coalesce(new.destino_id, old.destino_id);

  select
    coalesce(round(avg(estrellas)::numeric, 2), 0),
    count(*)
  into v_promedio, v_total
  from public.resenas
  where destino_id = v_user_id;

  update public.profiles
  set calificacion_promedio = v_promedio,
      total_resenas = v_total
  where id = v_user_id;

  return coalesce(new, old);
end $$;

drop trigger if exists trg_recalc_calificacion_ins on public.resenas;
create trigger trg_recalc_calificacion_ins
after insert on public.resenas
for each row execute function public.recalc_calificacion_usuario();

drop trigger if exists trg_recalc_calificacion_upd on public.resenas;
create trigger trg_recalc_calificacion_upd
after update on public.resenas
for each row execute function public.recalc_calificacion_usuario();

drop trigger if exists trg_recalc_calificacion_del on public.resenas;
create trigger trg_recalc_calificacion_del
after delete on public.resenas
for each row execute function public.recalc_calificacion_usuario();


-- =========================================================================
-- 5. Actualizar calificación del servicio/herramienta también
--    Si la contratación apunta a un servicio o herramienta específicos
-- =========================================================================

create or replace function public.recalc_calificacion_item()
returns trigger
language plpgsql
security definer
as $$
declare
  v_servicio_id uuid;
  v_herramienta_id uuid;
begin
  -- Trae el item desde la contratación
  select servicio_id, herramienta_id
  into v_servicio_id, v_herramienta_id
  from public.contrataciones
  where id = coalesce(new.contratacion_id, old.contratacion_id);

  if v_servicio_id is not null then
    update public.servicios_oficios
    set calificacion = coalesce((
      select round(avg(r.estrellas)::numeric, 2)
      from public.resenas r
      join public.contrataciones c on c.id = r.contratacion_id
      where c.servicio_id = v_servicio_id
    ), 0)
    where id = v_servicio_id;
  end if;

  if v_herramienta_id is not null then
    update public.herramientas
    set calificacion = coalesce((
      select round(avg(r.estrellas)::numeric, 2)
      from public.resenas r
      join public.contrataciones c on c.id = r.contratacion_id
      where c.herramienta_id = v_herramienta_id
    ), 0)
    where id = v_herramienta_id;
  end if;

  return coalesce(new, old);
end $$;

drop trigger if exists trg_recalc_item_ins on public.resenas;
create trigger trg_recalc_item_ins
after insert on public.resenas
for each row execute function public.recalc_calificacion_item();

drop trigger if exists trg_recalc_item_upd on public.resenas;
create trigger trg_recalc_item_upd
after update on public.resenas
for each row execute function public.recalc_calificacion_item();

drop trigger if exists trg_recalc_item_del on public.resenas;
create trigger trg_recalc_item_del
after delete on public.resenas
for each row execute function public.recalc_calificacion_item();


-- =========================================================================
-- 6. Sumar trabajos completados / arriendos completados al usuario
--    Cuando una contratación pasa a 'liberado'
-- =========================================================================

create or replace function public.sumar_completados_al_liberar()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.estado = 'liberado' and old.estado is distinct from 'liberado' then
    if new.tipo = 'servicio' then
      update public.profiles
      set total_trabajos_completados = coalesce(total_trabajos_completados, 0) + 1
      where id = new.ofertante_id;

      if new.servicio_id is not null then
        update public.servicios_oficios
        set total_trabajos_realizados = coalesce(total_trabajos_realizados, 0) + 1
        where id = new.servicio_id;
      end if;
    else
      update public.profiles
      set total_arriendos_completados = coalesce(total_arriendos_completados, 0) + 1
      where id = new.ofertante_id;

      if new.herramienta_id is not null then
        update public.herramientas
        set total_arriendos = coalesce(total_arriendos, 0) + 1
        where id = new.herramienta_id;
      end if;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_sumar_completados on public.contrataciones;
create trigger trg_sumar_completados
after update of estado on public.contrataciones
for each row execute function public.sumar_completados_al_liberar();


-- =========================================================================
-- 7. Verificación rápida del estado
-- =========================================================================

select tgname as trigger, tgrelid::regclass as tabla
from pg_trigger
where tgrelid::regclass::text in (
  'public.contrataciones',
  'public.resenas'
) and not tgisinternal
order by tabla, trigger;
