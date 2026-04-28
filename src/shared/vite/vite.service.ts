import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class ViteService {
  private manifest: Record<string, any> | null = null
  readonly isDev = process.env.NODE_ENV !== 'production'

  // Đọc manifest.json (chỉ đọc 1 lần)
  private getManifest() {
    if (!this.manifest) {
      const manifestPath = path.join(process.cwd(), 'public/build/.vite/manifest.json')
      this.manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
    }
    return this.manifest
  }

  // Tương đương @vite() trong Laravel
  vite(entry: string): { scripts: string[]; styles: string[] } {
    if (this.isDev) {
      return {
        scripts: ['http://localhost:5173/@vite/client', `http://localhost:5173/${entry}`],
        styles: [],
      }
    }

    const manifest = this.getManifest()
    if (!manifest) {
      return { scripts: [], styles: [] }
    }
    const chunk = manifest[entry]

    return {
      scripts: chunk ? [`/build/${chunk.file}`] : [],
      styles: (chunk?.css ?? []).map((f: string) => `/build/${f}`),
    }
  }
}
