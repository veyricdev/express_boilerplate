import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi'
import { Router } from 'express'
import passport from 'passport'
import z from 'zod'
import { createApiResponse } from '~/core/api.schema'
import { authentication } from '~/middlewares/auth'
import { requestValidate } from '~/middlewares/request.validate'
import { userSchema } from '../user/user.schema'
import { authController } from './auth.controller'
import { loginSchema, registerSchema } from './auth.schema'

const router = Router()

const PATH = '/auth'

export const authRegistry = new OpenAPIRegistry()

const userExample = {
  email: 'example1@gmail.com',
  username: 'example1',
  giveName: 'Nguyen Van B',
  password: '123123',
}

authRegistry.registerPath({
  method: 'post',
  path: `${PATH}/register`,
  summary: 'Register User',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: registerSchema,
          example: userExample,
        },
      },
    },
  },
  responses: createApiResponse(z.null(), 'Register Successfully!'),
})
router.post('/register', requestValidate(registerSchema), authController.register)

authRegistry.registerPath({
  method: 'post',
  path: `${PATH}/login`,
  summary: 'Login User',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginSchema,
          example: {
            username: 'example',
            password: '123123',
          },
        },
      },
    },
  },
  responses: createApiResponse(z.null(), 'Login Successfully!'),
})
router.post('/login', requestValidate(loginSchema), authController.login)

authRegistry.registerPath({
  method: 'get',
  path: `${PATH}/profile`,
  summary: 'Profile User',
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: ['Auth'],

  responses: createApiResponse(userSchema, 'Get Profile Successfully!'),
})
router.get('/profile', authentication, authController.profile)

authRegistry.registerPath({
  method: 'post',
  path: `${PATH}/refresh`,
  summary: 'Refresh Token User',
  tags: ['Auth'],
  responses: createApiResponse(z.null(), 'Refresh Token Successfully!'),
})
router.post('/refresh', authController.refresh)

authRegistry.registerPath({
  method: 'post',
  path: `${PATH}/logout`,
  summary: 'Logout User',
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: ['Auth'],
  responses: createApiResponse(z.null(), 'Logout Successfully!'),
})
router.post('/logout', authentication, authController.logout)

authRegistry.registerPath({
  method: 'post',
  path: `${PATH}/logout/all`,
  summary: 'Logout User All Device',
  security: [
    {
      bearerAuth: [],
    },
  ],
  tags: ['Auth'],
  responses: createApiResponse(z.null(), 'Logout Successfully!'),
})
router.post('/logout/all', authentication, authController.logoutAll)

router.get('/google', passport.authenticate('google', { prompt: 'select_account' }))
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failWithError: true }),
  authController.authCallback
)

router.get('/facebook', passport.authenticate('facebook'))
router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { session: false, failWithError: true }),
  authController.authCallback
)

router.get('/github', passport.authenticate('github'))
router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failWithError: true }),
  authController.authCallback
)

export default {
  router,
  PATH,
}
