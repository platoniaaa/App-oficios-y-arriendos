import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stepper } from '@/components/ui/Stepper'
import { Button } from '@/components/ui/Button'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { regiones } from '@/mocks/regiones'
import { Building2, User2, ArrowRight, ArrowLeft, CheckCircle2, Upload } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatRut, validateRut } from '@/lib/rut'
import { useAuth } from '@/stores/useAuth'
import type { Rol, TipoCuenta } from '@/types'
import type { ProfileRow } from '@/lib/profile'

const steps = ['Tipo', 'Intención', 'Datos', 'Verificación', 'Perfil', 'Confirmación']

interface Form {
  tipo: TipoCuenta
  intenciones: { contratarServicios: boolean; ofrecerOficio: boolean; arrendarHerramientas: boolean; tomarArriendo: boolean }
  nombre: string
  apellido: string
  razonSocial: string
  giro: string
  rut: string
  email: string
  telefono: string
  region: string
  comuna: string
  password: string
  verificacion: { cedulaArchivo?: string; certArchivo?: string; autoriza: boolean }
  bio: string
  fotoPerfil: string
  termsOk: boolean
}

const emptyForm: Form = {
  tipo: 'persona',
  intenciones: {
    contratarServicios: true,
    ofrecerOficio: false,
    arrendarHerramientas: false,
    tomarArriendo: false,
  },
  nombre: '',
  apellido: '',
  razonSocial: '',
  giro: '',
  rut: '',
  email: '',
  telefono: '',
  region: 'Metropolitana',
  comuna: 'Santiago',
  password: '',
  verificacion: { autoriza: false },
  bio: '',
  fotoPerfil: '',
  termsOk: false,
}

export function Registro() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<Form>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsConfirm, setNeedsConfirm] = useState(false)
  const register = useAuth((s) => s.register)
  const nav = useNavigate()

  function next() {
    setStep((s) => Math.min(s + 1, steps.length - 1))
  }
  function prev() {
    setStep((s) => Math.max(s - 1, 0))
  }

  async function finalizar() {
    setError(null)
    if (!form.email || !form.password) {
      setError('Email y contraseña son obligatorios.')
      return
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    const roles: Rol[] = []
    if (form.intenciones.contratarServicios || form.intenciones.tomarArriendo) roles.push('cliente')
    if (form.intenciones.ofrecerOficio) roles.push('trabajador')
    if (form.intenciones.arrendarHerramientas) roles.push('arrendador')
    if (roles.length === 0) roles.push('cliente')

    const perfil: Partial<ProfileRow> & { nombre: string } = {
      tipo: form.tipo,
      nombre: form.tipo === 'empresa' ? form.razonSocial : form.nombre,
      apellido: form.tipo === 'persona' ? form.apellido : null,
      razon_social: form.tipo === 'empresa' ? form.razonSocial : null,
      giro: form.tipo === 'empresa' ? form.giro : null,
      rut: form.rut,
      telefono: form.telefono,
      region: form.region,
      comuna: form.comuna,
      bio: form.bio || null,
      foto_perfil:
        form.fotoPerfil ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          form.nombre || form.razonSocial,
        )}`,
      roles,
      verif_rut: 'pendiente',
      verif_cedula: 'pendiente',
      verif_antecedentes: form.intenciones.ofrecerOficio ? 'pendiente' : 'no_aplica',
      verif_certificaciones: form.intenciones.ofrecerOficio ? 'pendiente' : 'no_aplica',
      nuevo_en_plataforma: true,
    }

    setSubmitting(true)
    const { user, error } = await register({
      email: form.email,
      password: form.password,
      perfil,
    })
    setSubmitting(false)

    if (error === 'CONFIRMAR_EMAIL') {
      setNeedsConfirm(true)
      return
    }
    if (error) {
      setError(error)
      return
    }
    if (user) nav('/panel')
  }

  if (needsConfirm) {
    return (
      <div className="container-page max-w-md py-16">
        <div className="ticket p-6 md:p-8 space-y-4">
          <h1 className="font-display text-3xl font-semibold">Revisa tu correo</h1>
          <p className="text-ink-500">
            Te enviamos un enlace de confirmación a <strong>{form.email}</strong>. Haz clic en él
            para activar tu cuenta y volver a iniciar sesión.
          </p>
          <button
            type="button"
            onClick={() => nav('/login')}
            className="btn-primary btn-lg w-full"
          >
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  const regionesOpt = regiones.map((r) => ({ value: r.nombre, label: r.nombre }))
  const comunasOpt =
    regiones.find((r) => r.nombre === form.region)?.comunas.map((c) => ({ value: c, label: c })) ?? []

  return (
    <div className="container-page max-w-3xl py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Registro</p>
      <h1 className="font-display text-4xl md:text-5xl font-semibold mt-1">Únete a la cuadrilla</h1>

      <div className="mt-8">
        <Stepper steps={steps} current={step} />
      </div>

      <div className="mt-8 ticket p-6 md:p-8 animate-fade-up">
        {step === 0 && (
          <Step title="¿Qué tipo de cuenta quieres crear?">
            <div className="grid grid-cols-2 gap-4">
              {(['persona', 'empresa'] as const).map((t) => {
                const active = form.tipo === t
                const Icon = t === 'persona' ? User2 : Building2
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, tipo: t })}
                    className={cn(
                      'rounded-2xl border-2 p-6 text-left transition',
                      active ? 'border-navy bg-cream-soft shadow-ticket-sm' : 'border-navy/10 hover:border-navy/30',
                    )}
                  >
                    <Icon className="h-8 w-8 text-ember" />
                    <p className="mt-4 font-display text-2xl capitalize">{t}</p>
                    <p className="text-sm text-ink-500 mt-1">
                      {t === 'persona' ? 'Vas a trabajar o contratar directamente.' : 'Tu empresa arrendará o subcontratará.'}
                    </p>
                  </button>
                )
              })}
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step title="¿Cómo vas a usar Cuadrilla?" subtitle="Puedes elegir varias opciones. Las puedes cambiar después.">
            <ul className="space-y-2">
              {(
                [
                  { key: 'contratarServicios', label: 'Quiero contratar servicios' },
                  {
                    key: 'ofrecerOficio',
                    label: 'Quiero ofrecer mi oficio',
                    disabled: form.tipo === 'empresa',
                  },
                  { key: 'tomarArriendo', label: 'Quiero tomar herramientas o maquinaria en arriendo' },
                  { key: 'arrendarHerramientas', label: 'Quiero arrendar mis herramientas o maquinaria' },
                ] as const
              ).map((opt) => {
                const active = form.intenciones[opt.key]
                return (
                  <li key={opt.key}>
                    <label
                      className={cn(
                        'flex items-center justify-between rounded-2xl border-2 p-4 transition cursor-pointer',
                        active ? 'border-navy bg-cream-soft' : 'border-navy/10 hover:border-navy/30',
                        'disabled' in opt && opt.disabled && 'pointer-events-none opacity-40',
                      )}
                    >
                      <span className="font-medium">{opt.label}</span>
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-navy"
                        checked={active}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            intenciones: { ...form.intenciones, [opt.key]: e.target.checked },
                          })
                        }
                      />
                    </label>
                  </li>
                )
              })}
            </ul>
          </Step>
        )}

        {step === 2 && (
          <Step title="Datos básicos">
            {form.tipo === 'persona' ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
                <Input label="Apellido" value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} required />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Razón social" value={form.razonSocial} onChange={(e) => setForm({ ...form, razonSocial: e.target.value })} required />
                <Input label="Giro" value={form.giro} onChange={(e) => setForm({ ...form, giro: e.target.value })} />
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="RUT"
                value={form.rut}
                onChange={(e) => setForm({ ...form, rut: formatRut(e.target.value) })}
                placeholder="12.345.678-9"
                error={form.rut && !validateRut(form.rut) ? 'RUT inválido' : undefined}
              />
              <Input
                label="Teléfono"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="+56 9 ..."
              />
            </div>
            <Input
              label="Correo"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Región"
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value, comuna: regiones.find((r) => r.nombre === e.target.value)?.comunas[0] ?? '' })}
                options={regionesOpt}
              />
              <Select
                label="Comuna"
                value={form.comuna}
                onChange={(e) => setForm({ ...form, comuna: e.target.value })}
                options={comunasOpt}
              />
            </div>
            <Input
              label="Contraseña"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Step>
        )}

        {step === 3 && (
          <Step
            title="Verificación"
            subtitle="Después de crear tu cuenta podrás subir tu cédula y certificaciones desde tu panel. Por ahora solo confirmamos los permisos."
          >
            <div className="rounded-2xl border border-ink-200 bg-cream-soft p-4 text-sm text-ink-500">
              <p className="font-semibold text-navy">¿Qué validamos?</p>
              <ul className="mt-2 space-y-1">
                <li>• <strong>RUT</strong> y <strong>cédula de identidad</strong> — para todas las cuentas.</li>
                {form.intenciones.ofrecerOficio && (
                  <>
                    <li>• <strong>Antecedentes</strong> — porque vas a ofrecer servicios.</li>
                    <li>• <strong>Certificaciones de oficio</strong> — opcional, sube las que tengas.</li>
                  </>
                )}
              </ul>
              <p className="mt-3 text-xs">
                Estos documentos los subirás desde <em>Mi cuenta</em> en tu panel después de crear la
                cuenta. Un equipo los revisa y aprueba.
              </p>
            </div>

            <label className="mt-4 flex items-start gap-2 rounded-xl border-2 border-navy/10 p-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-navy"
                checked={form.verificacion.autoriza}
                onChange={(e) =>
                  setForm({ ...form, verificacion: { ...form.verificacion, autoriza: e.target.checked } })
                }
              />
              Autorizo a Cuadrilla a consultar mis antecedentes en fuentes oficiales cuando suba mis
              documentos.
            </label>
          </Step>
        )}

        {step === 4 && (
          <Step
            title="Bio (opcional)"
            subtitle="Tu foto la subirás desde tu panel cuando entres. Por ahora cuéntanos un poco sobre ti."
          >
            <Textarea
              label="Cuéntanos brevemente sobre ti"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Ej: soy eléctrico con 8 años de experiencia en instalaciones residenciales…"
            />
          </Step>
        )}

        {step === 5 && (
          <Step title="Últimos detalles">
            <ul className="space-y-2 rounded-2xl border border-navy/10 bg-cream-soft p-4 text-sm">
              <li><strong>Tipo:</strong> {form.tipo}</li>
              <li><strong>Nombre:</strong> {form.tipo === 'persona' ? `${form.nombre} ${form.apellido}` : form.razonSocial}</li>
              <li><strong>Email:</strong> {form.email || '—'}</li>
              <li><strong>RUT:</strong> {form.rut || '—'}</li>
              <li>
                <strong>Roles:</strong>{' '}
                {[
                  form.intenciones.contratarServicios ? 'cliente' : null,
                  form.intenciones.ofrecerOficio ? 'trabajador' : null,
                  form.intenciones.arrendarHerramientas ? 'arrendador' : null,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </li>
            </ul>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-navy"
                checked={form.termsOk}
                onChange={(e) => setForm({ ...form, termsOk: e.target.checked })}
              />
              Acepto los <a className="underline" href="#/terminos">Términos y Condiciones</a> y la{' '}
              <a className="underline" href="#/privacidad">Política de Privacidad</a>.
            </label>
          </Step>
        )}

        {error && (
          <div className="mt-5 rounded-lg border border-rust/30 bg-rust/5 px-3 py-2 text-sm text-rust">
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" size="md" onClick={prev} disabled={step === 0 || submitting}>
            <ArrowLeft className="h-4 w-4" /> Atrás
          </Button>
          {step < steps.length - 1 ? (
            <Button variant="primary" size="md" onClick={next}>
              Continuar <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ember"
              size="md"
              onClick={finalizar}
              disabled={!form.termsOk || submitting}
              loading={submitting}
            >
              <CheckCircle2 className="h-4 w-4" /> Crear cuenta
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Step({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl md:text-3xl font-semibold">{title}</h2>
        {subtitle && <p className="text-ink-500 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function Uploader({ label, onChange, archivo }: { label: string; onChange: () => void; archivo?: string }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-navy/25 bg-cream-soft p-6 text-center transition hover:border-navy">
      <Upload className="h-8 w-8 text-navy/60 mb-2" />
      <p className="font-semibold">{archivo ?? label}</p>
      <p className="text-xs text-ink-400">Formato jpg/png/pdf (simulado)</p>
      <input
        type="file"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) onChange()
        }}
      />
    </label>
  )
}
