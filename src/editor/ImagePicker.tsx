import { useMemo, useState } from 'react'
import { Search, X, Link2 } from 'lucide-react'

/** Curated Unsplash photo ids, grouped by theme. No API key needed — the picker
 *  just composes stable images.unsplash.com URLs the user can drop straight in. */
const LIBRARY: Record<string, string[]> = {
  Workspace: ['1497366216548-37526070297c', '1531403009284-440f080d1e12', '1522071820081-009f0129c71c', '1600880292203-757bb62b4baf', '1517245386807-bb43f82c33c4', '1499750310107-5fef28a66643'],
  People: ['1494790108377-be9c29b29330', '1500648767791-00dcc994a43e', '1507003211169-0a1dd7228f2d', '1544005313-94ddf0286df2', '1438761681033-6461ffad8d80', '1487412720507-e7ab37603c6f'],
  Nature: ['1441974231531-c6227db76b6e', '1466611653911-95081537e5b7', '1470071459604-3b5ec3a7fe05', '1501785888041-af3ef285b470', '1436891620584-47fd0e565afb', '1447752875215-b2761acb3c5d'],
  Architecture: ['1487958449943-2429e8be8625', '1449844908441-8829872d2607', '1486406146926-c627a92ad1ab', '1600585154340-be6161a56a0c', '1600607687939-ce8a6c25118c', '1503387762-592deb58ef4e'],
  'Tech & AI': ['1550751827-4bd374c3f58b', '1518709268805-4e9042af9f23', '1526374965328-7f61d4dc18c5', '1451187580459-43490279c0fa', '1517077304055-6e89abbf09b0', '1555949963-aa79dcee981c'],
  Food: ['1504674900247-0877df9cc836', '1414235077428-338989a2e8c0', '1540189549336-e6e99c3679fe', '1476224203421-9ac39bcb3327', '1467003909585-2f8a72700288', '1482049016688-2d3e1b311543'],
  Product: ['1523275335684-37898b6baf30', '1526170375885-4d8ecf77b99f', '1542291026-7eec264c27ff', '1560343090-f0409e92791a', '1585386959984-a4155224a1ad', '1491553895911-0055eca6402d'],
  Abstract: ['1550684376-efcbd6e3f031', '1557672172-298e090bd0f1', '1579546929518-9e396f3cc809', '1618005182384-a83a8bd57fbe', '1620121692029-d088224ddc74', '1614851099175-e5b30eb6f696'],
}

const CATEGORIES = Object.keys(LIBRARY)
const url = (id: string, w = 1400) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`

export function ImagePicker({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const [cat, setCat] = useState('All')
  const [query, setQuery] = useState('')
  const [custom, setCustom] = useState('')

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    const cats = cat === 'All' ? CATEGORIES : [cat]
    let list = cats.flatMap((c) => LIBRARY[c].map((id) => ({ id, c })))
    if (q) list = list.filter((it) => it.c.toLowerCase().includes(q))
    return list
  }, [cat, query])

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-ink-950/85 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto mt-[6vh] flex h-[86vh] w-[min(920px,94vw)] flex-col overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-ink-800 px-5 py-3.5">
          <div className="text-[14px] font-bold text-ink-100">Image library</div>
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-ink-700 bg-ink-850 px-2.5">
            <Search className="size-3.5 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by theme…"
              className="h-8 flex-1 bg-transparent text-[13px] text-ink-100 placeholder:text-ink-500 focus:outline-none"
            />
          </div>
          <button onClick={onClose} className="nova-focus grid size-8 place-items-center rounded-lg text-ink-300 hover:bg-ink-800 hover:text-white">
            <X className="size-4.5" />
          </button>
        </div>

        {/* category chips */}
        <div className="nova-scroll flex shrink-0 items-center gap-1.5 overflow-x-auto border-b border-ink-800 px-5 py-2.5">
          {['All', ...CATEGORIES].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-medium transition ${
                cat === c ? 'bg-brand-600 text-white' : 'text-ink-300 hover:bg-ink-800 hover:text-white'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* grid */}
        <div className="nova-scroll grid flex-1 grid-cols-2 gap-3 overflow-y-auto p-5 sm:grid-cols-3 md:grid-cols-4">
          {items.map(({ id }) => (
            <button
              key={id}
              onClick={() => { onPick(url(id)); onClose() }}
              className="nova-focus group relative aspect-square overflow-hidden rounded-xl border border-ink-800 bg-ink-850"
            >
              <img
                src={url(id, 400)}
                alt=""
                loading="lazy"
                className="size-full object-cover transition group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5 transition group-hover:ring-brand-500/60" />
            </button>
          ))}
        </div>

        {/* paste-a-URL footer */}
        <div className="flex shrink-0 items-center gap-2 border-t border-ink-800 px-5 py-3">
          <Link2 className="size-3.5 text-ink-400" />
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && custom.trim()) { onPick(custom.trim()); onClose() } }}
            placeholder="…or paste any image URL and press Enter"
            className="h-8 flex-1 rounded-lg border border-ink-700 bg-ink-850 px-2.5 text-[13px] text-ink-100 placeholder:text-ink-500 focus:outline-none"
          />
          <button
            disabled={!custom.trim()}
            onClick={() => { if (custom.trim()) { onPick(custom.trim()); onClose() } }}
            className="nova-focus rounded-lg bg-brand-600 px-3 py-1.5 text-[12px] font-semibold text-white transition enabled:hover:bg-brand-500 disabled:opacity-40"
          >
            Use
          </button>
        </div>
      </div>
    </div>
  )
}
