import { useFormContext } from 'react-hook-form'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function EditorMainContent() {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  return (
    <div className='lg:col-span-2 space-y-6'>
      <Card className='rounded-2xl border-muted/50 shadow-sm overflow-hidden'>
        <CardContent className='p-4 md:p-6 space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='title' className='text-sm font-semibold'>
              Tiêu đề bài viết <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='title'
              placeholder='Nhập tiêu đề hấp dẫn...'
              className='text-lg h-10 rounded-xl focus-visible:ring-primary/20'
              {...register('title')}
            />
            {errors.title && <p className='text-xs text-destructive'>{errors.title?.message as string}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='slug' className='text-sm font-semibold'>
              Slug (Đường dẫn) <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='slug'
              className='h-10 rounded-xl font-mono text-xs focus-visible:ring-primary/20'
              {...register('slug')}
            />
            {errors.slug && <p className='text-xs text-destructive'>{errors.slug?.message as string}</p>}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='excerpt' className='text-sm font-semibold'>
              Tóm tắt (Excerpt)
            </Label>
            <Textarea
              id='excerpt'
              placeholder='Đoạn mô tả ngắn hiển thị ở trang danh sách bài viết...'
              className='min-h-[100px] rounded-xl focus-visible:ring-primary/20 resize-none'
              {...register('excerpt')}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='content' className='text-sm font-semibold'>
              Nội dung <span className='text-destructive'>*</span>
            </Label>
            <Textarea
              id='content'
              placeholder='Viết nội dung bài viết ở đây...'
              className='w-full min-h-[500px] rounded-xl focus-visible:ring-primary/20 font-sans leading-relaxed p-4 border border-input'
              {...register('content')}
            />
            {errors.content && <p className='text-xs text-destructive'>{errors.content?.message as string}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
