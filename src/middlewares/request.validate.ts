import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'
import { BadRequestError } from '~/core/api.error'

export const requestValidate =
  (schema: ZodType<unknown>, type: 'body' | 'params' | 'query' = 'body') =>
  async (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[type])

    if (result.success) {
      if (!res.locals.data) res.locals.data = {}
      res.locals.data = { ...res.locals.data, ...(result.data as Recordable) }
      next()
    } else {
      const error = result.error.issues[0]
      throw new BadRequestError(error ? `${error.path.join(', ')}: ${error.message}` : 'Invalid Input!')
    }
  }
