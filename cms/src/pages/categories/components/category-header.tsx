import { Plus, FolderTree } from 'lucide-react'
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

export function CategoryHeader() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent uppercase flex items-center gap-3'>
          <FolderTree className='h-8 w-8 text-primary/60' /> Danh mục
        </h1>
        <p className='text-muted-foreground font-medium mt-1 uppercase text-[11px] tracking-widest'>
          Categories • Quản lý các danh mục bài viết trong hệ thống.
        </p>
      </div>

      <Button onClick={() => setIsAddDialogOpen(true)} className='shadow-lg shadow-primary/20 h-10 rounded-xl px-5 font-bold transition-all hover:scale-[1.02] active:scale-95'>
        <Plus className='mr-2 h-4 w-4' /> Thêm danh mục
      </Button>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className='sm:max-w-[425px] rounded-3xl border-white/10 shadow-2xl overflow-hidden p-0 animate-in zoom-in-95 duration-200'>
          <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none' />
          <div className='p-8 space-y-6 relative'>
            <DialogHeader>
              <DialogTitle className='text-2xl font-bold flex items-center gap-3'>
                <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                  <FolderTree className='h-6 w-6' />
                </div>
                Thêm danh mục mới
              </DialogTitle>
              <DialogDescription className='text-muted-foreground/80 font-medium pt-2'>
                Tạo một danh mục mới để phân loại bài viết của bạn một cách khoa học.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-5 py-2'>
              <div className='grid gap-2.5'>
                <Label htmlFor='name' className='ml-1 font-bold text-sm text-foreground/80'>
                  Tên danh mục
                </Label>
                <Input
                  id='name'
                  placeholder='Ví dụ: Công nghệ, Đời sống...'
                  className='bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl h-11 transition-all'
                />
              </div>
              <div className='grid gap-2.5'>
                <Label htmlFor='description' className='ml-1 font-bold text-sm text-foreground/80'>
                  Mô tả ngắn
                </Label>
                <textarea
                  id='description'
                  placeholder='Mô tả ngắn gọn về danh mục này...'
                  className='min-h-[100px] w-full bg-muted/20 border border-muted-foreground/10 focus-visible:ring-2 focus-visible:ring-primary/20 rounded-xl p-3 text-sm transition-all resize-none'
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
                Lưu danh mục
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
