import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Hash } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import slugify from 'slugify'
import { toast } from 'sonner'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { tagService } from '@/services/tag.service'
import { Tag } from '@/types'

const tagSchema = z.object({
  name: z.string().min(2, 'Tên tag phải có ít nhất 2 ký tự'),
  slug: z.string().min(2, 'Slug phải có ít nhất 2 ký tự'),
})

type TagFormValues = z.infer<typeof tagSchema>

interface TagDialogProps {
  tag: Tag | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TagDialog({ tag, open, onOpenChange }: TagDialogProps) {
  const queryClient = useQueryClient()
  const isEdit = !!tag

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TagFormValues>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: '',
      slug: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (tag) {
        reset({
          name: tag.name,
          slug: tag.slug,
        })
      } else {
        reset({
          name: '',
          slug: '',
        })
      }
    }
  }, [tag, open, reset])

  const mutation = useMutation({
    mutationFn: (data: TagFormValues) => {
      if (isEdit && tag) {
        return tagService.update(tag.id, data)
      }
      return tagService.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      toast.success(isEdit ? 'Cập nhật tag thành công' : 'Thêm tag thành công')
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    },
  })

  const onSubmit = (data: TagFormValues) => {
    mutation.mutate(data)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setValue('name', name)
    if (!isEdit) {
      const slug = slugify(name, { lower: true, strict: true, locale: 'vi' })
      setValue('slug', slug)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px] rounded-3xl border-white/10 shadow-2xl overflow-hidden p-0'>
        <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none' />
        <form onSubmit={handleSubmit(onSubmit)} className='p-8 space-y-6 relative'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold flex items-center gap-3'>
              <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                <Hash className='h-6 w-6' />
              </div>
              {isEdit ? 'Chỉnh sửa tag' : 'Thêm tag mới'}
            </DialogTitle>
            <DialogDescription className='text-muted-foreground/80 font-medium pt-2'>
              {isEdit ? 'Cập nhật thông tin tag hiện tại.' : 'Tạo một tag mới để gắn thẻ cho các bài viết của bạn.'}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-5 py-2'>
            <div className='grid gap-2.5'>
              <Label htmlFor='name' className='ml-1 font-bold text-sm text-foreground/80'>
                Tên tag
              </Label>
              <Input
                id='name'
                {...register('name')}
                onChange={handleNameChange}
                placeholder='Ví dụ: React, NestJS...'
                className='bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl h-11 transition-all'
              />
              {errors.name && <p className='text-xs text-destructive font-bold ml-1'>{errors.name.message}</p>}
            </div>
            <div className='grid gap-2.5'>
              <Label htmlFor='slug' className='ml-1 font-bold text-sm text-foreground/80'>
                Slug (Đường dẫn)
              </Label>
              <Input
                id='slug'
                {...register('slug')}
                placeholder='ví dụ: react-js'
                className='bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl h-11 transition-all font-mono text-xs'
              />
              {errors.slug && <p className='text-xs text-destructive font-bold ml-1'>{errors.slug.message}</p>}
            </div>
          </div>

          <DialogFooter className='gap-2 pt-4'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => onOpenChange(false)}
              className='rounded-xl px-6 hover:bg-muted font-bold text-muted-foreground'
            >
              Hủy
            </Button>
            <Button
              type='submit'
              className='rounded-xl px-8 shadow-lg shadow-primary/20 font-bold bg-primary hover:scale-[1.02] transition-transform active:scale-95'
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Đang xử lý...' : isEdit ? 'Lưu thay đổi' : 'Lưu tag'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
