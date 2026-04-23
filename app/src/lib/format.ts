export function formatCLP(value?: number | null): string {
  if (value === undefined || value === null) return '—'
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value)
}

export function formatDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
}

export function formatDateShort(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short' }).format(d)
}

export function formatRelative(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso).getTime()
  const diff = (Date.now() - d) / 1000
  if (diff < 60) return 'recién'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`
  if (diff < 2592000) return `hace ${Math.floor(diff / 86400)} d`
  return formatDate(iso)
}

export function initials(name?: string): string {
  if (!name) return '·'
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function truncate(text: string, max = 120): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

export function pluralize(n: number, singular: string, plural?: string): string {
  return `${n} ${n === 1 ? singular : plural ?? `${singular}s`}`
}
