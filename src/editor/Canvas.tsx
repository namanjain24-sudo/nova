import { useEffect, useRef, useState } from 'react'
import { Renderer } from '../core/Renderer'
import { useEditor, slugify } from '../store/editor'
import { useDrag } from '../dnd/dragStore'
import { SelectionOverlay } from './SelectionOverlay'
import { DropIndicator } from './DropIndicator'
import { ContextMenu, type MenuState } from './ContextMenu'

const DEVICE_WIDTH: Record<string, string> = {
  desktop: '100%',
  tablet: '834px',
  mobile: '390px',
}
const DEVICE_MAX: Record<string, string> = {
  desktop: '1280px',
  tablet: '834px',
  mobile: '390px',
}

const group = (s: string) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

/** Animate a [data-nv-count] element from 0 to its target (matches the exported JS). */
function runCountUp(el: HTMLElement) {
  const target = parseFloat(el.getAttribute('data-nv-count') || '0') || 0
  const dec = parseInt(el.getAttribute('data-nv-dec') || '0') || 0
  const prefix = el.getAttribute('data-nv-prefix') || ''
  const suffix = el.getAttribute('data-nv-suffix') || ''
  const dur = parseInt(el.getAttribute('data-nv-dur') || '1600') || 1600
  const start = performance.now()
  const tick = (t: number) => {
    const p = Math.min(1, (t - start) / dur)
    const eased = 1 - Math.pow(1 - p, 3)
    const n = target * eased
    const str = dec > 0 ? n.toFixed(dec) : String(Math.round(n))
    const parts = str.split('.')
    parts[0] = group(parts[0])
    el.textContent = prefix + parts.join('.') + suffix
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/** Switch a tabs group to the clicked tab (editor-preview counterpart of the export JS). */
function switchTab(tabEl: HTMLElement) {
  const rootEl = tabEl.closest('[data-nv-tabs]')
  if (!rootEl) return
  const tabs = [...rootEl.querySelectorAll<HTMLElement>('[data-nv-tab]')]
  const panels = [...rootEl.querySelectorAll<HTMLElement>('[data-nv-panel]')]
  const i = tabs.indexOf(tabEl)
  tabs.forEach((t, j) => {
    t.style.opacity = j === i ? '1' : '.5'
    t.style.borderBottomColor = j === i ? 'currentColor' : 'transparent'
  })
  panels.forEach((pn, j) => { pn.style.display = j === i ? 'block' : 'none' })
}

/** Open a full-screen lightbox for an image src (editor-preview counterpart of the export JS). */
function openLightbox(src: string) {
  const o = document.createElement('div')
  o.style.cssText =
    'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.9);display:flex;align-items:center;justify-content:center;cursor:zoom-out;padding:24px'
  const img = document.createElement('img')
  img.src = src
  img.style.cssText = 'max-width:95%;max-height:95%;border-radius:8px;box-shadow:0 20px 60px rgba(0,0,0,.5)'
  o.appendChild(img)
  o.addEventListener('click', () => o.remove())
  document.body.appendChild(o)
}

export function Canvas() {
  const doc = useEditor((s) => s.doc)
  const device = useEditor((s) => s.device)
  const previewMode = useEditor((s) => s.previewMode)
  const activePageId = useEditor((s) => s.activePageId)
  const select = useEditor((s) => s.select)

  const scrollRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const setPageEl = useDrag((s) => s.setPageEl)
  const [menu, setMenu] = useState<MenuState | null>(null)

  useEffect(() => {
    setPageEl(pageRef.current)
    return () => setPageEl(null)
  }, [setPageEl])

  // Drive scroll-reveal animations + count-up stats while previewing (mirrors export).
  useEffect(() => {
    if (!previewMode) return
    const root = scrollRef.current
    const page = pageRef.current
    if (!root || !page) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const el = e.target as HTMLElement
          if (el.hasAttribute('data-anim')) el.classList.add('nv-in')
          if (el.hasAttribute('data-nv-count')) runCountUp(el)
          io.unobserve(el)
        }
      },
      { root, threshold: 0.2 },
    )
    page.querySelectorAll<HTMLElement>('[data-anim],[data-nv-count]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [previewMode, doc])

  // The empty-state CTA is for a blank page — not when editing a (possibly leaf) component.
  const editingComponent = useEditor((s) => !!s.editingComponentId)
  const isEmpty = !editingComponent && (!doc.children || doc.children.length === 0)

  return (
    <div
      ref={scrollRef}
      onClick={() => select(null)}
      className="nova-scroll nova-grid relative flex-1 overflow-auto"
    >
      <div className="flex min-h-full w-full justify-center px-8 py-10">
        <div
          className="transition-[width] duration-300 ease-out"
          style={{ width: DEVICE_WIDTH[device], maxWidth: DEVICE_MAX[device] }}
        >
          <div
            ref={pageRef}
            onContextMenu={(e) => {
              if (previewMode) return
              const el = (e.target as HTMLElement).closest('[data-node-id]')
              const id = el?.getAttribute('data-node-id') || doc.id
              e.preventDefault()
              select(id)
              setMenu({ x: e.clientX, y: e.clientY, nodeId: id })
            }}
            onClick={(e) => {
              e.stopPropagation()
              // In preview, make internal nav links actually switch pages.
              if (!previewMode) return
              const lb = (e.target as HTMLElement).closest('[data-nv-lightbox]')
              if (lb) {
                e.preventDefault()
                openLightbox(lb.getAttribute('src') || '')
                return
              }
              const tab = (e.target as HTMLElement).closest('[data-nv-tab]')
              if (tab) {
                e.preventDefault()
                switchTab(tab as HTMLElement)
                return
              }
              const a = (e.target as HTMLElement).closest('a')
              const href = a?.getAttribute('href')
              if (!href || href === '#' || /^(https?:|mailto:|tel:|#)/.test(href)) return
              e.preventDefault()
              const target = href.replace(/^\//, '').replace(/^#/, '')
              const st = useEditor.getState()
              const page =
                href === '/' || target === '' || target === 'home'
                  ? st.pages[0]
                  : st.pages.find((p) => p.path === target || slugify(p.name) === target)
              if (page) st.switchPage(page.id)
            }}
            className="relative min-h-[70vh] overflow-hidden rounded-xl bg-white shadow-2xl shadow-black/40 ring-1 ring-black/5"
          >
            {/* Re-key on page id in preview so each page eases in (page transition). */}
            <div key={previewMode ? activePageId : 'edit'} className={previewMode ? 'nova-page-in' : undefined}>
              <Renderer doc={doc} device={device} editMode={!previewMode} />
            </div>

            {isEmpty && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-10 text-center">
                <div className="text-[16px] font-semibold text-slate-700">
                  Your canvas is empty
                </div>
                <div className="max-w-xs text-[13px] leading-relaxed text-slate-400">
                  Start from a world-class template, or drag blocks from the left panel.
                </div>
                <button
                  onClick={() => useEditor.getState().setTemplatesOpen(true)}
                  className="mt-1 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-brand-500/25 transition hover:brightness-110"
                >
                  Browse templates
                </button>
              </div>
            )}

            {!previewMode && (
              <>
                <SelectionOverlay containerRef={pageRef} scrollRef={scrollRef} />
                <DropIndicator />
              </>
            )}
          </div>
        </div>
      </div>
      {menu && !previewMode && <ContextMenu menu={menu} onClose={() => setMenu(null)} />}
    </div>
  )
}
