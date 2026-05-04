import { hasAnyPermission, hasPermission, PERM_SUPER_ADMIN } from '@shared/constants/permissions'
import { useMemo } from 'react'
import { useAuth } from '@/store/auth'

export function usePermission() {
  const permissions = useAuth((state) => state.user?.permissions || '0')

  return useMemo(() => {
    return {
      has: (perm: bigint) => hasPermission(permissions, perm),
      hasAny: (perms: bigint[]) => hasAnyPermission(permissions, perms),
      isSuperAdmin: hasPermission(permissions, PERM_SUPER_ADMIN),
    }
  }, [permissions])
}
