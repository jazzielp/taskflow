import type {
  CreateTaskInput,
  IdParams,
  ListTasksQuery,
  ProjectIdParams,
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from '@taskflow/contracts'
import type { RequestHandler } from 'express'

import { sendCreated, sendData, sendList, sendNoContent } from '../../lib/http'
import { getAuthenticatedUser } from '../../middleware/auth.middleware'
import { taskService } from './task.service'

export const listProjectTasksController: RequestHandler<
  ProjectIdParams,
  unknown,
  unknown,
  ListTasksQuery
> = async (req, res) => {
  const actor = getAuthenticatedUser(req)
  const { items, total, page, limit } = await taskService.listByProject(
    actor,
    req.params.projectId,
    req.query,
  )

  sendList(res, items, { total, page, limit })
}

export const createProjectTaskController: RequestHandler<
  ProjectIdParams,
  unknown,
  CreateTaskInput
> = async (req, res) => {
  const actor = getAuthenticatedUser(req)
  const task = await taskService.create(actor, req.params.projectId, req.body)

  sendCreated(res, task)
}

export const getTaskController: RequestHandler<IdParams> = async (req, res) => {
  const actor = getAuthenticatedUser(req)
  const task = await taskService.getById(actor, req.params.id)

  sendData(res, task)
}

export const updateTaskController: RequestHandler<IdParams, unknown, UpdateTaskInput> = async (
  req,
  res,
) => {
  const actor = getAuthenticatedUser(req)
  const task = await taskService.update(actor, req.params.id, req.body)

  sendData(res, task)
}

export const updateTaskStatusController: RequestHandler<
  IdParams,
  unknown,
  UpdateTaskStatusInput
> = async (req, res) => {
  const actor = getAuthenticatedUser(req)
  const task = await taskService.updateStatus(actor, req.params.id, req.body.status)

  sendData(res, task)
}

export const deleteTaskController: RequestHandler<IdParams> = async (req, res) => {
  const actor = getAuthenticatedUser(req)
  await taskService.remove(actor, req.params.id)

  sendNoContent(res)
}
