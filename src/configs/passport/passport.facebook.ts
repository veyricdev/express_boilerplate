import type { PassportStatic } from 'passport'
import { Strategy } from 'passport-facebook'
import { env } from '../env'

export const passportFacebook = (passport: PassportStatic) => {
  passport.use(
    new Strategy(
      {
        clientID: env.FACEBOOK_APP_ID,
        clientSecret: env.FACEBOOK_APP_SECRET,
        callbackURL: `${env.APP_URL}/auth/facebook/callback`,
        profileFields: ['id', 'displayName', 'emails', 'photos'],
      },
      (_accessToken, _refreshToken, profile, done) => {
        const user = {
          id: profile.id,
          provider: 'facebook',
          giveName: profile.displayName,
          email: profile.emails?.[0]?.value,
          avatar: profile.photos?.[0]?.value,
        }

        // check user in db
        return done(null, user)
      }
    )
  )
}
