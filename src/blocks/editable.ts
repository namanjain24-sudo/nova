import type { Node } from '../core/schema'
import { useEditor } from '../store/editor'

/** Props that make an element inline-editable in the canvas (edit mode only). */
export function editableText(node: Node, editMode: boolean, field = 'text') {
  if (!editMode) return {}
  return {
    contentEditable: true,
    suppressContentEditableWarning: true,
    spellCheck: false,
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      const value = e.currentTarget.textContent ?? ''
      if (value !== node.props[field]) {
        useEditor.getState().updateProps(node.id, { [field]: value })
      }
    },
    // Stop the canvas from swallowing key events / clearing selection while typing.
    onKeyDown: (e: React.KeyboardEvent) => {
      e.stopPropagation()
    },
  }
}
