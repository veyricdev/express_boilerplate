/**
 * Bit Flags Permissions — BigInt per-resource
 * Each resource has 4 bits: READ | WRITE | UPDATE | DELETE
 */

export const PERM_NONE = 0n

// ── Posts ──────────────────────────────────────
export const PERM_POSTS_READ = 1n << 0n // 1
export const PERM_POSTS_WRITE = 1n << 1n // 2
export const PERM_POSTS_UPDATE = 1n << 2n // 4
export const PERM_POSTS_DELETE = 1n << 3n // 8

// ── Categories ─────────────────────────────────
export const PERM_CATS_READ = 1n << 4n // 16
export const PERM_CATS_WRITE = 1n << 5n // 32
export const PERM_CATS_UPDATE = 1n << 6n // 64
export const PERM_CATS_DELETE = 1n << 7n // 128

// ── Tags ───────────────────────────────────────
export const PERM_TAGS_READ = 1n << 8n // 256
export const PERM_TAGS_WRITE = 1n << 9n // 512
export const PERM_TAGS_UPDATE = 1n << 10n // 1024
export const PERM_TAGS_DELETE = 1n << 11n // 2048

// ── Users ──────────────────────────────────────
export const PERM_USERS_READ = 1n << 12n // 4096
export const PERM_USERS_WRITE = 1n << 13n // 8192
export const PERM_USERS_UPDATE = 1n << 14n // 16384
export const PERM_USERS_DELETE = 1n << 15n // 32768

// ── System ─────────────────────────────────────
export const PERM_AUDIT_READ = 1n << 16n // 65536
export const PERM_SETTINGS_READ = 1n << 17n // 131072
export const PERM_SETTINGS_WRITE = 1n << 18n // 262144

// ── Composites ─────────────────────────────────
export const PERM_ADMIN =
  PERM_POSTS_READ |
  PERM_POSTS_WRITE |
  PERM_POSTS_UPDATE |
  PERM_POSTS_DELETE |
  PERM_CATS_READ |
  PERM_CATS_WRITE |
  PERM_CATS_UPDATE |
  PERM_CATS_DELETE |
  PERM_TAGS_READ |
  PERM_TAGS_WRITE |
  PERM_TAGS_UPDATE |
  PERM_TAGS_DELETE |
  PERM_USERS_READ |
  PERM_USERS_WRITE |
  PERM_USERS_UPDATE |
  PERM_USERS_DELETE |
  PERM_AUDIT_READ |
  PERM_SETTINGS_READ |
  PERM_SETTINGS_WRITE

// All bits set (super admin / future-proof)
export const PERM_SUPER_ADMIN = 0xffffffffffffffffn

// ── Helpers ────────────────────────────────────
/**
 * Returns true if userPermissions contains ALL bits of requiredPermission
 */
export function hasPermission(userPermissions: bigint | string | number, requiredPermission: bigint): boolean {
  const perms = BigInt(userPermissions ?? 0n)
  return (perms & requiredPermission) === requiredPermission
}

/**
 * Returns true if userPermissions contains ANY of the listed permissions
 */
export function hasAnyPermission(userPermissions: bigint | string | number, requiredPermissions: bigint[]): boolean {
  const perms = BigInt(userPermissions ?? 0n)
  return requiredPermissions.some((perm) => (perms & perm) === perm)
}
