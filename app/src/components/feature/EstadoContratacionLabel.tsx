import { Badge } from '@/components/ui/Badge'
import type { EstadoContratacion } from '@/types'

const map: Record<EstadoContratacion, { tone: 'navy' | 'cream' | 'ember' | 'moss' | 'rust' | 'ink'; label: string }> = {
  solicitada: { tone: 'cream', label: 'Solicitada' },
  cotizada: { tone: 'ember', label: 'Cotizada' },
  aceptada_cliente: { tone: 'navy', label: 'Aceptada' },
  pago_en_escrow: { tone: 'navy', label: 'En escrow' },
  en_ejecucion: { tone: 'ember', label: 'En ejecución' },
  finalizada_pendiente_aprobacion: { tone: 'moss', label: 'Pendiente aprobación' },
  liberado: { tone: 'moss', label: 'Pago liberado' },
  cancelada: { tone: 'rust', label: 'Cancelada' },
  en_disputa: { tone: 'rust', label: 'En disputa' },
}

export function EstadoLabel({ estado }: { estado: EstadoContratacion }) {
  const { tone, label } = map[estado]
  return <Badge tone={tone} solid={tone === 'moss' || tone === 'ember'}>{label}</Badge>
}
