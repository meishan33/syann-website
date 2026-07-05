// Weekly crystal blog post generator — called by GitHub Actions every Monday.
// Calls the Anthropic API (via fetch, no SDK needed) and writes a JSON post
// to content/blog/. The GitHub Action then commits + pushes, triggering Vercel.
import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const BLOG_DIR = join(ROOT, 'content/blog')

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
  'Crystal Bracelets as Gifts: A Complete Guide to Choosing Crystals for Someone Else',
  'Crystals for Anxiety and Stress Relief: A Complete Guide',
  'Crystals for Love: Attracting Romance and Deepening Relationships',
  'Peridot: The Crystal of Positive Energy and New Beginnings',
  'Labradorite: The Crystal of Magic, Intuition and Protection',
  'Howlite: The Crystal for Patience, Calm and Better Sleep',
  'Sodalite: Crystals for Logic, Truth and Emotional Balance',
  'Blue Lace Agate: The Most Calming Crystal for Anxiety and Communication',
  'Black Tourmaline vs Obsidian: Which Protection Crystal Is Right for You?',
  'Crystals and the Five Elements: Wood, Fire, Earth, Metal and Water',
  'How to Layer Crystal Bracelets: A Styling Guide',
  'The Best Crystals for Students: Focus, Memory and Exam Success',
  'Crystals for New Beginnings: Starting Fresh with Natural Gemstones',
  'Feng Shui and Crystals: Enhancing Energy in Your Home and Office',
]

async function getExistingTitles() {
  try {
    const files = await readdir(BLOG_DIR)
    return Promise.all(
      files.filter(f => f.endsWith('.json')).map(async f => {
        const raw = await readFile(join(BLOG_DIR, f), 'utf-8')
        return JSON.parse(raw).title
      })
    )
  } catch {
    return []
  }
}

async function generatePost(topic) {
  const today = new Date().toISOString().split('T')[0]
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable not set')

  const prompt = `You are writing an SEO-optimized blog post for SYANN.CO, a Singapore-based brand that handcrafts personalized natural crystal bracelets. The brand uses Five Elements wisdom and AI to personalize each bracelet. Free delivery in Singapore and Malaysia.

Write a blog post about: "${topic}"

Requirements:
- Target readers in Singapore and Malaysia searching for crystal information
- Naturally include relevant keywords (e.g. "crystal bracelet Singapore", "natural gemstone", "crystal healing", specific crystal names)
- Tone: warm, knowledgeable, and premium but approachable — not overly mystical or sales-y
- Length: 650–900 words of actual content
- Format the content as clean HTML using ONLY these tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
- Do NOT include <html>, <head>, <body>, or any wrapper tags — only the inner article content
- End naturally with a brief mention of how SYANN's personalized crystal bracelets relate to the topic

Return a single valid JSON object with exactly these fields — no other text:
{
  "title": "An SEO-friendly title, max 65 characters",
  "slug": "url-friendly-slug-with-hyphens-only",
  "date": "${today}",
  "excerpt": "One compelling sentence for SEO meta description, max 155 characters",
  "content": "The full HTML content as a single JSON string"
}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Anthropic API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data.content[0].text.trim()

  // Extract JSON in case Claude wraps it in a code block
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error(`No JSON found in response:\n${text}`)

  return JSON.parse(match[0])
}

async function main() {
  const existingTitles = await getExistingTitles()
  console.log(`Existing posts: ${existingTitles.length}`)

  // Pick a topic not yet covered (by keyword match on the first word of the topic)
  const available = TOPIC_POOL.filter(topic => {
    const keyword = topic.split(':')[0].split(' ').pop().toLowerCase()
    return !existingTitles.some(t => t.toLowerCase().includes(keyword))
  })

  const pool = available.length > 0 ? available : TOPIC_POOL
  const topic = pool[Math.floor(Math.random() * pool.length)]
  console.log(`Topic: ${topic}`)

  const post = await generatePost(topic)
  console.log(`Generated: "${post.title}"`)

  await mkdir(BLOG_DIR, { recursive: true })
  const filename = `${post.date}-${post.slug}.json`
  await writeFile(join(BLOG_DIR, filename), JSON.stringify(post, null, 2), 'utf-8')
  console.log(`Saved: content/blog/${filename}`)
}

main().catch(err => { console.error(err); process.exit(1) })
