import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { AppSidebar } from '@/components/app-sidebar'
import { ModeToggle } from '@/components/mode-toggle'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Bài viết', href: '/posts' },
  { name: 'Danh mục', href: '/categories' },
  { name: 'Tags', href: '/tags' },
  { name: 'Audit Logs', href: '/audit-logs' },
  { name: 'Người dùng', href: '/users' },
]

export default function AdminLayout() {
  const location = useLocation()

  const currentNav = navigation.find(
    (n) => location.pathname === n.href || (n.href !== '/' && location.pathname.startsWith(n.href))
  )

  useEffect(() => {
    if (currentNav) {
      document.title = `${currentNav.name} | NEST CMS`
    } else {
      document.title = 'NEST CMS'
    }
  }, [currentNav])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className='min-w-0'>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-all duration-200 ease-in-out'>
          <div className='flex items-center gap-2'>
            <SidebarTrigger className='-ml-1' />
            <Separator orientation='vertical' className='mx-2 h-4 self-center!' />
            <Breadcrumb>
              <BreadcrumbList className='text-base flex items-center'>
                <BreadcrumbItem className='hidden md:block'>
                  <BreadcrumbLink asChild>
                    <Link
                      to='/'
                      className='font-bold text-lg tracking-tight bg-linear-to-r from-foreground to-foreground/60 bg-clip-text text-transparent'
                    >
                      NEST CMS
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {currentNav && (
                  <>
                    <BreadcrumbSeparator className='hidden md:block' />
                    <BreadcrumbItem>
                      <BreadcrumbPage className='font-bold text-foreground'>{currentNav.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className='ml-auto flex items-center gap-4'>
            <ModeToggle />
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-4 pt-0 w-full min-w-0 overflow-x-hidden'>
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
