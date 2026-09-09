import { describe, expect, it } from 'vitest'

import { formatCurrency, formatDate, normalizeText, sleep } from './index'

describe('normalizeText', () => {
  it('quita acentos, baja a minúsculas y colapsa espacios', () => {
    expect(normalizeText('  Diseño   DE  la   API ')).toBe('diseno de la api')
  })

  it('deja intacto un texto ya normalizado', () => {
    expect(normalizeText('taskflow')).toBe('taskflow')
  })
})

describe('formatDate', () => {
  it('formatea una fecha válida', () => {
    expect(formatDate('2026-09-09T00:00:00.000Z')).toContain('2026')
  })

  it('devuelve cadena vacía si la fecha no es válida', () => {
    expect(formatDate('no-es-una-fecha')).toBe('')
  })
})

describe('formatCurrency', () => {
  it('formatea con el símbolo de la moneda', () => {
    expect(formatCurrency(1234.5, 'EUR', 'es-ES')).toContain('€')
  })
})

describe('sleep', () => {
  it('resuelve después del tiempo indicado', async () => {
    const start = Date.now()
    await sleep(20)
    expect(Date.now() - start).toBeGreaterThanOrEqual(15)
  })
})
