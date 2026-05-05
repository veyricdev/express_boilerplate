// biome-ignore assist/source/organizeImports: <explanation>
import { ButtonView, Image, Plugin, IconImageAssetManager } from 'ckeditor5'

export default class FlmAdapter extends Plugin {
  /**
   * @inheritDoc
   */
  static get requires() {
    return [Image] as const
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return 'Flm' as const
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor

    // Add UI button
    const componentFactory = this.editor.ui.componentFactory

    componentFactory.add('flm', (locale) => {
      const button = new ButtonView(locale)

      button.set({
        label: 'Upload image or file',
        icon: IconImageAssetManager,
        // withText: true,
        tooltip: true,
      })

      button.on('execute', async () => {
        const imageUrl = await openFileManager()

        if (imageUrl) {
          editor.model.change((writer) => {
            const imageElement = writer.createElement('imageBlock', {
              src: imageUrl,
            })
            editor.model.insertContent(imageElement, editor.model.document.selection)
          })
        }
      })

      return button
    })
  }
}

function openFileManager(): Promise<string> {
  return new Promise((resolve) => {
    window.open('/file-manager', 'FileManager', 'width=1000,height=600')
    ;(window as any).SetUrl = (url: string) => {
      resolve(url)
    }
  })
}
