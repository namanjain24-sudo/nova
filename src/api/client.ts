const TOKEN_KEY = 'nova:token'

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

async function api<T = any>(path: string, opts: { method?: string; body?: any } = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const t = getToken()
  if (t) headers.Authorization = `Bearer ${t}`
  const res = await fetch(`/api${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error((data as any)?.error || 'Something went wrong')
  return data as T
}

export interface User {
  id: string
  email: string
}
export interface ProjectSummary {
  id: string
  name: string
  slug: string | null
  updated_at: number
  published_at: number | null
  url: string | null
}

export const authApi = {
  signup: (email: string, password: string) =>
    api<{ token: string; user: User }>('/auth/signup', { method: 'POST', body: { email, password } }),
  login: (email: string, password: string) =>
    api<{ token: string; user: User }>('/auth/login', { method: 'POST', body: { email, password } }),
  me: () => api<{ user: User }>('/auth/me'),
}

export interface Submission {
  id: string
  form: string
  data: Record<string, string>
  page: string
  created_at: number
}

export const projectsApi = {
  list: () => api<{ projects: ProjectSummary[] }>('/projects'),
  get: (id: string) =>
    api<{ project: ProjectSummary & { data: any } }>(`/projects/${id}`),
  create: (name: string, data: any) =>
    api<{ project: ProjectSummary }>('/projects', { method: 'POST', body: { name, data } }),
  update: (id: string, body: { name?: string; data?: any }) =>
    api<{ project: ProjectSummary }>(`/projects/${id}`, { method: 'PUT', body }),
  remove: (id: string) => api<{ ok: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
  publish: (id: string, files: Record<string, string>) =>
    api<{ url: string; slug: string }>(`/projects/${id}/publish`, { method: 'POST', body: { files } }),
  submissions: (id: string) =>
    api<{ submissions: Submission[] }>(`/projects/${id}/submissions`),
  deleteSubmission: (id: string, sid: string) =>
    api<{ ok: boolean }>(`/projects/${id}/submissions/${sid}`, { method: 'DELETE' }),
}
