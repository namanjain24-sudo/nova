import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Sparkles, X, FilePlus2 } from 'lucide-react'
import type { Node } from '../core/schema'
import { makeNode } from '../core/schema'
import { Renderer } from '../core/Renderer'
import { useEditor } from '../store/editor'
import { TEMPLATES, type Template } from '../templates/library'

const PREVIEW_WIDTH = 1200

export function TemplateGallery() {
  const open = useEditor((s) => s.templatesOpen)
  const close = () => useEditor.getState().setTemplatesOpen(false)
  const setDoc = useEditor((s) => s.setDoc)

  // Build each template tree once (lazily, only while the gallery is open).
  const built = useMemo(
    () => (open ? TEMPLATES.map((t) => ({ t, tree: safeBuild(t) })) : []),
    [open],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  const apply = (t: Template, tree: Node) => {
    const st = useEditor.getState()
    const notEmpty = (st.doc.children?.length ?? 0) > 0 || st.pages.length > 1
    if (notEmpty && !window.confirm('Replace your site with this template?')) return
    if (t.site) {
      const { pages, components } = t.site()
      const clonedPages = pages.map((p) => ({ ...p, root: structuredCloneSafe(p.root) }))
      const compMap: Record<string, { id: string; name: string; root: Node }> = {}
      for (const c of components) compMap[c.id] = { id: c.id, name: c.name, root: structuredCloneSafe(c.root) }
      st.applySite(clonedPages, compMap)
    } else {
      setDoc(structuredCloneSafe(tree))
    }
    close()
  }

  const startBlank = () => {
    const doc = useEditor.getState().doc
    if ((doc.children?.length ?? 0) > 0 && !window.confirm('Clear the page and start blank?')) return
    setDoc(makeNode('page', { name: 'Untitled Page' }, { minHeight: '100%', backgroundColor: '#ffffff' }, []))
    close()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink-950/80 backdrop-blur-sm">
      {/* header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-ink-800 bg-ink-900/95 px-6 py-4">
        <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 shadow-lg shadow-brand-500/30">
          <Sparkles className="size-4 text-white" />
        </div>
        <div>
          <div className="text-[15px] font-bold text-ink-100">Start from a template</div>
          <div className="text-[12px] text-ink-400">
            {TEMPLATES.length} world-class starting points — every element stays fully editable.
          </div>
        </div>
        <button
          onClick={close}
          className="nova-focus ml-auto grid size-9 place-items-center rounded-lg text-ink-300 transition hover:bg-ink-800 hover:text-white"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* grid */}
      <div className="nova-scroll flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <BlankCard onClick={startBlank} />
          {built.map(({ t, tree }) => (
            <TemplateCard key={t.id} template={t} tree={tree} onApply={() => apply(t, tree)} />
          ))}
        </div>
      </div>
    </div>
  )
}

function BlankCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="nova-focus group flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-700 bg-ink-900/60 text-ink-400 transition hover:border-brand-500/60 hover:bg-ink-850 hover:text-ink-100"
    >
      <div className="grid size-12 place-items-center rounded-xl border border-ink-700 bg-ink-850 transition group-hover:border-brand-500/50">
        <FilePlus2 className="size-5" />
      </div>
      <span className="text-[14px] font-semibold">Blank canvas</span>
      <span className="text-[12px] text-ink-500">Start from scratch</span>
    </button>
  )
}

function TemplateCard({
  template,
  tree,
  onApply,
}: {
  template: Template
  tree: Node
  onApply: () => void
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-ink-800 bg-ink-900 transition hover:border-brand-500/50 hover:shadow-2xl hover:shadow-brand-500/10">
      <Thumb tree={tree} />
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span
          className="size-3 shrink-0 rounded-full ring-2 ring-ink-800"
          style={{ backgroundColor: template.accent }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-ink-100">{template.name}</span>
            <span className="rounded-full bg-ink-800 px-2 py-0.5 text-[10px] font-medium text-ink-400">
              {template.category}
            </span>
          </div>
          <div className="truncate text-[12px] text-ink-500">{template.description}</div>
        </div>
        <button
          onClick={onApply}
          className="nova-focus shrink-0 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3.5 py-1.5 text-[12px] font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-110"
        >
          Use
        </button>
      </div>
    </div>
  )
}

/** Live, real-DOM preview of a template scaled to fit the card. */
function Thumb({ tree }: { tree: Node }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.3)

  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const update = () => setScale(el.clientWidth / PREVIEW_WIDTH)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={boxRef}
      className="relative h-[240px] w-full overflow-hidden border-b border-ink-800 bg-white"
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: PREVIEW_WIDTH, transform: `scale(${scale})`, pointerEvents: 'none' }}
        aria-hidden
      >
        <Renderer doc={tree} device="desktop" editMode={false} />
      </div>
      {/* subtle top gradient so scaled content feels framed */}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
    </div>
  )
}

function safeBuild(t: Template): Node {
  try {
    return t.build()
  } catch (e) {
    console.error('template build failed:', t.id, e)
    return makeNode('page', { name: t.name }, { minHeight: '100%', backgroundColor: '#fff' }, [])
  }
}

function structuredCloneSafe(n: Node): Node {
  try {
    return structuredClone(n)
  } catch {
    return JSON.parse(JSON.stringify(n))
  }
}
