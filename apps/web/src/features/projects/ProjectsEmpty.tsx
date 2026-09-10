import { FolderPlus } from 'lucide-react'

import { Button } from '../../components/ui/Button'

export function ProjectsEmpty({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-[18px] py-20 text-center">
      <span className="flex size-[66px] items-center justify-center rounded-full border border-tf-border-strong bg-tf-surface">
        <FolderPlus className="size-[26px] text-tf-accent" aria-hidden="true" />
      </span>

      <div className="flex max-w-[460px] flex-col gap-2.5">
        <h2 className="text-[19px] font-semibold">Todavía no tienes proyectos</h2>
        <p className="text-sm leading-relaxed text-tf-muted">
          Un proyecto agrupa tareas y decide quién puede verlas. Crea el primero y empieza a
          moverlas por el tablero.
        </p>
      </div>

      <Button onClick={onCreate}>Crear el primer proyecto</Button>

      <p className="rounded-md border border-tf-border bg-tf-surface px-[11px] py-1.5 font-tf-mono text-[10.5px] tracking-wide text-tf-dim">
        POST /api/projects
      </p>
    </div>
  )
}
