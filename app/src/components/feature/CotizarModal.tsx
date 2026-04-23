import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatCLP } from '@/lib/format'
import { fees } from '@/config/brand'

interface Props {
  open: boolean
  onClose: () => void
  onConfirm: (monto: number, plazoDias: number, notas: string) => void
  montoInicial?: number
}

export function CotizarModal({ open, onClose, onConfirm, montoInicial = 50000 }: Props) {
  const [monto, setMonto] = useState(montoInicial)
  const [plazo, setPlazo] = useState(3)
  const [notas, setNotas] = useState('')
  const comision = Math.round(monto * fees.comisionPlataforma)
  const neto = monto - comision

  return (
    <Modal open={open} onClose={onClose} title="Enviar cotización" size="md">
      <div className="grid gap-4">
        <Input
          label="Monto total (CLP)"
          type="number"
          value={monto}
          onChange={(e) => setMonto(Math.max(0, Number(e.target.value)))}
          min={0}
          step={1000}
        />
        <Input
          label="Plazo estimado (días)"
          type="number"
          value={plazo}
          onChange={(e) => setPlazo(Math.max(1, Number(e.target.value)))}
          min={1}
        />
        <Textarea
          label="Notas para el cliente"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Materiales incluidos, alcance, condiciones de pago…"
        />
        <div className="rounded-xl bg-ink-100 p-3 text-sm">
          <div className="flex justify-between">
            <span>Monto cotizado</span>
            <span className="tabular-nums font-semibold">{formatCLP(monto)}</span>
          </div>
          <div className="flex justify-between text-ink-500">
            <span>Comisión plataforma ({Math.round(fees.comisionPlataforma * 100)}%)</span>
            <span className="tabular-nums">− {formatCLP(comision)}</span>
          </div>
          <div className="mt-1.5 flex justify-between border-t border-ink-200 pt-1.5 font-semibold">
            <span>Neto que recibes</span>
            <span className="tabular-nums">{formatCLP(neto)}</span>
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="ember" size="md" onClick={() => onConfirm(monto, plazo, notas)}>
          Enviar cotización
        </Button>
      </div>
    </Modal>
  )
}
