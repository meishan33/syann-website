'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY: React.CSSProperties  = { fontFamily: "'Montserrat', sans-serif" }
const GOLD   = '#B08B57'
const DARK   = '#4A3A32'
const BG     = '#F6F1EB'
const BORDER = '#E5DDD5'

type Post = { id: string; title: string; slug: string; date: string; excerpt: string; content: string; status: 'draft' | 'published'; created_at: string }

function toSlug(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80)
}

function ToolBtn({ label, title, active, onClick }: { label: React.ReactNode; title: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      style={{ ...BODY, padding: '4px 8px', fontSize: 11, fontWeight: active ? 700 : 400, background: active ? '#EDE8DF' : 'transparent', border: `1px solid ${active ? GOLD : BORDER}`, borderRadius: 5, color: active ? GOLD : '#7A6355', cursor: 'pointer', lineHeight: 1.2, minWidth: 28, flexShrink: 0 }}
    >
      {label}
    </button>
  )
}

export default function AdminBlogPage() {
  const router = useRouter()
  const [token, setToken]           = useState<string | null>(null)
  const [posts, setPosts]           = useState<Post[]>([])
  const [selected, setSelected]     = useState<Post | null>(null)
  const [editTitle, setEditTitle]   = useState('')
  const [editSlug, setEditSlug]     = useState('')
  const [editExcerpt, setEditExcerpt] = useState('')
  const [saving, setSaving]         = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [msg, setMsg]               = useState('')
  const editorRef = useRef<HTMLDivElement>(null)
  const imgInputRef = useRef<HTMLInputElement>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)

  /* ── auth ── */
  useEffect(() => {
    supabase.auth.refreshSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/account'); return }
      const res = await fetch('/api/admin/blog', { headers: { Authorization: `Bearer ${session.access_token}` } })
      if (res.status === 401) { router.replace('/'); return }
      setToken(session.access_token)
      const data = await res.json()
      if (Array.isArray(data)) setPosts(data)
    })
  }, [router])

  /* ── load post into editor ── */
  useEffect(() => {
    if (!selected) {
      if (editorRef.current) editorRef.current.innerHTML = ''
      return
    }
    setEditTitle(selected.title)
    setEditSlug(selected.slug)
    setEditExcerpt(selected.excerpt)
    if (editorRef.current) editorRef.current.innerHTML = selected.content
  }, [selected?.id])

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  /* ── reload posts ── */
  const reload = useCallback(async (t: string) => {
    const res = await fetch('/api/admin/blog', { headers: { Authorization: `Bearer ${t}` } })
    const data = await res.json()
    if (Array.isArray(data)) setPosts(data)
  }, [])

  /* ── new blank post ── */
  function newPost() {
    setSelected({ id: '', title: '', slug: '', date: new Date().toISOString().split('T')[0], excerpt: '', content: '', status: 'draft', created_at: '' })
    setEditTitle(''); setEditSlug(''); setEditExcerpt('')
    if (editorRef.current) editorRef.current.innerHTML = ''
  }

  /* ── save ── */
  async function save(statusOverride?: 'draft' | 'published') {
    if (!token) return
    const content = editorRef.current?.innerHTML ?? ''
    const status = statusOverride ?? selected?.status ?? 'draft'
    const body = { title: editTitle, slug: editSlug, excerpt: editExcerpt, content, status, date: selected?.date ?? new Date().toISOString().split('T')[0] }
    setSaving(true)
    try {
      if (selected?.id) {
        const res = await fetch(`/api/admin/blog/${selected.id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const updated = await res.json()
        if (!res.ok) { flash('Error: ' + updated.error); return }
        setSelected(updated)
        setPosts(p => p.map(x => x.id === updated.id ? updated : x))
        flash(status === 'published' ? '✓ Published' : '✓ Saved as draft')
      } else {
        const res = await fetch('/api/admin/blog', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        const created = await res.json()
        if (!res.ok) { flash('Error: ' + created.error); return }
        setSelected(created)
        await reload(token)
        flash('✓ Post created')
      }
    } finally {
      setSaving(false)
    }
  }

  /* ── delete ── */
  async function deletePost() {
    if (!token || !selected?.id) return
    if (!confirm(`Delete "${editTitle}"? This cannot be undone.`)) return
    setDeleting(true)
    await fetch(`/api/admin/blog/${selected.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    setSelected(null)
    await reload(token)
    setDeleting(false)
    flash('Post deleted')
  }

  /* ── toolbar helpers ── */
  function exec(cmd: string, value?: string) {
    editorRef.current?.focus()
    document.execCommand(cmd, false, value ?? '')
  }

  function formatBlock(tag: string) {
    editorRef.current?.focus()
    document.execCommand('formatBlock', false, tag)
  }

  function applyFontSize(size: string) {
    editorRef.current?.focus()
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount || sel.isCollapsed) return
    const range = sel.getRangeAt(0)
    const span = document.createElement('span')
    span.style.fontSize = size
    try {
      range.surroundContents(span)
    } catch {
      const contents = range.extractContents()
      span.appendChild(contents)
      range.insertNode(span)
    }
    sel.removeAllRanges()
  }

  /* ── image upload ── */
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !token) return
    e.target.value = ''
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/blog/upload', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd })
    const { url, error } = await res.json()
    if (error) { flash('Upload failed: ' + error); return }
    editorRef.current?.focus()
    document.execCommand('insertHTML', false, `<img src="${url}" alt="" style="max-width:100%;border-radius:8px;margin:16px 0;display:block;" />`)
  }

  if (!token) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BG, ...BODY, fontSize: 12, color: '#9A8573' }}>Loading…</div>
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: BG, overflow: 'hidden' }}>

      {/* ── SIDEBAR: post list ── */}
      <aside style={{ width: 260, flexShrink: 0, background: '#2D1F18', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={() => router.push('/admin')} style={{ ...BODY, background: 'none', border: 'none', color: '#9A8573', fontSize: 10, letterSpacing: '0.18em', cursor: 'pointer', padding: 0, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            ADMIN
          </button>
          <p style={{ ...SERIF, fontSize: 20, fontWeight: 300, color: '#F6F1EB', margin: '0 0 12px' }}>Blog Manager</p>
          <button
            onClick={newPost}
            style={{ ...BODY, width: '100%', padding: '9px 14px', background: GOLD, border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', cursor: 'pointer' }}
          >
            + NEW POST
          </button>
        </div>

        {/* Post list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 8px' }}>
          {posts.length === 0 && <p style={{ ...BODY, fontSize: 11, color: '#9A8573', textAlign: 'center', paddingTop: 24 }}>No posts yet</p>}
          {posts.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              style={{ width: '100%', textAlign: 'left', background: selected?.id === p.id ? 'rgba(176,139,87,0.18)' : 'transparent', border: 'none', borderRadius: 8, padding: '10px 12px', cursor: 'pointer', marginBottom: 2, borderLeft: selected?.id === p.id ? `3px solid ${GOLD}` : '3px solid transparent' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: p.status === 'published' ? '#7CB98A' : GOLD, flexShrink: 0, display: 'inline-block' }} />
                <span style={{ ...BODY, fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: p.status === 'published' ? '#7CB98A' : GOLD }}>{p.status}</span>
              </div>
              <p style={{ ...BODY, fontSize: 12, color: '#E8DDD4', margin: 0, lineHeight: 1.4, fontWeight: selected?.id === p.id ? 500 : 300, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {p.title || 'Untitled'}
              </p>
              <p style={{ ...BODY, fontSize: 10, color: '#9A8573', margin: '4px 0 0' }}>{p.date}</p>
            </button>
          ))}
        </div>
      </aside>

      {/* ── MAIN: editor ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {!selected ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, color: '#C4B5A8' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <p style={{ ...BODY, fontSize: 13, color: '#9A8573' }}>Select a post or create a new one</p>
          </div>
        ) : (
          <>
            {/* Top bar */}
            <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {msg && <span style={{ ...BODY, fontSize: 11, color: msg.startsWith('Error') ? '#C0392B' : '#7CB98A', fontWeight: 600 }}>{msg}</span>}
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button onClick={() => save('draft')} disabled={saving} style={{ ...BODY, padding: '8px 18px', background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 8, color: '#7A6355', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
                  Save Draft
                </button>
                <button
                  onClick={() => save(selected.status === 'published' ? 'draft' : 'published')}
                  disabled={saving}
                  style={{ ...BODY, padding: '8px 18px', background: selected.status === 'published' ? '#9A8573' : GOLD, border: 'none', borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}
                >
                  {selected.status === 'published' ? 'Unpublish' : 'Publish →'}
                </button>
                {selected.id && (
                  <button onClick={deletePost} disabled={deleting} style={{ ...BODY, padding: '8px 14px', background: 'transparent', border: `1px solid #f5c6c6`, borderRadius: 8, color: '#C0392B', fontSize: 11, cursor: 'pointer' }}>
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Meta fields */}
            <div style={{ background: '#FDFAF7', borderBottom: `1px solid ${BORDER}`, padding: '16px 28px', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: 2, minWidth: 240 }}>
                  <label style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 4 }}>Title</label>
                  <input
                    value={editTitle}
                    onChange={e => { setEditTitle(e.target.value); if (!selected.id) setEditSlug(toSlug(e.target.value)) }}
                    placeholder="Blog post title…"
                    style={{ ...BODY, width: '100%', fontSize: 14, padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 7, background: '#fff', color: DARK, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <label style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 4 }}>Slug</label>
                  <input
                    value={editSlug}
                    onChange={e => setEditSlug(e.target.value)}
                    placeholder="url-slug"
                    style={{ ...BODY, width: '100%', fontSize: 12, padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 7, background: '#fff', color: '#7A6355', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <div>
                <label style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9A8573', display: 'block', marginBottom: 4 }}>Excerpt (shown in blog listing + Google description)</label>
                <input
                  value={editExcerpt}
                  onChange={e => setEditExcerpt(e.target.value)}
                  placeholder="One-sentence summary…"
                  style={{ ...BODY, width: '100%', fontSize: 12, padding: '8px 12px', border: `1px solid ${BORDER}`, borderRadius: 7, background: '#fff', color: DARK, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Toolbar */}
            <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', flexShrink: 0 }}>
              <ToolBtn label={<strong>B</strong>} title="Bold" onClick={() => exec('bold')} />
              <ToolBtn label={<em>I</em>} title="Italic" onClick={() => exec('italic')} />
              <ToolBtn label="U" title="Underline" onClick={() => exec('underline')} />
              <div style={{ width: 1, height: 20, background: BORDER, margin: '0 4px' }} />
              <ToolBtn label="P" title="Paragraph" onClick={() => formatBlock('p')} />
              <ToolBtn label="H2" title="Heading 2" onClick={() => formatBlock('h2')} />
              <ToolBtn label="H3" title="Heading 3" onClick={() => formatBlock('h3')} />
              <div style={{ width: 1, height: 20, background: BORDER, margin: '0 4px' }} />
              <ToolBtn label="• List" title="Bullet list" onClick={() => exec('insertUnorderedList')} />
              <div style={{ width: 1, height: 20, background: BORDER, margin: '0 4px' }} />
              {/* Font size */}
              <select
                title="Font size"
                defaultValue=""
                onChange={e => { if (e.target.value) { applyFontSize(e.target.value); e.target.value = '' } }}
                style={{ ...BODY, fontSize: 11, padding: '4px 6px', border: `1px solid ${BORDER}`, borderRadius: 5, color: '#7A6355', background: '#fff', cursor: 'pointer' }}
              >
                <option value="">Size</option>
                <option value="11px">Small</option>
                <option value="14px">Normal</option>
                <option value="18px">Large</option>
                <option value="24px">X-Large</option>
              </select>
              {/* Font color */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ ...BODY, fontSize: 11, color: '#7A6355' }}>Color</span>
                <input
                  ref={colorInputRef}
                  type="color"
                  defaultValue="#4A3A32"
                  title="Font color"
                  onInput={e => exec('foreColor', (e.target as HTMLInputElement).value)}
                  style={{ width: 28, height: 26, padding: 2, border: `1px solid ${BORDER}`, borderRadius: 5, cursor: 'pointer', background: '#fff' }}
                />
              </div>
              <div style={{ width: 1, height: 20, background: BORDER, margin: '0 4px' }} />
              {/* Image upload */}
              <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
              <button
                type="button"
                title="Insert image"
                onClick={() => imgInputRef.current?.click()}
                style={{ ...BODY, padding: '4px 10px', fontSize: 11, background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 5, color: '#7A6355', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Image
              </button>
              <div style={{ width: 1, height: 20, background: BORDER, margin: '0 4px' }} />
              <ToolBtn label="↩ Undo" title="Undo" onClick={() => exec('undo')} />
              <ToolBtn label="↪ Redo" title="Redo" onClick={() => exec('redo')} />
            </div>

            {/* Content editor */}
            <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px', background: BG }}>
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                style={{ minHeight: 400, maxWidth: 720, margin: '0 auto', background: '#fff', borderRadius: 12, border: `1px solid ${BORDER}`, padding: '32px 36px', outline: 'none', ...BODY, fontSize: 14, color: DARK, lineHeight: 1.85 }}
                className="blog-editor"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
