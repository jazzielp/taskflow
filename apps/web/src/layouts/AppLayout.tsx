import { Outlet, useMatches } from 'react-router'

import { Sidebar } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'

/** Cada ruta declara su miga de pan en `handle`. */
type CrumbHandle = { crumb: string }

function hasCrumb(handle: unknown): handle is CrumbHandle {
  return (
    typeof handle === 'object' &&
    handle !== null &&
    typeof (handle as CrumbHandle).crumb === 'string'
  )
}

export function AppLayout() {
  const crumbs = useMatches()
    .map((match) => (hasCrumb(match.handle) ? match.handle.crumb : null))
    .filter((crumb): crumb is string => crumb !== null)

  return (
    <div className="flex h-screen overflow-hidden bg-tf-bg">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar crumbs={crumbs} />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
