import { Link } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import { servicios } from '@/mocks/servicios'
import { herramientas } from '@/mocks/herramientas'
import { StarRating } from '@/components/ui/StarRating'
import { PriceTag } from '@/components/ui/PriceTag'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus } from 'lucide-react'

export function MisPublicaciones() {
  const user = useAuth((s) => s.user())!
  const misServicios = servicios.filter((s) => s.trabajadorId === user.id)
  const misHerramientas = herramientas.filter((h) => h.propietarioId === user.id)

  return (
    <div className="space-y-10">
      <header>
        <p className="font-mono text-xs uppercase text-ember">Publicaciones</p>
        <h1 className="font-display text-4xl font-semibold">Mis publicaciones</h1>
      </header>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold">Servicios</h2>
          <Link to="/panel/publicar/servicio" className="btn-outline btn-sm">
            <Plus className="h-4 w-4" /> Nuevo servicio
          </Link>
        </div>
        {misServicios.length === 0 ? (
          <EmptyState
            title="No has publicado servicios"
            description="Crea tu primer perfil de oficio y empieza a recibir solicitudes."
            action={
              <Link to="/panel/publicar/servicio" className="btn-primary btn-md mt-3">
                Publicar servicio
              </Link>
            }
          />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {misServicios.map((s) => (
              <li key={s.id} className="card p-0 overflow-hidden">
                <Link to={`/servicio/${s.id}`} className="block">
                  <div className="aspect-[4/3] bg-cream-deep">
                    <img src={s.galeriaTrabajos[0]} alt={s.oficio} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="font-display text-lg font-semibold">{s.oficio}</p>
                    <StarRating value={s.calificacion} count={s.totalTrabajosRealizados} size="sm" />
                    {s.tarifaReferencia.monto && (
                      <PriceTag value={s.tarifaReferencia.monto} unit={s.tarifaReferencia.tipo} size="sm" />
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold">Herramientas</h2>
          <Link to="/panel/publicar/herramienta" className="btn-outline btn-sm">
            <Plus className="h-4 w-4" /> Nueva herramienta
          </Link>
        </div>
        {misHerramientas.length === 0 ? (
          <EmptyState
            title="No has publicado herramientas"
            description="Si tienes equipos sin uso, puedes arrendarlos con depósito en escrow."
            action={
              <Link to="/panel/publicar/herramienta" className="btn-primary btn-md mt-3">
                Publicar herramienta
              </Link>
            }
          />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {misHerramientas.map((h) => (
              <li key={h.id} className="card p-0 overflow-hidden">
                <Link to={`/herramienta/${h.id}`} className="block">
                  <div className="aspect-[4/3] bg-cream-deep">
                    <img src={h.fotos[0]} alt={h.titulo} className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="font-display text-lg font-semibold leading-tight">{h.titulo}</p>
                    <PriceTag value={h.tarifa.porDia} unit="día" size="sm" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
