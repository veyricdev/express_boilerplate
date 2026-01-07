import type { PassportStatic } from 'passport'
import { Strategy } from 'passport-github2'
import type { VerifyCallback } from 'passport-oauth2'
import { env } from '../env'

export const passportGithub = (passport: PassportStatic) => {
  passport.use(
    new Strategy(
      {
        clientID: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackURL: `${env.APP_URL}/auth/github/callback`,
        scope: ['user:email'],
      },
      (_accessToken: string, _refreshToken: string, profile: Recordable, done: VerifyCallback) => {
        const user = {
          id: profile.id,
          provider: 'github',
          giveName: profile.displayName || profile.username,
          email: profile.emails?.[0]?.value,
          avatar: profile.photos?.[0]?.value,
        }

        // check user in db
        return done(null, user)
      }
    )
  )
}
