'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const SERIF: React.CSSProperties = { fontFamily: "'Cormorant Garamond', serif" }
const BODY:  React.CSSProperties = { fontFamily: "'Montserrat', sans-serif" }
const GOLD = '#B08B57'
const DARK = '#4A3A32'
const BG   = '#F6F1EB'
const BORDER = '#E5DDD5'

type Post = {
  id: string
  day_number: number
  content_type: string
  theme: string
  caption: string
  hashtags: string
  image_prompt: string
  image_url: string | null
  status: 'draft' | 'posted'
  scheduled_date: string | null
  posted_at: string | null
  created_at: string
}

const TYPE_LABELS: Record<string, string> = {
  crystal:       'Crystal Spotlight',
  five_elements: 'Five Elements',
  lifestyle:     'Styling & Lifestyle',
  education:     'Crystal Education',
  affirmation:   'Energy & Affirmation',
  brand:         'SYANN Brand',
  community:     'Community',
}

const TYPE_COLORS: Record<string, string> = {
  crystal:       '#7B8FA8',
  five_elements: '#8A7BAD',
  lifestyle:     '#A87B7B',
  education:     '#7B9A8A',
  affirmation:   '#B08B57',
  brand:         '#4A3A32',
  community:     '#8AA87B',
}

export default function InstagramAdminPage() {
  const router = useRouter()
  const [token, setToken]         = useState<string | null>(null)
  const [posts, setPosts]         = useState<Post[]>([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState<Post | null>(null)
  const [filter, setFilter]       = useState<'all' | 'draft' | 'posted'>('all')
  const [copied, setCopied]       = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editCaption, setEditCaption] = useState('')
  const [editing, setEditing]     = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.refreshSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/account'); return }
      setToken(session.access_token)
      const res = await fetch('/api/admin/instagram/posts', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (res.ok) setPosts(await res.json())
      setLoading(false)
    })
  }, [router])

  useEffect(() => {
    if (selected) setEditCaption(selected.caption)
  }, [selected?.id])

  const copy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const patch = async (id: string, updates: Partial<Post>) => {
    if (!token) return
    setSaving(true)
    const res = await fetch('/api/admin/instagram/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, ...updates }),
    })
    if (res.ok) {
      const updated = await res.json()
      setPosts(prev => prev.map(p => p.id === id ? updated : p))
      setSelected(updated)
    }
    setSaving(false)
  }

  const saveCaption = async () => {
    if (!selected) return
    await patch(selected.id, { caption: editCaption })
    setEditing(false)
  }

  const uploadImage = async (file: File) => {
    if (!token || !selected) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/admin/instagram/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    })
    if (res.ok) {
      const { url } = await res.json()
      await patch(selected.id, { image_url: url })
    }
    setUploading(false)
  }

  const filtered = posts.filter(p => filter === 'all' || p.status === filter)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: BG, ...BODY }}>

      {/* Sidebar */}
      <aside style={{ width: 280, background: '#2D231A', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 16 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9A8573" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            <span style={{ ...BODY, fontSize: 10, color: '#9A8573', letterSpacing: '0.16em', textTransform: 'uppercase' }}>Admin</span>
          </Link>
          <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: GOLD, margin: '0 0 2px' }}>SYANN.CO</p>
          <h1 style={{ ...SERIF, fontSize: 18, fontWeight: 300, color: '#FDFAF7', margin: 0 }}>Instagram Posts</h1>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', padding: '10px 12px', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {(['all', 'draft', 'posted'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ flex: 1, padding: '6px 4px', borderRadius: 6, border: 'none', background: filter === f ? GOLD : 'rgba(255,255,255,0.06)', color: filter === f ? '#fff' : '#9A8573', ...BODY, fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'capitalize', cursor: 'pointer' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Post list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {loading ? (
            <p style={{ ...BODY, fontSize: 10, color: '#9A8573', textAlign: 'center', padding: '32px 0', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Loading…</p>
          ) : filtered.length === 0 ? (
            <p style={{ ...BODY, fontSize: 11, color: '#6A5A50', textAlign: 'center', padding: '32px 16px', lineHeight: 1.6 }}>No posts yet. Trigger the daily workflow to generate your first post.</p>
          ) : filtered.map(post => (
            <button key={post.id} onClick={() => { setSelected(post); setEditing(false) }}
              style={{ width: '100%', padding: '12px 16px', background: selected?.id === post.id ? 'rgba(176,139,87,0.15)' : 'transparent', border: 'none', borderLeft: `3px solid ${selected?.id === post.id ? GOLD : 'transparent'}`, cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ ...BODY, fontSize: 9, fontWeight: 700, color: TYPE_COLORS[post.content_type] || GOLD, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                  Day {post.day_number}
                </span>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: post.status === 'posted' ? '#7CB98A' : '#C4B5A8', flexShrink: 0 }} />
              </div>
              <p style={{ ...BODY, fontSize: 11, fontWeight: 500, color: '#FDFAF7', margin: 0, lineHeight: 1.4 }}>{post.theme}</p>
              <p style={{ ...BODY, fontSize: 9, color: '#6A5A50', margin: 0 }}>
                {TYPE_LABELS[post.content_type] || post.content_type}
                {post.scheduled_date && ` · ${new Date(post.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
              </p>
            </button>
          ))}
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ ...BODY, fontSize: 10, color: '#4A3A32', margin: 0, textAlign: 'center' }}>
            {posts.filter(p => p.status === 'posted').length} posted · {posts.filter(p => p.status === 'draft').length} drafts
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 2px' }}>Instagram Content Calendar</p>
            <h2 style={{ ...SERIF, fontSize: 22, fontWeight: 300, color: DARK, margin: 0 }}>
              {selected ? `Day ${selected.day_number} — ${selected.theme}` : 'Select a post'}
            </h2>
          </div>
          {selected && (
            <div style={{ display: 'flex', gap: 10 }}>
              {selected.status === 'draft' ? (
                <button onClick={() => patch(selected.id, { status: 'posted' })} disabled={saving}
                  style={{ ...BODY, padding: '10px 20px', borderRadius: 999, background: '#7CB98A', border: 'none', color: '#fff', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  ✓ Mark as Posted
                </button>
              ) : (
                <button onClick={() => patch(selected.id, { status: 'draft', posted_at: null })} disabled={saving}
                  style={{ ...BODY, padding: '10px 20px', borderRadius: 999, background: 'transparent', border: `1px solid ${BORDER}`, color: '#9A8573', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer' }}>
                  Move to Draft
                </button>
              )}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
          {!selected ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, paddingTop: 80 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D9C4A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
              <p style={{ ...SERIF, fontSize: 22, fontWeight: 300, color: DARK, margin: 0 }}>Select a post to view</p>
              <p style={{ ...BODY, fontSize: 12, color: '#9A8573', margin: 0 }}>Posts are generated daily and emailed to you each morning.</p>
            </div>
          ) : (
            <div style={{ maxWidth: 740, display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Meta */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ ...BODY, fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: TYPE_COLORS[selected.content_type] + '22', color: TYPE_COLORS[selected.content_type], letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  {TYPE_LABELS[selected.content_type]}
                </span>
                <span style={{ ...BODY, fontSize: 10, fontWeight: 600, padding: '4px 12px', borderRadius: 999, background: selected.status === 'posted' ? '#7CB98A22' : '#C4B5A822', color: selected.status === 'posted' ? '#7CB98A' : '#9A8573', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  {selected.status}
                </span>
                {selected.scheduled_date && (
                  <span style={{ ...BODY, fontSize: 10, color: '#B0A090' }}>
                    {new Date(selected.scheduled_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                )}
                {selected.posted_at && (
                  <span style={{ ...BODY, fontSize: 10, color: '#7CB98A' }}>
                    Posted {new Date(selected.posted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>

              {/* Caption */}
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${BORDER}` }}>
                  <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', color: '#9A8573', margin: 0 }}>Caption</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {editing ? (
                      <>
                        <button onClick={saveCaption} disabled={saving}
                          style={{ ...BODY, fontSize: 10, fontWeight: 600, padding: '5px 14px', border: 'none', borderRadius: 6, background: DARK, color: '#fff', cursor: 'pointer' }}>
                          Save
                        </button>
                        <button onClick={() => { setEditing(false); setEditCaption(selected.caption) }}
                          style={{ ...BODY, fontSize: 10, padding: '5px 14px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#fff', color: '#9A8573', cursor: 'pointer' }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditing(true)}
                          style={{ ...BODY, fontSize: 10, padding: '5px 14px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#fff', color: '#7A6355', cursor: 'pointer' }}>
                          Edit
                        </button>
                        <button onClick={() => copy(selected.caption, 'caption')}
                          style={{ ...BODY, fontSize: 10, fontWeight: 600, padding: '5px 14px', border: 'none', borderRadius: 6, background: copied === 'caption' ? '#7CB98A' : DARK, color: '#fff', cursor: 'pointer' }}>
                          {copied === 'caption' ? '✓ Copied' : 'Copy'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div style={{ padding: '20px' }}>
                  {editing ? (
                    <textarea value={editCaption} onChange={e => setEditCaption(e.target.value)} rows={12}
                      style={{ ...BODY, width: '100%', fontSize: 13, lineHeight: 1.8, color: DARK, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '12px 16px', background: BG, resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
                  ) : (
                    <p style={{ ...BODY, fontSize: 13, lineHeight: 1.9, color: DARK, margin: 0, whiteSpace: 'pre-line' }}>{selected.caption}</p>
                  )}
                </div>
              </div>

              {/* Hashtags */}
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${BORDER}` }}>
                  <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', color: '#9A8573', margin: 0 }}>Hashtags</p>
                  <button onClick={() => copy(selected.hashtags, 'hashtags')}
                    style={{ ...BODY, fontSize: 10, fontWeight: 600, padding: '5px 14px', border: 'none', borderRadius: 6, background: copied === 'hashtags' ? '#7CB98A' : DARK, color: '#fff', cursor: 'pointer' }}>
                    {copied === 'hashtags' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <p style={{ ...BODY, fontSize: 14, color: GOLD, margin: 0, letterSpacing: '0.04em', lineHeight: 1.8 }}>{selected.hashtags}</p>
                </div>
              </div>

              {/* Image prompt */}
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${BORDER}` }}>
                  <div>
                    <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', color: '#9A8573', margin: '0 0 2px' }}>Image Prompt</p>
                    <p style={{ ...BODY, fontSize: 10, color: '#B0A090', margin: 0 }}>Paste into ChatGPT → image generation</p>
                  </div>
                  <button onClick={() => copy(selected.image_prompt, 'prompt')}
                    style={{ ...BODY, fontSize: 10, fontWeight: 600, padding: '5px 14px', border: 'none', borderRadius: 6, background: copied === 'prompt' ? '#7CB98A' : DARK, color: '#fff', cursor: 'pointer' }}>
                    {copied === 'prompt' ? '✓ Copied' : 'Copy Prompt'}
                  </button>
                </div>
                <div style={{ padding: '16px 20px', background: '#FBF6EE' }}>
                  <p style={{ ...BODY, fontSize: 12, lineHeight: 1.8, color: '#7A6355', margin: 0, fontStyle: 'italic' }}>{selected.image_prompt}</p>
                </div>
              </div>

              {/* Image */}
              <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: `1px solid ${BORDER}` }}>
                  <p style={{ ...BODY, fontSize: 9, fontWeight: 700, letterSpacing: '0.26em', textTransform: 'uppercase', color: '#9A8573', margin: 0 }}>Post Image</p>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
                  <button onClick={() => fileRef.current?.click()} disabled={uploading}
                    style={{ ...BODY, fontSize: 10, fontWeight: 600, padding: '5px 14px', border: `1px solid ${BORDER}`, borderRadius: 6, background: '#fff', color: '#7A6355', cursor: 'pointer' }}>
                    {uploading ? 'Uploading…' : selected.image_url ? 'Change Image' : 'Upload Image'}
                  </button>
                </div>
                <div style={{ padding: '20px' }}>
                  {selected.image_url ? (
                    <div style={{ position: 'relative' }}>
                      <img src={selected.image_url} alt="Post visual" style={{ width: '100%', maxWidth: 480, height: 'auto', borderRadius: 10, display: 'block', border: `1px solid ${BORDER}` }} />
                      <button onClick={() => patch(selected.id, { image_url: null })}
                        style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 6, padding: '4px 10px', ...BODY, fontSize: 10, color: '#C0392B', cursor: 'pointer' }}>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => fileRef.current?.click()}
                      style={{ border: `2px dashed ${BORDER}`, borderRadius: 10, padding: '40px', textAlign: 'center', cursor: 'pointer', background: BG }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C4B5A8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 10 }}>
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <p style={{ ...BODY, fontSize: 11, color: '#B0A090', margin: 0 }}>Generate image in ChatGPT then upload here</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  )
}
