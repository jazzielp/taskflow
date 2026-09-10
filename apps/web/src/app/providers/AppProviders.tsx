import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

import { ApiClientError } from '@taskflow/api-client'

import { AuthProvider } from '../../features/auth/auth-context'

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (failureCount, error) => {
          // Reintentar un 401 o un 404 no cambia nada y retrasa el mensaje de
          // error. Solo se reintentan los fallos que pueden ser pasajeros.
          if (error instanceof ApiClientError && error.status >= 400 && error.status < 500) {
            return false
          }
          return failureCount < 2
        },
      },
    },
  })
}

export function AppProviders({ children }: { children: ReactNode }) {
  // Dentro de estado para que un hot reload no cree un cliente nuevo y tire la
  // caché en cada guardado.
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  )
}
