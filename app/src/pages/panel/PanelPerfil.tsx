import { useState } from 'react'
import { useAuth } from '@/stores/useAuth'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { VerificationBadge } from '@/components/ui/Badge'
import { regiones } from '@/mocks/regiones'
import { usersById } from '@/mocks/users'
import { Upload, RefreshCcw, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'

export function PanelPerfil() {
  const user = useAuth((s) => s.user())!
  const setUser = useAuth((s) => s.setUser)
  const upsert = useAuth((s) => s.upsertVerificaciones)
  const [form, setForm] = useState({ ...user })

  const regionesOpt = regiones.map((r) => ({ value: r.nombre, label: r.nombre }))
  const comunasOpt =
    regiones.find((r) => r.nombre === form.region)?.comunas.map((c) => ({ value: c, label: c })) ?? []

  function save(e: React.FormEvent) {
    e.preventDefault()
    const u = { ...form }
    usersById[u.id] = u
    setUser(u)
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase text-ember">Perfil</p>
        <h1 className="font-display text-4xl font-semibold">Editar perfil</h1>
      </header>

      <form onSubmit={save} className="space-y-8">
        <div className="ticket p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-5">
            <Avatar src={form.fotoPerfil} name={form.nombre} size="xl" />
            <div>
              <p className="font-display text-lg font-semibold">Foto de perfil</p>
              <p className="text-sm text-ink-400">Una foto clara genera más confianza.</p>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-ember hover:underline"
                onClick={() => setForm({ ...form, fotoPerfil: `https://i.pravatar.cc/240?img=${Math.ceil(Math.random() * 70)}` })}
              >
                <RefreshCcw className="h-3 w-3" /> Cambiar foto
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={form.tipo === 'empresa' ? 'Razón social' : 'Nombre'}
              value={form.tipo === 'empresa' ? form.razonSocial ?? '' : form.nombre}
              onChange={(e) =>
                setForm(
                  form.tipo === 'empresa'
                    ? { ...form, razonSocial: e.target.value, nombre: e.target.value }
                    : { ...form, nombre: e.target.value },
                )
              }
            />
            {form.tipo === 'persona' && (
              <Input label="Apellido" value={form.apellido ?? ''} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Región"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value, comuna: regiones.find((r) => r.nombre === e.target.value)?.comunas[0] ?? form.comuna })}
              options={regionesOpt}
            />
            <Select label="Comuna" value={form.comuna} onChange={(e) => setForm({ ...form, comuna: e.target.value })} options={comunasOpt} />
          </div>
          <Textarea label="Bio" value={form.bio ?? ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Cuéntale a tus clientes quién eres y qué haces…" />
          <div className="flex justify-end">
            <Button variant="primary" size="md" type="submit">
              <CheckCircle2 className="h-4 w-4" /> Guardar cambios
            </Button>
          </div>
        </div>

        <div className="ticket p-6 md:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-moss" />
            <h2 className="font-display text-2xl font-semibold">Verificaciones</h2>
          </div>
          <p className="text-sm text-ink-500">
            Los documentos verificados te dan más confianza ante clientes. En el MVP puedes aprobar
            manualmente tus verificaciones para demo.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <VerifCard
              label="RUT"
              estado={user.verificacion.rut}
              onValidar={() => upsert({ rut: 'validada' })}
            />
            <VerifCard
              label="Cédula"
              estado={user.verificacion.cedula}
              onValidar={() => upsert({ cedula: 'validada' })}
            />
            <VerifCard
              label="Antecedentes"
              estado={user.verificacion.antecedentes}
              onValidar={() => upsert({ antecedentes: 'validada' })}
            />
            <VerifCard
              label="Certificaciones"
              estado={user.verificacion.certificaciones}
              onValidar={() => upsert({ certificaciones: 'validada' })}
            />
          </div>
        </div>
      </form>
    </div>
  )
}

function VerifCard({ label, estado, onValidar }: { label: string; estado: import('@/types').EstadoVerificacion; onValidar: () => void }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-navy/20 p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-semibold">{label}</p>
        <VerificationBadge estado={estado} label={label} />
      </div>
      {estado !== 'validada' && (
        <button
          type="button"
          className="inline-flex items-center gap-2 self-start text-sm font-semibold text-ember hover:underline"
          onClick={onValidar}
        >
          <Upload className="h-3 w-3" />
          {estado === 'pendiente' ? 'Subir y validar (demo)' : 'Reintentar'}
        </button>
      )}
    </div>
  )
}
