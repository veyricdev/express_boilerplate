import { Plus, Tag as TagIcon } from 'lucide-react'
import { useState } from 'react'
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

export function TagHeader() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent uppercase flex items-center gap-3'>
          <TagIcon className='h-8 w-8 text-primary/60' /> Thẻ (Tags)
        </h1>
        <p className='text-muted-foreground font-medium mt-1 uppercase text-[11px] tracking-widest'>
          Tags • Quản lý các thẻ bài viết để tối ưu hóa tìm kiếm.
        </p>
      </div>

      <Button onClick={() => setIsAddDialogOpen(true)} className='shadow-lg shadow-primary/20 h-10 rounded-xl px-5 font-bold transition-all hover:scale-[1.02] active:scale-95'>
        <Plus className='mr-2 h-4 w-4' /> Thêm thẻ mới
      </Button>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className='sm:max-w-[400px] rounded-3xl border-white/10 shadow-2xl overflow-hidden p-0 animate-in zoom-in-95 duration-200'>
          <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none' />
          <div className='p-8 space-y-6 relative'>
            <DialogHeader>
              <DialogTitle className='text-2xl font-bold flex items-center gap-3'>
                <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                  <TagIcon className='h-6 w-6' />
                </div>
                Thêm Tag mới
              </DialogTitle>
              <DialogDescription className='text-muted-foreground/80 font-medium pt-2'>
                Tạo một tag mới để đánh dấu nội dung bài viết.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-5 py-2'>
              <div className='grid gap-2.5'>
                <Label htmlFor='tag-name' className='ml-1 font-bold text-sm text-foreground/80'>
                  Tên Tag
                </Label>
                <Input
                  id='tag-name'
                  placeholder='Ví dụ: ReactJS, NestJS...'
                  className='bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl h-11 transition-all'
                />
              </div>
            </div>

            <DialogFooter className='gap-2 pt-4'>
              <Button
                variant='ghost'
                onClick={() => setIsAddDialogOpen(false)}
                className='rounded-xl px-6 hover:bg-muted font-bold text-muted-foreground'
              >
                Hủy
              </Button>
              <Button className='rounded-xl px-8 shadow-lg shadow-primary/20 font-bold bg-primary hover:scale-[1.02] transition-transform active:scale-95'>
                Lưu Tag
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
