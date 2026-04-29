import slugifyLib from 'slugify'

/**
 * Convert a string to a URL-friendly slug
 * Handles Vietnamese characters and special characters using the slugify library
 */
export function slugify(text: string): string {
  if (!text) return ''

  return slugifyLib(text, {
    replacement: '-', // replace spaces with replacement character, defaults to `-`
    remove: undefined, // remove characters that match regex, defaults to `undefined`
    lower: true, // convert to lower case, defaults to `false`
    strict: true, // strip special characters except replacement, defaults to `false`
    locale: 'vi', // language code of the locale to use
    trim: true, // trim leading and trailing replacement chars, defaults to `true`
  })
}
