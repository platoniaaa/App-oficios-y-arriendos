import { useState } from 'react'
import { users } from '@/mocks/users'
import { supabase } from '@/lib/supabase'
import { useFetch } from '@/hooks/useFetch'
import type { Contratacion } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { Badge, VerificationBadge } from '@/components/ui/Badge'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, XCircle, Shield } from 'lucide-react'

type Tab = 'verificaciones' | 'disputas' | 'reportes'

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

  return (
    <div className="container-page py-10">
      <div className="flex items-center gap-3 mb-4">
        <Shield className="h-6 w-6 text-ember" />
        <p className="font-mono text-xs uppercase text-ember">Admin · placeholder</p>
      </div>
      <h1 className="font-display text-4xl font-semibold">Panel interno</h1>
      <p className="text-ink-500 mt-1">Vista de demo. Solo lectura, sin lógica real.</p>

      <nav className="mt-8 flex gap-1 border-b border-navy/10">
        {(
          [
            ['verificaciones', `Usuarios pendientes`],
            ['disputas', `Disputas (${disputas.length})`],
            ['reportes', `Publicaciones reportadas`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id as Tab)}
            className={cn('relative px-4 py-3 text-sm font-semibold transition', tab === id ? 'text-navy' : 'text-ink-400 hover:text-navy')}
          >
            {label}
            {tab === id && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-ember" />}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {tab === 'verificaciones' && (
          <ul className="divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-paper">
            {users
              .filter(
                (u) =>
                  u.verificacion.rut === 'pendiente' ||
                  u.verificacion.cedula === 'pendiente' ||
                  u.verificacion.antecedentes === 'pendiente' ||
                  u.verificacion.certificaciones === 'pendiente',
              )
              .map((u) => (
                <li key={u.id} className="flex items-center gap-4 p-4">
                  <Avatar src={u.fotoPerfil} name={u.nombre} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{u.nombre}</p>
                    <p className="text-xs text-ink-400">{u.tipo} · {u.comuna}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <VerificationBadge estado={u.verificacion.rut} label="RUT" />
                      <VerificationBadge estado={u.verificacion.cedula} label="Cédula" />
                      <VerificationBadge estado={u.verificacion.antecedentes} label="Antec." />
                      <VerificationBadge estado={u.verificacion.certificaciones} label="Cert." />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm"><CheckCircle2 className="h-4 w-4" /> Aprobar</Button>
                    <Button variant="outline" size="sm"><XCircle className="h-4 w-4" /> Rechazar</Button>
                  </div>
                </li>
              ))}
          </ul>
        )}
        {tab === 'disputas' && (
          disputas.length === 0 ? (
            <p className="text-sm text-ink-400 italic">No hay disputas activas.</p>
          ) : (
            <ul className="divide-y divide-navy/10 rounded-2xl border border-navy/10 bg-paper">
              {disputas.map((c) => (
                <li key={c.id} className="flex items-center gap-4 p-4">
                  <Badge tone="rust">Disputa</Badge>
                  <p className="text-sm">Contratación {c.id}</p>
                  <Button variant="primary" size="sm">Intervenir</Button>
                </li>
              ))}
            </ul>
          )
        )}
        {tab === 'reportes' && (
          <p className="text-sm text-ink-400 italic">Sin publicaciones reportadas en el MVP.</p>
        )}
      </div>
    </div>
  )
}
