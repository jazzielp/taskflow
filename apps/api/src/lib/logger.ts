import { env } from '../config/env'

type Level = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 }
const MIN_LEVEL: Level = env.isTest ? 'error' : env.isProduction ? 'info' : 'debug'

/**
 * Logger mínimo en JSON.
 *
 * Se escribe a mano, sin dependencias, porque es todo lo que este proyecto
 * necesita. Regla importante: NUNCA se registran contraseñas, tokens completos,
 * cookies de sesión ni secretos. Los campos que sí interesan son
 * requestId, userId, method, path, statusCode y duration.
 */
function write(level: Level, message: string, context: Record<string, unknown> = {}): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[MIN_LEVEL]) return

  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...context,
  }

  const line = JSON.stringify(entry)
  if (level === 'error' || level === 'warn') console.error(line)
  else console.log(line)
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => write('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => write('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => write('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => write('error', message, context),
}
