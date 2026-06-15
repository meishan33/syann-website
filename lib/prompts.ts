// ─── Crystal color reference ────────────────────────────────────────────────
// Used verbatim inside the image prompt so DALL-E renders each bead correctly.
// Add new crystals here when they are added to the catalog.

export const CRYSTAL_COLOR_REFERENCE = `
AMETHYST: transparent lavender-purple crystal beads with soft natural marbling and elegant glass-like reflections
AQUAMARINE: icy translucent pale blue crystal beads with watery clarity and soft luminous reflections
BLACK OBSIDIAN: deep glossy black crystal beads with smooth mirror-like polished surface and grounding luxurious finish
BLUE MOONSTONE: semi-transparent white crystal beads — the body is half-translucent, glassy white with a soft milky inner glow, and the surface shows a clearly visible blue adularescent sheen that shifts and glows across the bead like a moonlit shimmer; the blue flash must be present and noticeable on the surface, not hidden — never fully opaque, never fully clear, always that signature semi-transparent white with visible blue surface shine
BLUE TIGER EYE: deep navy-blue crystal beads with silky chatoyant stripes and mysterious reflective shimmer
CITRINE: light pale golden-yellow translucent crystal beads with a clean, clear glassy appearance and soft warm glow — lighter and more transparent than gold rutilated quartz, with no visible inclusions
CLEAR QUARTZ: clear transparent crystal beads with elegant glass-like clarity and subtle rainbow reflections
GOLD RUTILATED QUARTZ: deep amber-honey translucent crystal beads with clearly visible fine golden needle-like rutile inclusions running through each bead — noticeably darker and richer in tone than citrine, with a warm luxurious depth
GREEN AVENTURINE: opaque medium-to-deep sage green crystal beads with a warm earthy hue and subtle sparkling aventurescent shimmer — noticeably darker and more saturated than prehnite, with a fully solid opaque finish and zero translucency
LAPIS LAZULI: deep royal blue crystal beads with natural golden flecks and rich luxurious texture
MALACHITE: rich emerald green crystal beads with dramatic natural banding and glossy polished finish
PREHNITE: soft translucent pale celadon-green crystal beads — the dominant hue is clearly green (not yellow, not lime, not chartreuse), a cool minty sage-green with a milky cloudy inner glow; noticeably lighter and more washed-out than green aventurine, with zero opacity and no visible sparkle — if it looks yellow it is wrong, it must read as green
RED TIGER EYE: deep reddish-brown crystal beads with fiery chatoyant stripes and warm reflective shimmer
ROSE QUARTZ: soft translucent blush-pink crystal beads with gentle cloudy texture and delicate luminous reflections
YELLOW TIGER EYE: warm golden-amber and deep brown banded crystal beads with silky chatoyant stripes, glossy polished finish, and a rich earthy shimmer that shifts with the light
`.trim()


// ─── Image prompt composition rules ─────────────────────────────────────────
// Injected into the system prompt so the AI writes consistent image prompts.

export const IMAGE_COMPOSITION_RULES = `
Photography style:
- Luxury crystal bracelet product photography, top-down flat lay view, bracelet laid flat facing upward, perfect circular arrangement, centered composition, pure clean off-white background (#F5F0EB light cream white), soft warm studio lighting, elegant minimal jewelry aesthetic
- Photorealistic product photography quality — no illustrations, no paintings, no stylised renders
- No charms, no pendants, no spacers, no human hands or body parts, no props

Composition & arrangement:
- Bracelet centered and prominent in the frame — it must occupy the majority of the image with nothing cropped

Crystal description:
- The bracelet contains approximately 20 crystal beads total
- All crystal beads are 8mm perfectly round spheres — no oval, faceted, or irregular shapes; explicitly state "perfectly round spherical beads"
- Use the CRYSTAL COLOR REFERENCE for each selected crystal's exact color description — do not invent or deviate
`.trim()


// ─── System prompt ───────────────────────────────────────────────────────────

export function buildSystemPrompt(): string {
  return `You are a luxury crystal bracelet designer and Five Elements (Wu Xing) energy specialist for SYANN, a premium crystal jewelry brand.

Your role is to curate a deeply personalized crystal bracelet based on the customer's Ba Zi elemental profile, intention, and current feelings.

CRYSTAL SELECTION RULES:
You will receive the customer's weak element, its supporting element (the one that generates it in the 相生 cycle), and the full crystal catalog.

- Crystal 1 (Primary) — MUST come from the weak element category. No exceptions.
- Crystal 2 (Secondary) — MUST come from the supporting element category. No exceptions.
- Crystal 3 (Accent) — Choose freely from any element. Factor in the customer's intention, emotional state, and avoid amplifying the already dominant element. This is your creative pick.

The order in selectedCrystals must always be [Primary, Secondary, Accent].

EXPLANATION TONE:
- Warm, personal, and reassuring — like a trusted guide who understands energy healing
- Address the customer by first name if provided; if no name is given, use a warm impersonal opener such as "Your energy profile reveals…"
- Acknowledge their feelings with genuine empathy before explaining how each crystal helps
- Reference the customer's specific intention and current feelings by name — never write a generic response that could apply to anyone
- If feelings or intention were not shared, focus the summary on what the elemental profile reveals rather than guessing their emotional state
- Keep it grounded and beautiful, not overly mystical
- Each crystal explanation: 2–3 sentences

Return ONLY valid JSON in this exact structure:
{
  "selectedCrystals": ["Name1", "Name2", "Name3"],
  "analysisSummary": "One paragraph (2–3 sentences): acknowledge the customer's current feelings and energy with warmth and empathy, then explain what energetic shift this bracelet will bring them — make them feel truly seen. Reference their specific intention and feelings; never write something generic that could apply to anyone. If feelings or intention were not shared, open with what their elemental profile reveals instead.\\n\\n• Short key benefit point 1\\n• Short key benefit point 2\\n• Short key benefit point 3",
  "crystalExplanations": {
    "Name1": "Why this crystal for them specifically (2–3 sentences)",
    "Name2": "...",
    "Name3": "..."
  }
}`
}


// ─── User message builder ────────────────────────────────────────────────────

type UserMessageParams = {
  fullName: string
  birthDate: string
  birthTime: string
  intention: string
  feeling: string
  weakElement: string
  strongElement: string
  supportingElement: string
  elementCounts: { wood: number; fire: number; earth: number; metal: number; water: number }
  crystals: unknown[]
}

export function buildUserMessage({
  fullName,
  birthDate,
  birthTime,
  intention,
  feeling,
  weakElement,
  strongElement,
  supportingElement,
  elementCounts,
  crystals,
}: UserMessageParams): string {
  return `CUSTOMER PROFILE:
Name: ${fullName || 'Not provided'}
Birth Date: ${birthDate}
Birth Time: ${birthTime || 'Not provided'}

ELEMENTAL ANALYSIS:
Weak Element (needs support): ${weakElement}
Supporting Element (generates the weak one): ${supportingElement}
Strong Element (already dominant, avoid amplifying): ${strongElement}
Element Distribution — Wood: ${elementCounts.wood}, Fire: ${elementCounts.fire}, Earth: ${elementCounts.earth}, Metal: ${elementCounts.metal}, Water: ${elementCounts.water}

CRYSTAL ASSIGNMENT:
- Crystal 1 (Primary): must be from the "${weakElement}" element
- Crystal 2 (Secondary): must be from the "${supportingElement}" element
- Crystal 3 (Accent): your free choice — consider intention, feelings, avoid the dominant element

INTENTION: ${intention || 'General energy alignment'}
CURRENT FEELINGS: ${feeling || 'Not shared'}

AVAILABLE CRYSTALS:
${JSON.stringify(crystals, null, 2)}

Please select 3 crystals and craft a personalized bracelet recommendation.`
}
