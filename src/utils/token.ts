import { type CryptoKey, type JWK, type JWTPayload, jwtVerify, type KeyObject, SignJWT } from 'jose'
import { v7 as uuidv7 } from 'uuid'
import { jwtSecret } from '~/configs/jwt'

export const signJWT = (
  payload: JWTPayload,
  secret: CryptoKey | KeyObject | JWK | Uint8Array,
  expirationTime: number | string | Date = '15m',
  alg: string = 'HS256'
) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setJti(uuidv7())
    .setIssuedAt()
    .setExpirationTime(expirationTime)
    .sign(secret)

export const createAccessToken = async (userId: Key) => {
  return await signJWT({ userId }, jwtSecret.access)
}

export const createRefreshToken = async (tokenId: string) => {
  return await signJWT({ tokenId }, jwtSecret.refresh, '7d')
}

export const generateTokens = (userId: Key, tokenId: string) =>
  Promise.all([createAccessToken(userId), createRefreshToken(tokenId)])

export const verifyRefreshToken = async (token: string) => {
  const { payload } = await jwtVerify(token, jwtSecret.refresh)
  return payload as { tokenId: string }
}
