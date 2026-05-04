import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router'

import AdminLayout from '@/layouts/admin-layout'
import AuthLayout from '@/layouts/auth-layout'
import { useAuth } from '@/store/auth'

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/auth/login'))
const DashboardPage = lazy(() => import('@/pages/dashboard'))
const PostsPage = lazy(() => import('@/pages/posts'))
const PostEditorPage = lazy(() => import('@/pages/posts/editor'))
const CategoriesPage = lazy(() => import('@/pages/categories'))
const TagsPage = lazy(() => import('@/pages/tags'))
const UsersPage = lazy(() => import('@/pages/users'))
const AuditLogsPage = lazy(() => import('@/pages/audit-logs'))
const SettingsPage = lazy(() => import('@/pages/settings'))
const ForbiddenPage = lazy(() => import('@/pages/errors/403'))

const ProtectedRoute = () => {
  const isAuthenticated = useAuth((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirectUrl}`} replace />
  }

  return <Outlet />
}

export const router = createBrowserRouter(
  [
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: '/',
          element: <AdminLayout />,
          children: [
            {
              index: true,
              element: (
                <Suspense fallback={null}>
                  <DashboardPage />
                </Suspense>
              ),
            },
            {
              path: 'posts',
              children: [
                {
                  index: true,
                  element: (
                    <Suspense fallback={null}>
                      <PostsPage />
                    </Suspense>
                  ),
                },
                {
                  path: 'create',
                  element: (
                    <Suspense fallback={null}>
                      <PostEditorPage />
                    </Suspense>
                  ),
                },
                {
                  path: ':id/edit',
                  element: (
                    <Suspense fallback={null}>
                      <PostEditorPage />
                    </Suspense>
                  ),
                },
              ],
            },
            {
              path: 'categories',
              element: (
                <Suspense fallback={null}>
                  <CategoriesPage />
                </Suspense>
              ),
            },
            {
              path: 'tags',
              element: (
                <Suspense fallback={null}>
                  <TagsPage />
                </Suspense>
              ),
            },
            {
              path: 'users',
              element: (
                <Suspense fallback={null}>
                  <UsersPage />
                </Suspense>
              ),
            },
            {
              path: 'audit-logs',
              element: (
                <Suspense fallback={null}>
                  <AuditLogsPage />
                </Suspense>
              ),
            },
            {
              path: 'settings',
              element: (
                <Suspense fallback={null}>
                  <SettingsPage />
                </Suspense>
              ),
            },
            {
              path: '403',
              element: (
                <Suspense fallback={null}>
                  <ForbiddenPage />
                </Suspense>
              ),
            },
          ],
        },
      ],
    },
    {
      element: <AuthLayout />,
      children: [
        {
          path: '/login',
          element: (
            <Suspense fallback={null}>
              <LoginPage />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to='/' replace />,
    },
  ],
  {
    basename: '/cms',
  }
)
