export interface PaginatedResult<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    lastPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
