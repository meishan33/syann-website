import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { openai } from "@/lib/openai";

import { analyzeFiveElements } from "@/lib/five-elements";
import { recommendCrystals } from "@/lib/recommend-crystals";

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
      gender,
      intention,
    } = body;

    // ============================================
    // VALIDATION
    // ============================================

    if (!birthDate) {
      return NextResponse.json(
        {
          error: "Birth date is required",
        },
        {
          status: 400,
        }
      );
    }

    // ============================================
    // FIVE ELEMENT ANALYSIS
    // ============================================

    console.log(
      "Analyzing five elements..."
    );

    const analysis =
      analyzeFiveElements(
        birthDate,
        birthTime
      );

    console.log(
      "Weak Element:",
      analysis.weakElement
    );

    console.log(
      "Strong Element:",
      analysis.strongElement
    );

    // ============================================
    // FETCH ALL CRYSTALS
    // ============================================

    const {
      data: crystals,
      error: crystalError,
    } = await supabase
      .from("crystals")
      .select("*");

    if (crystalError || !crystals) {

      console.error(
        "Crystal Fetch Error:",
        crystalError
      );

      return NextResponse.json(
        {
          error:
            crystalError?.message ||
            "Unable to fetch crystals",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "Fetched crystals successfully"
    );

    // ============================================
    // RECOMMEND CRYSTALS
    // ============================================

    const recommendedCrystals =
      recommendCrystals({
        weakElement:
          analysis.weakElement,

        strongElement:
          analysis.strongElement,

        intention,

        crystals,
      });

    console.log(
      "Recommended crystals:",
      recommendedCrystals.map(
        (crystal) => crystal?.name
      )
    );

    // ============================================
    // FETCH SPACERS
    // ============================================

    const {
      data: spacers,
      error: spacerError,
    } = await supabase
      .from("spacers")
      .select("*")
      .limit(1);

    if (spacerError) {

      console.error(
        "Spacer Fetch Error:",
        spacerError
      );

      return NextResponse.json(
        {
          error:
            spacerError.message,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "Fetched spacer successfully"
    );

    const selectedSpacer =
      spacers?.[0];

    // ============================================
    // BUILD PROMPT
    // ============================================

    const crystalText =
      recommendedCrystals
        .map((crystal) => crystal?.name)
        .join(", ");

    const spacerText = `
    ${selectedSpacer?.name},
    silver spacer
    `;

    const braceletPrompt = `
Luxury minimalist crystal bracelet featuring ${crystalText} with elegant ${spacerText}, balanced bead arrangement, premium jewelry photography, realistic gemstone textures, soft ivory background, natural studio lighting, editorial luxury jewelry style, refined spiritual luxury aesthetic, elegant gemstone bracelet composition, soft natural shadow, sophisticated jewelry catalog photography
`;

    console.log(
      "Generating bracelet image..."
    );

    // ============================================
    // GENERATE IMAGE
    // ============================================

    const imageResponse =
      await openai.images.generate({
        model: "gpt-image-1",

        prompt: braceletPrompt,

        size: "1024x1024",
      });

    console.log(
      "Image generated successfully"
    );

    // ============================================
    // GET BASE64 IMAGE
    // ============================================

    const imageBase64 =
      imageResponse.data?.[0]?.b64_json;

    if (!imageBase64) {

      console.error(
        "No image returned from OpenAI"
      );

      return NextResponse.json(
        {
          error:
            "Image generation failed",
        },
        {
          status: 500,
        }
      );
    }

    // ============================================
    // CONVERT TO BUFFER
    // ============================================

    const imageBuffer =
      Buffer.from(
        imageBase64,
        "base64"
      );

    // ============================================
    // FILE NAME
    // ============================================

    const fileName =
      `bracelet-${Date.now()}.png`;

    // ============================================
    // UPLOAD TO STORAGE
    // ============================================

    console.log(
      "Uploading image to Supabase..."
    );

    const {
      error: uploadError,
    } = await supabase.storage
      .from("generated-bracelets")
      .upload(
        fileName,
        imageBuffer,
        {
          contentType:
            "image/png",
        }
      );

    if (uploadError) {

      console.error(
        "Upload Error:",
        uploadError
      );

      return NextResponse.json(
        {
          error:
            uploadError.message,
        },
        {
          status: 500,
        }
      );
    }

    // ============================================
    // GET PUBLIC URL
    // ============================================

    const {
      data: publicUrlData,
    } = supabase.storage
      .from("generated-bracelets")
      .getPublicUrl(fileName);

    const generatedImageUrl =
      publicUrlData.publicUrl;

    console.log(
      "Generated Image URL:",
      generatedImageUrl
    );

    // ============================================
    // SUMMARY
    // ============================================

    const analysisSummary = `
Your elemental profile suggests that your ${analysis.weakElement} energy may benefit from additional balance and support.

This bracelet was curated based on your elemental harmony and personal intention of ${intention || "energy alignment"}.

The selected crystals were chosen to support emotional clarity, energetic balance, and intentional transformation.
`;

    // ============================================
    // SAVE RESULT
    // ============================================

    console.log(
      "Saving result to Supabase..."
    );

    const {
      data: savedResult,
      error: saveError,
    } = await supabase
      .from("energy_quiz_results")
      .insert([
        {
          user_name:
            fullName || null,

          birth_date:
            birthDate,

          birth_time:
            birthTime || null,

          gender:
            gender || null,

          main_goal:
            intention || null,

          calculated_weak_element:
            analysis.weakElement,

          calculated_strong_element:
            analysis.strongElement,

          crystal_names:
            recommendedCrystals.map(
              (crystal) => crystal?.name
            ),

          analysis_summary:
            analysisSummary,

          cached_image_url:
            generatedImageUrl,
        },
      ])
      .select()
      .single();

    if (saveError) {

      console.error(
        "Save Error:",
        saveError
      );

      return NextResponse.json(
        {
          error:
            saveError.message,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "Saved successfully"
    );

    // ============================================
    // RETURN RESPONSE
    // ============================================

    return NextResponse.json({
      id: savedResult.id,

      weakElement:
        analysis.weakElement,

      strongElement:
        analysis.strongElement,

      recommendedCrystals,

      spacer:
        selectedSpacer,

      generatedImageUrl,

      analysisSummary,
    });

  } catch (error) {

    console.error(
      "Analyze API Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}