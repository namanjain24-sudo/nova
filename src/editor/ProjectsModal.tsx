import { useCallback, useEffect, useState } from 'react'
import {
  ExternalLink,
  FolderOpen,
  Loader2,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { useAuth } from '../store/auth'
import { deleteProject, listProjects, openCloudProject } from '../api/cloud'
import type { ProjectSummary } from '../api/client'

export function ProjectsModal() {
  const open = useAuth((s) => s.projectsOpen)

  const [projects, setProjects] = useState<ProjectSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [openingId, setOpeningId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const close = () => useAuth.getState().setProjectsOpen(false)

  const refresh = useCallback(async () => {
    setError(null)
    try {
      setProjects(await listProjects())
    } catch (err) {
      setProjects([])
      setError(err instanceof Error ? err.message : 'Could not load your projects.')
    }
  }, [])

  useEffect(() => {
    if (!open) return
    setProjects(null) // show loading fresh each open
    void refresh()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, refresh])

  if (!open) return null

  const openProject = async (id: string) => {
    if (openingId) return
    setOpeningId(id)
    setError(null)
    try {
      await openCloudProject(id)
      close()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open that project.')
    } finally {
      setOpeningId(null)
    }
  }

  const removeProject = async (p: ProjectSummary) => {
    if (deletingId) return
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    setDeletingId(p.id)
    setError(null)
    try {
      await deleteProject(p.id)
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete that project.')
    } finally {
      setDeletingId(null)
    }
  }

  const loading = projects === null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink-950/80 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="nova-projects-title"
    >
      <div className="animate-pop flex max-h-[min(640px,90vh)] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border border-ink-800 bg-ink-900 shadow-2xl shadow-black/50">
        {/* header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-ink-800 px-6 py-4">
          <div className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 shadow-lg shadow-brand-500/30">
            <Sparkles className="size-4 text-white" />
          </div>
          <div>
            <h2 id="nova-projects-title" className="text-[15px] font-bold tracking-tight text-ink-100">
              My projects
            </h2>
            <div className="text-[12px] text-ink-400">
              {loading
                ? 'Loading your cloud projects…'
                : `${projects.length} ${projects.length === 1 ? 'project' : 'projects'} in the cloud`}
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

        {/* body */}
        <div className="nova-scroll flex-1 overflow-y-auto p-4">
          {error && (
            <div
              role="alert"
              className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-[12.5px] font-medium text-red-400"
            >
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid place-items-center py-16 text-ink-400">
              <Loader2 className="size-6 animate-spin" />
              <div className="mt-3 text-[13px]">Fetching projects…</div>
            </div>
          ) : projects.length === 0 && !error ? (
            <div className="grid place-items-center rounded-xl border border-dashed border-ink-700 py-14 text-center">
              <div className="grid size-12 place-items-center rounded-full bg-ink-850">
                <FolderOpen className="size-5 text-ink-400" />
              </div>
              <div className="mt-4 text-[14px] font-semibold text-ink-200">No projects yet</div>
              <div className="mt-1 max-w-[300px] text-[12.5px] leading-relaxed text-ink-400">
                Save one from the account menu and it will show up here, synced and ready on any
                device.
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="group flex items-center gap-4 rounded-xl border border-ink-800 bg-ink-850/50 px-4 py-3 transition hover:border-ink-700 hover:bg-ink-850"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[13.5px] font-semibold text-ink-100">
                        {p.name}
                      </span>
                      {p.published_at !== null && p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="nova-focus flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10.5px] font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                        >
                          <span className="size-1.5 rounded-full bg-emerald-400" />
                          Live
                          <ExternalLink className="size-2.5" />
                        </a>
                      )}
                    </div>
                    <div className="mt-0.5 text-[12px] text-ink-400">
                      Updated {timeAgo(p.updated_at)}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      onClick={() => void openProject(p.id)}
                      disabled={openingId !== null}
                      className={cn(
                        'nova-focus flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1.5 text-[12px] font-semibold text-white shadow-md shadow-brand-500/20 transition hover:brightness-110',
                        openingId !== null && 'cursor-not-allowed opacity-60 hover:brightness-100',
                      )}
                    >
                      {openingId === p.id && <Loader2 className="size-3.5 animate-spin" />}
                      {openingId === p.id ? 'Opening…' : 'Open'}
                    </button>
                    <button
                      onClick={() => void removeProject(p)}
                      disabled={deletingId !== null}
                      aria-label={`Delete ${p.name}`}
                      className={cn(
                        'nova-focus grid size-8 place-items-center rounded-lg text-ink-500 transition hover:bg-red-500/10 hover:text-red-400',
                        deletingId !== null && 'cursor-not-allowed opacity-60',
                      )}
                    >
                      {deletingId === p.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

/** Compact relative time: "just now", "5m ago", "3h ago", "2d ago", or a date. */
function timeAgo(ms: number): string {
  const diff = Date.now() - ms
  if (diff < 45_000) return 'just now'
  const mins = Math.floor(diff / 60_000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
