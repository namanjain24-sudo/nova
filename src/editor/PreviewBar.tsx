import { Eye, X, Home } from 'lucide-react'
import { useEditor } from '../store/editor'

/** While previewing, a floating pill lets you browse the multi-page site like a visitor. */
export function PreviewBar() {
  const previewMode = useEditor((s) => s.previewMode)
  const pages = useEditor((s) => s.pages)
  const activePageId = useEditor((s) => s.activePageId)
  const switchPage = useEditor((s) => s.switchPage)
  const togglePreview = useEditor((s) => s.togglePreview)
  const editingComponent = useEditor((s) => !!s.editingComponentId)

  if (!previewMode || editingComponent) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
      <div className="animate-pop pointer-events-auto flex max-w-[92vw] items-center gap-1 rounded-full border border-ink-700/80 bg-ink-900/95 p-1.5 pl-3 shadow-2xl shadow-black/50 backdrop-blur">
        <div className="mr-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-ink-500">
          <Eye className="size-3.5 text-brand-400" />
          <span className="hidden sm:inline">Preview</span>
        </div>
        <div className="nova-scroll flex items-center gap-1 overflow-x-auto">
          {pages.map((p, i) => {
            const activeTab = p.id === activePageId
            return (
              <button
                key={p.id}
                onClick={() => switchPage(p.id)}
                className={`nova-focus flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12.5px] font-medium transition ${
                  activeTab ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/25' : 'text-ink-300 hover:bg-ink-800 hover:text-white'
                }`}
              >
                {i === 0 && <Home className="size-3" />}
                {p.name}
              </button>
            )
          })}
        </div>
        <button
          onClick={togglePreview}
          className="nova-focus ml-1 flex shrink-0 items-center gap-1.5 rounded-full bg-ink-800 px-3 py-1.5 text-[12.5px] font-semibold text-ink-200 transition hover:bg-ink-700 hover:text-white"
        >
          <X className="size-3.5" />
          Exit
        </button>
      </div>
    </div>
  )
}
