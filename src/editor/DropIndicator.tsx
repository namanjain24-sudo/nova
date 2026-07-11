import { useDrag } from '../dnd/dragStore'

/** Renders the live insertion line / drop region during a drag. */
export function DropIndicator() {
  const indicator = useDrag((s) => s.indicator)
  const source = useDrag((s) => s.source)
  if (!source || !indicator) return null

  if (indicator.block) {
    return (
      <div
        className="pointer-events-none absolute z-30 rounded-xl"
        style={{
          top: indicator.top,
          left: indicator.left,
          width: indicator.width,
          height: indicator.height,
          border: '2px dashed #8b5cf6',
          background: 'rgba(139,92,246,0.08)',
        }}
      />
    )
  }

  return (
    <div
      className="pointer-events-none absolute z-30 rounded-full"
      style={{
        top: indicator.top,
        left: indicator.left,
        width: indicator.width,
        height: indicator.height,
        background: '#8b5cf6',
        boxShadow: '0 0 0 3px rgba(139,92,246,0.25), 0 0 10px rgba(139,92,246,0.6)',
      }}
    >
      <span
        className="absolute size-2 rounded-full bg-brand-500 ring-2 ring-white"
        style={{ top: '50%', left: -3, transform: 'translateY(-50%)' }}
      />
    </div>
  )
}
