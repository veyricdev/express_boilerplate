import type { NextFunction, Request, Response } from 'express'
import ApiError from '~/core/api.error'

export const catchAsync = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err instanceof ApiError ? err : new ApiError(err)))
}
