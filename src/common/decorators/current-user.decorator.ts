import { createParamDecorator, ExecutionContext } from '@nestjs/common'

/**
 * Custom decorator to extract the user object from the request.
 * Works with both Express and Fastify.
 */
export const CurrentUser = createParamDecorator((data: string | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const user = request.user

  return data ? user?.[data] : user
})
