import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router'
import slugify from 'slugify'
import { toast } from 'sonner'
import * as z from 'zod'
import { Accordion } from '@/components/ui/accordion'
import { postService } from '@/services/post.service'
import { PostStatus } from '@/types'
import { EditorHeader } from './components/editor/editor-header'
import { EditorMainContent } from './components/editor/editor-main-content'
import { MediaAccordion } from './components/editor/media-accordion'
import { PublishAccordion } from './components/editor/publish-accordion'
import { SEOAccordion } from './components/editor/seo-accordion'
import { TaxonomyAccordion } from './components/editor/taxonomy-accordion'

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

  const methods = useForm<PostFormValues>({
    resolver: zodResolver(postSchema) as any,
    defaultValues: {
      status: PostStatus.DRAFT,
      content: '',
      tagIds: [],
    },
  })

  const { setValue, watch, handleSubmit } = methods
  const title = watch('title')

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEdit && title) {
      const slug = slugify(title, {
        lower: true,
        strict: true,
        locale: 'vi',
      })
      setValue('slug', slug)
    }
  }, [title, isEdit, setValue])

  // Fetch post data if editing
  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postService.findOne(Number(id)),
    enabled: isEdit,
  })

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
      const payload = { ...data }

      // transform publishedAt to full ISO if present, otherwise null
      if (payload.publishedAt) {
        payload.publishedAt = new Date(payload.publishedAt).toISOString()
      } else {
        payload.publishedAt = null
      }

      // Handle categoryId
      if (!payload.categoryId) {
        payload.categoryId = null
      }

      return isEdit ? postService.update(Number(id), payload) : postService.create(payload)
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
    <FormProvider {...methods}>
      <div className='p-4 md:p-8 space-y-6 md:space-y-8'>
        <EditorHeader
          isEdit={isEdit}
          isPending={mutation.isPending}
          onSubmitDraft={handleSubmit((data) => mutation.mutate(data))}
          onSubmitPublish={handleSubmit((data) => mutation.mutate({ ...data, status: PostStatus.PUBLISHED }))}
        />

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8'>
          <EditorMainContent />

          <div className='space-y-6'>
            <Accordion
              type='multiple'
              defaultValue={['publish', 'taxonomy', 'media', 'seo']}
              className='w-full space-y-4'
            >
              <PublishAccordion />
              <TaxonomyAccordion />
              <MediaAccordion />
              <SEOAccordion />
            </Accordion>
          </div>
        </div>
      </div>
    </FormProvider>
  )
}
