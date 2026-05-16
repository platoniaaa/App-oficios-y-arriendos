import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useFetch } from '@/hooks/useFetch'
import type { Contratacion, User, EstadoVerificacion } from '@/types'
import { profileToUser, type ProfileRow } from '@/lib/profile'
import { Avatar } from '@/components/ui/Avatar'
import { Badge, VerificationBadge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { Shield, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

type Tab = 'verificaciones' | 'disputas' | 'reportes'
type VerifKey = keyof User['verificacion']

const VERIF_KEYS: VerifKey[] = ['rut', 'cedula', 'antecedentes', 'certificaciones']
const VERIF_LABELS: Record<VerifKey, string> = {
  rut: 'RUT',
  cedula: 'Cédula',
  antecedentes: 'Antec.',
  certificaciones: 'Cert.',
}

export function Admin() {
  const [tab, setTab] = useState<Tab>('verificaciones')
  const { data: disputasData } = useFetch(async () => {
    const { data } = await supabase
      .from('contrataciones')
      .select('*')
      .eq('estado', 'en_disputa')
    return (data ?? []) as unknown as Contratacion[]
  }, [])
  const disputas = disputasData ?? []

  const { data: pendientesData, refetch } = useFetch(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .or(
        'verif_rut.eq.pendiente,verif_cedula.eq.pendiente,verif_antecedentes.eq.pendiente,verif_certificaciones.eq.pendiente',
      )
      .limit(50)
    return (data ?? []).map((p) => profileToUser(p as ProfileRow)) as User[]
  }, [])
  const pendientes = pendientesData ?? []

  return (
    <div className="container-page py-10">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="h-6 w-6 text-ember" />
        <p className="font-mono text-xs uppercase text-ember">Admin · interno</p>
      </div>
      <h1 className="font-display text-4xl font-semibold">Panel interno</h1>
      <p className="text-ink-500 mt-1">
        Revisión de verificaciones, disputas y publicaciones reportadas.
      </p>

      <nav className="mt-8 flex gap-1 border-b border-navy/10">
        {(
          [
            ['verificaciones', `Usuarios pendientes (${pendientes.length})`],
            ['disputas', `Disputas (${disputas.length})`],
            ['reportes', `Publicaciones reportadas`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id as Tab)}
            className={cn(
              'relative px-4 py-3 text-sm font-semibold transition',
              tab === id ? 'text-navy' : 'text-ink-400 hover:text-navy',
            )}
          >
            {label}
            {tab === id && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-ember" />}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === 'verificaciones' && (
          pendientes.length === 0 ? (
            <p className="text-sm text-ink-400 italic">No hay usuarios pendientes de verificación.</p>
          ) : (
            <ul className="space-y-3">
              {pendientes.map((u) => (
                <VerificacionRow key={u.id} u={u} onChange={refetch} />
              ))}
            </ul>
          )
        )}
        {tab === 'disputas' && (
          disputas.length === 0 ? (
            <p className="text-sm text-ink-400 italic">No hay disputas activas.</p>
          ) : (
            <ul className="divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-paper">
              {disputas.map((c) => (
                <li key={c.id} className="flex items-center gap-4 p-4">
                  <Badge tone="rust">Disputa</Badge>
                  <p className="text-sm flex-1 truncate">Contratación {c.id}</p>
                  <Link
                    to={`/panel/contratacion/${c.id}`}
                    className="btn-outline btn-sm"
                  >
                    Ver
                  </Link>
                </li>
              ))}
            </ul>
          )
        )}
        {tab === 'reportes' && (
          <p className="text-sm text-ink-400 italic">Sin publicaciones reportadas.</p>
        )}
      </div>
    </div>
  )
}

function VerificacionRow({ u, onChange }: { u: User; onChange: () => void }) {
  const [busyKey, setBusyKey] = useState<VerifKey | null>(null)
  const [docs, setDocs] = useState<string[]>([])
  const [docsLoaded, setDocsLoaded] = useState(false)

  async function loadDocs() {
    if (docsLoaded) return
    const { data } = await supabase.storage.from('documents').list(u.id, { limit: 100 })
    setDocs(data?.map((f) => f.name) ?? [])
    setDocsLoaded(true)
  }

  async function setEstado(key: VerifKey, estado: EstadoVerificacion) {
    setBusyKey(key)
    try {
      const col = (
        {
          rut: 'verif_rut',
          cedula: 'verif_cedula',
          antecedentes: 'verif_antecedentes',
          certificaciones: 'verif_certificaciones',
        } as const
      )[key]
      const { error } = await supabase.from('profiles').update({ [col]: estado }).eq('id', u.id)
      if (error) throw error
      onChange()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No se pudo actualizar.')
    } finally {
      setBusyKey(null)
    }
  }

  async function signedUrl(name: string): Promise<string | null> {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(`${u.id}/${name}`, 60 * 10)
    if (error) {
      alert(error.message)
      return null
    }
    return data.signedUrl
  }

  return (
    <li className="rounded-2xl border border-navy/10 bg-paper p-4">
      <div className="flex items-start gap-4">
        <Avatar src={u.fotoPerfil} name={u.nombre} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{u.nombre}</p>
          <p className="text-xs text-ink-400">
            {u.tipo} · {u.comuna} · {u.email}
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {VERIF_KEYS.map((key) => {
              const estado = u.verificacion[key]
              const isBusy = busyKey === key
              return (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-ink-200 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <VerificationBadge estado={estado} label={VERIF_LABELS[key]} />
                    <span className="truncate text-xs text-ink-500">{VERIF_LABELS[key]}</span>
                  </div>
                  <div className="flex gap-1">
                    {isBusy ? (
                      <Loader2 className="h-4 w-4 animate-spin text-ink-400" />
                    ) : (
                      <>
                        {estado !== 'validada' && (
                          <button
                            type="button"
                            onClick={() => setEstado(key, 'validada')}
                            className="rounded-full p-1 text-moss hover:bg-moss/10"
                            title="Validar"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        {estado !== 'rechazada' && (
                          <button
                            type="button"
                            onClick={() => setEstado(key, 'rechazada')}
                            className="rounded-full p-1 text-rust hover:bg-rust/10"
                            title="Rechazar"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-3">
            {!docsLoaded ? (
              <button
                type="button"
                onClick={loadDocs}
                className="text-xs font-semibold text-ember hover:underline inline-flex items-center gap-1"
              >
                <FileText className="h-3 w-3" /> Ver documentos subidos
              </button>
            ) : docs.length === 0 ? (
              <p className="text-xs text-ink-400">Sin documentos subidos por este usuario.</p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {docs.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={async () => {
                      const url = await signedUrl(name)
                      if (url) window.open(url, '_blank', 'noopener')
                    }}
                    className="inline-flex items-center gap-1 rounded-full border border-navy/20 px-2 py-1 text-[11px] font-mono hover:border-navy/40"
                  >
                    <FileText className="h-3 w-3" /> {name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}
