import { useFormContext } from 'react-hook-form'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function MediaAccordion() {
  const { register, watch } = useFormContext()
  const thumbnail = watch('thumbnail')

  return (
    <AccordionItem value='media' className='border rounded-2xl bg-card px-4 shadow-sm'>
      <AccordionTrigger className='font-semibold hover:no-underline'>Media</AccordionTrigger>
      <AccordionContent className='h-auto space-y-4 pt-2 pb-4'>
        <div className='space-y-2'>
          <Label className='text-xs font-semibold text-muted-foreground'>Ảnh đại diện (URL)</Label>
          <Input placeholder='https://...' className='h-10 rounded-xl' {...register('thumbnail')} />
          {thumbnail && (
            <div className='mt-3 rounded-xl overflow-hidden border aspect-video bg-muted flex items-center justify-center relative group'>
              <img
                src={thumbnail}
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
  )
}
