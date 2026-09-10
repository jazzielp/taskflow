import { Bell, ChevronRight, Search } from 'lucide-react'
import { Fragment } from 'react'

export function Topbar({ crumbs }: { crumbs: string[] }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-tf-border px-7">
      <nav aria-label="Ruta" className="flex items-center gap-2 text-sm">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <Fragment key={crumb}>
              {index > 0 && <ChevronRight className="size-3.5 text-tf-dim" aria-hidden="true" />}
              <span className={isLast ? 'font-medium text-tf-text' : 'text-tf-muted'}>{crumb}</span>
            </Fragment>
          )
        })}
      </nav>

      <div className="flex items-center gap-[18px] text-tf-muted">
        <Search className="size-[17px]" aria-hidden="true" />
        <Bell className="size-[17px]" aria-hidden="true" />
      </div>
    </header>
  )
}
