import type {
  CreateProjectInput,
  IdParams,
  PaginationQuery,
  UpdateProjectInput,
} from '@taskflow/contracts'
import type { RequestHandler } from 'express'

import { sendCreated, sendData, sendList, sendNoContent } from '../../lib/http'
import { getAuthenticatedUser } from '../../middleware/auth.middleware'
import type { NoParams } from '../../types/http'
import { projectService } from './project.service'

export const listProjectsController: RequestHandler<
  NoParams,
  unknown,
  unknown,
  PaginationQuery
> = async (req, res) => {
  const actor = getAuthenticatedUser(req)
  const { items, total, page, limit } = await projectService.list(actor, req.query)

  sendList(res, items, { total, page, limit })
}

export const createProjectController: RequestHandler<
  NoParams,
  unknown,
  CreateProjectInput
> = async (req, res) => {
  const actor = getAuthenticatedUser(req)
  const project = await projectService.create(actor, req.body)

  sendCreated(res, project)
}

export const getProjectController: RequestHandler<IdParams> = async (req, res) => {
  const actor = getAuthenticatedUser(req)
  const project = await projectService.getById(actor, req.params.id)

  sendData(res, project)
}

export const updateProjectController: RequestHandler<
  IdParams,
  unknown,
  UpdateProjectInput
> = async (req, res) => {
  const actor = getAuthenticatedUser(req)
  const project = await projectService.update(actor, req.params.id, req.body)

  sendData(res, project)
}

export const deleteProjectController: RequestHandler<IdParams> = async (req, res) => {
  const actor = getAuthenticatedUser(req)
  await projectService.remove(actor, req.params.id)

  sendNoContent(res)
}
