/** Formatea una fecha en formato local corto (p. ej. "9 sept 2026"). */
export function formatDate(value: Date | string, locale = 'es-ES'): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

/** Formatea fecha y hora (p. ej. "9 sept 2026, 14:05"). */
export function formatDateTime(value: Date | string, locale = 'es-ES'): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
