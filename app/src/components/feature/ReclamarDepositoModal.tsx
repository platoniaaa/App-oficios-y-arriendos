import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Upload, AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  depositoMax: number
  onConfirm: (monto: number, motivo: string, fotos: string[]) => void
}

export function ReclamarDepositoModal({ open, onClose, depositoMax, onConfirm }: Props) {
  const [monto, setMonto] = useState(Math.round(depositoMax / 2))
  const [motivo, setMotivo] = useState('')
  const [fotos, setFotos] = useState<string[]>([])

  return (
    <Modal open={open} onClose={onClose} title="Reclamar depósito" size="md">
      <div className="rounded-xl border border-ember/30 bg-ember/5 p-3 text-sm text-ember-600">
        <AlertTriangle className="mb-1.5 inline h-4 w-4" /> Esto abrirá una disputa. El cliente será notificado y el pago quedará retenido hasta resolver.
      </div>
      <div className="mt-4 grid gap-4">
        <Input
          label={`Monto a reclamar (máx ${depositoMax.toLocaleString()} CLP)`}
          type="number"
          value={monto}
          onChange={(e) => setMonto(Math.min(depositoMax, Math.max(0, Number(e.target.value))))}
          min={0}
          max={depositoMax}
          step={1000}
        />
        <Textarea
          label="Motivo del reclamo"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Describe qué sucedió con la herramienta…"
        />
        <div>
          <p className="label-base">Fotos de respaldo</p>
          <div className="grid grid-cols-3 gap-2">
            {fotos.map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-lg border border-ink-200">
                <img src={src} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
            {fotos.length < 4 && (
              <button
                type="button"
                onClick={() => setFotos([...fotos, `https://picsum.photos/seed/claim-${fotos.length}-${Date.now()}/400/400`])}
                className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-ink-200 hover:border-navy"
              >
                <Upload className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" size="md" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="ember"
          size="md"
          disabled={motivo.length < 10 || monto === 0}
          onClick={() => onConfirm(monto, motivo, fotos)}
        >
          Abrir disputa
        </Button>
      </div>
    </Modal>
  )
}
