import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, ChevronsUpDown, Save, Send, X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import * as z from 'zod'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { categoryService } from '@/services/category.service'
import { postService } from '@/services/post.service'
import { tagService } from '@/services/tag.service'
import { PostStatus } from '@/types'

const postSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  slug: z.string().min(1, 'Slug không được để trống'),
  content: z.string().min(1, 'Nội dung không được để trống'),
  excerpt: z.string().optional(),
  thumbnail: z.string().optional(),
  categoryId: z.number().optional().nullable(),
  tagIds: z.array(z.number()).optional(),
  status: z.nativeEnum(PostStatus).default(PostStatus.DRAFT),
  publishedAt: z.string().optional().nullable(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  metaThumbnail: z.string().optional(),
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
      tagIds: [],
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
    queryFn: () => categoryService.findAll({ limit: 100 }),
  })
  const categories = catResponse?.data || []

  // Fetch tags
  const { data: tagResponse } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagService.findAll({ limit: 100 }),
  })
  const tags = tagResponse?.data || []

  useEffect(() => {
    if (post) {
      setValue('title', post.title)
      setValue('slug', post.slug)
      setValue('content', post.content || '')
      setValue('categoryId', post.categoryId || undefined)
      setValue('status', post.status as any)
      setValue('excerpt', post.excerpt || '')
      setValue('thumbnail', post.thumbnail || '')
      setValue('metaTitle', post.metaTitle || '')
      setValue('metaDescription', post.metaDescription || '')
      setValue('metaKeywords', post.metaKeywords || '')
      setValue('metaThumbnail', post.metaThumbnail || '')

      if (post.publishedAt) {
        setValue('publishedAt', new Date(post.publishedAt).toISOString().slice(0, 16))
      }
      if (post.postTags && Array.isArray(post.postTags)) {
        setValue(
          'tagIds',
          post.postTags.map((pt: any) => pt.tagId)
        )
      }
    }
  }, [post, setValue])

  const mutation = useMutation({
    mutationFn: (data: PostFormValues) => {
      // transform publishedAt to full ISO if present
      if (data.publishedAt) {
        data.publishedAt = new Date(data.publishedAt).toISOString()
      }
      return isEdit ? postService.update(Number(id), data) : postService.create(data)
    },
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
    <div className='p-4 md:p-8 space-y-6 md:space-y-8'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' onClick={() => navigate('/posts')} className='rounded-full shrink-0'>
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold tracking-tight'>
              {isEdit ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {isEdit ? 'Cập nhật nội dung bài viết của bạn.' : 'Bắt đầu sáng tạo nội dung mới.'}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2 md:gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0'>
          <Button variant='outline' onClick={() => navigate('/posts')} className='whitespace-nowrap'>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit((data) => mutation.mutate(data))}
            disabled={mutation.isPending}
            className='whitespace-nowrap'
          >
            <Save className='mr-2 h-4 w-4' />
            Lưu bản nháp
          </Button>
          <Button
            onClick={handleSubmit((data) => mutation.mutate({ ...data, status: PostStatus.PUBLISHED }))}
            disabled={mutation.isPending}
            className='whitespace-nowrap'
          >
            <Send className='mr-2 h-4 w-4' />
            Xuất bản
          </Button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8'>
        {/* CỘT CHÍNH */}
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
                  className='text-lg h-12 rounded-xl focus-visible:ring-primary/20'
                  {...register('title')}
                />
                {errors.title && <p className='text-xs text-destructive'>{errors.title.message}</p>}
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
                {errors.slug && <p className='text-xs text-destructive'>{errors.slug.message}</p>}
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
                {errors.content && <p className='text-xs text-destructive'>{errors.content.message}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CỘT SIDEBAR */}
        <div className='space-y-6'>
          <Accordion
            type='multiple'
            defaultValue={['publish', 'taxonomy', 'media', 'seo']}
            className='w-full space-y-4'
          >
            <AccordionItem value='publish' className='border rounded-2xl bg-card px-4 shadow-sm'>
              <AccordionTrigger className='font-semibold hover:no-underline'>Xuất bản</AccordionTrigger>
              <AccordionContent className='h-auto space-y-4 pt-2 pb-4'>
                <div className='space-y-2'>
                  <Label className='text-xs font-semibold text-muted-foreground'>Trạng thái</Label>
                  <div className='grid grid-cols-2 gap-2'>
                    <Button
                      type='button'
                      variant={watch('status') === PostStatus.DRAFT ? 'default' : 'outline'}
                      onClick={() => setValue('status', PostStatus.DRAFT)}
                      className='rounded-xl h-10'
                    >
                      Nháp
                    </Button>
                    <Button
                      type='button'
                      variant={watch('status') === PostStatus.PUBLISHED ? 'default' : 'outline'}
                      onClick={() => {
                        setValue('status', PostStatus.PUBLISHED)
                        if (!watch('publishedAt')) {
                          const now = new Date()
                          const localDatetime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                            .toISOString()
                            .slice(0, 16)
                          setValue('publishedAt', localDatetime)
                        }
                      }}
                      className='rounded-xl h-10'
                    >
                      Công khai
                    </Button>
                  </div>
                </div>
                {watch('status') !== PostStatus.DRAFT && (
                  <div className='space-y-2'>
                    <Label className='text-xs font-semibold text-muted-foreground'>Lên lịch xuất bản (Tuỳ chọn)</Label>
                    <Input type='datetime-local' className='h-10 rounded-xl w-full' {...register('publishedAt')} />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='taxonomy' className='border rounded-2xl bg-card px-4 shadow-sm'>
              <AccordionTrigger className='font-semibold hover:no-underline'>Phân loại</AccordionTrigger>
              <AccordionContent className='h-auto space-y-4 pt-2 pb-4'>
                <div className='space-y-2'>
                  <Label className='text-xs font-semibold text-muted-foreground'>Danh mục</Label>
                  <Select
                    value={watch('categoryId')?.toString() || ''}
                    onValueChange={(value) => setValue('categoryId', value ? parseInt(value) : null)}
                  >
                    <SelectTrigger className='w-full h-10 rounded-xl'>
                      <SelectValue placeholder='Chọn danh mục' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2 flex flex-col'>
                  <Label className='text-xs font-semibold text-muted-foreground'>Thẻ (Tags)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant='outline'
                        role='combobox'
                        className={cn(
                          'w-full justify-between rounded-xl h-auto min-h-10 px-3 py-2',
                          (!watch('tagIds') || watch('tagIds')?.length === 0) && 'text-muted-foreground'
                        )}
                      >
                        <div className='flex flex-wrap gap-1 items-center'>
                          {watch('tagIds') && watch('tagIds')!.length > 0 ? (
                            watch('tagIds')!.map((id) => {
                              const tag = tags.find((t: any) => t.id === id)
                              return tag ? (
                                <Badge
                                  variant='secondary'
                                  key={id}
                                  className='mr-1 mb-1'
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setValue(
                                      'tagIds',
                                      watch('tagIds')!.filter((tId) => tId !== id)
                                    )
                                  }}
                                >
                                  {tag.name}
                                  <X className='ml-1 h-3 w-3 cursor-pointer' />
                                </Badge>
                              ) : null
                            })
                          ) : (
                            <span className='font-normal text-sm'>Chọn thẻ...</span>
                          )}
                        </div>
                        <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-[300px] p-0' align='start'>
                      <Command>
                        <CommandInput placeholder='Tìm kiếm thẻ...' />
                        <CommandList>
                          <CommandEmpty>Không tìm thấy thẻ nào.</CommandEmpty>
                          <CommandGroup>
                            {tags.map((tag: any) => {
                              const currentTags = watch('tagIds') || []
                              const isSelected = currentTags.includes(tag.id)
                              return (
                                <CommandItem
                                  key={tag.id}
                                  value={tag.name}
                                  onSelect={() => {
                                    if (isSelected) {
                                      setValue(
                                        'tagIds',
                                        currentTags.filter((id) => id !== tag.id)
                                      )
                                    } else {
                                      setValue('tagIds', [...currentTags, tag.id])
                                    }
                                  }}
                                >
                                  <Check className={cn('mr-2 h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                                  {tag.name}
                                </CommandItem>
                              )
                            })}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='media' className='border rounded-2xl bg-card px-4 shadow-sm'>
              <AccordionTrigger className='font-semibold hover:no-underline'>Media</AccordionTrigger>
              <AccordionContent className='h-auto space-y-4 pt-2 pb-4'>
                <div className='space-y-2'>
                  <Label className='text-xs font-semibold text-muted-foreground'>Ảnh đại diện (URL)</Label>
                  <Input placeholder='https://...' className='h-10 rounded-xl' {...register('thumbnail')} />
                  {watch('thumbnail') && (
                    <div className='mt-3 rounded-xl overflow-hidden border aspect-video bg-muted flex items-center justify-center relative group'>
                      <img
                        src={watch('thumbnail')}
                        alt='Thumbnail Preview'
                        className='object-cover w-full h-full'
                        onError={(e) => {
                          ;(e.target as any).style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value='seo' className='border rounded-2xl bg-card px-4 shadow-sm'>
              <AccordionTrigger className='font-semibold hover:no-underline'>SEO Advanced</AccordionTrigger>
              <AccordionContent className='h-auto space-y-4 pt-2 pb-4'>
                <div className='space-y-2'>
                  <Label className='text-xs font-semibold text-muted-foreground'>Meta Title</Label>
                  <Input className='h-10 rounded-xl' placeholder='Tiêu đề SEO...' {...register('metaTitle')} />
                </div>
                <div className='space-y-2'>
                  <Label className='text-xs font-semibold text-muted-foreground'>Meta Description</Label>
                  <Textarea
                    className='min-h-[80px] rounded-xl resize-none'
                    placeholder='Mô tả SEO...'
                    {...register('metaDescription')}
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-xs font-semibold text-muted-foreground'>Meta Keywords</Label>
                  <Input
                    className='h-10 rounded-xl'
                    placeholder='Từ khóa SEO (cách nhau bởi dấu phẩy)...'
                    {...register('metaKeywords')}
                  />
                </div>
                <div className='space-y-2'>
                  <Label className='text-xs font-semibold text-muted-foreground'>Meta Thumbnail (URL)</Label>
                  <Input className='h-10 rounded-xl' placeholder='https://...' {...register('metaThumbnail')} />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}
