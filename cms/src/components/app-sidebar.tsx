import {
  PERM_AUDIT_READ,
  PERM_CANDIDATES_READ,
  PERM_CATS_READ,
  PERM_CONTACTS_READ,
  PERM_DEPARTMENTS_READ,
  PERM_JOBS_READ,
  PERM_POSTS_READ,
  PERM_SETTINGS_READ,
  PERM_TAGS_READ,
  PERM_USERS_READ,
} from '@shared/constants/permissions'
import {
  BadgeCheck,
  Bell,
  Briefcase,
  Building2,
  ChevronsUpDown,
  FileText,
  FolderTree,
  History,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  Tag,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { AccountDialog } from '@/components/account-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  useSidebar,
} from '@/components/ui/sidebar'
import { usePermission } from '@/hooks/use-permission'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/auth'

const navigationGroups = [
  {
    label: 'Tổng quan',
    items: [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard, perm: undefined },
    ],
  },
  {
    label: 'Nội dung',
    items: [
      { name: 'Bài viết', href: '/posts', icon: FileText, perm: PERM_POSTS_READ },
      { name: 'Danh mục', href: '/categories', icon: FolderTree, perm: PERM_CATS_READ },
      { name: 'Tags', href: '/tags', icon: Tag, perm: PERM_TAGS_READ },
    ],
  },
  {
    label: 'Tuyển dụng',
    items: [
      { name: 'Phòng ban', href: '/departments', icon: Building2, perm: PERM_DEPARTMENTS_READ },
      { name: 'Tin tuyển dụng', href: '/jobs', icon: Briefcase, perm: PERM_JOBS_READ },
      { name: 'Ứng viên', href: '/candidates', icon: Users, perm: PERM_CANDIDATES_READ },
    ],
  },
  {
    label: 'Liên hệ',
    items: [
      { name: 'Hộp thư', href: '/contacts', icon: Mail, perm: PERM_CONTACTS_READ },
    ],
  },
  {
    label: 'Hệ thống',
    items: [
      { name: 'Người dùng', href: '/users', icon: Users, perm: PERM_USERS_READ },
      { name: 'Audit Logs', href: '/audit-logs', icon: History, perm: PERM_AUDIT_READ },
      { name: 'Cấu hình', href: '/settings', icon: Settings, perm: PERM_SETTINGS_READ },
    ],
  },
]

export function AppSidebar() {
  const location = useLocation()
  const { isMobile } = useSidebar()
  const [accountDialogOpen, setAccountDialogOpen] = useState(false)
  const user = useAuth((state) => state.user)
  const logout = useAuth((state) => state.logout)
  const permission = usePermission()

  const handleLogout = () => {
    logout()
  }

  const userData = {
    name: user?.fullName || 'Admin',
    email: user?.email || 'admin@example.com',
    avatar: '',
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
        {navigationGroups.map((group) => {
          const visibleItems = group.items.filter((item) => !item.perm || permission.has(item.perm))
          if (visibleItems.length === 0) return null
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className='group-data-[collapsible=icon]:hidden px-4 transition-all duration-200'>
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className='gap-1 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center transition-all duration-200'>
                  {visibleItems.map((item) => {
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
                            'transition-all duration-200 h-11 px-3 rounded-xl w-full',
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
          )
        })}
      </SidebarContent>
      <SidebarFooter className='p-2 group-data-[collapsible=icon]:p-2 border-t'>
        <SidebarMenu className='group-data-[collapsible=icon]:items-center'>
          <SidebarMenuItem className='w-full flex justify-center'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-auto'
                >
                  <Avatar className='h-8 w-8 rounded-lg'>
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback className='rounded-lg bg-primary/10 text-primary'>
                      {userData.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden'>
                    <span className='truncate font-medium'>{userData.name}</span>
                    <span className='truncate text-xs text-muted-foreground'>{userData.email}</span>
                  </div>
                  <ChevronsUpDown className='ml-auto size-4 group-data-[collapsible=icon]:hidden' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
                side={isMobile ? 'bottom' : 'right'}
                align='end'
                sideOffset={4}
              >
                <DropdownMenuLabel className='p-0 font-normal'>
                  <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                    <Avatar className='h-8 w-8 rounded-lg'>
                      <AvatarImage src={userData.avatar} alt={userData.name} />
                      <AvatarFallback className='rounded-lg bg-primary/10 text-primary'>
                        {userData.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='grid flex-1 text-left text-sm leading-tight'>
                      <span className='truncate font-medium'>{userData.name}</span>
                      <span className='truncate text-xs text-muted-foreground'>{userData.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setAccountDialogOpen(true)}>
                    <BadgeCheck className='size-4' />
                    Tài khoản
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className='size-4' />
                    Thông báo
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className='text-destructive focus:text-destructive'>
                  <LogOut className='size-4' />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
      <AccountDialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen} />
    </Sidebar>
  )
}
