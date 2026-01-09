import type { PassportStatic } from 'passport'
import { passportFacebook } from './passport.facebook'
import { passportGithub } from './passport.github'
import { passportGoogle } from './passport.google'

export default function setupPassport(passport: PassportStatic) {
  /**
   * Sign in using Username/Email and Password.
   */
  // passportJwt(passport)

  passportGoogle(passport)
  passportGithub(passport)
  passportFacebook(passport)
}
