import { useInfiniteQuery } from '@tanstack/react-query'
import { categoryService } from '@/services/category.service'
import { tagService } from '@/services/tag.service'

const LIMIT = 20

export function useInfiniteCategories() {
  return useInfiniteQuery({
    queryKey: ['categories-infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await categoryService.findAllPublic({ page: pageParam, limit: LIMIT })
      return res
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, lastPage: totalPages } = lastPage.meta
      if (page < totalPages) {
        return page + 1
      }
      return undefined
    },
  })
}

export function useInfiniteTags(search: string = '') {
  return useInfiniteQuery({
    queryKey: ['tags-infinite', search],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await tagService.findAllPublic({ page: pageParam, limit: LIMIT, search })
      return res
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, lastPage: totalPages } = lastPage.meta
      if (page < totalPages) {
        return page + 1
      }
      return undefined
    },
  })
}
