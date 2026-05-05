import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Mail, MapPin, Phone, UserCircle, User as UserIcon } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { userService } from '@/services/user.service'
import { useAuth } from '@/store/auth'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
})

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu cũ'),
    newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
    confirmPassword: z.string().min(6, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  })

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

interface AccountDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountDialog({ open, onOpenChange }: AccountDialogProps) {
  const queryClient = useQueryClient()
  const { user, setAuth, token, refreshToken } = useAuth()

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      email: '',
      username: '',
      phone: '',
      address: '',
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    if (open && user) {
      profileForm.reset({
        fullName: user.fullName || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone || '',
        address: user.address || '',
      })
      passwordForm.reset()
    }
  }, [user, open, profileForm, passwordForm])

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormValues) => userService.updateMe(data),
    onSuccess: (updatedUser) => {
      if (token && refreshToken) {
        setAuth(token, refreshToken, updatedUser)
      }
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] })
      toast.success('Cập nhật thông tin thành công')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin')
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: (data: Omit<PasswordFormValues, 'confirmPassword'>) => userService.changePassword(data),
    onSuccess: () => {
      passwordForm.reset()
      toast.success('Đổi mật khẩu thành công')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu')
    },
  })

  const onProfileSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data)
  }

  const onPasswordSubmit = (data: PasswordFormValues) => {
    const { confirmPassword, ...payload } = data
    changePasswordMutation.mutate(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[550px] rounded-3xl border-white/10 shadow-2xl overflow-hidden p-0 max-h-[90vh] overflow-y-auto'>
        <div className='absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none' />
        <div className='p-6 md:p-8 space-y-6 relative'>
          <DialogHeader>
            <DialogTitle className='text-2xl font-bold flex items-center gap-3'>
              <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary'>
                <UserIcon className='h-6 w-6' />
              </div>
              Tài khoản của tôi
            </DialogTitle>
            <DialogDescription className='text-muted-foreground/80 font-medium pt-2'>
              Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue='profile' className='w-full'>
            <TabsList className='grid w-full grid-cols-2 rounded-xl bg-muted/30 p-1 mb-6 h-10!'>
              <TabsTrigger
                value='profile'
                className='rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm'
              >
                Thông tin cá nhân
              </TabsTrigger>
              <TabsTrigger
                value='password'
                className='rounded-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm'
              >
                Bảo mật
              </TabsTrigger>
            </TabsList>

            <TabsContent value='profile' className='space-y-6 focus-visible:outline-none'>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className='space-y-5'>
                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='fullName'
                      className='ml-1 font-bold text-sm text-foreground/80 flex items-center gap-2'
                    >
                      <UserCircle className='h-3.5 w-3.5 opacity-50' /> Họ và tên
                    </Label>
                    <Input
                      id='fullName'
                      {...profileForm.register('fullName')}
                      className='bg-muted/30 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl transition-all'
                    />
                    {profileForm.formState.errors.fullName && (
                      <p className='text-xs text-destructive font-bold ml-1'>
                        {profileForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='username'
                      className='ml-1 font-bold text-sm text-foreground/80 flex items-center gap-2'
                    >
                      <UserIcon className='h-3.5 w-3.5 opacity-50' /> Tên đăng nhập
                    </Label>
                    <Input
                      id='username'
                      {...profileForm.register('username')}
                      className='bg-muted/30 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl transition-all font-mono'
                    />
                    {profileForm.formState.errors.username && (
                      <p className='text-xs text-destructive font-bold ml-1'>
                        {profileForm.formState.errors.username.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='email'
                      className='ml-1 font-bold text-sm text-foreground/80 flex items-center gap-2'
                    >
                      <Mail className='h-3.5 w-3.5 opacity-50' /> Email
                    </Label>
                    <Input
                      id='email'
                      type='email'
                      {...profileForm.register('email')}
                      className='bg-muted/30 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl transition-all'
                    />
                    {profileForm.formState.errors.email && (
                      <p className='text-xs text-destructive font-bold ml-1'>
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label
                      htmlFor='phone'
                      className='ml-1 font-bold text-sm text-foreground/80 flex items-center gap-2'
                    >
                      <Phone className='h-3.5 w-3.5 opacity-50' /> Số điện thoại
                    </Label>
                    <Input
                      id='phone'
                      {...profileForm.register('phone')}
                      className='bg-muted/30 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl transition-all'
                    />
                    {profileForm.formState.errors.phone && (
                      <p className='text-xs text-destructive font-bold ml-1'>
                        {profileForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='address'
                    className='ml-1 font-bold text-sm text-foreground/80 flex items-center gap-2'
                  >
                    <MapPin className='h-3.5 w-3.5 opacity-50' /> Địa chỉ
                  </Label>
                  <Input
                    id='address'
                    {...profileForm.register('address')}
                    className='bg-muted/30 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl transition-all'
                  />
                  {profileForm.formState.errors.address && (
                    <p className='text-xs text-destructive font-bold ml-1'>
                      {profileForm.formState.errors.address.message}
                    </p>
                  )}
                </div>

                <div className='flex justify-end pt-2'>
                  <Button
                    type='submit'
                    className='rounded-xl px-8 shadow-lg shadow-primary/20 font-bold bg-primary hover:scale-[1.02] transition-transform active:scale-95'
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value='password' className='space-y-6 focus-visible:outline-none'>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className='space-y-5'>
                <div className='space-y-2'>
                  <Label htmlFor='oldPassword' className='ml-1 font-bold text-sm text-foreground/80'>
                    Mật khẩu cũ
                  </Label>
                  <Input
                    id='oldPassword'
                    type='password'
                    {...passwordForm.register('oldPassword')}
                    className='bg-muted/30 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl transition-all'
                  />
                  {passwordForm.formState.errors.oldPassword && (
                    <p className='text-xs text-destructive font-bold ml-1'>
                      {passwordForm.formState.errors.oldPassword.message}
                    </p>
                  )}
                </div>

                <Separator className='opacity-50' />

                <div className='space-y-2'>
                  <Label htmlFor='newPassword' className='ml-1 font-bold text-sm text-foreground/80'>
                    Mật khẩu mới
                  </Label>
                  <Input
                    id='newPassword'
                    type='password'
                    {...passwordForm.register('newPassword')}
                    className='bg-muted/30 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl transition-all'
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className='text-xs text-destructive font-bold ml-1'>
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword' className='ml-1 font-bold text-sm text-foreground/80'>
                    Xác nhận mật khẩu
                  </Label>
                  <Input
                    id='confirmPassword'
                    type='password'
                    {...passwordForm.register('confirmPassword')}
                    className='bg-muted/30 border-muted-foreground/10 focus-visible:ring-primary/20 rounded-xl transition-all'
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className='text-xs text-destructive font-bold ml-1'>
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className='pt-2'>
                  <Button
                    type='submit'
                    variant='secondary'
                    className='w-full rounded-xl shadow-md font-bold hover:scale-[1.02] transition-transform active:scale-95'
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? 'Đang đổi...' : 'Cập nhật mật khẩu'}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
