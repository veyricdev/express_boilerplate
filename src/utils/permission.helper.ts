export class PermissionManager {
  /**
   * Flatten nested permissions object to key paths
   * EXP: USER.CREATE -> "USER.CREATE"
   */
  static flattenPermissions(permissions: any, prefix: string = ''): Recordable<number> {
    const result: Recordable<number> = {}

    for (const [key, value] of Object.entries(permissions)) {
      const path = prefix ? `${prefix}.${key}` : key

      if (typeof value === 'number') result[path] = value
      else if (typeof value === 'object' && value !== null)
        Object.assign(result, PermissionManager.flattenPermissions(value, path))
    }

    return result
  }

  /**
   * Get permission value from nested path
   * EXP: getPermissionValue(PERMISSIONS, 'USER.CREATE') -> 8
   */
  static getPermissionValue(permissions: any, path: string): number | undefined {
    const keys = path.split('.')
    let current = permissions

    for (const key of keys) {
      if (current[key] === undefined) return undefined

      current = current[key]
    }

    return typeof current === 'number' ? current : undefined
  }

  static hasPermission(userPermissions: number, requiredPermission: number) {
    return (userPermissions & requiredPermission) === requiredPermission
  }

  /**
   * Check permissions by name. (string path)
   * EXP: hasPermissionByName(user.permissions, 'USER.CREATE', PERMISSIONS)
   */
  static hasPermissionByName(userPermissions: number, permissionPath: string, permissionsMap: any): boolean {
    const permValue = PermissionManager.getPermissionValue(permissionsMap, permissionPath)
    if (permValue === undefined) {
      console.warn(`Permission "${permissionPath}" not found`)
      return false
    }
    return PermissionManager.hasPermission(userPermissions, permValue)
  }

  static hasAnyPermission(userPermissions: number, permissions: number) {
    return (userPermissions & permissions) !== 0
  }

  static addPermission(userPermissions: number, permission: number) {
    return userPermissions | permission
  }

  static addPermissionByName(userPermissions: number, permissionPath: string, permissionsMap: any): number {
    const permValue = PermissionManager.getPermissionValue(permissionsMap, permissionPath)
    if (permValue === undefined) {
      console.warn(`Permission "${permissionPath}" not found`)
      return userPermissions
    }
    return PermissionManager.addPermission(userPermissions, permValue)
  }

  static removePermission(userPermissions: number, permission: number) {
    return userPermissions & ~permission
  }

  static removePermissionByName(userPermissions: number, permissionPath: string, permissionsMap: any): number {
    const permValue = PermissionManager.getPermissionValue(permissionsMap, permissionPath)
    if (permValue === undefined) {
      console.warn(`Permission "${permissionPath}" not found`)
      return userPermissions
    }
    return PermissionManager.removePermission(userPermissions, permValue)
  }

  static togglePermission(userPermissions: number, permission: number) {
    return userPermissions ^ permission
  }

  static hasAllPermissions(userPermissions: number, permissions: number[]): boolean {
    return permissions.every((perm) => PermissionManager.hasPermission(userPermissions, perm))
  }

  /**
   * Get a list of currently available permissions.
   * @returns ['MANAGE_ROLES', 'USER.CREATE', 'POST.READ', ...]
   */
  static getPermissionList(userPermissions: number, permissionsMap: any): string[] {
    const flatPermissions = PermissionManager.flattenPermissions(permissionsMap)
    const list: string[] = []

    for (const [path, value] of Object.entries(flatPermissions)) {
      if (PermissionManager.hasPermission(userPermissions, value)) {
        list.push(path)
      }
    }

    return list
  }

  /**
   * Get a list of group permissions by category.
   * @returns {
   *   root: ['MANAGE_ROLES', 'VIEW_ANALYTICS'],
   *   USER: ['CREATE', 'READ', 'UPDATE'],
   *   POST: ['CREATE', 'READ']
   * }
   */
  static getPermissionsByCategory(userPermissions: number, permissionsMap: any): Recordable<string[]> {
    const list = PermissionManager.getPermissionList(userPermissions, permissionsMap)
    const categorized: Recordable<string[]> = {}

    for (const path of list) {
      const parts = path.split('.')
      if (parts.length === 1) {
        // Root level permissions
        if (!categorized['root']) categorized['root'] = []
        categorized['root'].push(parts[0])
      } else {
        // Nested permissions
        const category = parts[0]
        const permission = parts.slice(1).join('.')
        if (!categorized[category]) categorized[category] = []
        categorized[category].push(permission)
      }
    }

    return categorized
  }
}
