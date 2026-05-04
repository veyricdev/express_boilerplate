import { PERM_POSTS_UPDATE, PERM_POSTS_WRITE } from '@shared/constants/permissions'
import { ArrowLeft, Save, Send } from 'lucide-react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { usePermission } from '@/hooks/use-permission'

interface EditorHeaderProps {
  isEdit: boolean
  isPending: boolean
  onSubmitDraft: () => void
  onSubmitPublish: () => void
}

export function EditorHeader({ isEdit, isPending, onSubmitDraft, onSubmitPublish }: EditorHeaderProps) {
  const navigate = useNavigate()
  const permission = usePermission()

  const canSubmit = isEdit ? permission.has(PERM_POSTS_UPDATE) : permission.has(PERM_POSTS_WRITE)

  return (
    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
      <div className='flex items-center gap-3'>
        <Button variant='ghost' size='icon' onClick={() => navigate('/posts')} className='md:hidden shrink-0'>
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <div className='space-y-0.5 md:space-y-1'>
          <h1 className='text-xl md:text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text'>
            {isEdit ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
          </h1>
          <p className='text-xs md:text-sm text-muted-foreground hidden sm:block'>
            {isEdit ? 'Cập nhật nội dung bài viết của bạn.' : 'Bắt đầu sáng tạo nội dung mới.'}
          </p>
        </div>
      </div>
      <div className='flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar'>
        <Button variant='outline' onClick={() => navigate('/posts')} className='shrink-0'>
          Hủy
        </Button>
        {canSubmit && (
          <>
            <Button onClick={onSubmitDraft} disabled={isPending} className='shrink-0'>
              <Save className='mr-2 h-4 w-4' />
              <span className='hidden sm:inline'>Lưu bản nháp</span>
              <span className='sm:hidden'>Lưu</span>
            </Button>
            <Button onClick={onSubmitPublish} disabled={isPending} className='shrink-0'>
              <Send className='mr-2 h-4 w-4' />
              Xuất bản
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
