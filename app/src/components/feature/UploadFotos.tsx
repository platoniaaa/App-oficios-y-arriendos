import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { uploadFile } from '@/lib/storage'
import { useAuth } from '@/stores/useAuth'
import { cn } from '@/lib/cn'

interface Props {
  bucket: 'gallery' | 'tools'
  fotos: string[]
  onChange: (fotos: string[]) => void
  max?: number
  label?: string
}

export function UploadFotos({ bucket, fotos, onChange, max = 8, label = 'Agregar foto' }: Props) {
  const user = useAuth((s) => s.user())
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  async function handleFiles(files: FileList) {
    if (!user) {
      setError('Debes iniciar sesión para subir fotos.')
      return
    }
    setError(null)
    setUploading(true)
    const restantes = max - fotos.length
    const archivos = Array.from(files).slice(0, restantes)
    const nuevas: string[] = []
    try {
      for (const f of archivos) {
        if (f.size > 5 * 1024 * 1024) {
          setError('Cada foto debe pesar menos de 5 MB.')
          continue
        }
        const url = await uploadFile(bucket, user.id, f)
        nuevas.push(url)
      }
      onChange([...fotos, ...nuevas])
    } catch (e) {
      console.error(e)
      setError(e instanceof Error ? e.message : 'No se pudo subir alguna foto.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {fotos.map((src, i) => (
          <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-navy/10">
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              className="absolute right-2 top-2 rounded-full bg-cream p-1 shadow-soft hover:bg-rust hover:text-cream"
              onClick={() => onChange(fotos.filter((_, k) => k !== i))}
              aria-label="Quitar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {fotos.length < max && (
          <label
            className={cn(
              'flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-navy/25 hover:border-navy',
              uploading && 'pointer-events-none opacity-60',
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
            />
            <div className="text-center">
              {uploading ? (
                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
              ) : (
                <Upload className="mx-auto h-6 w-6" />
              )}
              <p className="mt-1 text-xs font-semibold">
                {uploading ? 'Subiendo…' : label}
              </p>
            </div>
          </label>
        )}
      </div>
      {error && (
        <div className="rounded-lg border border-rust/30 bg-rust/5 px-3 py-2 text-xs text-rust">
          {error}
        </div>
      )}
    </div>
  )
}
