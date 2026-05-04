import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { SharedPagination } from '@/components/shared/shared-pagination'
import { userService } from '@/services/user.service'
import { User } from '@/types'
import { UserHeader } from './components/user-header'
import { UserFilters } from './components/user-filters'
import { UserTable } from './components/user-table'
import { EditPermissionsDialog } from './components/edit-permissions-dialog'

export default function UsersPage() {
  const [searchParams] = useSearchParams()
  const search = searchParams.get('search') || ''
  const trashMode = (searchParams.get('trashMode') as any) || 'active'
  const isActive = searchParams.get('isActive') === 'true' ? true : searchParams.get('isActive') === 'false' ? false : undefined
  const fromDate = searchParams.get('fromDate') || undefined
  const toDate = searchParams.get('toDate') || undefined
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '10', 10)

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const { data: response, isLoading } = useQuery({
    queryKey: ['users', search, trashMode, isActive, fromDate, toDate, page, limit],
    queryFn: () => userService.findAll({ search, trashMode, isActive, fromDate, toDate, page, limit }),
  })

  const users = response?.data || []
  const meta = response?.meta

  return (
    <div className='p-8 space-y-8 max-w-(--breakpoint-2xl) w-full mx-auto animate-in fade-in duration-500'>
      <UserHeader />
      
      <div className='bg-card rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md border-muted/50'>
        <UserFilters />
        
        <UserTable 
          users={users} 
          isLoading={isLoading} 
          onEditPermissions={(user) => {
            setSelectedUser(user)
            setIsEditDialogOpen(true)
          }}
        />
        {meta && <SharedPagination meta={meta} />}
      </div>

      <EditPermissionsDialog 
        user={selectedUser} 
        isOpen={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)} 
      />
    </div>
  )
}
