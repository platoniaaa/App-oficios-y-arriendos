# Supabase — Cuadrilla

## Cómo aplicar el schema inicial

1. Entra a tu proyecto en https://supabase.com/dashboard.
2. Menú izquierdo → **SQL Editor** (ícono `</>`).
3. Clic en **+ New query**.
4. Abre el archivo `migrations/0001_init.sql` de este repo, copia todo el contenido y pégalo en el editor.
5. Clic en **Run** (abajo a la derecha) o `Ctrl+Enter`.
6. Espera unos segundos. Si todo está bien, no hay errores rojos y aparece "Success. No rows returned".

## Qué crea este script

- **15 tablas** en el schema `public` (profiles, servicios, herramientas, contrataciones, reseñas, chats, notificaciones, agenda, finanzas, chatbot).
- **Trigger** que crea automáticamente un `profile` cuando se registra un usuario en Supabase Auth.
- **Row Level Security** activado en todas las tablas con políticas básicas (cada usuario solo ve y edita lo suyo, públicos los servicios/herramientas/perfiles/reseñas).
- **4 buckets de storage** (`avatars`, `gallery`, `tools` públicos · `documents` privado).
- **Triggers de `updated_at`** automáticos.

## Verificar que quedó todo

Ve a **Database → Tables** en el sidebar y deberías ver las 15 tablas listadas.

En **Authentication → Policies** verás las RLS policies activas.

En **Storage** verás los 4 buckets.

## Si algo falla

Si la query da error, copia el mensaje exacto y dímelo — generalmente son temas de extensiones o permisos que se resuelven con 1 línea más.

## Próximos pasos

Una vez aplicado este schema, seguimos con:

1. **Migración de stores de Zustand** a queries de Supabase.
2. **Auth real** (registro + login con email/password).
3. **Upload de imágenes** a los buckets.
4. **Realtime** para chat y notificaciones.
