import { describe, expect, it } from 'vitest'

import { canMoveTaskToStatus, nextStatusesFor } from './task-status'

describe('canMoveTaskToStatus', () => {
  it('permite empezar y terminar una tarea pendiente', () => {
    expect(canMoveTaskToStatus('TODO', 'IN_PROGRESS')).toBe(true)
    expect(canMoveTaskToStatus('TODO', 'DONE')).toBe(true)
  })

  it('permite reabrir una tarea terminada como "en progreso"', () => {
    expect(canMoveTaskToStatus('DONE', 'IN_PROGRESS')).toBe(true)
  })

  it('no permite devolver una tarea terminada a "por hacer"', () => {
    expect(canMoveTaskToStatus('DONE', 'TODO')).toBe(false)
  })

  it('no permite mover una tarea a su estado actual', () => {
    expect(canMoveTaskToStatus('TODO', 'TODO')).toBe(false)
    expect(canMoveTaskToStatus('IN_PROGRESS', 'IN_PROGRESS')).toBe(false)
    expect(canMoveTaskToStatus('DONE', 'DONE')).toBe(false)
  })
})

describe('nextStatusesFor', () => {
  it('no incluye nunca el estado actual', () => {
    for (const status of ['TODO', 'IN_PROGRESS', 'DONE'] as const) {
      expect(nextStatusesFor(status)).not.toContain(status)
    }
  })
})
