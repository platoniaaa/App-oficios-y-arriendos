const latency = () => 180 + Math.random() * 300

export function fakeLatency<T>(payload: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(payload), latency()))
}

export function uid(prefix = 'x'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}
