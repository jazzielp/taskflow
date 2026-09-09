import { describe, expect, it } from 'vitest'

import { canManageProject, canManageTask, isProjectOwner } from './ownership'

const owner = { id: 'user-1', role: 'USER' } as const
const otherUser = { id: 'user-2', role: 'USER' } as const
const admin = { id: 'admin-1', role: 'ADMIN' } as const
const project = { ownerId: 'user-1' }

describe('isProjectOwner', () => {
  it('reconoce al propietario', () => {
    expect(isProjectOwner(project, owner)).toBe(true)
  })

  it('rechaza a otro usuario', () => {
    expect(isProjectOwner(project, otherUser)).toBe(false)
  })

  it('un ADMIN no es propietario solo por ser ADMIN', () => {
    expect(isProjectOwner(project, admin)).toBe(false)
  })
})

describe('canManageProject', () => {
  it('el propietario puede gestionar su proyecto', () => {
    expect(canManageProject(project, owner)).toBe(true)
  })

  it('otro usuario NO puede gestionar un proyecto ajeno', () => {
    expect(canManageProject(project, otherUser)).toBe(false)
  })

  it('un ADMIN sí puede', () => {
    expect(canManageProject(project, admin)).toBe(true)
  })
})

describe('canManageTask', () => {
  it('hereda el permiso del proyecto que contiene la tarea', () => {
    expect(canManageTask(project, owner)).toBe(true)
    expect(canManageTask(project, otherUser)).toBe(false)
  })
})
