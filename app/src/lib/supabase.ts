import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
      'El cliente se inicializa pero no podrá leer datos hasta que se configuren.',
  )
}

export const supabase: SupabaseClient = createClient(url ?? '', anon ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export const supabaseConfigured = Boolean(url && anon)
