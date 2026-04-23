import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import { herramientas } from '@/mocks/herramientas'
import { categoriasHerramientas } from '@/mocks/categorias'
import { PriceTag } from '@/components/ui/PriceTag'
import { EmptyState } from '@/components/ui/EmptyState'
import { StarRating } from '@/components/ui/StarRating'
import { Select } from '@/components/ui/Input'
import { Plus, Edit3, Pause, Copy, Trash2, Wrench } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { EstadoOperacionalHerramienta } from '@/types'

const estadoStyle: Record<EstadoOperacionalHerramienta, string> = {
  disponible: 'bg-moss/10 text-moss border-moss/30',
  arrendada: 'bg-ember/10 text-ember-600 border-ember/30',
  mantenimiento: 'bg-ink-100 text-ink-500 border-ink-300',
  pausada: 'bg-rust/10 text-rust border-rust/30',
}

export function ArrendadorInventario() {
  const user = useAuth((s) => s.user())!
  const [cat, setCat] = useState('')
  const [estado, setEstado] = useState<'' | EstadoOperacionalHerramienta>('')

  const mias = useMemo(() => {
    let lista = herramientas.filter((h) => h.propietarioId === user.id)
    if (cat) lista = lista.filter((h) => h.categoria === cat)
    if (estado) lista = lista.filter((h) => (h.estadoOperacional ?? 'disponible') === estado)
    return lista
  }, [user.id, cat, estado])

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase text-ember-600">Inventario</p>
          <h1 className="font-display text-3xl font-semibold">Mis herramientas</h1>
        </div>
        <Link to="/panel/publicar/herramienta" className="btn-ember btn-md">
          <Plus className="h-4 w-4" /> Publicar herramienta
        </Link>
      </header>

      <div className="flex flex-wrap gap-3">
        <Select
          label="Categoría"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          placeholder="Todas"
          options={categoriasHerramientas.map((c) => ({ value: c.nombre, label: c.nombre }))}
          wrapClassName="min-w-[200px]"
        />
        <Select
          label="Estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value as typeof estado)}
          placeholder="Todos"
          options={[
            { value: 'disponible', label: 'Disponible' },
            { value: 'arrendada', label: 'Arrendada' },
            { value: 'mantenimiento', label: 'Mantenimiento' },
            { value: 'pausada', label: 'Pausada' },
          ]}
          wrapClassName="min-w-[180px]"
        />
      </div>

      {mias.length === 0 ? (
        <EmptyState
          title="No tienes herramientas en este filtro"
          description="Publica tu primer equipo o cambia los filtros."
          action={
            <Link to="/panel/publicar/herramienta" className="btn-primary btn-md mt-3">
              Publicar
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {mias.map((h) => {
            const est = h.estadoOperacional ?? 'disponible'
            return (
              <li key={h.id} className="card group overflow-hidden p-0">
                <div className="relative aspect-[4/3] bg-ink-100">
                  <img src={h.fotos[0]} alt={h.titulo} className="h-full w-full object-cover transition group-hover:scale-105" />
                  <span
                    className={cn(
                      'absolute left-3 top-3 rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize',
                      estadoStyle[est],
                    )}
                  >
                    {est}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <p className="font-mono text-[10px] uppercase text-ink-400">{h.categoria}</p>
                  <Link to={`/herramienta/${h.id}`} className="font-display text-lg font-semibold leading-tight hover:text-ember">
                    {h.titulo}
                  </Link>
                  <p className="text-xs text-ink-500">
                    {h.marca} · {h.modelo}
                  </p>
                  <div className="flex items-center justify-between border-t border-ink-100 pt-2">
                    <PriceTag value={h.tarifa.porDia} unit="día" size="sm" />
                    <StarRating value={h.calificacion} size="sm" count={h.totalArriendos} />
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    <ActionBtn icon={Edit3} label="Editar" />
                    <ActionBtn icon={Pause} label="Pausar" />
                    <ActionBtn icon={Wrench} label="Mantenimiento" />
                    <ActionBtn icon={Copy} label="Duplicar" />
                    <ActionBtn icon={Trash2} label="Eliminar" danger />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function ActionBtn({ icon: Icon, label, danger }: { icon: React.ComponentType<{ className?: string }>; label: string; danger?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition',
        danger
          ? 'border-rust/30 text-rust hover:bg-rust hover:text-white'
          : 'border-ink-200 text-ink-500 hover:bg-ink-100 hover:text-navy',
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
