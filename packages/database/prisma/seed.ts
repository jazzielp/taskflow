/**
 * Seed de desarrollo.
 *
 * Crea 1 admin, 2 usuarios, 3 proyectos y varias tareas para poder probar la
 * aplicación (y la regla de ownership) inmediatamente.
 *
 *   pnpm db:seed
 *
 * Es idempotente: se puede ejecutar tantas veces como haga falta.
 */
import argon2 from 'argon2'
import { config as loadEnv } from 'dotenv'

loadEnv({ path: new URL('../../../.env', import.meta.url).pathname, quiet: true })

const { prisma } = await import('../src/client')
const { Role, TaskStatus } = await import('../generated/prisma/enums')

const SEED_PASSWORD = 'Password123!'
const ADMIN_PASSWORD = 'Admin123!'

async function main(): Promise<void> {
  const [adminHash, userHash] = await Promise.all([
    argon2.hash(ADMIN_PASSWORD),
    argon2.hash(SEED_PASSWORD),
  ])

  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskflow.dev' },
    update: { name: 'Admin TaskFlow', passwordHash: adminHash, role: Role.ADMIN },
    create: {
      name: 'Admin TaskFlow',
      email: 'admin@taskflow.dev',
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  })

  const ana = await prisma.user.upsert({
    where: { email: 'ana@taskflow.dev' },
    update: { name: 'Ana García', passwordHash: userHash, role: Role.USER },
    create: {
      name: 'Ana García',
      email: 'ana@taskflow.dev',
      passwordHash: userHash,
      role: Role.USER,
    },
  })

  const luis = await prisma.user.upsert({
    where: { email: 'luis@taskflow.dev' },
    update: { name: 'Luis Ortega', passwordHash: userHash, role: Role.USER },
    create: {
      name: 'Luis Ortega',
      email: 'luis@taskflow.dev',
      passwordHash: userHash,
      role: Role.USER,
    },
  })

  // Empezamos de cero con los proyectos de los usuarios de seed.
  // Las tareas caen con ellos gracias a `onDelete: Cascade`.
  await prisma.project.deleteMany({
    where: { ownerId: { in: [admin.id, ana.id, luis.id] } },
  })

  await prisma.project.create({
    data: {
      name: 'Rediseño de la web',
      description: 'Nueva landing y sistema de diseño',
      ownerId: ana.id,
      tasks: {
        create: [
          { title: 'Auditar la web actual', status: TaskStatus.DONE },
          { title: 'Definir paleta y tipografías', status: TaskStatus.IN_PROGRESS },
          {
            title: 'Maquetar la home',
            description: 'Versión escritorio y móvil',
            status: TaskStatus.TODO,
          },
          { title: 'Revisar accesibilidad', status: TaskStatus.TODO },
        ],
      },
    },
  })

  await prisma.project.create({
    data: {
      name: 'Onboarding de clientes',
      description: 'Automatizar el alta de nuevos clientes',
      ownerId: ana.id,
      tasks: {
        create: [
          { title: 'Documentar el proceso actual', status: TaskStatus.DONE },
          { title: 'Plantilla de correo de bienvenida', status: TaskStatus.IN_PROGRESS },
          { title: 'Checklist para el equipo de soporte', status: TaskStatus.TODO },
        ],
      },
    },
  })

  await prisma.project.create({
    data: {
      name: 'App móvil v1',
      description: 'Primera versión con Expo',
      ownerId: luis.id,
      tasks: {
        create: [
          { title: 'Configurar el proyecto de Expo', status: TaskStatus.DONE },
          { title: 'Pantalla de login', status: TaskStatus.IN_PROGRESS },
          { title: 'Listado de proyectos', status: TaskStatus.TODO },
          { title: 'Detalle de proyecto con tareas', status: TaskStatus.TODO },
          { title: 'Publicar build interna', status: TaskStatus.TODO },
        ],
      },
    },
  })

  const [users, projects, tasks] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.task.count(),
  ])

  console.log('Seed completado.')
  console.table([
    { entidad: 'usuarios', total: users },
    { entidad: 'proyectos', total: projects },
    { entidad: 'tareas', total: tasks },
  ])
  console.log('\nCredenciales de prueba:')
  console.log(`  admin@taskflow.dev / ${ADMIN_PASSWORD}   (ADMIN)`)
  console.log(`  ana@taskflow.dev   / ${SEED_PASSWORD}    (USER, 2 proyectos)`)
  console.log(`  luis@taskflow.dev  / ${SEED_PASSWORD}    (USER, 1 proyecto)`)
}

try {
  await main()
} finally {
  await prisma.$disconnect()
}
