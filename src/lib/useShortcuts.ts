import { useEffect } from 'react'
import { redo, undo, useEditor } from '../store/editor'

function isEditingField(t: EventTarget | null): boolean {
  const el = t as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    el.isContentEditable
  )
}

export function useShortcuts() {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey
      const editing = isEditingField(e.target)

      // Undo / redo
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }
      if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
        return
      }

      if (editing) return
      const { selectedId, doc, duplicateNode, deleteNode, select } = useEditor.getState()

      // Duplicate
      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        if (selectedId && selectedId !== doc.id) duplicateNode(selectedId)
        return
      }
      // Delete
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedId) {
        e.preventDefault()
        if (selectedId !== doc.id) deleteNode(selectedId)
        return
      }
      // Deselect
      if (e.key === 'Escape') {
        select(null)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
