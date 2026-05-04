import { useFormContext } from 'react-hook-form'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PostStatus } from '@/types'

export function PublishAccordion() {
  const { register, watch, setValue } = useFormContext()
  const status = watch('status')
  const publishedAt = watch('publishedAt')

  return (
    <AccordionItem value='publish' className='border rounded-2xl bg-card px-4 shadow-sm'>
      <AccordionTrigger className='font-semibold hover:no-underline'>Xuất bản</AccordionTrigger>
      <AccordionContent className='h-auto space-y-4 pt-2 pb-4'>
        <div className='space-y-2'>
          <Label className='text-xs font-semibold text-muted-foreground'>Trạng thái</Label>
          <div className='grid grid-cols-2 gap-2'>
            <Button
              type='button'
              variant={status === PostStatus.DRAFT ? 'default' : 'outline'}
              onClick={() => setValue('status', PostStatus.DRAFT)}
              className='rounded-xl h-10'
            >
              Nháp
            </Button>
            <Button
              type='button'
              variant={status === PostStatus.PUBLISHED ? 'default' : 'outline'}
              onClick={() => {
                setValue('status', PostStatus.PUBLISHED)
                if (!publishedAt) {
                  setValue('publishedAt', new Date().toISOString().slice(0, 16))
                }
              }}
              className='rounded-xl h-10'
            >
              Xuất bản
            </Button>
          </div>
        </div>

        {status !== PostStatus.DRAFT && (
          <div className='space-y-2'>
            <Label htmlFor='publishedAt' className='text-xs font-semibold text-muted-foreground'>
              Ngày xuất bản
            </Label>
            <Input id='publishedAt' type='datetime-local' className='h-10 rounded-xl' {...register('publishedAt')} />
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}
