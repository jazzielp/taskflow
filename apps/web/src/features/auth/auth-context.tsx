import type { LoginInput, RegisterInput, UserDto } from '@taskflow/contracts'
import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'

import { api } from '../../lib/api'
import { clearSession, readSession, writeSession } from './session-storage'

export type AuthContextValue = {
  user: UserDto | null
  isAuthenticated: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  // El estado inicial se lee del almacenamiento de forma síncrona: si no, el
  // primer render no tendría sesión y las rutas protegidas parpadearían hacia
  // /login antes de recuperarla.
  const [user, setUser] = useState<UserDto | null>(() => readSession()?.user ?? null)

  const startSession = useCallback((session: { accessToken: string; user: UserDto }) => {
    writeSession(session)
    setUser(session.user)
  }, [])

  const login = useCallback(
    async (input: LoginInput) => {
      startSession(await api.auth.login(input))
    },
    [startSession],
  )

  const register = useCallback(
    async (input: RegisterInput) => {
      startSession(await api.auth.register(input))
    },
    [startSession],
  )

  const logout = useCallback(async () => {
    try {
      await api.auth.logout()
    } catch {
      // Si la llamada falla igualmente cerramos sesión en el cliente: el
      // usuario ha pedido salir y el token caduca por su cuenta.
    }
    clearSession()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, register, logout }),
    [user, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
