/** Espera `ms` milisegundos. Útil en reintentos y en tests. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
