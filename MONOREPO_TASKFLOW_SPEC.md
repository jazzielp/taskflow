# Especificación del Monorepo — Aplicación Full Stack Didáctica

## 1. Objetivo

Construir una aplicación completa dentro de un **monorepo** para aprender y aplicar una arquitectura moderna, limpia y escalable, manteniendo la lógica de negocio intencionalmente simple.

La aplicación tendrá:

- **Frontend Web:** React + TypeScript + Vite
- **Backend API:** Express + TypeScript
- **Base de datos:** PostgreSQL
- **ORM:** Prisma
- **Aplicación móvil:** React Native + Expo + TypeScript
- **Validación compartida:** Zod
- **Cliente API compartido:** Fetch o Axios
- **Monorepo:** pnpm Workspaces + Turborepo
- **Testing:** Vitest + Supertest + Playwright
- **Estándares:** ESLint + Prettier + TypeScript

La prioridad del proyecto es aprender correctamente:

1. Separación de responsabilidades.
2. Comunicación entre aplicaciones.
3. Código compartido.
4. Autenticación.
5. Autorización.
6. Validaciones.
7. Acceso a base de datos.
8. Manejo de errores.
9. Testing.
10. Escalabilidad del monorepo.

---

# 2. Aplicación de ejemplo

Se construirá una aplicación sencilla de administración de tareas llamada:

```text
TaskFlow
```

La lógica será deliberadamente simple.

Un usuario podrá:

- Registrarse.
- Iniciar sesión.
- Ver su perfil.
- Crear proyectos.
- Crear tareas dentro de un proyecto.
- Editar tareas.
- Cambiar el estado de una tarea.
- Eliminar tareas.
- Consultar sus proyectos y tareas.

Existirán dos roles:

```text
USER
ADMIN
```

El objetivo NO es crear una aplicación compleja.

El objetivo es utilizar una aplicación sencilla para aprender correctamente la arquitectura.

---

# 3. Arquitectura general

La arquitectura será:

```text
                    ┌──────────────────┐
                    │    Web React     │
                    │  Vite + TS       │
                    └────────┬─────────┘
                             │
                             │ HTTP
                             │
                    ┌────────▼─────────┐
                    │                  │
                    │   Express API    │
                    │                  │
                    └────────┬─────────┘
                             │
                             │ Prisma
                             │
                    ┌────────▼─────────┐
                    │   PostgreSQL     │
                    └──────────────────┘


                    ┌──────────────────┐
                    │ React Native     │
                    │ Expo + TS        │
                    └────────┬─────────┘
                             │
                             │ HTTP
                             │
                    ┌────────▼─────────┐
                    │   Express API    │
                    └──────────────────┘
```

Tanto Web como Mobile deberán consumir la misma API.

Ninguna aplicación cliente podrá acceder directamente a PostgreSQL o Prisma.

---

# 4. Regla principal de arquitectura

El backend será la autoridad del sistema.

Las reglas críticas deberán ejecutarse siempre en la API.

Por ejemplo:

```text
Usuario intenta eliminar tarea
        ↓
API recibe petición
        ↓
Autenticación
        ↓
Autorización
        ↓
Validación
        ↓
Servicio
        ↓
Repositorio
        ↓
Prisma
        ↓
PostgreSQL
```

Nunca se deberá confiar únicamente en validaciones del frontend.

---

# 5. Estructura del monorepo

La estructura base será:

```text
taskflow/
│
├── apps/
│   ├── web/
│   ├── api/
│   └── mobile/
│
├── packages/
│   ├── database/
│   ├── contracts/
│   ├── api-client/
│   ├── domain/
│   ├── auth/
│   ├── config/
│   └── utils/
│
├── tooling/
│   ├── eslint/
│   ├── prettier/
│   └── typescript/
│
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json
├── .gitignore
├── .env.example
└── README.md
```

---

# 6. Convención de paquetes

Todos los paquetes internos utilizarán el namespace:

```text
@taskflow/*
```

Ejemplos:

```text
@taskflow/database
@taskflow/contracts
@taskflow/api-client
@taskflow/domain
@taskflow/auth
@taskflow/config
@taskflow/utils
```

Nunca utilizar imports relativos largos como:

```ts
import { something } from "../../../../packages/utils/src";
```

Se deberá utilizar:

```ts
import { something } from "@taskflow/utils";
```

---

# 7. apps/web

Tecnologías:

```text
React
TypeScript
Vite
React Router
TanStack Query
```

Estructura:

```text
apps/web/
├── src/
│   ├── app/
│   │   ├── router/
│   │   └── providers/
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── projects/
│   │   └── tasks/
│   │
│   ├── components/
│   ├── layouts/
│   ├── hooks/
│   ├── pages/
│   ├── lib/
│   ├── main.tsx
│   └── App.tsx
│
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

# 8. apps/mobile

Se utilizará Expo.

Tecnologías:

```text
React Native
Expo
TypeScript
TanStack Query
```

Estructura:

```text
apps/mobile/
├── src/
│   ├── app/
│   ├── screens/
│   ├── features/
│   │   ├── auth/
│   │   ├── projects/
│   │   └── tasks/
│   │
│   ├── components/
│   ├── navigation/
│   ├── storage/
│   ├── hooks/
│   └── lib/
│
├── package.json
└── tsconfig.json
```

Web y Mobile podrán compartir:

- Tipos.
- Schemas Zod.
- Cliente API.
- Utilidades.
- Constantes.
- Algunas reglas puras de dominio.

No deberán compartir directamente:

- Componentes UI.
- Navegación.
- Pantallas.
- Hooks dependientes de plataforma.
- Almacenamiento local específico.

---

# 9. apps/api

Tecnologías:

```text
Express
TypeScript
Zod
Prisma
JWT o sesiones
PostgreSQL
```

Estructura:

```text
apps/api/
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.repository.ts
│   │   │
│   │   ├── users/
│   │   ├── projects/
│   │   └── tasks/
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── permission.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── config/
│   ├── lib/
│   └── routes/
│
├── package.json
└── tsconfig.json
```

---

# 10. Organización por dominio

El backend se organizará por módulos.

Correcto:

```text
modules/
├── auth/
├── users/
├── projects/
└── tasks/
```

Evitar como estructura principal:

```text
controllers/
services/
repositories/
routes/
```

La agrupación principal debe ser por dominio.

Cada módulo puede contener internamente:

```text
task.controller.ts
task.service.ts
task.repository.ts
task.routes.ts
```

---

# 11. Responsabilidad de cada capa del backend

## Route

Responsable únicamente de definir:

- URL.
- Método HTTP.
- Middleware.
- Controller.

Ejemplo conceptual:

```ts
router.post(
  "/",
  authenticate,
  validate(createTaskSchema),
  createTaskController
);
```

No deberá contener lógica de negocio.

---

## Controller

Responsable de:

- Leer `req`.
- Llamar al service.
- Devolver respuesta HTTP.

No deberá consultar Prisma directamente.

Ejemplo:

```ts
const task = await taskService.createTask({
  userId: req.user.id,
  input: req.body,
});

res.status(201).json(task);
```

---

## Service

Contiene la lógica de negocio.

Ejemplo:

```text
Verificar que el proyecto existe
Verificar que pertenece al usuario
Crear tarea
```

El service no debe conocer detalles HTTP.

No deberá utilizar:

```text
req
res
next
```

---

## Repository

Responsable del acceso a datos.

Aquí se utilizará Prisma.

Ejemplo:

```ts
prisma.task.create(...)
```

El repository deberá abstraer las consultas a base de datos.

---

# 12. packages/database

Prisma estará centralizado en:

```text
packages/database/
```

Estructura:

```text
packages/database/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── src/
│   ├── client.ts
│   └── index.ts
│
└── package.json
```

Uso:

```ts
import { prisma } from "@taskflow/database";
```

Solo aplicaciones del lado servidor podrán importar este paquete.

Permitido:

```text
apps/api
apps/worker
apps/cli
```

No permitido:

```text
apps/web
apps/mobile
```

---

# 13. Modelo de datos

El modelo inicial será sencillo.

## User

```text
id
name
email
passwordHash
role
createdAt
updatedAt
```

## Project

```text
id
name
description
ownerId
createdAt
updatedAt
```

## Task

```text
id
title
description
status
projectId
createdAt
updatedAt
```

Relaciones:

```text
User
 └── Projects
       └── Tasks
```

---

# 14. Estados de una tarea

Los estados permitidos serán:

```text
TODO
IN_PROGRESS
DONE
```

No deberán existir estados arbitrarios definidos desde frontend.

---

# 15. Prisma schema esperado

Conceptualmente:

```prisma
enum Role {
  USER
  ADMIN
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

model User {
  id           String    @id @default(uuid())
  name         String
  email        String    @unique
  passwordHash String
  role         Role      @default(USER)

  projects     Project[]

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Project {
  id          String   @id @default(uuid())
  name        String
  description String?

  ownerId     String
  owner       User     @relation(fields: [ownerId], references: [id])

  tasks       Task[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Task {
  id          String     @id @default(uuid())
  title       String
  description String?
  status      TaskStatus @default(TODO)

  projectId   String
  project     Project    @relation(fields: [projectId], references: [id])

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```

---

# 16. packages/contracts

Este paquete contendrá contratos compartidos.

Estructura:

```text
packages/contracts/
├── src/
│   ├── auth/
│   ├── users/
│   ├── projects/
│   ├── tasks/
│   └── index.ts
└── package.json
```

Se utilizará Zod.

Ejemplo:

```ts
import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().max(1000).optional(),
});

export type CreateTaskInput =
  z.infer<typeof createTaskSchema>;
```

Este schema podrá utilizarse en:

```text
Web
Mobile
API
```

---

# 17. Regla sobre validaciones

Las validaciones del frontend existen para mejorar UX.

Las validaciones del backend existen para proteger el sistema.

Por lo tanto:

```text
Frontend valida
        ↓
API vuelve a validar
        ↓
Service aplica reglas
```

Nunca asumir que el frontend ya validó correctamente.

---

# 18. packages/api-client

Contendrá el cliente HTTP compartido.

Estructura:

```text
packages/api-client/
├── src/
│   ├── client.ts
│   ├── auth.ts
│   ├── projects.ts
│   ├── tasks.ts
│   └── index.ts
└── package.json
```

Responsabilidades:

- Configurar URL base.
- Headers.
- Token.
- Serialización.
- Manejo consistente de errores.
- Métodos de API.

Ejemplo conceptual:

```ts
const api = createApiClient({
  baseUrl,
  getAccessToken,
});
```

---

# 19. Adaptadores de autenticación

Web y Mobile pueden almacenar sesión de forma diferente.

Web podría usar:

```text
HttpOnly Cookie
```

Mobile podría usar:

```text
SecureStore
```

Por lo tanto el cliente API no deberá depender directamente de:

```text
localStorage
SecureStore
cookies
```

Recibirá una función:

```ts
getAccessToken(): Promise<string | null>
```

---

# 20. Autenticación

Flujo inicial:

```text
POST /auth/register
POST /auth/login
POST /auth/logout
GET  /auth/me
```

El backend será responsable de:

- Validar credenciales.
- Hash de contraseña.
- Emitir sesión/token.
- Identificar usuario autenticado.

Nunca guardar contraseñas en texto plano.

---

# 21. Autorización

Regla:

```text
Autenticación = ¿Quién eres?
Autorización = ¿Qué puedes hacer?
```

Un usuario normal:

```text
USER
```

podrá:

- Crear sus proyectos.
- Consultar sus proyectos.
- Editar sus proyectos.
- Crear tareas dentro de sus proyectos.
- Editar sus tareas.
- Eliminar sus tareas.

No podrá modificar recursos de otro usuario.

Un administrador:

```text
ADMIN
```

podrá acceder a funciones administrativas que se agreguen posteriormente.

---

# 22. Regla de ownership

Toda operación sobre Project deberá comprobar:

```text
project.ownerId === authenticatedUser.id
```

Para una Task deberá comprobarse indirectamente:

```text
task.project.ownerId === authenticatedUser.id
```

Esto deberá verificarse en backend.

No basta con ocultar botones en frontend.

---

# 23. Endpoints mínimos

## Auth

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

## Projects

```text
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
```

## Tasks

```text
GET    /api/projects/:projectId/tasks
POST   /api/projects/:projectId/tasks
GET    /api/tasks/:id
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
```

Opcional:

```text
PATCH /api/tasks/:id/status
```

---

# 24. Convención de respuestas HTTP

Respuesta exitosa:

```json
{
  "data": {}
}
```

Lista:

```json
{
  "data": [],
  "meta": {
    "total": 0
  }
}
```

Error:

```json
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "Project not found"
  }
}
```

---

# 25. Códigos HTTP

Utilizar correctamente:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

No devolver siempre `200`.

---

# 26. Manejo de errores

Crear errores de dominio.

Ejemplo:

```text
ProjectNotFoundError
UnauthorizedProjectAccessError
TaskNotFoundError
EmailAlreadyExistsError
InvalidCredentialsError
```

El service lanza errores.

El middleware global decide cómo transformarlos a HTTP.

Ejemplo:

```text
Service
  ↓
ProjectNotFoundError
  ↓
Error Middleware
  ↓
HTTP 404
```

---

# 27. packages/domain

Este paquete solo se utilizará cuando exista lógica pura reutilizable.

Ejemplo:

```ts
function canMoveTaskToStatus(
  currentStatus,
  nextStatus
) {}
```

No deberá importar:

```text
Express
React
React Native
Prisma
```

Debe contener únicamente TypeScript puro.

No es obligatorio utilizarlo desde el primer día.

---

# 28. packages/utils

Solo utilidades realmente compartidas.

Ejemplos:

```text
formatDate
formatCurrency
normalizeText
sleep
```

Evitar convertir `utils` en un lugar donde se mete cualquier cosa.

---

# 29. packages/config

Puede almacenar:

- Constantes.
- Configuraciones compartidas.
- Variables de entorno tipadas.
- Configuración de features.

Debe evitar contener secretos del servidor accesibles a clientes.

---

# 30. Dependencias permitidas

Regla conceptual:

```text
apps/web
  ↓
contracts
api-client
utils

apps/mobile
  ↓
contracts
api-client
utils

apps/api
  ↓
database
contracts
domain
utils

api-client
  ↓
contracts

database
  ↓
Prisma

contracts
  ↓
Zod

domain
  ↓
TypeScript puro
```

---

# 31. Dependencias prohibidas

No permitido:

```text
web → database
mobile → database
web → api/src/*
mobile → api/src/*
api-client → database
contracts → database
domain → Express
domain → React
```

---

# 32. Variables de entorno

Cada aplicación tendrá sus propias variables.

Backend:

```text
apps/api/.env
```

Ejemplo:

```env
PORT=3000
DATABASE_URL=
JWT_SECRET=
```

Web:

```text
apps/web/.env
```

```env
VITE_API_URL=http://localhost:3000/api
```

Mobile:

```text
apps/mobile/.env
```

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

---

# 33. Regla de secretos

Nunca colocar en Web o Mobile:

```text
DATABASE_URL
DATABASE_PASSWORD
JWT_SECRET
API_PRIVATE_KEY
```

Todo código enviado al navegador o app móvil debe considerarse visible para el usuario.

---

# 34. Docker

Durante desarrollo, Docker se utilizará principalmente para infraestructura.

Archivo:

```text
docker-compose.yml
```

Inicialmente:

```text
PostgreSQL
```

Opcionalmente después:

```text
Redis
Mailpit
MinIO
```

React y Express podrán ejecutarse localmente mediante pnpm.

---

# 35. pnpm workspace

Archivo:

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

Los paquetes internos se instalarán con:

```json
{
  "dependencies": {
    "@taskflow/contracts": "workspace:*"
  }
}
```

---

# 36. Turborepo

Se utilizará Turborepo para ejecutar tareas.

Comandos esperados:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm test
pnpm typecheck
```

Desde raíz deberán delegarse a Turbo.

Ejemplo conceptual:

```json
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "typecheck": "turbo typecheck"
  }
}
```

---

# 37. Scripts mínimos por proyecto

Cada workspace deberá implementar cuando aplique:

```text
dev
build
lint
test
typecheck
```

No todos los paquetes necesitan `dev`.

---

# 38. TypeScript

Todo el proyecto deberá trabajar en modo estricto.

Utilizar:

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

Evitar:

```ts
any
```

salvo casos realmente justificados.

---

# 39. ESLint y Prettier

Configuración compartida desde:

```text
tooling/
```

Objetivo:

```text
Una sola configuración
        ↓
Web
API
Mobile
Packages
```

No copiar configuraciones completas en cada workspace.

---

# 40. Git

Usar ramas cortas por feature.

Ejemplos:

```text
main
develop
feature/auth
feature/projects
feature/tasks
fix/task-validation
```

Alternativamente se puede trabajar con trunk-based development.

Lo importante es mantener commits pequeños y claros.

---

# 41. Convención de commits

Recomendado:

```text
feat:
fix:
refactor:
test:
docs:
chore:
```

Ejemplos:

```text
feat: add task creation endpoint

fix: validate project ownership before update

refactor: move prisma client to database package
```

---

# 42. Testing

El proyecto deberá demostrar los tres niveles principales.

## Unit tests

Para funciones puras.

Ejemplo:

```text
domain
utils
services sin I/O
```

Herramienta:

```text
Vitest
```

---

## Integration tests

Para API y base de datos.

Ejemplo:

```text
POST /api/projects
GET /api/projects/:id
```

Herramientas:

```text
Vitest
Supertest
PostgreSQL de testing
```

---

## E2E

Para probar el flujo completo Web.

Ejemplo:

```text
Login
↓
Crear proyecto
↓
Crear tarea
↓
Cambiar a DONE
```

Herramienta:

```text
Playwright
```

---

# 43. Regla de testing

Las pruebas deben enfocarse especialmente en:

```text
Permisos
Ownership
Validaciones
Reglas de negocio
Endpoints críticos
```

No es necesario probar detalles internos triviales.

---

# 44. Flujo de creación de una tarea

Ejemplo completo:

```text
Usuario abre Web
        ↓
Formulario CreateTask
        ↓
Zod valida localmente
        ↓
api-client
        ↓
POST /api/projects/:projectId/tasks
        ↓
Express Route
        ↓
authenticate middleware
        ↓
validation middleware
        ↓
TaskController
        ↓
TaskService
        ↓
Verifica ownership del proyecto
        ↓
TaskRepository
        ↓
Prisma
        ↓
PostgreSQL
        ↓
Task creada
        ↓
JSON response
        ↓
TanStack Query actualiza cache
        ↓
UI muestra tarea
```

---

# 45. Flujo desde Mobile

Deberá ser prácticamente igual:

```text
React Native
      ↓
contracts
      ↓
api-client
      ↓
Express API
      ↓
Service
      ↓
Prisma
      ↓
PostgreSQL
```

La principal diferencia será la UI y almacenamiento de sesión.

---

# 46. TanStack Query

Se utilizará para estado remoto.

Ejemplos:

```text
projects
tasks
profile
```

No duplicar datos remotos innecesariamente en Context o Redux.

Ejemplo conceptual:

```ts
useQuery({
  queryKey: ["projects"],
  queryFn: api.projects.list,
});
```

---

# 47. Estado local

Usar React State para:

```text
modal abierto
texto temporal
filtros visuales
tabs
```

Usar TanStack Query para:

```text
datos provenientes de API
```

Agregar otra librería global de estado solo si aparece una necesidad real.

---

# 48. React Router

Rutas Web iniciales:

```text
/login
/register
/
/projects
/projects/:id
/profile
```

Rutas protegidas deberán exigir sesión.

Pero recordar:

```text
Route protegida en React = UX
Permiso en API = seguridad
```

---

# 49. Navegación Mobile

Pantallas iniciales:

```text
LoginScreen
RegisterScreen
ProjectListScreen
ProjectDetailScreen
ProfileScreen
```

---

# 50. Seguridad básica

Aplicar como mínimo:

- Hash seguro de contraseñas.
- Variables de entorno.
- Validación Zod.
- CORS configurado.
- Helmet.
- Rate limiting para auth.
- Manejo centralizado de errores.
- Logs sin secretos.
- Ownership.
- Autorización backend.
- Tokens/sesiones con expiración.

---

# 51. Contraseñas

No almacenar:

```text
password
```

Almacenar:

```text
passwordHash
```

Utilizar:

```text
argon2
```

o:

```text
bcrypt
```

---

# 52. Logs

Nunca registrar:

```text
passwords
JWT completos
cookies de sesión
secret keys
```

Los logs pueden contener:

```text
requestId
userId
method
path
statusCode
duration
```

---

# 53. Identificador de request

Cada request debería contar con un identificador.

Ejemplo:

```text
requestId
```

Esto facilita rastrear errores.

---

# 54. Seed

El proyecto deberá incluir un seed para generar:

```text
1 admin
2 usuarios
3 proyectos
varias tareas
```

Esto permitirá probar la aplicación rápidamente.

---

# 55. Migraciones

Toda modificación al schema deberá generar una migración Prisma.

No modificar manualmente producción sin migraciones.

Proceso:

```text
Editar schema.prisma
        ↓
Crear migration
        ↓
Aplicar migration
        ↓
Commit
```

---

# 56. README principal

El README deberá explicar:

1. Requisitos.
2. Instalación.
3. Variables de entorno.
4. Levantar PostgreSQL.
5. Ejecutar migraciones.
6. Ejecutar seed.
7. Ejecutar aplicaciones.
8. Ejecutar tests.
9. Estructura del monorepo.

---

# 57. Comandos objetivo

La experiencia ideal desde raíz:

```bash
pnpm install
```

Levantar PostgreSQL:

```bash
docker compose up -d
```

Migrar DB:

```bash
pnpm db:migrate
```

Seed:

```bash
pnpm db:seed
```

Desarrollo:

```bash
pnpm dev
```

Tests:

```bash
pnpm test
```

Lint:

```bash
pnpm lint
```

Typecheck:

```bash
pnpm typecheck
```

Build:

```bash
pnpm build
```

---

# 58. Orden recomendado de implementación

El agente deberá implementar el proyecto en este orden.

## Fase 1 — Monorepo

Crear:

```text
pnpm workspace
Turborepo
apps/*
packages/*
tooling/*
```

Verificar que todos los paquetes compilan.

---

## Fase 2 — PostgreSQL y Prisma

Crear:

```text
docker-compose.yml
database package
schema.prisma
migrations
seed
```

Verificar conexión.

---

## Fase 3 — API base

Crear:

```text
Express app
server
error middleware
health endpoint
```

Endpoint:

```text
GET /api/health
```

Respuesta:

```json
{
  "status": "ok"
}
```

---

## Fase 4 — Contracts

Crear schemas Zod para:

```text
auth
projects
tasks
```

---

## Fase 5 — Auth

Implementar:

```text
register
login
me
logout
authentication middleware
```

Agregar pruebas.

---

## Fase 6 — Projects

Implementar CRUD.

Agregar ownership.

Agregar pruebas.

---

## Fase 7 — Tasks

Implementar CRUD.

Agregar ownership vía Project.

Agregar pruebas.

---

## Fase 8 — API Client

Crear cliente reutilizable para:

```text
auth
projects
tasks
```

---

## Fase 9 — Web

Implementar:

```text
login
register
projects
project detail
tasks
profile
```

---

## Fase 10 — Mobile

Implementar las mismas capacidades funcionales básicas.

---

## Fase 11 — E2E

Probar flujo:

```text
registrarse
login
crear proyecto
crear tarea
completar tarea
logout
```

---

# 59. Reglas para el agente

El agente deberá seguir estas reglas estrictamente.

## Regla 1

No introducir tecnologías adicionales sin necesidad.

Evitar agregar por defecto:

```text
Redux
GraphQL
Kafka
Redis
RabbitMQ
microservices
CQRS
event sourcing
```

Este proyecto es didáctico.

---

## Regla 2

No sobrearquitectar.

Si una función simple resuelve el problema, utilizarla.

---

## Regla 3

Mantener las fronteras de arquitectura.

Nunca:

```text
web → prisma
mobile → prisma
web → archivos internos de api
```

---

## Regla 4

Toda regla de seguridad debe estar en backend.

---

## Regla 5

Toda entrada externa debe validarse.

Incluye:

```text
body
params
query
headers relevantes
```

---

## Regla 6

Evitar `any`.

---

## Regla 7

No duplicar tipos si pueden vivir correctamente en contracts.

---

## Regla 8

No compartir código específico de UI entre Web y Mobile en la primera versión.

---

## Regla 9

No guardar secretos en frontend.

---

## Regla 10

No llamar Prisma directamente desde controllers.

---

## Regla 11

Los services no deben depender de Express.

---

## Regla 12

Los repositories no deben manejar respuestas HTTP.

---

## Regla 13

Todo error inesperado deberá pasar por middleware global.

---

## Regla 14

Las pruebas deberán comprobar permisos y ownership.

---

## Regla 15

Cada paquete deberá tener exports públicos claros.

Ejemplo:

```ts
import { createTaskSchema } from "@taskflow/contracts";
```

Evitar:

```ts
import { createTaskSchema } from "@taskflow/contracts/src/tasks/create-task";
```

---

# 60. Definition of Done

Una feature se considera terminada cuando:

- Compila.
- Pasa TypeScript.
- Pasa ESLint.
- Tiene validación.
- Maneja errores.
- Respeta permisos.
- Tiene pruebas importantes.
- No rompe otras aplicaciones.
- Utiliza paquetes compartidos correctamente.
- Está documentada si introduce algo nuevo.

---

# 61. Primera versión funcional esperada

Al terminar, un usuario debe poder:

```text
Abrir Web o Mobile
        ↓
Registrarse
        ↓
Iniciar sesión
        ↓
Crear proyecto
        ↓
Abrir proyecto
        ↓
Crear tarea
        ↓
Cambiar estado
        ↓
Editar tarea
        ↓
Eliminar tarea
        ↓
Cerrar sesión
```

Y un usuario nunca deberá poder manipular proyectos o tareas pertenecientes a otro usuario.

---

# 62. Objetivo educativo final

Al completar este proyecto se deberán haber entendido estos conceptos:

```text
Monorepo
Workspaces
Turborepo
Frontend / Backend separation
REST API
Contracts
DTOs
Validation
Authentication
Authorization
Ownership
Services
Repositories
ORM
Prisma
PostgreSQL
Migrations
Seeds
API Client
Server State
React
React Native
Environment Variables
Testing
E2E
Security boundaries
```

---

# 63. Criterio principal

La arquitectura debe mantenerse:

```text
                     CLIENTES

          ┌────────────┴─────────────┐
          │                          │
         Web                       Mobile
          │                          │
          └────────────┬─────────────┘
                       │
                  API Client
                       │
                       ▼
                  Express API
                       │
              ┌────────┴────────┐
              │                 │
        Authentication      Validation
              │                 │
              └────────┬────────┘
                       │
                    Service
                       │
                       ▼
                  Repository
                       │
                       ▼
                    Prisma
                       │
                       ▼
                  PostgreSQL
```

El monorepo permite compartir código y herramientas.

No elimina las fronteras entre aplicaciones.

---

# 64. Instrucción final para el agente

Implementar esta aplicación progresivamente.

Antes de crear cada componente:

1. Identificar a qué workspace pertenece.
2. Identificar qué dependencias puede utilizar.
3. Mantener separación entre UI, API y DB.
4. Reutilizar contracts cuando corresponda.
5. Validar entradas.
6. Mantener seguridad en backend.
7. Evitar complejidad innecesaria.
8. Agregar pruebas de los comportamientos relevantes.

Cuando existan varias soluciones posibles, elegir la más sencilla que respete esta arquitectura.

El objetivo no es demostrar la mayor cantidad de patrones posibles.

El objetivo es construir una aplicación pequeña, completa, comprensible y técnicamente correcta.
