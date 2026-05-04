import { useFormContext } from 'react-hook-form'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function SEOAccordion() {
  const { register } = useFormContext()

  return (
    <AccordionItem value='seo' className='border rounded-2xl bg-card px-4 shadow-sm'>
      <AccordionTrigger className='font-semibold hover:no-underline'>SEO Advanced</AccordionTrigger>
      <AccordionContent className='h-auto space-y-4 pt-2 pb-4'>
        <div className='space-y-2'>
          <Label className='text-xs font-semibold text-muted-foreground'>Meta Title</Label>
          <Input placeholder='Tiêu đề SEO...' className='h-10 rounded-xl' {...register('metaTitle')} />
        </div>
        <div className='space-y-2'>
          <Label className='text-xs font-semibold text-muted-foreground'>Meta Description</Label>
          <Textarea
            placeholder='Mô tả SEO...'
            className='min-h-[80px] rounded-xl resize-none'
            {...register('metaDescription')}
          />
        </div>
        <div className='space-y-2'>
          <Label className='text-xs font-semibold text-muted-foreground'>Meta Keywords</Label>
          <Input placeholder='tag1, tag2, tag3...' className='h-10 rounded-xl' {...register('metaKeywords')} />
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
