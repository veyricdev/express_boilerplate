import { ShieldAlert } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export default function ForbiddenPage() {
  return (
    <div className='flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 p-4 text-center'>
      <div className='rounded-full bg-destructive/10 p-6'>
        <ShieldAlert className='h-16 w-16 text-destructive' />
      </div>

      <div className='space-y-2'>
        <h1 className='text-4xl font-bold tracking-tight sm:text-5xl'>403</h1>
        <h2 className='text-2xl font-semibold tracking-tight'>Access Denied</h2>
        <p className='max-w-[500px] text-muted-foreground'>
          Bạn không có quyền truy cập vào trang này hoặc thực hiện hành động này. Vui lòng liên hệ quản trị viên nếu bạn
          cho rằng đây là một lỗi.
        </p>
      </div>

      <Button asChild size='lg' className='mt-4'>
        <Link to='/'>Quay lại trang chủ</Link>
      </Button>
    </div>
  )
}
