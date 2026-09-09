import { describe, expect, it } from 'vitest'

import {
  createProjectSchema,
  createTaskSchema,
  idParamsSchema,
  listTasksQuerySchema,
  loginSchema,
  paginationQuerySchema,
  registerSchema,
  updateProjectSchema,
  updateTaskSchema,
} from './index'

/**
 * Estos schemas son el contrato entre API, web y mobile. Lo que se prueba aquí
 * es lo que las tres aplicaciones dan por hecho.
 */

describe('registerSchema', () => {
  it('normaliza el email: recorta espacios y baja a minúsculas', () => {
    const result = registerSchema.parse({
      name: 'Ana',
      email: '  ANA@TaskFlow.test  ',
      password: 'Password123!',
    })

    expect(result.email).toBe('ana@taskflow.test')
  })

  it('recorta los espacios del nombre', () => {
    const result = registerSchema.parse({
      name: '  Ana García  ',
      email: 'ana@taskflow.test',
      password: 'Password123!',
    })

    expect(result.name).toBe('Ana García')
  })

  it('rechaza una contraseña demasiado corta', () => {
    const result = registerSchema.safeParse({
      name: 'Ana',
      email: 'ana@taskflow.test',
      password: 'corta',
    })

    expect(result.success).toBe(false)
  })

  it('rechaza un email mal formado', () => {
    const result = registerSchema.safeParse({
      name: 'Ana',
      email: 'no-es-un-email',
      password: 'Password123!',
    })

    expect(result.success).toBe(false)
  })

  it('descarta los campos que no forman parte del contrato', () => {
    const result = registerSchema.parse({
      name: 'Ana',
      email: 'ana@taskflow.test',
      password: 'Password123!',
      role: 'ADMIN',
    })

    expect(result).not.toHaveProperty('role')
  })
})

describe('loginSchema', () => {
  it('no aplica las reglas de fortaleza a la contraseña', () => {
    // Si login exigiera 8 caracteres, un atacante podría deducir la política
    // de contraseñas sin tener ninguna cuenta.
    const result = loginSchema.safeParse({ email: 'ana@taskflow.test', password: 'x' })

    expect(result.success).toBe(true)
  })

  it('exige que la contraseña no venga vacía', () => {
    const result = loginSchema.safeParse({ email: 'ana@taskflow.test', password: '' })

    expect(result.success).toBe(false)
  })
})

describe('createTaskSchema', () => {
  it('acepta solo los tres estados del dominio', () => {
    expect(createTaskSchema.safeParse({ title: 'X', status: 'DONE' }).success).toBe(true)
    expect(createTaskSchema.safeParse({ title: 'X', status: 'ARCHIVADA' }).success).toBe(false)
  })

  it('exige título', () => {
    expect(createTaskSchema.safeParse({ description: 'sin título' }).success).toBe(false)
    expect(createTaskSchema.safeParse({ title: '   ' }).success).toBe(false)
  })

  it('limita la longitud del título', () => {
    expect(createTaskSchema.safeParse({ title: 'a'.repeat(151) }).success).toBe(false)
  })
})

describe('schemas de actualización (PATCH)', () => {
  it('aceptan un solo campo', () => {
    expect(updateProjectSchema.safeParse({ name: 'Nuevo' }).success).toBe(true)
    expect(updateTaskSchema.safeParse({ status: 'DONE' }).success).toBe(true)
  })

  it('rechazan un cuerpo vacío: un PATCH sin cambios es un error del cliente', () => {
    expect(updateProjectSchema.safeParse({}).success).toBe(false)
    expect(updateTaskSchema.safeParse({}).success).toBe(false)
  })
})

describe('createProjectSchema', () => {
  it('deja la descripción como opcional', () => {
    expect(createProjectSchema.safeParse({ name: 'Proyecto' }).success).toBe(true)
  })
})

describe('paginationQuerySchema', () => {
  it('convierte los strings de la URL en números', () => {
    const result = paginationQuerySchema.parse({ page: '2', limit: '5' })

    expect(result).toEqual({ page: 2, limit: 5 })
  })

  it('aplica valores por defecto si no vienen', () => {
    expect(paginationQuerySchema.parse({})).toEqual({ page: 1, limit: 20 })
  })

  it('pone un techo al límite para que nadie pida la tabla entera', () => {
    expect(paginationQuerySchema.safeParse({ limit: '10000' }).success).toBe(false)
  })

  it('rechaza páginas cero o negativas', () => {
    expect(paginationQuerySchema.safeParse({ page: '0' }).success).toBe(false)
    expect(paginationQuerySchema.safeParse({ page: '-1' }).success).toBe(false)
  })
})

describe('listTasksQuerySchema', () => {
  it('hereda la paginación y añade el filtro por estado', () => {
    const result = listTasksQuerySchema.parse({ status: 'TODO' })

    expect(result).toEqual({ page: 1, limit: 20, status: 'TODO' })
  })
})

describe('idParamsSchema', () => {
  it('exige un UUID', () => {
    expect(idParamsSchema.safeParse({ id: '11111111-1111-4111-8111-111111111111' }).success).toBe(
      true,
    )
    expect(idParamsSchema.safeParse({ id: '123' }).success).toBe(false)
  })
})
