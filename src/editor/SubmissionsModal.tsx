import { useCallback, useEffect, useState } from 'react'
import { Inbox, Loader2, Mail, Trash2, X } from 'lucide-react'
import { cn } from '../lib/cn'
import { useAuth } from '../store/auth'
import { projectsApi, type Submission } from '../api/client'

export function SubmissionsModal() {
  const open = useAuth((s) => s.submissionsOpen)
  const projectId = useAuth((s) => s.currentProjectId)
  const projectName = useAuth((s) => s.currentProjectName)

  const [subs, setSubs] = useState<Submission[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const close = () => useAuth.getState().setSubmissionsOpen(false)

  const refresh = useCallback(async () => {
    if (!projectId) {
      setSubs([])
      setError('Save this site to the cloud first — submissions are tied to a project.')
      return
    }
    setError(null)
    try {
      const { submissions } = await projectsApi.submissions(projectId)
      setSubs(submissions)
    } catch (err) {
      setSubs([])
      setError(err instanceof Error ? err.message : 'Could not load submissions.')
    }
  }, [projectId])

  useEffect(() => {
    if (!open) return
    setSubs(null)
    void refresh()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, refresh])

  if (!open) return null

  const remove = async (sid: string) => {
    if (!projectId || deletingId) return
    setDeletingId(sid)
    try {
      await projectsApi.deleteSubmission(projectId, sid)
      setSubs((cur) => (cur ? cur.filter((s) => s.id !== sid) : cur))
    } catch {
      /* keep row on failure */
    } finally {
      setDeletingId(null)
    }
  }

  const loading = subs === null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="nova-subs-title"
    >
      <div className="animate-pop flex max-h-[min(680px,90vh)] w-full max-w-[640px] flex-col overflow-hidden rounded-2xl border border-ink-800 bg-ink-900 shadow-2xl shadow-black/50">
        <div className="flex shrink-0 items-center gap-3 border-b border-ink-800 px-6 py-4">
          <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 shadow-lg shadow-brand-500/30">
            <Inbox className="size-4 text-white" />
          </div>
          <div>
            <h2 id="nova-subs-title" className="text-[15px] font-bold tracking-tight text-ink-100">
              Form submissions
            </h2>
            <div className="text-[12px] text-ink-400">
              {loading ? 'Loading…' : `${subs.length} ${subs.length === 1 ? 'entry' : 'entries'}${projectName ? ` · ${projectName}` : ''}`}
            </div>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className="nova-focus ml-auto grid size-9 place-items-center rounded-lg text-ink-300 transition hover:bg-ink-800 hover:text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="nova-scroll flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-[12.5px] font-medium text-amber-300">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid place-items-center py-16 text-ink-400">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : subs.length === 0 && !error ? (
            <div className="grid place-items-center rounded-xl border border-dashed border-ink-700 py-14 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-ink-850">
                <Mail className="size-5 text-ink-400" />
              </div>
              <div className="mt-4 text-[14px] font-semibold text-ink-200">No submissions yet</div>
              <div className="mt-1 max-w-[340px] text-[12.5px] leading-relaxed text-ink-400">
                Add a Form block, publish your site, and every submission from your live site lands
                right here.
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {subs.map((s) => (
                <li key={s.id} className="rounded-xl border border-ink-800 bg-ink-850/50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[12.5px] font-semibold text-ink-100">{s.form || 'Form'}</span>
                    {s.page && (
                      <span className="rounded-full bg-ink-800 px-2 py-0.5 text-[10.5px] text-ink-400">
                        {s.page}
                      </span>
                    )}
                    <span className="ml-auto text-[11.5px] text-ink-500">{timeAgo(s.created_at)}</span>
                    <button
                      onClick={() => void remove(s.id)}
                      disabled={deletingId !== null}
                      aria-label="Delete submission"
                      className="nova-focus grid size-7 place-items-center rounded-lg text-ink-500 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      {deletingId === s.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                    </button>
                  </div>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
                    {Object.entries(s.data).map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="text-[11.5px] font-medium uppercase tracking-wide text-ink-500">{k}</dt>
                        <dd className="min-w-0 break-words text-[13px] text-ink-200">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function timeAgo(ms: number): string {
  const diff = Date.now() - ms
  if (diff < 45_000) return 'just now'
  const m = Math.floor(diff / 60_000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d ago`
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
