import { Layers, ListChecks, LogOut, UserRound } from 'lucide-react'
import { NavLink } from 'react-router'

import { useAuth } from '../features/auth/use-auth'

const NAV = [
  { to: '/projects', label: 'Proyectos', Icon: Layers },
  { to: '/profile', label: 'Perfil', Icon: UserRound },
]

export function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="flex w-[248px] shrink-0 flex-col gap-6 border-r border-tf-border bg-tf-surface px-4 py-5">
      <div className="flex items-center gap-2.5 px-1">
        <span className="flex size-7 items-center justify-center rounded-lg bg-tf-accent">
          <ListChecks className="size-4 text-tf-accent-ink" aria-hidden="true" />
        </span>
        <span className="font-semibold tracking-tight">TaskFlow</span>
      </div>

      <nav className="flex flex-col gap-1">
        <p className="px-[11px] pb-2 font-tf-mono text-[10px] tracking-widest text-tf-dim">
          NAVEGACIÓN
        </p>
        {NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'flex items-center gap-2.5 rounded-tf-sm px-[11px] py-[9px] text-sm transition',
                isActive
                  ? 'bg-tf-accent-soft font-medium text-tf-accent'
                  : 'text-tf-muted hover:text-tf-text',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`size-4 ${isActive ? 'text-tf-accent' : 'text-tf-muted'}`}
                  aria-hidden="true"
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 rounded-tf-sm border border-tf-border bg-tf-surface-2 px-[11px] py-2.5">
        <span className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-tf-accent-soft font-tf-mono text-[11px] text-tf-accent">
          {initialsOf(user?.name)}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[13px] font-medium">{user?.name}</span>
          <span className="font-tf-mono text-[10px] tracking-wide text-tf-dim">{user?.role}</span>
        </span>
        <button
          type="button"
          onClick={() => void logout()}
          aria-label="Cerrar sesión"
          className="ml-auto text-tf-dim transition hover:text-tf-danger"
        >
          <LogOut className="size-4" aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}

function initialsOf(name: string | undefined): string {
  if (!name) return '··'
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}
