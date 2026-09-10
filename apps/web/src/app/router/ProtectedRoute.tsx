import { Navigate, Outlet, useLocation } from 'react-router'

import { useAuth } from '../../features/auth/use-auth'

/**
 * Guarda de sesión.
 *
 * Esto es UX, no seguridad: evita enseñar una pantalla que va a fallar. Quien
 * decide de verdad qué puede verse es la API, que autoriza cada petición.
 */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

/** El reverso: con sesión abierta, /login y /register no pintan nada. */
export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/projects" replace /> : <Outlet />
}
