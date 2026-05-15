import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { regiones } from '@/mocks/regiones'
import { Eye, Building2 } from 'lucide-react'
import {
  VerificacionesCard,
  verifItemsArrendadorPersona,
  verifItemsArrendadorEmpresa,
} from '@/components/feature/VerificacionesCard'

export function ArrendadorPerfil() {
  const user = useAuth((s) => s.user())!
  const setUser = useAuth((s) => s.setUser)
  const [form, setForm] = useState({ ...user })
  const regionesOpt = regiones.map((r) => ({ value: r.nombre, label: r.nombre }))
  const comunasOpt = regiones.find((r) => r.nombre === form.region)?.comunas.map((c) => ({ value: c, label: c })) ?? []

  const esEmpresa = user.tipo === 'empresa'

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase text-ember-600">Perfil</p>
          <h1 className="font-display text-3xl font-semibold">
            {esEmpresa ? 'Datos de la empresa' : 'Mi perfil público'}
          </h1>
        </div>
        <Link to={`/perfil/${user.id}`} className="btn-outline btn-md">
          <Eye className="h-4 w-4" /> Ver mi perfil público
        </Link>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          setUser({ ...form })
        }}
        className="space-y-8"
      >
        {esEmpresa ? (
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5" />
              <h2 className="font-display text-xl font-semibold">Datos corporativos</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Razón social" value={form.razonSocial ?? ''} onChange={(e) => setForm({ ...form, razonSocial: e.target.value, nombre: e.target.value })} />
              <Input label="Giro" value={form.giro ?? ''} onChange={(e) => setForm({ ...form, giro: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="RUT empresa" value={form.rut} onChange={(e) => setForm({ ...form, rut: e.target.value })} />
              <Input label="Representante legal" value={form.representanteLegal ?? ''} onChange={(e) => setForm({ ...form, representanteLegal: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Email corporativo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Región" value={form.region} options={regionesOpt} onChange={(e) => setForm({ ...form, region: e.target.value })} />
              <Select label="Comuna" value={form.comuna} options={comunasOpt} onChange={(e) => setForm({ ...form, comuna: e.target.value })} />
            </div>
            <Input label="Dirección fiscal" value={form.direccion ?? ''} onChange={(e) => setForm({ ...form, direccion: e.target.value })} />
            <Textarea label="Bio de la empresa" value={form.bio ?? ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
        ) : (
          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-5">
              <Avatar src={form.fotoPerfil} name={form.nombre} size="xl" />
              <div>
                <p className="font-display text-lg font-semibold">Foto de perfil</p>
                <p className="text-sm text-ink-400">
                  Cambia tu foto desde{' '}
                  <Link to="/panel/perfil" className="font-semibold text-ember hover:underline">
                    Mi cuenta
                  </Link>
                  .
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              <Input label="Apellido" value={form.apellido ?? ''} onChange={(e) => setForm({ ...form, apellido: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Región" value={form.region} options={regionesOpt} onChange={(e) => setForm({ ...form, region: e.target.value })} />
              <Select label="Comuna" value={form.comuna} options={comunasOpt} onChange={(e) => setForm({ ...form, comuna: e.target.value })} />
            </div>
            <Textarea label="Bio" value={form.bio ?? ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="primary" size="md" type="submit">
            Guardar
          </Button>
        </div>

        <VerificacionesCard
          titulo="Documentación"
          items={esEmpresa ? verifItemsArrendadorEmpresa : verifItemsArrendadorPersona}
        />
      </form>
    </div>
  )
}
