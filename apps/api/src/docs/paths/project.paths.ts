import { errors } from '../components'
import { dataOf, jsonBody, jsonResponse, listOf, noContent, schemaRef } from '../helpers'
import type { PathsObject, Ref } from '../types'

export const PROJECT_TAG = 'Proyectos'

const idPath: Ref = { $ref: '#/components/parameters/IdPath' }
const pageQuery: Ref = { $ref: '#/components/parameters/PageQuery' }
const limitQuery: Ref = { $ref: '#/components/parameters/LimitQuery' }

/**
 * Todas las rutas de proyectos exigen sesión, así que heredan la seguridad
 * global del documento y no declaran `security`.
 *
 * `Forbidden` aparece donde el recurso puede existir pero ser de otro usuario;
 * `ProjectNotFound`, donde no existe o no es visible para quien pregunta.
 */
export const projectPaths: PathsObject = {
  '/projects': {
    get: {
      operationId: 'listProjects',
      tags: [PROJECT_TAG],
      summary: 'Listar los proyectos del usuario',
      description: 'Devuelve solo los proyectos de los que el usuario es propietario.',
      parameters: [pageQuery, limitQuery],
      responses: {
        '200': jsonResponse('Página de proyectos.', listOf(schemaRef('Project'))),
        ...errors('Unauthenticated', 'ValidationError'),
      },
    },
    post: {
      operationId: 'createProject',
      tags: [PROJECT_TAG],
      summary: 'Crear un proyecto',
      requestBody: jsonBody(schemaRef('CreateProjectInput')),
      responses: {
        '201': jsonResponse('Proyecto creado.', dataOf(schemaRef('Project'))),
        ...errors('Unauthenticated', 'ValidationError'),
      },
    },
  },

  '/projects/{id}': {
    get: {
      operationId: 'getProject',
      tags: [PROJECT_TAG],
      summary: 'Obtener un proyecto',
      parameters: [idPath],
      responses: {
        '200': jsonResponse('Proyecto solicitado.', dataOf(schemaRef('Project'))),
        ...errors('Unauthenticated', 'Forbidden', 'ProjectNotFound', 'ValidationError'),
      },
    },
    patch: {
      operationId: 'updateProject',
      tags: [PROJECT_TAG],
      summary: 'Modificar un proyecto',
      description:
        'Actualización parcial: solo se tocan los campos enviados. El cuerpo no puede venir vacío.',
      parameters: [idPath],
      requestBody: jsonBody(schemaRef('UpdateProjectInput')),
      responses: {
        '200': jsonResponse('Proyecto actualizado.', dataOf(schemaRef('Project'))),
        ...errors('Unauthenticated', 'Forbidden', 'ProjectNotFound', 'ValidationError'),
      },
    },
    delete: {
      operationId: 'deleteProject',
      tags: [PROJECT_TAG],
      summary: 'Eliminar un proyecto',
      description: 'Elimina también las tareas que contiene.',
      parameters: [idPath],
      responses: {
        '204': noContent('Proyecto eliminado.'),
        ...errors('Unauthenticated', 'Forbidden', 'ProjectNotFound', 'ValidationError'),
      },
    },
  },
}
