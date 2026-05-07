import { useState } from 'react'
import { useAuth } from '@/stores/useAuth'
import {
  listContratacionesDeUsuario,
  actualizarEstadoContratacion,
} from '@/lib/queries/contrataciones'
import { useFetch } from '@/hooks/useFetch'
import { movimientosDeUsuario, resumenFinanciero, ingresoPorMes } from '@/mocks/finanzas'
import { herramientas } from '@/mocks/herramientas'
import { usersById } from '@/mocks/users'
import { KpiCard } from '@/components/feature/KpiCard'
import { RevenueChart } from '@/components/feature/RevenueChart'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { ReclamarDepositoModal } from '@/components/feature/ReclamarDepositoModal'
import { formatCLP, formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'
import { ArrowDownToLine, Wallet, ShieldCheck, TrendingUp, Send, Building2, PackageCheck, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ArrendadorIngresos() {
  const user = useAuth((s) => s.user())!
  const fin = resumenFinanciero(user.id)
  const data = ingresoPorMes(user.id)
  const movs = movimientosDeUsuario(user.id)
  const { data: contrsData, refetch } = useFetch(
    () => listContratacionesDeUsuario(user.id),
    [user.id],
  )
  const activos = (contrsData ?? []).filter(
    (c) =>
      c.ofertanteId === user.id &&
      c.deposito &&
      c.deposito > 0 &&
      ['pago_en_escrow', 'en_ejecucion', 'finalizada_pendiente_aprobacion'].includes(c.estado),
  )
  const updateEstado = async (id: string, nuevo: import('@/types').EstadoContratacion) => {
    await actualizarEstadoContratacion(id, nuevo)
    refetch()
  }
  const [retiroOpen, setRetiroOpen] = useState(false)
  const [monto, setMonto] = useState(fin.disponible)
  const [claimId, setClaimId] = useState<string | null>(null)

  const reclamando = claimId ? activos.find((c) => c.id === claimId) : undefined

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase text-ember-600">Ingresos</p>
          <h1 className="font-display text-3xl font-semibold">Finanzas y depósitos</h1>
        </div>
        <Button variant="ember" size="md" onClick={() => setRetiroOpen(true)}>
          <ArrowDownToLine className="h-4 w-4" /> Retirar a cuenta bancaria
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Disponible" value={formatCLP(fin.disponible)} icon={<Wallet className="h-4 w-4" />} tone="moss" />
        <KpiCard label="En escrow" value={formatCLP(fin.enEscrow)} icon={<ShieldCheck className="h-4 w-4" />} tone="ember" />
        <KpiCard label="Depósitos custodiados" value={formatCLP(fin.depositosCustodia)} icon={<PackageCheck className="h-4 w-4" />} tone="moss" />
        <KpiCard label="Ingresos 6m" value={formatCLP(fin.ingresoTotal)} icon={<TrendingUp className="h-4 w-4" />} />
      </section>

      <div className="card p-5">
        <p className="font-mono text-xs uppercase text-ink-400 mb-2">Ingresos por mes</p>
        <RevenueChart data={data} color="#2563EB" />
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
          <PackageCheck className="h-5 w-5" /> Depósitos en custodia
        </h2>
        {activos.length === 0 ? (
          <p className="text-sm text-ink-400">No hay depósitos en custodia activos.</p>
        ) : (
          <ul className="space-y-3">
            {activos.map((c) => {
              const tool = herramientas.find((h) => h.id === c.itemId)
              const cliente = usersById[c.clienteId]
              return (
                <li key={c.id} className="card flex flex-wrap items-center gap-4 p-4">
                  {tool && <img src={tool.fotos[0]} alt="" className="h-14 w-20 rounded-lg object-cover shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{tool?.titulo}</p>
                    <p className="text-xs text-ink-400">
                      {cliente?.nombre} · devuelve {formatDate(c.fechaFin)}
                    </p>
                  </div>
                  <p className="font-display text-lg font-semibold tabular-nums">{formatCLP(c.deposito ?? 0)}</p>
                  <div className="flex gap-2">
                    <Link to={`/panel/contratacion/${c.id}`} className="btn-outline btn-sm">
                      Detalle
                    </Link>
                    <Button
                      variant="ember"
                      size="sm"
                      onClick={() => updateEstado(c.id, 'liberado')}
                    >
                      Liberar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setClaimId(c.id)}>
                      <AlertTriangle className="h-4 w-4" /> Reclamar
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="card p-5">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-navy" />
          <div>
            <p className="font-display text-lg font-semibold">Datos bancarios</p>
            <p className="text-xs text-ink-400">Banco de Chile · Cuenta Empresa · 99-999-999 · {user.razonSocial ?? user.nombre}</p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto">
            Editar
          </Button>
        </div>
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold mb-3">Movimientos</h2>
        <div className="card overflow-hidden p-0">
          <table className="min-w-full text-sm">
            <thead className="bg-ink-50 text-left text-[11px] font-mono uppercase text-ink-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {movs.map((m) => (
                <tr key={m.id} className="hover:bg-ink-50">
                  <td className="px-4 py-3 text-ink-500">{formatDate(m.fecha)}</td>
                  <td className="px-4 py-3">{m.descripcion}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                        m.estado === 'liquidado'
                          ? 'bg-moss/10 text-moss'
                          : m.estado === 'en_escrow'
                            ? 'bg-ember/10 text-ember-600'
                            : 'bg-ink-100 text-ink-500',
                      )}
                    >
                      {m.estado === 'en_escrow' ? 'en escrow' : m.estado}
                    </span>
                  </td>
                  <td
                    className={cn(
                      'px-4 py-3 text-right tabular-nums font-mono',
                      m.monto < 0 ? 'text-rust' : 'text-navy',
                    )}
                  >
                    {m.monto < 0 ? `− ${formatCLP(Math.abs(m.monto))}` : `+ ${formatCLP(m.monto)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={retiroOpen} onClose={() => setRetiroOpen(false)} title="Retirar a cuenta bancaria">
        <div className="space-y-4">
          <p className="text-sm text-ink-500">
            Saldo disponible: <strong>{formatCLP(fin.disponible)}</strong>.
          </p>
          <Input
            label="Monto a retirar"
            type="number"
            value={monto}
            onChange={(e) => setMonto(Math.min(fin.disponible, Math.max(0, Number(e.target.value))))}
            max={fin.disponible}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="md" onClick={() => setRetiroOpen(false)}>
              Cancelar
            </Button>
            <Button variant="ember" size="md" onClick={() => setRetiroOpen(false)}>
              <Send className="h-4 w-4" /> Enviar a mi banco
            </Button>
          </div>
        </div>
      </Modal>

      {reclamando && (
        <ReclamarDepositoModal
          open={!!reclamando}
          onClose={() => setClaimId(null)}
          depositoMax={reclamando.deposito ?? 0}
          onConfirm={() => {
            updateEstado(reclamando.id, 'en_disputa')
            setClaimId(null)
          }}
        />
      )}
    </div>
  )
}
