import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import z from 'zod'
import { createApiResponse } from '~/core/api.schema'

import { errorController } from './error.controller'

const router = Router()

const PATH = '/error'

export const errorRegistry = new OpenAPIRegistry()

errorRegistry.registerPath({
  method: 'get',
  path: `${PATH}/404`,
  summary: '404 API',
  description: 'Not Found API',
  tags: ['Errors'],
  responses: createApiResponse(z.null(), 'Error 404', StatusCodes.NOT_FOUND),
})
router.get('/404', errorController.get404)

errorRegistry.registerPath({
  method: 'get',
  path: `${PATH}/500`,
  summary: '500 API',
  description: 'Server Error API',
  tags: ['Errors'],
  responses: createApiResponse(z.null(), 'Error 500', StatusCodes.INTERNAL_SERVER_ERROR),
})
router.get('/500', errorController.get500)

export default {
  router,
  PATH,
}
