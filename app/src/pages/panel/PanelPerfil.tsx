import { useState, useRef } from 'react'
import { useAuth } from '@/stores/useAuth'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { regiones } from '@/mocks/regiones'
import { Upload, CheckCircle2, Loader2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { updateProfile } from '@/lib/profile'
import { uploadFile } from '@/lib/storage'
import { VerificacionesCard } from '@/components/feature/VerificacionesCard'

export function PanelPerfil() {
  const user = useAuth((s) => s.user())!
  const refresh = useAuth((s) => s.refresh)
  const [form, setForm] = useState({ ...user })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const regionesOpt = regiones.map((r) => ({ value: r.nombre, label: r.nombre }))
  const comunasOpt =
    regiones.find((r) => r.nombre === form.region)?.comunas.map((c) => ({ value: c, label: c })) ??
    []

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setOk(false)
    setSaving(true)
    try {
      await updateProfile(user.id, {
        nombre: form.nombre,
        apellido: form.apellido ?? null,
        razon_social: form.razonSocial ?? null,
        giro: form.giro ?? null,
        telefono: form.telefono,
        region: form.region,
        comuna: form.comuna,
        bio: form.bio ?? null,
        foto_perfil: form.fotoPerfil,
      })
      await refresh()
      setOk(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function onFotoChange(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      setError('La foto debe pesar menos de 5 MB.')
      return
    }
    setUploading(true)
    setError(null)
    try {
      const url = await uploadFile('avatars', user.id, file)
      setForm((f) => ({ ...f, fotoPerfil: url }))
      await updateProfile(user.id, { foto_perfil: url })
      await refresh()
    } catch (e) {
      console.error('[onFotoChange]', e)
      setError(e instanceof Error ? e.message : 'No se pudo subir la foto.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase text-ember">Perfil</p>
        <h1 className="font-display text-4xl font-semibold">Editar perfil</h1>
      </header>

      <form onSubmit={save} className="space-y-8">
        <div className="ticket p-6 md:p-8 space-y-6">
          <div className="flex items-start gap-5">
            <Avatar src={form.fotoPerfil} name={form.nombre} size="xl" />
            <div className="flex-1 min-w-0">
              <p className="font-display text-lg font-semibold">Foto de perfil</p>
              <p className="text-sm text-ink-400">JPG, PNG, WebP o GIF — hasta 5 MB.</p>
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-ember hover:underline disabled:opacity-50"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" /> Subiendo…
                  </>
                ) : (
                  <>
                    <Upload className="h-3 w-3" /> Cambiar foto
                  </>
                )}
              </button>
              {error && (
                <div className="mt-2 rounded-lg border border-rust/30 bg-rust/5 px-3 py-2 text-xs text-rust">
                  <strong>Error al subir:</strong> {error}
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFotoChange(e.target.files[0])}
              />
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
              <Input
                label="Apellido"
                value={form.apellido ?? ''}
                onChange={(e) => setForm({ ...form, apellido: e.target.value })}
              />
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Correo"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled
              hint="El email es el de tu cuenta. No se puede cambiar aquí."
            />
            <Input
              label="Teléfono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Región"
              value={form.region}
              onChange={(e) =>
                setForm({
                  ...form,
                  region: e.target.value,
                  comuna:
                    regiones.find((r) => r.nombre === e.target.value)?.comunas[0] ?? form.comuna,
                })
              }
              options={regionesOpt}
            />
            <Select
              label="Comuna"
              value={form.comuna}
              onChange={(e) => setForm({ ...form, comuna: e.target.value })}
              options={comunasOpt}
            />
          </div>
          <Textarea
            label="Bio"
            value={form.bio ?? ''}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Cuéntale a tus clientes quién eres y qué haces…"
          />

          {error && (
            <div className="rounded-lg border border-rust/30 bg-rust/5 px-3 py-2 text-sm text-rust">
              {error}
            </div>
          )}
          {ok && (
            <div className="rounded-lg border border-moss/30 bg-moss/5 px-3 py-2 text-sm text-moss">
              Cambios guardados.
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="primary" size="md" type="submit" loading={saving}>
              <CheckCircle2 className="h-4 w-4" /> Guardar cambios
            </Button>
          </div>
        </div>

        <VerificacionesCard />
      </form>
    </div>
  )
}

