import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { openai } from "@/lib/openai";

import { analyzeFiveElements } from "@/lib/five-elements";
import { crystalMapping } from "@/lib/crystal-mapping";

export async function POST(req: NextRequest) {
  try {

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
    // FIVE ELEMENTS ANALYSIS
    // ============================================

    const analysis = analyzeFiveElements(
      birthDate,
      birthTime
    );

    // ============================================
    // CRYSTAL RECOMMENDATIONS
    // ============================================

    const recommendedCrystalNames =
      crystalMapping[analysis.weakElement] || [];

    // ============================================
    // FETCH CRYSTALS FROM SUPABASE
    // ============================================

    const {
      data: crystals,
      error: crystalError,
    } = await supabase
      .from("crystals")
      .select("*")
      .in("name", recommendedCrystalNames);

    if (crystalError) {
      console.error(
        "Crystal Fetch Error:",
        crystalError
      );

      return NextResponse.json(
        {
          error: crystalError.message,
        },
        {
          status: 500,
        }
      );
    }

    // ============================================
    // BUILD BRACELET PROMPT
    // ============================================

    const crystalText =
      recommendedCrystalNames.join(", ");

    const braceletPrompt = `
Luxury minimalist crystal bracelet featuring ${crystalText} and elegant gold spacers, balanced bead arrangement, premium jewelry photography, realistic gemstone textures, soft ivory background, warm studio lighting, editorial luxury jewelry style, refined spiritual luxury aesthetic, elegant gemstone bracelet composition, soft natural shadow, sophisticated jewelry catalog photography
`;

    // ============================================
    // GENERATE BRACELET IMAGE
    // ============================================

    const imageResponse =
      await openai.images.generate({
        model: "gpt-image-1",

        prompt: braceletPrompt,

        size: "1024x1024",
      });

    const generatedImageUrl =
      imageResponse.data?.[0]?.url || "";

    // ============================================
    // PERSONALIZED EXPLANATION
    // ============================================

    const analysisSummary = `
Your elemental profile suggests that your ${analysis.weakElement} energy may benefit from additional balance and support.

The selected crystals were carefully curated to promote harmony, emotional clarity, confidence, and energetic alignment based on your personalized Five Elements analysis.
`;

    // ============================================
    // SAVE RESULT TO SUPABASE
    // ============================================

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
            recommendedCrystalNames,

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
          error: saveError.message,
        },
        {
          status: 500,
        }
      );
    }

    // ============================================
    // RETURN RESPONSE
    // ============================================

    return NextResponse.json({
      id: savedResult.id,

      weakElement:
        analysis.weakElement,

      strongElement:
        analysis.strongElement,

      recommendedCrystals:
        crystals,

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