// Weekly crystal blog post generator — called by GitHub Actions every Monday.
// Calls OpenAI to generate a post + DALL-E 3 cover image, saves to Supabase as draft.
// The admin reviews and publishes from the /admin/blog page.

const TOPIC_POOL = [
  'Amethyst: How This Purple Crystal Calms Anxiety and Improves Sleep',
  'Citrine: The Merchant\'s Stone for Wealth and Abundance',
  'Black Obsidian: Protection, Grounding and Negative Energy',
  'Green Aventurine: The Luckiest Crystal for Opportunity and Growth',
  'Aquamarine: Crystals for Calm, Clarity and Communication',
  'Tiger\'s Eye: Building Confidence, Courage and Focus',
  'Lapis Lazuli: Crystals for Wisdom, Truth and Inner Power',
  'Clear Quartz: The Master Healer Crystal Explained',
  'Moonstone: Intuition, Femininity and New Beginnings',
  'Pyrite: How Fool\'s Gold Attracts Real Wealth and Abundance',
  'Five Elements and Crystal Healing: How Chinese Wisdom Guides Crystal Selection',
  'How to Choose the Right Crystal Bracelet for Your Energy',
  'Crystal Bracelet Care: How to Cleanse and Charge Your Gemstones',
  'Crystals for Beginners: Where to Start Your Crystal Journey in Singapore',
  'The Best Crystals for Each Chinese Zodiac Animal',
  'Best Crystals for the Workplace: Focus, Clarity, and Success',
  'Crystal Bracelets as Gifts: A Complete Guide',
  'Crystals for Anxiety and Stress Relief: A Complete Guide',
  'Crystals for Love: Attracting Romance and Deepening Relationships',
  'Peridot: The Crystal of Positive Energy and New Beginnings',
  'Labradorite: The Crystal of Magic, Intuition and Protection',
  'Howlite: The Crystal for Patience, Calm and Better Sleep',
  'Sodalite: Crystals for Logic, Truth and Emotional Balance',
  'Blue Lace Agate: The Most Calming Crystal for Anxiety',
  'Black Tourmaline vs Obsidian: Which Protection Crystal Is Right for You?',
  'How to Layer Crystal Bracelets: A Styling Guide',
  'The Best Crystals for Students: Focus, Memory and Exam Success',
  'Crystals for New Beginnings: Starting Fresh with Natural Gemstones',
  'Feng Shui and Crystals: Enhancing Energy in Your Home',
  'Selenite: The Self-Cleansing Crystal for Clarity and Light',
]

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
const OPENAI_KEY   = process.env.OPENAI_API_KEY

async function getExistingTitles() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?select=title`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.map(r => r.title)
}

async function saveToSupabase(post) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ ...post, status: 'draft' }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Supabase insert failed: ${res.status} ${err}`)
  }
  return res.json()
}

async function generatePost(topic) {
  const today = new Date().toISOString().split('T')[0]
  const prompt = `You are writing an SEO-optimized blog post for SYANN.CO, a Singapore-based brand that handcrafts personalized natural crystal bracelets using Five Elements wisdom and AI.

Write a blog post about: "${topic}"

Requirements:
- Target readers in Singapore and Malaysia searching for crystal information
- Naturally include relevant keywords (e.g. "crystal bracelet Singapore", "natural gemstone", "crystal healing", specific crystal names)
- Tone: warm, knowledgeable, premium but approachable
- Length: 650–900 words of actual content
- Format as clean HTML using ONLY: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
- Do NOT include <html>, <head>, <body>, or wrapper tags — only inner article content
- End naturally with a brief mention of SYANN's personalized crystal bracelets

Return ONLY a valid JSON object with exactly these fields:
{
  "title": "SEO-friendly title, max 65 characters",
  "slug": "url-friendly-slug-with-hyphens-only",
  "date": "${today}",
  "excerpt": "One compelling sentence for SEO, max 155 characters",
  "content": "Full HTML content as a single JSON string"
}`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 2500, messages: [{ role: 'user', content: prompt }] }),
  })
  if (!res.ok) throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const text = data.choices[0].message.content.trim()
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON found in response')
  return JSON.parse(match[0])
}

async function generateCoverImage(topic) {
  const crystalName = topic.split(':')[0].trim()
  const prompt = `Elegant flat-lay photography of ${crystalName} crystals and gemstone beads on a cream linen surface. Soft natural window light, warm gold and stone tones, minimalist luxury aesthetic. No text, no people, no bracelets on wrists. Wide landscape composition.`

  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: 'dall-e-2', prompt, n: 1, size: '1024x1024' }),
  })
  if (!res.ok) throw new Error(`DALL-E error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.data[0].url
}

async function uploadCoverImage(imageUrl, slug) {
  const imgRes = await fetch(imageUrl)
  if (!imgRes.ok) throw new Error('Failed to download generated image')
  const buffer = await imgRes.arrayBuffer()

  const fileName = `blog-covers/${slug}-${Date.now()}.png`
  const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/generated-bracelets/${fileName}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'image/png',
    },
    body: buffer,
  })
  if (!uploadRes.ok) throw new Error(`Storage upload failed: ${uploadRes.status} ${await uploadRes.text()}`)

  return `${SUPABASE_URL}/storage/v1/object/public/generated-bracelets/${fileName}`
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  if (!OPENAI_KEY) throw new Error('Missing OPENAI_API_KEY')

  const existingTitles = await getExistingTitles()
  console.log(`Existing posts: ${existingTitles.length}`)

  const available = TOPIC_POOL.filter(topic => {
    const keyword = topic.split(':')[0].split(' ').pop().toLowerCase()
    return !existingTitles.some(t => t.toLowerCase().includes(keyword))
  })
  const pool = available.length > 0 ? available : TOPIC_POOL
  const topic = pool[Math.floor(Math.random() * pool.length)]
  console.log(`Topic: ${topic}`)

  const post = await generatePost(topic)
  console.log(`Generated: "${post.title}"`)

  // Generate cover image (non-blocking — post still saves if image fails)
  try {
    const tempUrl = await generateCoverImage(topic)
    post.cover_image_url = await uploadCoverImage(tempUrl, post.slug)
    console.log(`Cover image uploaded: ${post.cover_image_url}`)
  } catch (err) {
    console.warn(`Cover image generation failed (non-fatal): ${err.message}`)
  }

  await saveToSupabase(post)
  console.log(`Saved to Supabase as draft — review at /admin/blog`)
}

main().catch(err => { console.error(err); process.exit(1) })
