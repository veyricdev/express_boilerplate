import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { Router } from 'express'
import z from 'zod'
import { createApiResponse } from '~/core/api.schema'
import { requestValidate } from '~/middlewares/request.validate'
import { paramsWithIdSchema } from '~/utils/schema.helper'
import { userController } from './user.controller'
import { createUserSchema, updateUserSchema, userByIdQuerySchema, userListQuerySchema, userSchema } from './user.schema'

const router = Router()

const PATH = '/users'

export const userRegistry = new OpenAPIRegistry()

userRegistry.register('User', userSchema)

const useExample = {
  email: 'example@gmail.com',
  username: 'example',
  giveName: 'Nguyen Van A',
  password: '123123',
}

userRegistry.registerPath({
  method: 'get',
  path: `${PATH}`,
  summary: 'Get List User',
  tags: ['Users'],
  request: {
    query: userListQuerySchema,
  },
  responses: createApiResponse(z.null(), 'Get List User Successfully!'),
})
userRegistry.registerPath({
  method: 'post',
  path: `${PATH}`,
  summary: 'Create User',
  tags: ['Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createUserSchema,
          example: useExample,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), 'Create User Successfully!'),
})
router
  .route('/')
  .get(requestValidate(userListQuerySchema, 'query'), userController.index)
  .post(requestValidate(createUserSchema), userController.createOrUpdate)

userRegistry.registerPath({
  method: 'get',
  path: `${PATH}/{id}`,
  summary: 'Get User',
  tags: ['Users'],
  request: {
    params: paramsWithIdSchema,
    query: userByIdQuerySchema,
  },
  responses: createApiResponse(z.null(), 'Get User Successfully!'),
})
userRegistry.registerPath({
  method: 'patch',
  path: `${PATH}/{id}`,
  summary: 'Update User',
  tags: ['Users'],
  request: {
    params: paramsWithIdSchema,
    body: {
      content: {
        'application/json': {
          schema: updateUserSchema,
          example: useExample,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), 'Update User Successfully!'),
})
userRegistry.registerPath({
  method: 'delete',
  path: `${PATH}/{id}`,
  summary: 'Delete User',
  tags: ['Users'],
  request: {
    params: paramsWithIdSchema,
  },
  responses: createApiResponse(z.null(), 'Delete User Successfully!'),
})
router
  .route('/:id')
  .all(requestValidate(paramsWithIdSchema, 'params'))
  .get(requestValidate(userByIdQuerySchema, 'query'), userController.show)
  .patch(requestValidate(updateUserSchema), userController.createOrUpdate)
  .delete(userController.delete)

userRegistry.registerPath({
  method: 'delete',
  path: `${PATH}/{id}/destroy`,
  summary: 'Hard Delete User',
  tags: ['Users'],
  request: {
    params: paramsWithIdSchema,
  },
  responses: createApiResponse(z.null(), 'Hard Delete User Successfully!'),
})
router.delete('/:id/destroy', requestValidate(paramsWithIdSchema, 'params'), userController.destroy)

userRegistry.registerPath({
  method: 'post',
  path: `${PATH}/{id}/restore`,
  summary: 'Restore User',
  tags: ['Users'],
  request: {
    params: paramsWithIdSchema,
  },
  responses: createApiResponse(z.null(), 'Restore User Successfully!'),
})
router.post('/:id/restore', requestValidate(paramsWithIdSchema, 'params'), userController.restore)

export default {
  router,
  PATH,
}
