import { hasAnyPermission, hasPermission, PERM_SUPER_ADMIN } from '@shared/constants/permissions'
import { useMemo } from 'react'
import { useAuth } from '@/store/auth'

export function usePermission() {
  const user = useAuth((state) => state.user)
  const permissions = user?.permissions || '0'
  const isOwner = user?.isOwner || false

  return useMemo(() => {
    return {
      has: (perm: bigint) => isOwner || hasPermission(permissions, perm),
      hasAny: (perms: bigint[]) => isOwner || hasAnyPermission(permissions, perms),
      isSuperAdmin: isOwner || hasPermission(permissions, PERM_SUPER_ADMIN),
    }
  }, [permissions, isOwner])
}
