// Daily Instagram post generator — runs via GitHub Actions every day at 8am SGT.
// Generates caption, 5 hashtags, and a ChatGPT image prompt. Saves to Supabase + emails admin.

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY
const OPENAI_KEY    = process.env.OPENAI_API_KEY
const RESEND_KEY    = process.env.RESEND_API_KEY
const ADMIN_EMAIL   = process.env.ADMIN_EMAIL || 'meishan953.ms@gmail.com'

// Content type rotates by day of week
const CONTENT_TYPES = { 0: 'community', 1: 'crystal', 2: 'five_elements', 3: 'lifestyle', 4: 'education', 5: 'affirmation', 6: 'brand' }
const CONTENT_LABELS = {
  crystal:       'Crystal Spotlight',
  five_elements: 'Five Elements Wisdom',
  lifestyle:     'Styling & Lifestyle',
  education:     'Crystal Education',
  affirmation:   'Energy & Affirmation',
  brand:         'SYANN Brand',
  community:     'Community & Engagement',
}

const TOPICS = {
  crystal: [
    'Amethyst','Citrine','Black Obsidian','Rose Quartz','Clear Quartz',"Tiger's Eye",'Jade','Pyrite',
    'Moonstone','Aquamarine','Lapis Lazuli','Labradorite','Green Aventurine','Howlite','Sodalite',
    'Blue Lace Agate','Black Tourmaline','Selenite','Peridot','Carnelian','Red Jasper','Amazonite',
    'Fluorite','Malachite','Sunstone','Rhodonite','Lepidolite','Chrysocolla','Rutilated Quartz',
    'Smoky Quartz','Angelite','Celestite','Larimar','Ametrine','Garnet','Turquoise','Hematite',
    'Snowflake Obsidian','Prehnite','Kyanite','Bloodstone','Chalcedony','Chrysoprase','Kunzite',
    'Morganite','Tourmaline','Iolite','Sardonyx','Calcite','Red Agate','Golden Rutile','Pink Opal',
  ],
  five_elements: [
    'Wood Element — growth, vitality, new beginnings',
    'Fire Element — passion, energy, transformation',
    'Earth Element — stability, nourishment, grounding',
    'Metal Element — clarity, precision, letting go',
    'Water Element — wisdom, intuition, flow',
    'Strengthening a weak Wood element with crystals',
    'Calming an overpowering Fire element',
    'Balancing Earth energy for emotional stability',
    'Boosting Metal energy for mental clarity',
    'Harnessing Water energy for intuition',
    'Wood feeds Fire — creative energy cycles explained',
    'Fire creates Earth — how passion builds foundations',
    'Earth produces Metal — stability sharpens focus',
    'Metal carries Water — clarity flows into wisdom',
    'Water nourishes Wood — wisdom fuels growth',
    'Reading your Ba Zi birth year element',
    'What your birth month says about your energy',
    'Five Elements in feng shui and home energy',
    'Crystals that support Wood element energy',
    'Crystals that amplify Fire element energy',
    'Crystals that ground Earth element energy',
    'Crystals that sharpen Metal element energy',
    'Crystals that flow with Water element energy',
    'How seasons align with the Five Elements',
    'Spring renewal and Wood element energy',
    'Summer peak and Fire element energy',
    'Autumn release and Metal element energy',
    'Winter rest and Water element energy',
    'Five Elements and emotional health balance',
    'Five Elements and career success',
    'Five Elements and relationship harmony',
    'Yin and Yang balance within your element',
    'How to discover your dominant element',
    'Five Elements and sleep quality',
    'Five Elements and financial energy',
    'Five Elements in traditional Chinese medicine',
    'Balancing opposing elements in your Ba Zi',
    'Why personalised crystals matter for your element',
    'Five Elements and colour therapy for wellbeing',
    'Five Elements for entrepreneurs and leaders',
    'Five Elements for students and focus energy',
    'Five Elements for healers and empaths',
    'How SYANN uses Five Elements to personalise bracelets',
    'Your element and your life purpose',
    'Five Elements and stress management techniques',
    'The element you are missing most right now',
    'Five Elements and creative energy flow',
    'Birth year elements and relationship compatibility',
    'How your hour of birth shapes your inner element',
    'Five Elements for parents and family harmony',
    'The element that rules your career potential',
    'How to harmonise all five elements in daily life',
  ],
  lifestyle: [
    'Everyday minimalist crystal bracelet styling',
    'Office-ready crystal bracelet looks',
    'Date night crystal jewelry styling',
    'Festival and CNY crystal styling ideas',
    'How to stack crystal bracelets for energy',
    'Left wrist vs right wrist — which to wear',
    'Layering crystals with gold jewelry',
    'Crystals for your morning routine',
    'Crystals for your bedtime reset ritual',
    'Travel essentials: crystals on the go',
    'Crystal flat-lay desk setup for focus',
    'How to gift crystal bracelets meaningfully',
    'Crystals for the wellness routine',
    'Matching crystals to your outfit energy',
    'The minimalist crystal jewelry look',
    'Crystal bracelets as daily self-care tools',
    'How to introduce crystals into daily life',
    'Crystals for your home office setup',
    'The power of intentional jewelry wearing',
    'How to choose crystals as heartfelt gifts',
    'Wearing crystals during yoga or meditation',
    'Crystals for the gym and active lifestyle',
    'Crystals while studying or deep working',
    'Weekend crystal ritual for reset and recharge',
    'The art of bracelet layering for energy balance',
    'How to wear crystals without it feeling woo',
    'Styling crystals for the modern professional',
    'Crystal bracelets and the slow living movement',
    'How to build a meaningful crystal bracelet collection',
    'Minimalist vs maximalist crystal style',
    'Crystals for self-care Sunday reset',
    'Crystals for the new moon intention setting',
    'Crystals for full moon release rituals',
    'Building a crystal corner in your home',
    'Crystals for abundance in the kitchen',
    'Crystals for the bedroom and restful sleep',
    'Crystals for the living room and family harmony',
    'Crystals for the workspace and productivity',
    'How to photograph your crystal bracelet beautifully',
    'Seasonal crystal wardrobe changes',
    'Crystals for special life milestones',
    'The capsule crystal collection for beginners',
    'Mismatched stacking — the eclectic crystal look',
    'Tonal crystal stacking — same stone family',
    'Crystals for the creative — art, music, writing',
    'Crystals for the entrepreneur lifestyle',
    'Crystal bracelet gifting traditions',
    'Crystals for new beginnings and fresh starts',
    'How to store and display your crystal collection',
    'Crystals and the wellness morning routine',
    'Crystal jewelry as meaningful heirloom pieces',
    'Crystals for the digital detox weekend',
  ],
  education: [
    'How to cleanse your crystals at home',
    'Full moon crystal charging ritual guide',
    'Sunlight vs moonlight charging — the difference',
    'Sound bath crystal cleansing with singing bowls',
    'Sage and palo santo crystal cleansing ritual',
    'How to program crystals with intention',
    'Crystal grids for manifestation and focus',
    'Which crystals are safe in water',
    'How crystals form deep underground',
    'Natural crystals vs synthetic — how to tell',
    'Crystal hardness and the Mohs scale explained',
    'Raw crystals vs tumbled vs points — what to choose',
    'What crystal inclusions tell you about energy',
    'Crystal colour and its psychological effects',
    'The difference between a mineral, rock, and crystal',
    'How long do crystals hold energy',
    'Do crystals lose their power over time',
    'Crystal shapes and their energy direction',
    'Cluster crystals vs single points — when to use each',
    'How to pick your crystal intuitively',
    'Crystal and sound therapy — how they work together',
    'Crystals and the chakra system introduction',
    'Root chakra crystals and grounding energy',
    'Sacral chakra crystals and creative energy',
    'Solar plexus chakra crystals and confidence',
    'Heart chakra crystals and love energy',
    'Throat chakra crystals and authentic expression',
    'Third eye chakra crystals and intuition',
    'Crown chakra crystals and spiritual connection',
    'History of crystals in ancient Chinese tradition',
    'Crystals in ancient Egyptian culture and history',
    'How to identify genuine gemstone beads',
    'Common crystal fakes and how to spot them',
    'Crystal care: what to avoid to protect your stones',
    'Can crystals break — and what does it mean',
    'Crystals and astrology — zodiac connections',
    'Crystal elixirs — safe and unsafe stones',
    'How bracelet bead size affects energy flow',
    'Why natural bead imperfections are a good sign',
    'The significance of crystal bead bracelets in culture',
    'Crystals for protection — history and modern use',
    'Responsible crystal sourcing and ethical mining',
    'How to tell if a crystal shop is trustworthy',
    'The science behind crystal piezoelectric energy',
    'Crystal photography — how to capture their glow',
    'Crystals and electromagnetic field sensitivity',
    'The most powerful crystal combinations for energy',
    'Why crystal colour changes can happen over time',
    'How to use crystals during sleep for healing',
    'Crystal meanings across different cultures',
    'Beginner mistakes to avoid with crystal healing',
    'How to build a crystal altar at home',
  ],
  affirmation: [
    'Monday motivation — setting the week with intention',
    'Abundance and prosperity affirmations with crystals',
    'Love and relationship affirmations',
    'Protection and grounding affirmations',
    'Career and success affirmations',
    'Health and vitality affirmations',
    'Clarity and focus affirmations for the week',
    'Letting go and releasing what no longer serves',
    'Gratitude practice for energy reset',
    'New moon intention setting ritual',
    'Full moon release and letting go ceremony',
    'Affirmations for confidence and self-worth',
    'Affirmations for inner peace and calm',
    'Affirmations for creativity and inspiration',
    'Affirmations for financial abundance',
    'Affirmations for healing and recovery',
    'Affirmations for new beginnings and fresh starts',
    'Affirmations for relationships and deeper connection',
    'Affirmations for students and academic focus',
    'Affirmations for entrepreneurs and leaders',
    'Affirmations for parents and family harmony',
    'Affirmations for travel and new adventures',
    'Affirmations for career transitions',
    'Crystal grounding exercise for busy days',
    'Breathing ritual with crystal in hand',
    'Visualisation exercise for manifestation',
    'Crystal meditation for complete beginners',
    'Morning affirmation ritual with crystal intention',
    'Evening release ritual to unwind with crystals',
    'Setting intentions on the first of the month',
    'End of month reflection and gratitude practice',
    'Affirmations for overcoming fear and doubt',
    'Affirmations for emotional healing',
    'Energy protection ritual for sensitive souls',
    'Affirmations for finding your life purpose',
    'Affirmations for joy and lightness of being',
    'Affirmations for patience and trust in timing',
    'Affirmations for healthy boundaries',
    'Affirmations for intuition and inner knowing',
    'Crystals as anchors for positive daily affirmations',
    'How to build a sustainable daily affirmation practice',
    'Affirmations for deep and restful sleep',
    'Affirmations for social anxiety and confidence',
    'Affirmations for grief and processing loss',
    'Affirmations for major life changes',
    'Affirmations for nurturing friendships',
    'Affirmations for body acceptance and love',
    'Affirmations for compassion and empathy',
    'Year-end reflection and gratitude ritual',
    'Affirmations for creative blocks and inspiration',
    'Weekly energy reset — Sunday intention setting',
    'Affirmations for mental clarity and decisiveness',
  ],
  brand: [
    'Why SYANN uses Five Elements wisdom for personalisation',
    'How the SYANN energy quiz works',
    'The story behind SYANN — brand origin',
    'How each SYANN bracelet is handcrafted',
    'How AI meets ancient wisdom at SYANN',
    'Why we source only natural crystal beads',
    'Behind the scenes: crystal bead selection',
    'Behind the scenes: bracelet crafting process',
    'Our commitment to genuine natural crystals',
    'Why personalisation matters in crystal jewelry',
    'SYANN packaging — the unboxing experience',
    'Free shipping to Singapore and Malaysia',
    'How to take the SYANN energy quiz',
    'What happens after you complete the quiz',
    'How your Ba Zi reading shapes your bracelet',
    'SYANN bracelet builder — design your own',
    'The difference between quiz bracelet and custom design',
    'SYANN silver vs gold spacers — which to choose',
    'Should you include the SYANN logo charm',
    'SYANN gift sets — perfect for every occasion',
    'Corporate gifting with SYANN crystal bracelets',
    'SYANN for the wellness-conscious professional',
    'How SYANN blends tradition with modern design',
    'What makes SYANN different from other crystal brands',
    'Our quality guarantee and bracelet care instructions',
    'SYANN bracelet as a wedding or ROM gift',
    'SYANN bracelet for new mothers and new beginnings',
    'SYANN bracelet for graduation gifts',
    'SYANN bracelet for birthday gifting',
    'SYANN bracelet for the festive season',
    'SYANN bracelet for Chinese New Year gifting',
    'SYANN bracelet for Valentine\'s Day',
    'SYANN bracelet for Mother\'s Day',
    'SYANN bracelet for anniversary gifts',
    'The crystal guide on SYANN — know your stones',
    'Frequently asked questions about SYANN bracelets',
    'How long does it take to receive your SYANN bracelet',
    'SYANN — where ancient wisdom meets modern life',
    'Why we believe in the power of intentional wearing',
    'Join the SYANN crystal community',
    'SYANN\'s vision for personalised wellness',
    'The love and care put into every bracelet',
    'SYANN for men — crystal energy for everyone',
    'SYANN for women — crystals for every season of life',
    'How to care for your SYANN crystal bracelet',
    'SYANN crystals — ethically sourced and genuine',
    'The personalisation process at SYANN explained',
    'Why crystal bracelets make the most meaningful gifts',
    'SYANN — your energy, your crystal, your story',
    'How to order your personalised SYANN bracelet',
    'SYANN bracelets: more than jewelry, it is intention',
    'The energy quiz that changed how people wear crystals',
  ],
  community: [
    'Which of the Five Elements are you? 🔥💧🌱⚒️🌬️',
    'What crystal are you most drawn to right now?',
    'Drop your birth year — what element does that make you?',
    'What is your intention for this week?',
    'If your energy had a colour, what would it be?',
    'Which crystal would you choose today — and why?',
    'What does balance mean to you personally?',
    'Gold spacer or silver spacer — which do you prefer?',
    'What crystal have you been keeping close lately?',
    'What is one thing you are releasing this season?',
    'What are you calling into your life right now?',
    'Which element do you feel most connected to today?',
    'What crystal energy do you need most today?',
    'What does your ideal morning ritual look like?',
    'Name the crystal that found its way to you first',
    'What is your favourite way to recharge your energy?',
    'What intention did you set at the start of this month?',
    'How do you stay grounded on busy days?',
    'Tell us: do you wear your bracelet every day?',
    'What is your most treasured crystal and why?',
    'What feeling are you chasing this season?',
    'Complete this: My energy feels most aligned when ___',
    'What is the first thing you do to reset your energy?',
    'What crystal sits on your desk right now?',
    'Do you believe crystals carry energy? Share your story',
    'Which colour crystal speaks to you most today?',
    'What does wearing a crystal bracelet mean to you?',
    'One word to describe your energy right now',
    'What is the last crystal you bought or received?',
    'What crystal would you put in a care package for a friend?',
    'What element would you be in a fantasy world?',
    'If your week had a crystal, which one would it be?',
    'What is one thing crystals have helped you with?',
    'Name a crystal you have been curious about lately',
    'What is your crystal intention for the month ahead?',
    'How many crystal bracelets do you own?',
    'Choose: amethyst for calm OR citrine for energy?',
    'What is one habit you are building this season?',
    'How do you introduce crystals to curious but sceptical friends?',
    'Share: what bracelet are you wearing today?',
    'Weekend check-in: how is your energy this week?',
    'What is the most surprising benefit you have had from a crystal?',
    'If you could only keep one crystal forever, which would it be?',
    'What crystal would you gift your younger self?',
    'What does self-care look like for you this week?',
    'Which crystal best describes your personality?',
    'Crystal question of the week: what grounds you most?',
    'Pick a crystal — we will tell you your energy focus this week',
    'Name a person in your life who has crystal energy',
    'What is something you want to manifest by end of the year?',
    'How has your relationship with your energy changed lately?',
    'What crystal ritual do you do that you never skip?',
  ],
}

async function getDayNumber() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/instagram_posts?select=day_number&order=day_number.desc&limit=1`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  })
  if (!res.ok) return 1
  const data = await res.json()
  return data.length > 0 ? data[0].day_number + 1 : 1
}

async function generatePost(contentType, topic, dayNumber) {
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Singapore' })

  const typeGuides = {
    crystal:       `Write a Crystal Spotlight post about ${topic}. Educate followers on its energy properties, what it is used for, and how it connects to Five Elements wisdom. End with a soft mention of SYANN's personalised crystal bracelets.`,
    five_elements: `Write a Five Elements Wisdom post about: ${topic}. Connect this elemental insight to everyday life and how crystals support this energy. Keep it educational yet warm and relatable.`,
    lifestyle:     `Write a Styling & Lifestyle post about: ${topic}. Make it aspirational and practical for Singapore/Malaysia readers who care about wellness and personal energy.`,
    education:     `Write a Crystal Education post about: ${topic}. Teach something genuinely useful and accurate. Be clear and accessible. End with a practical takeaway the reader can use today.`,
    affirmation:   `Write an Energy & Affirmation post about: ${topic}. Include a short affirmation or intention the reader can use today. Make it feel personal, uplifting, and grounded.`,
    brand:         `Write a SYANN Brand post about: ${topic}. Highlight SYANN's key value — AI-powered personalisation, Five Elements wisdom, handcrafted natural crystal bracelets. Include a clear, warm CTA.`,
    community:     `Write a Community Engagement post. The engagement hook is: "${topic}". Make it feel easy and fun to respond to. End with a direct question or invitation that encourages followers to reply in the comments.`,
  }

  const prompt = `You are the Instagram content writer for SYANN — a premium crystal bracelet brand from Singapore that creates AI-personalised bracelets using Five Elements (Ba Zi) wisdom. Every bracelet is handcrafted with genuine natural crystal beads. Target audience: wellness-minded adults in Singapore and Malaysia.

Brand voice: warm, knowledgeable, premium but approachable. Speak directly to the reader.
Website: syann.co

Task: ${typeGuides[contentType]}

Today is ${today}. This is Day ${dayNumber} of the SYANN Instagram calendar.

IMPORTANT rules:
- Caption: hook on first line, body with \\n\\n between paragraphs, soft CTA at the end. 150–220 words.
- Hashtags: EXACTLY 5 hashtags, space-separated, each starting with #
- Image prompt: a detailed prompt the admin can paste into ChatGPT image generation. Describe subject, style (flat lay / lifestyle / close-up), mood, colours, lighting, props. 2–3 sentences.

Return ONLY valid JSON:
{
  "theme": "3-5 word theme label",
  "caption": "full caption with line breaks",
  "hashtags": "#tag1 #tag2 #tag3 #tag4 #tag5",
  "image_prompt": "detailed image generation prompt"
}`

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_KEY}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 1000, response_format: { type: 'json_object' }, messages: [{ role: 'user', content: prompt }] }),
  })
  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  const post = JSON.parse(data.choices[0].message.content)

  // Validate all required fields — OpenAI occasionally omits one
  const missing = ['theme', 'caption', 'hashtags', 'image_prompt'].filter(k => !post[k])
  if (missing.length) throw new Error(`OpenAI response missing fields: ${missing.join(', ')}. Raw: ${JSON.stringify(post)}`)

  // Ensure hashtags is a string (model sometimes returns an array)
  if (Array.isArray(post.hashtags)) post.hashtags = post.hashtags.join(' ')

  return post
}

async function saveToSupabase(record) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/instagram_posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, Prefer: 'return=representation' },
    body: JSON.stringify(record),
  })
  if (!res.ok) throw new Error(`Supabase insert failed: ${res.status} ${await res.text()}`)
  return res.json()
}

async function sendEmail(dayNumber, contentType, theme, caption, hashtags, imagePrompt, dateStr) {
  const label = CONTENT_LABELS[contentType]
  const GOLD = '#B08B57'
  const DARK = '#4A3A32'

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F6F1EB;font-family:'Helvetica Neue',Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">

  <div style="background:${DARK};border-radius:12px 12px 0 0;padding:28px 32px;text-align:center;">
    <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:${GOLD};">SYANN.CO</p>
    <h1 style="margin:0;font-size:22px;font-weight:300;color:#FDFAF7;letter-spacing:0.04em;">Instagram Day ${dayNumber}</h1>
    <p style="margin:8px 0 0;font-size:11px;color:#9A8573;letter-spacing:0.06em;">${dateStr}</p>
  </div>

  <div style="background:#FDFAF7;border-left:4px solid ${GOLD};padding:14px 24px;border-bottom:1px solid #EDE8DF;">
    <p style="margin:0;font-size:9px;font-weight:700;letter-spacing:0.26em;text-transform:uppercase;color:#9A8573;">Content Type</p>
    <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:${DARK};">${label} — ${theme}</p>
  </div>

  <div style="background:#FDFAF7;padding:24px 32px;border-bottom:1px solid #EDE8DF;">
    <p style="margin:0 0 12px;font-size:9px;font-weight:700;letter-spacing:0.26em;text-transform:uppercase;color:#9A8573;">Ready-to-Post Caption</p>
    <div style="background:#F6F1EB;border-radius:8px;padding:18px 20px;">
      <p style="margin:0;font-size:13px;line-height:1.9;color:${DARK};white-space:pre-line;">${caption}</p>
    </div>
  </div>

  <div style="background:#FDFAF7;padding:20px 32px;border-bottom:1px solid #EDE8DF;">
    <p style="margin:0 0 10px;font-size:9px;font-weight:700;letter-spacing:0.26em;text-transform:uppercase;color:#9A8573;">Hashtags (5)</p>
    <p style="margin:0;font-size:14px;color:${GOLD};font-weight:500;letter-spacing:0.04em;">${hashtags}</p>
  </div>

  <div style="background:#FDFAF7;padding:20px 32px;border-bottom:1px solid #EDE8DF;">
    <p style="margin:0 0 4px;font-size:9px;font-weight:700;letter-spacing:0.26em;text-transform:uppercase;color:#9A8573;">Image Prompt for ChatGPT</p>
    <p style="margin:0 0 12px;font-size:10px;color:#B0A090;">Paste this into ChatGPT → image generation to create your post visual.</p>
    <div style="background:#FBF6EE;border:1px dashed #D9C4A8;border-radius:8px;padding:16px 20px;">
      <p style="margin:0;font-size:12px;line-height:1.8;color:#7A6355;font-style:italic;">${imagePrompt}</p>
    </div>
  </div>

  <div style="background:#FDFAF7;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
    <a href="https://syann.co/admin/instagram" style="display:inline-block;padding:12px 28px;background:${DARK};color:#FDFAF7;text-decoration:none;border-radius:999px;font-size:11px;font-weight:600;letter-spacing:0.2em;text-transform:uppercase;">View in Admin →</a>
  </div>

</div>
</body></html>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_KEY}` },
    body: JSON.stringify({
      from: 'SYANN.CO <hello@syann.co>',
      to: ADMIN_EMAIL,
      subject: `✨ SYANN Instagram Day ${dayNumber} — ${label}: ${theme}`,
      html,
    }),
  })
  if (!res.ok) throw new Error(`Resend error ${res.status}: ${await res.text()}`)
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  if (!OPENAI_KEY)  throw new Error('Missing OPENAI_API_KEY')
  if (!RESEND_KEY)  console.warn('⚠️  RESEND_API_KEY not set — email will be skipped')

  const dayNumber = await getDayNumber()
  console.log(`Day ${dayNumber}`)

  const today = new Date()
  const contentType = CONTENT_TYPES[today.getDay()]
  const label = CONTENT_LABELS[contentType]

  const topicPool = TOPICS[contentType]
  const topic = topicPool[(dayNumber - 1) % topicPool.length]

  console.log(`Type: ${label}`)
  console.log(`Topic: ${topic}`)

  const post = await generatePost(contentType, topic, dayNumber)
  console.log(`Generated: "${post.theme}"`)

  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Singapore' })
  const dateOnly = today.toISOString().split('T')[0]

  await saveToSupabase({
    day_number:   dayNumber,
    content_type: contentType,
    theme:        post.theme,
    caption:      post.caption,
    hashtags:     post.hashtags,
    image_prompt: post.image_prompt,
    status:       'draft',
  })
  console.log('Saved to Supabase')

  if (RESEND_KEY) {
    await sendEmail(dayNumber, contentType, post.theme, post.caption, post.hashtags, post.image_prompt, dateStr)
    console.log(`Email sent — Day ${dayNumber}: ${label} — ${post.theme}`)
  } else {
    console.log('Email skipped (no RESEND_API_KEY)')
  }
}

main().catch(err => { console.error(err); process.exit(1) })
