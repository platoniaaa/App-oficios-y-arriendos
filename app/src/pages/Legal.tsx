export function Terminos() {
  return <LegalPage titulo="Términos y Condiciones" seccion="Tu contrato con Cuadrilla" />
}
export function Privacidad() {
  return <LegalPage titulo="Política de Privacidad" seccion="Cómo tratamos tus datos" />
}

function LegalPage({ titulo, seccion }: { titulo: string; seccion: string }) {
  return (
    <div className="container-page max-w-3xl py-12">
      <p className="font-mono text-xs uppercase text-ember">{seccion}</p>
      <h1 className="font-display text-4xl md:text-5xl font-semibold mb-6">{titulo}</h1>
      <div className="prose prose-navy max-w-none">
        <p className="text-ink-500">
          Este es un documento placeholder del MVP. En la versión final incluirá los términos aplicables al
          uso de la plataforma en Chile, la política de protección de datos personales conforme a la Ley
          19.628 y las reglas específicas del modelo escrow.
        </p>
        <p className="text-ink-500">
          Mientras tanto, operamos bajo un principio simple: transparencia total sobre precios, reseñas
          reales y pago solo cuando el trabajo está hecho.
        </p>
      </div>
    </div>
  )
}
