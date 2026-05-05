import { PERM_CONTACTS_READ } from '@shared/constants/permissions'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'react-router'
import { toast } from 'sonner'
import { SharedPagination } from '@/components/shared/shared-pagination'
import { usePermission } from '@/hooks/use-permission'
import { contactService } from '@/services/contact.service'
import { ContactSubmission } from '@/types'
import { ContactFilters } from './components/contact-filters'
import { ContactHeader } from './components/contact-header'
import { ContactTable } from './components/contact-table'

export default function ContactsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const isRead =
    searchParams.get('isRead') === 'true' ? true : searchParams.get('isRead') === 'false' ? false : undefined
  const queryClient = useQueryClient()
  const { has } = usePermission()

  const { data: response, isLoading } = useQuery({
    queryKey: ['contacts', page, limit, isRead],
    queryFn: () => contactService.findAll({ page, limit, isRead }),
    enabled: has(PERM_CONTACTS_READ),
  })

  const contacts = (response as any)?.data || []
  const total = (response as any)?.total || 0
  const totalPages = (response as any)?.totalPages || 1

  const unreadCount = contacts.filter((c: ContactSubmission) => !c.isRead).length

  const deleteMutation = useMutation({
    mutationFn: (id: number) => contactService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      toast.success('Đã xóa liên hệ')
    },
    onError: () => toast.error('Không thể xóa liên hệ'),
  })

  const filterRead = (value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'all') next.delete('isRead')
    else next.set('isRead', value)
    next.set('page', '1')
    setSearchParams(next)
  }

  const currentFilter = isRead === true ? 'true' : isRead === false ? 'false' : 'all'

  return (
    <div className='p-4 md:p-8 space-y-8 max-w-(--breakpoint-2xl) w-full mx-auto animate-in fade-in duration-500'>
      <ContactHeader unreadCount={unreadCount} />

      <div className='bg-card rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md border-muted/50'>
        <ContactFilters currentFilter={currentFilter} onFilterChange={filterRead} />

        <ContactTable
          contacts={contacts as ContactSubmission[]}
          isLoading={isLoading}
          deleteMutation={deleteMutation}
        />

        {totalPages > 1 && (
          <div className='p-4 border-t'>
            <SharedPagination meta={{ total, lastPage: totalPages }} />
          </div>
        )}
      </div>
    </div>
  )
}
