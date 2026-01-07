import bcrypt from 'bcryptjs'

const SALT_PASSWORD = bcrypt.genSaltSync(10)

export const hashPassword = (password: string) => bcrypt.hashSync(password, SALT_PASSWORD)

export const isValidPassword = (input: string, hash: string) => bcrypt.compareSync(input, hash)

export const cacheRefreshTokenKey = (key: string) => `refresh_token:${key}`
export const cacheBlacklistKey = (key: string) => `blacklist:access:${key}`
