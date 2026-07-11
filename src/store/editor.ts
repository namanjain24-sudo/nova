import { create } from 'zustand'
import { temporal } from 'zundo'
import type { Device, Node, NodeStyle } from '../core/schema'
import { cloneNode, getBlock, makeNode } from '../core/schema'
import {
  findParent,
  insertNode as insert,
  moveNode as move,
  pathTo,
  removeNode,
  updateNode,
} from '../lib/tree'

const STORAGE_KEY = 'nova:doc:v1'

function emptyPage(): Node {
  return makeNode(
    'page',
    { name: 'Untitled Page' },
    { minHeight: '100%', backgroundColor: '#ffffff' },
    [],
  )
}

function loadDoc(): Node {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Node
  } catch {
    /* ignore corrupt storage */
  }
  return emptyPage()
}

export interface EditorState {
  doc: Node
  selectedId: string | null
  hoveredId: string | null
  device: Device
  previewMode: boolean

  // selection / view
  select: (id: string | null) => void
  hover: (id: string | null) => void
  setDevice: (d: Device) => void
  togglePreview: () => void

  // mutations
  addBlock: (type: string, parentId?: string, index?: number) => void
  insertNode: (node: Node, parentId: string, index?: number) => void
  updateProps: (id: string, props: Record<string, any>) => void
  updateStyle: (id: string, style: NodeStyle, device?: Device) => void
  deleteNode: (id: string) => void
  duplicateNode: (id: string) => string | null
  moveNode: (id: string, parentId: string, index: number) => void
  setDoc: (doc: Node) => void
  clearPage: () => void
}

export const useEditor = create<EditorState>()(
  temporal(
    (set, get) => ({
      doc: loadDoc(),
      selectedId: null,
      hoveredId: null,
      device: 'desktop',
      previewMode: false,

      select: (id) => set({ selectedId: id }),
      hover: (id) => set({ hoveredId: id }),
      setDevice: (d) => set({ device: d }),
      togglePreview: () =>
        set((s) => ({ previewMode: !s.previewMode, selectedId: null })),

      addBlock: (type, parentId, index) => {
        const def = getBlock(type)
        if (!def) return
        const node = def.create()
        // Explicit target (from drag-drop) is always respected.
        if (parentId) {
          set((s) => ({ doc: insert(s.doc, parentId, node, index), selectedId: node.id }))
          return
        }
        // Click-to-add: full-width sections are always page-level bands,
        // inserted after the currently selected section (never nested).
        if (def.category === 'section') {
          const s = get()
          const anchor = topLevelAncestor(s.doc, s.selectedId)
          const at =
            anchor != null
              ? (s.doc.children?.findIndex((c) => c.id === anchor) ?? -1) + 1
              : undefined
          set((st) => ({ doc: insert(st.doc, st.doc.id, node, at), selectedId: node.id }))
          return
        }
        // Other blocks drop into the selected container (or its parent).
        const targetParent = resolveDropParent(get(), undefined)
        set((s) => ({ doc: insert(s.doc, targetParent, node, index), selectedId: node.id }))
      },

      insertNode: (node, parentId, index) =>
        set((s) => ({
          doc: insert(s.doc, parentId, node, index),
          selectedId: node.id,
        })),

      updateProps: (id, props) =>
        set((s) => ({
          doc: updateNode(s.doc, id, (n) => ({ ...n, props: { ...n.props, ...props } })),
        })),

      updateStyle: (id, style, device) =>
        set((s) => ({
          doc: updateNode(s.doc, id, (n) => {
            const dev = device ?? s.device
            if (dev === 'desktop') {
              return { ...n, style: { ...n.style, ...style } }
            }
            const responsive = { ...(n.responsive ?? {}) }
            responsive[dev] = { ...(responsive[dev] ?? {}), ...style }
            return { ...n, responsive }
          }),
        })),

      deleteNode: (id) =>
        set((s) => ({
          doc: removeNode(s.doc, id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      duplicateNode: (id) => {
        const parent = findParent(get().doc, id)
        if (!parent || !parent.children) return null
        const idx = parent.children.findIndex((c) => c.id === id)
        const original = parent.children[idx]
        const copy = cloneNode(original)
        set((s) => ({
          doc: insert(s.doc, parent.id, copy, idx + 1),
          selectedId: copy.id,
        }))
        return copy.id
      },

      moveNode: (id, parentId, index) =>
        set((s) => ({ doc: move(s.doc, id, parentId, index) })),

      setDoc: (doc) => set({ doc, selectedId: null }),
      clearPage: () => set({ doc: emptyPage(), selectedId: null }),
    }),
    {
      // Only the document participates in undo/redo history.
      partialize: (state) => ({ doc: state.doc }),
      limit: 80,
      // Group rapid successive edits (e.g. typing) into fewer history steps.
      handleSet: (handleSet) => {
        let t: ReturnType<typeof setTimeout> | undefined
        return (state) => {
          if (t) clearTimeout(t)
          t = setTimeout(() => handleSet(state), 260)
        }
      },
    },
  ),
)

/** Decide which container a new block should drop into. */
function resolveDropParent(state: EditorState, parentId?: string): string {
  if (parentId) return parentId
  // If a container is selected, drop inside it; else drop at page root.
  const sel = state.selectedId
  if (sel) {
    const def = sel === state.doc.id ? getBlock('page') : findDef(state.doc, sel)
    if (def?.isContainer) return sel
    // otherwise drop as sibling's parent
    const parent = findParent(state.doc, sel)
    if (parent) return parent.id
  }
  return state.doc.id
}

/** The direct child of the page root that contains `id` (or null). */
function topLevelAncestor(root: Node, id: string | null): string | null {
  if (!id || id === root.id) return null
  const path = pathTo(root, id)
  // path is [root, ...ancestors]; the top-level band is index 1's node.
  if (path && path.length >= 1) {
    // pathTo returns ancestor ids from root down to (excluding) the node.
    const rootIdx = path.indexOf(root.id)
    const topId = path[rootIdx + 1]
    if (topId) return topId
  }
  // selection itself may be a direct child of root
  if (root.children?.some((c) => c.id === id)) return id
  return null
}

function findDef(root: Node, id: string) {
  const stack = [root]
  while (stack.length) {
    const n = stack.pop()!
    if (n.id === id) return getBlock(n.type)
    if (n.children) stack.push(...n.children)
  }
  return undefined
}

/* ---- autosave: persist doc to localStorage (debounced) ---- */
let saveTimer: ReturnType<typeof setTimeout> | undefined
useEditor.subscribe((state) => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.doc))
    } catch {
      /* storage full / unavailable */
    }
  }, 400)
})

/* ---- undo / redo helpers ---- */
export const undo = () => useEditor.temporal.getState().undo()
export const redo = () => useEditor.temporal.getState().redo()
export const useTemporal = useEditor.temporal
