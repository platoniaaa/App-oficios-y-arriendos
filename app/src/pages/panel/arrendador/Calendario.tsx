import { useState } from 'react'
import { useAuth } from '@/stores/useAuth'
import { listHerramientasDeUsuario } from '@/lib/queries/herramientas'
import { listContratacionesDeUsuario } from '@/lib/queries/contrataciones'
import { useFetch } from '@/hooks/useFetch'
import { bloqueosDeUsuario } from '@/mocks/agenda'
import { CalendarioInventario } from '@/components/feature/CalendarioInventario'
import { Select } from '@/components/ui/Input'

export function ArrendadorCalendario() {
  const user = useAuth((s) => s.user())!
  const { data: todasData } = useFetch(() => listHerramientasDeUsuario(user.id), [user.id])
  const todas = todasData ?? []
  const { data: contrsData } = useFetch(
    () => listContratacionesDeUsuario(user.id),
    [user.id],
  )
  const contrs = (contrsData ?? []).filter(
    (c) => c.ofertanteId === user.id && c.tipo === 'arriendo',
  )
  const [filtro, setFiltro] = useState('')

  const filtradas = filtro ? todas.filter((h) => h.id === filtro) : todas

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase text-ember-600">Calendario</p>
          <h1 className="font-display text-3xl font-semibold">Vista general del inventario</h1>
          <p className="text-sm text-ink-500 mt-1">Dos semanas de visibilidad por herramienta.</p>
        </div>
        <Select
          label="Filtrar por herramienta"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Todas las herramientas"
          options={todas.map((h) => ({ value: h.id, label: h.titulo }))}
          wrapClassName="min-w-[260px]"
        />
      </header>

      <CalendarioInventario
        herramientas={filtradas}
        contrataciones={contrs}
        bloqueos={bloqueosDeUsuario(user.id)}
        dias={14}
      />
    </div>
  )
}
