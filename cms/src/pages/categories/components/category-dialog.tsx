import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FolderTree } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { categoryService } from '@/services/category.service'
import { Category } from '@/types'

const categorySchema = z.object({
  name: z.string().min(2, 'Tên danh mục phải có ít nhất 2 ký tự'),
  slug: z.string().min(2, 'Slug phải có ít nhất 2 ký tự'),
  description: z.string().optional().nullable(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryDialogProps {
  category: Category | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CategoryDialog({ category, open, onOpenChange }: CategoryDialogProps) {
  const queryClient = useQueryClient()
  const isEdit = !!category

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      metaTitle: '',
      metaDescription: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (category) {
        reset({
          name: category.name,
          slug: category.slug,
          description: category.description || '',
          metaTitle: category.metaTitle || '',
          metaDescription: category.metaDescription || '',
        })
      } else {
        reset({
          name: '',
          slug: '',
          description: '',
          metaTitle: '',
          metaDescription: '',
        })
      }
    }
  }, [category, open, reset])

  const mutation = useMutation({
    mutationFn: (data: CategoryFormValues) => {
      if (isEdit && category) {
        return categoryService.update(category.id, data)
      }
      return categoryService.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success(isEdit ? 'Cập nhật danh mục thành công' : 'Thêm danh mục thành công')
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    },
  })

  const onSubmit = (data: CategoryFormValues) => {
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
      <DialogContent className='sm:max-w-[500px] rounded-3xl border-white/10 shadow-2xl overflow-hidden p-0 bg-background'>
        <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none' />
        <form onSubmit={handleSubmit(onSubmit)} className='p-8 space-y-6 relative'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold flex items-center gap-3'>
              <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                <FolderTree className='h-6 w-6' />
              </div>
              {isEdit ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            </DialogTitle>
            <DialogDescription className='text-muted-foreground/80 font-medium pt-2 text-sm'>
              {isEdit
                ? 'Cập nhật thông tin danh mục hiện tại.'
                : 'Tạo một danh mục mới để phân loại bài viết của bạn một cách khoa học.'}
            </DialogDescription>
          </DialogHeader>

          <div className='grid gap-6 py-2 overflow-y-auto max-h-[60vh] px-1'>
            <div className='grid gap-2.5'>
              <Label htmlFor='name' className='ml-1 font-bold text-sm text-foreground/80'>
                Tên danh mục
              </Label>
              <Input
                id='name'
                {...register('name')}
                onChange={handleNameChange}
                placeholder='Ví dụ: Công nghệ, Đời sống...'
                className='bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl h-11 transition-all font-medium'
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
                placeholder='ví dụ: cong-nghe'
                className='bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl h-11 transition-all font-mono text-xs'
              />
              {errors.slug && <p className='text-xs text-destructive font-bold ml-1'>{errors.slug.message}</p>}
            </div>

            <div className='grid gap-2.5'>
              <Label htmlFor='description' className='ml-1 font-bold text-sm text-foreground/80'>
                Mô tả ngắn
              </Label>
              <Textarea
                id='description'
                {...register('description')}
                placeholder='Mô tả ngắn gọn về danh mục này...'
                className='min-h-[80px] bg-muted/20 border-muted-foreground/10 focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl p-3 text-sm transition-all resize-none'
              />
            </div>

            <div className='space-y-4 pt-2 border-t border-border/40'>
              <h4 className='text-xs font-black uppercase tracking-wider text-muted-foreground/60 ml-1'>
                Tối ưu SEO (Tùy chọn)
              </h4>

              <div className='grid gap-2.5'>
                <Label htmlFor='metaTitle' className='ml-1 font-bold text-sm text-foreground/80'>
                  SEO Title
                </Label>
                <Input
                  id='metaTitle'
                  {...register('metaTitle')}
                  placeholder='Tiêu đề hiển thị trên kết quả tìm kiếm'
                  className='bg-muted/10 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl h-10 transition-all text-sm'
                />
              </div>

              <div className='grid gap-2.5'>
                <Label htmlFor='metaDescription' className='ml-1 font-bold text-sm text-foreground/80'>
                  SEO Description
                </Label>
                <Textarea
                  id='metaDescription'
                  {...register('metaDescription')}
                  placeholder='Mô tả hiển thị trên kết quả tìm kiếm'
                  className='min-h-[70px] bg-muted/10 border-muted-foreground/10 focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl p-3 text-sm transition-all resize-none'
                />
              </div>
            </div>
          </div>

          <DialogFooter className='gap-2 pt-4 border-t border-border/40'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => onOpenChange(false)}
              className='rounded-xl px-6 hover:bg-muted font-bold text-muted-foreground transition-colors'
            >
              Hủy
            </Button>
            <Button
              type='submit'
              className='rounded-xl px-8 shadow-lg shadow-primary/20 font-bold bg-primary hover:scale-[1.02] transition-all active:scale-95'
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Đang xử lý...' : isEdit ? 'Lưu thay đổi' : 'Lưu danh mục'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
