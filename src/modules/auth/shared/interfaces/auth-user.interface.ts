export interface IAuthUser {
  id: number
  email: string
  permissions: string // BigInt stored as string in JWT
  isOwner: boolean
  refreshToken?: string
}
