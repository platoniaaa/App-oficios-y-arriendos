import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatCLP } from '@/lib/format'

interface Props {
  data: { mes: string; monto: number }[]
  height?: number
  color?: string
}

export function RevenueChart({ data, height = 260, color = '#2563EB' }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
        <XAxis dataKey="mes" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#94A3B8"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
          width={46}
        />
        <Tooltip
          content={({ active, payload, label }) =>
            active && payload && payload.length ? (
              <div className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs shadow-soft">
                <p className="font-semibold">{label}</p>
                <p className="text-ink-500">{formatCLP(Number(payload[0]?.value))}</p>
              </div>
            ) : null
          }
        />
        <Area type="monotone" dataKey="monto" stroke={color} strokeWidth={2.5} fill="url(#rev)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
