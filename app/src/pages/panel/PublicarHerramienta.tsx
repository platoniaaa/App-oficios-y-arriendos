import { useState } from 'react'
import { Stepper } from '@/components/ui/Stepper'
import { Button } from '@/components/ui/Button'
import { Input, Textarea, Select } from '@/components/ui/Input'
import { categoriasHerramientas } from '@/mocks/categorias'
import { todasLasComunas } from '@/mocks/regiones'
import { ArrowLeft, ArrowRight, Plus, Upload, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/stores/useAuth'
import { herramientas } from '@/mocks/herramientas'
import { uid } from '@/lib/mockApi'
import type { Herramienta, RetiroModalidad, EstadoHerramienta } from '@/types'

const steps = ['Categoría', 'Info', 'Fotos', 'Tarifas', 'Ubicación', 'Confirmar']

export function PublicarHerramienta() {
  const user = useAuth((s) => s.user())!
  const [step, setStep] = useState(0)
  const [fotos, setFotos] = useState<string[]>([])
  const [form, setForm] = useState({
    categoria: '',
    subcategoria: '',
    titulo: '',
    marca: '',
    modelo: '',
    estado: 'buena' as EstadoHerramienta,
    descripcion: '',
    porHora: 0,
    porDia: 15000,
    porSemana: 0,
    deposito: 50000,
    comuna: user.comuna,
    retiro: 'ambos' as RetiroModalidad,
    delivery: true,
    fechaDesde: new Date().toISOString().slice(0, 10),
    fechaHasta: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
  })
  const nav = useNavigate()

  function publicar() {
    const nueva: Herramienta = {
      id: uid('h'),
      propietarioId: user.id,
      titulo: form.titulo,
      categoria: form.categoria,
      subcategoria: form.subcategoria,
      marca: form.marca,
      modelo: form.modelo,
      descripcion: form.descripcion,
      estado: form.estado,
      fotos: fotos.length ? fotos : ['https://picsum.photos/seed/new-tool/900/700'],
      tarifa: {
        porHora: form.porHora || undefined,
        porDia: form.porDia || undefined,
        porSemana: form.porSemana || undefined,
      },
      depositoGarantia: form.deposito,
      requiereEntrega: form.delivery,
      comunaUbicacion: form.comuna,
      retiro: form.retiro,
      disponibilidad: [{ desde: form.fechaDesde, hasta: form.fechaHasta }],
      totalArriendos: 0,
      calificacion: 0,
    }
    herramientas.unshift(nueva)
    nav('/panel/mis-publicaciones')
  }

  const cat = categoriasHerramientas.find((c) => c.nombre === form.categoria)

  return (
    <div className="space-y-8">
      <header>
        <p className="font-mono text-xs uppercase text-ember">Publicar herramienta</p>
        <h1 className="font-display text-4xl font-semibold">Pon tu equipo a trabajar</h1>
      </header>
      <Stepper steps={steps} current={step} />
      <div className="ticket p-6 md:p-8 animate-fade-up">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Categoría</h2>
            <Select
              label="Tipo de herramienta"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value, subcategoria: '' })}
              placeholder="Elige categoría"
              options={categoriasHerramientas.map((c) => ({ value: c.nombre, label: c.nombre }))}
            />
            {cat?.subcategorias && (
              <Select
                label="Subcategoría"
                value={form.subcategoria}
                onChange={(e) => setForm({ ...form, subcategoria: e.target.value })}
                placeholder="Elige subcategoría"
                options={cat.subcategorias.map((s) => ({ value: s, label: s }))}
              />
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Datos del equipo</h2>
            <Input label="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ej: Taladro percutor Bosch" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Marca" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
              <Input label="Modelo" value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
            </div>
            <Select
              label="Estado"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoHerramienta })}
              options={[
                { value: 'nueva', label: 'Nueva' },
                { value: 'buena', label: 'Buen estado' },
                { value: 'aceptable', label: 'Aceptable' },
              ]}
            />
            <Textarea label="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Fotos (1–8)</h2>
            <div className="grid grid-cols-3 gap-3">
              {fotos.map((src, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-xl border border-navy/10">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button type="button" className="absolute right-2 top-2 rounded-full bg-cream p-1" onClick={() => setFotos(fotos.filter((_, k) => k !== i))}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {fotos.length < 8 && (
                <button
                  type="button"
                  onClick={() => setFotos([...fotos, `https://picsum.photos/seed/toolnew-${Date.now()}-${fotos.length}/700/700`])}
                  className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-navy/25 hover:border-navy"
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-6 w-6" />
                    <p className="mt-1 text-xs font-semibold">Agregar foto</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Tarifas</h2>
            <p className="text-sm text-ink-500">Debes ingresar al menos una modalidad. Deja en 0 las que no aplican.</p>
            <div className="grid sm:grid-cols-3 gap-3">
              <Input label="Por hora (CLP)" type="number" value={form.porHora} onChange={(e) => setForm({ ...form, porHora: Number(e.target.value) })} />
              <Input label="Por día (CLP)" type="number" value={form.porDia} onChange={(e) => setForm({ ...form, porDia: Number(e.target.value) })} />
              <Input label="Por semana (CLP)" type="number" value={form.porSemana} onChange={(e) => setForm({ ...form, porSemana: Number(e.target.value) })} />
            </div>
            <Input label="Depósito en garantía (CLP)" type="number" value={form.deposito} onChange={(e) => setForm({ ...form, deposito: Number(e.target.value) })} />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Ubicación y retiro</h2>
            <Select
              label="Comuna"
              value={form.comuna}
              onChange={(e) => setForm({ ...form, comuna: e.target.value })}
              options={todasLasComunas.map((c) => ({ value: c, label: c }))}
            />
            <Select
              label="Modalidad de retiro"
              value={form.retiro}
              onChange={(e) => setForm({ ...form, retiro: e.target.value as RetiroModalidad })}
              options={[
                { value: 'domicilio_propietario', label: 'Retiro en domicilio del dueño' },
                { value: 'delivery', label: 'Envío a domicilio del cliente' },
                { value: 'ambos', label: 'Ambas opciones' },
              ]}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-navy"
                checked={form.delivery}
                onChange={(e) => setForm({ ...form, delivery: e.target.checked })}
              />
              Ofrecemos delivery con costo adicional
            </label>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Disponible desde" type="date" value={form.fechaDesde} onChange={(e) => setForm({ ...form, fechaDesde: e.target.value })} />
              <Input label="Disponible hasta" type="date" value={form.fechaHasta} onChange={(e) => setForm({ ...form, fechaHasta: e.target.value })} />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold">Revisa y publica</h2>
            <ul className="space-y-2 rounded-2xl bg-cream-soft p-5 text-sm">
              <li><strong>Título:</strong> {form.titulo || '—'}</li>
              <li><strong>Categoría:</strong> {form.categoria} / {form.subcategoria}</li>
              <li><strong>Marca/Modelo:</strong> {form.marca} {form.modelo}</li>
              <li><strong>Estado:</strong> {form.estado}</li>
              <li><strong>Tarifas:</strong> día {form.porDia.toLocaleString()} · hora {form.porHora || 0} · semana {form.porSemana || 0}</li>
              <li><strong>Depósito:</strong> {form.deposito.toLocaleString()} CLP</li>
              <li><strong>Ubicación:</strong> {form.comuna}</li>
            </ul>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" size="md" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
            <ArrowLeft className="h-4 w-4" /> Atrás
          </Button>
          {step < steps.length - 1 ? (
            <Button variant="primary" size="md" onClick={() => setStep(step + 1)}>
              Continuar <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ember" size="md" onClick={publicar}>
              <Plus className="h-4 w-4" /> Publicar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
