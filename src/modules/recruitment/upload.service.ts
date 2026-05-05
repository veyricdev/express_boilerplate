import { randomUUID } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { extname, join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import type { MultipartFile } from '@fastify/multipart'
import { BadRequestException, Injectable } from '@nestjs/common'

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

@Injectable()
export class UploadService {
  async saveCV(file: MultipartFile): Promise<string> {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF and Word documents are allowed')
    }

    const ext = extname(file.filename) || '.pdf'
    const filename = `${randomUUID()}${ext}`
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'cvs')
    const fullPath = join(uploadDir, filename)

    await pipeline(file.file, createWriteStream(fullPath))

    // Check final size
    const { size } = await import('node:fs/promises').then((m) => m.stat(fullPath))
    if (size > MAX_SIZE) {
      await import('node:fs/promises').then((m) => m.unlink(fullPath))
      throw new BadRequestException('File size exceeds 5MB limit')
    }

    return `/uploads/cvs/${filename}`
  }
}
