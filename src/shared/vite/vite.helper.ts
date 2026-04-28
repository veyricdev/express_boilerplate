import { ViteService } from './vite.service'

export function viteAssets(viteService: ViteService, entry: string): string {
  const { scripts, styles } = viteService.vite(entry)

  const styleTags = styles.map((href) => `<link rel="stylesheet" href="${href}">`).join('\n')

  let reactRefreshPreamble = ''
  if (viteService.isDev) {
    reactRefreshPreamble = `
      <script type="module">
        import RefreshRuntime from "http://localhost:5173/@react-refresh"
        RefreshRuntime.injectIntoGlobalHook(window)
        window.$RefreshReg$ = () => {}
        window.$RefreshSig$ = () => (type) => type
        window.__vite_plugin_react_preamble_installed__ = true
      </script>
    `
  }

  const scriptTags = scripts.map((src) => `<script type="module" src="${src}"></script>`).join('\n')

  return `${reactRefreshPreamble}\n${styleTags}\n${scriptTags}`
}
