import { Component, type ReactNode } from 'react'

interface State {
  error: Error | null
}

interface Props {
  children: ReactNode
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container-page py-16">
          <div className="ticket p-6 md:p-10 space-y-4 max-w-2xl mx-auto">
            <p className="font-mono text-xs uppercase tracking-widest text-rust">
              Error en la página
            </p>
            <h1 className="font-display text-3xl font-semibold">
              Algo se rompió al cargar esta pantalla
            </h1>
            <p className="text-ink-500">
              Pega esto en el chat para que pueda ayudarte a arreglarlo:
            </p>
            <pre className="overflow-auto rounded-lg border border-rust/30 bg-rust/5 px-3 py-2 text-xs text-rust max-h-64">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={this.reset}
                className="btn-primary btn-md"
              >
                Reintentar
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = '/')}
                className="btn-ghost btn-md"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
