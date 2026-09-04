import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { LayoutTemplate, X } from 'lucide-react'
import type { Node } from '../core/schema'
import { Renderer } from '../core/Renderer'
import { useEditor } from '../store/editor'
import { SECTION_DEFS, buildSectionNode, paletteFromPage, type SectionDef } from '../templates/sections'

const PREVIEW_WIDTH = 1200

export function SectionLibrary() {
  const open = useEditor((s) => s.sectionsOpen)
  const doc = useEditor((s) => s.doc)
  const close = () => useEditor.getState().setSectionsOpen(false)

  // Build every section with a palette derived from the CURRENT page, so previews
  // (and inserts) match this page's colours, fonts and light/dark.
  const built = useMemo(() => {
    if (!open) return []
    const palette = paletteFromPage(doc)
    return SECTION_DEFS.map((def) => ({ def, palette, tree: safeBuild(def, palette) }))
  }, [open, doc])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!open) return null

  const insert = (def: SectionDef, palette: ReturnType<typeof paletteFromPage>) => {
    useEditor.getState().insertSectionTree(buildSectionNode(def, palette)) // fresh ids
  }

  // Group by section family for a tidy layout.
  const groups: string[] = []
  for (const { def } of built) if (!groups.includes(def.group)) groups.push(def.group)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-ink-950/80 backdrop-blur-sm">
      <div className="flex shrink-0 items-center gap-3 border-b border-ink-800 bg-ink-900/95 px-6 py-4">
        <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 shadow-lg shadow-brand-500/30">
          <LayoutTemplate className="size-4 text-white" />
        </div>
        <div>
          <div className="text-[15px] font-bold text-ink-100">Add a section</div>
          <div className="text-[12px] text-ink-400">
            {SECTION_DEFS.length} ready-made sections — themed to this page, fully editable after you drop them in.
          </div>
        </div>
        <button
          onClick={close}
          className="nova-focus ml-auto grid size-9 place-items-center rounded-lg text-ink-300 transition hover:bg-ink-800 hover:text-white"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="nova-scroll flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-[1200px] space-y-8">
          {groups.map((g) => (
            <div key={g}>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-ink-500">{g}</div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {built.filter((b) => b.def.group === g).map(({ def, palette, tree }) => (
                  <SectionCard key={def.id} name={def.name} tree={tree} onInsert={() => insert(def, palette)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SectionCard({ name, tree, onInsert }: { name: string; tree: Node; onInsert: () => void }) {
  // A div (not a <button>) because the preview may itself contain buttons/forms/links.
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onInsert}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onInsert() } }}
      className="nova-focus group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-ink-800 bg-ink-900 text-left transition hover:border-brand-500/60 hover:shadow-2xl hover:shadow-brand-500/10"
    >
      <Thumb tree={tree} />
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-[13.5px] font-semibold text-ink-100">{name}</span>
        <span className="rounded-lg bg-brand-600/90 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
          + Insert
        </span>
      </div>
    </div>
  )
}

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
    <div ref={boxRef} className="relative h-[220px] w-full overflow-hidden border-b border-ink-800 bg-white">
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: PREVIEW_WIDTH, transform: `scale(${scale})`, pointerEvents: 'none' }}
        aria-hidden
      >
        <Renderer doc={tree} device="desktop" editMode={false} />
      </div>
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
    </div>
  )
}

function safeBuild(def: SectionDef, palette: ReturnType<typeof paletteFromPage>): Node {
  try {
    return buildSectionNode(def, palette)
  } catch (e) {
    console.error('section build failed:', def.id, e)
    return { id: 'err', type: 'section', props: {}, style: { padding: '40px' }, children: [] }
  }
}
