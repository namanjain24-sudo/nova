import { create } from 'zustand'
import type { Node } from '../core/schema'
import { getBlock } from '../core/schema'
import { useEditor } from '../store/editor'

/** What is currently being dragged. */
export type DragSource =
  | { kind: 'new'; type: string } // a fresh block from the palette
  | { kind: 'move'; id: string } // an existing node being relocated

export interface DropTarget {
  parentId: string
  index: number
}

/** A drawable insertion indicator, in page-container-relative coords. */
export interface DropIndicator {
  top: number
  left: number
  width: number
  height: number
  /** true → highlight a whole (empty) container instead of a thin line */
  block?: boolean
}

interface DragStore {
  source: DragSource | null
  target: DropTarget | null
  indicator: DropIndicator | null
  /** The live page element used for hit-testing (set by Canvas). */
  pageEl: HTMLElement | null

  setPageEl: (el: HTMLElement | null) => void
  begin: (source: DragSource) => void
  move: (pointer: { x: number; y: number }) => void
  end: () => void
}

export const useDrag = create<DragStore>((set, get) => ({
  source: null,
  target: null,
  indicator: null,
  pageEl: null,

  setPageEl: (el) => set({ pageEl: el }),

  begin: (source) => set({ source, target: null, indicator: null }),

  move: (pointer) => {
    const { source, pageEl } = get()
    if (!source || !pageEl) return
    const excludeId = source.kind === 'move' ? source.id : undefined
    const result = computeDropTarget(pageEl, pointer, excludeId)
    set({ target: result?.target ?? null, indicator: result?.indicator ?? null })
  },

  end: () => {
    const { source, target } = get()
    set({ source: null, target: null, indicator: null })
    if (!source || !target) return
    const ed = useEditor.getState()
    if (source.kind === 'new') {
      ed.addBlock(source.type, target.parentId, target.index)
    } else {
      commitMove(source.id, target)
    }
  },
}))

if ((import.meta as any).env?.DEV) (window as any).__novaDrag = useDrag

/** Move honoring index shift when relocating within the same parent. */
function commitMove(id: string, target: DropTarget) {
  const ed = useEditor.getState()
  const parent = findNodeById(ed.doc, target.parentId)
  if (!parent) return
  let index = target.index
  const currentIdx = parent.children?.findIndex((c) => c.id === id) ?? -1
  // Removing the node first shifts everything after it left by one.
  if (currentIdx !== -1 && currentIdx < index) index -= 1
  ed.moveNode(id, target.parentId, index)
}

/* ------------------------------------------------------------------ */
/*  Hit-testing — decide where a drop would land                       */
/* ------------------------------------------------------------------ */

interface Hit {
  target: DropTarget
  indicator: DropIndicator
}

function computeDropTarget(
  pageEl: HTMLElement,
  pointer: { x: number; y: number },
  excludeId?: string,
): Hit | null {
  const doc = useEditor.getState().doc
  const pageRect = pageEl.getBoundingClientRect()
  const px = pointer.x
  const py = pointer.y

  // Descendants of the dragged node are invalid drop parents.
  const excluded = new Set<string>()
  if (excludeId) {
    const node = findNodeById(doc, excludeId)
    if (node) collectIds(node, excluded)
  }

  // Build a lookup of every rendered node's rect.
  const els = Array.from(pageEl.querySelectorAll<HTMLElement>('[data-node-id]'))
  const rectById = new Map<string, DOMRect>()
  for (const el of els) {
    const id = el.getAttribute('data-node-id')!
    rectById.set(id, el.getBoundingClientRect())
  }
  // The page root element itself carries a data-node-id too.
  if (!rectById.has(doc.id)) rectById.set(doc.id, pageRect)

  // Find the deepest container node whose rect contains the pointer.
  let parent: Node | null = null
  let parentArea = Infinity
  const visit = (n: Node) => {
    const def = getBlock(n.type)
    const isContainer = def?.isContainer && n.id !== excludeId && !excluded.has(n.id)
    const r = rectById.get(n.id)
    if (isContainer && r && px >= r.left && px <= r.right && py >= r.top && py <= r.bottom) {
      const area = r.width * r.height
      if (area <= parentArea) {
        parent = n
        parentArea = area
      }
    }
    n.children?.forEach(visit)
  }
  visit(doc)

  if (!parent) return null
  const parentNode: Node = parent
  const parentRect = rectById.get(parentNode.id) ?? pageRect

  const kids = (parentNode.children ?? []).filter((c) => c.id !== excludeId)

  // Empty container → highlight the whole region, insert at 0.
  if (kids.length === 0) {
    return {
      target: { parentId: parentNode.id, index: 0 },
      indicator: {
        top: parentRect.top - pageRect.top + 4,
        left: parentRect.left - pageRect.left + 4,
        width: parentRect.width - 8,
        height: parentRect.height - 8,
        block: true,
      },
    }
  }

  const horizontal = isHorizontal(parentNode.id, pageEl)

  // Find insertion index by comparing the pointer to each child's midpoint.
  let index = kids.length
  for (let i = 0; i < kids.length; i++) {
    const r = rectById.get(kids[i].id)
    if (!r) continue
    const mid = horizontal ? (r.left + r.right) / 2 : (r.top + r.bottom) / 2
    const p = horizontal ? px : py
    if (p < mid) {
      index = i
      break
    }
  }

  // Build the thin insertion line at the chosen boundary.
  const THICK = 3
  const pad = 2
  let indicator: DropIndicator
  if (horizontal) {
    const x = boundaryCoord(kids, index, rectById, pageRect, true)
    indicator = {
      top: parentRect.top - pageRect.top + pad,
      left: x - THICK / 2,
      width: THICK,
      height: parentRect.height - pad * 2,
    }
  } else {
    const y = boundaryCoord(kids, index, rectById, pageRect, false)
    indicator = {
      top: y - THICK / 2,
      left: parentRect.left - pageRect.left + pad,
      width: parentRect.width - pad * 2,
      height: THICK,
    }
  }

  // Map filtered index back to the real children index in the parent.
  const realIndex = realInsertIndex(parentNode, kids, index, excludeId)
  return { target: { parentId: parentNode.id, index: realIndex }, indicator }
}

/** Pixel position (page-relative) of the boundary before child `index`. */
function boundaryCoord(
  kids: Node[],
  index: number,
  rectById: Map<string, DOMRect>,
  pageRect: DOMRect,
  horizontal: boolean,
): number {
  const off = horizontal ? pageRect.left : pageRect.top
  if (index <= 0) {
    const r = rectById.get(kids[0].id)!
    return (horizontal ? r.left : r.top) - off - 4
  }
  if (index >= kids.length) {
    const r = rectById.get(kids[kids.length - 1].id)!
    return (horizontal ? r.right : r.bottom) - off + 4
  }
  const before = rectById.get(kids[index - 1].id)!
  const after = rectById.get(kids[index].id)!
  const a = (horizontal ? before.right : before.bottom) - off
  const b = (horizontal ? after.left : after.top) - off
  return (a + b) / 2
}

/** Translate an index within the excludeId-filtered list to the real list. */
function realInsertIndex(
  parent: Node,
  kids: Node[],
  filteredIndex: number,
  excludeId?: string,
): number {
  if (!excludeId) return filteredIndex
  const all = parent.children ?? []
  if (filteredIndex >= kids.length) return all.length
  const targetId = kids[filteredIndex].id
  return all.findIndex((c) => c.id === targetId)
}

function isHorizontal(nodeId: string, pageEl: HTMLElement): boolean {
  const el = pageEl.querySelector<HTMLElement>(`[data-node-id="${nodeId}"]`)
  if (!el) return false
  const cs = getComputedStyle(el)
  if (cs.display === 'grid') {
    const cols = cs.gridTemplateColumns.split(' ').filter(Boolean).length
    return cols > 1
  }
  if (cs.display.includes('flex')) return cs.flexDirection.startsWith('row')
  return false
}

/* ---- small tree helpers (kept local to avoid import cycles) ---- */
function findNodeById(root: Node, id: string): Node | null {
  if (root.id === id) return root
  for (const c of root.children ?? []) {
    const f = findNodeById(c, id)
    if (f) return f
  }
  return null
}
function collectIds(node: Node, into: Set<string>) {
  into.add(node.id)
  node.children?.forEach((c) => collectIds(c, into))
}
