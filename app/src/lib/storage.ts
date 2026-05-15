import { supabase } from '@/lib/supabase'

const UPLOAD_TIMEOUT_MS = 30_000

/**
 * Sube un archivo a un bucket de Supabase Storage.
 * El nombre se prefija con el userId para que las RLS policies coincidan
 * (`{userId}/{ts}-{nombre}.ext`).
 */
export async function uploadFile(
  bucket: 'avatars' | 'gallery' | 'tools' | 'documents',
  userId: string,
  file: File,
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const safeName = file.name.replace(/[^a-z0-9._-]/gi, '_').slice(0, 80)
  const path = `${userId}/${Date.now()}-${safeName}${safeName.endsWith(ext) ? '' : `.${ext}`}`

  // Race contra timeout para que un upload colgado no deje a la UI en "Subiendo…" eterno.
  const uploadPromise = supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  })

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(
      () =>
        reject(
          new Error(
            'La subida superó los 30 segundos. Revisa tu conexión o el bucket en Supabase.',
          ),
        ),
      UPLOAD_TIMEOUT_MS,
    )
  })

  const { error } = (await Promise.race([uploadPromise, timeoutPromise])) as Awaited<
    typeof uploadPromise
  >
  if (error) {
    console.error('[uploadFile]', { bucket, path, error })
    // Mensajes amigables para errores comunes de Supabase Storage
    const msg = error.message || ''
    if (msg.includes('row-level security') || msg.includes('RLS') || msg.includes('Unauthorized')) {
      throw new Error(
        'Permiso denegado en Storage. Aplica el script storage_policies.sql en Supabase.',
      )
    }
    if (msg.includes('Bucket not found')) {
      throw new Error(`El bucket "${bucket}" no existe en Supabase. Créalo en Storage.`)
    }
    if (msg.includes('Payload too large') || msg.includes('exceeds')) {
      throw new Error('El archivo es demasiado grande. Máximo 5 MB.')
    }
    throw error
  }
  if (bucket === 'documents') {
    return path
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteFile(
  bucket: 'avatars' | 'gallery' | 'tools' | 'documents',
  pathOrUrl: string,
) {
  // Si recibimos URL pública, extraemos el path desde el nombre del bucket
  const idx = pathOrUrl.indexOf(`/${bucket}/`)
  const path = idx >= 0 ? pathOrUrl.slice(idx + bucket.length + 2) : pathOrUrl
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) throw error
}
