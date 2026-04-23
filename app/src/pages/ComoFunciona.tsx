import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Sparkles, Users, HeartHandshake } from 'lucide-react'

export function ComoFunciona() {
  return (
    <div className="container-page py-12 md:py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-ember">Cómo funciona</p>
      <h1 className="font-display text-5xl md:text-6xl font-semibold max-w-2xl">
        Confianza entre manos <span className="italic text-ember">ásperas</span>.
      </h1>
      <p className="mt-4 max-w-2xl text-ink-500">
        Somos una plataforma de oficios y herramientas hecha para que contratar en Chile sea simple,
        justo y sin susto. Así te cuidamos de punta a punta.
      </p>

      <ol className="mt-14 grid gap-6 md:grid-cols-2">
        {[
          {
            n: '01',
            t: 'Escribe o pregunta',
            d: 'Busca por categoría o pregúntale al asistente. Él entiende tu proyecto y recomienda los mejores.',
            icon: Sparkles,
          },
          {
            n: '02',
            t: 'Paga al escrow',
            d: 'Tu plata queda protegida. No se libera hasta que apruebas el trabajo finalizado.',
            icon: ShieldCheck,
          },
          {
            n: '03',
            t: 'Trabaja con tu cuadrilla',
            d: 'Chat directo, documentos adjuntos y seguimiento claro. Los reseñables están del otro lado.',
            icon: Users,
          },
          {
            n: '04',
            t: 'Calificación mutua',
            d: 'Ambos se califican. Las buenas reseñas te suben en el ranking para la próxima.',
            icon: HeartHandshake,
          },
        ].map((s) => (
          <li key={s.n} className="ticket p-6">
            <div className="flex items-center justify-between">
              <span className="font-mono text-ember">{s.n}</span>
              <s.icon className="h-6 w-6 text-navy" />
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold">{s.t}</h2>
            <p className="mt-2 text-ink-500">{s.d}</p>
          </li>
        ))}
      </ol>

      <div className="mt-16 flex flex-wrap items-center gap-4">
        <Link to="/registro" className="btn-ember btn-lg">
          Crear cuenta gratis <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/asistente" className="btn-outline btn-lg">
          Probar asistente <Sparkles className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}
