import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Button } from '../components/ui/Button'
import { Callout } from '../components/ui/Callout'
import { ProjectCard } from '../features/projects/ProjectCard'
import { ProjectFormModal, type ProjectFormValues } from '../features/projects/ProjectFormModal'
import { ProjectsEmpty } from '../features/projects/ProjectsEmpty'
import { ProjectsSkeleton } from '../features/projects/ProjectsSkeleton'
import { useCreateProject, useProjects } from '../features/projects/use-projects'

export function ProjectsPage() {
  const { data, isPending, error } = useProjects()
  const createProject = useCreateProject()
  const navigate = useNavigate()
  const [isCreating, setCreating] = useState(false)

  function handleCreate(values: ProjectFormValues) {
    void createProject
      .mutateAsync(values)
      .then((project) => {
        setCreating(false)
        // Un proyecto recién creado está vacío: lo útil es llevar al usuario a
        // su tablero para que añada la primera tarea, no devolverlo a la lista.
        return navigate(`/projects/${project.id}`)
      })
      .catch(() => undefined)
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Proyectos</h1>
          <p className="text-[13px] text-tf-muted">{summaryOf(data?.meta.total, isPending)}</p>
        </div>

        <Button onClick={() => setCreating(true)}>Nuevo proyecto</Button>
      </header>

      {isPending && <ProjectsSkeleton />}

      {error && (
        <Callout title="No hemos podido cargar tus proyectos">
          {error instanceof Error ? error.message : 'Inténtalo de nuevo en unos segundos.'}
        </Callout>
      )}

      {data && data.data.length === 0 && <ProjectsEmpty onCreate={() => setCreating(true)} />}

      {data && data.data.length > 0 && (
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.data.map((project) => (
            <li key={project.id} className="flex">
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      )}

      {isCreating && (
        <ProjectFormModal
          isPending={createProject.isPending}
          error={createProject.error}
          onSubmit={handleCreate}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  )
}

function summaryOf(total: number | undefined, isPending: boolean): string {
  if (isPending) return 'Cargando…'
  if (total === undefined) return ''
  return total === 1 ? '1 proyecto' : `${total} proyectos`
}
