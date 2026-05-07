import { supabase } from '@/lib/supabase'

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
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error
  if (bucket === 'documents') {
    // El bucket privado no tiene URL pública. Generamos signed URL si se necesita.
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
