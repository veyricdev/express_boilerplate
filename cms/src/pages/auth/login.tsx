import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authService } from '@/services/auth.service'
import { useAuth } from '@/store/auth'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const navigate = useNavigate()
  const { setAuth, updateToken } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      // 1. Login to get tokens
      const { accessToken, refreshToken } = await authService.login({
        email: data.email,
        password: data.password,
      })

      // 2. Temporarily set tokens to call getProfile (interceptor will use them)
      updateToken(accessToken, refreshToken)

      // 3. Fetch full profile
      const user = await authService.getProfile()

      // 4. Finalize auth state
      setAuth(user as any, accessToken, refreshToken)

      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className='w-full'
    >
      <div className='space-y-8'>
        <div className='space-y-2'>
          <h2 className='text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent'>
            Đăng nhập
          </h2>
          <p className='text-muted-foreground font-medium'>Chào mừng bạn quay trở lại. Vui lòng nhập thông tin.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className='p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium flex items-center gap-3'
            >
              <div className='h-1.5 w-1.5 rounded-full bg-destructive animate-pulse' />
              {error}
            </motion.div>
          )}

          <div className='space-y-5'>
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-sm font-semibold text-foreground/80 ml-1'>
                Email
              </Label>
              <div className='relative group'>
                <Mail className='absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground transition-colors group-focus-within:text-primary' />
                <Input
                  id='email'
                  placeholder='admin@example.com'
                  type='email'
                  autoComplete='email'
                  className='pl-11 h-12 bg-card border-muted-foreground/20 focus-visible:ring-primary/20 rounded-2xl transition-all shadow-sm'
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className='text-xs font-medium text-destructive ml-1 mt-1.5'>{errors.email.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between ml-1'>
                <Label htmlFor='password' className='text-sm font-semibold text-foreground/80'>
                  Mật khẩu
                </Label>
                <a href='#' className='text-xs font-bold text-primary/70 hover:text-primary transition-colors'>
                  Quên mật khẩu?
                </a>
              </div>
              <div className='relative group'>
                <Lock className='absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground transition-colors group-focus-within:text-primary' />
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='current-password'
                  className='pl-11 pr-12 h-12 bg-card border-muted-foreground/20 focus-visible:ring-primary/20 rounded-2xl transition-all shadow-sm'
                  {...register('password')}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted'
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className='text-xs font-medium text-destructive ml-1 mt-1.5'>{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className='flex items-center space-x-3 ml-1'>
            <Checkbox id='remember' {...register('rememberMe')} className='rounded-md h-5 w-5' />
            <label htmlFor='remember' className='text-sm font-medium text-muted-foreground cursor-pointer select-none'>
              Ghi nhớ đăng nhập
            </label>
          </div>

          <Button
            type='submit'
            className='w-full h-12 text-base font-bold rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-primary/20'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập hệ thống'
            )}
          </Button>
        </form>

        <div className='pt-8 border-t border-muted/50 text-center'>
          <p className='text-xs text-muted-foreground font-medium'>
            Hệ thống quản lý nội dung &copy; {new Date().getFullYear()} • Phiên bản v1.0.0
          </p>
        </div>
      </div>
    </motion.div>
  )
}
