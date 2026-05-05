import { CKEditor } from '@ckeditor/ckeditor5-react'

import { ClassicEditor } from './config'

import 'ckeditor5/ckeditor5.css'
import './styles.css'

export default function CkEditor({
  value,
  onChange,
  pending,
  placeholder,
}: {
  value?: string
  placeholder?: string
  onChange: (...event: any[]) => void
  pending: boolean
}) {
  return (
    <CKEditor
      config={{ placeholder }}
      editor={ClassicEditor}
      data={value}
      disabled={pending}
      onChange={(_event, editor) => {
        onChange(editor.getData())
      }}
    />
  )
}
