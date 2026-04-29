import { useEffect } from 'react'
import { Outlet } from 'react-router'

export default function AuthLayout() {
  useEffect(() => {
    document.title = 'Đăng nhập | NEST CMS'
  }, [])

  return (
    <div className='min-h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden'>
      {/* Left Panel: Visual/Information */}
      <div className='hidden md:flex md:w-[55%] lg:w-[60%] bg-primary p-16 flex-col justify-between relative overflow-hidden'>
        {/* Decorative elements - subtle grain or blur */}
        <div className='absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-white/5 rounded-full blur-[140px]' />
        <div className='absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-white/5 rounded-full blur-[140px]' />

        <div className='relative z-10'>
          <div className='inline-block px-3 py-1 rounded-full border border-primary-foreground/10 bg-primary-foreground/5 mb-8'>
            <span className='text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/70'>
              v1.0.0 Stable
            </span>
          </div>
          <h1 className='text-5xl lg:text-8xl font-black tracking-tighter text-primary-foreground leading-[0.85]'>
            CMS
            <br />
            ADMIN
          </h1>
        </div>

        <div className='relative z-10'>
          <div className='space-y-6 max-w-sm'>
            <p className='text-primary-foreground/70 text-lg lg:text-xl font-medium leading-tight'>
              Hệ thống quản trị nội dung chuyên nghiệp, linh hoạt và tối ưu hiệu suất.
            </p>
            <div className='h-1 w-12 bg-primary-foreground/20' />
            <div className='flex gap-4'>
              <div className='text-[10px] font-bold text-primary-foreground/40 uppercase tracking-widest'>Secure</div>
              <div className='text-[10px] font-bold text-primary-foreground/40 uppercase tracking-widest'>Fast</div>
              <div className='text-[10px] font-bold text-primary-foreground/40 uppercase tracking-widest'>Scalable</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <main className='flex-1 flex items-center justify-center p-8 lg:p-16 relative'>
        {/* Mobile Background Decoration */}
        <div className='md:hidden absolute inset-0 pointer-events-none'>
          <div className='absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]' />
          <div className='absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]' />
        </div>

        <div className='w-full max-w-[400px] relative z-10'>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
