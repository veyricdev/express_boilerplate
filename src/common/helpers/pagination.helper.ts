import { PaginationDto } from '../dtos/pagination.dto'
import { PaginatedResult } from '../interfaces/paginated-result.interface'

interface PrismaModel {
  findMany(args: any): any
  count(args: any): any
}

/**
 * Reusable pagination helper for Prisma models
 */
export async function paginate<T, K>(
  model: PrismaModel,
  args: K = {} as K,
  pagination: PaginationDto = { page: 1, limit: 20 }
): Promise<PaginatedResult<T>> {
  const page = Number(pagination.page) || 1
  const limit = Number(pagination.limit) || 20
  const skip = (page - 1) * limit

  const [data, total] = await Promise.all([
    model.findMany({
      ...(args as any),
      skip,
      take: limit,
    }),
    model.count({
      where: (args as any).where,
    }),
  ])

  const lastPage = Math.ceil(total / limit)

  return {
    data,
    meta: {
      total,
      page,
      limit,
      lastPage,
      hasNextPage: page < lastPage,
      hasPreviousPage: page > 1,
    },
  }
}
