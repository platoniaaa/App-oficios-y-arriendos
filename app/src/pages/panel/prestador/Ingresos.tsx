import { useState } from 'react'
import { useAuth } from '@/stores/useAuth'
import { movimientosDeUsuario, resumenFinanciero, ingresoPorMes } from '@/mocks/finanzas'
import { KpiCard } from '@/components/feature/KpiCard'
import { RevenueChart } from '@/components/feature/RevenueChart'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { formatCLP, formatDate } from '@/lib/format'
import { ArrowDownToLine, Building2, Wallet, ShieldCheck, TrendingUp, Send } from 'lucide-react'
import { cn } from '@/lib/cn'

export function PrestadorIngresos() {
  const user = useAuth((s) => s.user())!
  const fin = resumenFinanciero(user.id)
  const data = ingresoPorMes(user.id)
  const movs = movimientosDeUsuario(user.id)
  const [filtro, setFiltro] = useState<'todos' | 'ingreso' | 'retiro'>('todos')
  const [retiroOpen, setRetiroOpen] = useState(false)
  const [monto, setMonto] = useState(fin.disponible)

  const filtrados = movs.filter((m) => (filtro === 'todos' ? true : m.tipo === filtro))

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase text-ember-600">Ingresos</p>
          <h1 className="font-display text-3xl font-semibold">Finanzas</h1>
        </div>
        <Button variant="ember" size="md" onClick={() => setRetiroOpen(true)}>
          <ArrowDownToLine className="h-4 w-4" /> Retirar a cuenta bancaria
        </Button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Disponible" value={formatCLP(fin.disponible)} icon={<Wallet className="h-4 w-4" />} tone="moss" hint="para retirar" />
        <KpiCard label="En escrow" value={formatCLP(fin.enEscrow)} icon={<ShieldCheck className="h-4 w-4" />} tone="ember" />
        <KpiCard label="Histórico" value={formatCLP(fin.ingresoTotal)} icon={<TrendingUp className="h-4 w-4" />} hint="Últimos 6 meses" />
        <KpiCard label="Retirado" value={formatCLP(fin.retirado)} icon={<ArrowDownToLine className="h-4 w-4" />} hint="total retirado" />
      </section>

      <div className="card p-5">
        <p className="font-mono text-xs uppercase text-ink-400 mb-2">Ingresos por mes</p>
        <RevenueChart data={data} />
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-3 mb-3">
          <Building2 className="h-5 w-5 text-navy" />
          <div>
            <p className="font-display text-lg font-semibold">Datos bancarios</p>
            <p className="text-xs text-ink-400">Banco Estado · Cuenta Vista · N° 0123-45-00000-0 · {user.nombre}</p>
          </div>
          <Button variant="outline" size="sm" className="ml-auto">
            Editar
          </Button>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Movimientos</h2>
          <div className="flex gap-1 rounded-full border border-ink-200 bg-white p-0.5">
            {(['todos', 'ingreso', 'retiro'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFiltro(f)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-semibold transition',
                  filtro === f ? 'bg-navy text-white' : 'text-ink-500 hover:bg-ink-100',
                )}
              >
                {f === 'todos' ? 'Todos' : f === 'ingreso' ? 'Ingresos' : 'Retiros'}
              </button>
            ))}
          </div>
        </div>

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
              {filtrados.map((m) => (
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
            Saldo disponible: <strong>{formatCLP(fin.disponible)}</strong>. El retiro llega en 1 a 2 días hábiles.
          </p>
          <Input
            label="Monto a retirar"
            type="number"
            value={monto}
            onChange={(e) => setMonto(Math.min(fin.disponible, Math.max(0, Number(e.target.value))))}
            max={fin.disponible}
          />
          <div className="rounded-xl border border-ink-200 bg-ink-50 p-3 text-xs">
            <p className="font-semibold">Banco Estado · {user.nombre}</p>
            <p className="text-ink-400">Cuenta Vista · 0123-45-00000-0</p>
          </div>
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
    </div>
  )
}
