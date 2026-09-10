import type { ProjectDto } from '@taskflow/contracts'
import { Layers } from 'lucide-react'
import { Link } from 'react-router'

export function ProjectCard({ project }: { project: ProjectDto }) {
  const taskCount = project.taskCount ?? 0

  return (
    <Link
      to={`/projects/${project.id}`}
      className="flex w-full flex-col gap-3.5 rounded-tf-lg border border-tf-border bg-tf-surface p-5 transition hover:border-tf-border-strong"
    >
      <span className="flex size-[34px] items-center justify-center rounded-tf-sm bg-tf-accent-soft">
        <Layers className="size-[17px] text-tf-accent" aria-hidden="true" />
      </span>

      <h2 className="text-[17px] font-semibold">{project.name}</h2>

      {project.description && (
        <p className="line-clamp-2 text-[13px] leading-relaxed text-tf-muted">
          {project.description}
        </p>
      )}

      <p className="mt-auto font-tf-mono text-[11px] text-tf-dim">
        {taskCount} {taskCount === 1 ? 'TAREA' : 'TAREAS'}
      </p>
    </Link>
  )
}
