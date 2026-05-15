import { useState } from 'react'
import { Stepper } from '@/components/ui/Stepper'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { oficios } from '@/mocks/categorias'
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import { crearServicio } from '@/lib/queries/servicios'
import { UploadFotos } from '@/components/feature/UploadFotos'
import { ComunasSelector } from '@/components/feature/ComunasSelector'

const steps = ['Oficio', 'Descripción', 'Tarifa', 'Zonas', 'Galería', 'Confirmar']

export function PublicarServicio() {
  const user = useAuth((s) => s.user())!
  const [step, setStep] = useState(0)
  const [zonas, setZonas] = useState<string[]>([])
  const [galeria, setGaleria] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    oficio: '',
    categorias: [] as string[],
    descripcion: '',
    experiencia: 2,
    tipoTarifa: 'hora' as 'hora' | 'dia' | 'visita' | 'a_convenir',
    monto: 15000,
    disponibilidad: 'inmediata' as 'inmediata' | 'agendada' | 'ocupado',
  })
  const nav = useNavigate()

  async function publicar() {
    setError(null)
    if (!form.oficio) {
      setError('Elige un oficio.')
      return
    }
    setSubmitting(true)
    try {
      await crearServicio({
        trabajador_id: user.id,
        oficio: form.oficio,
        categorias: form.categorias,
        descripcion: form.descripcion,
        experiencia_anios: form.experiencia,
        tarifa_tipo: form.tipoTarifa,
        tarifa_monto: form.tipoTarifa === 'a_convenir' ? null : form.monto,
        zonas_cobertura: zonas,
        disponibilidad: form.disponibilidad,
        galeria_trabajos: galeria,
        faq: null,
        estado: 'activo',
      })
      nav('/panel/mis-publicaciones')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo publicar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase text-ember">Publicar servicio</p>
        <h1 className="font-display text-4xl font-semibold">Cuenta qué haces bien</h1>
      </header>

      <Stepper steps={steps} current={step} />

      <div className="ticket p-6 md:p-8 animate-fade-up">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">¿Cuál es tu oficio principal?</h2>
            <Select
              label="Oficio"
              value={form.oficio}
              onChange={(e) => setForm({ ...form, oficio: e.target.value })}
              placeholder="Elige tu oficio"
              options={oficios.map((o) => ({ value: o.nombre, label: o.nombre }))}
            />
            <p className="label-base">Especialidades (elige hasta 3)</p>
            <div className="flex flex-wrap gap-2">
              {oficios
                .find((o) => o.nombre === form.oficio)
                ?.subcategorias?.map((sc) => {
                  const active = form.categorias.includes(sc)
                  return (
                    <button
                      key={sc}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          categorias: active
                            ? form.categorias.filter((c) => c !== sc)
                            : [...form.categorias, sc].slice(0, 3),
                        })
                      }
                      className={'chip ' + (active ? 'bg-navy text-cream border-navy' : '')}
                    >
                      {sc}
                    </button>
                  )
                })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Describe tu servicio</h2>
            <Textarea
              label="Descripción"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Cuenta qué haces, qué materiales incluyes, garantías, etc."
            />
            <Input
              label="Años de experiencia"
              type="number"
              min={0}
              placeholder="0"
              value={form.experiencia === 0 ? '' : form.experiencia}
              onChange={(e) => setForm({ ...form, experiencia: e.target.value === '' ? 0 : Number(e.target.value) })}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Tarifa referencial</h2>
            <Select
              label="Modalidad"
              value={form.tipoTarifa}
              onChange={(e) => setForm({ ...form, tipoTarifa: e.target.value as typeof form.tipoTarifa })}
              options={[
                { value: 'hora', label: 'Por hora' },
                { value: 'dia', label: 'Por día' },
                { value: 'visita', label: 'Por visita' },
                { value: 'a_convenir', label: 'A convenir' },
              ]}
            />
            {form.tipoTarifa !== 'a_convenir' && (
              <Input
                label="Monto (CLP)"
                type="number"
                min={0}
                step={1000}
                placeholder="Ej: 15000"
                value={form.monto === 0 ? '' : form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value === '' ? 0 : Number(e.target.value) })}
              />
            )}
            <Select
              label="Disponibilidad"
              value={form.disponibilidad}
              onChange={(e) => setForm({ ...form, disponibilidad: e.target.value as typeof form.disponibilidad })}
              options={[
                { value: 'inmediata', label: 'Inmediata' },
                { value: 'agendada', label: 'Agendable' },
                { value: 'ocupado', label: 'Actualmente ocupado' },
              ]}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Zonas donde atiendes</h2>
            <p className="text-sm text-ink-500">
              Busca tu comuna o selecciona toda una región completa.
            </p>
            <ComunasSelector value={zonas} onChange={setZonas} sugerida={user.comuna} />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Galería de trabajos</h2>
            <p className="text-sm text-ink-500">
              Sube fotos de tus mejores trabajos. JPG/PNG hasta 5 MB cada una. Hasta 6 fotos.
            </p>
            <UploadFotos bucket="gallery" fotos={galeria} onChange={setGaleria} max={6} />
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Revisa tu publicación</h2>
            <ul className="space-y-2 rounded-2xl bg-cream-soft p-5 text-sm">
              <li><strong>Oficio:</strong> {form.oficio}</li>
              <li><strong>Especialidades:</strong> {form.categorias.join(', ') || '—'}</li>
              <li><strong>Experiencia:</strong> {form.experiencia} años</li>
              <li><strong>Tarifa:</strong> {form.tipoTarifa === 'a_convenir' ? 'A convenir' : `${form.monto.toLocaleString()} CLP / ${form.tipoTarifa}`}</li>
              <li><strong>Zonas:</strong> {zonas.join(', ') || '—'}</li>
              <li><strong>Disponibilidad:</strong> {form.disponibilidad}</li>
            </ul>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-rust/30 bg-rust/5 px-3 py-2 text-sm text-rust">
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0 || submitting}
          >
            <ArrowLeft className="h-4 w-4" /> Atrás
          </Button>
          {step < steps.length - 1 ? (
            <Button variant="primary" size="md" onClick={() => setStep(step + 1)}>
              Continuar <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ember" size="md" onClick={publicar} loading={submitting} disabled={submitting}>
              <Plus className="h-4 w-4" /> Publicar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
