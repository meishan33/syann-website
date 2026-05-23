import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { openai } from "@/lib/openai";
import { analyzeFiveElements } from "@/lib/five-elements";

type AIRecommendation = {
  selectedCrystals: string[];
  spacerName: string | null;
  analysisSummary: string;
  crystalExplanations: Record<string, string>;
  imagePrompt: string;
};

// ============================================
// POST
// ============================================

export async function POST(req: NextRequest) {
  try {

    console.log("ANALYZE API HIT");

    // ============================================
    // GET FORM DATA
    // ============================================

    const body = await req.json();

    const {
      fullName,
      birthDate,
      birthTime,
      intention,
      feeling,
    } = body;

    // ============================================
    // VALIDATION
    // ============================================

    if (!birthDate) {
      return NextResponse.json(
        { error: "Birth date is required" },
        { status: 400 }
      );
    }

    // ============================================
    // FIVE ELEMENT ANALYSIS
    // ============================================

    console.log("Analyzing five elements...");

    const analysis = analyzeFiveElements(birthDate, birthTime);

    console.log("Weak Element:", analysis.weakElement);
    console.log("Strong Element:", analysis.strongElement);

    // ============================================
    // FETCH CRYSTALS + SPACERS IN PARALLEL
    // ============================================

    const [
      { data: crystals, error: crystalError },
      { data: spacers, error: spacerError },
    ] = await Promise.all([
      supabase.from("crystals").select("name, primary_element, meaning, energy_tags"),
      supabase.from("spacers").select("name, color").eq("active", true),
    ]);

    if (crystalError || !crystals) {
      console.error("Crystal Fetch Error:", crystalError);
      return NextResponse.json(
        { error: crystalError?.message || "Unable to fetch crystals" },
        { status: 500 }
      );
    }

    if (spacerError) {
      console.error("Spacer Fetch Error:", spacerError);
      return NextResponse.json(
        { error: spacerError.message },
        { status: 500 }
      );
    }

    console.log("Fetched crystals and spacers successfully");

    // ============================================
    // STAGE 1 — AI CRYSTAL SELECTION + EXPLANATION
    // ============================================

    console.log("Running AI crystal selection...");

    const { elementCounts } = analysis;

    const systemPrompt = `You are a luxury crystal bracelet designer and Five Elements (Wu Xing) energy specialist for SYANN, a premium crystal jewelry brand.

Your role is to curate a deeply personalized crystal bracelet based on the customer's Ba Zi elemental profile, intention, and current feelings.

CRYSTAL SELECTION RULES:
- Choose exactly 3 crystals from the provided catalog
- Prioritize crystals that strengthen the customer's weak element
- Avoid crystals that amplify the already dominant element
- Factor in the customer's intention and emotional state
- Aim for color and energy harmony across the 3 crystals

SPACER DECISION:
As the designer, you decide whether a spacer enhances or disrupts this bracelet's aesthetic. Use your eye:
- A spacer adds rhythm and visual breathing room between crystals — consider it when the stones are bold, heavy, or visually dense
- Gold spacers bring warmth and elevate earth, fire, and wood energy combinations
- Silver spacers add cool refinement and complement water and metal energy combinations
- Sometimes the crystals are perfect alone — set spacerName to null if a spacer would take away from the composition
Trust your designer instinct. The goal is a bracelet that looks beautiful and intentional.

EXPLANATION TONE:
- Warm, personal, and reassuring — like a trusted guide who understands energy healing
- Address the customer by first name if provided
- Acknowledge their feelings with genuine empathy before explaining how each crystal helps
- Keep it grounded and beautiful, not overly mystical
- Each crystal explanation: 2–3 sentences

IMAGE PROMPT:
Write a detailed, evocative image generation prompt that produces a soft luxury crystal bracelet photo. Follow these principles:

Photography style:
- Luxury crystal bracelet product photography, top-down flat lay view, bracelet laid flat facing upward, perfect circular arrangement, centered composition, clean ivory background, soft warm studio lighting, elegant minimal jewelry aesthetic

Composition & arrangement:
- Bracelet centered and prominent in the frame — it must occupy the majority of the image with nothing cropped
- If spacer is included, it must be ONE consistent metal color throughout (e.g. if gold spacer chosen, only gold spacers appear — never mix gold and silver in the same bracelet)
- Spacer beads are accent pieces only — placed selectively every few crystal beads, never between every bead

Crystal & spacer description:
- The bracelet contains approximately 20 beads total (crystal beads + spacer beads combined if spacer is used)
- All crystal beads are 8mm perfectly round spheres — no oval, faceted, or irregular shapes; the image prompt must explicitly state "perfectly round spherical beads"; use the CRYSTAL COLOR REFERENCE above for each selected crystal's exact color description — do not invent or deviate from these descriptions
- If spacer included: use a maximum of 6 spacer beads total — CRITICAL rules the image prompt must explicitly state all of the following:
  1. Spacers are exactly half the size of the crystal beads (crystal beads = 8mm, spacer beads = 4mm) — spacers must visually appear noticeably smaller than the crystal beads
  2. Both gold and silver spacers are flat disc rondelle-shaped — no other shape allowed
  3. Maximum 2 spacers may be placed continuously together; never 3 or more in a row
  4. Spacers must NOT appear between every crystal bead — they are accent pieces placed selectively
  5. Every single spacer bead is absolutely identical — machine-stamped uniform flat disc rondelle, identical diameter, identical thickness, identical finish, zero variation between any spacer bead. They must appear as if cast from the exact same mold. The image prompt must explicitly state: "every spacer is perfectly uniform — identical shape, identical size, identical finish, no variation whatsoever between any spacer bead"
  The image prompt must state the exact placement (e.g. "6 machine-identical 4mm flat disc gold rondelle spacer beads, each exactly half the size of the 8mm crystal beads, every spacer uniform with zero variation in shape or size, placed selectively with no more than 2 consecutive spacers at any point, never between every bead")

Return ONLY valid JSON in this exact structure:
{
  "selectedCrystals": ["Name1", "Name2", "Name3"],
  "spacerName": "Gold Spacer" | "Silver Spacer" | null,
  "analysisSummary": "One paragraph (2–3 sentences): acknowledge the customer's current feelings and energy with warmth and empathy, then explain what energetic shift this bracelet will bring them — make them feel truly seen.\n\n• Short key benefit point 1 (e.g. what this bracelet helps protect, attract, or restore)\n• Short key benefit point 2\n• Short key benefit point 3",
  "crystalExplanations": {
    "Name1": "Why this crystal for them specifically (2–3 sentences)",
    "Name2": "...",
    "Name3": "..."
  },
  "imagePrompt": "Detailed image generation prompt for the bracelet"
}

CRYSTAL COLOR REFERENCE — you MUST use these exact descriptions for each crystal when writing the imagePrompt:
SILVER SPACER: small 4×2mm flat disc rondelle spacer beads with a bright mirror-like polished silver finish, smooth rounded edges, and a clean center hole — highly reflective chrome-silver surface with a crisp minimalist look
GOLD SPACER: small 4×1.5mm flat disc rondelle spacer beads with a bright mirror-like polished gold finish, smooth rounded edges, and a clean center hole — warm gleaming gold surface with a refined luxurious look
AMETHYST: transparent lavender-purple crystal beads with soft natural marbling and elegant glass-like reflections
AQUAMARINE: icy translucent pale blue crystal beads with watery clarity and soft luminous reflections
BLACK OBSIDIAN: deep glossy black crystal beads with smooth mirror-like polished surface and grounding luxurious finish
BLUE MOONSTONE: milky translucent white crystal beads with soft blue iridescent flash and dreamy luminous glow
BLUE TIGER EYE: deep navy-blue crystal beads with silky chatoyant stripes and mysterious reflective shimmer
CITRINE: light pale golden-yellow translucent crystal beads with a clean, clear glassy appearance and soft warm glow — lighter and more transparent than gold rutilated quartz, with no visible inclusions
CLEAR QUARTZ: clear transparent crystal beads with elegant glass-like clarity and subtle rainbow reflections
GOLD RUTILATED QUARTZ: deep amber-honey translucent crystal beads with clearly visible fine golden needle-like rutile inclusions running through each bead — noticeably darker and richer in tone than citrine, with a warm luxurious depth
GREEN AVENTURINE: opaque medium-to-deep sage green crystal beads with a warm earthy hue and subtle sparkling aventurescent shimmer — noticeably darker and more saturated than prehnite, with a fully solid opaque finish and zero translucency
LAPIS LAZULI: deep royal blue crystal beads with natural golden flecks and rich luxurious texture
MALACHITE: rich emerald green crystal beads with dramatic natural banding and glossy polished finish
PREHNITE: soft translucent pale yellow-green crystal beads with a delicate honeydew or celadon tone — noticeably lighter and more washed-out than green aventurine, with a milky cloudy inner glow and no visible sparkle or opacity
RED TIGER EYE: deep reddish-brown crystal beads with fiery chatoyant stripes and warm reflective shimmer
ROSE QUARTZ: soft translucent blush-pink crystal beads with gentle cloudy texture and delicate luminous reflections
YELLOW TIGER EYE: warm golden-amber and deep brown banded crystal beads with silky chatoyant stripes, glossy polished finish, and a rich earthy shimmer that shifts with the light`;

    const userMessage = `CUSTOMER PROFILE:
Name: ${fullName || "Not provided"}
Birth Date: ${birthDate}
Birth Time: ${birthTime || "Not provided"}

ELEMENTAL ANALYSIS:
Weak Element (needs support): ${analysis.weakElement}
Strong Element (already dominant): ${analysis.strongElement}
Element Distribution — Wood: ${elementCounts.wood}, Fire: ${elementCounts.fire}, Earth: ${elementCounts.earth}, Metal: ${elementCounts.metal}, Water: ${elementCounts.water}

INTENTION: ${intention || "General energy alignment"}
CURRENT FEELINGS: ${feeling || "Not shared"}

AVAILABLE CRYSTALS:
${JSON.stringify(crystals, null, 2)}

AVAILABLE SPACERS:
${JSON.stringify(spacers, null, 2)}

Please select 3 crystals and craft a personalized bracelet recommendation.`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    });

    const aiContent = aiResponse.choices[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No response from AI");
    }

    const recommendation: AIRecommendation = JSON.parse(aiContent);

    console.log("AI selected crystals:", recommendation.selectedCrystals);
    console.log("AI selected spacer:", recommendation.spacerName);

    // ============================================
    // RESOLVE CRYSTAL OBJECTS FROM CATALOG
    // ============================================

    const allCrystals = await supabase
      .from("crystals")
      .select("*")
      .in("name", recommendation.selectedCrystals);

    const recommendedCrystals = recommendation.selectedCrystals
      .map((name) =>
        allCrystals.data?.find(
          (c) => c.name.toLowerCase() === name.toLowerCase()
        )
      )
      .filter(Boolean);

    const selectedSpacer = spacers?.find(
      (s) => s.name === recommendation.spacerName
    ) || null;

    // ============================================
    // STAGE 2 — GENERATE BRACELET IMAGE
    // ============================================

    console.log("Generating bracelet image...");

    const imageResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt: recommendation.imagePrompt,
      size: "1024x1024",
    });

    console.log("Image generated successfully");

    const imageBase64 = imageResponse.data?.[0]?.b64_json;

    if (!imageBase64) {
      console.error("No image returned from OpenAI");
      return NextResponse.json(
        { error: "Image generation failed" },
        { status: 500 }
      );
    }

    // ============================================
    // UPLOAD IMAGE TO SUPABASE STORAGE
    // ============================================

    const imageBuffer = Buffer.from(imageBase64, "base64");
    const fileName = `bracelet-${Date.now()}.png`;

    console.log("Uploading image to Supabase...");

    const { error: uploadError } = await supabase.storage
      .from("generated-bracelets")
      .upload(fileName, imageBuffer, { contentType: "image/png" });

    if (uploadError) {
      console.error("Upload Error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("generated-bracelets")
      .getPublicUrl(fileName);

    const generatedImageUrl = publicUrlData.publicUrl;

    console.log("Generated Image URL:", generatedImageUrl);

    // ============================================
    // SAVE RESULT
    // ============================================

    console.log("Saving result to Supabase...");

    const { data: savedResult, error: saveError } = await supabase
      .from("energy_quiz_results")
      .insert([
        {
          user_name: fullName || null,
          birth_date: birthDate,
          birth_time: birthTime || null,
          main_goal: intention || null,
          current_feelings: feeling || null,
          calculated_weak_element: analysis.weakElement,
          calculated_strong_element: analysis.strongElement,
          crystal_names: recommendation.selectedCrystals,
          crystal_explanations: recommendation.crystalExplanations,
          suggested_spacer: recommendation.spacerName || null,
          analysis_summary: recommendation.analysisSummary,
          cached_image_url: generatedImageUrl,
          generated_prompt: recommendation.imagePrompt,
        },
      ])
      .select()
      .single();

    if (saveError) {
      console.error("Save Error:", saveError);
      return NextResponse.json(
        { error: saveError.message },
        { status: 500 }
      );
    }

    console.log("Saved successfully");

    // ============================================
    // RETURN RESPONSE
    // ============================================

    return NextResponse.json({
      id: savedResult.id,
      weakElement: analysis.weakElement,
      strongElement: analysis.strongElement,
      recommendedCrystals,
      crystalExplanations: recommendation.crystalExplanations,
      spacer: selectedSpacer,
      generatedImageUrl,
      analysisSummary: recommendation.analysisSummary,
    });

  } catch (error) {

    console.error("Analyze API Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}