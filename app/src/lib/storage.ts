import { supabase } from '@/lib/supabase'

const UPLOAD_TIMEOUT_MS = 15_000

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
  // Sesión válida antes de intentar — sin esto el server retorna 401
  const { data: sess } = await supabase.auth.getSession()
  if (!sess.session) {
    throw new Error('No hay sesión activa. Cierra sesión, vuelve a entrar y reintenta.')
  }

  console.log('[uploadFile] inicio', {
    bucket,
    userId,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const safeName = file.name.replace(/[^a-z0-9._-]/gi, '_').slice(0, 80)
  const path = `${userId}/${Date.now()}-${safeName}${safeName.endsWith(ext) ? '' : `.${ext}`}`

  // Race contra timeout para que un upload colgado no deje a la UI en "Subiendo…" eterno.
  const uploadPromise = supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true, // sobrescribir si el path ya existe (ej. reintento)
    contentType: file.type || undefined,
  })

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(
      () =>
        reject(
          new Error(
            `La subida tardó más de ${UPLOAD_TIMEOUT_MS / 1000}s. Revisa tu conexión o reintenta.`,
          ),
        ),
      UPLOAD_TIMEOUT_MS,
    )
  })

  let result: Awaited<typeof uploadPromise>
  try {
    result = (await Promise.race([uploadPromise, timeoutPromise])) as Awaited<typeof uploadPromise>
  } catch (e) {
    console.error('[uploadFile] excepción durante upload', e)
    throw e
  }

  const { error } = result
  if (error) {
    console.error('[uploadFile] error de supabase', { bucket, path, error })
    const msg = error.message || ''
    if (msg.includes('row-level security') || msg.includes('RLS') || msg.includes('Unauthorized') || msg.includes('403')) {
      throw new Error(
        'Permiso denegado en Storage. Verifica que aplicaste storage_policies.sql.',
      )
    }
    if (msg.includes('Bucket not found')) {
      throw new Error(`El bucket "${bucket}" no existe.`)
    }
    if (msg.includes('Payload too large') || msg.includes('exceeds') || msg.includes('413')) {
      throw new Error('Archivo demasiado grande para el bucket.')
    }
    if (msg.includes('mime') || msg.includes('content type') || msg.includes('not allowed')) {
      throw new Error(`Formato "${file.type || 'desconocido'}" no permitido. Usa JPG, PNG, WebP o GIF.`)
    }
    throw new Error(msg || 'Error desconocido al subir.')
  }

  console.log('[uploadFile] OK', { path })

  if (bucket === 'documents') {
    return path
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  // Cache-buster para que el navegador no muestre la versión vieja
  return `${data.publicUrl}?v=${Date.now()}`
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
