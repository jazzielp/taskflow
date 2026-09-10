import { createBrowserRouter, Navigate } from 'react-router'

import { AppLayout } from '../../layouts/AppLayout'
import { LoginPage } from '../../pages/LoginPage'
import { NotFoundPage } from '../../pages/NotFoundPage'
import { ProfilePage } from '../../pages/ProfilePage'
import { ProjectDetailPage } from '../../pages/ProjectDetailPage'
import { ProjectsPage } from '../../pages/ProjectsPage'
import { RegisterPage } from '../../pages/RegisterPage'
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute'

/**
 * Rutas iniciales de la web, según la especificación.
 *
 * `handle.crumb` alimenta la miga de pan de la barra superior: cada ruta dice
 * cómo se llama, y el layout las encadena. Por eso `/projects/:id` cuelga de
 * `/projects` en lugar de ser una ruta plana.
 */
export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/projects" replace /> },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: 'projects',
            handle: { crumb: 'Proyectos' },
            children: [
              { index: true, element: <ProjectsPage /> },
              { path: ':id', element: <ProjectDetailPage />, handle: { crumb: 'Proyecto' } },
            ],
          },
          { path: 'profile', element: <ProfilePage />, handle: { crumb: 'Perfil' } },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
