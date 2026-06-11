import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { openai } from "@/lib/openai";
import { analyzeFiveElements } from "@/lib/five-elements";
import { buildSystemPrompt, buildUserMessage } from "@/lib/prompts";

type AIRecommendation = {
  selectedCrystals: string[];
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
    // FETCH CRYSTALS
    // ============================================

    const { data: crystals, error: crystalError } = await supabase
      .from("crystals")
      .select("name, primary_element, meaning, energy_tags")
      .eq("active", true);

    if (crystalError || !crystals) {
      console.error("Crystal Fetch Error:", crystalError);
      return NextResponse.json(
        { error: crystalError?.message || "Unable to fetch crystals" },
        { status: 500 }
      );
    }

    console.log("Fetched crystals successfully");

    // ============================================
    // STAGE 1 — AI CRYSTAL SELECTION + EXPLANATION
    // ============================================

    console.log("Running AI crystal selection...");

    const { elementCounts } = analysis;

    const systemPrompt = buildSystemPrompt();

    const userMessage = buildUserMessage({
      fullName,
      birthDate,
      birthTime,
      intention,
      feeling,
      weakElement: analysis.weakElement,
      strongElement: analysis.strongElement,
      elementCounts,
      crystals,
    });

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
    console.log("AI image prompt length:", recommendation.imagePrompt?.length ?? 0);

    if (!recommendation.imagePrompt) {
      console.error("AI response missing imagePrompt. Full response:", aiContent);
      throw new Error("AI did not generate an image prompt — please try again.");
    }

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

    const { data: savedResult, error: saveError } = await supabaseAdmin
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
      generatedImageUrl,
      analysisSummary: recommendation.analysisSummary,
    });

  } catch (error) {

    console.error("Analyze API Error:", error);

    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}