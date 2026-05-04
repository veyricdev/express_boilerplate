import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { usePermission } from '@/hooks/use-permission'
import { PERM_POSTS_WRITE } from '@/lib/permissions'

export function PostHeader() {
  const navigate = useNavigate()
  const permission = usePermission()

  return (
    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
          Bài viết
        </h1>
        <p className='text-muted-foreground'>Quản lý nội dung bài viết và xuất bản.</p>
      </div>
      {permission.has(PERM_POSTS_WRITE) && (
        <Button className='shadow-lg shadow-primary/20 rounded-xl px-5' onClick={() => navigate('/posts/create')}>
          <Plus className='mr-2 h-4 w-4' /> Viết bài mới
        </Button>
      )}
    </div>
  )
}
