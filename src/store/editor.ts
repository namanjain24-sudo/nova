import { create } from 'zustand'
import { temporal } from 'zundo'
import { nanoid } from 'nanoid'
import type { Device, Node, NodeStyle } from '../core/schema'
import { cloneNode, getBlock, makeNode } from '../core/schema'
import { applyTheme, type Theme } from '../theme/engine'
import type { CustomFont } from '../theme/fonts'
import {
  findNode,
  findParent,
  insertNode as insert,
  moveNode as move,
  pathTo,
  removeNode,
  updateNode,
} from '../lib/tree'

/** A reusable component: one master tree that many instances render + stay in sync with. */
export interface SavedComponent {
  id: string
  name: string
  root: Node
}

/** One CMS entry. Content lives here; a Collection list block renders it as cards. */
export interface CollectionItem {
  id: string
  title: string
  subtitle: string
  tag: string
  image: string
  url: string
  body: string
}

/** A CMS collection: many items sharing one shape, rendered by one design. */
export interface Collection {
  id: string
  name: string
  items: CollectionItem[]
}

export function emptyItem(): CollectionItem {
  return { id: nanoid(6), title: '', subtitle: '', tag: '', image: '', url: '', body: '' }
}

const SITE_KEY = 'nova:site:v1'
const LEGACY_DOC_KEY = 'nova:doc:v1'

/** One page within a multi-page site. */
export interface Page {
  id: string
  name: string
  path: string
  root: Node
}

interface Site {
  pages: Page[]
  activePageId: string
  /** User-uploaded fonts, embedded and shared across every page. */
  fonts?: CustomFont[]
  /** Reusable components (masters), keyed by id. */
  components?: Record<string, SavedComponent>
  /** CMS collections. */
  collections?: Collection[]
}

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'page'
  )
}

/** Read the shared Header/Footer symbol ids off the active page (if it uses them). */
function siteChromeIds(pages: Page[], activePageId: string): { headerId?: string; footerId?: string } {
  const active = pages.find((p) => p.id === activePageId) ?? pages[0]
  const kids = active?.root.children ?? []
  const first = kids[0]
  const last = kids[kids.length - 1]
  const instId = (n?: Node) => (n && n.type === 'instance' && n.props?.componentId ? (n.props.componentId as string) : undefined)
  return { headerId: instId(first), footerId: last !== first ? instId(last) : undefined }
}

function emptyPage(): Node {
  return makeNode(
    'page',
    { name: 'Untitled Page' },
    { minHeight: '100%', backgroundColor: '#ffffff' },
    [],
  )
}

function makePage(name: string, root?: Node): Page {
  return { id: nanoid(6), name, path: slugify(name), root: root ?? emptyPage() }
}

function loadSite(): Site {
  try {
    const raw = localStorage.getItem(SITE_KEY)
    if (raw) {
      const s = JSON.parse(raw) as Site
      if (s.pages?.length) return s
    }
  } catch {
    /* ignore corrupt storage */
  }
  // Migrate a legacy single-page document, if present.
  try {
    const old = localStorage.getItem(LEGACY_DOC_KEY)
    if (old) {
      const root = JSON.parse(old) as Node
      const pg = makePage('Home', root)
      pg.path = '/'
      return { pages: [pg], activePageId: pg.id }
    }
  } catch {
    /* ignore */
  }
  const pg = makePage('Home')
  pg.path = '/'
  return { pages: [pg], activePageId: pg.id }
}

/** Fold the live `doc` back into the active page (pages array is the source of truth).
 *  While editing a component master, `doc` is that master — so we leave pages untouched. */
function syncActive(s: {
  pages: Page[]
  activePageId: string
  doc: Node
  editingComponentId?: string | null
}): Page[] {
  if (s.editingComponentId) return s.pages
  return s.pages.map((p) => (p.id === s.activePageId ? { ...p, root: s.doc } : p))
}

export interface EditorState {
  doc: Node
  pages: Page[]
  activePageId: string
  fonts: CustomFont[]
  components: Record<string, SavedComponent>
  /** When set, `doc` is that component's master and we're editing it in isolation. */
  editingComponentId: string | null
  collections: Collection[]
  /** A copied/cut block subtree, ready to paste (persists across page switches). */
  clipboard: Node | null
  selectedId: string | null
  hoveredId: string | null
  device: Device
  previewMode: boolean
  templatesOpen: boolean
  cmsOpen: boolean
  commandOpen: boolean
  sectionsOpen: boolean

  // selection / view
  select: (id: string | null) => void
  hover: (id: string | null) => void
  setDevice: (d: Device) => void
  togglePreview: () => void
  setTemplatesOpen: (open: boolean) => void
  setCommandOpen: (open: boolean) => void
  setSectionsOpen: (open: boolean) => void
  /** Insert a pre-built section at page level (after the current top-level selection). */
  insertSectionTree: (node: Node) => void

  // pages
  addPage: (name?: string) => void
  applySite: (
    pages: { name: string; path: string; root: Node }[],
    components?: Record<string, SavedComponent>,
  ) => void
  switchPage: (id: string) => void
  renamePage: (id: string, name: string) => void
  deletePage: (id: string) => void
  duplicatePage: (id: string) => void

  // mutations
  addBlock: (type: string, parentId?: string, index?: number) => void
  insertNode: (node: Node, parentId: string, index?: number) => void
  updateProps: (id: string, props: Record<string, any>) => void
  updateStyle: (id: string, style: NodeStyle, device?: Device) => void
  deleteNode: (id: string) => void
  duplicateNode: (id: string) => string | null
  moveNode: (id: string, parentId: string, index: number) => void
  /** Reorder a node among its siblings (dir -1 = up, +1 = down). */
  moveNodeBy: (id: string, dir: -1 | 1) => void
  copyNode: (id: string) => void
  cutNode: (id: string) => void
  pasteNode: () => void
  setDoc: (doc: Node) => void
  clearPage: () => void
  setTheme: (next: Partial<Theme>) => void
  addFont: (font: CustomFont) => void
  removeFont: (id: string) => void
  renameFont: (id: string, name: string) => void
  // reusable components
  saveAsComponent: (nodeId: string, name: string) => void
  insertComponent: (componentId: string, parentId?: string, index?: number) => void
  enterComponent: (componentId: string) => void
  exitComponent: () => void
  deleteComponent: (componentId: string) => void
  renameComponent: (componentId: string, name: string) => void
  // CMS collections
  setCmsOpen: (open: boolean) => void
  addCollection: (name: string) => string
  renameCollection: (id: string, name: string) => void
  deleteCollection: (id: string) => void
  addItem: (collectionId: string) => void
  updateItem: (collectionId: string, itemId: string, patch: Partial<CollectionItem>) => void
  deleteItem: (collectionId: string, itemId: string) => void
  insertCollectionList: (collectionId: string) => void
  loadSite: (data: {
    pages: Page[]
    activePageId: string
    fonts?: CustomFont[]
    components?: Record<string, SavedComponent>
    collections?: Collection[]
  }) => void
}

const INITIAL_SITE = loadSite()

export const useEditor = create<EditorState>()(
  temporal(
    (set, get) => ({
      pages: INITIAL_SITE.pages,
      activePageId: INITIAL_SITE.activePageId,
      fonts: INITIAL_SITE.fonts ?? [],
      components: INITIAL_SITE.components ?? {},
      editingComponentId: null,
      collections: INITIAL_SITE.collections ?? [],
      clipboard: null,
      cmsOpen: false,
      doc:
        INITIAL_SITE.pages.find((p) => p.id === INITIAL_SITE.activePageId)?.root ??
        INITIAL_SITE.pages[0].root,
      selectedId: null,
      hoveredId: null,
      device: 'desktop',
      previewMode: false,
      templatesOpen: false,
      commandOpen: false,
      sectionsOpen: false,

      select: (id) => set({ selectedId: id }),
      hover: (id) => set({ hoveredId: id }),
      setDevice: (d) => set({ device: d }),
      togglePreview: () =>
        set((s) => ({ previewMode: !s.previewMode, selectedId: null })),
      setTemplatesOpen: (open) => set({ templatesOpen: open }),
      setCommandOpen: (open) => set({ commandOpen: open }),
      setSectionsOpen: (open) => set({ sectionsOpen: open }),
      insertSectionTree: (node) => {
        const s = get()
        const anchor = topLevelAncestor(s.doc, s.selectedId)
        const at =
          anchor != null ? (s.doc.children?.findIndex((c) => c.id === anchor) ?? -1) + 1 : undefined
        set((st) => ({ doc: insert(st.doc, st.doc.id, node, at), selectedId: node.id, sectionsOpen: false }))
      },

      addPage: (name) => {
        const s = get()
        const pages = syncActive(s)
        const pg = makePage(name?.trim() || `Page ${pages.length + 1}`)
        // If the site uses shared Header/Footer symbols, seed the new page with them
        // so every page stays consistent (and updates when you edit the symbol).
        const chrome = siteChromeIds(pages, s.activePageId)
        if (chrome.headerId || chrome.footerId) {
          const kids: Node[] = []
          if (chrome.headerId)
            kids.push(makeNode('instance', { componentId: chrome.headerId, name: 'Header' }, { display: 'block', width: '100%' }))
          kids.push(
            makeNode('section', {}, { width: '100%', paddingTop: '110px', paddingBottom: '110px', paddingLeft: '24px', paddingRight: '24px' }, []),
          )
          if (chrome.footerId)
            kids.push(makeNode('instance', { componentId: chrome.footerId, name: 'Footer' }, { display: 'block', width: '100%' }))
          pg.root.children = kids
        }
        set({ pages: [...pages, pg], doc: pg.root, activePageId: pg.id, selectedId: null })
      },
      applySite: (incoming, components) =>
        set(() => {
          const pages: Page[] =
            incoming.length > 0
              ? incoming.map((p) => ({ id: nanoid(6), name: p.name, path: p.path || '/', root: p.root }))
              : [makePage('Home')]
          return {
            pages,
            activePageId: pages[0].id,
            doc: pages[0].root,
            components: components ?? {},
            clipboard: null,
            selectedId: null,
            previewMode: false,
            editingComponentId: null,
          }
        }),
      switchPage: (id) => {
        const s = get()
        if (id === s.activePageId) return
        const pages = syncActive(s)
        const target = pages.find((p) => p.id === id)
        if (!target) return
        // Keep preview mode on across nav clicks so previewing feels like browsing the live site.
        set({ pages, doc: target.root, activePageId: id, selectedId: null })
      },
      renamePage: (id, name) =>
        set((s) => ({
          pages: s.pages.map((p) =>
            p.id === id ? { ...p, name: name.trim() || p.name, path: p.path === '/' ? '/' : slugify(name) } : p,
          ),
        })),
      deletePage: (id) => {
        const s = get()
        if (s.pages.length <= 1) return
        const pages = syncActive(s).filter((p) => p.id !== id)
        if (id === s.activePageId) {
          set({ pages, doc: pages[0].root, activePageId: pages[0].id, selectedId: null })
        } else {
          set({ pages })
        }
      },
      duplicatePage: (id) => {
        const s = get()
        const pages = syncActive(s)
        const src = pages.find((p) => p.id === id)
        if (!src) return
        const copy = makePage(`${src.name} copy`, cloneNode(src.root))
        const idx = pages.findIndex((p) => p.id === id)
        const next = [...pages.slice(0, idx + 1), copy, ...pages.slice(idx + 1)]
        set({ pages: next, doc: copy.root, activePageId: copy.id, selectedId: null })
      },

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

      moveNodeBy: (id, dir) => {
        const s = get()
        if (id === s.doc.id) return
        const parent = findParent(s.doc, id)
        if (!parent?.children) return
        const idx = parent.children.findIndex((c) => c.id === id)
        const to = idx + dir
        if (to < 0 || to >= parent.children.length) return
        set({ doc: move(s.doc, id, parent.id, to) })
      },

      copyNode: (id) => {
        const s = get()
        if (id === s.doc.id) return
        const node = findNode(s.doc, id)
        if (node) set({ clipboard: cloneNode(node) })
      },
      cutNode: (id) => {
        const s = get()
        if (id === s.doc.id) return
        const node = findNode(s.doc, id)
        if (!node) return
        set({
          clipboard: cloneNode(node),
          doc: removeNode(s.doc, id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })
      },
      pasteNode: () => {
        const s = get()
        if (!s.clipboard) return
        const node = cloneNode(s.clipboard) // fresh ids each paste
        const sel = s.selectedId
        // Selected container → paste inside; selected leaf → paste as next sibling; else → page end.
        if (sel && sel !== s.doc.id) {
          const selNode = findNode(s.doc, sel)
          const def = selNode ? getBlock(selNode.type) : undefined
          if (def?.isContainer) {
            set({ doc: insert(s.doc, sel, node), selectedId: node.id })
            return
          }
          const parent = findParent(s.doc, sel)
          if (parent?.children) {
            const idx = parent.children.findIndex((c) => c.id === sel)
            set({ doc: insert(s.doc, parent.id, node, idx + 1), selectedId: node.id })
            return
          }
        }
        set({ doc: insert(s.doc, s.doc.id, node), selectedId: node.id })
      },

      setDoc: (doc) =>
        set((s) => ({
          doc,
          selectedId: null,
          pages: s.pages.map((p) => (p.id === s.activePageId ? { ...p, root: doc } : p)),
        })),
      clearPage: () =>
        set((s) => {
          const doc = emptyPage()
          return {
            doc,
            selectedId: null,
            pages: s.pages.map((p) => (p.id === s.activePageId ? { ...p, root: doc } : p)),
          }
        }),
      setTheme: (next) => set((s) => ({ doc: applyTheme(s.doc, next) })),

      addFont: (font) =>
        set((s) => ({ fonts: [...s.fonts.filter((f) => f.id !== font.id), font] })),
      removeFont: (id) => set((s) => ({ fonts: s.fonts.filter((f) => f.id !== id) })),
      renameFont: (id, name) =>
        set((s) => ({
          fonts: s.fonts.map((f) => (f.id === id ? { ...f, name: name.trim() || f.name } : f)),
        })),

      saveAsComponent: (nodeId, name) =>
        set((s) => {
          if (nodeId === s.doc.id) return {} // never componentize the page root
          const node = findNode(s.doc, nodeId)
          if (!node) return {}
          const componentId = nanoid(6)
          const master = cloneNode(node)
          const instance = makeNode('instance', { componentId, name }, { display: 'block', width: '100%' })
          return {
            components: { ...s.components, [componentId]: { id: componentId, name, root: master } },
            doc: updateNode(s.doc, nodeId, () => instance),
            selectedId: instance.id,
          }
        }),

      insertComponent: (componentId, parentId, index) =>
        set((s) => {
          const comp = s.components[componentId]
          if (!comp) return {}
          const instance = makeNode('instance', { componentId, name: comp.name }, { display: 'block', width: '100%' })
          return { doc: insert(s.doc, parentId ?? s.doc.id, instance, index), selectedId: instance.id }
        }),

      enterComponent: (componentId) =>
        set((s) => {
          const comp = s.components[componentId]
          if (!comp || s.editingComponentId) return {}
          return {
            pages: syncActive(s), // fold current page before we borrow `doc`
            editingComponentId: componentId,
            doc: cloneNode(comp.root),
            selectedId: null,
            previewMode: false,
          }
        }),

      exitComponent: () =>
        set((s) => {
          const id = s.editingComponentId
          if (!id) return {}
          const active = s.pages.find((p) => p.id === s.activePageId) ?? s.pages[0]
          return {
            components: { ...s.components, [id]: { ...s.components[id], root: s.doc } },
            editingComponentId: null,
            doc: active.root,
            selectedId: null,
          }
        }),

      deleteComponent: (componentId) =>
        set((s) => {
          const { [componentId]: _gone, ...rest } = s.components
          return { components: rest }
        }),
      renameComponent: (componentId, name) =>
        set((s) => {
          const c = s.components[componentId]
          if (!c) return {}
          return { components: { ...s.components, [componentId]: { ...c, name: name.trim() || c.name } } }
        }),

      setCmsOpen: (open) => set({ cmsOpen: open }),
      addCollection: (name) => {
        const id = nanoid(6)
        set((s) => ({
          collections: [...s.collections, { id, name: name.trim() || 'Collection', items: [emptyItem()] }],
        }))
        return id
      },
      renameCollection: (id, name) =>
        set((s) => ({
          collections: s.collections.map((c) => (c.id === id ? { ...c, name: name.trim() || c.name } : c)),
        })),
      deleteCollection: (id) =>
        set((s) => ({ collections: s.collections.filter((c) => c.id !== id) })),
      addItem: (collectionId) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId ? { ...c, items: [...c.items, emptyItem()] } : c,
          ),
        })),
      updateItem: (collectionId, itemId, patch) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId
              ? { ...c, items: c.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
              : c,
          ),
        })),
      deleteItem: (collectionId, itemId) =>
        set((s) => ({
          collections: s.collections.map((c) =>
            c.id === collectionId ? { ...c, items: c.items.filter((it) => it.id !== itemId) } : c,
          ),
        })),
      insertCollectionList: (collectionId) =>
        set((s) => {
          const node = makeNode(
            'collectionList',
            { collectionId, columns: 3 },
            {
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: '24px',
              width: '100%',
            },
          )
          node.responsive = {
            tablet: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
            mobile: { gridTemplateColumns: '1fr' },
          }
          return { doc: insert(s.doc, s.doc.id, node), selectedId: node.id, cmsOpen: false }
        }),

      loadSite: (data) =>
        set(() => {
          const pages =
            Array.isArray(data?.pages) && data.pages.length ? data.pages : [makePage('Home')]
          const activePageId =
            data?.activePageId && pages.some((p) => p.id === data.activePageId)
              ? data.activePageId
              : pages[0].id
          const doc = pages.find((p) => p.id === activePageId)!.root
          return {
            pages,
            activePageId,
            doc,
            fonts: Array.isArray(data?.fonts) ? data.fonts : [],
            components: data?.components && typeof data.components === 'object' ? data.components : {},
            collections: Array.isArray(data?.collections) ? data.collections : [],
            editingComponentId: null,
            selectedId: null,
            previewMode: false,
          }
        }),
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

/* ---- autosave: persist the whole site to localStorage (debounced) ---- */
let saveTimer: ReturnType<typeof setTimeout> | undefined
useEditor.subscribe((state) => {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    try {
      const site: Site = {
        pages: syncActive(state),
        activePageId: state.activePageId,
        fonts: state.fonts,
        components: state.components,
        collections: state.collections,
      }
      localStorage.setItem(SITE_KEY, JSON.stringify(site))
    } catch {
      /* storage full / unavailable */
    }
  }, 400)
})

/** All pages with the live active page folded in — for export. */
export function getSitePages(): Page[] {
  return syncActive(useEditor.getState())
}

/** The user's uploaded fonts — for export + injection. */
export function getSiteFonts(): CustomFont[] {
  return useEditor.getState().fonts
}

/** Reusable components (masters) — for export inlining. */
export function getComponents(): Record<string, SavedComponent> {
  return useEditor.getState().components
}

/** CMS collections — read by the Collection list block. */
export function getCollections(): Collection[] {
  return useEditor.getState().collections
}

/** The full site (pages + active + fonts + components + collections) — for cloud save. */
export function getSite(): {
  pages: Page[]
  activePageId: string
  fonts: CustomFont[]
  components: Record<string, SavedComponent>
  collections: Collection[]
} {
  const s = useEditor.getState()
  return {
    pages: syncActive(s),
    activePageId: s.activePageId,
    fonts: s.fonts,
    components: s.components,
    collections: s.collections,
  }
}

/* ---- undo / redo helpers ---- */
export const undo = () => useEditor.temporal.getState().undo()
export const redo = () => useEditor.temporal.getState().redo()
export const useTemporal = useEditor.temporal
