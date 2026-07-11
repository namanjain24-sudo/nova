import { useEffect, useRef } from 'react'
import { Renderer } from '../core/Renderer'
import { useEditor } from '../store/editor'
import { useDrag } from '../dnd/dragStore'
import { SelectionOverlay } from './SelectionOverlay'
import { DropIndicator } from './DropIndicator'

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

export function Canvas() {
  const doc = useEditor((s) => s.doc)
  const device = useEditor((s) => s.device)
  const previewMode = useEditor((s) => s.previewMode)
  const select = useEditor((s) => s.select)

  const scrollRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)
  const setPageEl = useDrag((s) => s.setPageEl)

  useEffect(() => {
    setPageEl(pageRef.current)
    return () => setPageEl(null)
  }, [setPageEl])

  const isEmpty = !doc.children || doc.children.length === 0

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
            onClick={(e) => e.stopPropagation()}
            className="relative min-h-[70vh] overflow-hidden rounded-xl bg-white shadow-2xl shadow-black/40 ring-1 ring-black/5"
          >
            <Renderer doc={doc} device={device} editMode={!previewMode} />

            {isEmpty && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 p-10 text-center">
                <div className="text-[15px] font-semibold text-slate-700">
                  Your canvas is empty
                </div>
                <div className="max-w-xs text-[13px] leading-relaxed text-slate-400">
                  Add blocks from the left panel, or start from a template. Click any
                  element to edit it.
                </div>
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
    </div>
  )
}
