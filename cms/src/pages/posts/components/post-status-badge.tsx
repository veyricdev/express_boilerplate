import { Badge } from '@/components/ui/badge'

interface PostStatusBadgeProps {
  status: string
  deletedAt?: string | null
}

export function PostStatusBadge({ status, deletedAt }: PostStatusBadgeProps) {
  if (deletedAt) {
    return (
      <Badge variant='destructive' className='px-2 py-0.5 rounded-full font-semibold'>
        Đã xóa
      </Badge>
    )
  }

  switch (status) {
    case 'PUBLISHED':
      return (
        <Badge className='bg-emerald-500/15 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/25 px-2 py-0.5 rounded-full font-semibold transition-colors'>
          Công khai
        </Badge>
      )
    case 'DRAFT':
      return (
        <Badge
          variant='secondary'
          className='bg-slate-500/15 text-slate-500 border-slate-500/20 px-2 py-0.5 rounded-full font-semibold'
        >
          Nháp
        </Badge>
      )
    case 'SCHEDULED':
      return (
        <Badge className='bg-amber-500/15 text-amber-600 border-amber-500/20 px-2 py-0.5 rounded-full font-semibold'>
          Lên lịch
        </Badge>
      )
    default:
      return <Badge className='rounded-full'>{status}</Badge>
  }
}
