import { useEffect, useRef, useState } from 'react'
import { Upload, ShieldCheck, Loader2, CheckCircle2, Clock } from 'lucide-react'
import { useAuth } from '@/stores/useAuth'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/storage'
import { VerificationBadge } from '@/components/ui/Badge'
import type { EstadoVerificacion, User } from '@/types'

type VerifKey = keyof User['verificacion']

interface Item {
  key: VerifKey
  label: string
  ayuda: string
}

interface Props {
  /** Override de labels (ej: arrendador empresa muestra distinto) */
  items?: Item[]
  titulo?: string
}

const defaultItems: Item[] = [
  { key: 'rut', label: 'RUT', ayuda: 'Verificación contra registro nacional. No requiere subir documento.' },
  { key: 'cedula', label: 'Cédula de identidad', ayuda: 'Sube foto o PDF de tu cédula vigente (frente y reverso si es JPG).' },
  { key: 'antecedentes', label: 'Antecedentes', ayuda: 'Certificado del Registro Civil (vigencia ≤ 60 días).' },
  { key: 'certificaciones', label: 'Certificaciones', ayuda: 'Diplomas o certificados que respalden tu oficio.' },
]

export function VerificacionesCard({ items = defaultItems, titulo = 'Verificaciones' }: Props) {
  const user = useAuth((s) => s.user())!
  const refresh = useAuth((s) => s.refresh)
  const [docsSubidos, setDocsSubidos] = useState<Record<string, boolean>>({})
  const [uploadingKey, setUploadingKey] = useState<VerifKey | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const refs = useRef<Record<string, HTMLInputElement | null>>({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error: e } = await supabase.storage.from('documents').list(user.id, { limit: 100 })
      if (e || !data) return
      if (cancelled) return
      const map: Record<string, boolean> = {}
      for (const f of data) {
        for (const it of items) {
          if (f.name.startsWith(`${it.key}-`)) map[it.key] = true
        }
      }
      setDocsSubidos(map)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user.id, items])

  async function onUpload(it: Item, file: File) {
    setError(null)
    setSuccess(null)
    if (file.size > 10 * 1024 * 1024) {
      setError(`${it.label}: el archivo supera los 10 MB.`)
      return
    }
    setUploadingKey(it.key)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin'
      // Renombra al archivo con prefijo del tipo para poder listarlo después
      const renamed = new File([file], `${it.key}-${Date.now()}.${ext}`, { type: file.type })
      await uploadFile('documents', user.id, renamed)
      setDocsSubidos((p) => ({ ...p, [it.key]: true }))
      setSuccess(`${it.label}: documento recibido. Lo revisaremos en las próximas 24–48 hrs.`)
      await refresh()
    } catch (e) {
      console.error('[VerificacionesCard]', e)
      setError(e instanceof Error ? e.message : `No se pudo subir ${it.label}.`)
    } finally {
      setUploadingKey(null)
      const ref = refs.current[it.key]
      if (ref) ref.value = ''
    }
  }

  return (
    <div className="ticket p-6 md:p-8 space-y-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-moss" />
        <h2 className="font-display text-2xl font-semibold">{titulo}</h2>
      </div>
      <p className="text-sm text-ink-500">
        Sube tus documentos y nuestro equipo los revisará. La verificación aumenta tu visibilidad
        y la confianza de los clientes.
      </p>

      {error && (
        <div className="rounded-lg border border-rust/30 bg-rust/5 px-3 py-2 text-sm text-rust">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg border border-moss/30 bg-moss/5 px-3 py-2 text-sm text-moss">
          {success}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it) => {
          const estado = user.verificacion[it.key] as EstadoVerificacion
          const docSubido = docsSubidos[it.key]
          const subiendo = uploadingKey === it.key
          const validada = estado === 'validada'
          const noAplica = estado === 'no_aplica'
          // RUT no requiere documento (lo verificamos contra registro), solo se valida internamente
          const requiereDoc = it.key !== 'rut'

          return (
            <div
              key={it.key}
              className="rounded-2xl border-2 border-dashed border-navy/20 p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-lg font-semibold">{it.label}</p>
                <VerificationBadge estado={estado} label={it.label} />
              </div>
              <p className="text-xs text-ink-400">{it.ayuda}</p>

              {!validada && !noAplica && requiereDoc && (
                <>
                  <input
                    ref={(el) => {
                      refs.current[it.key] = el
                    }}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && onUpload(it, e.target.files[0])}
                  />
                  {docSubido ? (
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="inline-flex items-center gap-1 text-moss">
                        <Clock className="h-3 w-3" /> En revisión por el equipo
                      </span>
                      <button
                        type="button"
                        className="font-semibold text-ember hover:underline"
                        onClick={() => refs.current[it.key]?.click()}
                        disabled={subiendo}
                      >
                        {subiendo ? 'Subiendo…' : 'Reemplazar'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 self-start text-sm font-semibold text-ember hover:underline disabled:opacity-50"
                      onClick={() => refs.current[it.key]?.click()}
                      disabled={subiendo}
                    >
                      {subiendo ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Upload className="h-3 w-3" />
                      )}
                      {subiendo ? 'Subiendo…' : 'Subir documento'}
                    </button>
                  )}
                </>
              )}

              {!validada && !noAplica && !requiereDoc && (
                <p className="text-xs text-ink-400">
                  Lo validamos contra registro al revisar tu cuenta.
                </p>
              )}

              {validada && (
                <p className="inline-flex items-center gap-1 text-xs text-moss">
                  <CheckCircle2 className="h-3 w-3" /> Validado por el equipo
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const verifItemsCliente: Item[] = defaultItems

export const verifItemsTrabajador: Item[] = defaultItems

export const verifItemsArrendadorPersona: Item[] = defaultItems

export const verifItemsArrendadorEmpresa: Item[] = [
  { key: 'rut', label: 'RUT empresa', ayuda: 'Verificamos el RUT contra el SII al revisar tu cuenta.' },
  {
    key: 'cedula',
    label: 'Cédula representante legal',
    ayuda: 'Sube cédula del representante legal vigente.',
  },
  {
    key: 'antecedentes',
    label: 'Constitución legal',
    ayuda: 'Escritura de constitución o e-RUT vigente.',
  },
  {
    key: 'certificaciones',
    label: 'Autorizaciones operativas',
    ayuda: 'Patente comercial o autorizaciones sectoriales (si aplica).',
  },
]
