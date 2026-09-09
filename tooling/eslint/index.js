import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/**
 * Paquetes que SOLO pueden importarse desde código de servidor.
 * Ver "Dependencias prohibidas" en la especificación: apps/web y apps/mobile
 * nunca deben poder alcanzar Prisma ni la base de datos.
 */
export const serverOnlyImports = [
  {
    group: ['@taskflow/database', '@taskflow/database/*', '@prisma/client', 'prisma'],
    message:
      'Los clientes (web/mobile) no pueden acceder a la base de datos. Habla con la API a través de @taskflow/api-client.',
  },
  {
    group: ['**/apps/api/**'],
    message: 'No importes archivos internos de la API. Usa @taskflow/contracts o @taskflow/api-client.',
  },
]

/** Configuración base compartida por todos los workspaces. */
export const base = tseslint.config(
  {
    ignores: ['**/dist/**', '**/build/**', '**/coverage/**', '**/src/generated/**', '**/.turbo/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.es2021 },
    },
    rules: {
      // Regla 6 de la especificación: evitar `any`.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // Regla 15: cada paquete expone su API pública por su entrypoint.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@taskflow/*/src/*', '@taskflow/*/dist/*'],
              message:
                'Importa desde el entrypoint público del paquete (p. ej. "@taskflow/contracts"), no desde sus archivos internos.',
            },
            {
              group: ['../../../*'],
              message:
                'Ruta relativa demasiado profunda: probablemente estás cruzando la frontera de un workspace. Usa un paquete @taskflow/*.',
            },
          ],
        },
      ],
      eqeqeq: ['error', 'smart'],
      'no-console': 'off',
    },
  },
  prettier,
)

/** Configuración para workspaces que se ejecutan en Node (API, seeds, scripts). */
export const node = tseslint.config(...base, {
  languageOptions: {
    globals: { ...globals.node },
  },
})

/**
 * Configuración para workspaces de cliente (web/mobile).
 * Añade las fronteras de arquitectura que no deben cruzarse.
 */
export const client = tseslint.config(...base, {
  languageOptions: {
    globals: { ...globals.browser },
  },
  rules: {
    'no-restricted-imports': ['error', { patterns: serverOnlyImports }],
  },
})

export default base
