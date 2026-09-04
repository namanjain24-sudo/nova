import express from 'express'
import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 8787
const SECRET = process.env.NOVA_SECRET || 'nova-dev-secret-change-me'

/* ------------------------------------------------------------------ */
/*  Database                                                          */
/* ------------------------------------------------------------------ */

const db = new Database(path.join(__dirname, 'nova.db'))
db.pragma('journal_mode = WAL')
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    data TEXT NOT NULL DEFAULT '',
    slug TEXT UNIQUE,
    published TEXT,
    updated_at INTEGER NOT NULL,
    published_at INTEGER
  );
  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    form_name TEXT,
    data TEXT NOT NULL,
    page TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sub_project ON submissions(project_id, created_at);
`)

const now = () => Date.now()
const slugify = (s) =>
  (String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'site')

/* ------------------------------------------------------------------ */
/*  App + auth                                                         */
/* ------------------------------------------------------------------ */

const app = express()
app.use(express.json({ limit: '16mb' }))

function sign(userId) {
  return jwt.sign({ uid: userId }, SECRET, { expiresIn: '30d' })
}

function auth(req, res, next) {
  const h = req.headers.authorization || ''
  const token = h.startsWith('Bearer ') ? h.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Not signed in' })
  try {
    req.userId = jwt.verify(token, SECRET).uid
    next()
  } catch {
    res.status(401).json({ error: 'Session expired' })
  }
}

const publicUser = (u) => ({ id: u.id, email: u.email })

/* ---- auth routes ---- */

app.post('/api/auth/signup', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) return res.status(409).json({ error: 'That email is already registered' })
  const user = { id: randomUUID(), email, password_hash: bcrypt.hashSync(password, 10), created_at: now() }
  db.prepare('INSERT INTO users (id,email,password_hash,created_at) VALUES (?,?,?,?)').run(
    user.id, user.email, user.password_hash, user.created_at,
  )
  res.json({ token: sign(user.id), user: publicUser(user) })
})

app.post('/api/auth/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Wrong email or password' })
  }
  res.json({ token: sign(user.id), user: publicUser(user) })
})

app.get('/api/auth/me', auth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId)
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ user: publicUser(user) })
})

/* ---- project routes ---- */

const projectSummary = (p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  updated_at: p.updated_at,
  published_at: p.published_at,
  url: p.published_at ? `/s/${p.slug}/` : null,
})

app.get('/api/projects', auth, (req, res) => {
  const rows = db
    .prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC')
    .all(req.userId)
  res.json({ projects: rows.map(projectSummary) })
})

app.post('/api/projects', auth, (req, res) => {
  const name = String(req.body?.name || 'Untitled site').slice(0, 80)
  const data = req.body?.data ? JSON.stringify(req.body.data) : ''
  const p = { id: randomUUID(), user_id: req.userId, name, data, slug: null, published: null, updated_at: now(), published_at: null }
  db.prepare(
    'INSERT INTO projects (id,user_id,name,data,slug,published,updated_at,published_at) VALUES (?,?,?,?,?,?,?,?)',
  ).run(p.id, p.user_id, p.name, p.data, p.slug, p.published, p.updated_at, p.published_at)
  res.json({ project: projectSummary(p) })
})

app.get('/api/projects/:id', auth, (req, res) => {
  const p = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.userId)
  if (!p) return res.status(404).json({ error: 'Project not found' })
  res.json({ project: { ...projectSummary(p), data: p.data ? JSON.parse(p.data) : null } })
})

app.put('/api/projects/:id', auth, (req, res) => {
  const p = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.userId)
  if (!p) return res.status(404).json({ error: 'Project not found' })
  const name = req.body?.name != null ? String(req.body.name).slice(0, 80) : p.name
  const data = req.body?.data != null ? JSON.stringify(req.body.data) : p.data
  db.prepare('UPDATE projects SET name = ?, data = ?, updated_at = ? WHERE id = ?').run(name, data, now(), p.id)
  const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(p.id)
  res.json({ project: projectSummary(updated) })
})

app.delete('/api/projects/:id', auth, (req, res) => {
  db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').run(req.params.id, req.userId)
  res.json({ ok: true })
})

/** Publish: frontend sends pre-built static files { filename: html }. */
app.post('/api/projects/:id/publish', auth, (req, res) => {
  const p = db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.userId)
  if (!p) return res.status(404).json({ error: 'Project not found' })
  const files = req.body?.files
  if (!files || typeof files !== 'object' || !files['index.html']) {
    return res.status(400).json({ error: 'Nothing to publish' })
  }
  let slug = p.slug
  if (!slug) {
    const base = slugify(p.name)
    slug = base
    let n = 1
    while (db.prepare('SELECT id FROM projects WHERE slug = ? AND id != ?').get(slug, p.id)) {
      slug = `${base}-${++n}`
    }
  }
  db.prepare('UPDATE projects SET slug = ?, published = ?, published_at = ? WHERE id = ?').run(
    slug, JSON.stringify(files), now(), p.id,
  )
  res.json({ url: `/s/${slug}/`, slug })
})

/* ---- form submissions ---- */

// Public submit endpoint — CORS-open so forms work from any hosted origin.
app.use('/api/f', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.post('/api/f/:projectId', (req, res) => {
  const project = db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.projectId)
  if (!project) return res.status(404).json({ error: 'Unknown form' })
  const body = req.body || {}
  // Honeypot: silently accept bot submissions without storing them.
  if (body._gotcha) return res.json({ ok: true })
  const raw = body.data && typeof body.data === 'object' ? body.data : body
  const data = {}
  for (const [k, v] of Object.entries(raw)) {
    if (k === '_gotcha' || k === 'form' || k === 'page') continue
    data[k] = String(v).slice(0, 5000)
  }
  const id = randomUUID()
  db.prepare(
    'INSERT INTO submissions (id,project_id,form_name,data,page,created_at) VALUES (?,?,?,?,?,?)',
  ).run(
    id, req.params.projectId,
    String(body.form || 'Form').slice(0, 80),
    JSON.stringify(data).slice(0, 10000),
    String(body.page || '').slice(0, 300),
    now(),
  )
  res.json({ ok: true })
})

app.get('/api/projects/:id/submissions', auth, (req, res) => {
  const p = db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.userId)
  if (!p) return res.status(404).json({ error: 'Project not found' })
  const rows = db
    .prepare('SELECT * FROM submissions WHERE project_id = ? ORDER BY created_at DESC LIMIT 500')
    .all(req.params.id)
  res.json({
    submissions: rows.map((r) => ({
      id: r.id, form: r.form_name, data: JSON.parse(r.data), page: r.page, created_at: r.created_at,
    })),
  })
})

app.delete('/api/projects/:id/submissions/:sid', auth, (req, res) => {
  const p = db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?').get(req.params.id, req.userId)
  if (!p) return res.status(404).json({ error: 'Project not found' })
  db.prepare('DELETE FROM submissions WHERE id = ? AND project_id = ?').run(req.params.sid, req.params.id)
  res.json({ ok: true })
})

/* ---- serve published sites ---- */

function servePublished(slug, fileParam, res) {
  const p = db.prepare('SELECT published FROM projects WHERE slug = ?').get(slug)
  if (!p || !p.published) return res.status(404).send('Site not found')
  const files = JSON.parse(p.published)
  let file = fileParam || 'index.html'
  if (!file.endsWith('.html')) file += '.html'
  const html = files[file] || files['index.html']
  if (!html) return res.status(404).send('Page not found')
  res.type('html').send(html)
}

app.get('/s/:slug', (req, res) => servePublished(req.params.slug, null, res))
app.get('/s/:slug/:file', (req, res) => servePublished(req.params.slug, req.params.file, res))

app.get('/api/health', (_req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Nova backend on http://localhost:${PORT}`))
