import { Controller, Get, Res, VERSION_NEUTRAL } from '@nestjs/common'
import type { FastifyReply } from 'fastify'
import '@fastify/view'
import { viteAssets } from '~/shared/vite/vite.helper'
import { ViteService } from '~/shared/vite/vite.service'

@Controller({
  path: 'cms',
  version: VERSION_NEUTRAL,
})
export class CmsController {
  constructor(private readonly viteService: ViteService) {}

  // Catch-all: mọi route /cms/* đều trả về React shell
  // React Router xử lý routing phía client
  @Get()
  serveAppRoot(@Res() res: FastifyReply) {
    return this.serveApp(res)
  }

  @Get('*')
  async serveApp(@Res() res: FastifyReply) {
    try {
      const assets = viteAssets(this.viteService, 'src/app.tsx')

      return await res.view('cms/app', {
        title: 'Quản trị',
        viteAssets: assets,
      })
    } catch (error) {
      console.error('Error serving CMS app:', error)
      res.status(500).send(`Internal Server Error: ${error.message}`)
    }
  }
}
