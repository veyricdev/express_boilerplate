import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { Router } from 'express'
import { StatusCodes } from 'http-status-codes'
import z from 'zod'
import ErrorsController from '~/controllers/errors.controller'
import { createApiResponse } from '~/core/api.schema'

const router = Router()

const PATH = '/errors'

export const errorsRegister = new OpenAPIRegistry()

errorsRegister.registerPath({
  method: 'get',
  path: `${PATH}/404`,
  summary: '404 Page',
  description: 'Not Found Page',
  tags: ['Errors'],
  responses: createApiResponse(z.null(), 'Error 404', StatusCodes.NOT_FOUND),
})
router.get('/404', ErrorsController.get404)

errorsRegister.registerPath({
  method: 'get',
  path: `${PATH}/500`,
  summary: '500 Page',
  description: 'Server Error Page',
  tags: ['Errors'],
  responses: createApiResponse(z.null(), 'Error 500', StatusCodes.INTERNAL_SERVER_ERROR),
})
router.get('/500', ErrorsController.get500)

export default {
  router,
  PATH,
}
