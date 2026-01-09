import type { PassportStatic } from 'passport'
import { Strategy } from 'passport-google-oauth20'
import { env } from '../env'

export const passportGoogle = (passport: PassportStatic) => {
  passport.use(
    new Strategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${env.APP_URL}/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      (_accessToken, _refreshToken, profile, done) => {
        const user = {
          id: profile.id,
          provider: 'google',
          giveName: profile.displayName,
          email: profile?.emails?.[0].value,
          avatar: profile.photos?.[0].value,
        }

        // check user in db
        return done(null, user)
      }
    )
  )
}
