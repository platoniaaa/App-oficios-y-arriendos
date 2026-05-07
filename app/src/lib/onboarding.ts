// Flags de onboarding por usuario, persistidos en localStorage.
// Migrar a una columna en profiles si llega a importar para analítica.

const KEY = 'cuadrilla:onboarding'

interface OnboardingState {
  bienvenida?: boolean
  tourPanel?: boolean
}

function read(): Record<string, OnboardingState> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}')
  } catch {
    return {}
  }
}

function write(data: Record<string, OnboardingState>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // ignore quota / private mode
  }
}

export function isBienvenidaDone(userId: string): boolean {
  return Boolean(read()[userId]?.bienvenida)
}

export function markBienvenidaDone(userId: string) {
  const data = read()
  data[userId] = { ...data[userId], bienvenida: true }
  write(data)
}

export function isTourPanelDone(userId: string): boolean {
  return Boolean(read()[userId]?.tourPanel)
}

export function markTourPanelDone(userId: string) {
  const data = read()
  data[userId] = { ...data[userId], tourPanel: true }
  write(data)
}

// Llamado al final de /bienvenida — marca ambos lo "primer uso" y deja el tour del panel pendiente.
export function markOnboardingDone(userId: string) {
  markBienvenidaDone(userId)
}
