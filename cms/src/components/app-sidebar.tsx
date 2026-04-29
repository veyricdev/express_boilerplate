import { FileText, FolderTree, History, LayoutDashboard, LogOut, Tag, Users } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/auth'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Bài viết', href: '/posts', icon: FileText },
  { name: 'Danh mục', href: '/categories', icon: FolderTree },
  { name: 'Tags', href: '/tags', icon: Tag },
  { name: 'Audit Logs', href: '/audit-logs', icon: History },
  { name: 'Người dùng', href: '/users', icon: Users },
]

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuth((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader className='border-b h-16 flex items-center px-4 group-data-[collapsible=icon]:px-0 transition-all duration-200'>
        <div className='flex items-center gap-3 font-bold text-2xl tracking-tighter w-full group-data-[collapsible=icon]:justify-center transition-all duration-200'>
          <div className='flex aspect-square size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-200 group-hover:scale-105'>
            <LayoutDashboard className='size-5' />
          </div>
          <span className='truncate group-data-[collapsible=icon]:hidden'>NEST CMS</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className='group-data-[collapsible=icon]:hidden px-4 transition-all duration-200'>
            Hệ thống
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='gap-1 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center transition-all duration-200'>
              {navigation.map((item) => {
                const isActive =
                  location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href))
                return (
                  <SidebarMenuItem
                    key={item.name}
                    className='relative w-full flex justify-center transition-all duration-200'
                  >
                    {isActive && (
                      <div className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full z-10 group-data-[collapsible=icon]:h-4 transition-all duration-200' />
                    )}
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.name}
                      className={cn(
                        'transition-all duration-200 text-base h-11 px-3 rounded-xl w-full',
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-bold shadow-sm'
                          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
                        'group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg group-data-[collapsible=icon]:w-auto'
                      )}
                    >
                      <Link to={item.href} className='flex items-center gap-3 w-full'>
                        <item.icon
                          className={cn(
                            'size-5 shrink-0 transition-colors duration-200',
                            isActive ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                        <span className='truncate group-data-[collapsible=icon]:hidden'>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className='border-t p-2 group-data-[collapsible=icon]:p-0'>
        <SidebarMenu className='group-data-[collapsible=icon]:items-center'>
          <SidebarMenuItem className='w-full flex justify-center'>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip='Đăng xuất'
              className={cn(
                'text-destructive hover:text-destructive hover:bg-destructive/10 text-base h-11 px-3 rounded-xl w-full',
                'group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-lg'
              )}
            >
              <LogOut className='size-5 shrink-0' />
              <span className='group-data-[collapsible=icon]:hidden'>Đăng xuất</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
