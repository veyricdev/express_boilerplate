import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Copy, Key, Mail, RefreshCw, UserCircle, User as UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
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
import { Switch } from '@/components/ui/switch'
import { userService } from '@/services/user.service'
import { User } from '@/types'

const userSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  password: z.string().optional().or(z.literal('')),
  permissions: z.string(),
  isActive: z.boolean(),
})

type UserFormValues = {
  email: string
  fullName: string
  password?: string
  permissions: string
  isActive: boolean
}

interface UserDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDialog({ user, open, onOpenChange }: UserDialogProps) {
  const queryClient = useQueryClient()
  const isEdit = !!user
  const [copied, setCopied] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      fullName: '',
      password: '',
      permissions: '0',
      isActive: true,
    },
  })

  useEffect(() => {
    if (open) {
      if (user) {
        reset({
          email: user.email,
          fullName: user.fullName,
          password: '',
          permissions: user.permissions || '0',
          isActive: user.isActive,
        })
      } else {
        reset({
          email: '',
          fullName: '',
          password: '',
          permissions: '0',
          isActive: true,
        })
      }
    }
  }, [user, open, reset])

  const mutation = useMutation({
    mutationFn: (data: UserFormValues) => {
      if (isEdit && user) {
        // Only send password if it's provided during edit
        const updateData = { ...data }
        if (!updateData.password) {
          delete updateData.password
        }
        return userService.update(user.id, updateData)
      }
      return userService.create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success(isEdit ? 'Cập nhật người dùng thành công' : 'Thêm người dùng thành công')
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    },
  })

  const onSubmit = (data: UserFormValues) => {
    mutation.mutate(data)
  }

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+'
    const length = 12
    let password = ''
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setValue('password', password)
  }

  const copyToClipboard = () => {
    const password = watch('password')
    if (password) {
      navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('Đã copy mật khẩu vào clipboard')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px] rounded-3xl border-white/10 shadow-2xl overflow-hidden p-0'>
        <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none' />
        <form onSubmit={handleSubmit(onSubmit)} className='p-8 space-y-6 relative' autoComplete='off'>
          {/* Dummy inputs to fool browser autofill */}
          <input type='text' name='email' style={{ display: 'none' }} />
          <input type='password' name='password' style={{ display: 'none' }} />

          <DialogHeader>
            <DialogTitle className='text-2xl font-bold flex items-center gap-3'>
              <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                <UserIcon className='h-6 w-6' />
              </div>
              {isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </DialogTitle>
            <DialogDescription className='text-muted-foreground/80 font-medium pt-2'>
              {isEdit ? 'Cập nhật thông tin tài khoản người dùng.' : 'Tạo tài khoản mới để quản lý hệ thống.'}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-5 py-2'>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2.5'>
                <Label htmlFor='fullName' className='ml-1 font-bold text-sm text-foreground/80 flex items-center gap-2'>
                  <UserCircle className='h-3.5 w-3.5 opacity-50' /> Họ tên
                </Label>
                <Input
                  id='fullName'
                  {...register('fullName')}
                  placeholder='Nguyễn Văn A'
                  className='bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl h-11 transition-all'
                />
                {errors.fullName && (
                  <p className='text-xs text-destructive font-bold ml-1'>{errors.fullName.message}</p>
                )}
              </div>
              <div className='grid gap-2.5'>
                <Label htmlFor='email' className='ml-1 font-bold text-sm text-foreground/80 flex items-center gap-2'>
                  <Mail className='h-3.5 w-3.5 opacity-50' /> Email
                </Label>
                <Input
                  id='email'
                  type='email'
                  {...register('email')}
                  placeholder='email@example.com'
                  className='bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl h-11 transition-all'
                  autoComplete='none'
                />
                {errors.email && <p className='text-xs text-destructive font-bold ml-1'>{errors.email.message}</p>}
              </div>
            </div>

            <div className='grid gap-2.5'>
              <Label
                htmlFor='password'
                className='ml-1 font-bold text-sm text-foreground/80 flex items-center justify-between'
              >
                <div className='flex items-center gap-2'>
                  <Key className='h-3.5 w-3.5 opacity-50' />
                  {isEdit ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}
                </div>
                {!isEdit && (
                  <button
                    type='button'
                    onClick={generatePassword}
                    className='text-primary hover:underline flex items-center gap-1 text-[10px] uppercase tracking-wider'
                  >
                    <RefreshCw className='h-3 w-3' /> Ngẫu nhiên
                  </button>
                )}
              </Label>
              <div className='relative'>
                <Input
                  id='password'
                  type='password'
                  {...register('password')}
                  placeholder={isEdit ? '••••••••' : 'Nhập mật khẩu hoặc tạo ngẫu nhiên'}
                  className='bg-muted/20 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl h-11 transition-all pr-20 font-mono'
                  autoComplete='new-password'
                />
                <div className='absolute right-2 top-1/2 -translate-y-1/2 flex gap-1'>
                  {watch('password') && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={copyToClipboard}
                      className='h-7 w-7 p-0 rounded-md hover:bg-primary/10 hover:text-primary'
                    >
                      {copied ? <Check className='h-3.5 w-3.5 text-emerald-500' /> : <Copy className='h-3.5 w-3.5' />}
                    </Button>
                  )}
                  {isEdit && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={generatePassword}
                      className='h-7 w-7 p-0 rounded-md hover:bg-primary/10 hover:text-primary'
                    >
                      <RefreshCw className='h-3.5 w-3.5' />
                    </Button>
                  )}
                </div>
              </div>
              {errors.password && <p className='text-xs text-destructive font-bold ml-1'>{errors.password.message}</p>}
            </div>

            <div className='flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-muted-foreground/5'>
              <div className='space-y-0.5'>
                <Label htmlFor='isActive' className='font-bold text-sm text-foreground/80'>
                  Trạng thái hoạt động
                </Label>
                <p className='text-[10px] text-muted-foreground font-medium uppercase tracking-tight'>
                  Cho phép người dùng này đăng nhập vào hệ thống.
                </p>
              </div>
              <Switch
                id='isActive'
                checked={watch('isActive')}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
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
              {mutation.isPending ? 'Đang xử lý...' : isEdit ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
