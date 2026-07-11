import type { ReactNode } from 'react'

export function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="border-b border-ink-800 px-4 py-3.5">
      <div className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-ink-500">
        {title}
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  )
}

export function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-[68px] shrink-0 text-[11px] text-ink-400">{label}</span>
      <div className="flex min-w-0 flex-1 items-center gap-1.5">{children}</div>
    </label>
  )
}

const inputCls =
  'nova-focus min-w-0 flex-1 rounded-md border border-ink-700 bg-ink-850 px-2 py-1 text-[12px] text-ink-100 placeholder:text-ink-500'

export function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      className={inputCls}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function TextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <textarea
      className={inputCls + ' min-h-[64px] resize-y leading-snug'}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function NumberInput({
  value,
  onChange,
  suffix = 'px',
  placeholder,
}: {
  value: string | undefined
  onChange: (v: string) => void
  suffix?: string
  placeholder?: string
}) {
  const num = value ? parseFloat(value) : ''
  return (
    <div className="relative flex-1">
      <input
        type="number"
        className={inputCls + ' w-full pr-6'}
        value={num === '' || Number.isNaN(num) ? '' : num}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value === '' ? '' : `${e.target.value}${suffix}`)
        }
      />
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-ink-500">
        {suffix}
      </span>
    </div>
  )
}

export function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
}) {
  return (
    <select
      className={inputCls + ' cursor-pointer appearance-none'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-ink-850">
          {o.label}
        </option>
      ))}
    </select>
  )
}

export function ColorInput({
  value,
  onChange,
}: {
  value: string | undefined
  onChange: (v: string) => void
}) {
  const isNone = !value || value === 'transparent'
  const shown = isNone ? '#ffffff' : hexOf(value!)
  return (
    <div className="flex flex-1 items-center gap-1.5">
      <div className="relative size-6 shrink-0 overflow-hidden rounded-md border border-ink-700">
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: isNone ? 'transparent' : value,
            backgroundImage: isNone
              ? 'linear-gradient(45deg,#334 25%,transparent 25%),linear-gradient(-45deg,#334 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#334 75%),linear-gradient(-45deg,transparent 75%,#334 75%)'
              : undefined,
            backgroundSize: '8px 8px',
          }}
        />
        <input
          type="color"
          value={shown}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </div>
      <input
        className={inputCls}
        value={value ?? ''}
        placeholder="transparent"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function hexOf(color: string): string {
  if (/^#([0-9a-f]{6})$/i.test(color)) return color
  if (/^#([0-9a-f]{3})$/i.test(color)) {
    return (
      '#' +
      color
        .slice(1)
        .split('')
        .map((c) => c + c)
        .join('')
    )
  }
  return '#000000'
}

export function SegmentedControl({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { label: ReactNode; value: string; title?: string }[]
}) {
  return (
    <div className="flex flex-1 rounded-md border border-ink-700 bg-ink-850 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={
            'flex flex-1 items-center justify-center rounded-[5px] py-1 text-[11px] transition ' +
            (value === o.value
              ? 'bg-brand-600 text-white shadow'
              : 'text-ink-400 hover:text-ink-100')
          }
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
