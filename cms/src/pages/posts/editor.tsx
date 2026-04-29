import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Send } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { categoryService } from '@/services/category.service'
import { postService } from '@/services/post.service'
import { PostStatus } from '@/types'

const postSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  slug: z.string().min(1, 'Slug không được để trống'),
  content: z.string().min(1, 'Nội dung không được để trống'),
  categoryId: z.number().optional(),
  status: z.nativeEnum(PostStatus).default(PostStatus.DRAFT),
  publishedAt: z.string().optional().nullable(),
})

type PostFormValues = z.infer<typeof postSchema>

export default function PostEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEdit = !!id

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema) as any,
    defaultValues: {
      status: PostStatus.DRAFT,
      content: '',
    },
  })

  const title = watch('title')

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEdit && title) {
      const slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/([^0-9a-z-\s])/g, '')
        .replace(/(\s+)/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
      setValue('slug', slug)
    }
  }, [title, isEdit, setValue])

  // Fetch post data if editing
  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postService.findOne(Number(id)),
    enabled: isEdit,
  })

  // Fetch categories
  const { data: catResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.findAll(),
  })
  const categories = catResponse?.data || []

  useEffect(() => {
    if (post) {
      setValue('title', post.title)
      setValue('slug', post.slug)
      setValue('content', post.content || '')
      setValue('categoryId', post.categoryId || undefined)
      setValue('status', post.status as any)
      setValue('publishedAt', post.publishedAt)
    }
  }, [post, setValue])

  const mutation = useMutation({
    mutationFn: (data: PostFormValues) => (isEdit ? postService.update(Number(id), data) : postService.create(data)),
    onSuccess: () => {
      toast.success(isEdit ? 'Cập nhật bài viết thành công' : 'Tạo bài viết mới thành công')
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      navigate('/posts')
    },
    onError: () => {
      toast.error('Có lỗi xảy ra, vui lòng thử lại')
    },
  })

  if (isEdit && isLoadingPost) {
    return <div className='p-8 flex items-center justify-center'>Đang tải bài viết...</div>
  }

  return (
    <div className='p-8 space-y-8'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' onClick={() => navigate('/posts')} className='rounded-full'>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>{isEdit ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h1>
            <p className='text-muted-foreground'>
              {isEdit ? 'Cập nhật nội dung bài viết của bạn.' : 'Bắt đầu sáng tạo nội dung mới.'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <Button variant='outline' onClick={() => navigate('/posts')}>
            Hủy
          </Button>
          <Button onClick={handleSubmit((data) => mutation.mutate(data))} disabled={mutation.isPending}>
            <Save className='mr-2 h-4 w-4' />
            Lưu bản nháp
          </Button>
          <Button
            onClick={handleSubmit((data) => mutation.mutate({ ...data, status: PostStatus.PUBLISHED }))}
            disabled={mutation.isPending}
          >
            <Send className='mr-2 h-4 w-4' />
            Xuất bản
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <div className='lg:col-span-2 space-y-6'>
          <Card className='rounded-2xl border-muted/50 shadow-sm overflow-hidden'>
            <CardContent className='p-6 space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='title' className='text-sm font-semibold'>
                  Tiêu đề bài viết
                </Label>
                <Input
                  id='title'
                  placeholder='Nhập tiêu đề hấp dẫn...'
                  className='text-lg h-12 rounded-xl focus-visible:ring-primary/20'
                  {...register('title')}
                />
                {errors.title && <p className='text-xs text-destructive'>{errors.title.message}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='slug' className='text-sm font-semibold'>
                  Slug (Đường dẫn)
                </Label>
                <div className='flex items-center gap-2'>
                  <span className='text-sm text-muted-foreground font-mono'>/posts/</span>
                  <Input
                    id='slug'
                    className='h-10 rounded-xl font-mono text-xs focus-visible:ring-primary/20'
                    {...register('slug')}
                  />
                </div>
                {errors.slug && <p className='text-xs text-destructive'>{errors.slug.message}</p>}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='content' className='text-sm font-semibold'>
                  Nội dung
                </Label>
                <textarea
                  id='content'
                  placeholder='Viết nội dung bài viết ở đây...'
                  className='w-full min-h-[400px] p-4 rounded-2xl border border-input bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all resize-none font-sans leading-relaxed'
                  {...register('content')}
                />
                {errors.content && <p className='text-xs text-destructive'>{errors.content.message}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card className='rounded-2xl border-muted/50 shadow-sm overflow-hidden'>
            <CardContent className='p-6 space-y-6'>
              <div className='space-y-2'>
                <Label className='text-sm font-semibold'>Danh mục</Label>
                <select
                  className='w-full h-11 rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all'
                  {...register('categoryId', { valueAsNumber: true })}
                >
                  <option value=''>Chọn danh mục</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-semibold'>Trạng thái</Label>
                <div className='grid grid-cols-2 gap-2'>
                  <Button
                    type='button'
                    variant={watch('status') === PostStatus.DRAFT ? 'default' : 'outline'}
                    onClick={() => setValue('status', PostStatus.DRAFT)}
                    className='rounded-xl h-11'
                  >
                    Nháp
                  </Button>
                  <Button
                    type='button'
                    variant={watch('status') === PostStatus.PUBLISHED ? 'default' : 'outline'}
                    onClick={() => setValue('status', PostStatus.PUBLISHED)}
                    className='rounded-xl h-11'
                  >
                    Công khai
                  </Button>
                </div>
              </div>

              <div className='pt-6 border-t border-muted/50'>
                <div className='flex flex-col gap-4'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground font-medium'>Tác giả</span>
                    <span className='font-bold'>Bạn</span>
                  </div>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground font-medium'>Ngày tạo</span>
                    <span className='font-bold'>
                      {isEdit && post ? new Date(post.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='rounded-2xl shadow-sm overflow-hidden bg-primary/5 border border-primary/10'>
            <CardContent className='p-6'>
              <h3 className='font-bold text-primary mb-2'>Mẹo viết bài</h3>
              <ul className='text-xs space-y-2 text-primary/80 list-disc pl-4 font-medium'>
                <li>Sử dụng tiêu đề ngắn gọn nhưng thu hút.</li>
                <li>Kiểm tra slug xem đã chuẩn SEO chưa.</li>
                <li>Phân loại đúng danh mục để người dùng dễ tìm kiếm.</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
