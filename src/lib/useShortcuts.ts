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
      const st = useEditor.getState()
      const { selectedId, doc, duplicateNode, deleteNode, select } = st

      // Duplicate
      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        if (selectedId && selectedId !== doc.id) duplicateNode(selectedId)
        return
      }
      // Copy / Cut / Paste blocks (works across pages)
      if (mod && e.key.toLowerCase() === 'c') {
        if (selectedId && selectedId !== doc.id) { e.preventDefault(); st.copyNode(selectedId) }
        return
      }
      if (mod && e.key.toLowerCase() === 'x') {
        if (selectedId && selectedId !== doc.id) { e.preventDefault(); st.cutNode(selectedId) }
        return
      }
      if (mod && e.key.toLowerCase() === 'v') {
        if (st.clipboard) { e.preventDefault(); st.pasteNode() }
        return
      }
      // Reorder among siblings with Alt + Arrow
      if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        if (selectedId && selectedId !== doc.id) {
          e.preventDefault()
          st.moveNodeBy(selectedId, e.key === 'ArrowUp' ? -1 : 1)
        }
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
