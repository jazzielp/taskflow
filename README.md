# TaskFlow

Monorepo didáctico full stack: una aplicación sencilla de gestión de tareas
construida para practicar arquitectura, no para lucir tecnología.

> Estado actual: **Fases 1–7 completadas** (monorepo, base de datos, API
> completa con autenticación, autorización, validación y tests).
> Pendientes: `packages/api-client`, `apps/web`, `apps/mobile` y los tests E2E.

---

## 1. Requisitos

| Herramienta | Versión            | Notas                                  |
| ----------- | ------------------ | -------------------------------------- |
| Node.js     | >= 20.11           | Probado con 22.x                       |
| pnpm        | >= 10 (probado 11) | `corepack enable` o `npm i -g pnpm`    |
| PostgreSQL  | >= 14              | Local, o con el `docker-compose.yml`   |

---

## 2. Instalación

```bash
pnpm install
```

`pnpm` instala todos los workspaces a la vez y enlaza los paquetes internos
(`@taskflow/*`) entre sí.

---

## 3. Variables de entorno

Hay un único archivo `.env` en la raíz del monorepo. Cópialo de la plantilla:

```bash
cp .env.example .env
```

Después edítalo:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/taskflow_dev?schema=public"
TEST_DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/taskflow_test?schema=public"
JWT_SECRET="..."   # genera uno con: openssl rand -base64 48
```

Dos detalles importantes:

- **`TEST_DATABASE_URL` debe apuntar a una base de datos distinta.** Los tests
  la vacían entre pruebas; si apunta a la de desarrollo, perderás el seed.
- La API carga primero el `.env` de la raíz y después, si existe,
  `apps/api/.env`, que puede sobrescribir valores puntuales.

Nunca pongas `DATABASE_URL` ni `JWT_SECRET` en un `.env` de web o mobile: todo
lo que se envía al navegador o al móvil es visible para el usuario.

---

## 4. Levantar PostgreSQL

Con Docker:

```bash
docker compose up -d
```

Expone PostgreSQL en el puerto **5433** (no en el 5432) para no chocar con una
instalación local. Si usas Docker, tu `DATABASE_URL` será:

```env
DATABASE_URL="postgresql://taskflow:taskflow@localhost:5433/taskflow_dev?schema=public"
```

Si prefieres tu PostgreSQL local, crea las dos bases:

```bash
createdb taskflow_dev
createdb taskflow_test
```

---

## 5. Migraciones

```bash
pnpm db:migrate          # crea y aplica una migración en desarrollo
pnpm db:migrate:deploy   # aplica las migraciones existentes (CI / producción)
pnpm db:reset            # borra y reconstruye la base de datos
```

**Sobre la shadow database.** `prisma migrate dev` no aplica tu esquema
directamente: primero crea una base de datos temporal, reproduce en ella todas
las migraciones una a una y compara el resultado con `schema.prisma`. Así
detecta si alguien tocó la base a mano o si falta una migración.

Eso exige poder crear bases de datos. Tienes dos opciones:

```sql
-- A) dar el permiso al rol y olvidarte
ALTER ROLE taskflow CREATEDB;

-- B) crear tú la base y declararla en SHADOW_DATABASE_URL
CREATE DATABASE taskflow_shadow OWNER taskflow;
```

Este repositorio está configurado para la opción B: si `SHADOW_DATABASE_URL`
existe, `prisma7.config.ts` la usa; si no, deja que Prisma la cree él mismo.
`prisma migrate deploy`, el comando de producción, no usa shadow database y no
necesita ninguna de las dos cosas.

Toda modificación de `packages/database/prisma/schema.prisma` debe generar una
migración. El flujo es siempre el mismo:

```
editar schema.prisma  →  pnpm db:migrate  →  revisar el SQL  →  commit
```

---

## 6. Seed

```bash
pnpm db:seed
```

Crea 1 administrador, 2 usuarios, 3 proyectos y varias tareas:

| Email                | Contraseña      | Rol   |
| -------------------- | --------------- | ----- |
| `admin@taskflow.dev` | `Admin123!`     | ADMIN |
| `ana@taskflow.dev`   | `Password123!`  | USER  |
| `luis@taskflow.dev`  | `Password123!`  | USER  |

---

## 7. Ejecutar la aplicación

```bash
pnpm dev
```

Arranca todos los workspaces que tengan script `dev`. Ahora mismo, la API:

```
http://localhost:3000/api/health  →  { "status": "ok" }
```

Solo la API:

```bash
pnpm --filter @taskflow/api dev
```

---

## 8. Tests

```bash
pnpm test        # unitarios + integración
pnpm lint
pnpm typecheck
pnpm build
```

Tres niveles:

- **Unitarios** (`packages/domain`, `packages/utils`): funciones puras, sin I/O.
- **Integración** (`apps/api/tests`): Vitest + Supertest contra PostgreSQL real.
  Las migraciones se aplican solas antes de la batería y la base se vacía entre
  pruebas.
- **E2E** (Playwright): pendiente, llegará con `apps/web`.

Los tests se centran en lo que importa: **permisos, ownership, validaciones y
reglas de negocio**. No prueban detalles internos triviales.

---

## 9. Estructura del monorepo

```text
taskflow/
├── apps/
│   └── api/                    Express + TypeScript (la autoridad del sistema)
│       ├── src/
│       │   ├── app.ts          construye Express (usado también por los tests)
│       │   ├── server.ts       abre el puerto y gestiona el apagado
│       │   ├── config/         variables de entorno validadas con Zod
│       │   ├── lib/            errores de dominio, JWT, hashing, logger, HTTP
│       │   ├── middleware/     requestId, log, validación, auth, permisos, errores
│       │   ├── modules/        auth · users · projects · tasks
│       │   └── routes/         montaje de los módulos y /health
│       └── tests/              integración con Supertest
│
├── packages/
│   ├── database/               Prisma: schema, migraciones, seed, cliente
│   ├── contracts/              schemas Zod + tipos DTO + códigos de error
│   ├── domain/                 reglas puras (transiciones de estado, ownership)
│   ├── config/                 constantes públicas compartidas
│   └── utils/                  utilidades realmente compartidas
│
├── tooling/
│   ├── eslint/                 una sola configuración para todo el repo
│   ├── prettier/
│   └── typescript/             tsconfig base / node / library
│
├── docker-compose.yml          PostgreSQL de desarrollo
├── pnpm-workspace.yaml
└── turbo.json
```

### Dependencias permitidas

```text
apps/api      →  database · contracts · domain · config · utils
domain        →  contracts (solo tipos)
contracts     →  zod
config/utils  →  nada
```

Prohibido (y comprobado por ESLint en los workspaces de cliente):

```text
web    → database        mobile → database
web    → apps/api/src/*  mobile → apps/api/src/*
domain → Express / React / Prisma
```

---

## 10. Cómo está organizado el backend

La agrupación principal es **por dominio**, no por tipo de archivo:

```text
modules/auth/  modules/users/  modules/projects/  modules/tasks/
```

Y dentro de cada módulo, cada capa tiene una única responsabilidad:

| Capa           | Responsabilidad                              | Nunca hace                       |
| -------------- | -------------------------------------------- | -------------------------------- |
| **Route**      | URL, método, middlewares, controller          | lógica de negocio                |
| **Controller** | leer `req`, llamar al service, responder      | consultar Prisma                 |
| **Service**    | reglas de negocio y permisos sobre el recurso | conocer `req` / `res` / `next`   |
| **Repository** | acceso a datos con Prisma                     | manejar respuestas HTTP          |
| **Mapper**     | fila de BD → DTO público                      | —                                |

El recorrido completo de una petición:

```
Cliente
  ↓ HTTP
Route  →  authenticate  →  validate(schema)  →  Controller
                                                    ↓
                                                 Service   ← comprueba ownership
                                                    ↓
                                                Repository
                                                    ↓
                                              Prisma → PostgreSQL
```

---

## 11. Endpoints

### Auth

| Método | Ruta                 | Auth | Respuesta                    |
| ------ | -------------------- | ---- | ---------------------------- |
| POST   | `/api/auth/register` | —    | `201` sesión                 |
| POST   | `/api/auth/login`    | —    | `200` sesión                 |
| POST   | `/api/auth/logout`   | —    | `204`                        |
| GET    | `/api/auth/me`       | ✅   | `200` perfil                 |

### Projects

| Método | Ruta                  | Auth | Respuesta        |
| ------ | --------------------- | ---- | ---------------- |
| GET    | `/api/projects`       | ✅   | `200` listado    |
| POST   | `/api/projects`       | ✅   | `201` proyecto   |
| GET    | `/api/projects/:id`   | ✅   | `200` proyecto   |
| PATCH  | `/api/projects/:id`   | ✅   | `200` proyecto   |
| DELETE | `/api/projects/:id`   | ✅   | `204`            |

### Tasks

| Método | Ruta                                 | Auth | Respuesta     |
| ------ | ------------------------------------ | ---- | ------------- |
| GET    | `/api/projects/:projectId/tasks`     | ✅   | `200` listado |
| POST   | `/api/projects/:projectId/tasks`     | ✅   | `201` tarea   |
| GET    | `/api/tasks/:id`                     | ✅   | `200` tarea   |
| PATCH  | `/api/tasks/:id`                     | ✅   | `200` tarea   |
| PATCH  | `/api/tasks/:id/status`              | ✅   | `200` tarea   |
| DELETE | `/api/tasks/:id`                     | ✅   | `204`         |

### Formato de las respuestas

```jsonc
// recurso
{ "data": { } }

// listado
{ "data": [], "meta": { "total": 0, "page": 1, "limit": 20 } }

// error
{ "error": { "code": "PROJECT_NOT_FOUND", "message": "...", "requestId": "..." } }
```

`/api/health` es la única excepción: devuelve `{ "status": "ok" }` plano porque
lo consumen balanceadores, no la aplicación.

---

## 12. Estados de una tarea

```text
TODO ──────────► IN_PROGRESS ──────────► DONE
  ▲                   ▲                    │
  └───────────────────┴────────────────────┘
        (DONE solo puede volver a IN_PROGRESS)
```

Una tarea terminada se puede reabrir, pero vuelve a *en progreso*: no tiene
sentido devolverla a *por hacer* como si nunca se hubiera trabajado. Tampoco se
permite "cambiar" una tarea a su estado actual.

La regla vive en `@taskflow/domain` (TypeScript puro) y se puede probar sin
levantar nada.

---

## 13. Seguridad

Lo que hace la API, y por qué:

- **Contraseñas con Argon2id.** En la base de datos solo hay `passwordHash`.
- **JWT** en `Authorization: Bearer <token>`, con expiración.
- **Validación con Zod de body, params y query** en todas las rutas.
- **Ownership comprobado en el servidor**, en el service, antes de tocar nada.
- **Mismo error para email inexistente y contraseña incorrecta**, para no
  revelar qué cuentas existen.
- **El servidor decide los campos sensibles**: `role` y `ownerId` enviados por
  el cliente se ignoran (hay tests que lo comprueban).
- **Helmet**, **CORS** por lista de orígenes y **rate limiting** en `/auth`.
- **Un `requestId` por petición**, en los logs y en la respuesta de error.
- **Logs sin secretos**: solo requestId, userId, método, ruta, estado y duración.

> Validar en el frontend es UX. Validar en el backend es seguridad.
> Ocultar un botón no protege nada.

---

## 14. Decisiones que se apartan del enunciado

Tres, y el motivo de cada una:

1. **`packages/domain` depende de `@taskflow/contracts`** (solo `import type`,
   que TypeScript borra al compilar). El enunciado lo describía como TypeScript
   puro sin dependencias, pero la Regla 7 pide no duplicar tipos que pueden
   vivir en `contracts`. Duplicar `TaskStatus` en dos paquetes era peor.

2. **El módulo `auth` no tiene `auth.repository.ts`.** La única tabla que
   necesita es la de usuarios, y esa vive en el módulo `users`. Un repositorio
   que solo reenviara llamadas sería una capa vacía (Regla 2). Aparecerá el día
   que haya sesiones persistidas o refresh tokens.

3. **Un solo `.env` en la raíz** en lugar de uno por aplicación. Es lo habitual
   en un monorepo en desarrollo y evita repetir `DATABASE_URL` en dos sitios.
   `apps/api/.env` sigue funcionando si quieres sobrescribir algo.

Y una decisión discutible que conviene conocer: acceder a un proyecto ajeno
devuelve **403**, no 404, así que se filtra que ese id existe. Con UUID el
riesgo es mínimo y el mensaje es mucho más útil al desarrollar. Con ids
secuenciales lo correcto sería devolver 404 en ambos casos.

---

## 15. Siguientes fases

| Fase | Contenido                                    |
| ---- | -------------------------------------------- |
| 8    | `packages/api-client` (cliente HTTP compartido) |
| 9    | `apps/web` (React + Vite + TanStack Query)   |
| 10   | `apps/mobile` (React Native + Expo)          |
| 11   | E2E con Playwright                           |
