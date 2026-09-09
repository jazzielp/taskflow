/**
 * Normaliza texto para comparaciones y búsquedas:
 * minúsculas, sin acentos y sin espacios sobrantes.
 */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}
