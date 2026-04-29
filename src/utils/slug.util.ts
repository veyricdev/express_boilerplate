/**
 * Convert a string to a URL-friendly slug
 * Handles Vietnamese characters and special characters
 */
export function slugify(text: string): string {
  if (!text) return ''

  let slug = text.toLowerCase()

  // Remove Vietnamese accents
  slug = slug.replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a')
  slug = slug.replace(/[éèẻẽẹêếềểễệ]/g, 'e')
  slug = slug.replace(/[íìỉĩị]/g, 'i')
  slug = slug.replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o')
  slug = slug.replace(/[úùủũụưứừửữự]/g, 'u')
  slug = slug.replace(/[ýỳỷỹỵ]/g, 'y')
  slug = slug.replace(/đ/g, 'd')

  // Remove special characters
  slug = slug.replace(/([^0-9a-z-\s])/g, '')

  // Replace spaces and underscores with hyphens
  slug = slug.replace(/[\s_]+/g, '-')

  // Remove leading and trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '')

  // Remove duplicate hyphens
  slug = slug.replace(/-+/g, '-')

  return slug
}
